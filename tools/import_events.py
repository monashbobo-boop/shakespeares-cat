"""把社里的活动表变成网站用的活动数据。

用法：
  1. 从 Notion 把活动表导出成 CSV，覆盖 data/活动表.csv（列名不要改）。
  2. 运行 python3 tools/import_events.py
  3. 生成 assets/js/events-data.js，本学期活动、往期活动、首页卡片都从它读。

data/本学期排期补充.csv 放排期表里已经定下、但还没进活动表的场次，列名和活动表一样。
同一天、名字有重叠的两条会合并成一条：活动表里有的以活动表为准，空着的格子用补充表填上。
等这些场次进了活动表，把补充表里对应的行删掉就行。

上线到 WordPress 后不再需要这个脚本：每场活动就是后台的一条「活动」，字段和这张表的列一一对应，
见 docs/WordPress-活动表.md。也可以用 WP All Import 之类的插件直接导入同一份 CSV。
"""
import csv, json, pathlib, re
from datetime import datetime

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / 'data/活动表.csv'
EXTRA = ROOT / 'data/本学期排期补充.csv'
OUT = ROOT / 'assets/js/events-data.js'

# 网站上会显示的列，以及它们在数据里的名字。
PUBLIC = {'活动名称': 'name', '活动类型': 'type', '活动形式': 'form', '地点': 'place', '合作方': 'partner',
          '人数上限': 'cap', '报名状态': 'signup', '报名链接': 'link', '费用': 'fee', '负责人': 'owner',
          '发布状态': 'pub'}
# 只给社里内部用、不进网站的列：OneDrive文件夹、协助成员、相关任务。脚本直接跳过。


def when(v):
    """'August 21, 2026 7:00 PM (GMT+10)' 或 'September 6, 2025' -> ('2026-08-21', '19:00' 或 '')"""
    v = re.sub(r'\s*\(GMT[^)]*\)', '', (v or '').strip())
    if not v:
        return '', ''
    for f, has_t in (('%B %d, %Y %I:%M %p', True), ('%B %d, %Y', False), ('%Y-%m-%d %H:%M', True), ('%Y-%m-%d', False)):
        try:
            d = datetime.strptime(v, f)
            return d.strftime('%Y-%m-%d'), d.strftime('%H:%M') if has_t else ''
        except ValueError:
            pass
    raise ValueError(f'看不懂的日期：{v}')


def rows(path):
    if not path.exists():
        return []
    out = []
    with open(path, encoding='utf-8-sig', newline='') as f:
        for r in csv.DictReader(f):
            r = {k.strip(): (v or '').strip() for k, v in r.items() if k}
            if not r.get('活动名称'):
                continue
            e = {key: r.get(col, '') for col, key in PUBLIC.items()}
            e['date'], e['time'] = when(r.get('开始时间'))
            e['endDate'], e['endTime'] = when(r.get('结束时间'))
            e['partner'] = re.sub(r'\s+', ' ', e['partner']).strip()
            e['cap'] = int(e['cap']) if e['cap'].isdigit() else None
            out.append(e)
    return out


def core(name):
    """去掉书名号、Vol、空格和数字，用来判断两行是不是同一场活动"""
    return re.sub(r'[《》\s:：]|vol\s*\d+|[0-9①-⑩]', '', name.lower())


def same(a, b):
    if a['date'] != b['date']:
        return False
    x, y = core(a['name']), core(b['name'])
    return x == y or x in y or y in x or len(set(x) & set(y)) >= 3


def main():
    events = []
    for e in rows(SRC):
        # 活动表里同一场偶尔会录两次（比如一行有时间、一行只有日期），保留信息多的那一行
        twin = next((x for x in events if same(x, e)), None)
        if twin:
            for k, v in e.items():
                if v and not twin.get(k):
                    twin[k] = v
            continue
        events.append(e)
    for e in rows(EXTRA):
        twin = next((x for x in events if same(x, e)), None)
        if twin:
            for k, v in e.items():
                if v and not twin.get(k):
                    twin[k] = v
        else:
            e['fromSchedule'] = True
            events.append(e)
    events.sort(key=lambda e: (e['date'], e['time'] or '99'))
    for e in events:
        for k in [k for k, v in e.items() if v in ('', None)]:
            del e[k]
    js = ('/* 由 tools/import_events.py 从 data/活动表.csv 生成，不要手改。改活动请改表格再运行脚本。 */\n'
          'window.EVENTS=' + json.dumps(events, ensure_ascii=False, indent=0).replace('\n', '') + ';\n')
    OUT.write_text(js, encoding='utf-8')
    pub = [e for e in events if e.get('pub', '已发布') == '已发布']
    print(f'{len(events)} 场活动，{len(pub)} 场已发布 -> {OUT.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
