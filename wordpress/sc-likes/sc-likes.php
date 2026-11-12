<?php
/**
 * Plugin Name: 莎士比亚的猫：书友作品的喜欢与留言
 * Description: 「喜欢」记在 WordPress 数据库自己的一张表里（登录的成员按账号，没登录的按浏览器），留言用 WordPress 自带评论。给网站前端提供 REST 接口。
 * Version:     1.0.0
 * Requires at least: 6.4
 * Requires PHP: 7.4
 * License:     GPL-2.0-or-later
 *
 * 用法：把 sc-likes 这个文件夹打包成 zip，在后台「插件 → 安装插件 → 上传插件」装上并启用。
 * 启用时会建一张表 wp_sc_likes。字段和接口的说明见 docs/书友作品-点赞与评论.md。
 */

if (!defined('ABSPATH')) exit;

// 「作品」内容类型的名字。用 ACF 或 CPT UI 建类型时如果起了别的名字，改这里。
const SC_LIKES_POST_TYPE = 'work';

/* ---------- 建表：每一条喜欢是一行，同一个人对同一篇只有一行 ---------- */
register_activation_hook(__FILE__, function () {
    global $wpdb;
    $t = $wpdb->prefix . 'sc_likes';
    require_once ABSPATH . 'wp-admin/includes/upgrade.php';
    dbDelta("CREATE TABLE $t (
        id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
        post_id bigint(20) unsigned NOT NULL,
        user_id bigint(20) unsigned NOT NULL DEFAULT 0,
        visitor char(32) NOT NULL DEFAULT '',
        created datetime NOT NULL,
        PRIMARY KEY  (id),
        UNIQUE KEY who (post_id,user_id,visitor),
        KEY post_id (post_id)
    ) {$wpdb->get_charset_collate()};");
});

/* 没登录的读者：给浏览器一个随机编号（不含任何个人信息），只用来避免同一个人重复点 */
function sc_likes_visitor() {
    if (is_user_logged_in()) return '';
    $v = isset($_COOKIE['sc_visitor']) ? sanitize_text_field(wp_unslash($_COOKIE['sc_visitor'])) : '';
    if (preg_match('/^[a-f0-9]{32}$/', $v)) return $v;
    $v = bin2hex(random_bytes(16));
    setcookie('sc_visitor', $v, [
        'expires'  => time() + 2 * YEAR_IN_SECONDS,
        'path'     => COOKIEPATH ? COOKIEPATH : '/',
        'secure'   => is_ssl(),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    $_COOKIE['sc_visitor'] = $v;
    return $v;
}

function sc_likes_state($post_id) {
    global $wpdb;
    $t   = $wpdb->prefix . 'sc_likes';
    $uid = get_current_user_id();
    $v   = $uid ? '' : sc_likes_visitor();
    $count = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM $t WHERE post_id = %d", $post_id));
    $mine  = $wpdb->get_var($wpdb->prepare("SELECT id FROM $t WHERE post_id = %d AND user_id = %d AND visitor = %s", $post_id, $uid, $v));
    return ['count' => $count, 'liked' => (bool) $mine];
}

function sc_likes_work($id) {
    $post = get_post((int) $id);
    if (!$post || $post->post_type !== SC_LIKES_POST_TYPE || $post->post_status !== 'publish') {
        return new WP_Error('sc_no_work', '没有这篇作品', ['status' => 404]);
    }
    return $post;
}

/* ---------- 接口 ----------
   GET  /wp-json/sc/v1/likes/{作品编号}  -> { count, liked }
   POST /wp-json/sc/v1/likes/{作品编号}  -> 点一下喜欢，再点一下取消，返回新的 { count, liked } */
add_action('rest_api_init', function () {
    register_rest_route('sc/v1', '/likes/(?P<id>\d+)', [
        [
            'methods'             => 'GET',
            'permission_callback' => '__return_true',
            'callback'            => function ($req) {
                $post = sc_likes_work($req['id']);
                return is_wp_error($post) ? $post : sc_likes_state($post->ID);
            },
        ],
        [
            'methods'             => 'POST',
            'permission_callback' => '__return_true',
            'callback'            => function ($req) {
                global $wpdb;
                $post = sc_likes_work($req['id']);
                if (is_wp_error($post)) return $post;
                $t   = $wpdb->prefix . 'sc_likes';
                $uid = get_current_user_id();
                $v   = $uid ? '' : sc_likes_visitor();
                $where = ['post_id' => $post->ID, 'user_id' => $uid, 'visitor' => $v];
                if (sc_likes_state($post->ID)['liked']) {
                    $wpdb->delete($t, $where, ['%d', '%d', '%s']);
                } else {
                    $wpdb->insert($t, $where + ['created' => current_time('mysql', true)], ['%d', '%d', '%s', '%s']);
                }
                $state = sc_likes_state($post->ID);
                update_post_meta($post->ID, 'sc_like_count', $state['count']);   // 后台列表显示和排序用
                return $state;
            },
        ],
    ]);
});

/* ---------- 留言：用 WordPress 自带评论 ----------
   允许没登录的读者通过 REST 接口留言。是否要人工审核，照后台「设置 → 讨论」来，建议打开「评论必须经人工批准」。
   登录的成员留言时会自动记在他的账号下。 */
add_filter('rest_allow_anonymous_comments', '__return_true');

/* ---------- 前端需要的两个值：接口地址和防伪码 ---------- */
add_action('wp_head', function () {
    $cfg = ['root' => esc_url_raw(rest_url()), 'nonce' => wp_create_nonce('wp_rest')];
    echo '<script>window.SC_WP=' . wp_json_encode($cfg) . ';</script>' . "\n";
}, 1);

/* ---------- 后台「作品」列表多一列「喜欢」，可以按它排序 ---------- */
add_filter('manage_' . SC_LIKES_POST_TYPE . '_posts_columns', function ($cols) {
    $cols['sc_likes'] = '喜欢';
    return $cols;
});
add_action('manage_' . SC_LIKES_POST_TYPE . '_posts_custom_column', function ($col, $id) {
    if ($col === 'sc_likes') echo (int) get_post_meta($id, 'sc_like_count', true);
}, 10, 2);
add_filter('manage_edit-' . SC_LIKES_POST_TYPE . '_sortable_columns', function ($cols) {
    $cols['sc_likes'] = 'sc_likes';
    return $cols;
});
add_action('pre_get_posts', function ($q) {
    if (is_admin() && $q->is_main_query() && $q->get('orderby') === 'sc_likes') {
        $q->set('meta_key', 'sc_like_count');
        $q->set('orderby', 'meta_value_num');
    }
});
