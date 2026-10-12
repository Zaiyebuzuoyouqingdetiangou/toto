// 本机存储（localStorage）用量：同一个酒馆网址下所有插件共用一份，手机浏览器通常只有 5MB 左右。
// 写不进去时，按来源算一算各占多少，告诉用户是谁占满的。只读，不删任何东西。
const MB = 1024 * 1024;

function sizeOf(key, value) {
    // 浏览器按 UTF-16 计量：每个字符两字节。
    return (String(key || '').length + String(value || '').length) * 2;
}

function groupOf(key) {
    if (key.startsWith('rabbitMirror:image:')) return '兔子镜插图';
    if (/^rabbit_?mirror|^rabbitMirror|^rh_/i.test(key)) return '兔子镜成品与设置';
    return '';
}

export function localStorageUsage() {
    const storage = globalThis.localStorage;
    if (!storage) return null;
    const groups = new Map();
    const others = [];
    let total = 0, images = 0;
    for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (key == null) continue;
        let value = '';
        try { value = storage.getItem(key) || ''; } catch { value = ''; }
        const bytes = sizeOf(key, value);
        total += bytes;
        const group = groupOf(key);
        if (group) {
            groups.set(group, (groups.get(group) || 0) + bytes);
            if (group === '兔子镜插图' && key.startsWith('rabbitMirror:image:v1:images:')) images += 1;
        } else others.push({ key, bytes });
    }
    others.sort((a, b) => b.bytes - a.bytes);
    return { total, groups, images, otherTotal: others.reduce((sum, item) => sum + item.bytes, 0), others };
}

const mb = bytes => `${(bytes / MB).toFixed(bytes >= MB ? 1 : 2)}MB`;

export function describeLocalStorageUsage() {
    let usage = null;
    try { usage = localStorageUsage(); } catch { usage = null; }
    if (!usage) return '读不到本机存储用量';
    const parts = [];
    const pictures = usage.groups.get('兔子镜插图') || 0;
    const mirrors = usage.groups.get('兔子镜成品与设置') || 0;
    if (pictures) parts.push(`兔子镜插图 ${mb(pictures)}（${usage.images} 份）`);
    if (mirrors) parts.push(`兔子镜成品与设置 ${mb(mirrors)}`);
    if (usage.otherTotal) {
        const top = usage.others.slice(0, 2).filter(item => item.bytes >= 0.05 * MB).map(item => `${item.key.slice(0, 32)} ${mb(item.bytes)}`);
        parts.push(`其他插件和酒馆 ${mb(usage.otherTotal)}${top.length ? `（最大：${top.join('、')}）` : ''}`);
    }
    return `本机存储已用约 ${mb(usage.total)}：${parts.join('，') || '无'}`;
}
