import { rmT as __rmT } from "./textTable.js?rmv=2.1.10";
import { getSettings } from './settings.js?rmv=2.1.10';
export const WEB_FONTS = Object.freeze([
    { family: 'Ma Shan Zheng', note: __rmT("C94JX5jvsgl"), css: ['@fontsource/ma-shan-zheng@5/400.css'] },
    { family: 'Zhi Mang Xing', note: __rmT("kVrS3f"), css: ['@fontsource/zhi-mang-xing@5/400.css'] },
    { family: 'Long Cang', note: __rmT("xUae8OsN1GE"), css: ['@fontsource/long-cang@5/400.css'] },
    { family: 'LXGW WenKai', note: __rmT("c6brSO2gaBKVNoVJZtIsliJM"), css: ['lxgw-wenkai-webfont@1/lxgwwenkai-regular.css', 'lxgw-wenkai-webfont@1/lxgwwenkai-bold.css'],
        mirrors: [{ name: 'cdnjs', base: 'https://cdnjs.cloudflare.com/ajax/libs/lxgw-wenkai-webfont/1.7.0/', css: ['lxgwwenkai-regular.css', 'lxgwwenkai-bold.css'] }] },
    { family: 'Noto Serif SC', note: __rmT("YNN36NDOdVyMMtwfnAilmoyoWfESkPVofhJYvFXQFI.vwUUV7Zs"), css: ['@fontsource/noto-serif-sc@5/400.css', '@fontsource/noto-serif-sc@5/900.css'], weight: 400 },
    { family: 'ZCOOL XiaoWei', note: __rmT("nJYoXu4W4Dp"), css: ['@fontsource/zcool-xiaowei@5/400.css'] },
    { family: 'ZCOOL KuaiLe', note: __rmT("nFTDkgWJ.9h"), css: ['@fontsource/zcool-kuaile@5/400.css'] },
    { family: 'ZCOOL QingKe HuangYou', note: __rmT("iSv.cGI8FJpAEk"), css: ['@fontsource/zcool-qingke-huangyou@5/400.css'] },
]);
const SOURCES = Object.freeze({
    cn: 'https://s4.zstatic.net/npm/',
    jsdelivr: 'https://cdn.jsdelivr.net/npm/',
    unpkg: 'https://unpkg.com/',
});
const LINK_ATTR = 'data-rabbit-mirror-web-font';
const RECENT_KEY = 'rabbitMirror.recentWebFonts';
const CSS_TIMEOUT_MS = 10000;
const GLYPH_WAIT_MS = 12000;
const RETRY_AFTER_MS = 60 * 1000;
const SAMPLE = __rmT("8vfuqCi7i6Ywdf");
const status = new Map();
const outcome = new Map();
let workingSource = '';
export function webFontsEnabled(settings = getSettings()) {
    return settings?.webFontsEnabled !== false;
}
function escapeRe(text) { return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
const PATTERNS = new Map(WEB_FONTS.map(font => [font.family, new RegExp(`(^|[\\s,:"'])${escapeRe(font.family)}(?=["'\\s,;!)}]|$)`, 'i')]));
export function webFontsUsedIn(root) {
    const face = root?.matches?.('details') ? root : root?.querySelector?.('details') || root;
    if (!face?.querySelectorAll)
        return [];
    let text = '';
    for (const node of face.querySelectorAll('style'))
        text += `\n${node.textContent || ''}`;
    for (const node of face.querySelectorAll('[style*="font-family" i]'))
        text += `\n${node.getAttribute('style') || ''}`;
    if (face.getAttribute?.('style'))
        text += `\n${face.getAttribute('style')}`;
    if (!/font-family|font\s*:/i.test(text))
        return [];
    return WEB_FONTS.filter(font => PATTERNS.get(font.family).test(text)).map(font => font.family);
}
function sourceOrder() {
    let zone = '';
    try {
        zone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    }
    catch {
        zone = '';
    }
    const mainland = /^Asia\/(?:Shanghai|Chongqing|Chungking|Harbin|Urumqi|Kashgar)$/.test(zone);
    const order = mainland ? [SOURCES.cn, SOURCES.jsdelivr, SOURCES.unpkg] : [SOURCES.jsdelivr, SOURCES.cn, SOURCES.unpkg];
    return workingSource ? [workingSource, ...order.filter(source => source !== workingSource)] : order;
}
const SOURCE_NAMES = new Map([[SOURCES.cn, 'Zstatic'], [SOURCES.jsdelivr, 'jsDelivr'], [SOURCES.unpkg, 'unpkg']]);
async function fetchCss(view, href) {
    const controller = typeof view.AbortController === 'function' ? new view.AbortController() : null;
    const timer = view.setTimeout(() => controller?.abort(), CSS_TIMEOUT_MS);
    try {
        const response = await view.fetch(href, { mode: 'cors', credentials: 'omit', signal: controller?.signal });
        if (!response.ok)
            return { ok: false, reason: `HTTP ${response.status}` };
        const text = await response.text();
        if (!/@font-face/i.test(text))
            return { ok: false, reason: __rmT("F68xSL1EeP4NJXyLEu0QXk") };
        return { ok: true, text, base: response.url || href };
    }
    catch (error) {
        return { ok: false, reason: error?.name === 'AbortError' ? __rmT("vefvjh") : __rmT("Dk5mWW_c") };
    }
    finally {
        view.clearTimeout(timer);
    }
}
function absolutize(css, base) {
    return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (match, quote, url) => {
        if (/^(?:data:|https?:|\/\/|#)/i.test(url))
            return match;
        try {
            return `url("${new URL(url, base).href}")`;
        }
        catch {
            return match;
        }
    });
}
function addStyle(doc, css, family) {
    const style = doc.createElement('style');
    style.setAttribute(LINK_ATTR, family);
    style.textContent = css;
    doc.head.appendChild(style);
    return style;
}
async function glyphState(doc, font) {
    if (!doc.fonts?.load)
        return { state: 'loaded', later: null };
    const view = doc.defaultView || globalThis;
    const pending = doc.fonts.load(`${font.weight || 400} 16px "${font.family}"`, SAMPLE)
        .then(faces => (Array.isArray(faces) && faces.length > 0 && faces.every(face => face.status === 'loaded') ? 'loaded' : 'error'))
        .catch(() => 'error');
    const state = await Promise.race([pending, new Promise(resolve => view.setTimeout(() => resolve('slow'), GLYPH_WAIT_MS))]);
    return { state, later: state === 'slow' ? pending : null };
}
async function loadFont(doc, font) {
    const view = doc.defaultView || globalThis;
    const tried = [];
    if (typeof view.fetch !== 'function') {
        outcome.set(font.family, { ok: false, tried: [__rmT("KZ3s1CHSvCGSgQ.GXi.Ae5q8aVFY7h")], at: Date.now() });
        return false;
    }
    const candidates = [
        ...sourceOrder().map(base => ({ base, name: SOURCE_NAMES.get(base) || new URL(base).host, css: font.css, shared: true })),
        ...(font.mirrors || []).map(mirror => ({ ...mirror, shared: false })),
    ];
    for (const { base, name, css, shared } of candidates) {
        const sheets = await Promise.all(css.map(path => fetchCss(view, base + path)));
        if (!sheets[0].ok) {
            tried.push(`${name} ${sheets[0].reason}`);
            continue;
        }
        const styles = sheets.filter(sheet => sheet.ok).map(sheet => addStyle(doc, absolutize(sheet.text, sheet.base), font.family));
        const { state, later } = await glyphState(doc, font);
        if (state === 'error') {
            tried.push(`${name}${__rmT("wRYDh4g.YOjfnrcON0V3M5vs")}`);
            for (const style of styles)
                style.remove();
            continue;
        }
        if (shared)
            workingSource = base;
        outcome.set(font.family, { ok: true, slow: state === 'slow', source: name, tried, at: Date.now() });
        later?.then(final => outcome.set(font.family, final === 'loaded'
            ? { ok: true, slow: false, source: name, tried, at: Date.now() }
            : { ok: false, tried: [...tried, `${name}${__rmT("wRYDh4g.YOjfnrcON0V3M5vs")}`], at: Date.now() }));
        return true;
    }
    outcome.set(font.family, { ok: false, tried, at: Date.now() });
    return false;
}
export function ensureWebFontsForFace(root, settings = getSettings()) {
    if (!webFontsEnabled(settings))
        return [];
    const doc = root?.ownerDocument;
    if (!doc?.head)
        return [];
    const used = webFontsUsedIn(root);
    for (const family of used) {
        const last = outcome.get(family);
        if (status.has(family) && !(last && !last.ok && Date.now() - last.at > RETRY_AFTER_MS))
            continue;
        const font = WEB_FONTS.find(item => item.family === family);
        status.set(family, loadFont(doc, font).catch(() => false));
    }
    return used;
}
try {
    globalThis.addEventListener?.('online', () => { for (const [family, result] of outcome)
        if (!result.ok)
            status.delete(family); });
}
catch { }
const SEEN = new WeakSet();
function rememberRecent(used) {
    try {
        const list = JSON.parse(globalThis.localStorage?.getItem(RECENT_KEY) || '[]');
        const next = [...(Array.isArray(list) ? list : []), ...used].filter(name => PATTERNS.has(name)).slice(-8);
        globalThis.localStorage?.setItem(RECENT_KEY, JSON.stringify(next));
    }
    catch { }
}
export function installWebFonts(root, settings = getSettings()) {
    const face = root?.matches?.('details') ? root : root?.querySelector?.('details');
    if (!face || SEEN.has(face))
        return [];
    SEEN.add(face);
    const used = ensureWebFontsForFace(face, settings);
    if (used.length)
        rememberRecent(used);
    return used;
}
export function recentWebFonts() {
    try {
        const list = JSON.parse(globalThis.localStorage?.getItem(RECENT_KEY) || '[]');
        return Array.isArray(list) ? [...new Set(list.filter(name => PATTERNS.has(name)).reverse())].slice(0, 3) : [];
    }
    catch {
        return [];
    }
}
export function webFontRule(settings = getSettings(), { follow = false } = {}) {
    if (!webFontsEnabled(settings))
        return '';
    const menu = WEB_FONTS.map(font => `'${font.family}${__rmT("NKWlxk")}${font.note}${__rmT("eXs")}`).join(__rmT("jvk"));
    const recent = recentWebFonts();
    return `${__rmT("fABLtyAp07juyvgPRSMHicBipxdqx7djFcMy1rZ0JlrYwoYcZl.X.wXv2LBEQU7EvnCQrCoRl.9HlHRMmXG_xKPXswdQ4wvfm8vtKVZ3deosOk")}${menu}${__rmT("DV3BIDorUHscsCM3oXRau6qjzBqrrk")}` + (follow ? __rmT("QQqwkm8K3_dutt3Y") : __rmT("1lnDgbDu.2A4hLtT113oguMrebfMcFW2Z_uLMqokQYp")) + __rmT("NiFWU9DoGGyXcjS_hVLhO0gFgXtNod_grKbtkVVYIGKUjkGxXZtgge_JSPP79jupP6ia3KLDcVTH.2fj3SwuOjql3G2w091VoRmFiXqWu3ud6_6UKE._DWaJOiXnYKSPcIhIxNV3InvEWdJlm.FjufV2sBrFx.aUT9X0xAThv8n1G_fJTMcER_NfTGkPHBax9J6CXdwXGiWYhd5Ol7gFVBXVj6085UhQkUUlsjIJl0k3IFoDO3trUNgARhqDJA4n_CIM3W.ZQnoyYh")
        + (recent.length ? `${__rmT("m1VN4S5utXR76lBq")}${recent.map(name => `'${name}'`).join(__rmT("jvk"))}${__rmT("CzPX.abLFkYjjh7lVmzOvxEI")}` : '');
}
export function webFontDiagnostic(root, settings = getSettings()) {
    const used = webFontsUsedIn(root);
    if (!webFontsEnabled(settings))
        return `${__rmT("5XqnfuO4lDoy3FnPOSHKeJmwtXh")}${used.length ? `${__rmT("QfV0Az5u0E_fg_Bq")}${used.join(__rmT("jvk"))}${__rmT("CdaBwmeOF6M66.p_RvwdWGmx3dk")}` : ''}${__rmT("jzk")}`;
    if (!used.length)
        return __rmT("7Rh5vGGUjF_DJ9E_3OKog2XYiz.dFTkLb_R06vifgG8");
    const parts = used.map(family => {
        const result = outcome.get(family);
        if (!result)
            return `${family}${__rmT("VcT9TJRtetXrnHVPPXiWTldlkDn4o9o1bkzqqh")}`;
        const tried = result.tried?.length ? `${__rmT("Y0fgzFpLWZY")}${result.tried.join(__rmT("Yis"))}` : '';
        if (result.ok)
            return `${family}${__rmT("eis")}${result.slow ? __rmT("rsIu4x3lZqpUgrGjoXtKHsW7UFaFHT") : __rmT("4RFZhh4A")}${__rmT("7nZ6F6TBHKG")}${result.source}${tried}${__rmT("eXs")}`;
        return `${family}${__rmT("VcxnDv.Jmvy6NQggXfL77UiBKaauNWSd8kg.2h")}${tried}${__rmT("eXs")}`;
    });
    return `${__rmT("FhGs1YIb2DxStf")}${parts.join(__rmT("7os"))}${__rmT("jzk")}`;
}
export function applyWebFontsSetting(enabled, doc = globalThis.document) {
    if (!doc?.head)
        return;
    if (!enabled) {
        for (const node of doc.head.querySelectorAll(`[${LINK_ATTR}]`))
            node.remove();
        status.clear();
        outcome.clear();
        return;
    }
    for (const face of doc.querySelectorAll('details[data-rabbit-mirror-css-scope], details[data-rabbit-mirror-interaction-scoped]')) {
        try {
            ensureWebFontsForFace(face, { webFontsEnabled: true });
        }
        catch { }
    }
}
