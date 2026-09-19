// UI palettes from the user-provided Hearttrace source, by Toto.
// Presentation only: no generation settings, Prompt, content storage, or network.
import { QUICK_START_GROUPS } from './quickStart.js?rmv=1.5.53-cn-boundary1';
export const UI_THEMES = Object.freeze([
  {
    "id": "default",
    "label": "日间 · 珍珠白",
    "palette": {
      "background": "#f5f4fb",
      "surface": "#ffffff",
      "text": "#34495d",
      "muted": "#586b7c",
      "accent": "#ce729c",
      "accentAlt": "#58a59e",
      "border": "#cfdae5"
    }
  },
  {
    "id": "night",
    "label": "夜间 · 星黛蓝",
    "palette": {
      "background": "#171d28",
      "surface": "#232c3a",
      "text": "#edf1f8",
      "muted": "#b8c5d6",
      "accent": "#d9a8c1",
      "accentAlt": "#90c9c5",
      "border": "#455269"
    }
  },
  {
    "id": "gs1",
    "label": "初叶绿",
    "palette": {
      "background": "#edf6e5",
      "surface": "#ffffff",
      "text": "#234831",
      "muted": "#50624d",
      "accent": "#43833d",
      "accentAlt": "#e7b83b",
      "border": "#bad7a7"
    }
  },
  {
    "id": "gs2",
    "label": "海盐蓝",
    "palette": {
      "background": "#e9f3ff",
      "surface": "#ffffff",
      "text": "#233d61",
      "muted": "#52647d",
      "accent": "#287dc3",
      "accentAlt": "#9b79c8",
      "border": "#b4d2ee"
    }
  },
  {
    "id": "gs3",
    "label": "花漾粉",
    "palette": {
      "background": "#fff0f5",
      "surface": "#ffffff",
      "text": "#572c43",
      "muted": "#78536a",
      "accent": "#cc4d87",
      "accentAlt": "#68a97d",
      "border": "#edb6cf"
    }
  },
  {
    "id": "gs4",
    "label": "杏糖橙",
    "palette": {
      "background": "#fff1d9",
      "surface": "#fffefd",
      "text": "#553b24",
      "muted": "#74604b",
      "accent": "#c77425",
      "accentAlt": "#5096c8",
      "border": "#e9ca94"
    }
  }
]);

export const APPEARANCE_STORAGE_KEY = 'rabbit_mirror_settings_appearance_v1';
const paletteKeys = ['background', 'surface', 'text', 'muted', 'accent', 'accentAlt', 'border'];
const colorLabels = ['背景', '卡片底色', '正文', '辅助文字', '主色', '辅助色', '边框'];
const modes = new Set(['host', 'custom', ...UI_THEMES.map(theme => theme.id)]);
const mounts = new WeakMap();

export function normalizeAppearance(value) {
    const source = value && typeof value === 'object' ? value : {};
    return {
        mode: modes.has(source.mode) ? source.mode : 'host',
        custom: Object.fromEntries(paletteKeys.map(key => [key,
            /^#[0-9a-f]{6}$/i.test(source.custom?.[key] || '')
                ? source.custom[key] : UI_THEMES[0].palette[key],
        ])),
    };
}

const iconPaths = {
    palette: '<circle cx="12" cy="12" r="8"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/><path d="M8 15h8"/>',
    sliders: '<path d="M6 4v16M12 4v16M18 4v16M3 8h6M9 16h6M15 10h6"/>',
    book: '<path d="M4 4h7v16H4zM13 4h7v16h-7z"/>',
    memory: '<path d="M5 5h14v14H5zM8 2v3M16 2v3M8 19v3M16 19v3M2 8h3M19 8h3M2 16h3M19 16h3"/>',
    repair: '<path d="m4 20 9-9M13 4a5 5 0 0 0 7 7l-4-1-2-2z"/>',
};
function icon(name) {
    return `<span class="rh-ui-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name] || iconPaths.sliders}</svg></span>`;
}
function element(doc, tag, className, text = '') {
    const node = doc.createElement(tag);
    node.className = className;
    if (text) node.textContent = text;
    return node;
}

export function destroySettingsAppearance(root) {
    mounts.get(root)?.();
}

