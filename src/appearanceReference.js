import { rmT as __rmT } from "./textTable.js?rmv=2.3.5";
export const APPEARANCE_REFERENCE_INPUT_BYTES = 128 * 1024;
export const APPEARANCE_REFERENCE_MAX_CHARS = 12000;
const DB_NAME = 'RabbitMirrorAppearanceReference';
const STORE = 'reference';
const TAGS = new Set('div section article main aside header footer nav details summary p span h1 h2 h3 h4 ul ol li table thead tbody tr th td label input button figure figcaption fieldset legend br hr'.split(' '));
const VOID_TAGS = new Set(['input', 'br', 'hr']);
const PROPERTIES = new Set(('display position overflow overflow-x overflow-y width min-width max-width height min-height max-height margin margin-top margin-right margin-bottom margin-left padding padding-top padding-right padding-bottom padding-left gap row-gap column-gap grid-template-columns grid-template-rows grid-column grid-row flex flex-direction flex-wrap flex-grow flex-shrink flex-basis align-items align-content align-self justify-content justify-items order color background background-color background-image border border-top border-right border-bottom border-left border-color border-width border-style border-radius box-shadow opacity font-size font-weight font-family line-height letter-spacing text-align text-decoration white-space word-break overflow-wrap transform transform-origin perspective backface-visibility transition transition-property transition-duration transition-timing-function visibility z-index top right bottom left box-sizing cursor').split(' '));
const VALUE_WORDS = new Set(('none auto normal inherit initial unset block inline inline-block flex inline-flex grid inline-grid table table-row table-cell list-item contents absolute relative static sticky hidden visible scroll clip border-box content-box row column row-reverse column-reverse wrap nowrap wrap-reverse start end center stretch baseline space-between space-around space-evenly left right top bottom both bold bolder lighter italic solid dashed dotted double transparent currentcolor black white red green blue yellow gray grey pink purple orange teal navy silver maroon olive aqua lime fuchsia rebeccapurple serif sans-serif monospace cursive fantasy system-ui min-content max-content fit-content subgrid repeat minmax calc clamp min max rgb rgba hsl hsla linear-gradient radial-gradient repeating-linear-gradient repeating-radial-gradient circle ellipse closest-side farthest-side closest-corner farthest-corner at to inset ease linear ease-in ease-out ease-in-out steps step-start step-end cubic-bezier all transform opacity background-color color border-color box-shadow rotate rotatex rotatey rotatez translate translatex translatey translatez translate3d scale scalex scaley scale3d skew skewx skewy perspective preserve-3d flat break-word anywhere break-all keep-all pre pre-wrap pre-line underline pointer default touch-action').split(' '));
const ID_RE = /^r\d{1,4}$/;
function failure(code, message) {
    const error = new Error(message);
    error.code = `RABBIT_MIRROR_APPEARANCE_${code}`;
    error.requestCount = 0;
    return error;
}
function safeValue(value) {
    const text = String(value || '').trim().toLowerCase();
    if (!text || text.length > 180 || /["'\\<>@{};!&]|\/\*|url\s*\(|var\s*\(|expression\s*\(/i.test(text))
        return '';
    const rest = text.replace(/#[a-f\d]{3,8}\b/gi, '')
        .replace(/(?:\d*\.\d+|\d+)(?:px|em|rem|vh|vw|dvh|dvw|svh|svw|vmin|vmax|fr|%|deg|rad|turn|ms|s)?\b/gi, '')
        .replace(/[a-z][a-z\d-]*/gi, word => VALUE_WORDS.has(word) ? '' : '?')
        .replace(/[\s(),.+*/%\-]/g, '');
    return rest ? '' : text;
}
function safeDeclarations(text) {
    const styles = {};
    for (const declaration of String(text || '').replace(/\/\*[\s\S]*?\*\//g, '').split(';').slice(0, 90)) {
        const colon = declaration.indexOf(':');
        if (colon < 0)
            continue;
        const property = declaration.slice(0, colon).trim().toLowerCase();
        const value = PROPERTIES.has(property) ? safeValue(declaration.slice(colon + 1)) : '';
        if (value)
            styles[property] = value;
    }
    return styles;
}
function validateSelector(selector) {
    const rest = selector.replace(/[.#]r\d{1,4}\b/g, '')
        .replace(/:(?:checked|not\(:checked\)|hover|focus|focus-visible|active|first-child|last-child|nth-child\(\d+\))/g, '')
        .replace(/\[(?:open|checked)\]/g, '')
        .replace(/[a-z][a-z\d-]*/g, word => TAGS.has(word) ? '' : '?')
        .replace(/[\s>+~,*]/g, '');
    return selector.length <= 200 && !rest;
}
export function extractAppearanceReference(input) {
    const raw = String(input || '');
    if (!raw.trim())
        throw failure('EMPTY', __rmT("P4O9kmfRPJig21BqDWnYvw72IHbPJJozi.Q_KgCUkcLijj1pA8UuZh5Gzh.A4btnmwRY3h"));
    if (new TextEncoder().encode(raw).byteLength > APPEARANCE_REFERENCE_INPUT_BYTES)
        throw failure('TOO_LARGE', __rmT("Vrz_eLAcvs9wnr_zmdvGYCbugOgeS5Z9frHoHqiF_MXs_ON5SBrOVYf1giSgF5Axvhj9vvsHIXYobh"));
    const names = new Map();
    const rename = name => { if (!names.has(name))
        names.set(name, `r${names.size + 1}`); return names.get(name); };
    const stylesheets = [];
    let source = raw.replace(/<!--[\s\S]*?(?:-->|$)/g, '')
        .replace(/<(script|iframe|object|embed|svg|math|textarea|noscript)\b[^>]*>[\s\S]*?(?:<\/\1\s*>|$)/gi, '')
        .replace(/<style\b[^>]*>([\s\S]*?)(?:<\/style\s*>|$)/gi, (_, css) => { stylesheets.push(css); return ''; });
    const nodes = [], stack = [];
    const tokens = source.matchAll(/<\/?([a-z][a-z\d-]*)\b((?:[^<>"']|"[^"]*"|'[^']*')*)>/gi);
    for (const token of tokens) {
        const tag = token[1].toLowerCase();
        if (!TAGS.has(tag))
            continue;
        if (token[0].startsWith('</')) {
            const index = stack.map(item => item.tag).lastIndexOf(tag);
            if (index >= 0)
                stack.length = index;
            continue;
        }
        if (nodes.length >= 100 || stack.length > 24)
            continue;
        const attributes = {};
        for (const attr of token[2].matchAll(/([^\s=/'"<>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
            attributes[attr[1].toLowerCase()] = attr[2] ?? attr[3] ?? attr[4] ?? '';
        }
        const node = { tag, parent: stack.length ? stack[stack.length - 1].index : -1 };
        if (attributes.id)
            node.id = rename(attributes.id);
        if (attributes.class)
            node.classes = attributes.class.split(/\s+/).filter(Boolean).slice(0, 6).map(rename);
        if (tag === 'label' && attributes.for)
            node.for = rename(attributes.for);
        if (tag === 'input') {
            node.type = ['checkbox', 'radio', 'range', 'button'].includes(attributes.type) ? attributes.type : 'text';
            if (attributes.name)
                node.group = rename(attributes.name);
            if ('checked' in attributes)
                node.checked = true;
        }
        if (tag === 'details' && 'open' in attributes)
            node.open = true;
        const style = safeDeclarations(attributes.style);
        if (Object.keys(style).length)
            node.style = style;
        if (JSON.stringify({ nodes: [...nodes, node], rules: [] }).length > APPEARANCE_REFERENCE_MAX_CHARS - 2000)
            break;
        nodes.push(node);
        if (!VOID_TAGS.has(tag) && !/\/\s*>$/.test(token[0]))
            stack.push({ tag, index: nodes.length - 1 });
    }
    source = '';
    if (!nodes.length)
        throw failure('NO_STRUCTURE', __rmT("6uYjWS0e3YeBo9w0wYaHux2Dlou1D6tJzfwg2AechjR4rwuFyPYh383ihgafezkC"));
    const rules = [];
    for (let css of stylesheets) {
        css = css.replace(/\/\*[\s\S]*?\*\//g, '');
        let start = 0, depth = 0, open = -1;
        for (let i = 0; i < css.length && rules.length < 36; i++) {
            if (css[i] === '{') {
                if (!depth)
                    open = i;
                depth++;
            }
            else if (css[i] === '}') {
                if (!depth) {
                    start = i + 1;
                    continue;
                }
                depth--;
                if (depth)
                    continue;
                const rawSelector = css.slice(start, open).trim();
                const body = css.slice(open + 1, i);
                start = i + 1;
                if (rawSelector.includes('@') || /[{}]/.test(body))
                    continue;
                const selector = rawSelector.replace(/[.#]([^\s.#:[\]>+~(),]+)/g, (match, name) => `${match[0]}${rename(name)}`).toLowerCase();
                const style = safeDeclarations(body);
                if (!validateSelector(selector) || !Object.keys(style).length)
                    continue;
                const rule = { selector, style };
                if (JSON.stringify({ nodes, rules: [...rules, rule] }).length <= APPEARANCE_REFERENCE_MAX_CHARS)
                    rules.push(rule);
            }
            else if (css[i] === ';' && !depth)
                start = i + 1;
        }
    }
    return Object.freeze({ reference: JSON.stringify({ nodes, rules }), nodeCount: nodes.length, ruleCount: rules.length });
}
function validateReference(reference) {
    if (typeof reference !== 'string' || reference.length > APPEARANCE_REFERENCE_MAX_CHARS)
        return false;
    let value;
    try {
        value = JSON.parse(reference);
    }
    catch {
        return false;
    }
    if (!Array.isArray(value?.nodes) || !value.nodes.length || value.nodes.length > 100 || !Array.isArray(value.rules) || value.rules.length > 36 || Object.keys(value).some(key => !['nodes', 'rules'].includes(key)))
        return false;
    const styleOK = style => style && typeof style === 'object' && !Array.isArray(style) && Object.entries(style).every(([key, item]) => PROPERTIES.has(key) && typeof item === 'string' && safeValue(item) === item);
    for (const [index, node] of value.nodes.entries()) {
        if (!node || !TAGS.has(node.tag) || !Number.isInteger(node.parent) || node.parent < -1 || node.parent >= index)
            return false;
        for (const [key, item] of Object.entries(node)) {
            if (['tag', 'parent'].includes(key))
                continue;
            if (['id', 'for', 'group'].includes(key) && typeof item === 'string' && ID_RE.test(item))
                continue;
            if (key === 'classes' && Array.isArray(item) && item.length <= 6 && item.every(name => typeof name === 'string' && ID_RE.test(name)))
                continue;
            if (key === 'type' && ['checkbox', 'radio', 'range', 'button', 'text'].includes(item))
                continue;
            if (['open', 'checked'].includes(key) && item === true)
                continue;
            if (key === 'style' && styleOK(item))
                continue;
            return false;
        }
    }
    return value.rules.every(rule => rule && Object.keys(rule).length === 2 && typeof rule.selector === 'string' && validateSelector(rule.selector) && styleOK(rule.style));
}
async function openDatabase(options = {}) {
    const factory = options.indexedDBFactory || globalThis.indexedDB;
    if (!factory?.open)
        throw failure('STORAGE_UNAVAILABLE', __rmT("Xq2ADb__7u4Syl7bFxB7ILfnjEOD3QoFKKhqha7aoQmNLwes5pGK_zh5zBG"));
    return new Promise((resolve, reject) => {
        let settled = false;
        const request = factory.open(DB_NAME, 1);
        request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE))
            request.result.createObjectStore(STORE, { keyPath: 'id' }); };
        request.onsuccess = () => {
            if (settled) {
                request.result.close();
                return;
            }
            settled = true;
            const db = request.result;
            db.onversionchange = () => db.close();
            resolve(db);
        };
        request.onerror = () => { settled = true; reject(failure('STORAGE_FAILED', __rmT("INV9b4W.FjVOG0pvzrJEMCYqn812_tFNqGINb_q.x_QClXUB8B8ybbFoC6RFYSkC"))); };
        request.onblocked = () => { settled = true; reject(failure('STORAGE_BLOCKED', __rmT("UCggBH5KgXiVrqRC3baTc0P8pkcr_nlK.94B_TOjnSFYYl2spXqBbq5X"))); };
    });
}
async function transact(mode, operation, options) {
    const db = await openDatabase(options);
    try {
        return await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, mode);
            let result;
            tx.oncomplete = () => resolve(result);
            tx.onerror = tx.onabort = () => reject(failure('STORAGE_FAILED', __rmT("UCggBH5KgXEdvAQUQssXAc3LL7kM0W4k9unKZI6WpScSur4MmSFHBW5X")));
            const request = operation(tx.objectStore(STORE));
            request.onsuccess = () => { result = request.result; };
        });
    }
    finally {
        db.close();
    }
}
export async function saveAppearanceReference(input, options = {}) {
    const extracted = extractAppearanceReference(input);
    if (!validateReference(extracted.reference))
        throw failure('INVALID', __rmT("ggdpOfxeFv.VzKNmXrsq4QQ7rXqMUBPpfnevvaHx2Yb4Dk6QIh_r7f"));
    const retainRevision = options.retainRevision ?? '';
    if (typeof retainRevision !== 'string' || (retainRevision && !/^[a-z\d-]{8,80}$/i.test(retainRevision)))
        throw failure('RETAIN_MISSING', __rmT(".1f30.twKkb3cc9KvKUzJs0bDZ2xiUD95fxwefqt8_1BGXgtD7HwUq5X"));
    const revision = globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    const db = await openDatabase(options);
    try {
        await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE, 'readwrite');
            const store = tx.objectStore(STORE);
            let validationError = null;
            tx.oncomplete = () => validationError ? reject(validationError) : resolve();
            tx.onerror = tx.onabort = () => reject(validationError || failure('STORAGE_FAILED', __rmT("UCggBH5KgXEdvAQUQssXAc3LL7kM0W4k9unKZI6WpScSur4MmSFHBW5X")));
            const read = store.get('current');
            read.onsuccess = () => {
                const record = read.result;
                const retained = retainRevision ? [record, record?.previous].find(item => item?.revision === retainRevision) : null;
                if (retainRevision && (!retained || retained.schemaVersion !== 1 || !validateReference(retained.reference))) {
                    validationError = failure('RETAIN_MISSING', __rmT("23FzAjWhWi6A4jImPStVDmlU8UDnfYCBSdvqN0eeAtt1mO6UfGGMgIkXDjiC67ZSLYpxL5Xl_vx3TnPhnmPGS8tWbF7m4PQaCDjhJYw9"));
                    tx.abort?.();
                    return;
                }
                const next = { id: 'current', schemaVersion: 1, revision, reference: extracted.reference };
                if (retained)
                    next.previous = { schemaVersion: 1, revision: retainRevision, reference: retained.reference };
                store.put(next);
            };
        });
    }
    finally {
        db.close();
    }
    return Object.freeze({ revision, chars: extracted.reference.length, nodeCount: extracted.nodeCount, ruleCount: extracted.ruleCount });
}
export async function loadAppearanceReferenceMaterial(revision, options = {}) {
    if (typeof revision !== 'string' || !/^[a-z\d-]{8,80}$/i.test(revision))
        throw failure('MISSING', __rmT("noPhaM8SdMN1YUjkVUdlqKg9A75Po3welewubovKs7PLISC6Wo.XrsVKqhrcIg2Uz5cY3h"));
    const record = await transact('readonly', store => store.get('current'), options);
    const material = [record, record?.previous].find(item => item?.revision === revision);
    if (!material)
        throw failure('MISSING', __rmT("VsUnKNZep7QlLvQV_Ig3TxE3Fvzcoj8UO5FqKGaQW4NsYVbVhHsZVD7L2oxYHNNir59HxmY4PN34xkvrXk_uX1AHsqKy.tOp1KPhfDWHDqNsrlKtgNWQPaN_2aGIejbX2A4RA3aNqgTpr1arSFPhbnw_B7lKNeb2h1R3mOHyD1G"));
    if (material.schemaVersion !== 1 || !validateReference(material.reference))
        throw failure('INVALID', __rmT("hLzx_EtZCzoGrZLcfumu91QUN.2ofT8POww3R7P.cGh2ZLh5b2lguP.cV1QolZ7oWUE"));
    return Object.freeze({ schemaVersion: 1, revision, reference: material.reference });
}
export function assertAppearanceReferenceCurrent(expected, settings) {
    if (!expected?.enabled)
        return;
    if (settings?.appearanceReferenceEnabled !== true || settings?.appearanceReferenceRevision !== expected.revision) {
        throw failure('STALE', __rmT("nVQPAgGGG4bH7YUQDNppfEZ0rnb3H6hoF2xwC5Wi6O1ZgBa4.k85c15bszYx7hSeCXM8M4L7oZtjwDfZkJHE3ZHmWAT"));
    }
}
