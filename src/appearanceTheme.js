// Shared UI theme only: no settings workbench, model calls or generated-face changes.
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
export const paletteKeys = ['background', 'surface', 'text', 'muted', 'accent', 'accentAlt', 'border'];
const modes = new Set(['host', 'custom', ...UI_THEMES.map(theme => theme.id)]);

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

const tokenNames = { background: 'bg', surface: 'card', text: 'text', muted: 'muted', accent: 'primary', accentAlt: 'secondary', border: 'border' };
const hostTokens = { background: 'var(--SmartThemeBlurTintColor, #f5f4fb)', surface: 'var(--SmartThemeBlurTintColor, #ffffff)', text: 'var(--SmartThemeBodyColor, #34495d)', muted: 'var(--SmartThemeBodyColor, #586b7c)', accent: 'var(--SmartThemeQuoteColor, #ce729c)', accentAlt: 'var(--SmartThemeQuoteColor, #58a59e)', border: 'var(--SmartThemeBorderColor, #cfdae5)' };
const smartThemeAliases = [['--SmartThemeBodyColor', 'text'], ['--SmartThemeBlurTintColor', 'card'], ['--SmartThemeBorderColor', 'border'], ['--SmartThemeQuoteColor', 'primary']];

// Panels mounted outside the settings workbench (for example the world-book import
// wizard on document.body) cannot inherit the workbench's theme tokens. Apply the
// exact same --rh-* palette and SmartTheme aliasing to one such root element.
export function applyAppearanceTheme(target, appearance) {
    if (!target?.style) return;
    let state = appearance;
    if (!state) {
        try { state = normalizeAppearance(JSON.parse(globalThis.localStorage.getItem(APPEARANCE_STORAGE_KEY) || 'null')); }
        catch { state = normalizeAppearance(null); }
    }
    const preset = UI_THEMES.find(theme => theme.id === state.mode);
    const palette = state.mode === 'custom' ? state.custom : preset?.palette;
    target.dataset.rhTheme = state.mode;
    for (const key of paletteKeys) target.style.setProperty('--rh-' + tokenNames[key], palette?.[key] || hostTokens[key]);
    for (const [alias, key] of smartThemeAliases) {
        if (state.mode === 'host') target.style.removeProperty(alias);
        else target.style.setProperty(alias, `var(--rh-${key})`);
    }
    // 表单控件用不透明的卡片色；并告诉浏览器深 / 浅配色，手机弹出的原生下拉列表才会跟着变深。
    const surface = state.mode === 'host' ? '' : String(palette?.surface || '');
    if (/^#[0-9a-f]{6}$/i.test(surface)) {
        target.style.setProperty('--rh-field', surface);
        target.style.colorScheme = hexLuminance(surface) < 0.35 ? 'dark' : 'light';
    } else {
        target.style.removeProperty('--rh-field');
        target.style.colorScheme = '';
    }
}

function hexLuminance(hex) {
    const channel = offset => {
        const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
        return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

