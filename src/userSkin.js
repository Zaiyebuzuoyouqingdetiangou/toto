// 用户美化：用户自己写或导入一段 CSS，改兔子镜的设置界面、工具弹窗和外置框（含外置标题框）。
// 只是一段样式，不跑脚本、不进提示词、不改模型写的画面；保存在这台设备上（和「主题与外观」的配色一样）。
// 兔子镜承诺下面 SKIN_HOOKS 里这些名字以后不改，美化照着写，更新了也不会失效。

export const USER_SKIN_STORAGE_KEY = 'rabbit_mirror_user_skin_v1';
const STYLE_ID = 'rabbit-mirror-user-skin';
const MAX_CHARS = 1_500_000;

export const SKIN_HOOKS = Object.freeze([
    ['设置界面整体', '#rabbit_mirror_theater_settings'],
    ['设置窗口', '#rabbit_mirror_theater_settings .rh-ui-window'],
    ['设置顶栏', '#rabbit_mirror_theater_settings .rh-ui-head'],
    ['设置标签栏', '#rabbit_mirror_theater_settings .rh-ui-tabs'],
    ['设置内容区', '#rabbit_mirror_theater_settings .rh-ui-main'],
    ['工具弹窗（维修兔、挨打猫、重说等）', '[data-rm-skin="panel"]'],
    ['外置框（整块；框外的装饰挂在它的 ::before / ::after 上）', '.rabbit-mirror-external-shell[data-rm-placement="external"]'],
    ['外置框里的每一面', '.rabbit-mirror-external-shell[data-rm-placement="external"] > details[data-rabbit-mirror-external-details]'],
    ['外置标题框', '.rabbit-mirror-external-shell[data-rm-placement="external"] summary[data-rm-title-chrome]'],
    ['标题文字', '.rabbit-mirror-external-shell[data-rm-placement="external"] [data-rm-title-label]'],
    ['标题旁的兔子按钮', '.rabbit-mirror-external-shell[data-rm-placement="external"] [data-rm-tool-menu-button]'],
]);

export const SKIN_TOKENS = Object.freeze(['--rh-bg', '--rh-card', '--rh-text', '--rh-muted', '--rh-primary', '--rh-secondary', '--rh-border']);

export function readUserSkin() {
    try {
        const value = JSON.parse(globalThis.localStorage?.getItem(USER_SKIN_STORAGE_KEY) || 'null');
        return { enabled: value?.enabled === true, css: typeof value?.css === 'string' ? value.css.slice(0, MAX_CHARS) : '', name: typeof value?.name === 'string' ? value.name.slice(0, 80) : '' };
    } catch { return { enabled: false, css: '', name: '' }; }
}

/** 保存；存不下（太大、隐私模式）返回 false，但当前页面照样换上。 */
export function saveUserSkin(skin) {
    const value = { enabled: skin?.enabled === true, css: String(skin?.css || '').slice(0, MAX_CHARS), name: String(skin?.name || '').slice(0, 80) };
    applyUserSkin(globalThis.document, value);
    try { globalThis.localStorage.setItem(USER_SKIN_STORAGE_KEY, JSON.stringify(value)); return true; } catch { return false; }
}

/** 把美化放进页面：一个 <style>，排在 head 最后，盖过兔子镜自己的样式；关着或为空就拿掉。 */
export function applyUserSkin(doc = globalThis.document, skin = readUserSkin()) {
    if (!doc?.head) return false;
    let style = doc.getElementById(STYLE_ID);
    const css = skin?.enabled ? String(skin.css || '') : '';
    if (!css.trim()) { style?.remove(); return false; }
    if (!style) { style = doc.createElement('style'); style.id = STYLE_ID; }
    style.textContent = layeredSkin(css);
    // 每次都挪到最后：后加载的兔子镜样式不会反过来盖住美化。
    doc.head.append(style);
    return true;
}

