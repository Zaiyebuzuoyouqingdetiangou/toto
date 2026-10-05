// Read-only observations of a completed face. Colours, prose, generated IDs and
// class names are selectors, never fingerprint identity. No output gate/repair.
export const VISUAL_SKELETON_MAX_CHARS = 640;

export const COMPOSITION_LABELS = Object.freeze({
    scene_above_text: '上画下文：独立画区在前，正文另置其下',
    text_above_scene: '上文下画：正文在前，独立画区另置其后',
    scene_beside_text: '画文并排：独立画区与正文分栏',
    separate_scene_text: '独立画区与外置正文分区（响应式方向不确定）',
    text_panel_switch: '同位置文字面板切换',
    text_disclosure_stack: '展开／收起文字',
    object_state_change: '控件作用于画面或物件状态',
});

const OPERATION_FAMILIES = ['text_panel_switch', 'text_disclosure_stack', 'object_state_change'];

// Structural observations and legacy recipes are separate evidence. A coarse
// radio label or an unused recipe must never imply a text-only operation.
export function observedOperationFamiliesFor(record) {
    if (record?.presentationMode === 'text' || record?.pureOrder === true) return [];
    const values = [];
    for (const part of String(record?.visualSkeleton || '').split('；')) {
        const match = part.match(/^\s*operation_famil(?:y|ies)\s*:\s*(.*?)\s*$/);
        if (match) values.push(...match[1].split(',').map(value => value.trim()));
    }
    return OPERATION_FAMILIES.filter(value => values.includes(value));
}

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
function visualStateValue(key, value) {
    const text = String(value || '').trim().toLowerCase();
    if (key === 'opacity') return text || '1';
    if (!['transform', 'translate', 'rotate', 'scale'].includes(key)) return text;
    if (!text || text === 'none') return 'none';
    // Only normalise default identities; do not infer matrices or motion size.
    const parts = text.split(/\s+/);
    const zero = /^[+-]?(?:0+(?:\.0*)?|\.0+)(?:[a-z]+|%)?$/;
    if (key === 'translate' && parts.length <= 3 && parts.every(part => zero.test(part))) return 'none';
    if (key === 'rotate' && parts.length === 1 && zero.test(text)) return 'none';
    if (key === 'scale' && parts.length <= 3 && parts.every(part => /^\+?1(?:\.0*)?$/.test(part))) return 'none';
    return text;
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

function checkedRoute(root, selector) {
    if (/:not\([^)]*:checked/.test(selector)) return null; // reset, not another entry
    const requirements = [];
    const collect = text => {
        for (const match of text.matchAll(/:checked\b/g)) {
            requirements.push(query(root, text.slice(0, match.index).replace(/:checked\b/g, '').trim()));
        }
        return text.replace(/:checked\b/g, '');
    };
    let neutral = selector.replace(/:has\(([^()]*)\)/g, (all, content) => {
        if (!/:checked\b/.test(content)) return all;
        collect(content); return '';
    });
    // Retain every conjunct. An unsupported nested :has or a missing required
    // control is unknown; never salvage just its first checked condition.
    if (/:has\(/.test(neutral)) return null;
    neutral = collect(neutral);
    if (!requirements.length || requirements.some(items => !items.length)) return null;
    const sources = [...new Set(requirements.flat())];
    const forced = requirements.filter(items => items.length === 1).map(items => items[0]);
    if (forced.some((source, index) => matches(source, 'input[type="radio"]') && source.name
        && forced.slice(index + 1).some(other => other !== source && matches(other, 'input[type="radio"]')
            && other.name === source.name && other.closest?.('form') === source.closest?.('form')))) return null;
    return { sources, targets: query(root, neutral.replace(/::(?:before|after)\b/g, '')), conjunctive: requirements.length > 1 };
}

export function detectCompositionFingerprint(root) {
    if (!root?.querySelectorAll) return {};
    const nodes = [root, ...query(root, '*')];
    // Bound work, not artwork acceptance. Unrecognised/large faces still render.
    if (nodes.length > 600) return {};
    const rules = localRules(root);
    if (rules.length >= 600 || query(root, 'style').length > 20 || query(root, 'style').some(node => String(node.textContent || '').length > 160000)) return {};
    const styles = new Map(), textCache = new Map(), drawingCache = new Map();
    const ignored = node => matches(node, OMIT) || !!node?.closest?.(CONTROL) || !!node?.closest?.('[data-rabbit-mirror-tool-entry-host],[data-rm-tool-storage]');
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

    const groups = new Map(), radioGroups = [], operations = new Set();
    const controlGroup = source => {
        if (matches(source, 'a[href]')) return 'anchors';
        if (!matches(source, 'input[type="radio"]') || !source.getAttribute('name')) return source;
        const name = source.getAttribute('name'), form = source.closest?.('form');
        let group = radioGroups.find(item => item.name === name && item.form === form);
        if (!group) { group = { name, form }; radioGroups.push(group); }
        return group;
    };
    const visualBaseline = (target, key, next) => {
        const current = style(target)[key];
        // Rendered exports can contain the runtime's active inline branch. Its
        // marked, matching override is not the authored resting state.
        if (target.getAttribute?.('data-rm-labeled-checked-verify-target') !== 'true'
            || visualStateValue(key, declarations(target.getAttribute?.('style'))[key]) !== visualStateValue(key, next)) return current;
        let baseline;
        for (const rule of rules) if (!rule.conditional && !STATE.test(rule.selector)
            && !/::|:(?:hover|focus|active|has)\b/.test(rule.selector) && matches(target, rule.selector)
            && Object.hasOwn(rule.values, key)) baseline = rule.values[key];
        return baseline;
    };
    // A label may own both a short trigger and an independently hidden result.
    // Keep ignoring the trigger/selection decoration; inspect only a bound,
    // substantial text result with explicit hidden -> visible CSS evidence.
    const labelTextResult = (target, values, sources) => {
        const label = target.closest?.('label');
        if (!label || label === target || matches(target, CONTROL)
            || target.closest?.('button,summary,[data-rabbit-mirror-tool-entry-host],[data-rm-tool-storage]')
            || text(target).length < 40 || query(target, 'svg,img,canvas,video,input,button,select,textarea').length) return false;
        if (!sources.some(source => label.contains(source) || (source.id && label.getAttribute('for') === source.id))) return false;
        const baseline = style(target);
        if (['absolute', 'fixed'].includes(baseline.position) || baseline['grid-area']) return false;
        return (visualBaseline(target, 'display', values.display) === 'none' && !!values.display && values.display !== 'none')
            || (visualBaseline(target, 'visibility', values.visibility) === 'hidden' && values.visibility === 'visible')
            || (visualBaseline(target, 'opacity', values.opacity) === '0' && Number(values.opacity) > 0);
    };
    for (const rule of rules) {
        if (!STATE.test(rule.selector)) continue;
        let sources = [], targets = [], conjunctive = false;
        if (/:checked/.test(rule.selector)) {
            const route = checkedRoute(root, rule.selector);
            if (!route) continue;
            ({ sources, targets, conjunctive } = route);
        } else if (/:target/.test(rule.selector)) {
            targets = query(root, rule.selector.replace(/:target/g, '').replace(/::(?:before|after)\b/g, ''));
            sources = query(root, 'a[href]').filter(link => targets.some(target => target.id && link.getAttribute('href') === `#${target.id}`));
        } else continue; // native disclosures are inspected structurally below
        // A broken/decorative rule contributes no evidence of its own; it does
        // not erase a separate, fully bound operation elsewhere in the face.
        if (!sources.length || !targets.length || rule.conditional) continue;
        const keys = [...new Set(sources.map(controlGroup))];
        // Mixed conjunctive controls remain one unresolved condition, rather
        // than being split into independently usable entries.
        if (keys.length > 1 && conjunctive) continue;
        const affected = keys.map(key => {
            if (!groups.has(key)) groups.set(key, { sources: new Set(), textTargets: new Set(), labelTextTargets: new Set(), mixedTargets: new Set(), visual: false });
            const group = groups.get(key);
            sources.filter(source => controlGroup(source) === key).forEach(source => group.sources.add(source));
            return group;
        });
        for (const target of targets) {
            if (labelTextResult(target, rule.values, sources)) {
                affected.forEach(group => group.labelTextTargets.add(target));
                continue;
            }
            if (ignored(target) || matches(target, CONTROL)) continue;
            const changed = Object.keys(rule.values).filter(key => VISUAL_CHANGE.test(key)
                && visualStateValue(key, rule.values[key]) !== visualStateValue(key, visualBaseline(target, key, rule.values[key])));
            if (drawingStateTarget(target) && changed.length) {
                // An illustrated page among ordinary prose pages is still a
                // page. Moving its drawing itself remains an object operation.
                const mixedPage = changed.every(key => /^(?:display|visibility|opacity)$/.test(key))
                    && [...(target.children || [])].some(prose);
                affected.forEach(group => { if (mixedPage) group.mixedTargets.add(target); else group.visual = true; });
            }
            else if (prose(target) && Object.keys(rule.values).some(key => REVEAL.test(key))) {
                affected.forEach(group => group.textTargets.add(target));
            }
        }
    }
    for (const group of groups.values()) {
        if (group.mixedTargets.size) {
            const proseRadioGroup = group.textTargets.size >= 2
                && [...group.sources].every(source => matches(source, 'input[type="radio"]') && source.getAttribute('name'));
            if (proseRadioGroup) group.mixedTargets.forEach(target => group.textTargets.add(target));
            else group.visual = true;
        }
        if (group.visual) { operations.add('object_state_change'); continue; }
        // Results inside separate normal-flow labels open locally, not in one
        // shared panel. Preserve that distinction even for exclusive radios.
        if (group.labelTextTargets.size) operations.add('text_disclosure_stack');
        const { sources: controls, textTargets } = group;
        if (!controls.size || !textTargets.size) continue;
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
        if (controls.size >= 2 && textTargets.size >= 2 && (exclusiveRadios || exclusiveTargets)) operations.add('text_panel_switch');
        else if (separateDisclosures) operations.add('text_disclosure_stack');
    }
    {
        // The protocol/title fold is not an interaction inside the artwork.
        const outerDetails = matches(root, 'details') ? root : query(root, 'details')[0];
        for (const parent of nodes) {
            const details = [...(parent.children || [])].filter(node => node !== outerDetails && matches(node, 'details'));
            if (!details.length) continue;
            if (details.every(node => query(node, 'summary').length && !hasDrawing(node) && prose(node))) {
                operations.add('text_disclosure_stack'); break;
            }
        }
    }
    const observed = OPERATION_FAMILIES.filter(value => operations.has(value));
    if (observed.length) result.operation_family = operations.has('object_state_change') ? 'object_state_change' : observed[0];
    if (observed.length > 1) result.operation_families = observed.join(',');
    return result;
}
