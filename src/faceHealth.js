import { rmT as __rmT, rmR as __rmR } from "./textTable.js?rmv=2.6.3";
import { paletteFromSource } from './independentApi/generationProgress.js?rmv=2.6.3';
import { classifyPaletteSamples } from './paletteObservation.js?rmv=2.6.3';
import { DRIVER_METHODS } from './interactionMethods.js?rmv=2.6.3';
import { parseSelfInvented } from './interactionMethodLedger.js?rmv=2.6.3';
export const HUE_NAMES = Object.freeze({ red: __rmT("mr8"), orange: __rmT("IqG"), yellow: __rmT("dG8"), green: __rmT("GL8"), cyan: __rmT("4D_"), blue: __rmT("hFf"), purple: __rmT("3LA"), pink: __rmT("caT"), neutral: __rmT("Pgv.uk") });
export const BRIGHTNESS_NAMES = Object.freeze({ light: __rmT("z2Zaif"), mid: __rmT("AsAr7j6q"), dark: __rmT("w2Zaif") });
export const RISK_NAMES = Object.freeze({
    missing_interaction: __rmT("xhV2o5FeaOvfXtxcHik"),
    fake_interaction: __rmT("3lrwwdR8tFO7kVPF2ztaUY6TcsA"),
    missing_visual_program: __rmT("bEtGUXIXgJe_kYDallEeniwL_lk"),
    info_page_degrade: __rmT("gLME4V8EK.WFkFyw"),
    catalog_page_risk: __rmT("WgWsfrR3UM4Bg6XrVQlnvT"),
    same_block_stack: __rmT("2Pimii0YgGrRtioyANbkmT"),
    same_grid_card_risk: __rmT("CDVGEXjY.zRO_t7lIKTK5Zeu"),
    repeated_unit_shape: __rmT("9wxb7Yo035S.cn.Gnol"),
    flat_vertical_flow: __rmT("0nMwWka2XzoYALecKnC"),
    weak_media_body: __rmT("nMrckrDH7RWulK3G"),
    weak_spatial_complexity: __rmT("e87yvhTZRwqulK3G"),
    visual_promise_unfulfilled: __rmT("aztf1dVW0FwdMvMRERXp7gwLuGJOnT"),
});
const LAYOUT_RISKS = ['same_block_stack', 'same_grid_card_risk', 'catalog_page_risk', 'flat_vertical_flow', 'repeated_unit_shape'];
export function healthRisks(face) {
    const keys = [...new Set((face?.risks || []).filter(key => RISK_NAMES[key]))];
    if (keys.includes('info_page_degrade') && !keys.some(key => LAYOUT_RISKS.includes(key)))
        return keys.filter(key => key !== 'info_page_degrade');
    return keys;
}
export const FLIP_CSS_RE = /rotate(?:[XY]|3d)\s*\([^)]*180|backface-visibility\s*:\s*hidden/i;
export function uiName(key) {
    if (key === 'switch')
        return __rmT(".vGMcI06NHK8Wf");
    if (key === 'fold')
        return __rmT("cgECNk");
    if (key === 'popup')
        return __rmT("3Bunff");
    return DRIVER_METHODS[key]?.names?.[0] || '';
}
function decode(text) {
    return String(text || '').replace(/&(#x[0-9a-f]{1,6}|#\d{1,7}|[a-z]{2,8});/gi, (all, code) => {
        const lower = code.toLowerCase();
        if (lower[0] === '#') {
            const value = lower[1] === 'x' ? parseInt(lower.slice(2), 16) : parseInt(lower.slice(1), 10);
            return Number.isFinite(value) && value > 0 && value < 0x110000 ? String.fromCodePoint(value) : '';
        }
        return ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' })[lower] ?? all;
    });
}
function visibleText(html) {
    return decode(String(html || '')
        .replace(/<(style|script|template|rm-think|rm-ticket)\b[\s\S]*?<\/\1\s*>/gi, ' ')
        .replace(/<summary\b[\s\S]*?<\/summary\s*>/i, ' ')
        .replace(/<[^>]*>/g, ' '))
        .replace(/\s+/g, '');
}
function hexToRgb(hex) {
    const value = String(hex || '').replace('#', '');
    if (!/^[0-9a-f]{6}$/i.test(value))
        return null;
    return { r: parseInt(value.slice(0, 2), 16), g: parseInt(value.slice(2, 4), 16), b: parseInt(value.slice(4, 6), 16), a: 1 };
}
export function analyzeStoredFace(html) {
    const source = String(html || '');
    const summary = source.match(/<summary\b[^>]*>([\s\S]*?)<\/summary\s*>/i);
    const title = summary ? decode(summary[1].replace(/<(style|script|svg)\b[\s\S]*?<\/\1\s*>/gi, ' ').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim() : '';
    const styleEnd = source.search(/<\/style\s*>/i);
    const palette = paletteFromSource(source.slice(0, styleEnd > 0 ? styleEnd : Math.min(source.length, 6000)));
    const fingerprint = classifyPaletteSamples(palette.colors.map((hex, index) => ({ color: hexToRgb(hex), weight: index === 0 ? 5 : (index < 5 ? 1.5 : 0.7) })).filter(sample => sample.color));
    const uis = [];
    const add = key => { if (key && !uis.includes(key))
        uis.push(key); };
    for (const match of source.matchAll(/\bdata-rm-ui\s*=\s*["']?([a-z][a-z-]{1,20})/gi))
        add(match[1].toLowerCase());
    if (/\bpopovertarget\s*=|\spopover(?:\s|=|>)/i.test(source))
        add('popup');
    if ((source.match(/<details(?=[\s>])/gi) || []).length > 1)
        add('fold');
    if (uis.includes('toggle') && !FLIP_CSS_RE.test(source))
        uis.splice(uis.indexOf('toggle'), 1, 'switch');
    return {
        title,
        chars: source.length,
        textChars: visibleText(source).length,
        colors: palette.colors,
        colorCount: palette.count,
        thread: palette.thread,
        brightness: fingerprint?.brightness || '',
        hueFamily: fingerprint?.hueFamily || '',
        uis,
        keyframes: (source.match(/@(?:-webkit-)?keyframes\b/gi) || []).length,
        pixelArt: /\bdata-rm-sprite\s*=/i.test(source),
    };
}
export function splitStoredFaces(html) {
    const source = String(html || '');
    const blocks = [...source.matchAll(/<toto\b[^>]*\bdata-rm-face\s*=\s*["']?(\d+)[^>]*>([\s\S]*?)<\/toto\s*>/gi)];
    if (!blocks.length)
        return /<details\b/i.test(source) ? [{ faceIndex: 0, html: source }] : [];
    return blocks.map(match => ({ faceIndex: Number(match[1]) - 1, html: match[2] }))
        .filter(face => Number.isInteger(face.faceIndex) && face.faceIndex >= 0 && !/data-rabbit-mirror-face-failure/i.test(face.html) && /<details\b/i.test(face.html));
}
const labelTitle = label => String(label || '').split(__rmT("7ys"))[0].replace(/^\S+\s+(?=\S)/, '').replace(/\s+/g, ' ').trim();
const OUTER_DETAILS_TAG = /<details\b(?:[^>"']|"[^"]*"|'[^']*')*>/i;
function decodeAttributeEntities(value) {
    return String(value || '').replace(/&(?:#(\d{1,7})|#x([0-9a-f]{1,6})|(quot|apos|lt|gt|amp));/gi, (match, dec, hex, name) => {
        if (name)
            return { quot: '"', apos: "'", lt: '<', gt: '>', amp: '&' }[name.toLowerCase()] || match;
        const code = dec ? Number(dec) : parseInt(hex, 16);
        try {
            return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
        }
        catch {
            return match;
        }
    });
}
function outerDetailsAttribute(html, name) {
    const tag = String(html || '').match(OUTER_DETAILS_TAG)?.[0] || '';
    const match = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'));
    return match ? decodeAttributeEntities(match[1] ?? match[2] ?? '') : null;
}
export function faceHasSelfInvent(html) { return outerDetailsAttribute(html, 'data-rm-self') !== null; }
function selfFormOf(html) {
    const value = outerDetailsAttribute(html, 'data-rm-self');
    if (value == null)
        return null;
    return parseSelfInvented(value)?.form || '';
}
function stampedFaceMode(html) {
    try {
        const recipe = JSON.parse(outerDetailsAttribute(html, 'data-rm-face-recipe') || 'null');
        return recipe && typeof recipe.samplingMode === 'string' ? recipe.samplingMode : '';
    }
    catch {
        return '';
    }
}
export function formatNameOf(recipe, html = '') {
    const self = selfFormOf(html);
    if (self)
        return `${self}${__rmT("w890Iyuu5JRxtf")}`;
    const stamped = stampedFaceMode(html);
    if (self === '' || stamped === 'self_invent' || (!stamped && recipe?.samplingMode === 'self_invent'))
        return __rmT("2FQ53CSzry0UAFc2IAA");
    if (stamped && recipe?.samplingMode === 'self_invent')
        return '';
    if (!recipe || typeof recipe !== 'object')
        return '';
    const menu = Array.isArray(recipe.atmosphereMenu) ? recipe.atmosphereMenu : [];
    const choice = recipe.atmosphereChoice;
    if (menu.length > 1 && Number.isInteger(choice) && menu[choice]) {
        const picked = labelTitle((menu[choice].formatLines || [])[0]);
        if (picked)
            return picked;
    }
    const labels = (Array.isArray(recipe.formatLabels) ? recipe.formatLabels : []).map(labelTitle).filter(Boolean);
    if (labels.length === 1)
        return labels[0];
    if (labels.length > 1)
        return menu.length > 1 ? __rmT("2FQ2bMzX3fTV67IkIAA") : labels.slice(0, 2).join(__rmT("eos"));
    if (recipe.presentationMode === 'text')
        return __rmT("w8PdXFIONQOxtf");
    if (recipe.presentationMode === 'longtext')
        return __rmT("fnZOV31s0SY");
    return '';
}
function compareVersions(a, b) {
    const parse = value => String(value || '').replace(/^v/i, '').split(/[.-]/).map(part => (/^\d+$/.test(part) ? Number(part) : part));
    const left = parse(a), right = parse(b);
    for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
        const x = left[index], y = right[index];
        if (x === undefined)
            return -1;
        if (y === undefined)
            return 1;
        if (x === y)
            continue;
        if (typeof x === 'number' && typeof y === 'number')
            return x - y;
        return String(x).localeCompare(String(y));
    }
    return 0;
}
function countBy(items, keyOf) {
    const map = new Map();
    for (const item of items) {
        const keys = [].concat(keyOf(item)).filter(Boolean);
        for (const key of keys)
            map.set(key, (map.get(key) || 0) + 1);
    }
    return [...map].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]))).map(([key, count]) => ({ key, count }));
}
const average = values => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0);
function median(values) {
    if (!values.length)
        return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}
function batchTimings(faces) {
    const batches = new Map();
    for (const face of faces) {
        const timing = face.timing;
        if (!(Number(timing?.totalMs) > 0))
            continue;
        const key = timing.batch ?? `${face.version}:${face.ts}`;
        if (!batches.has(key))
            batches.set(key, timing);
    }
    return [...batches.values()];
}
export function summarizeFaceHealth(allFaces, { limit = 30 } = {}) {
    const sorted = [...(Array.isArray(allFaces) ? allFaces : [])].sort((a, b) => Number(a.ts || 0) - Number(b.ts || 0));
    const faces = Number.isFinite(limit) && limit > 0 ? sorted.slice(-limit) : sorted;
    const total = faces.length;
    const UNKNOWN_FORMAT = __rmT("2Fg5_1RoH5uaALVCIAA");
    const formats = countBy(faces, face => face.format || UNKNOWN_FORMAT);
    const uis = countBy(faces, face => face.analysis?.uis || []).map(item => ({ ...item, name: uiName(item.key) || item.key }));
    const hues = countBy(faces, face => face.analysis?.hueFamily || '');
    const brightness = countBy(faces, face => face.analysis?.brightness || '');
    const risks = countBy(faces, face => healthRisks(face));
    let sameFormat = 0, sameColor = 0, sameUis = 0;
    for (let index = 1; index < faces.length; index += 1) {
        const before = faces[index - 1], now = faces[index];
        if (now.format && now.format === before.format)
            sameFormat += 1;
        if (now.analysis?.hueFamily && now.analysis.hueFamily === before.analysis?.hueFamily && now.analysis.brightness === before.analysis?.brightness)
            sameColor += 1;
        const set = face => [...(face.analysis?.uis || [])].sort().join(',');
        if (set(now) && set(now) === set(before))
            sameUis += 1;
    }
    const tested = faces.filter(face => face.probe?.tested);
    const timed = batchTimings(faces);
    const numeric = value => /^v?\d+(?:\.\d+)*/.test(String(value));
    const versionKeys = [...new Set(faces.map(face => face.version || __rmT("uP8Onk")))]
        .sort((a, b) => (numeric(b) - numeric(a)) || (numeric(a) ? -compareVersions(a, b) : String(a).localeCompare(String(b))));
    const versions = versionKeys.map(version => {
        const group = faces.filter(face => (face.version || __rmT("uP8Onk")) === version);
        const groupTested = group.filter(face => face.probe?.tested);
        const groupTimed = batchTimings(group);
        return {
            version,
            faces: group.length,
            avgChars: Math.round(average(group.map(face => face.analysis?.chars || 0))),
            avgTextChars: Math.round(average(group.map(face => face.analysis?.textChars || 0))),
            avgUis: Number(average(group.map(face => (face.analysis?.uis || []).length)).toFixed(1)),
            noUi: group.filter(face => !(face.analysis?.uis || []).length).length,
            repaired: group.filter(face => face.repaired).length,
            tested: groupTested.length,
            deadFaces: groupTested.filter(face => Number(face.probe?.dead) > 0).length,
            risky: group.filter(face => healthRisks(face).length).length,
            avgSeconds: groupTimed.length ? Math.round(average(groupTimed.map(timing => timing.totalMs)) / 1000) : null,
            approx: group.some(face => face.versionApprox),
        };
    });
    return {
        total,
        available: sorted.length,
        more: sorted.length > faces.length,
        from: faces[0]?.ts || 0,
        to: faces[faces.length - 1]?.ts || 0,
        formats,
        distinctFormats: formats.filter(item => item.key !== UNKNOWN_FORMAT).length,
        uis,
        avgUis: Number(average(faces.map(face => (face.analysis?.uis || []).length)).toFixed(1)),
        noUi: faces.filter(face => !(face.analysis?.uis || []).length).length,
        hues,
        brightness,
        sameFormat, sameColor, sameUis,
        risks: risks.map(item => ({ ...item, name: RISK_NAMES[item.key] })),
        repaired: faces.filter(face => face.repaired).length,
        tested: tested.length,
        deadFaces: tested.filter(face => Number(face.probe?.dead) > 0).length,
        deadControls: tested.reduce((sum, face) => sum + (Number(face.probe?.dead) || 0), 0),
        avgChars: Math.round(average(faces.map(face => face.analysis?.chars || 0))),
        medianChars: Math.round(median(faces.map(face => face.analysis?.chars || 0))),
        avgTextChars: Math.round(average(faces.map(face => face.analysis?.textChars || 0))),
        pixelArt: faces.filter(face => face.analysis?.pixelArt).length,
        timed: timed.length,
        avgSeconds: timed.length ? Math.round(average(timed.map(timing => timing.totalMs)) / 1000) : null,
        avgThinkSeconds: timed.filter(timing => Number(timing.thinkMs) > 0).length
            ? Math.round(average(timed.filter(timing => Number(timing.thinkMs) > 0).map(timing => timing.thinkMs)) / 1000) : null,
        approxVersions: faces.filter(face => face.versionApprox).length,
        versions,
        strip: faces.map(face => ({ color: face.analysis?.colors?.[0] || '', accent: face.analysis?.thread || '', version: face.version || '', ts: face.ts || 0 })),
        faces,
    };
}
function day(ts) {
    const value = Number(ts || 0);
    if (!(value > 0))
        return '-';
    const date = new Date(value);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
const percent = (part, whole) => (whole ? `${Math.round(part / whole * 100)}%` : '-');
const maskTitle = title => (title ? `${__rmT("r8DnyT")}${[...String(title)].length}` : __rmT("Pgx_GT"));
const exportFormat = face => (!face?.format ? '-' : (face.formatBuiltin || __rmR("T.ejQ49SSqkwmnEwt2FUnnAx", "").test(face.format) ? face.format : `${__rmT("Sr8ZSZjEr8dzg6hdANE7HT")}${[...String(face.format)].length}${__rmT("eXs")}`));
export function buildFaceHealthText(summary, { runtimeVersion = '' } = {}) {
    const lines = [];
    lines.push(__rmT("pb7i424xdoYym.uNKeibiPS6BWz57NnhPtl"));
    if (runtimeVersion)
        lines.push(`${__rmT("d5NGnnLTiOE8Mef6gPD")}${runtimeVersion}`);
    lines.push(`${__rmT("ZCh9cdvuHKG")}${summary.more ? `${__rmT("mif0jcc6")}${summary.total}${__rmT("uNe_ToZ2n5u489NRmkQ1YdIn3C_8.qtuuLf")}` : `${__rmT("wiQ8YGUea5Isq8NPgPD")}${summary.total}${__rmT("2RddPk")}`}  ${day(summary.from)} ~ ${day(summary.to)}`);
    lines.push('');
    lines.push(`${__rmT("xKYJOK17.vsHjnEwR68385Cx")}${summary.distinctFormats}${__rmT("4JS2Jb6iELZYsCJdnSsHby1DYNPCJk")}${summary.sameFormat}${__rmT("2RWUYk")}`);
    const builtinFormat = new Map(summary.faces.map(face => [face.format, !!face.formatBuiltin]));
    for (const item of summary.formats.slice(0, 12))
        lines.push(`  ${exportFormat({ format: item.key, formatBuiltin: builtinFormat.get(item.key) })} × ${item.count}`);
    lines.push(`${__rmT("n9_gTMmsY3hvcBPUPx024meaNtxIR0b6Ko1Vanav4g8")}${summary.sameColor}${__rmT("2RWUYk")}`);
    lines.push(`${__rmT("4bMNj6s0YwiEBsBq")}${summary.brightness.map(item => `${BRIGHTNESS_NAMES[item.key] || item.key} ${item.count}`).join('  ') || '-'}`);
    lines.push(`${__rmT("4bMNj55l6y9EBsBq")}${summary.hues.map(item => `${HUE_NAMES[item.key] || item.key} ${item.count}`).join('  ') || '-'}`);
    lines.push(`${__rmT("xuDAUa3JtESASVCXPTQXPP8HjFs")}${summary.avgUis}${__rmT("4JS2Jb6iM18dI2ZgawNquCWYrJjCJk")}${summary.noUi}${__rmT("tMyfaQ4Wo.GJ.PHMHbfF_josape4bJoLh4roDf")}${summary.sameUis}${__rmT("2RWUYk")}`);
    for (const item of summary.uis.slice(0, 12))
        lines.push(`  ${item.name} × ${item.count}`);
    lines.push(__rmT("pEwa4uCDa.G"));
    lines.push(`${__rmT("wRemaFj_y5KvY8OhA4VLE0Cx")}${summary.repaired}${__rmT("2RddPk")}`);
    lines.push(`${__rmT("fiXGAGqmfC2r1j3Lwt4dHT")}${summary.tested}${__rmT("4b6BvpJxB_o6g_Bq")}${summary.deadFaces}${__rmT("tMyfaDQmSssqN4KBz0kmBeiBbaSYLJsWxhSoDf")}${summary.deadControls}${__rmT("qGtBWWZp")}${summary.tested ? '' : __rmT("B4KsAW7mFSp.xwa0EfEB3xsSezdmWJEynMomAWX5g529WPM3XyJn_PmqAaqOtbYQSFTO8OGZw43v_.6MPHWblQGc8vLyLDA6YMCOVDOCnLk")}`);
    for (const item of summary.risks)
        lines.push(`  ${item.name}: ${item.count}${__rmT("2RddPk")}`);
    lines.push(`${__rmT("yomq7sPsQRN._ly1TNbdHT")}${summary.avgChars}${__rmT("7aAV7XLiXHBFTzRAgPD")}${summary.medianChars}${__rmT("Uaa9QE7wKQ3ekN8LwT6zdFwHjFs")}${summary.avgTextChars}${__rmT("PD9rcn3FIguBTh")}${summary.pixelArt}${__rmT("2RddPk")}`);
    lines.push(`${__rmT("61eOsyVOBERBTh")}${summary.timed ? `${__rmT("nhOAWUc6")}${summary.timed}${__rmT("fiXHijtjN2ZI0sy1TNbdHT")}${summary.avgSeconds}${__rmT("2RCLfh")}${summary.avgThinkSeconds !== null ? `${__rmT("NO4XhA1Em2rfply1TNbdHT")}${summary.avgThinkSeconds}${__rmT("qGlh9jZp")}` : ''}` : __rmT("XjGgAvk3oFb0Zl_wnYiZmbJoArzeuFIi4DX6wPmPfraGGyMdcph")}`);
    if (summary.approxVersions)
        lines.push(`${__rmT("N_wXhg6cWZY")}${summary.approxVersions}${__rmT("bF51r1ImWW1EAjS8HEidzz4NQih2Ll.zoU19_kStlcD7iJ5f4d1pXVwLZRM6glJzgDcpA0q7OMvTB900HEuL8f1xe9Mqc7vFKXjSlgWZ95oQYTBnl5fabbUJkhfR7RDr")}`);
    lines.push('');
    lines.push(__rmT("61ekFUKapMfUTh"));
    lines.push(__rmT("9TNsZVf0lMgcRXt2N6rgSU1Kh1dJv0byZ6jY2DD2GEgemRhn8S_jptFXLyEw0oSuMRtRGfxTsKCmpxwiPoZLhxx4Slz8BaNPecRgguksGCVeJXP5jzLCKrFYZo9OJVerCEMTBYUIQ2RVDqFHmkgoP.eGj9_mFddbLWf"));
    for (const row of summary.versions) {
        lines.push(`  ${row.version}${row.approx ? '≈' : ''} | ${row.faces} | ${row.avgChars} | ${row.avgUis} | ${row.noUi} | ${row.repaired} | ${row.deadFaces}/${row.tested} | ${row.risky} | ${row.avgSeconds === null ? '-' : `${row.avgSeconds}${__rmT("2RCLfh")}`}`);
    }
    lines.push('');
    lines.push(__rmT("AkY2YfrostY1jXbm72._BaT3AAXcs7nY"));
    for (const face of summary.faces) {
        const a = face.analysis || {};
        lines.push(`  ${day(face.ts)} ${face.version || __rmT("uP8Onk")}${face.versionApprox ? '≈' : ''}${__rmT("2RWGfk")}${Number(face.index) + 1}${__rmT("DWC")}${face.faceCount > 1 ? `${__rmT("_dE")}${Number(face.faceIndex) + 1}${__rmT("tD_")}` : ''} ${maskTitle(a.title)}${__rmT("4b6rjaFy3_dutlBq")}${exportFormat(face)} | ${BRIGHTNESS_NAMES[a.brightness] || '-'}${HUE_NAMES[a.hueFamily] || ''} ${a.colors?.slice(0, 4).join(' ') || ''}${__rmT("4b6rjaFyO3hXl_Bq")}${(a.uis || []).map(uiName).filter(Boolean).join(__rmT("jvk")) || __rmT("wWY")} | ${a.chars || 0}${__rmT("qGyUScEk")}${face.repaired ? __rmT("4b6rjaFy8XO8gzr8") : ''}${face.probe?.tested ? `${__rmT("4b6rjaFyQEm0psBq")}${face.probe.dead}` : ''}${healthRisks(face).length ? ` | ${healthRisks(face).map(key => RISK_NAMES[key]).join(__rmT("jvk"))}` : ''}${Number(face.timing?.totalMs) > 0 ? ` | ${Math.round(face.timing.totalMs / 1000)}${__rmT("2RCLfh")}` : ''}`);
    }
    return lines.join('\n');
}
export { percent as healthPercent, day as healthDay };
