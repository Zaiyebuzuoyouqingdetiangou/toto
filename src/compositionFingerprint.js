// Read-only observations of a completed face. Colours, prose, generated IDs and
// class names are selectors, never fingerprint identity. No output gate/repair.
export const VISUAL_SKELETON_MAX_CHARS = 640;

export const COMPOSITION_LABELS = Object.freeze({
    scene_above_text: '上画下文：独立画区在前，正文另置其下',
    text_above_scene: '上文下画：正文在前，独立画区另置其后',
    scene_beside_text: '画文并排：独立画区与正文分栏',
    separate_scene_text: '独立画区与外置正文分区（响应式方向不确定）',
    text_panel_switch: '同位置文字面板切换',
    text_disclosure_stack: '同构文字条目逐项折叠展开',
    object_state_change: '控件作用于画面或物件状态',
});

// A multi-face completion is one generation round. Legacy records lacking a
// batch key each count as one round; unknown records still consume recency.
export function recentDiversityRecords(history, rounds = 5) {
    const records = Array.isArray(history) ? history : [];
    const keys = new Set(), result = [], span = Math.max(1, Number(rounds) || 5);
    for (let index = records.length - 1; index >= 0; index--) {
        const record = records[index];
        const key = record?.diversityRound || record?.batchId || `legacy:${index}`;
        if (!keys.has(key) && keys.size >= span) continue;
        keys.add(key); result.unshift(record);
    }
    return result;
}

const OMIT = 'style,script,template,summary,label,button,input,select,textarea,rm-think,rm-ticket,[data-rabbit-mirror-tool-entry-host],[data-rm-tool-storage]';
const CONTROL = 'label,button,input,select,textarea';
const GEOMETRY = /^(?:display|position|float|order|flex-direction|flex-wrap|grid-template-columns|grid-template-areas|grid-area|width|height|min-height|aspect-ratio)$/;
const STATE = /:checked|:target|\[open\]/;
const REVEAL = /^(?:display|visibility|opacity|max-height|height|grid-template-rows|clip-path|transform)$/;
const VISUAL_CHANGE = /^(?:transform|translate|rotate|scale|opacity|visibility|display|clip-path|mask|d|width|height|left|right|top|bottom|animation)$/;