// 兔子镜自己的样式选择器很长（带 #chat 和好几个属性），美化照文档写短名字、加了 !important 也盖不过。
// 所以美化放两份：一份照常（不加 !important 的写法照常按先后和精确程度生效）；
// 一份放进单独的层（@layer）里——层里的 !important 盖过所有不在层里的 !important，美化写了 !important 就一定生效。
// 写在元素 style 属性里的 !important 仍然最大（比如标题旁兔子按钮自己的样式）。@import、@charset 只能放最前面，单独提出来。
// 网址里常有分号（字体链接的 wght@400;700），整个 url(...) 或引号里的地址当成一块，不在里面断开；
// 注释里的 @import 是用户关掉的，不提出来（注释先去掉再找）。@namespace 也只能放最前面。
const HOISTED = /@(?:import|charset|namespace)\s+(?:[\w-]+\s+)?(?:url\(\s*(?:"[^"]*"|'[^']*'|[^)]*)\)|"[^"]*"|'[^']*')[^;{}]*;/gi;
export function layeredSkin(css) {
    const head = [];
    const body = String(css || '').replace(/\/\*[\s\S]*?\*\//g, '').replace(HOISTED, rule => { head.push(rule); return ''; });
    return `${head.join('\n')}${head.length ? '\n' : ''}${body}\n@layer rabbit-mirror-user-skin {\n${body}\n}`;
}

/** 停用兔子镜时拿掉美化（不删保存的内容）。 */
export function removeUserSkin(doc = globalThis.document) {
    doc?.getElementById?.(STYLE_ID)?.remove();
}

function skeleton() {
    const lines = ['/* 兔子镜美化：只写下面这些名字，兔子镜更新后也不会失效。', ' * 要盖过兔子镜自己的样式时加 !important（写在元素自己 style 里的 !important 盖不过）。', ' * 颜色变量（设置界面和工具弹窗用）：' + SKIN_TOKENS.join(' ') + ' */', ''];
    for (const [label, selector] of SKIN_HOOKS) lines.push(`/* ${label} */`, `${selector} {`, '}', '');
    return lines.join('\n');
}

function download(doc, name, text) {
    const blob = new Blob([text], { type: 'text/css' });
    const link = doc.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name;
    doc.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 4000);
}

/** 「主题与外观」里的美化区：开关、文本框、导入文件、导出、插入可用名字、清空。 */
export function mountUserSkinControls(container, { listen = (node, event, fn) => node.addEventListener(event, fn) } = {}) {
    const doc = container?.ownerDocument;
    if (!doc) return null;
    const box = doc.createElement('div');
    box.className = 'rh-ui-user-skin';
    box.innerHTML = `<h3 style="margin:18px 0 6px;font-size:15px;">导入美化</h3>
<p class="rh-ui-user-skin-note" style="margin:0 0 8px;font-size:12px;line-height:1.55;opacity:.8;">用一段 CSS 改兔子镜的设置界面、工具弹窗和外置框（包括外置标题框）。不改兔子镜画面里面的内容，只保存在这台设备上。只导入你信任的美化。</p>
<label class="checkbox_label"><input id="rh_user_skin_enabled" type="checkbox"> 启用美化</label>
<textarea id="rh_user_skin_css" class="text_pole" rows="8" spellcheck="false" placeholder="把美化 CSS 粘贴在这里，或点「从文件导入」" style="width:100%;min-height:150px;font-family:ui-monospace,Consolas,monospace;font-size:12px;margin-top:6px;box-sizing:border-box;"></textarea>
<div class="flex-container" style="gap:7px;flex-wrap:wrap;margin-top:6px;">
<button type="button" class="menu_button" data-rh-skin="save">保存并应用</button>
<button type="button" class="menu_button" data-rh-skin="import">从文件导入</button>
<button type="button" class="menu_button" data-rh-skin="export">导出</button>
<button type="button" class="menu_button" data-rh-skin="skeleton">插入可用的名字</button>
<button type="button" class="menu_button" data-rh-skin="clear">清空</button>
</div>
<input type="file" accept=".css,.txt,text/css,text/plain" hidden data-rh-skin-file>
<div class="rh-ui-user-skin-status" role="status" aria-live="polite" style="font-size:12px;margin-top:6px;opacity:.85;"></div>
<details style="margin-top:8px;"><summary style="cursor:pointer;">美化能用的名字</summary><div style="font-size:12px;line-height:1.6;margin-top:6px;">${SKIN_HOOKS.map(([label, selector]) => `<div style="margin-bottom:6px;"><div>${label}</div><code style="overflow-wrap:anywhere;user-select:all;">${selector.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</code></div>`).join('')}<div>颜色变量：<code style="overflow-wrap:anywhere;">${SKIN_TOKENS.join(' ')}</code></div><div style="opacity:.8;margin-top:4px;">外置框还在生成时，兔子镜会临时用它的 ::before / ::after 显示进度。</div></div></details>`;
    container.append(box);
    const enabled = box.querySelector('#rh_user_skin_enabled');
    const area = box.querySelector('#rh_user_skin_css');
    const file = box.querySelector('[data-rh-skin-file]');
    const status = box.querySelector('.rh-ui-user-skin-status');
    let current = readUserSkin();
    enabled.checked = current.enabled;
    area.value = current.css;
    const commit = (message) => {
        current = { enabled: enabled.checked, css: area.value, name: current.name };
        const saved = saveUserSkin(current);
        status.textContent = saved ? message : '美化已换上，但这台设备没能保存（可能太大或浏览器不让存），刷新后会恢复原样。';
    };
    listen(enabled, 'change', () => commit(enabled.checked ? '美化已启用。' : '美化已关闭，内容还留着。'));
    listen(box, 'click', event => {
        const action = event.target?.closest?.('[data-rh-skin]')?.dataset.rhSkin;
        if (action === 'save') { if (!enabled.checked && area.value.trim()) enabled.checked = true; commit('美化已保存并应用。'); }
        if (action === 'import') file.click();
        if (action === 'export') download(doc, `${current.name || '兔子镜美化'}.css`, area.value);
        if (action === 'skeleton') { area.value = `${area.value.trim() ? `${area.value.trimEnd()}\n\n` : ''}${skeleton()}`; status.textContent = '已插入可用的名字，写好后点「保存并应用」。'; }
        if (action === 'clear') { area.value = ''; commit('美化已清空。'); }
    });
    listen(file, 'change', async () => {
        const picked = file.files?.[0];
        file.value = '';
        if (!picked) return;
        if (picked.size > MAX_CHARS * 2) { status.textContent = '文件太大了，没有导入。'; return; }
        try {
            area.value = (await picked.text()).slice(0, MAX_CHARS);
            current.name = picked.name.replace(/\.(css|txt)$/i, '').slice(0, 80);
            enabled.checked = true;
            commit(`已导入「${picked.name}」并应用。`);
        } catch { status.textContent = '这个文件读不出来。'; }
    });
    return box;
}