export function mountSettingsAppearance(root) {
    if (!root || mounts.has(root)) return;
    const doc = root.ownerDocument;
    const drawer = root.querySelector(':scope > .inline-drawer > .inline-drawer-content');
    if (!drawer) return;
    root.dataset.rhWorkbench = 'hearttrace-ui1';
    const original = [...drawer.children];
    const modalIds = ['rh_advanced_modal', 'rh_world_info_prompt_modal', 'rh_independent_tag_filter_modal'];
    let state;
    try { state = normalizeAppearance(JSON.parse(globalThis.localStorage.getItem(APPEARANCE_STORAGE_KEY) || 'null')); }
    catch { state = normalizeAppearance(null); }
    const listeners = [];
    const listen = (node, type, fn, options) => { node.addEventListener(type, fn, options); listeners.push(() => node.removeEventListener(type, fn, options)); };
    const tabs = element(doc, 'div', 'rh-ui-tabs');
    tabs.setAttribute('role', 'tablist'); tabs.setAttribute('aria-label', '兔子镜设置导航');
    const breadcrumb = element(doc, 'div', 'rh-ui-breadcrumb');
    breadcrumb.hidden = true;
    const back = element(doc, 'button', '', '返回设置');
    back.type = 'button'; back.dataset.rhBack = '';
    const crumbTitle = element(doc, 'span', '');
    breadcrumb.append(back, crumbTitle);
    drawer.prepend(tabs, breadcrumb);
    const definitions = [
        ['settings', '设置', '连接、生成与界面外观'],
        ['library', '母本', '导入你的玩法，管理抽取偏好'],
        ['tools', '工具', '维护、诊断与使用指引'],
    ];
    const panels = new Map(); const tabButtons = new Map();
    for (const [key, title, subtitle] of definitions) {
        const tab = element(doc, 'button', '', title);
        tab.type = 'button'; tab.id = `rh_ui_tab_${key}`;
        tab.dataset.rhTab = key; tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-controls', `rh_ui_panel_${key}`);
        const panel = element(doc, 'section', 'rh-ui-panel');
        panel.id = `rh_ui_panel_${key}`; panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', tab.id);
        const heading = element(doc, 'div', 'rh-ui-heading');
        heading.append(element(doc, 'h3', '', title), element(doc, 'p', '', subtitle));
        panel.append(heading); tabs.append(tab); drawer.append(panel);
        panels.set(key, panel); tabButtons.set(key, tab);
    }
    const settingsPanel = panels.get('settings'), libraryPanel = panels.get('library'), toolsPanel = panels.get('tools');
    const generation = original.find(node => node.matches('details.rabbit-mirror-section') && !node.id && !node.classList.contains('rabbit-mirror-tools'));
    const api = root.querySelector('#rh_independent_api_section');
    const favorites = root.querySelector('#rh_random_preference_section');
    const tools = original.find(node => node.classList.contains('rabbit-mirror-tools'));
    for (const node of original) {
        if (node === favorites) libraryPanel.append(node);
        else if (node === tools || node.matches('.rabbit-mirror-help-update-row, #rh_update_status, #rh_update_reload')) toolsPanel.append(node);
        else settingsPanel.append(node);
    }
    // Use existing controls and their bound events. Do not clone settings fields.
    function shortcut(panel, title, detail, page, glyph) {
        const button = element(doc, 'button', 'rh-ui-link'); button.type = 'button';
        button.dataset.rhAdvancedTarget = page;
        button.innerHTML = `${icon(glyph)}<span class="rh-ui-link-copy"><strong>${title}</strong><small>${detail}</small></span><span class="rh-ui-chevron" aria-hidden="true">›</span>`;
        listen(button, 'click', () => {
            doc.getElementById('rh_advanced_open')?.click();
            doc.querySelector(`#rh_advanced_menu [data-page="${page}"]`)?.click();
        });
        panel.append(button);
        return button;
    }
    shortcut(libraryPanel, '母本库', '粘贴文字、导入文件与整库备份', 'external', 'book');
    libraryPanel.append(favorites);
    shortcut(libraryPanel, '生成与抽取', '多面、抽取模式与冷却', 'generation', 'sliders');
    shortcut(libraryPanel, '共同回忆', '记忆插件与世界书来源', 'memory', 'memory');
    shortcut(toolsPanel, '挨打猫与维修兔', '反馈、检查与修复工具', 'repair', 'repair');
    shortcut(toolsPanel, '禁词与文字替换', '本地过滤规则', 'replacement', 'sliders');

    const appearance = element(doc, 'details', 'rabbit-mirror-section rh-ui-page-card');
    appearance.id = 'rh_ui_appearance';
    appearance.innerHTML = `<summary><span>主题与外观</span><span class="rabbit-mirror-section-note" data-rh-theme-label></span></summary>
      <div class="rabbit-mirror-section-content rh-ui-appearance-body">
        <label for="rh_ui_theme">界面主题</label><select id="rh_ui_theme" class="text_pole">
          <option value="host">跟随酒馆主题</option>${UI_THEMES.map(t => `<option value="${t.id}">${t.label}</option>`).join('')}<option value="custom">自定义配色</option>
        </select>
        <p>只调整兔子镜设置界面；生成内容的配色由原有创作设置决定。</p>
        <div class="rh-ui-theme-presets" aria-label="心迹主题配色">${UI_THEMES.map(t => `<button type="button" data-rh-theme-preset="${t.id}" aria-pressed="false"><span class="swatch" style="--swatch:${t.palette.accent}" aria-hidden="true"></span>${t.label}</button>`).join('')}</div>
        <div class="rh-ui-custom-grid" id="rh_ui_custom" hidden>${paletteKeys.map((key, index) => `<label>${colorLabels[index]}<input type="color" data-rh-color="${key}" aria-label="${colorLabels[index]}"><span data-rh-color-value="${key}"></span></label>`).join('')}</div>
        <div class="rh-ui-theme-preview"><h4>留一点空间，给下一场相遇</h4><p>清楚的层次，轻盈的留白。这里预览设置面板的颜色。</p><span class="rh-ui-preview-chip">兔子镜小剧场</span></div>
        <div class="rh-ui-save-status" role="status" aria-live="polite"></div>
      </div>`;
    settingsPanel.append(appearance);
    if (generation) settingsPanel.append(generation);
    shortcut(settingsPanel, '个性化视觉提示词', '额外偏好、避雷与外观参考', 'visual', 'palette');
    if (api) api.querySelector('summary > span')?.replaceChildren(doc.createTextNode('API 与模型'));
    const pageCards = [api, generation, favorites, tools, appearance].filter(Boolean);
    for (const [index, card] of pageCards.entries()) {
        card.classList.add('rh-ui-page-card');
        if (!card.id) card.id = `rh_ui_page_${index}`;
    }
    // Retain preexisting hidden state (e.g. the update status) through navigation.
    let activeTab = 'settings', activePage = null;
    function navigate(tabKey, card = null, focus = false) {
        activeTab = tabKey; activePage = card;
        for (const [key, panel] of panels) {
            panel.hidden = key !== tabKey;
            panel.classList.toggle('rh-ui-in-page', key === tabKey && !!card);
            const tab = tabButtons.get(key); tab.setAttribute('aria-selected', String(key === tabKey)); tab.tabIndex = key === tabKey ? 0 : -1;
            for (const node of panel.children) {
                // Only nodes hidden by this router are restored by it.
                if (node.dataset.rhRouteHidden === 'true') { node.hidden = false; delete node.dataset.rhRouteHidden; }
                if (card && key === tabKey && node !== card && !node.hidden) { node.hidden = true; node.dataset.rhRouteHidden = 'true'; }
            }
        }
        for (const item of pageCards) { item.open = item === card; item.dataset.rhActivePage = String(item === card); }
        breadcrumb.hidden = !card;
        back.textContent = `‹ 返回${tabButtons.get(tabKey).textContent}`;
        crumbTitle.textContent = card?.querySelector('summary > span')?.textContent || '';
        if (card) root.dataset.rhPageOpen = card.id; else delete root.dataset.rhPageOpen;
        if (focus) (card ? back : tabButtons.get(tabKey)).focus({ preventScroll: true });
    }
    listen(tabs, 'click', event => {
        const button = event.target.closest('[data-rh-tab]');
        if (button && tabs.contains(button)) navigate(button.dataset.rhTab);
    });
    listen(tabs, 'keydown', event => {
        const keys = [...tabButtons.keys()], current = keys.indexOf(event.target.dataset.rhTab);
        if (current < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? keys.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + keys.length) % keys.length;
        navigate(keys[next], null, true);
    });
    listen(back, 'click', () => {
        const card = activePage;
        navigate(activeTab);
        card?.querySelector('summary')?.focus({ preventScroll: true });
    });
    for (const card of pageCards) listen(card.querySelector('summary'), 'click', event => {
        event.preventDefault();
        navigate(activeTab, activePage === card ? null : card, true);
    });

    // Reveal the new navigation layer before the existing guide locates a field.
    // The guide still owns scrolling, highlighting, modal routing and return state.
    const guideRoutes = new Map(QUICK_START_GROUPS.flatMap(group => group.items).map(item => [item.id, item]));
    for (const [id, target] of Object.entries({ inject: '#rh_enabled', 'independent-mode': '#rh_generation_independent',
        'independent-display': '#rh_independent_display_row', 'follow-display': '#rh_follow_display_row' })) {
        guideRoutes.set(id, { target });
    }
    let guideOrigin = null;
    listen(doc, 'click', event => {
        const trigger = event.target.closest('#rh_quick_start [data-rh-guide-route]');
        if (!trigger || !root.contains(trigger)) return;
        const item = guideRoutes.get(trigger.dataset.rhGuideRoute);
        guideOrigin = { tab: activeTab, card: activePage };
        if (!item?.target || item.page) return;
        const selector = trigger.dataset.rhGuideRoute === 'display'
            ? (root.querySelector('#rh_generation_independent')?.checked ? '#rh_independent_display_row' : '#rh_follow_display_row')
            : item.target;
        const target = root.querySelector(selector);
        const panel = target?.closest('.rh-ui-panel');
        const tab = [...panels].find(([, node]) => node === panel)?.[0];
        if (tab) navigate(tab, target.closest('.rh-ui-page-card'));
    }, true);
    listen(doc, 'click', event => {
        if (!guideOrigin || !event.target.closest('.rabbit-mirror-guide-return button')) return;
        navigate(guideOrigin.tab, guideOrigin.card);
        guideOrigin = null;
    });

    const themeSelect = appearance.querySelector('#rh_ui_theme');
    const status = appearance.querySelector('.rh-ui-save-status');
    const tokenNames = { background: 'bg', surface: 'card', text: 'text', muted: 'muted', accent: 'primary', accentAlt: 'secondary', border: 'border' };
    const hostTokens = { background: 'var(--SmartThemeBlurTintColor, #f5f4fb)', surface: 'var(--SmartThemeBlurTintColor, #ffffff)', text: 'var(--SmartThemeBodyColor, #34495d)', muted: 'var(--SmartThemeBodyColor, #586b7c)', accent: 'var(--SmartThemeQuoteColor, #ce729c)', accentAlt: 'var(--SmartThemeQuoteColor, #58a59e)', border: 'var(--SmartThemeBorderColor, #cfdae5)' };
    const hostAliases = { '--SmartThemeBodyColor': 'var(--rh-text)', '--SmartThemeBlurTintColor': 'var(--rh-card)', '--SmartThemeBorderColor': 'var(--rh-border)', '--SmartThemeQuoteColor': 'var(--rh-primary)' };
    function applyTheme(save = false) {
        const preset = UI_THEMES.find(t => t.id === state.mode);
        const palette = state.mode === 'custom' ? state.custom : preset?.palette;
        // The existing mobile hotfix may replace modal divs with dialogs.
        const themeRoots = [root, ...modalIds.map(id => doc.getElementById(id)).filter(Boolean)];
        for (const target of themeRoots) {
            target.dataset.rhTheme = state.mode;
            for (const [alias, value] of Object.entries(hostAliases)) {
                if (state.mode === 'host') target.style.removeProperty(alias); else target.style.setProperty(alias, value);
            }
            for (const key of paletteKeys) target.style.setProperty(`--rh-${tokenNames[key]}`, palette?.[key] || hostTokens[key]);
            target.style.setProperty('--rh-input', 'var(--rh-card)');
            target.style.setProperty('--rh-shadow', '0 4px 18px color-mix(in srgb, var(--rh-text) 7%, transparent)');
        }
        themeSelect.value = state.mode;
        appearance.querySelector('[data-rh-theme-label]').textContent = preset?.label || (state.mode === 'host' ? '跟随酒馆主题' : '自定义配色');
        appearance.querySelector('#rh_ui_custom').hidden = state.mode !== 'custom';
        for (const button of appearance.querySelectorAll('[data-rh-theme-preset]')) button.setAttribute('aria-pressed', String(button.dataset.rhThemePreset === state.mode));
        for (const input of appearance.querySelectorAll('[data-rh-color]')) {
            input.value = state.custom[input.dataset.rhColor];
            appearance.querySelector(`[data-rh-color-value="${input.dataset.rhColor}"]`).textContent = input.value;
        }
        if (save) {
            try {
                globalThis.localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(state));
                status.textContent = '外观已保存到此设备。';
            } catch { status.textContent = '当前外观已应用，但此设备未能保存；重新进入后可能恢复原设置。'; }
        }
    }
    listen(themeSelect, 'change', () => { state.mode = themeSelect.value; applyTheme(true); });
    listen(appearance, 'click', event => {
        const preset = event.target.closest('[data-rh-theme-preset]');
        if (preset && appearance.contains(preset)) { state.mode = preset.dataset.rhThemePreset; applyTheme(true); }
    });
    listen(appearance, 'input', event => {
        const key = event.target.dataset.rhColor;
        if (paletteKeys.includes(key)) { state.custom[key] = event.target.value; applyTheme(true); }
    });
    applyTheme(); navigate('settings');
    const cleanup = () => { listeners.splice(0).forEach(remove => remove()); mounts.delete(root); };
    mounts.set(root, cleanup);
}