function query(root, selector) {
    try { return [...root.querySelectorAll(selector)]; } catch { return []; }
}
function matches(node, selector) {
    try { return !!node?.matches?.(selector); } catch { return false; }
}
function splitSelectors(source) {
    const result = []; let start = 0, depth = 0, quote = '', escaped = false;
    for (let i = 0; i < source.length; i++) {
        const c = source[i];
        if (escaped) { escaped = false; continue; }
        if (c === '\\') { escaped = true; continue; }
        if (quote) { if (c === quote) quote = ''; continue; }
        if (c === '"' || c === "'") { quote = c; continue; }
        if (c === '(' || c === '[') depth++;
        if (c === ')' || c === ']') depth--;
        if (c === ',' && depth === 0) { result.push(source.slice(start, i).trim()); start = i + 1; }
    }
    result.push(source.slice(start).trim()); return result.filter(Boolean);
}
function declarations(text) {
    const values = {};
    String(text || '').replace(/(?:^|;)\s*([\w-]+)\s*:\s*([^;{}]+)/g, (_all, key, value) => {
        values[key.toLowerCase()] = value.trim().replace(/\s*!important\s*$/i, '').toLowerCase(); return _all;
    });
    return values;
}
function localRules(root) {
    const result = [];
    function walk(css, conditional = false, depth = 0) {
        if (depth > 8 || result.length >= 600) return;
        let start = 0, open = -1, level = 0, quote = '', escaped = false;
        for (let i = 0; i < css.length; i++) {
            const c = css[i];
            if (escaped) { escaped = false; continue; }
            if (c === '\\') { escaped = true; continue; }
            if (quote) { if (c === quote) quote = ''; continue; }
            if (c === '"' || c === "'") { quote = c; continue; }
            if (c === '{') { if (level++ === 0) open = i; }
            if (c !== '}' || --level !== 0 || open < 0) continue;
            const header = css.slice(start, open).trim(), body = css.slice(open + 1, i);
            if (/^@(?:media|supports|container|layer)\b/i.test(header)) walk(body, conditional || !/^@layer\b/i.test(header), depth + 1);
            else if (!header.startsWith('@')) for (const selector of splitSelectors(header)) {
                if (result.length >= 600) break;
                result.push({ selector, values: declarations(body), conditional });
            }
            start = i + 1;
        }
    }
    for (const style of query(root, 'style').slice(0, 20)) walk(String(style.textContent || '').slice(0, 160000).replace(/\/\*[\s\S]*?\*\//g, ''));
    return result;
}

export function detectCompositionFingerprint(root) {
    if (!root?.querySelectorAll) return {};
    const nodes = [root, ...query(root, '*')];
    // Bound work, not artwork acceptance. Unrecognised/large faces still render.
    if (nodes.length > 600) return {};
    const rules = localRules(root);
    if (rules.length >= 600 || query(root, 'style').length > 20 || query(root, 'style').some(node => String(node.textContent || '').length > 160000)) return {};
    const styles = new Map(), textCache = new Map(), drawingCache = new Map();
    const ignored = node => matches(node, OMIT) || !!node?.closest?.('[data-rabbit-mirror-tool-entry-host],[data-rm-tool-storage]');
    const style = node => {
        if (styles.has(node)) return styles.get(node);
        const value = {};
        for (const rule of rules) if (!rule.conditional && !STATE.test(rule.selector) && !/::|:(?:hover|focus|active|has)\b/.test(rule.selector) && matches(node, rule.selector)) Object.assign(value, rule.values);
        Object.assign(value, declarations(node?.getAttribute?.('style'))); styles.set(node, value); return value;
    };
    const text = node => {
        if (textCache.has(node)) return textCache.get(node);
        let value = String(node?.textContent || '');
        for (const child of query(node, `${OMIT},svg`)) {
            if (!child.parentElement?.closest?.(`${OMIT},svg`) || child.parentElement === node) value = value.replace(String(child.textContent || ''), '');
        }
        value = value.replace(/\s+/g, '').trim(); textCache.set(node, value); return value;
    };
    const drawingLeaf = node => {
        if (ignored(node)) return false;
        const tag = String(node.tagName || '').toLowerCase(), s = style(node);
        if (node.getAttribute?.('data-rm-visual-scenery') === 'true' && !!(s.height || s['min-height'] || s['aspect-ratio']) && text(node).length < 40 && !!(s.background || s['background-color'] || s['background-image'])) return true;
        if (['svg', 'img', 'canvas', 'video'].includes(tag)) {
            const box = String(node.getAttribute('viewBox') || '').split(/[ ,]+/).map(Number);
            const w = parseFloat(s.width || node.getAttribute('width')) || box[2] || 0;
            const h = parseFloat(s.height || node.getAttribute('height')) || box[3] || 0;
            return w >= 80 && h >= 50;
        }
        return s.position === 'absolute' && !!(s.width && s.height) && Math.max(parseFloat(s.width) || 0, parseFloat(s.height) || 0) >= 40 && !text(node) && !!(s.background || s['background-color'] || s.border || s['clip-path']);
    };
    const hasDrawing = node => {
        if (!drawingCache.has(node)) drawingCache.set(node, drawingLeaf(node) || query(node, '*').some(drawingLeaf));
        return drawingCache.get(node);
    };
    const drawingStateTarget = node => {
        if (hasDrawing(node)) return true;
        const svg = node?.closest?.('svg');
        if (!svg || !drawingLeaf(svg) || node.closest?.('defs,clipPath,mask,pattern,marker,symbol')) return false;
        const shapes = 'path,rect,circle,ellipse,line,polyline,polygon,use';
        return matches(node, shapes) || (matches(node, 'g') && query(node, shapes).length > 0);
    };
    const prose = node => !ignored(node) && !hasDrawing(node) && !!text(node) &&
        (matches(node, 'p,article,blockquote,table,ul,ol') || query(node, 'p,article,blockquote,table,ul,ol').length > 0 || text(node).length >= 40);
    const scenes = nodes.filter(node => {
        if (ignored(node) || !hasDrawing(node)) return false;
        if (matches(node, 'svg,img,canvas,video')) return drawingLeaf(node);
        const s = style(node);
        return (s.position === 'relative' || node.getAttribute?.('data-rm-visual-scenery') === 'true') &&
            !!(s.height || s['min-height'] || s['aspect-ratio']) && ![...(node.children || [])].some(prose);
    });
    const result = {};
    for (const scene of scenes) {
        let branch = scene;
        for (let parent = branch.parentElement; parent && nodes.includes(parent); branch = parent, parent = parent.parentElement) {
            // A container mixing a drawing and external prose is not itself a
            // drawing branch on the next level.
            if (branch !== scene && [...(branch.children || [])].some(prose)) break;
            const peers = [...parent.children].filter(node => !ignored(node));
            const content = peers.find(node => node !== branch && prose(node));
            if (!content) continue;
            const a = style(branch), b = style(content), p = style(parent);
            if ([a.position, b.position].some(v => v === 'absolute' || v === 'fixed') || a.float || b.float || a.order || b.order || a['grid-area'] || b['grid-area']) break;
            const conditional = rules.some(rule => rule.conditional && [parent, branch, content].some(node => matches(node, rule.selector)) && Object.keys(rule.values).some(key => GEOMETRY.test(key)));
            if (conditional || p['grid-template-areas'] || (p.display === 'grid' && !/^(?:1fr|100%)$/.test(p['grid-template-columns'] || ''))) result.layout_family = 'separate_scene_text';
            else if (p.display === 'flex' && !/^column/.test(p['flex-direction'] || '')) result.layout_family = p['flex-wrap'] && p['flex-wrap'] !== 'nowrap' ? 'separate_scene_text' : 'scene_beside_text';
            else {
                const first = peers.indexOf(branch) < peers.indexOf(content);
                result.layout_family = first !== (p['flex-direction'] === 'column-reverse') ? 'scene_above_text' : 'text_above_scene';
            }
            break;
        }
        if (result.layout_family) break;
    }

    const textTargets = new Set(), controls = new Set(); let visualState = false, uncertainState = false;
    for (const rule of rules) {
        if (!STATE.test(rule.selector)) continue;
        let neutral = rule.selector, sources = [];
        const has = neutral.match(/:has\(([^()]*)\:checked\)/);
        if (has) { sources = query(root, has[1]); neutral = neutral.replace(has[0], ''); }
        else if (/:checked/.test(neutral)) {
            if (/:not\([^)]*:checked/.test(neutral)) continue; // reset rule
            sources = query(root, neutral.split(':checked')[0]); neutral = neutral.replace(/:checked/g, '');
        } else if (/:target/.test(neutral)) {
            neutral = neutral.replace(/:target/g, ''); sources = query(root, 'a[href]');
        } else continue; // native disclosures are inspected structurally below
        const targets = query(root, neutral.replace(/::(?:before|after)\b/g, ''));
        if (/:target/.test(rule.selector)) sources = sources.filter(link => targets.some(target => target.id && link.getAttribute('href') === `#${target.id}`));
        if (!sources.length || !targets.length) { uncertainState = true; continue; }
        for (const target of targets) {
            if (ignored(target) || matches(target, CONTROL)) continue;
            if (drawingStateTarget(target) && Object.keys(rule.values).some(key => VISUAL_CHANGE.test(key) && rule.values[key] !== (style(target)[key] || (key === 'opacity' ? '1' : '')))) visualState = true;
            else if (prose(target) && Object.keys(rule.values).some(key => REVEAL.test(key))) {
                textTargets.add(target); sources.forEach(source => controls.add(source));
            }
        }
    }
    if (visualState) result.operation_family = 'object_state_change';
    else if (!uncertainState && controls.size >= 2 && textTargets.size >= 2) {
        const sources = [...controls];
        const type = node => String(node.getAttribute?.('type') || '').toLowerCase();
        const name = sources[0].getAttribute?.('name');
        const sameForm = sources.every(node => node.closest?.('form') === sources[0].closest?.('form'));
        const exclusiveRadios = !!name && sameForm && sources.every(node => type(node) === 'radio' && node.getAttribute?.('name') === name);
        const exclusiveTargets = sources.every(node => matches(node, 'a[href]'));
        const separateDisclosures = sources.every(node => type(node) === 'checkbox') && [...textTargets].every(node => {
            const s = style(node);
            return !['absolute', 'fixed'].includes(s.position) && !s['grid-area'];
        });
        if (exclusiveRadios || exclusiveTargets) result.operation_family = 'text_panel_switch';
        else if (separateDisclosures) result.operation_family = 'text_disclosure_stack';
    }
    if (!result.operation_family) {
        for (const parent of nodes) {
            const details = [...(parent.children || [])].filter(node => matches(node, 'details'));
            if (details.length < 2) continue;
            if (details.every(node => query(node, 'summary').length && !hasDrawing(node) && prose(node))) {
                result.operation_family = 'text_disclosure_stack'; break;
            }
        }
    }
    return result;
}
