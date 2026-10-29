import { rmT as __rmT, rmR as __rmR } from "./textTable.js?rmv=2.0.1";
import { layoutRect } from './faceZoomMetrics.js?rmv=2.0.1';
import { clamp, luminanceFromRgb, classifyPaletteSamples } from './paletteObservation.js?rmv=2.0.1';
import { activeRoleColorHtml, bindRolePaletteCode } from './roleColorVariants.js?rmv=2.0.1';
import { detectCompositionFingerprint, VISUAL_SKELETON_MAX_CHARS } from './compositionFingerprint.js?rmv=2.0.1';
import { visualSceneryEnabled } from './presentationMode.js?rmv=2.0.1';
import { presentationModeFields } from './presentationMode.js?rmv=2.0.1';
import { getCurrentChatKey, commitFollowVisualHistory, bindVisualHistoryTarget, updateLatestVisualSignature, visualHistoryTarget } from './storage.js?rmv=2.0.1';
import { restoreRabbitMirrorAvatarClone } from './chatAvatars.js?rmv=2.0.1';
import { consumeInjectedFeedbackForSuccessfulRabbitMirror } from './feedbackCat.js?rmv=2.0.1';
import { getSettings } from './settings.js?rmv=2.0.1';
import { applyRabbitMirrorBannedWordsToDom } from './bannedWords.js?rmv=2.0.1';
import { commitRabbitMirrorFollowBatch, getRabbitMirrorFollowSingleOwner, commitRabbitMirrorFollowSingle, captureRabbitMirrorGenerationSnapshots, getRabbitMirrorGenerationSnapshot, getRabbitMirrorFollowBatchSources, getRabbitMirrorFollowBatchTargetIndexes, inspectRabbitMirrorGenerationSource, releaseRabbitMirrorFollowBatch, releaseRabbitMirrorFollowBatchAtMessage, } from './generationGuard.js?rmv=2.0.1';
import { clearSanitizedRabbitMirrorFaceProof, getSanitizedRabbitMirrorFaceProof, markSanitizedRabbitMirrorFace, rabbitMirrorMultifaceSourceHash, rabbitMirrorMessageSourceHash } from './multifaceProof.js?rmv=2.0.1';
import { detectMissingVisualProgram } from './presentationQuality.js?rmv=2.0.1';
import { createMultifaceFailureSlot, MULTIFACE_FAILURE_ATTR, parseMultifaceOutput } from './multifaceProtocol.js?rmv=2.0.1';
import { saveFollowPartialResult, readFollowPartialResult } from './followPartialResults.js?rmv=2.0.1';
import { markFreshDrawSlot, isFreshDrawSlot } from './freshDrawSlots.js?rmv=2.0.1';
import { PRESENTATION_FORMATS } from '../data/structured/presentationIndex.js?rmv=2.0.1';
export const FOLLOW_MULTIFACE_COMMITTED_EVENT = 'rabbit-mirror:follow-multiface-committed';
export const FOLLOW_MULTIFACE_REJECTED_EVENT = 'rabbit-mirror:follow-multiface-rejected';
export const FOLLOW_GENERATION_SETTLED_EVENT = 'rabbit-mirror:follow-generation-settled';
const TOTO_RE = new RegExp('<toto\\b[^>]*(?:data-rabbit-mirror|data-rabbit-' + 'h' + 'ole)=[\"\']true[\"\'][^>]*>[\\s\\S]*?<\\/toto>', 'i');
let lastScannedHash = '';
let lastScanAttempts = 0;
let visualScannerSubscriptions = [];
let visualScannerTimers = new Set();
let visualScannerCaptureTimer = 0;
const followBatchScanAttempts = new Map();
const terminalFollowMessageIndexes = new Set();
const followBatchScansInFlight = new Set();
const pendingFollowDraws = new Map();
const rejectedFollowBatches = new Map();
const followPartialStorageWarnings = new Set();
let followBatchSanitizerModulePromise = null;
let visualScannerLifecycle = 0;
function hashText(text) {
    let hash = 0;
    const input = String(text || '');
    for (let i = 0; i < input.length; i += 1) {
        hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0;
    }
    return String(hash);
}
function stripTags(html) {
    return String(html || '')
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
function count(re, text) {
    return (String(text || '').match(re) || []).length;
}
function extractStyleFingerprints(html) {
    const styles = [...String(html || '').matchAll(/<([a-z0-9-]+)\b[^>]*\sstyle=["']([^"']+)["'][^>]*>/gi)];
    const normalized = styles.map(match => {
        const tag = match[1].toLowerCase();
        const props = match[2]
            .toLowerCase()
            .split(';')
            .map(part => part.trim().split(':')[0])
            .filter(Boolean)
            .sort()
            .join('|');
        return `${tag}:${props}`;
    }).filter(Boolean);
    const buckets = new Map();
    for (const item of normalized)
        buckets.set(item, (buckets.get(item) || 0) + 1);
    const repeated = [...buckets.values()].filter(v => v >= 3).length;
    const maxRepeat = Math.max(0, ...buckets.values());
    return { repeated, maxRepeat };
}
function parseToto(html) {
    try {
        if (typeof DOMParser === 'undefined')
            return null;
        const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
        const legacyAttr = 'data-rabbit-' + 'h' + 'ole';
        return doc.querySelector(`toto[data-rabbit-mirror="true"], toto[${legacyAttr}="true"]`) || doc.querySelector('toto');
    }
    catch {
        return null;
    }
}
function elementDepth(el) {
    if (!el || !el.children || !el.children.length)
        return 0;
    return 1 + Math.max(...[...el.children].map(child => elementDepth(child)));
}
function stylePropSet(el) {
    const style = (el?.getAttribute?.('style') || '').toLowerCase();
    return new Set(style.split(';').map(part => part.trim().split(':')[0]).filter(Boolean));
}
function setOverlapRatio(a, b) {
    if (!a.size && !b.size)
        return 1;
    let hit = 0;
    for (const item of a)
        if (b.has(item))
            hit += 1;
    return hit / Math.max(1, Math.min(a.size, b.size));
}
function areSimilarBlocks(a, b) {
    if (!a || !b || a.nodeType !== 1 || b.nodeType !== 1)
        return false;
    const tagClose = a.tagName === b.tagName;
    const childClose = Math.abs(a.children.length - b.children.length) <= 1;
    const depthClose = Math.abs(elementDepth(a) - elementDepth(b)) <= 1;
    const styleClose = setOverlapRatio(stylePropSet(a), stylePropSet(b)) >= 0.45;
    const textA = (a.textContent || '').trim().length;
    const textB = (b.textContent || '').trim().length;
    const textClose = Math.abs(textA - textB) <= Math.max(60, Math.max(textA, textB) * 0.45);
    return tagClose && childClose && depthClose && (styleClose || textClose);
}
function analyzeDomStructure(html) {
    const toto = parseToto(html);
    if (!toto)
        return { maxSimilarRun: 0, summaryLength: 0, summaryFlags: [] };
    const summary = toto.querySelector('summary');
    const summaryLength = (summary?.textContent || '').replace(/\s+/g, '').length;
    const summaryFlags = [];
    if (summaryLength > 80)
        summaryFlags.push(__rmT("u9_5YPIXB3O5cfzn2BOiRJiinibatJmEb.IgchefViA"));
    else if (summaryLength > 60)
        summaryFlags.push(__rmT("XkeXTf8QTteiGQJjHzyxLJqTSqxZxLJX"));
    else if (summaryLength > 40)
        summaryFlags.push(__rmT("jMh0YDh7QIQyBOnGe2hSf1CoA8y6wf"));
    let maxSimilarRun = 0;
    const containers = [toto, ...[...toto.querySelectorAll('details, div, section, article, main')].slice(0, 80)];
    for (const container of containers) {
        const children = [...container.children].filter(el => !['SUMMARY', 'STYLE', 'SCRIPT'].includes(el.tagName));
        let run = 1;
        for (let i = 1; i < children.length; i += 1) {
            if (areSimilarBlocks(children[i - 1], children[i])) {
                run += 1;
                maxSimilarRun = Math.max(maxSimilarRun, run);
            }
            else {
                run = 1;
            }
        }
    }
    return { maxSimilarRun, summaryLength, summaryFlags };
}
function textLengthBucket(len) {
    if (len < 60)
        return 'short';
    if (len < 180)
        return 'medium';
    return 'long';
}
function blockFeature(el) {
    const style = (el?.getAttribute?.('style') || '').toLowerCase();
    const text = (el?.textContent || '').replace(/\s+/g, '').trim();
    return {
        tag: el?.tagName || '',
        hasBg: /background(?:-color)?\s*:/.test(style),
        hasBorder: /border\s*:/.test(style) || /border-left\s*:/.test(style),
        hasRadius: /border-radius\s*:/.test(style),
        hasShadow: /box-shadow\s*:/.test(style),
        hasPadding: /padding\s*:/.test(style),
        hasHeading: !!el?.querySelector?.('h1,h2,h3,h4,strong,b'),
        childBucket: Math.min(4, el?.children?.length || 0),
        textBucket: textLengthBucket(text.length),
    };
}
function featureSimilarity(a, b) {
    const keys = ['tag', 'hasBg', 'hasBorder', 'hasRadius', 'hasShadow', 'hasPadding', 'hasHeading', 'childBucket', 'textBucket'];
    let same = 0;
    for (const key of keys) {
        if (a?.[key] === b?.[key])
            same += 1;
    }
    return same / keys.length;
}
function getBlockCandidates(root) {
    if (!root?.querySelectorAll)
        return [];
    return [...root.querySelectorAll('div, section, article, li')]
        .filter(el => {
        const text = (el.textContent || '').replace(/\s+/g, '').trim();
        if (text.length < 24)
            return false;
        const style = (el.getAttribute('style') || '').toLowerCase();
        const hasBoxSignal = /border\s*:|border-left\s*:|border-radius\s*:|background(?:-color)?\s*:|box-shadow\s*:|padding\s*:/.test(style);
        return hasBoxSignal;
    })
        .slice(0, 80);
}
function detectSameBlockStack(root, html = '') {
    const candidates = getBlockCandidates(root);
    if (candidates.length < 3)
        return false;
    const features = candidates.map(blockFeature);
    let similarPairs = 0;
    let totalPairs = 0;
    for (let i = 0; i < features.length; i += 1) {
        for (let j = i + 1; j < features.length; j += 1) {
            totalPairs += 1;
            if (featureSimilarity(features[i], features[j]) >= 0.72)
                similarPairs += 1;
        }
    }
    const similarRatio = totalPairs ? similarPairs / totalPairs : 0;
    const htmlText = String(html || '').toLowerCase();
    const verticalStackSignal = /flex-direction\s*:\s*column|gap\s*:|margin-bottom\s*:|<h[1-4]\b/i.test(htmlText);
    const repeatedBoxSignal = count(/border-radius\s*:/gi, htmlText) >= 3 || count(/border\s*:/gi, htmlText) >= 3 || count(/background(?:-color)?\s*:/gi, htmlText) >= 4;
    return candidates.length >= 4 && repeatedBoxSignal && (verticalStackSignal || similarRatio >= 0.55) && similarRatio >= 0.38;
}
function candidateSimilarityRatio(candidates = []) {
    if (!Array.isArray(candidates) || candidates.length < 2)
        return 0;
    const features = candidates.map(blockFeature);
    let similarPairs = 0;
    let totalPairs = 0;
    for (let i = 0; i < features.length; i += 1) {
        for (let j = i + 1; j < features.length; j += 1) {
            totalPairs += 1;
            if (featureSimilarity(features[i], features[j]) >= 0.68)
                similarPairs += 1;
        }
    }
    return totalPairs ? similarPairs / totalPairs : 0;
}
function detectSameGridCardRisk(root, html = '') {
    const text = String(html || '').toLowerCase();
    const gridSignal = /display\s*:\s*grid|grid-template|grid-template-columns|repeat\s*\(/i.test(text);
    if (!gridSignal)
        return false;
    const candidates = getBlockCandidates(root);
    if (candidates.length < 4)
        return false;
    const ratio = candidateSimilarityRatio(candidates);
    const boxSignals = count(/border\s*:/gi, text) + count(/border-radius\s*:/gi, text) + count(/background(?:-color)?\s*:/gi, text);
    return ratio >= 0.30 && boxSignals >= 8;
}
function detectCatalogPageRisk(root, html = '', plain = '') {
    const text = `${html || ''}\n${plain || ''}`;
    const catalogSignal = __rmR("UnSVVRe2eAva3ZIe9vP7l_TeaXzlVI9Cl5ZIw0ipLgw8zHJ85UPaz.bfhSzCxkbLJkJ2QmkoCW3wKGUEMUOLjwTnPDUn7KLvSbqS.Bot0ByJMWtSnW1RKcpLfBQMDNq.BDIoImmJ8YqQ6S2UoD1zk8PDw_1LprqJhLi9yZq3CLvplf", "i").test(text);
    if (!catalogSignal)
        return false;
    const candidates = getBlockCandidates(root);
    const gridSignal = /display\s*:\s*grid|grid-template|grid-template-columns|repeat\s*\(/i.test(String(html || ''));
    return candidates.length >= 4 && (gridSignal || candidateSimilarityRatio(candidates) >= 0.30);
}
function detectVisualPromiseWithoutMechanism(html = '', plain = '') {
    const text = `${html || ''}\n${plain || ''}`;
    const promisesMotion = __rmR("0Qr49Sl_8PfepfDvcOVmOw6CQvmrxMhvcy6mTX1m.IqhdLrqbCyXXf5E.vylrcJEACbN0yIDkaDtUEvE6VupP4NreKqKX3Y8mP7xeutfzqBOHl.VkIrdTIm5X1E0sMTa34KODwZfJJKQ1659oHyt31hX11E", "i").test(text);
    if (!promisesMotion)
        return false;
    const hasMechanism = /animation\s*:|@keyframes|transition\s*:|transform\s*:|<svg\b|<animate\b|<marquee\b|stroke-dasharray|offset-path/i.test(String(html || ''));
    return !hasMechanism;
}
function hasMeaningfulStateRule(html = '', statePseudo = ':checked') {
    const styles = [...String(html || '').matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]
        .map(match => match[1])
        .join('\n');
    if (!styles || !styles.toLowerCase().includes(statePseudo.toLowerCase()))
        return false;
    const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
    let match;
    while ((match = ruleRe.exec(styles))) {
        const selector = String(match[1] || '');
        if (!selector.toLowerCase().includes(statePseudo.toLowerCase()))
            continue;
        const declarations = String(match[2] || '')
            .split(';')
            .map(part => part.trim())
            .filter(Boolean)
            .map(part => {
            const colon = part.indexOf(':');
            if (colon < 0)
                return null;
            return {
                property: part.slice(0, colon).trim().toLowerCase(),
                value: part.slice(colon + 1).trim().toLowerCase(),
            };
        })
            .filter(Boolean);
        if (!declarations.length)
            continue;
        const cosmeticOnly = declarations.every(({ property, value }) => {
            if (property.startsWith('--'))
                return true;
            if (property === 'transform') {
                return !/(?:rotate[xy]|perspective)\s*\(/i.test(value);
            }
            return property === 'color'
                || property === 'background' || property.startsWith('background-')
                || property === 'border' || property.startsWith('border-')
                || property === 'box-shadow' || property === 'text-shadow'
                || property === 'outline' || property.startsWith('outline-')
                || property === 'fill' || property === 'stroke'
                || property === 'filter' || property === 'backdrop-filter'
                || property === 'cursor'
                || property === 'font-weight' || property === 'font-style'
                || property === 'text-decoration' || property === 'letter-spacing'
                || property === 'translate' || property === 'rotate' || property === 'scale'
                || property === 'transition' || property.startsWith('transition-')
                || property === 'transform-origin';
        });
        if (!cosmeticOnly)
            return true;
    }
    return false;
}
function detectEffectiveInteraction(html = '') {
    const text = String(html || '');
    const innerDetails = count(/<details\b/gi, text) >= 2 && /<summary\b/i.test(text);
    const hasCheckInput = /<input\b[^>]*type\s*=\s*["']?(?:checkbox|radio)\b/i.test(text);
    const checkedRoute = hasCheckInput && hasMeaningfulStateRule(text, ':checked');
    const targetRoute = /href\s*=\s*["']#[^"']+["']/i.test(text) && hasMeaningfulStateRule(text, ':target');
    const popoverRoute = /\bpopovertarget\s*=|\bcommandfor\s*=/i.test(text) && /\bpopover(?:\s|=|>)/i.test(text);
    const driverRoute = /\bdata-(?:rm-)?ui\s*=\s*["']?(?:effect|drag|adjust|reveal|view|input|draw|motion|hold|follow|reorder|accumulate|toggle|pick|pager|roll|connect|turn|sequence)\b/i.test(text);
    return innerDetails || checkedRoute || targetRoute || popoverRoute || driverRoute;
}
function detectInteractionSignals(html = '', plain = '') {
    const text = `${html || ''}\n${plain || ''}`;
    return __rmR("SNjw.qLzrgFpPbQ8EYb1ApZzsArNAJx5Pq1LBuRlX5i8.S6eRpJRYNsjTwfPhxZyI8IXWKwOu0HxO1yuxRIOPnI5BdUiHx2ceEdDXUYdqx4P7c9S_VgHck3hGoqGQoEVKwmRJqyfzXBd11kOjsHZEq8Chl5YscMM6rBUC0LOzpBOwXqZZrDaFzGvx6RzurdEtrpQ.gaDTU4JSkG1NJg4801u46tExWppfxBA_n8jp2AgItbMYj2TvuHTu.hhDddDnavnSNt2XffPK8WSyks", "i").test(text);
}
function interactionFamilyRecord(id = 'none', label = __rmT("nf9YUXS1eSorTROhT3_"), confidence = 0, details = {}) {
    return {
        id: String(id || 'none'),
        label: String(label || __rmT("nf9YUXS1eSorTROhT3_")),
        confidence: Math.max(0, Math.min(1, Number(confidence) || 0)),
        controlCount: Math.max(0, Number(details.controlCount) || 0),
        panelCount: Math.max(0, Number(details.panelCount) || 0),
    };
}
function labelsForControls(root, controls = []) {
    if (!root?.querySelectorAll || !controls.length)
        return [];
    const labels = new Set();
    for (const control of controls) {
        const id = String(control?.id || '').trim();
        if (id) {
            try {
                root.querySelectorAll(`label[for="${globalThis.CSS?.escape ? globalThis.CSS.escape(id) : id.replace(/["\\]/g, '\\$&')}"]`).forEach(label => labels.add(label));
            }
            catch {
                root.querySelectorAll('label').forEach(label => {
                    if (String(label.getAttribute('for') || '') === id)
                        labels.add(label);
                });
            }
        }
        const parentLabel = control?.closest?.('label');
        if (parentLabel)
            labels.add(parentLabel);
    }
    return [...labels];
}
function detectInteractionFamily(root, html = '') {
    const text = String(html || '');
    const lower = text.toLowerCase();
    const innerDetailsCount = Math.max(0, count(/<details\b/gi, text) - 1);
    const rotateFlip = /rotate[xy]\s*\(\s*(?:-?180|180deg)/i.test(text)
        && /backface-visibility|transform-style\s*:\s*preserve-3d|perspective\s*:/i.test(text);
    if (rotateFlip)
        return interactionFamilyRecord('flip_card_family', __rmT("WIDTSsT9t0HarLUH2Rp"), 0.96, { controlCount: count(/<input\b/gi, text), panelCount: 2 });
    const controls = root?.querySelectorAll
        ? [...root.querySelectorAll('input[type="radio"], input[type="checkbox"]')]
        : [];
    const radios = controls.filter(input => String(input.type || '').toLowerCase() === 'radio');
    const checkboxes = controls.filter(input => String(input.type || '').toLowerCase() === 'checkbox');
    const checkedRules = count(/:checked\b/gi, text);
    const groups = new Map();
    for (const radio of radios) {
        const key = String(radio.getAttribute('name') || '').trim() || `__ungrouped__:${radio.id || groups.size}`;
        if (!groups.has(key))
            groups.set(key, []);
        groups.get(key).push(radio);
    }
    const largestRadioGroup = [...groups.values()].sort((a, b) => b.length - a.length)[0] || [];
    const groupLabels = labelsForControls(root, largestRadioGroup);
    const sameLayerPanelSignal = /grid-area\s*:\s*1\s*\/\s*1|position\s*:\s*absolute[\s\S]{0,220}(?:opacity\s*:\s*0|visibility\s*:\s*hidden)/i.test(lower);
    const tabLanguageSignal = __rmR("yB2suKTjN3bYtWfIPhojo1AlKShP9DOjYDQxT81z5S3YSC2lwUtY29qhEW4TVcXwp7nxHB8asEUcsve9xdghIJg65GhYQ4U1BSP9t0Vzy6kCECQd_SApuFZRIgEjpuDjOd_SCAkWYsNjDmDBJcplgk", "i").test(`${lower} ${stripTags(text)}`);
    if (largestRadioGroup.length >= 3 && groupLabels.length >= 3 && checkedRules >= 3) {
        return interactionFamilyRecord('tabbed_radio_family', __rmT("MlvxSsOT12y235kF8nBbY3wEzh_"), sameLayerPanelSignal || tabLanguageSignal ? 0.99 : 0.94, {
            controlCount: largestRadioGroup.length,
            panelCount: Math.max(largestRadioGroup.length, checkedRules),
        });
    }
    if (largestRadioGroup.length >= 2 && groupLabels.length >= 2 && checkedRules >= 2 && (sameLayerPanelSignal || tabLanguageSignal)) {
        return interactionFamilyRecord('tabbed_radio_family', __rmT("MlvxSsOT12y235kF8nBbY3wEzh_"), 0.92, {
            controlCount: largestRadioGroup.length,
            panelCount: Math.max(largestRadioGroup.length, checkedRules),
        });
    }
    if (controls.length >= 3 && labelsForControls(root, controls).length >= 3 && checkedRules >= 2) {
        return interactionFamilyRecord('multi_control_panel_family', __rmT("bnncb5L27IEe6hvE_3Y"), 0.86, {
            controlCount: controls.length,
            panelCount: checkedRules,
        });
    }
    if (checkboxes.length === 1 && checkedRules >= 1) {
        return interactionFamilyRecord('checkbox_reveal_family', __rmT("R65.h8mxUgLqz2sdAM5rXk"), 0.90, { controlCount: 1, panelCount: 1 });
    }
    if (checkboxes.length >= 2 && checkedRules >= 2) {
        return interactionFamilyRecord('multi_checkbox_family', __rmT("OG5d985I6TCHmLRIfiqNTIO7"), 0.84, { controlCount: checkboxes.length, panelCount: checkedRules });
    }
    if (innerDetailsCount >= 1) {
        return interactionFamilyRecord('inner_details_family', __rmT("rBZqZmWkRZlHmLIKeoQHQyJM"), 0.88, { controlCount: innerDetailsCount, panelCount: innerDetailsCount });
    }
    if (/href\s*=\s*["']#[^"']+["']/i.test(text) && /:target\b/i.test(text)) {
        return interactionFamilyRecord('target_navigation_family', __rmT("OC4d9aF3yTBON.I3V.FP81.Z"), 0.86, { controlCount: count(/href\s*=\s*["']#/gi, text), panelCount: count(/:target\b/gi, text) });
    }
    if (/\bpopovertarget\s*=|\bcommandfor\s*=/i.test(text)) {
        return interactionFamilyRecord('popover_family', __rmT("j0DfflT9E0js1hILKyl"), 0.88, { controlCount: count(/popovertarget|commandfor/gi, text), panelCount: count(/\bpopover(?:\s|=|>)/gi, text) });
    }
    if (detectEffectiveInteraction(text)) {
        return interactionFamilyRecord('css_state_family', __rmT("Lwdk1EY7zOQsB0jG4gSnLi4dyQcLuh"), 0.58, { controlCount: controls.length, panelCount: checkedRules });
    }
    return interactionFamilyRecord();
}
function detectInteractionMissing(html = '') {
    return !detectEffectiveInteraction(html);
}
function observedRecipeIds(root, family) {
    if (!root?.querySelectorAll)
        return [];
    const ids = new Set();
    const outer = root.querySelector('details');
    if ([...root.querySelectorAll('details')].some(node => node !== outer && node.querySelector('summary')))
        ids.add('fold');
    if (family.id === 'flip_card_family')
        ids.add('flip');
    const popovers = new Set([...root.querySelectorAll('[popover]')].map(node => node.id).filter(Boolean));
    if ([...root.querySelectorAll('button[popovertarget]')].some(node => popovers.has(node.getAttribute('popovertarget'))))
        ids.add('popup');
    const contracts = {
        effect: ['trigger-effect', ['button[data-rm-fire]', '[data-rm-part]']],
        drag: ['drag-combine', ['[data-rm-item]']],
        adjust: ['continuous-adjust', ['input[type="range"]']],
        reveal: ['local-reveal', ['[data-rm-cover]']],
        view: ['viewport-explore', ['[data-rm-part]']],
        input: ['input-draw', ['input, textarea', 'output']],
        draw: ['input-draw', ['svg[data-rm-canvas]']],
        motion: ['progress-control', ['[data-rm-part]', 'button[data-rm-play], button[data-rm-reverse], input[type="range"]']],
        hold: ['hold-preview', ['[data-rm-hold]']],
        follow: ['pointer-follow', ['[data-rm-surface]']],
        reorder: ['reorder', ['[data-rm-item]']],
        accumulate: ['accumulate', ['[data-rm-step]']],
        toggle: ['flip', []],
        pick: ['scene-switch', ['[data-rm-pick]']],
        pager: ['scene-switch', ['[data-rm-page]']],
        roll: ['random-roll', ['[data-rm-roll]', '[data-rm-show]']],
        connect: ['connect-pair', ['[data-rm-end]']],
        turn: ['turn-dial', ['[data-rm-knob]']],
        sequence: ['sequence-lock', ['[data-rm-code]']],
    };
    for (const group of root.querySelectorAll('[data-rm-ui]')) {
        const type = group.getAttribute('data-rm-ui');
        const contract = Object.hasOwn(contracts, type) ? contracts[type] : null;
        if (!contract)
            continue;
        const own = selector => [...group.querySelectorAll(selector)].filter(node => node.closest('[data-rm-ui]') === group);
        if (!contract[1].every(selector => own(selector).length))
            continue;
        if (type === 'input' && !own('input, textarea').some(node => node.matches('textarea') ||
            ['', 'text', 'password'].includes(String(node.getAttribute('type') || '').toLowerCase())))
            continue;
        if (type === 'reorder' && !own('[data-rm-item]').some((item, index, items) => items.some((other, otherIndex) => index !== otherIndex && item.parentElement === other.parentElement)))
            continue;
        ids.add(contract[0]);
    }
    return [...ids];
}
function detectFakeInteraction(html = '', plain = '') {
    return !detectEffectiveInteraction(html) && detectInteractionSignals(html, plain);
}
function detectWeakSpatialComplexity(html = '', plain = '') {
    const text = String(html || '');
    const spatialSignals = count(/position\s*:\s*absolute|display\s*:\s*grid|grid-template|grid-area|transform\s*:|clip-path\s*:|mask\s*:|z-index\s*:|<svg\b|<path\b|radial-gradient|conic-gradient|repeating-gradient|aspect-ratio/gi, text);
    const visualSignals = count(/box-shadow\s*:|linear-gradient|radial-gradient|filter\s*:|backdrop-filter|clip-path|mask\s*:|transform\s*:|<svg\b/gi, text);
    const textHeavy = String(plain || '').length > 520;
    return textHeavy && spatialSignals < 2 && visualSignals < 3;
}
function detectFlatVerticalFlow(html = '', root = null) {
    const text = String(html || '');
    const columnSignals = count(/flex-direction\s*:\s*column|margin-bottom\s*:|<br\s*\/?>(?![^<]*<svg)|<li\b/gi, text);
    const divs = count(/<div\b/gi, text);
    const absolute = /position\s*:\s*absolute|display\s*:\s*grid|grid-template|clip-path\s*:|mask\s*:|<svg\b/i.test(text);
    const candidates = root ? getBlockCandidates(root) : [];
    const ratio = candidateSimilarityRatio(candidates);
    return divs >= 8 && columnSignals >= 2 && !absolute && (candidates.length >= 3 || ratio >= 0.25);
}
function detectRepeatedUnitShape(root, html = '') {
    const candidates = root ? getBlockCandidates(root) : [];
    if (candidates.length < 3)
        return false;
    const ratio = candidateSimilarityRatio(candidates);
    const text = String(html || '');
    const repeatedVisualProps = count(/border-radius\s*:|padding\s*:|background(?:-color)?\s*:|border\s*:/gi, text);
    return ratio >= 0.42 && repeatedVisualProps >= 8;
}
function visualSceneryAuditExpected(html = '') {
    if (/data-rm-visual-scenery\s*=\s*["']true["']/i.test(String(html || '')))
        return true;
    try {
        return visualSceneryEnabled(getSettings());
    }
    catch {
        return false;
    }
}
function inspectVisualSceneryMotion(html = '', spatialSignalCount = 0) {
    const text = String(html || '');
    if (!visualSceneryAuditExpected(text))
        return [];
    const flags = [];
    const hasMarker = /data-rm-visual-scenery\s*=\s*["']true["']/i.test(text);
    const keyframeCount = count(/@(?:-webkit-)?keyframes\b/gi, text);
    const animationDeclarationCount = count(/(?:^|[;{])\s*(?:-webkit-)?animation(?:-name)?\s*:/gi, text);
    const infiniteCount = count(/\binfinite\b/gi, text);
    const meaningfulKeyframeMotion = /@(?:-webkit-)?keyframes[\s\S]{0,2400}?(?:translate(?:3d|x|y)?\s*\(|rotate(?:3d|x|y)?\s*\(|scale(?:3d|x|y)?\s*\(|clip-path\s*:|mask(?:-position|-size)?\s*:|background-position\s*:|stroke-dashoffset\s*:|offset-distance\s*:)/i.test(text);
    const layeredSceneSignals = count(/position\s*:\s*absolute|z-index\s*:|grid-area\s*:|clip-path\s*:|mask\s*:|radial-gradient|linear-gradient|<svg\b/gi, text);
    if (!hasMarker)
        flags.push('visual_scenery_marker_missing');
    if (keyframeCount < 1 || animationDeclarationCount < 1 || infiniteCount < 1 || !meaningfulKeyframeMotion) {
        flags.push('weak_visual_scenery_motion');
    }
    if (animationDeclarationCount < 2 || spatialSignalCount < 3 || layeredSceneSignals < 4) {
        flags.push('weak_visual_scenery_layers');
    }
    return flags;
}
function detectRiskFlags({ root, html, plain, dom, repeated, spatialSignalCount, composition }) {
    const flags = [];
    const sameBlockStack = detectSameBlockStack(root, html);
    const sameGridCard = detectSameGridCardRisk(root, html);
    const catalogPage = detectCatalogPageRisk(root, html, plain);
    const flatVerticalFlow = detectFlatVerticalFlow(html, root);
    const repeatedUnitShape = detectRepeatedUnitShape(root, html);
    const weakSpatialComplexity = detectWeakSpatialComplexity(html, plain);
    const objectStateChange = composition?.operation_family === 'object_state_change';
    const interactionMissing = !objectStateChange && detectInteractionMissing(html);
    const fakeInteraction = !objectStateChange && detectFakeInteraction(html, plain);
    const missingVisualProgram = detectMissingVisualProgram(html, plain);
    if (sameBlockStack)
        flags.push('same_block_stack');
    if (sameGridCard)
        flags.push('same_grid_card_risk');
    if (catalogPage)
        flags.push('catalog_page_risk');
    if (flatVerticalFlow)
        flags.push('flat_vertical_flow');
    if (repeatedUnitShape)
        flags.push('repeated_unit_shape');
    if (sameBlockStack || sameGridCard || catalogPage || flatVerticalFlow || repeatedUnitShape || (dom?.maxSimilarRun || 0) >= 3 || (repeated?.maxRepeat || 0) >= 4)
        flags.push('info_page_degrade');
    if (spatialSignalCount < 2 && String(plain || '').length > 520 && (sameBlockStack || sameGridCard || catalogPage || repeatedUnitShape || (repeated?.maxRepeat || 0) >= 3))
        flags.push('weak_media_body');
    if (weakSpatialComplexity)
        flags.push('weak_spatial_complexity');
    if (interactionMissing)
        flags.push('missing_interaction');
    if (fakeInteraction)
        flags.push('fake_interaction');
    if (missingVisualProgram)
        flags.push('missing_visual_program');
    if (detectVisualPromiseWithoutMechanism(html, plain))
        flags.push('visual_promise_unfulfilled');
    flags.push(...inspectVisualSceneryMotion(html, spatialSignalCount));
    return [...new Set(flags)];
}
function expandHexColor(hex) {
    const raw = String(hex || '').replace('#', '').trim();
    if (/^[0-9a-f]{3}$/i.test(raw)) {
        return raw.split('').map(x => x + x).join('');
    }
    if (/^[0-9a-f]{6}$/i.test(raw))
        return raw;
    return '';
}
function colorValueLuminance(value) {
    const v = String(value || '').toLowerCase();
    if (/\bblack\b/.test(v))
        return 0;
    if (/\bwhite\b/.test(v))
        return 255;
    const rgba = v.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([0-9.]+))?\s*\)/);
    if (rgba) {
        const alpha = rgba[4] === undefined ? 1 : Number(rgba[4]);
        if (!Number.isNaN(alpha) && alpha < 0.25)
            return null;
        return luminanceFromRgb(Number(rgba[1]), Number(rgba[2]), Number(rgba[3]));
    }
    const hexes = [...v.matchAll(/#([0-9a-f]{3}|[0-9a-f]{6})\b/gi)]
        .map(m => expandHexColor(m[1]))
        .filter(Boolean);
    if (hexes.length) {
        const values = hexes.map(hex => {
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            return luminanceFromRgb(r, g, b);
        });
        const sample = values.slice(0, Math.min(2, values.length));
        return sample.reduce((a, b) => a + b, 0) / sample.length;
    }
    return null;
}
function extractBackgroundValues(html) {
    const values = [];
    const input = String(html || '');
    const re = /(?:^|[;{\s"'])background(?:-color|-image)?\s*:\s*([^;}"']+)/gi;
    let match;
    while ((match = re.exec(input))) {
        const value = String(match[1] || '').trim();
        if (value)
            values.push(value);
    }
    return values;
}
function detectBaseColor(html) {
    const values = extractBackgroundValues(html);
    const luminances = values.map(colorValueLuminance).filter(v => typeof v === 'number' && !Number.isNaN(v));
    if (luminances.length) {
        const first = luminances[0];
        if (first < 90)
            return __rmT("skEhWO.tz5gkFb.UcEf");
        if (first > 190)
            return __rmT("a2h.L3W_.X_QkO.uhi4F6lV1");
        const darkCount = luminances.filter(v => v < 90).length;
        const lightCount = luminances.filter(v => v > 190).length;
        if (darkCount > lightCount)
            return __rmT("skEhWO.tz5gkFb.UcEf");
        if (lightCount > darkCount)
            return __rmT("a2h.L3W_.X_QkO.uhi4F6lV1");
    }
    if (/radial-gradient|conic-gradient|linear-gradient/i.test(html))
        return __rmT("_GVfhYyS0PiVQlQ2pM8oAf");
    return __rmT("ZSRcbRLqIff_aw.UcEf");
}
function detectContrastFamily(html) {
    const values = extractBackgroundValues(html);
    const luminances = values.map(colorValueLuminance).filter(v => typeof v === 'number' && !Number.isNaN(v));
    if (!luminances.length)
        return 'contrast: mixed_or_unspecified';
    const first = luminances[0];
    if (first < 90)
        return 'contrast: dark_weighted';
    if (first > 190)
        return 'contrast: light_weighted';
    return 'contrast: mid_tone_or_mixed';
}
const NAMED_PALETTE_COLORS = Object.freeze({
    aliceblue: '#f0f8ff', antiquewhite: '#faebd7', aqua: '#00ffff', aquamarine: '#7fffd4',
    azure: '#f0ffff', beige: '#f5f5dc', bisque: '#ffe4c4', black: '#000000',
    blanchedalmond: '#ffebcd', blue: '#0000ff', blueviolet: '#8a2be2', brown: '#a52a2a',
    burlywood: '#deb887', cadetblue: '#5f9ea0', chartreuse: '#7fff00', chocolate: '#d2691e',
    coral: '#ff7f50', cornflowerblue: '#6495ed', cornsilk: '#fff8dc', crimson: '#dc143c',
    cyan: '#00ffff', darkblue: '#00008b', darkcyan: '#008b8b', darkgoldenrod: '#b8860b',
    darkgray: '#a9a9a9', darkgreen: '#006400', darkgrey: '#a9a9a9', darkkhaki: '#bdb76b',
    darkmagenta: '#8b008b', darkolivegreen: '#556b2f', darkorange: '#ff8c00', darkorchid: '#9932cc',
    darkred: '#8b0000', darksalmon: '#e9967a', darkseagreen: '#8fbc8f', darkslateblue: '#483d8b',
    darkslategray: '#2f4f4f', darkslategrey: '#2f4f4f', darkturquoise: '#00ced1', darkviolet: '#9400d3',
    deeppink: '#ff1493', deepskyblue: '#00bfff', dimgray: '#696969', dimgrey: '#696969',
    dodgerblue: '#1e90ff', firebrick: '#b22222', floralwhite: '#fffaf0', forestgreen: '#228b22',
    fuchsia: '#ff00ff', gainsboro: '#dcdcdc', ghostwhite: '#f8f8ff', gold: '#ffd700',
    goldenrod: '#daa520', gray: '#808080', green: '#008000', greenyellow: '#adff2f',
    grey: '#808080', honeydew: '#f0fff0', hotpink: '#ff69b4', indianred: '#cd5c5c',
    indigo: '#4b0082', ivory: '#fffff0', khaki: '#f0e68c', lavender: '#e6e6fa',
    lavenderblush: '#fff0f5', lawngreen: '#7cfc00', lemonchiffon: '#fffacd', lightblue: '#add8e6',
    lightcoral: '#f08080', lightcyan: '#e0ffff', lightgoldenrodyellow: '#fafad2', lightgray: '#d3d3d3',
    lightgreen: '#90ee90', lightgrey: '#d3d3d3', lightpink: '#ffb6c1', lightsalmon: '#ffa07a',
    lightseagreen: '#20b2aa', lightskyblue: '#87cefa', lightslategray: '#778899', lightslategrey: '#778899',
    lightsteelblue: '#b0c4de', lightyellow: '#ffffe0', lime: '#00ff00', limegreen: '#32cd32',
    linen: '#faf0e6', magenta: '#ff00ff', maroon: '#800000', mediumaquamarine: '#66cdaa',
    mediumblue: '#0000cd', mediumorchid: '#ba55d3', mediumpurple: '#9370db', mediumseagreen: '#3cb371',
    mediumslateblue: '#7b68ee', mediumspringgreen: '#00fa9a', mediumturquoise: '#48d1cc', mediumvioletred: '#c71585',
    midnightblue: '#191970', mintcream: '#f5fffa', mistyrose: '#ffe4e1', moccasin: '#ffe4b5',
    navajowhite: '#ffdead', navy: '#000080', oldlace: '#fdf5e6', olive: '#808000',
    olivedrab: '#6b8e23', orange: '#ffa500', orangered: '#ff4500', orchid: '#da70d6',
    palegoldenrod: '#eee8aa', palegreen: '#98fb98', paleturquoise: '#afeeee', palevioletred: '#db7093',
    papayawhip: '#ffefd5', peachpuff: '#ffdab9', peru: '#cd853f', pink: '#ffc0cb',
    plum: '#dda0dd', powderblue: '#b0e0e6', purple: '#800080', rebeccapurple: '#663399',
    red: '#ff0000', rosybrown: '#bc8f8f', royalblue: '#4169e1', saddlebrown: '#8b4513',
    salmon: '#fa8072', sandybrown: '#f4a460', seagreen: '#2e8b57', seashell: '#fff5ee',
    sienna: '#a0522d', silver: '#c0c0c0', skyblue: '#87ceeb', slateblue: '#6a5acd',
    slategray: '#708090', slategrey: '#708090', snow: '#fffafa', springgreen: '#00ff7f',
    steelblue: '#4682b4', tan: '#d2b48c', teal: '#008080', thistle: '#d8bfd8',
    tomato: '#ff6347', turquoise: '#40e0d0', violet: '#ee82ee', wheat: '#f5deb3',
    white: '#ffffff', whitesmoke: '#f5f5f5', yellow: '#ffff00', yellowgreen: '#9acd32',
});
function hslToRgb(h, s, l) {
    const hue = ((Number(h) % 360) + 360) % 360 / 360;
    const sat = clamp(Number(s), 0, 1);
    const light = clamp(Number(l), 0, 1);
    if (sat === 0) {
        const gray = Math.round(light * 255);
        return [gray, gray, gray];
    }
    const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
    const p = 2 * light - q;
    const hue2rgb = (t) => {
        let x = t;
        if (x < 0)
            x += 1;
        if (x > 1)
            x -= 1;
        if (x < 1 / 6)
            return p + (q - p) * 6 * x;
        if (x < 1 / 2)
            return q;
        if (x < 2 / 3)
            return p + (q - p) * (2 / 3 - x) * 6;
        return p;
    };
    return [hue2rgb(hue + 1 / 3), hue2rgb(hue), hue2rgb(hue - 1 / 3)].map(x => Math.round(x * 255));
}
function parseCssColorToken(token) {
    const value = String(token || '').trim().toLowerCase();
    if (!value || value === 'transparent')
        return null;
    const hex = value.match(/^#([0-9a-f]{3,8})$/i);
    if (hex) {
        let raw = hex[1];
        if (raw.length === 3 || raw.length === 4)
            raw = raw.split('').map(char => char + char).join('');
        if (raw.length !== 6 && raw.length !== 8)
            return null;
        const r = parseInt(raw.slice(0, 2), 16);
        const g = parseInt(raw.slice(2, 4), 16);
        const b = parseInt(raw.slice(4, 6), 16);
        const a = raw.length === 8 ? parseInt(raw.slice(6, 8), 16) / 255 : 1;
        return { r, g, b, a };
    }
    const fn = value.match(/^(rgb|rgba|hsl|hsla)\((.*)\)$/s);
    if (fn) {
        const legacy = fn[2].includes(',');
        if (legacy && fn[2].includes('/'))
            return null;
        const parts = legacy ? fn[2].split(',').map(x => x.trim()) : fn[2].trim().split(/\s*\/\s*/);
        if (legacy ? ![3, 4].includes(parts.length) : parts.length > 2)
            return null;
        const channels = legacy ? parts.slice(0, 3) : parts[0].split(/\s+/);
        const alphaToken = legacy ? parts[3] : parts[1];
        if (channels.length !== 3)
            return null;
        const component = token => {
            if (token === 'none' && !legacy)
                return { n: 0, unit: '' };
            const match = String(token).match(/^([+-]?(?:\d*\.\d+|\d+)(?:e[+-]?\d+)?)(%|deg|grad|rad|turn)?$/);
            if (!match || !Number.isFinite(Number(match[1])))
                return null;
            return { n: Number(match[1]), unit: match[2] || '' };
        };
        const c = channels.map(component), alpha = component(alphaToken ?? '1');
        if (c.some(x => !x) || !alpha || !['', '%'].includes(alpha.unit))
            return null;
        const a = clamp(alpha.n / (alpha.unit === '%' ? 100 : 1), 0, 1);
        if (fn[1].startsWith('rgb')) {
            if (c.some(x => !['', '%'].includes(x.unit)) || (legacy && new Set(c.map(x => x.unit)).size > 1))
                return null;
            const [r, g, b] = c.map(x => clamp(x.n * (x.unit === '%' ? 255 / 100 : 1), 0, 255));
            return { r, g, b, a };
        }
        const angleScale = { '': 1, deg: 1, grad: 0.9, rad: 180 / Math.PI, turn: 360 };
        if (!Object.hasOwn(angleScale, c[0].unit) || c.slice(1).some(x => !['', '%'].includes(x.unit))
            || (legacy && c.slice(1).some(x => x.unit !== '%')))
            return null;
        const [r, g, b] = hslToRgb(c[0].n * angleScale[c[0].unit], c[1].n / 100, c[2].n / 100);
        return { r, g, b, a };
    }
    if (Object.hasOwn(NAMED_PALETTE_COLORS, value))
        return parseCssColorToken(NAMED_PALETTE_COLORS[value]);
    return null;
}
function paletteCssText(html) {
    const source = String(html || '').replace(/<!--[\s\S]*?-->/g, '');
    const tags = source.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
        .match(/<[a-z][\w:-]*(?:[^>"']|"[^"]*"|'[^']*')*>/gi) || [];
    const blocks = [
        ...[...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(match => match[1]),
        ...tags.flatMap(tag => [...tag.matchAll(/\s([-\w:]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)]
            .filter(match => match[1].toLowerCase() === 'style')
            .map(match => match[2] ?? match[3] ?? match[4])),
    ];
    return blocks.map(block => `{${block}}`).join('\n')
        .replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/\*[\s\S]*?\*\//g, token => token.startsWith('/*') ? '' : '__rm_css_string__');
}
function cssFunctionEnd(value, opening) {
    let depth = 1;
    for (let i = opening + 1; i < value.length; i++) {
        if (value[i] === '(')
            depth++;
        else if (value[i] === ')' && --depth === 0)
            return i + 1;
    }
    return -1;
}
function extractCssColors(value, depth = 0, minimumAlpha = 0.08) {
    if (depth >= 32)
        return [];
    const input = String(value || '').toLowerCase()
        .replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/\*[\s\S]*?\*\//g, token => token.startsWith('/*') ? '' : '__rm_css_string__');
    const colors = [], re = /#[\w-]+|[-a-z_][\w-]*/g;
    let match;
    while ((match = re.exec(input))) {
        if (match.index > 0 && /[\w-]/.test(input[match.index - 1]))
            continue;
        let token = match[0];
        if (input[re.lastIndex] === '(') {
            const end = cssFunctionEnd(input, re.lastIndex);
            if (end < 0)
                break;
            if (/^(?:repeating-)?(?:linear|radial|conic)-gradient$/.test(token)) {
                colors.push(...extractCssColors(input.slice(re.lastIndex + 1, end - 1), depth + 1, minimumAlpha));
            }
            else {
                const color = parseCssColorToken(input.slice(match.index, end));
                if (color && color.a >= minimumAlpha)
                    colors.push(color);
            }
            re.lastIndex = end;
        }
        else {
            const color = token === 'transparent' && minimumAlpha === 0
                ? { r: 0, g: 0, b: 0, a: 0 } : parseCssColorToken(token);
            if (color && color.a >= minimumAlpha)
                colors.push(color);
        }
    }
    return colors;
}
function sparsePaletteTexture(layer, backgroundSize, index) {
    const sizes = String(backgroundSize || '').split(',');
    const size = sizes[index % sizes.length]?.trim().match(/^(\d+(?:\.\d+)?)px\s+(\d+(?:\.\d+)?)px$/i);
    if (!size || size.slice(1).some(value => Number(value) < 8 || Number(value) > 32)
        || !/^(?:repeating-)?(?:linear|radial)-gradient\(/i.test(layer))
        return false;
    const limit = Math.min(2, Number(size[1]) / 8, Number(size[2]) / 8);
    const pieces = [], body = layer.slice(layer.indexOf('(') + 1, -1);
    let start = 0, depth = 0;
    for (let i = 0; i <= body.length; i++) {
        if (body[i] === '(')
            depth++;
        else if (body[i] === ')')
            depth--;
        if (i === body.length || (body[i] === ',' && !depth)) {
            pieces.push(body.slice(start, i).trim());
            start = i + 1;
        }
    }
    let paintedEnd = -1;
    const transparentStarts = [];
    for (const piece of pieces) {
        const stop = piece.match(/^(#[\w-]+|(?:rgba?|hsla?)\([^()]*\)|[a-z]+)\s+(.+)$/i);
        if (!stop) {
            if (extractCssColors(piece, 0, 0).length)
                return false;
            continue;
        }
        const color = stop[1].toLowerCase() === 'transparent' ? { a: 0 } : parseCssColorToken(stop[1]);
        if (!color)
            continue;
        const positions = stop[2].split(/\s+/).map(value => value.match(/^(\d+(?:\.\d+)?)px$/i));
        if (!positions.length || positions.some(value => !value))
            return false;
        if (color.a === 0)
            transparentStarts.push(Number(positions[0][1]));
        else {
            const end = Math.max(...positions.map(value => Number(value[1])));
            if (end > limit)
                return false;
            paintedEnd = Math.max(paintedEnd, end);
        }
    }
    return paintedEnd >= 0 && transparentStarts.some(start => Math.abs(start - paintedEnd) < 0.01);
}
function mainBackgroundSamples(backgroundColor, backgroundImage, resolve = value => value, backgroundSize = '') {
    const image = String(resolve(backgroundImage) || '').trim();
    const foreground = [];
    if (image && !/^(?:none|initial|unset|revert(?:-layer)?)$/i.test(image)) {
        let offset = 0, index = 0;
        while (offset < image.length) {
            const remaining = image.slice(offset).replace(/^[\s,]+/, '');
            if (!remaining)
                break;
            offset = image.length - remaining.length;
            const gradient = remaining.match(/^(?:repeating-)?(?:linear|radial|conic)-gradient\(/i);
            if (!gradient)
                return foreground;
            const end = cssFunctionEnd(image, offset + gradient[0].length - 1);
            if (end < 0)
                return foreground;
            const layer = image.slice(offset, end);
            if (/\b(?:var|color|color-mix|light-dark|lab|lch|oklab|oklch|device-cmyk)\s*\(|\bcurrentcolor\b/i.test(layer))
                return foreground;
            const stops = extractCssColors(layer, 0, 0);
            if (!stops.length)
                return foreground;
            if (stops.every(color => color.a === 1))
                return [...foreground, ...stops];
            if (!sparsePaletteTexture(layer, resolve(backgroundSize), index))
                foreground.push(...stops);
            offset = end;
            index++;
        }
    }
    return [...foreground, ...extractCssColors(resolve(backgroundColor) || '')];
}
function opaquePaletteHexColors(colors) {
    return [...new Set((colors || []).filter(color => color.a === 1
            && [color.r, color.g, color.b].every(Number.isFinite)).map(color => '#'
            + [color.r, color.g, color.b].map(value => Math.round(clamp(value, 0, 255))
                .toString(16).padStart(2, '0')).join('').toUpperCase()))];
}
function withMainPaletteColors(fingerprint, colors, contentSurfaceColors = [], contentSurfaceSource = '') {
    if (!fingerprint)
        return null;
    return { ...fingerprint, mainColors: opaquePaletteHexColors(colors),
        ...(contentSurfaceColors.length ? { contentSurfaceColors, contentSurfaceSource } : {}) };
}
function paletteContentTextCounter(visible) {
    const cache = new WeakMap();
    let visits = 0, exhausted = false;
    const length = (node, depth = 0) => {
        if (exhausted || !node)
            return 0;
        if (cache.has(node))
            return cache.get(node);
        if (depth > 64 || ++visits > 1200) {
            exhausted = true;
            return 0;
        }
        if (!visible(node) || (depth > 0 && node.tagName === 'DETAILS' && !node.hasAttribute('open'))
            || node.closest?.('summary,style,script,template,button,label,input,select,textarea,nav,rm-think,rm-ticket,[data-rabbit-mirror-tool-entry-host]'))
            return 0;
        const compactLength = value => String(value || '').replace(/\s+/g, '').length;
        const children = [...(node.children || [])];
        const ownLength = node.childNodes
            ? [...node.childNodes].filter(child => child.nodeType === 3).reduce((sum, child) => sum + compactLength(child.textContent), 0)
            : Math.max(0, compactLength(node.textContent) - children.reduce((sum, child) => sum + compactLength(child.textContent), 0));
        const total = ownLength + children.reduce((sum, child) => sum + length(child, depth + 1), 0);
        if (exhausted)
            return 0;
        cache.set(node, total);
        return total;
    };
    return length;
}
function contentSurfacePaletteColors(primary, candidates, properties, visible, measuredRootArea = 0) {
    if (!primary)
        return [];
    const textLength = paletteContentTextCounter(visible), totalText = textLength(primary);
    if (totalText < 80)
        return [];
    const chosen = [], colors = new Set();
    for (const node of candidates) {
        if (node === primary || !primary.contains(node) || !/^(DIV|SECTION|ARTICLE|MAIN|ASIDE|TABLE)$/.test(node.tagName)
            || !visible(node) || chosen.some(parent => parent.contains(node)))
            continue;
        if (measuredRootArea && elementArea(node) < measuredRootArea * 0.22)
            continue;
        if (textLength(node) < Math.max(80, totalText * 0.35))
            continue;
        let opaqueSurface = true;
        for (let ancestor = node; ancestor?.nodeType === 1; ancestor = ancestor.parentElement) {
            const alpha = properties(ancestor).opacity;
            if ((alpha !== undefined && alpha !== '' && Number(alpha) < 1)
                || (ancestor !== primary && primary.contains(ancestor) && ancestor.tagName === 'DETAILS' && !ancestor.hasAttribute('open'))) {
                opaqueSurface = false;
                break;
            }
        }
        if (!opaqueSurface)
            continue;
        const p = properties(node);
        const swatches = opaquePaletteHexColors(mainBackgroundSamples(p['background-color'], p['background-image'], value => value, p['background-size']));
        if (!swatches.length)
            continue;
        chosen.push(node);
        swatches.forEach(color => colors.add(color));
        if (colors.size > 4)
            return [];
    }
    return [...colors];
}
function paletteContentRoots(toto) {
    if (!toto?.querySelector)
        return [];
    const details = toto.tagName === 'DETAILS' ? toto
        : [...(toto.children || [])].find(child => child?.tagName === 'DETAILS') || toto.querySelector('details');
    const parent = details || toto;
    const roots = [...(parent.children || [])].filter(node => !['SUMMARY', 'STYLE', 'SCRIPT', 'TEMPLATE', 'LINK', 'META', 'INPUT', 'BUTTON', 'LABEL', 'SELECT', 'TEXTAREA', 'RM-THINK', 'RM-TICKET'].includes(node.tagName)
        && !node.hidden && !node.hasAttribute?.('data-rabbit-mirror-tool-entry-host'));
    return roots.length ? roots : [parent];
}
function findRenderedPaletteRoot(toto) {
    if (!toto?.querySelector)
        return toto || null;
    return paletteContentRoots(toto).map(node => ({ node, area: elementArea(node) }))
        .sort((a, b) => b.area - a.area)[0]?.node || toto;
}
function elementArea(element) {
    try {
        const rect = layoutRect(element);
        if (!rect)
            return 0;
        return Math.max(0, Number(rect.width) || 0) * Math.max(0, Number(rect.height) || 0);
    }
    catch {
        return 0;
    }
}
function renderedPaletteFingerprint(toto) {
    const root = findRenderedPaletteRoot(toto);
    if (!root?.querySelectorAll)
        return null;
    const view = root.ownerDocument?.defaultView || globalThis;
    const getStyle = view?.getComputedStyle?.bind(view) || globalThis.getComputedStyle?.bind(globalThis);
    if (typeof getStyle !== 'function')
        return null;
    const rootArea = elementArea(root);
    if (!rootArea)
        return null;
    const candidates = [root, ...root.querySelectorAll('div,section,article,main,aside,label,li,figure,svg')]
        .map((element, index) => ({ element, index, area: elementArea(element) }))
        .filter(item => item.index === 0 || item.area >= Math.max(64, rootArea * 0.015))
        .sort((a, b) => b.area - a.area)
        .slice(0, 28);
    const samples = [];
    let mainBackgroundFound = false;
    let mainColors = null;
    let primary = null;
    const styleCache = new WeakMap();
    const properties = element => {
        if (!styleCache.has(element)) {
            let style;
            try {
                style = getStyle(element);
            }
            catch { }
            styleCache.set(element, style || {});
        }
        return styleCache.get(element);
    };
    const visible = element => {
        for (let node = element; node && root.contains(node); node = node.parentElement) {
            const style = properties(node);
            if (node.hidden || style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity || 1) < 0.05)
                return false;
        }
        return true;
    };
    for (const item of candidates) {
        const style = properties(item.element);
        if (!visible(item.element))
            continue;
        const colors = [
            ...extractCssColors(style.backgroundColor),
            ...extractCssColors(style.backgroundImage),
        ];
        if (!colors.length)
            continue;
        if (!mainColors) {
            mainColors = mainBackgroundSamples(style.backgroundColor, style.backgroundImage, value => value, style.backgroundSize);
            primary = item.element;
        }
        const isRoot = item.element === root;
        if (isRoot)
            mainBackgroundFound = true;
        const area = item.area || rootArea * 0.08;
        const baseWeight = isRoot ? rootArea * 2.2 : Math.min(area, rootArea * 0.48);
        const colorWeight = baseWeight / colors.length;
        colors.forEach(color => samples.push({ color, weight: colorWeight }));
    }
    const surfaces = contentSurfacePaletteColors(primary, candidates.map(item => item.element), element => {
        const style = properties(element);
        return { 'background-color': style.backgroundColor, 'background-image': style.backgroundImage,
            'background-size': style.backgroundSize, opacity: style.opacity };
    }, visible, rootArea);
    return withMainPaletteColors(classifyPaletteSamples(samples, 'rendered', mainBackgroundFound), mainColors, surfaces, 'rendered-geometry');
}
function rawPaletteVariableResolver(html) {
    const css = paletteCssText(html);
    const definitions = new Map();
    for (const match of css.matchAll(/(?:^|[;{])\s*(--[\w-]+)\s*:\s*([^;}]+)/g)) {
        const value = match[2].replace(/\s*!important\s*$/i, '').trim();
        if (!definitions.has(match[1]))
            definitions.set(match[1], value);
        else if (definitions.get(match[1]) !== value)
            definitions.set(match[1], null);
    }
    const cyclic = new Set(), visited = new Set(), visiting = [];
    function visit(name) {
        const at = visiting.indexOf(name);
        if (at >= 0) {
            visiting.slice(at).forEach(key => cyclic.add(key));
            return;
        }
        if (visited.has(name) || visiting.length >= 32 || typeof definitions.get(name) !== 'string')
            return;
        visiting.push(name);
        for (const match of definitions.get(name).matchAll(/var\(\s*(--[\w-]+)/gi))
            visit(match[1]);
        visiting.pop();
        visited.add(name);
    }
    for (const name of definitions.keys())
        visit(name);
    function resolve(value, trail = new Set()) {
        let output = '', offset = 0;
        const re = /var\(/gi;
        let match;
        while ((match = re.exec(value))) {
            output += value.slice(offset, match.index);
            let depth = 1, end = re.lastIndex, comma = -1;
            for (; end < value.length && depth; end++) {
                if (value[end] === '(')
                    depth++;
                else if (value[end] === ')')
                    depth--;
                else if (value[end] === ',' && depth === 1 && comma < 0)
                    comma = end;
            }
            if (depth)
                return null;
            const name = value.slice(re.lastIndex, comma < 0 ? end - 1 : comma).trim();
            if (!/^--[\w-]+$/.test(name))
                return null;
            if (trail.has(name) || trail.size >= 32)
                return undefined;
            if (definitions.has(name) && definitions.get(name) === null)
                return undefined;
            const raw = definitions.get(name);
            let resolved;
            if (raw === undefined || cyclic.has(name) || /^initial$/i.test(raw))
                resolved = null;
            else if (/^(?:inherit|unset|revert|revert-layer)$/i.test(raw))
                resolved = undefined;
            else
                resolved = resolve(raw, new Set([...trail, name]));
            if (resolved === null && comma >= 0)
                resolved = resolve(value.slice(comma + 1, end - 1), trail);
            if (resolved == null)
                return resolved;
            output += resolved;
            offset = end;
            re.lastIndex = end;
        }
        return output + value.slice(offset);
    }
    return resolve;
}
function paletteSourceRules(root) {
    const rules = [];
    for (const element of root.querySelectorAll('style')) {
        const css = String(element.textContent || '').replace(/\/\*[\s\S]*?\*\//g, '');
        let start = 0, opening = -1, depth = 0, quote = '';
        for (let i = 0; i < css.length; i++) {
            const ch = css[i];
            if (quote) {
                if (ch === '\\')
                    i++;
                else if (ch === quote)
                    quote = '';
                continue;
            }
            if (ch === '"' || ch === "'") {
                quote = ch;
                continue;
            }
            if (ch === '{') {
                if (depth++ === 0)
                    opening = i;
            }
            else if (ch === '}' && depth && --depth === 0) {
                const selector = css.slice(start, opening).trim();
                if (selector && !selector.startsWith('@'))
                    rules.push({ selector, declarations: paletteSourceDeclarations(css.slice(opening + 1, i)) });
                start = i + 1;
            }
            else if (!depth && ch === ';')
                start = i + 1;
        }
    }
    return rules;
}
function paletteSourceDeclarations(text) {
    const css = String(text || '').replace(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/\*[\s\S]*?\*\//g, token => token.startsWith('/*') ? '' : '__rm_css_string__');
    return [...css.matchAll(/(?:^|;)\s*(background(?:-color|-image|-size)?|(?:-webkit-)?backdrop-filter|display|visibility|opacity)\s*:\s*([^;{}]+)/gi)]
        .map(match => ({ property: match[1].toLowerCase(), value: match[2].replace(/\s*!important\s*$/i, '').trim(),
        important: /!important\s*$/i.test(match[2]) }));
}
function paletteSelectorWeight(selector) {
    const simple = selector.replace(/\[[^\]]*\]/g, '.attribute');
    return [(simple.match(/#[\w-]+/g) || []).length,
        (simple.match(/\.[\w-]+|:[\w-]+/g) || []).length,
        (simple.match(/(?:^|[\s>+~])[a-z][\w-]*/gi) || []).length];
}
function paletteBackgroundParts(value) {
    const images = [], colors = [];
    const functions = /[-a-z][\w-]*\(/gi;
    let offset = 0, match;
    while ((match = functions.exec(value))) {
        const end = cssFunctionEnd(value, functions.lastIndex - 1);
        if (end < 0)
            return { color: '', image: '' };
        colors.push(value.slice(offset, match.index));
        const token = value.slice(match.index, end);
        (/^(?:rgba?|hsla?)\(/i.test(token) ? colors : images).push(token);
        offset = end;
        functions.lastIndex = end;
    }
    colors.push(value.slice(offset));
    return { color: colors.join(' '), image: images.join(' ') };
}
function paletteSourceProperties(html, root) {
    const rules = paletteSourceRules(root), resolve = rawPaletteVariableResolver(html), cache = new WeakMap();
    const properties = node => {
        if (cache.has(node))
            return cache.get(node);
        const winners = new Map();
        const add = (declarations, specificity) => {
            for (const declaration of declarations) {
                const rank = [Number(declaration.important), ...specificity];
                const names = declaration.property === 'background' ? ['background-color', 'background-image', 'background-size'] : [declaration.property];
                const value = /var\(/i.test(declaration.value) ? resolve(declaration.value) || '' : declaration.value;
                const background = declaration.property === 'background' ? paletteBackgroundParts(value) : null;
                for (const name of names) {
                    const prior = winners.get(name);
                    const different = prior ? rank.findIndex((n, i) => n !== prior.rank[i]) : -1;
                    if (!prior || different < 0 || rank[different] > prior.rank[different])
                        winners.set(name, {
                            value: background ? (name === 'background-size' ? 'auto' : background[name === 'background-color' ? 'color' : 'image']) : value, rank
                        });
                }
            }
        };
        for (const rule of rules) {
            for (const selector of rule.selector.split(',')) {
                if (/::|:(?:is|where|not|has)\(/i.test(selector))
                    continue;
                try {
                    if (node.matches(selector.trim()))
                        add(rule.declarations, [0, ...paletteSelectorWeight(selector)]);
                }
                catch { }
            }
        }
        add(paletteSourceDeclarations(node.getAttribute?.('style')), [1, 0, 0, 0]);
        const values = Object.fromEntries([...winners].map(([key, item]) => [key, item.value]));
        cache.set(node, values);
        return values;
    };
    return properties;
}
function sourcePaletteFingerprint(html, root, sourceProperties = null) {
    if (!root?.querySelectorAll)
        return undefined;
    const properties = sourceProperties || paletteSourceProperties(html, root), resolve = rawPaletteVariableResolver(html);
    const visible = node => {
        for (let current = node; current && root.contains(current); current = current.parentElement) {
            if (current.hidden || current.matches('summary,rm-think,rm-ticket,[data-rabbit-mirror-tool-entry-host]'))
                return false;
            const p = properties(current);
            if (p.display === 'none' || p.visibility === 'hidden' || (p.opacity !== undefined && Number(p.opacity) < 0.05))
                return false;
        }
        return true;
    };
    const roots = paletteContentRoots(root);
    const nodes = [...new Set(roots.flatMap(node => [node, ...node.querySelectorAll('div,section,article,main,aside,figure,table,svg')]))].slice(0, 180);
    const carriers = nodes.filter(node => /^(DIV|SECTION|ARTICLE|MAIN|ASIDE|FIGURE|TABLE|SVG)$/i.test(node.tagName));
    carriers.push(...roots.filter(node => !carriers.includes(node)), root.querySelector('details'), root);
    const painted = [];
    let mainColors = null;
    let primary = null;
    for (const node of [...new Set(carriers)].filter(Boolean)) {
        if (!visible(node))
            continue;
        const p = properties(node);
        const colors = [...new Set([p['background-color'], p['background-image']].filter(Boolean))]
            .flatMap(value => extractCssColors(/var\(/i.test(value) ? resolve(value) || '' : value));
        if (colors.length) {
            if (!mainColors) {
                mainColors = mainBackgroundSamples(p['background-color'], p['background-image'], value => /var\(/i.test(value) ? resolve(value) || '' : value, p['background-size']);
                primary = node;
            }
            painted.push(colors);
        }
        if (painted.length >= 24)
            break;
    }
    if (!painted.length)
        return null;
    const samples = painted.flatMap((colors, index) => colors.map(color => ({ color,
        weight: (index === 0 ? 8 : 2 / Math.max(1, painted.length - 1)) / colors.length })));
    const surfaces = contentSurfacePaletteColors(primary, carriers, properties, visible);
    return withMainPaletteColors(classifyPaletteSamples(samples, 'raw', true), mainColors, surfaces, 'raw-structure');
}
function rawPaletteFingerprint(html, sourceRoot = null, sourceProperties = null) {
    const matched = sourcePaletteFingerprint(html, sourceRoot || parseToto(html), sourceProperties);
    if (matched !== undefined)
        return matched;
    const values = extractBackgroundValues(paletteCssText(html));
    const resolve = rawPaletteVariableResolver(html);
    const samples = [];
    values.slice(0, 24).forEach((value, index) => {
        const colors = extractCssColors(/var\(/i.test(value) ? resolve(value) || '' : value);
        const baseWeight = index === 0 ? 5 : (index < 5 ? 1.5 : 0.7);
        colors.forEach(color => samples.push({ color, weight: baseWeight / Math.max(1, colors.length) }));
    });
    return classifyPaletteSamples(samples, 'raw', values.length > 0);
}
function detectPaletteFingerprint(html, renderedToto = null, sourceRoot = null, sourceProperties = null) {
    return renderedPaletteFingerprint(renderedToto) || rawPaletteFingerprint(html, sourceRoot, sourceProperties);
}
function surfaceCarrierEvidence(html, root, sourceProperties = null) {
    if (!root?.querySelectorAll) {
        const tags = [...String(html).replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
                .matchAll(/<(div|section|article|main|aside|figure|table)\b([^>]*)>([^<]*)/gi)];
        const chosen = tags.find(match => /\sstyle\s*=\s*(["'])[^"']*(?:background|backdrop-filter)\s*:/i.test(match[2])) || tags[0];
        const css = chosen?.[2].match(/\sstyle\s*=\s*(["'])([\s\S]*?)\1/i)?.[2] || '';
        const props = {};
        for (const { property, value } of paletteSourceDeclarations(css)) {
            if (property === 'background') {
                const parts = paletteBackgroundParts(value);
                props['background-color'] = parts.color;
                props['background-image'] = parts.image;
            }
            else
                props[property] = value;
        }
        return { props, text: chosen?.[3] || '' };
    }
    const properties = sourceProperties || paletteSourceProperties(html, root);
    const visible = node => {
        for (let current = node; current && root.contains(current); current = current.parentElement) {
            if (current.hidden || current.matches('summary,rm-think,rm-ticket,[data-rabbit-mirror-tool-entry-host]'))
                return false;
            const p = properties(current);
            if (p.display === 'none' || p.visibility === 'hidden' || (p.opacity !== undefined && Number(p.opacity) < 0.05))
                return false;
        }
        return true;
    };
    const painted = p => extractCssColors(p['background-color']).length
        || extractCssColors(p['background-image']).length || /blur\(/i.test(p['backdrop-filter'] || p['-webkit-backdrop-filter'] || '');
    const roots = paletteContentRoots(root);
    const nodes = [...new Set(roots.flatMap(node => [node, ...node.querySelectorAll('div,section,article,main,aside,figure,table,svg')]))].slice(0, 180);
    const carriers = nodes.filter(node => /^(DIV|SECTION|ARTICLE|MAIN|ASIDE|FIGURE|TABLE|SVG)$/i.test(node.tagName));
    carriers.push(...roots.filter(node => !carriers.includes(node)), root.querySelector('details'), root);
    const candidates = [...new Set(carriers)].filter(node => node && visible(node));
    const carrier = candidates.find(node => painted(properties(node))) || candidates[0];
    if (!carrier)
        return { props: {}, text: '' };
    let textNodes = 0;
    const ownText = (node, depth = 0) => {
        if (depth > 4 || textNodes >= 180)
            return '';
        return [...(node.childNodes || [])].map(child => {
            if (textNodes++ >= 180)
                return '';
            if (child.nodeType === 3)
                return child.textContent || '';
            if (child.nodeType !== 1 || !visible(child)
                || child.matches('style,script,template,button,label,input,select,textarea')
                || painted(properties(child)))
                return '';
            return ownText(child, depth + 1);
        }).join(' ');
    };
    return { props: properties(carrier), text: ownText(carrier) };
}
function detectSurfaceFamily(html, plain = '', sourceRoot = null, sourceProperties = null) {
    const source = String(html || '');
    const content = source.replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<(rm-think|rm-ticket)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
    const { props, text: carrierText } = surfaceCarrierEvidence(content, sourceRoot || parseToto(content), sourceProperties);
    const text = carrierText.toLowerCase();
    const backgrounds = [props['background-color'], props['background-image']].filter(Boolean).join('\n');
    const base = detectBaseColor(`background:${backgrounds};`);
    const color = extractCssColors(props['background-color'])[0];
    const imageColors = extractCssColors(props['background-image']);
    const opaqueImage = imageColors.length > 0 && imageColors.every(item => item.a === 1);
    const translucentCarrier = !opaqueImage && (color ? color.a < 1
        : /blur\(/i.test(props['backdrop-filter'] || props['-webkit-backdrop-filter'] || ''));
    if (__rmR("XvcDjnmnRi5j_krhlicxTAWgnVJq7AsKPKLJHYp20lO30P.j0V1qGxFhdt_eIdhDbYLHG9nY_OLd.ztSOHTyU.GRWipDDLuUK0kztfr2sFde7IOig9_Tx97KNcgbd4O8xbmvAe.MNxR3VJBdX6WJk7JB6AjgsHymn1LUraJWVVNcd.k874fJxmV.sKyXRo5lmttyoZkA9uplg1bj.lfCnSBVv2BQ3sYuxB8", "i").test(text))
        return 'surface: paper_or_document_surface';
    if (__rmR("T9OR56Go7n8UI2yTRaVkxGeL8niSIY8uY2a7kV5Jozs5MEIBopxDXANqoM3hpM9uBVarGJduprvgsOk6Kxk7hSLQoAXpSdM7R0Xrv2IhyZZdaG_v", "i").test(text)
        || translucentCarrier)
        return 'surface: glass_or_translucent_surface';
    if (__rmR("G.Zf25hOzgeoGrdckMroMuF_vbath8IHjk4HZBMT645b5pcicOnzxYmeSR20ocOBd0odVFrVtLUdfz7x2Dn4P3_mjPnYL69W1C6VuP9DTwCnBx1cjb.M2XUm", "i").test(text))
        return 'surface: metallic_or_hard_surface';
    if (__rmR("uo1Ou6cQN33Wf1x5EkoZ6wu8XS0CqGmkZBgi.D1z8S3jSh4lFVyZ2C.80i40V551pamStuladeUXNvAFaLQtoGrWK8heQ1Q1tv9stdRzy6kPadGH2vc74btZt2ELp_fjPd3LqNRHRD04DXCB7Vp5gk", "i").test(text))
        return 'surface: physical_material_surface';
    if (/radial-gradient|conic-gradient|linear-gradient|repeating-gradient/i.test(backgrounds))
        return 'surface: gradient_or_light_surface';
    if (__rmR("yGvFWYe__zU9bnSG4HDbqalAXhDnQhlDcBv7PiqD4uhfoAfNF7u5L8_Kou.AExboDXLOJ0IDYEXeQEJCUi8TbtcuEjAwdbiu0Mpz.uEAEav0yFFB_nu4jax189IoHZbcd4C08iT3QSkt7WI9FQG", "i").test(text) || base.includes(__rmT("a6Xaif")))
        return 'surface: digital_dark_surface';
    if (base.includes(__rmT("z2Zaif")))
        return 'surface: light_plain_surface';
    return 'surface: mixed_or_unspecified_surface';
}
function detectContourFamily(html, dom) {
    const text = String(html || '');
    if (/clip-path\s*:|polygon\(|path\(|<svg\b|mask\s*:/i.test(text))
        return 'contour: cutout_or_irregular_shape';
    if (/border-radius\s*:\s*50%|border-radius\s*:\s*999/i.test(text))
        return 'contour: circular_or_pill_shape';
    if (count(/border-radius\s*:/gi, text) >= 4 && count(/<div\b/gi, text) >= 8)
        return 'contour: rounded_panel_cluster';
    if ((dom?.maxSimilarRun || 0) >= 2)
        return 'contour: repeated_rectangular_blocks';
    if (/position\s*:\s*absolute|transform\s*:/i.test(text))
        return 'contour: layered_freeform_overlay';
    return 'contour: simple_or_mixed_outline';
}
function detectSpaceFamily(html, spatialSignalCount) {
    const text = String(html || '').replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, '');
    const positionedLayers = count(/position\s*:\s*absolute/gi, text);
    const depthLayers = count(/z-index\s*:/gi, text);
    if (positionedLayers >= 3 || (positionedLayers >= 2 && depthLayers >= 2))
        return 'space: layered_depth_or_spatial_scene';
    if (/display\s*:\s*grid|grid-template/i.test(text))
        return 'space: grid_plane';
    if (/display\s*:\s*flex/i.test(text))
        return 'space: flex_plane';
    if (positionedLayers > 0)
        return 'space: shallow_layered_surface';
    return 'space: flat_content_surface';
}
function detectLayout(html, dom, spatialSignalCount) {
    const text = String(html || '');
    const grid = /display\s*:\s*grid|grid-template|grid-area/i.test(text);
    const flexColumn = /display\s*:\s*flex;[^"']*flex-direction\s*:\s*column/i.test(text);
    const flexRow = /display\s*:\s*flex/i.test(text) && !flexColumn;
    const absolute = /position\s*:\s*absolute/i.test(text);
    const summary = /<summary\b/i.test(text);
    if (absolute && spatialSignalCount >= 4)
        return __rmT("FyOZnRLRaPS6SpfR9hdXd.mhtsl");
    if (grid)
        return __rmT("bDrrRAh_g_LetNuP");
    if (summary && (dom?.maxSimilarRun || 0) >= 2)
        return __rmT("DapvC2WkQrXkFUZl0oi9X5oodXTR_x3NkeWrXKw1HLnwph");
    if (flexColumn || count(/<div\b/gi, text) >= 10)
        return __rmT("cFruOdPTwNSgJVzJONMrXT");
    if (flexRow)
        return __rmT(".PKy0xbsTSDQkdIKrRuw6VU.");
    return __rmT("xqXgJ.T.jXZetNuP");
}
function detectReadingPath(html, spatialSignalCount) {
    const text = String(html || '');
    if (/timeline|left\s*:\s*\d+%|top\s*:\s*\d+%|position\s*:\s*absolute/i.test(text) && spatialSignalCount >= 3)
        return __rmT("2hMYUfH_Mtv.mHaaKnC");
    if (/display\s*:\s*grid|grid-template/i.test(text))
        return __rmT("2h84BmXKK4EiqfeuT3p");
    if (/flex-direction\s*:\s*column|<ul\b|<li\b/i.test(text))
        return __rmT("SrMzWrkS_HSgDhLv6uDQxk");
    return __rmT("EKxUOCHQaHyVq4TFhnbZGRCGOIf");
}
function detectInfoUnit(html, dom, repeated) {
    const text = String(html || '');
    if (/<table\b|display\s*:\s*table/i.test(text))
        return __rmT("4Xei3y5eKT3Iqn.Gnol");
    if (/position\s*:\s*absolute/i.test(text) && count(/<span\b/gi, text) >= 5)
        return __rmT("sP0qSomNChDQkUKTfikF8eHh");
    if ((dom?.maxSimilarRun || 0) >= 2 || (repeated?.maxRepeat || 0) >= 3)
        return __rmT("x3sA4T7oQWQ8RYWGno.SLwbem2f9jh");
    if (/<li\b/i.test(text))
        return __rmT("y95ZcvsHXo44lJed");
    return __rmT("d_RPcy.b0QHbXX79U_0Z7oWZvBz1of");
}
function detectMood(html, plain) {
    const text = `${html || ''}\n${plain || ''}`.toLowerCase();
    const hasArchive = __rmR("Mr6YDrI7PAMkNyt2nyhxfUaB77TOULwyXDyx79UkdRqjh3hnHJTirEYHA4YSweWht3ZWKfxTVPC61bLhug2phTR4TlkU1b6CuhguB0i56YVyJ625k1vAOzxY2B_NHT3rSs65BbYmAKnxfQ489Tg4PG3GfmC7EZm9vxp", "i").test(text);
    const hasControl = __rmR("bQxEbpe_PXtdgU0xcbVc0bVWPhgBYQ7Ex85Rs3oL1F0I1xcmK7uQI4K.ou.CExwotXLqJ0HDYlXlQ.aCSi8KbtxuiqAddbzua9pK.uBAGL5pPQjoB02X4VCLs9I8XfZPhnW8hNxtwqlj7Ef_gtC", "i").test(text);
    const hasPaper = __rmR("XjvnOSl_SGg8cTDvW5ao_w6CI0.yaNhvVlLfTy1m.OVB.rrqYJBB57NSHNvukeJEZRQMmyxDQTmexlvEg5Dbvnard2K29HUasPfrIYI2h7lTHJT9k1vwTJSL8tfassSO.ac8Dw5p2t.B1K7PHEJr3zIOQZY", "i").test(text);
    const hasNeon = __rmR("TX9i1cu_5639bn3dzxfmqaBAwhQ4QC8Dx8TUm_iu1FhyoATNs7BxL8lK2u.aEx5oDiLUJSRDLlXuQ.JCCo8abtcuS1AFd2XuWJpz.BGAFL5YPQjoB02S4khL6NIFX7yPh4WPhNct9WyPqRzV5MA", "i").test(text);
    if (hasArchive && hasControl)
        return __rmT("Mrc49YTQGM1mssXj4VY7YsDV0p47X4Ld");
    if (hasArchive)
        return __rmT("mbPiEokBAAtIcTeh0.66C_0ZexD");
    if (hasControl)
        return __rmT("m36xlsG7wLZzICWGSKEnoO1eSgmEHf");
    if (hasPaper)
        return __rmT("aH197YySzBLMD.dPCH5iJh");
    if (hasNeon)
        return __rmT("0fjbjXkBEHw3afehqZ4OWE0ZexD");
    if (__rmR("GntTcBefLBnnJcYsGdxVxhWux8yPcTy9COdbAT.r2V5aLAtl4JDmlb5iAapmDEWVlWyyQYBe5G8bpk", "i").test(text))
        return __rmT("CPlxG51VmbATYb7cqtI8q0rs");
    return __rmT("ARuoIzIxGaTFlY2Go2OEJlrrSgmEHf");
}
function buildVisualSkeleton(html, plain, metrics) {
    const composition = metrics.composition;
    return [
        ...Object.entries(composition).map(([key, value]) => `${key}: ${value}`),
        `surface_family: ${detectSurfaceFamily(html, plain, metrics.root, metrics.sourceProperties)}`,
        `contrast_family: ${detectContrastFamily(html)}`,
        `contour_family: ${detectContourFamily(html, metrics.dom)}`,
        `reading_family: ${detectReadingPath(html, metrics.spatialSignalCount)}`,
        `unit_family: ${detectInfoUnit(html, metrics.dom, metrics.repeated)}`,
        `space_family: ${detectSpaceFamily(html, metrics.spatialSignalCount)}`,
        `interaction_family: ${metrics.interactionFamily?.label || __rmT("nf9YUXS1eSorTROhT3_")}`,
        `mood: ${detectMood(html, plain)}`,
    ].join(__rmT("7os"));
}
function detectGlobalCssRisk(html) {
    const styles = [...String(html || '').matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]).join('\n');
    if (!styles)
        return false;
    return /(^|[}\s,])(html|body|:root|\*|\.mes|\.message|\.chat|\.content|\.ts-message-container|#chat|#send_form)\s*[{,]/i.test(styles);
}
function detectInnerDetailsUsed(root, html = '') {
    if (root?.querySelectorAll) {
        const outerDetails = root.matches?.('details')
            ? root
            : root.querySelector?.(':scope > details') || root.querySelector?.('details');
        return [...root.querySelectorAll('details')].some(details => details !== outerDetails);
    }
    return (String(html || '').match(/<details\b/gi) || []).length >= 2;
}
export function scanRabbitMirrorHtml(messageHtml, renderedToto = null) {
    const match = activeRoleColorHtml(messageHtml).match(TOTO_RE);
    if (!match)
        return { signature: '', skeleton: '', riskFlags: [], paletteFingerprint: null, interactionFamily: interactionFamilyRecord() };
    const html = match[0];
    const plain = stripTags(html);
    const tagCount = count(/<\w+\b/g, html);
    const divCount = count(/<div\b/gi, html);
    const repeated = extractStyleFingerprints(html);
    const dom = analyzeDomStructure(html);
    const root = parseToto(html);
    const textDensity = plain.length > 900 && tagCount < 65 ? __rmT("9HiLyDheE_O764M.") : plain.length > 520 ? __rmT("9HiLyDheE_S6gnM.") : __rmT("9HiLyDheE_SYss.F");
    const spatialSignalCount = count(/position\s*:\s*absolute|grid-area\s*:|grid-template|display\s*:\s*grid|transform\s*:|clip-path\s*:|mask\s*:|z-index\s*:|<svg\b|<path\b|radial-gradient|conic-gradient|repeating-gradient|aspect-ratio/gi, html);
    const effects = [];
    if (/animation\s*:|@keyframes|<marquee\b|<animate\b/i.test(html))
        effects.push(__rmT("1v3DFeKOGM7xHf"));
    else
        effects.push(__rmT("1v3DFeKOGMZBHT"));
    if (/linear-gradient|radial-gradient|conic-gradient|box-shadow|filter\s*:|backdrop-filter|mix-blend-mode|mask|clip-path/i.test(html))
        effects.push(__rmT("KLf3Dfcy7Q2VBXKf"));
    else
        effects.push(__rmT("KLf3Dfcy7Q2VBK3G"));
    if (spatialSignalCount >= 4)
        effects.push(__rmT("17odSYovAwWcTuUGRyA"));
    else if (spatialSignalCount >= 2)
        effects.push(__rmT("17odSYovAwWcTuUGDmT"));
    else
        effects.push(__rmT("17odSYovAwWcTuUGtXA"));
    const structural = [];
    if (dom.maxSimilarRun >= 3)
        structural.push(__rmT("SqBqbvqafVw4qKRgiR43PIg8OBG8JCxNpj5Lskjp.aFqck"));
    else if (dom.maxSimilarRun >= 2)
        structural.push(__rmT("xEdy0Orj0PNBqJ81PkZidi2.Jlh"));
    if (repeated.maxRepeat >= 4 || repeated.repeated >= 2)
        structural.push(__rmT("nbxiI74wkBpohb2AC3UrrEzaZMOZF8wc6XBJFrdgKzf"));
    else if (repeated.maxRepeat >= 3)
        structural.push(__rmT("xDFq0JT5azC9eiQDCimeMYFd"));
    if (/display\s*:\s*flex;[^"']*flex-direction\s*:\s*column/i.test(html) && divCount >= 10)
        structural.push(__rmT("cFruOdPTwNOo40ZXSQ28Tf"));
    if (spatialSignalCount < 2 && plain.length > 520 && (dom.maxSimilarRun >= 2 || repeated.maxRepeat >= 3 || divCount >= 10))
        structural.push(__rmT("giW1aAkxLULW9at1CXqnQ.NlZMSO6hbQU5PWM0ot1op"));
    if (count(/border-radius\s*:/gi, html) >= 4 && count(/padding\s*:/gi, html) >= 6)
        structural.push(__rmT("JMUGcw_ebsIfyzzO"));
    if (count(/<!--/g, html) > 0)
        structural.push(__rmT("Jim_ASrSR3uU11HD4uibAh"));
    if (/<pre\b|<code\b|```/i.test(html))
        structural.push(__rmT("e4.DmYInseE7ek"));
    if (detectGlobalCssRisk(html))
        structural.push(__rmT("KDfbOvJSOWIckh34xRdSJWzW"));
    const composition = detectCompositionFingerprint(root);
    const riskFlags = detectRiskFlags({ root, html, plain, dom, repeated, spatialSignalCount, composition });
    if (detectInnerDetailsUsed(root, html))
        riskFlags.unshift('inner_details_used');
    if (riskFlags.includes('same_block_stack'))
        structural.push(__rmT("CD12wD4.iOIxeLIqKXaSJWzW"));
    if (riskFlags.includes('same_grid_card_risk'))
        structural.push(__rmT("CD12w443M701nfUtfydSJWzW"));
    if (riskFlags.includes('catalog_page_risk'))
        structural.push(__rmT("BlnZZXkB026IcvYmU5blZODdVhC"));
    if (riskFlags.includes('flat_vertical_flow'))
        structural.push(__rmT("vsrq0jHd_Hv71.1PIKhcdODdVhC"));
    if (riskFlags.includes('repeated_unit_shape'))
        structural.push(__rmT("YTyPhpHQaHtIaaCxShG1.xDdVhC"));
    if (riskFlags.includes('info_page_degrade'))
        structural.push(__rmT("OSDKbguRwmX5sJz0uvf"));
    if (riskFlags.includes('weak_media_body'))
        structural.push(__rmT("sge4Wp4VJHWzDDrrZrSwlf"));
    if (riskFlags.includes('weak_spatial_complexity'))
        structural.push(__rmT("F9XPnd56UxokjzUmQirSJWzW"));
    if (riskFlags.includes('missing_interaction'))
        structural.push(__rmT("LQzu0djVl2lDDeOQDPFYMf"));
    if (riskFlags.includes('fake_interaction'))
        structural.push(__rmT("Iibv1W3buOg9gl9D_y0hGQpbYCi.wh"));
    if (riskFlags.includes('visual_promise_unfulfilled'))
        structural.push(__rmT("LUvLYO6kgmElun3XHsaSJWzW"));
    if (riskFlags.includes('missing_visual_program'))
        structural.push(__rmT("8gLhQzIqc0VuxW8cDJkceWBuMdOT8zV3N.Hai1ZERXCaRAWB"));
    structural.push(...dom.summaryFlags);
    const mediaStrength = (/clip-path|mask|<svg\b|<path\b|position\s*:\s*absolute|transform\s*:|border-radius\s*:\s*50%|aspect-ratio|radial-gradient|conic-gradient/i.test(html) && tagCount >= 35)
        ? __rmT("wM7xpZ4IxlS6g3xG") : (tagCount >= 40 ? __rmT("wM7xpZ4IxlS6gNKl") : __rmT("QZXzvqdg6QcQWf"));
    const summary = [mediaStrength, ...structural.slice(0, 6), textDensity, ...effects]
        .filter(Boolean)
        .join(__rmT("7os"));
    const interactionFamily = detectInteractionFamily(root, html);
    interactionFamily.observedRecipeIds = observedRecipeIds(root, interactionFamily);
    const sourceProperties = root ? paletteSourceProperties(html, root) : null;
    const skeleton = buildVisualSkeleton(html, plain, { root, sourceProperties, dom, repeated, spatialSignalCount, interactionFamily, composition });
    const paletteFingerprint = detectPaletteFingerprint(html, renderedToto, root, sourceProperties);
    return { signature: summary.slice(0, 280), skeleton: skeleton.slice(0, VISUAL_SKELETON_MAX_CHARS), riskFlags, paletteFingerprint, interactionFamily };
}
function normalizedText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}
function rawSummaryText(messageHtml) {
    const match = String(messageHtml || '').match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i);
    return match ? normalizedText(stripTags(match[1])) : '';
}
function renderedSummaryText(root) {
    const summary = root?.querySelector?.('summary');
    if (!summary)
        return '';
    const clone = summary.cloneNode(true);
    clone.querySelectorAll?.('button, [data-rabbit-mirror-maintenance-rabbit], [data-rabbit-mirror-feedback-cat], [data-rabbit-mirror-tool-entry-host]')
        ?.forEach?.(node => node.remove());
    return normalizedText(clone.textContent || '');
}
function isRenderedRabbitMirrorDetails(details) {
    if (!details?.matches?.('details'))
        return false;
    const title = renderedSummaryText(details);
    return __rmR("T.etM5j5OZ.MU5Awg2FanYfx", "").test(title) || title.includes(__rmT("9.JSSv1i"));
}
function findMirrorRootInScope(scope) {
    if (!scope?.querySelector)
        return null;
    const wrapped = scope.querySelector('toto[data-rabbit-mirror="true"], toto[data-rabbit-hole="true"]');
    if (wrapped)
        return wrapped;
    const details = [...scope.querySelectorAll('details')].filter(isRenderedRabbitMirrorDetails);
    return details[details.length - 1] || null;
}
function findRenderedToto(message, chat, messageHtml) {
    if (typeof document === 'undefined')
        return null;
    const messageIndex = Array.isArray(chat) ? chat.lastIndexOf(message) : -1;
    const scopes = [];
    if (messageIndex >= 0) {
        for (const selector of [
            `.mes[mesid="${messageIndex}"]`,
            `.mes[data-message-id="${messageIndex}"]`,
            `.mes[data-messageid="${messageIndex}"]`,
        ]) {
            try {
                const scope = document.querySelector(selector);
                if (scope)
                    scopes.push(scope);
            }
            catch {
            }
        }
    }
    for (const scope of scopes) {
        const found = findMirrorRootInScope(scope);
        if (found)
            return found;
    }
    const expectedSummary = rawSummaryText(messageHtml);
    const wrapped = [...document.querySelectorAll('toto[data-rabbit-mirror="true"], toto[data-rabbit-hole="true"]')];
    const orphanDetails = [...document.querySelectorAll('details')]
        .filter(isRenderedRabbitMirrorDetails)
        .filter(details => !details.closest('toto[data-rabbit-mirror="true"], toto[data-rabbit-hole="true"]'));
    const all = [...wrapped, ...orphanDetails];
    if (expectedSummary) {
        const matched = all.filter(root => renderedSummaryText(root) === expectedSummary);
        if (matched.length)
            return matched[matched.length - 1];
    }
    return all[all.length - 1] || null;
}
function exactMessageScopes(chat, messageIndex) {
    if (typeof document === 'undefined' || !Number.isInteger(messageIndex) || messageIndex < 0)
        return [];
    const scopes = [];
    const seen = new Set();
    for (const selector of [
        `.mes[mesid="${messageIndex}"]`,
        `.mes[data-message-id="${messageIndex}"]`,
        `.mes[data-messageid="${messageIndex}"]`,
    ]) {
        try {
            for (const scope of [...document.querySelectorAll(selector)].slice(0, 8)) {
                if (scope?.isConnected && !seen.has(scope)) {
                    seen.add(scope);
                    scopes.push(scope);
                }
            }
        }
        catch { }
    }
    return scopes;
}
function terminalFollowOwnerKey(chat, messageIndex) {
    return `${getCurrentChatKey(Array.isArray(chat) ? chat : [])}\u0000${Number(messageIndex)}`;
}
function followOwnerStillCurrent(set, chat) {
    const owner = set?.owner;
    const message = Array.isArray(chat) ? chat[owner?.messageIndex] : null;
    const swipeId = Number.isInteger(message?.swipe_id) ? message.swipe_id : -1;
    return !!owner && owner.chatKey === getCurrentChatKey(Array.isArray(chat) ? chat : [])
        && message === owner.message
        && swipeId === owner.swipeId
        && rabbitMirrorMessageSourceHash(message) === owner.sourceHash;
}
export function getRabbitMirrorFollowBatchFailure(chat, messageIndex) {
    const key = terminalFollowOwnerKey(chat, messageIndex);
    const entry = rejectedFollowBatches.get(key);
    if (!entry || !followOwnerStillCurrent(entry, chat))
        return null;
    return { ...entry.failure };
}
function clearFollowBatchFailure(chat, messageIndex) {
    const key = terminalFollowOwnerKey(chat, messageIndex);
    const entry = rejectedFollowBatches.get(key);
    entry?.notice?.remove?.();
    rejectedFollowBatches.delete(key);
}
function followMultifaceRejection(code, terminalFace, message) {
    const error = new Error(String(message || __rmT("lsZgg3KQAwb.E67nqbREEIXm5UOEfdoTY0Mspf")));
    error.rabbitMirrorFollowRejection = true;
    error.code = String(code || 'multiface-sanitized-invalid');
    error.terminalFace = Number.isInteger(terminalFace) ? terminalFace : null;
    return error;
}
function rejectFollowBatch(set, chat, error) {
    if (!followOwnerStillCurrent(set, chat))
        return false;
    const key = terminalFollowOwnerKey(chat, set.owner.messageIndex);
    clearFollowBatchFailure(chat, set.owner.messageIndex);
    const failure = {
        kind: 'follow-multiface-rejected',
        chatKey: set.owner.chatKey,
        messageIndex: Number(set.owner.messageIndex),
        swipeId: set.owner.swipeId,
        sourceHash: String(set.owner.sourceHash || ''),
        batchId: String(set.batchId || ''),
        operationId: String(set.identity?.operationId || ''),
        code: String(error.code || 'multiface-sanitized-invalid'),
        terminalFace: error.terminalFace,
        expectedFaceCount: set.faces.length,
        requestCount: 1,
        message: String(error.message || __rmT("lsZgg3KQAwb.E67nqbREEIXm5UOEfdoTY0Mspf")),
    };
    const entry = { owner: { ...set.owner }, failure, notice: null };
    const scopes = exactMessageScopes(chat, set.owner.messageIndex);
    const proven = scopes.map(scope => ({ scope, matched: matchRenderedFollowFaces(scope, set, error.preparedFaces) }))
        .filter(item => item.matched);
    if (proven.length === 1) {
        const { matched } = proven[0];
        for (const item of matched) {
            clearSanitizedRabbitMirrorFaceProof(item.root);
            item.root.remove();
        }
    }
    const noticeScope = proven.length === 1 ? proven[0].scope : scopes.length === 1 ? scopes[0] : null;
    if (noticeScope) {
        const notice = document.createElement('div');
        notice.setAttribute('data-rabbit-mirror-follow-failure', 'true');
        notice.setAttribute('role', 'status');
        notice.textContent = `${__rmT("vDfth4AqX73bB1UNIKx3M5vs")}${failure.terminalFace ? `${__rmT("KW5o9cc6")}${failure.terminalFace}/${failure.expectedFaceCount}${__rmT("qGyf7qZp")}` : ''}${__rmT("7ys")}${failure.message}${__rmT("3I1CO3lBi.slpK9CCRh6jWaHFClZh9BOUQmsXfWdGX959a4MpXq_Hq5X")}`;
        noticeScope.appendChild(notice);
        entry.notice = notice;
    }
    if (rejectedFollowBatches.size >= 32)
        rejectedFollowBatches.delete(rejectedFollowBatches.keys().next().value);
    rejectedFollowBatches.set(key, entry);
    releaseRabbitMirrorFollowBatch({ batchId: set.batchId, operationId: set.identity?.operationId });
    terminalFollowMessageIndexes.delete(key);
    try {
        globalThis.dispatchEvent?.(new CustomEvent(FOLLOW_MULTIFACE_REJECTED_EVENT, { detail: { ...failure } }));
    }
    catch { }
    return true;
}
const FOLLOW_TOTO_SELECTOR = 'toto[data-rabbit-mirror="true"]';
function directDetailsChild(root) {
    if (!root?.children)
        return null;
    const matches = [...root.children].filter(child => String(child?.tagName || '').toLowerCase() === 'details');
    return matches.length === 1 ? matches[0] : null;
}
function directSummaryChild(details) {
    if (!details?.children)
        return null;
    const matches = [...details.children].filter(child => String(child?.tagName || '').toLowerCase() === 'summary');
    return matches.length === 1 ? matches[0] : null;
}
function isUsableSanitizedDetails(details) {
    if (!details || !directSummaryChild(details))
        return false;
    return [...(details.childNodes || [])].some(node => {
        if (node?.nodeType === 3)
            return normalizedText(node.textContent || '').length > 0;
        if (node?.nodeType !== 1)
            return false;
        return !new Set(['summary', 'style', 'script', 'template', 'link', 'meta']).has(String(node.tagName || '').toLowerCase());
    });
}
function topLevelFollowTotos(scope) {
    if (!scope?.querySelectorAll)
        return [];
    return [...scope.querySelectorAll(FOLLOW_TOTO_SELECTOR)].filter(root => {
        const ancestor = root.parentElement?.closest?.(FOLLOW_TOTO_SELECTOR);
        return !ancestor || !scope.contains(ancestor);
    });
}
function sourceFaceTitle(face) {
    if (typeof document === 'undefined')
        return normalizedText(stripTags(face?.summaryHtml || ''));
    const template = document.createElement('template');
    template.innerHTML = String(face?.html || '');
    const details = directDetailsChild(templateSingleFollowRoot(template));
    return details ? renderedSummaryText(details) : '';
}
const followPresentationFormatsById = new Map(PRESENTATION_FORMATS.map(item => [String(item.id), item]));
function followSelectedFormatDescriptors(metadata = {}) {
    const external = new Map((Array.isArray(metadata.formatDescriptors) ? metadata.formatDescriptors : []).slice(0, 8)
        .filter(item => item && typeof item.id === 'string' && item.id.startsWith('ext:')).map(item => [item.id, item]));
    return (Array.isArray(metadata.formatIds) ? metadata.formatIds : []).map(id => {
        const builtin = followPresentationFormatsById.get(String(id));
        if (builtin)
            return { id: String(id), title: String(builtin.title || ''), summary: String(builtin.summary || ''), tags: Array.isArray(builtin.tags) ? [...builtin.tags] : [] };
        const item = external.get(String(id));
        return { id: String(id), title: String(item?.title || '').slice(0, 160), summary: String(item?.summary || '').slice(0, 210), tags: Array.isArray(item?.tags) ? item.tags.filter(tag => typeof tag === 'string').slice(0, 4).map(tag => tag.slice(0, 64)) : [] };
    });
}
function matchRenderedFollowFaces(scope, set, preparedFaces = null) {
    const faces = Array.isArray(set?.faces) ? set.faces : [];
    const titles = faces.map(sourceFaceTitle);
    if (titles.some(title => !title) || new Set(titles).size !== titles.length)
        return null;
    const displayTitles = faces.map((face, index) => preparedFaces?.[index]?.expectedTitle || titles[index]);
    const candidates = topLevelFollowTotos(scope)
        .map(root => ({ root, details: directDetailsChild(root) }))
        .filter(item => item.details && scope.contains(item.root));
    if (candidates.length !== faces.length)
        return null;
    const matched = [];
    const used = new Set();
    for (let faceIndex = 0; faceIndex < faces.length; faceIndex += 1) {
        const matches = candidates.filter(item => !used.has(item.root)
            && [titles[faceIndex], displayTitles[faceIndex]].includes(renderedSummaryText(item.details)));
        if (matches.length !== 1)
            return null;
        used.add(matches[0].root);
        matched.push({ ...matches[0], sourceFace: faces[faceIndex], faceIndex });
    }
    const parent = matched[0]?.root?.parentElement;
    if (!parent || matched.some(item => item.root.parentElement !== parent))
        return null;
    const positions = matched.map(item => [...parent.children].indexOf(item.root));
    if (positions.some(position => position < 0))
        return null;
    if (positions.some((position, index) => index > 0 && position <= positions[index - 1]))
        return null;
    return matched;
}
function templateSingleFollowRoot(template) {
    const significant = [...(template?.content?.childNodes || [])].filter(node => {
        if (node?.nodeType === 1)
            return true;
        return node?.nodeType === 3 && normalizedText(node.textContent || '').length > 0;
    });
    if (significant.length !== 1 || significant[0]?.nodeType !== 1)
        return null;
    const root = significant[0];
    return root.matches?.(FOLLOW_TOTO_SELECTOR) ? root : null;
}
function loadFollowBatchSanitizer() {
    if (!followBatchSanitizerModulePromise) {
        followBatchSanitizerModulePromise = import('./outputSanitizer.js?rmv=2.0.1').catch(error => {
            followBatchSanitizerModulePromise = null;
            console.debug('[RabbitMirror] follow multiface sanitizer unavailable:', error);
            return null;
        });
    }
    return followBatchSanitizerModulePromise;
}
function verifyMountedFollowFaces(scope, prepared) {
    if (!scope || !Array.isArray(prepared) || prepared.length < 2 || prepared.length > 5)
        return false;
    const parent = prepared[0]?.newRoot?.parentElement;
    if (!parent || prepared.some(item => item.newRoot.parentElement !== parent || !scope.contains(item.newRoot)))
        return false;
    const positions = prepared.map(item => [...parent.children].indexOf(item.newRoot));
    if (positions.some(position => position < 0))
        return false;
    if (positions.some((position, index) => index > 0 && position <= positions[index - 1]))
        return false;
    return prepared.every(item => {
        const details = directDetailsChild(item.newRoot);
        return details === item.newDetails
            && isUsableSanitizedDetails(details)
            && renderedSummaryText(details) === item.expectedTitle;
    });
}
function rollbackMountedFollowFaces(prepared) {
    for (let index = prepared.length - 1; index >= 0; index -= 1) {
        const item = prepared[index];
        clearSanitizedRabbitMirrorFaceProof(item.newRoot);
        if (item.newRoot?.parentNode === item.parent) {
            try {
                item.parent.replaceChild(item.oldRoot, item.newRoot);
            }
            catch { }
        }
        if (item.createdRoot && item.oldRoot?.parentNode === item.parent)
            item.oldRoot.remove();
    }
}
function prepareFollowFaces(set, sanitizer) {
    if (!sanitizer?.sanitizeRabbitMirrorUntrustedTemplate
        || !sanitizer?.compactTotoBlock
        || !sanitizer?.isolateRabbitMirrorInteractionIds
        || !sanitizer?.refreshRabbitMirrorToolsInScope)
        return null;
    const prepared = [];
    for (let faceIndex = 0; faceIndex < set.faces.length; faceIndex += 1) {
        const sourceFace = set.faces[faceIndex];
        try {
            if (sourceFace.failure)
                throw followMultifaceRejection(sourceFace.failure.code, faceIndex + 1, __rmT("wiQZY9VzmvoBc7Ho4DD"));
            const template = document.createElement('template');
            template.innerHTML = String(sourceFace?.html || '');
            if (template.content.querySelector(`[data-rabbit-mirror-css-scope], [${MULTIFACE_FAILURE_ATTR}]`)) {
                throw followMultifaceRejection('multiface-untrusted-css-scope', faceIndex + 1, __rmT("7lBvlyChDjaWNUWFnehQv83hGirYft53BAZP0uFRWRMeGhd0siwoRgztx7u.T9WFYyuY3h"));
            }
            template.innerHTML = sanitizer.compactTotoBlock(bindRolePaletteCode(String(sourceFace?.html || ''), sourceFace.metadata));
            if (!sanitizer.sanitizeRabbitMirrorUntrustedTemplate(template)) {
                throw followMultifaceRejection('multiface-sanitizer-rejected', faceIndex + 1, __rmT("VeR7HXouH7atXl309g.cpqR9_.WMUnWTlnzkq8UxwY2B4R6DOhsr7f"));
            }
            const newRoot = templateSingleFollowRoot(template);
            const newDetails = directDetailsChild(newRoot);
            if (!newRoot || !newDetails || !isUsableSanitizedDetails(newDetails)) {
                throw followMultifaceRejection('multiface-sanitized-invalid', faceIndex + 1, __rmT("eaOU9kme930O1drj46nE9k.yBwi.nGcluxJeK7tnp4Ow3f_5quxMUJIS5g7IgjXVWUE"));
            }
            const expectedTitle = renderedSummaryText(newDetails);
            const item = { sourceFace, faceIndex, expectedTitle, newRoot, newDetails,
                sourceHash: rabbitMirrorMultifaceSourceHash(sourceFace.html) };
            prepared.push(item);
            if (!expectedTitle || prepared.slice(0, -1).some(other => other.expectedTitle === expectedTitle)) {
                const error = followMultifaceRejection(!expectedTitle ? 'multiface-sanitized-empty-summary' : 'multiface-sanitized-duplicate-summary', faceIndex + 1, __rmT("cm0qlmzzyK.Lf_uRJFZ6dkZk.SW0F5fiZUnS_28QcbqNOX6U.Y_NiWyY_D1Wb00x9w0pOonYyF1vdbEuQOLxLdGu"));
                error.preparedFaces = prepared;
                throw error;
            }
        }
        catch (error) {
            if (!error?.rabbitMirrorFollowRejection)
                throw error;
            if (prepared.at(-1)?.faceIndex === faceIndex)
                prepared.pop();
            const code = String(error.code || 'multiface-postprocess');
            const html = createMultifaceFailureSlot(faceIndex, code);
            const template = document.createElement('template');
            template.innerHTML = html;
            const newRoot = templateSingleFollowRoot(template), newDetails = directDetailsChild(newRoot);
            prepared.push({ sourceFace, faceIndex, newRoot, newDetails, expectedTitle: renderedSummaryText(newDetails),
                sourceHash: rabbitMirrorMultifaceSourceHash(sourceFace.html), failure: { faceIndex, status: 'failed', code } });
        }
    }
    if (prepared.every(item => item.failure))
        throw followMultifaceRejection('multiface-all-failed', null, __rmT("Buo0apw.0pi__Rekil7sUZ2FFuXGJNGOCBlld_GIVYhZZ7xIq8_"));
    return prepared;
}
function sanitizeAndMountFollowFaces(scope, set, sanitizer, preparedFaces = null) {
    const detached = preparedFaces || prepareFollowFaces(set, sanitizer);
    if (!detached)
        return null;
    let matched = matchRenderedFollowFaces(scope, set, detached);
    if (!matched && set.partial && set.owner) {
        const candidates = topLevelFollowTotos(scope);
        const parent = candidates[0]?.parentNode;
        const ordinals = candidates.map(root => Number(root.getAttribute('data-rm-face')) - 1);
        if (parent && candidates.length <= detached.length && new Set(ordinals).size === ordinals.length
            && candidates.every((root, index) => root.parentNode === parent && Number.isInteger(ordinals[index]) && ordinals[index] >= 0 && ordinals[index] < detached.length)) {
            const trusted = detached.every(item => {
                const root = candidates[ordinals.indexOf(item.faceIndex)];
                return item.sourceFace.failure || (root && [sourceFaceTitle(item.sourceFace), item.expectedTitle].includes(renderedSummaryText(directDetailsChild(root))));
            });
            if (trusted) {
                matched = detached.map(item => {
                    let root = candidates[ordinals.indexOf(item.faceIndex)];
                    const createdRoot = !root;
                    if (createdRoot) {
                        root = document.createElement('toto');
                        parent.append(root);
                    }
                    return { root, createdRoot, details: directDetailsChild(root), sourceFace: item.sourceFace, faceIndex: item.faceIndex };
                });
            }
        }
    }
    if (!matched)
        return null;
    const prepared = matched.map((item, index) => {
        const safe = detached[index];
        if (item.details?.open)
            safe.newDetails.open = true;
        else
            safe.newDetails.removeAttribute('open');
        return { ...item, ...safe, persistedHtml: safe.newRoot.outerHTML, parent: item.root.parentNode, oldRoot: item.root };
    });
    if (prepared.length !== set.faces.length || prepared.some(item => !item.parent || !item.oldRoot.isConnected))
        return null;
    let mounted = 0;
    try {
        for (const item of prepared) {
            if (item.oldRoot.parentNode !== item.parent)
                throw new Error('follow multiface DOM owner changed');
            item.parent.replaceChild(item.newRoot, item.oldRoot);
            mounted += 1;
        }
        for (const item of prepared) {
            sanitizer.isolateRabbitMirrorInteractionIds(item.newRoot);
            sanitizer.refreshRabbitMirrorToolsInScope(item.newRoot);
        }
        if (!verifyMountedFollowFaces(scope, prepared))
            throw new Error('follow multiface mounted structure mismatch');
        const failedFaces = prepared.filter(item => item.failure).map(item => item.failure);
        if (failedFaces.length && set.owner) {
            const persistedFaces = prepared.map(item => item.failure ? createMultifaceFailureSlot(item.faceIndex, item.failure.code) : item.persistedHtml);
            const html = persistedFaces.join('\n');
            if (!saveFollowPartialResult(set.owner.chat, set.owner.messageIndex, set.owner, html, failedFaces, getSettings()?.rabbitMirrorBannedWords || [], String(set.batchId || ''))) {
                const error = new Error('follow partial result persistence failed');
                error.code = 'follow-partial-storage-failed';
                throw error;
            }
            for (const item of prepared) {
                item.sourceHash = rabbitMirrorMultifaceSourceHash(persistedFaces[item.faceIndex]);
                item.sourceFace = { ...item.sourceFace, html: persistedFaces[item.faceIndex] };
            }
        }
        for (const item of prepared) {
            if (!markSanitizedRabbitMirrorFace(item.newRoot, {
                faceIndex: item.faceIndex,
                faceCount: prepared.length,
                sourceHash: item.sourceHash,
                origin: 'follow',
                ...presentationModeFields(item.sourceFace.metadata),
            }))
                throw new Error('follow multiface proof rejected');
        }
        if (prepared.some(item => {
            const proof = getSanitizedRabbitMirrorFaceProof(item.newRoot);
            return !proof || proof.origin !== 'follow'
                || proof.faceIndex !== item.faceIndex
                || proof.faceCount !== prepared.length
                || proof.sourceHash !== item.sourceHash;
        }))
            throw new Error('follow multiface proof mismatch');
        return prepared.map(item => ({
            root: item.newRoot,
            details: item.newDetails,
            proof: getSanitizedRabbitMirrorFaceProof(item.newRoot),
            sourceFace: item.sourceFace,
            failure: item.failure || null,
        }));
    }
    catch (error) {
        rollbackMountedFollowFaces(prepared.slice(0, mounted));
        if (error?.code === 'follow-partial-storage-failed' && followOwnerStillCurrent(set, set.owner?.chat)) {
            const owner = set.owner;
            const key = JSON.stringify([owner.chatKey, owner.messageIndex, owner.swipeId, owner.sourceHash]);
            if (!followPartialStorageWarnings.has(key) && typeof globalThis.toastr?.warning === 'function') {
                if (followPartialStorageWarnings.size >= 32)
                    followPartialStorageWarnings.delete(followPartialStorageWarnings.values().next().value);
                followPartialStorageWarnings.add(key);
                try {
                    globalThis.toastr.warning(__rmT("r3bRtyJzy2zfN_OyUV5eDZZIS.3h5a4o8mZzC1LwAY_0MgobzzAAznz1w9MILYJDOo8E2FoXJhP68kueiVgpsZgt3XsGZ3wyyWvRuNhZt_95nxUgEN2gdRSczzcG6Peujy8WEM0mhmDbY6IK30Qn1k"));
                }
                catch { }
            }
        }
        console.debug('[RabbitMirror] follow multiface transactional mount skipped:', error);
        return null;
    }
}
function provenRenderedFollowFaces(set, chat, sanitizer) {
    const messageIndex = set?.owner?.messageIndex;
    if (!set || !Array.isArray(set.faces) || set.faces.length < 2 || set.faces.length > 5)
        return null;
    if (!followOwnerStillCurrent(set, chat))
        return null;
    const prepared = prepareFollowFaces(set, sanitizer);
    if (!prepared)
        return null;
    const scopes = exactMessageScopes(chat, messageIndex)
        .filter(scope => set.partial || !!matchRenderedFollowFaces(scope, set, prepared));
    if (scopes.length !== 1)
        return null;
    return sanitizeAndMountFollowFaces(scopes[0], set, sanitizer, prepared);
}
function authorizeFreshFollowDraws(owner, rendered) {
    const settings = getSettings();
    if (!owner || settings.enabled === false || settings.generationSource !== 'follow' || settings.builtinImageEnabled !== true)
        return;
    const accepted = rendered.filter(item => !item.failure && item.root?.isConnected);
    if (!accepted.length)
        return;
    const { chat, message, chatKey, messageIndex, swipeId } = owner;
    const getOutputIdentity = () => {
        if (owner.getOutputIdentity?.() !== owner.outputIdentity)
            return '';
        return readFollowPartialResult(chat, chat.indexOf(message))?.html || owner.outputIdentity;
    };
    const outputIdentity = getOutputIdentity();
    const whole = accepted.length === rendered.length;
    if (whole)
        markFreshDrawSlot(chatKey, messageIndex, swipeId, null, { message, outputIdentity, getOutputIdentity });
    else
        for (const item of accepted)
            markFreshDrawSlot(chatKey, messageIndex, swipeId, item.proof.faceIndex, { message, outputIdentity, getOutputIdentity });
    void import('./builtinImage.js?rmv=2.0.1').then(module => {
        for (const item of accepted) {
            const index = chat.indexOf(message), face = item.proof?.faceIndex ?? null;
            if (item.root?.isConnected && index >= 0 && isFreshDrawSlot(chatKey, index, swipeId, face))
                module.fillBuiltinImageFrames(item.details || item.root);
        }
    }).catch(error => console.debug('[RabbitMirror] new follow image wake skipped:', error));
}
function settlePendingFollowDraws(chat) {
    for (const [key, candidate] of pendingFollowDraws) {
        if (candidate.chat !== chat)
            continue;
        if (chat[candidate.messageIndex] !== candidate.message || String(candidate.message.mes || '') !== candidate.source
            || !exactMessageScopes(chat, candidate.messageIndex).includes(candidate.scope)
            || candidate.rendered.some((item, index) => !item.failure && (!item.root?.isConnected || !candidate.scope.contains(item.root)
                || !item.root.contains(item.details) || followDrawContentIdentity(item.details, candidate.adoptDrawNotes) !== candidate.identities[index]))) {
            pendingFollowDraws.delete(key);
            continue;
        }
        const owner = commitRabbitMirrorFollowSingle(chat, candidate.message, candidate.source);
        if (!owner)
            continue;
        pendingFollowDraws.delete(key);
        authorizeFreshFollowDraws(owner, candidate.rendered);
    }
}
async function scanFollowBatches(chat, lifecycle = visualScannerLifecycle) {
    let committed = 0;
    const terminalMessageIndexes = getRabbitMirrorFollowBatchTargetIndexes(chat).filter(index => terminalFollowMessageIndexes.has(terminalFollowOwnerKey(chat, index)));
    const sets = getRabbitMirrorFollowBatchSources(chat, { terminalMessageIndexes });
    const sanitizer = sets.length ? await loadFollowBatchSanitizer() : null;
    const imageModule = sets.length ? await import('./builtinImage.js?rmv=2.0.1').catch(() => null) : null;
    if (lifecycle !== visualScannerLifecycle)
        return committed;
    for (const set of sets) {
        if (lifecycle !== visualScannerLifecycle)
            break;
        if (followBatchScansInFlight.has(set.batchId))
            continue;
        const previousFailure = getRabbitMirrorFollowBatchFailure(chat, set.owner.messageIndex);
        if (previousFailure?.batchId === set.batchId)
            continue;
        if (rejectedFollowBatches.has(terminalFollowOwnerKey(chat, set.owner.messageIndex))) {
            clearFollowBatchFailure(chat, set.owner.messageIndex);
        }
        followBatchScansInFlight.add(set.batchId);
        const attemptKey = `${set.batchId}\u0000${set.owner.sourceHash}`;
        const attempts = Number(followBatchScanAttempts.get(attemptKey) || 0) + 1;
        if (!followBatchScanAttempts.has(attemptKey) && followBatchScanAttempts.size >= 24) {
            followBatchScanAttempts.delete(followBatchScanAttempts.keys().next().value);
        }
        followBatchScanAttempts.set(attemptKey, attempts);
        try {
            const rendered = provenRenderedFollowFaces(set, chat, sanitizer);
            if (!rendered || lifecycle !== visualScannerLifecycle || !followOwnerStillCurrent(set, chat))
                continue;
            const scans = rendered.map(({ sourceFace, root, failure }, faceIndex) => failure ? null : ({
                faceIndex,
                ...scanRabbitMirrorHtml(root.outerHTML, root),
            }));
            if (scans.length !== set.faces.length)
                continue;
            if (commitRabbitMirrorFollowBatch(set.batchId, chat, scans, { ...set.owner, partial: scans.some(scan => scan === null) })) {
                committed += 1;
                const freshOwner = commitRabbitMirrorFollowSingle(chat, set.owner.message, set.owner.message.mes);
                if (freshOwner)
                    authorizeFreshFollowDraws(freshOwner, rendered);
                else if (imageModule?.adoptDrawNotes) {
                    const scopes = exactMessageScopes(chat, set.owner.messageIndex);
                    const scope = scopes.length === 1 && rendered.every(item => item.failure || scopes[0].contains(item.root)) ? scopes[0] : null;
                    if (pendingFollowDraws.size >= 8)
                        pendingFollowDraws.delete(pendingFollowDraws.keys().next().value);
                    if (scope)
                        pendingFollowDraws.set(set.batchId, { chat, message: set.owner.message, messageIndex: set.owner.messageIndex,
                            source: String(set.owner.message.mes || ''), rendered, scope, adoptDrawNotes: imageModule.adoptDrawNotes,
                            identities: rendered.map(item => item.failure ? '' : followDrawContentIdentity(item.details, imageModule.adoptDrawNotes)) });
                }
                rendered.forEach(({ root, details, failure }, faceIndex) => {
                    if (failure)
                        return;
                    const ref = { batchId: set.batchId, faceIndex };
                    bindVisualHistoryTarget(root, ref);
                    if (details)
                        bindVisualHistoryTarget(details, ref);
                });
                followBatchScanAttempts.delete(attemptKey);
                terminalFollowMessageIndexes.delete(terminalFollowOwnerKey(chat, set.owner.messageIndex));
                try {
                    globalThis.dispatchEvent?.(new CustomEvent(FOLLOW_MULTIFACE_COMMITTED_EVENT, {
                        detail: { messageIndex: Number(set.owner.messageIndex), sourceHash: String(set.owner.sourceHash || ''), batchId: String(set.batchId || '') },
                    }));
                }
                catch { }
                const feedbackResult = consumeInjectedFeedbackForSuccessfulRabbitMirror(set.owner.message);
                if (feedbackResult?.consumed)
                    console.debug('[RabbitMirror] feedback cat consumed:', feedbackResult.remainingRounds);
                console.debug('[RabbitMirror] follow multiface visual batch committed:', set.batchId, scans.length);
            }
        }
        catch (error) {
            if (error?.rabbitMirrorFollowRejection && lifecycle === visualScannerLifecycle) {
                rejectFollowBatch(set, chat, error);
                followBatchScanAttempts.delete(attemptKey);
            }
            else {
                console.debug('[RabbitMirror] follow multiface preparation unavailable:', error);
            }
        }
        finally {
            followBatchScansInFlight.delete(set.batchId);
        }
    }
    for (const messageIndex of getRabbitMirrorFollowBatchTargetIndexes(chat)) {
        const ownerKey = terminalFollowOwnerKey(chat, messageIndex);
        if (!terminalFollowMessageIndexes.has(ownerKey))
            continue;
        const key = `terminal\u0000${ownerKey}`;
        const attempts = Number(followBatchScanAttempts.get(key) || 0) + 1;
        followBatchScanAttempts.set(key, attempts);
        if (attempts >= 2) {
            releaseRabbitMirrorFollowBatchAtMessage(chat, messageIndex);
            terminalFollowMessageIndexes.delete(ownerKey);
            followBatchScanAttempts.delete(key);
        }
    }
    return committed;
}
function messageIntegritySources(message) {
    const candidates = [];
    const seen = new Set();
    const push = source => {
        if (typeof source !== 'string')
            return;
        const text = source.trim();
        if (!text || seen.has(text))
            return;
        seen.add(text);
        candidates.push(text);
    };
    const swipeIndex = Number.isInteger(message?.swipe_id) ? message.swipe_id : -1;
    if (swipeIndex >= 0)
        push(message?.swipes?.[swipeIndex]);
    push(message?.mes);
    push(message?.extra?.display_text);
    return candidates;
}
function successfulRabbitMirrorSource(message, chat) {
    const sources = messageIntegritySources(message);
    const fresh = sources.find(source => getRabbitMirrorFollowSingleOwner(chat, message, source));
    for (const source of fresh ? [fresh, ...sources.filter(source => source !== fresh)] : sources) {
        const inspection = inspectRabbitMirrorGenerationSource(source);
        if (!inspection.complete)
            continue;
        return { source, inspection, fromSnapshot: false };
    }
    const messageIndex = Array.isArray(chat) ? chat.lastIndexOf(message) : -1;
    const title = rawSummaryText(message?.mes || '');
    const snapshot = getRabbitMirrorGenerationSnapshot(message, chat, messageIndex, title);
    if (!snapshot?.source)
        return null;
    const inspection = inspectRabbitMirrorGenerationSource(snapshot.source, title);
    if (!inspection.complete)
        return null;
    return {
        source: `<toto data-rabbit-mirror="true">${snapshot.source}</toto>`,
        inspection,
        fromSnapshot: true,
    };
}
function followDrawContentIdentity(details, adoptDrawNotes) {
    const copy = details?.cloneNode?.(true);
    if (!copy)
        return '';
    adoptDrawNotes(copy);
    copy.querySelectorAll('style, script, template, rm-think, rm-ticket, [data-rm-tool-ui], [data-rabbit-mirror-tool-entry-host], [data-rm-face-swipe-host], [data-rm-face-favorite-star], [data-rm-draw-status], [data-rm-draw-result], [data-rm-avatar-rendered], [data-rm-external-reference-note]')
        .forEach(node => node.remove());
    const frames = [...copy.querySelectorAll('[data-rm-draw-frame]')].map((frame, index) => {
        const inputs = [frame, ...frame.querySelectorAll('[data-rm-draw-prompt], [data-rm-draw-tags], [data-rm-draw-char], [data-rm-draw-char-tags]')].map(node => [...node.attributes].filter(attribute => /^data-rm-draw-(?:prompt|tags|char|char-tags)$/.test(attribute.name))
            .map(attribute => [attribute.name, attribute.value, normalizedText(node.textContent)]));
        const value = [String(frame.getAttribute('data-rm-draw-frame') || ''), inputs, normalizedText(frame.textContent)];
        frame.replaceWith(copy.ownerDocument.createTextNode(`\u0000frame:${index}\u0000`));
        return value;
    });
    return frames.length ? JSON.stringify([normalizedText(copy.textContent), frames]) : '';
}
async function singleFollowDrawContentMatches(rendered, inspection) {
    try {
        const [sanitizer, imageModule] = await Promise.all([loadFollowBatchSanitizer(), import('./builtinImage.js?rmv=2.0.1')]);
        if (!sanitizer?.sanitizeRabbitMirrorUntrustedTemplate || !imageModule?.adoptDrawNotes)
            return false;
        const template = document.createElement('template');
        template.innerHTML = String(inspection?.isolatedSource || '');
        if (!sanitizer.sanitizeRabbitMirrorUntrustedTemplate(template))
            return false;
        const expected = template.content.querySelector('details');
        const actual = rendered?.matches?.('details') ? rendered : rendered?.querySelector?.('details');
        const expectedIdentity = followDrawContentIdentity(expected, imageModule.adoptDrawNotes);
        return !!expectedIdentity && expectedIdentity === followDrawContentIdentity(actual, imageModule.adoptDrawNotes);
    }
    catch {
        return false;
    }
}
async function scanLatestAssistantMessage(mod, renderedMessage = null) {
    const lifecycle = visualScannerLifecycle;
    const chat = mod?.chat || globalThis.chat;
    if (!Array.isArray(chat) || !chat.length)
        return;
    captureRabbitMirrorGenerationSnapshots(chat);
    await scanFollowBatches(chat, lifecycle);
    if (lifecycle !== visualScannerLifecycle)
        return;
    settlePendingFollowDraws(chat);
    const message = renderedMessage || [...chat].reverse().find(item => !item?.is_user && typeof item?.mes === 'string');
    if (renderedMessage && !chat.includes(renderedMessage))
        return;
    if (!message || !__rmR("y1_Ej_nLmB9Zl.lqLtxlkp6SgVXnETKr.Evg0SHEBu13mvuizZTCgujSshKIl1syKumOFaZ9Xw2ecKFLPTiFL0Zs", "i").test(message.mes)) {
        console.debug('[RabbitMirror] visual commit skipped: latest assistant message has no RabbitMirror source');
        return;
    }
    if (/\bdata-rm-face\s*=/i.test(message.mes))
        return;
    const successful = successfulRabbitMirrorSource(message, chat);
    if (!successful) {
        console.debug('[RabbitMirror] visual commit skipped: incomplete RabbitMirror source');
        return;
    }
    const sourceForScan = successful.source;
    const pendingFresh = !successful.fromSnapshot && getRabbitMirrorFollowSingleOwner(chat, message, sourceForScan);
    const sigHash = hashText(sourceForScan);
    if (sigHash !== lastScannedHash) {
        lastScannedHash = sigHash;
        lastScanAttempts = 0;
    }
    else if (lastScanAttempts >= 2 && !pendingFresh) {
        return;
    }
    lastScanAttempts += 1;
    const renderedToto = findRenderedToto(message, chat, message.mes);
    if (!renderedToto)
        return;
    const bannedWords = getSettings()?.rabbitMirrorBannedWords;
    if (renderedToto && Array.isArray(bannedWords) && bannedWords.length) {
        applyRabbitMirrorBannedWordsToDom(renderedToto, bannedWords);
    }
    renderedToto.querySelectorAll?.('rm-think, rm-ticket').forEach(node => node.remove());
    const result = scanRabbitMirrorHtml(renderedToto.outerHTML, renderedToto);
    const signature = result?.signature || '';
    const skeleton = result?.skeleton || '';
    const riskFlags = Array.isArray(result?.riskFlags) ? result.riskFlags : [];
    const paletteFingerprint = result?.paletteFingerprint && typeof result.paletteFingerprint === 'object'
        ? result.paletteFingerprint
        : null;
    const interactionFamily = result?.interactionFamily && typeof result.interactionFamily === 'object'
        ? result.interactionFamily
        : null;
    if (signature || skeleton || riskFlags.length || paletteFingerprint || interactionFamily) {
        const historyOwner = commitFollowVisualHistory(message, chat, sourceForScan, result);
        if (historyOwner) {
            bindVisualHistoryTarget(renderedToto, historyOwner);
            const details = renderedToto.matches?.('details') ? renderedToto : renderedToto.querySelector?.('details');
            if (details)
                bindVisualHistoryTarget(details, historyOwner);
        }
        if (pendingFresh) {
            const details = renderedToto.matches?.('details') ? renderedToto : renderedToto.querySelector?.('details');
            const scopes = pendingFresh ? exactMessageScopes(chat, pendingFresh.messageIndex) : [];
            if (scopes.length === 1 && scopes[0].contains(renderedToto)
                && renderedSummaryText(renderedToto) === rawSummaryText(sourceForScan)) {
                const contentMatches = await singleFollowDrawContentMatches(renderedToto, successful.inspection);
                const hostChat = globalThis.SillyTavern?.getContext?.()?.chat;
                if (lifecycle !== visualScannerLifecycle || (mod?.chat || globalThis.chat) !== chat
                    || (Array.isArray(hostChat) && hostChat !== chat)
                    || !getRabbitMirrorFollowSingleOwner(chat, message, sourceForScan))
                    return;
                if (contentMatches && renderedToto.isConnected && scopes[0].contains(renderedToto)
                    && exactMessageScopes(chat, pendingFresh.messageIndex).includes(scopes[0])) {
                    const owner = commitRabbitMirrorFollowSingle(chat, message, sourceForScan);
                    if (owner)
                        authorizeFreshFollowDraws(owner, [{ root: renderedToto, details, failure: null }]);
                }
            }
        }
        const feedbackResult = consumeInjectedFeedbackForSuccessfulRabbitMirror(message);
        if (feedbackResult?.consumed) {
            console.debug('[RabbitMirror] feedback cat consumed:', feedbackResult.remainingRounds);
        }
        console.debug('[RabbitMirror] visual signature:', signature, skeleton, riskFlags, paletteFingerprint, interactionFamily);
    }
}
function clearVisualScannerTimers() {
    if (visualScannerCaptureTimer) {
        clearTimeout(visualScannerCaptureTimer);
        visualScannerCaptureTimer = 0;
    }
    for (const timer of visualScannerTimers)
        clearTimeout(timer);
    visualScannerTimers.clear();
}
export function destroyVisualScanner() {
    try {
        destroyRenderedVisualFeedback();
    }
    catch { }
    visualScannerLifecycle += 1;
    clearVisualScannerTimers();
    for (const { eventSource, eventName, handler } of visualScannerSubscriptions) {
        try {
            eventSource?.off?.(eventName, handler);
        }
        catch { }
    }
    visualScannerSubscriptions = [];
    followBatchScanAttempts.clear();
    terminalFollowMessageIndexes.clear();
    followBatchScansInFlight.clear();
    pendingFollowDraws.clear();
    for (const entry of rejectedFollowBatches.values())
        entry.notice?.remove?.();
    rejectedFollowBatches.clear();
    if (globalThis.__rabbitMirrorVisualScannerCleanup === destroyVisualScanner)
        delete globalThis.__rabbitMirrorVisualScannerCleanup;
}
export async function initVisualScanner({ isActive = () => true } = {}) {
    if (!isActive())
        return;
    try {
        try {
            globalThis.__rabbitMirrorVisualScannerCleanup?.();
        }
        catch { }
        globalThis.__rabbitMirrorVisualScannerCleanup = destroyVisualScanner;
        const mod = await import('../../../../../script.js');
        if (!isActive())
            return;
        const eventSource = mod?.eventSource;
        const eventTypes = mod?.event_types || {};
        if (!eventSource?.on)
            return;
        const lifecycle = visualScannerLifecycle;
        const renderedFreshTimers = new Map();
        const captureNow = () => {
            const finishCapture = globalThis.__rabbitMirrorPerfDiag?.begin?.('visualScanner.captureNow', {}, 0);
            if (visualScannerCaptureTimer) {
                clearTimeout(visualScannerCaptureTimer);
                visualScannerCaptureTimer = 0;
            }
            try {
                captureRabbitMirrorGenerationSnapshots(mod?.chat || globalThis.chat);
            }
            catch (error) {
                console.debug('[RabbitMirror] generation snapshot capture skipped:', error);
            }
            finally {
                finishCapture?.();
            }
        };
        const scheduleCapture = (delay = 140) => {
            if (visualScannerCaptureTimer)
                clearTimeout(visualScannerCaptureTimer);
            visualScannerCaptureTimer = setTimeout(captureNow, Math.max(0, Number(delay) || 0));
        };
        const scheduleTimer = (handler, delay) => {
            const timer = setTimeout(() => {
                visualScannerTimers.delete(timer);
                handler();
            }, delay);
            visualScannerTimers.add(timer);
            return timer;
        };
        const generationMessageIndex = payload => {
            for (const value of [payload, payload?.messageId, payload?.message_id, payload?.mesid, payload?.id, mod?.streamingProcessor?.messageId]) {
                const index = Number(value);
                if (Number.isInteger(index) && index >= 0)
                    return index;
            }
            return null;
        };
        const scheduleScan = (payload = null, eventName = '') => {
            globalThis.__rabbitMirrorPerfDiag?.mark?.('visualScanner.scheduleScan');
            try {
                delete globalThis.__rabbitMirrorFollowScanPending;
            }
            catch { }
            const messageIndex = generationMessageIndex(payload);
            const eventChat = mod?.chat || globalThis.chat;
            const ownerKey = Number.isInteger(messageIndex) ? terminalFollowOwnerKey(eventChat, messageIndex) : '';
            if (Number.isInteger(messageIndex) && eventName === eventTypes.GENERATION_STOPPED) {
                releaseRabbitMirrorFollowBatchAtMessage(eventChat, messageIndex);
                terminalFollowMessageIndexes.delete(ownerKey);
                try {
                    globalThis.dispatchEvent?.(new CustomEvent(FOLLOW_GENERATION_SETTLED_EVENT, {
                        detail: { messageIndex, cancelled: true },
                    }));
                }
                catch { }
            }
            else if (Number.isInteger(messageIndex) && eventName === eventTypes.GENERATION_ENDED) {
                if (terminalFollowMessageIndexes.size >= 8)
                    terminalFollowMessageIndexes.delete(terminalFollowMessageIndexes.values().next().value);
                terminalFollowMessageIndexes.add(ownerKey);
            }
            const exactRenderTimers = new Set(renderedFreshTimers.values());
            for (const timer of visualScannerTimers) {
                if (exactRenderTimers.has(timer))
                    continue;
                clearTimeout(timer);
                visualScannerTimers.delete(timer);
            }
            captureNow();
            scheduleCapture(120);
            scheduleTimer(() => scanLatestAssistantMessage(mod), 650);
            scheduleTimer(() => {
                void scanLatestAssistantMessage(mod).then(() => {
                    if (!Number.isInteger(messageIndex))
                        return;
                    if (eventName === eventTypes.GENERATION_STOPPED)
                        return;
                    try {
                        globalThis.dispatchEvent?.(new CustomEvent(FOLLOW_GENERATION_SETTLED_EVENT, {
                            detail: { messageIndex, cancelled: false },
                        }));
                    }
                    catch { }
                });
            }, 1750);
        };
        const subscribe = (eventName, handler) => {
            if (!eventName)
                return;
            eventSource.on(eventName, handler);
            visualScannerSubscriptions.push({ eventSource, eventName, handler });
        };
        const captureEvents = [
            eventTypes.CHARACTER_MESSAGE_RENDERED,
        ].filter(Boolean);
        for (const eventName of [...new Set(captureEvents)]) {
            const handler = payload => {
                scheduleCapture(140);
                const chat = mod?.chat || globalThis.chat;
                const index = generationMessageIndex(payload), message = chat?.[index];
                const hasFreshOwner = () => messageIntegritySources(message).some(source => getRabbitMirrorFollowSingleOwner(chat, message, source));
                if (!Number.isInteger(index) || !message || !hasFreshOwner() || renderedFreshTimers.has(message))
                    return;
                const timer = scheduleTimer(() => {
                    renderedFreshTimers.delete(message);
                    const currentChat = mod?.chat || globalThis.chat;
                    const hostChat = globalThis.SillyTavern?.getContext?.()?.chat;
                    if (lifecycle !== visualScannerLifecycle || currentChat !== chat
                        || (Array.isArray(hostChat) && hostChat !== chat) || chat[index] !== message || !hasFreshOwner())
                        return;
                    void scanLatestAssistantMessage(mod, message);
                }, 0);
                renderedFreshTimers.set(message, timer);
            };
            subscribe(eventName, handler);
        }
        const generationEvents = [eventTypes.MESSAGE_RECEIVED, eventTypes.GENERATION_STOPPED, eventTypes.GENERATION_ENDED].filter(Boolean);
        for (const eventName of [...new Set(generationEvents)])
            subscribe(eventName, payload => scheduleScan(payload, eventName));
        const pending = globalThis.__rabbitMirrorFollowScanPending;
        const liveChat = mod?.chat || globalThis.chat;
        if (pending && pending.chat === liveChat && Date.now() - Number(pending.at || 0) < 15 * 60 * 1000 && mod?.is_send_press !== true) {
            const lastIndex = Array.isArray(liveChat) ? liveChat.length - 1 : -1;
            if (lastIndex >= 0 && !liveChat[lastIndex]?.is_user)
                scheduleScan(lastIndex, eventTypes.GENERATION_ENDED);
            else {
                try {
                    delete globalThis.__rabbitMirrorFollowScanPending;
                }
                catch { }
            }
        }
        console.debug('[RabbitMirror] visual scanner initialized');
    }
    catch (error) {
        console.debug('[RabbitMirror] visual scanner disabled:', error);
    }
}
const VERSION = '1.5.53';
const HOST = '[data-rabbit-mirror-external-source]';
const READY_INDEPENDENT = `${HOST}[data-rm-source="independent"][data-rm-state="ready"]`;
const TOOL = '[data-rabbit-mirror-tool-entry-host]';
let root = null;
let observer = null;
let seq = 0;
let latestHost = null;
let timer = 0;
let raf1 = 0;
let raf2 = 0;
const hostSeq = new WeakMap();
const seen = new Map();
function hash(text = '') {
    let h = 2166136261;
    for (const ch of String(text)) {
        h ^= ch.charCodeAt(0);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36);
}
function latestAssistantIndex() {
    try {
        const chat = globalThis.SillyTavern?.getContext?.()?.chat;
        if (!Array.isArray(chat))
            return -1;
        for (let i = chat.length - 1; i >= 0; i--)
            if (chat[i] && chat[i].is_user !== true && typeof chat[i].mes === 'string')
                return i;
    }
    catch { }
    return -1;
}
function asIndex(value) {
    const text = String(value ?? '').trim();
    return /^\d+$/.test(text) ? Number(text) : -1;
}
function ownerIndex(details, host) {
    for (const value of [
        host?.dataset?.rmOwnerMesid,
        host?.dataset?.rmExternalOwnerMessage,
        details?.dataset?.rabbitMirrorOwnerMesid,
        details?.closest?.('.mes[mesid], [mesid].mes, [mesid]')?.getAttribute?.('mesid'),
    ]) {
        const parsed = asIndex(value);
        if (parsed >= 0)
            return parsed;
    }
    return -1;
}
function isMirror(details) {
    if (!details || details.tagName !== 'DETAILS')
        return false;
    if (details.closest?.(HOST))
        return true;
    return __rmR("fbBLzB1P_ROkc7yn3GS3fb6OpJOX.JL1S6er.IbbjP8", "i").test(String(details.querySelector?.(':scope > summary')?.textContent || ''));
}
function eligible(details, host) {
    if (!details?.isConnected || !details.open || !isMirror(details))
        return false;
    if (details.classList?.contains('rabbit-mirror-external-placeholder') || details.hasAttribute?.('data-rabbit-mirror-placeholder'))
        return false;
    if (host && String(host.dataset?.rmState || '') !== 'ready')
        return false;
    if (host?.dataset?.rmSource === 'independent') {
        const current = Number(hostSeq.get(host) || 0);
        if (current > 0 && current === seq && host === latestHost)
            return true;
    }
    const owner = ownerIndex(details, host);
    return owner >= 0 && owner === latestAssistantIndex();
}
function styleOf(el) {
    try {
        return el?.ownerDocument?.defaultView?.getComputedStyle?.(el) || globalThis.getComputedStyle?.(el) || null;
    }
    catch {
        return null;
    }
}
function rectOf(el) {
    try {
        const r = layoutRect(el);
        if (!r)
            return null;
        const width = Math.max(0, Number(r.width) || 0), height = Math.max(0, Number(r.height) || 0);
        return { left: Number(r.left) || 0, top: Number(r.top) || 0, width, height, area: width * height, cx: (Number(r.left) || 0) + width / 2, cy: (Number(r.top) || 0) + height / 2 };
    }
    catch {
        return null;
    }
}
function num(value) { return Math.max(0, parseFloat(value || '0') || 0); }
function maxNum(value = '') { const vals = String(value).split(/[\s/]+/).map(parseFloat).filter(Number.isFinite); return vals.length ? Math.max(...vals) : 0; }
function textLen(el) { return String(el?.textContent || '').replace(/\s+/g, '').trim().length; }
function visibleBackground(style) {
    if (!style)
        return false;
    if (String(style.backgroundImage || 'none') !== 'none')
        return true;
    const bg = String(style.backgroundColor || '').replace(/\s+/g, '').toLowerCase();
    return !!bg && bg !== 'transparent' && !/^rgba\([^)]*,0(?:\.0+)?\)$/.test(bg) && bg !== 'rgba(0,0,0,0)';
}
function contentRoot(details) {
    return [...(details?.children || [])].find(el => !['SUMMARY', 'STYLE', 'SCRIPT', 'TEMPLATE', 'LINK', 'META'].includes(el.tagName)) || details;
}
function collectBoxes(details) {
    const stage = contentRoot(details), stageRect = rectOf(stage);
    if (!stage?.querySelectorAll || !stageRect || stageRect.width < 160 || stageRect.height < 80)
        return { boxes: [], text: 0, abs: 0, stageRect };
    const minArea = Math.max(900, stageRect.area * 0.0045);
    const boxes = [];
    let abs = 0;
    for (const el of [...stage.querySelectorAll('div,section,article,li,aside,main,figure')].slice(0, 180)) {
        if (!el?.isConnected || el.closest?.(TOOL))
            continue;
        const s = styleOf(el), r = rectOf(el);
        if (!s || !r || s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity || 1) < 0.08)
            continue;
        if (s.position === 'absolute' || s.position === 'fixed')
            abs++;
        if (r.width < 72 || r.height < 24 || r.area < minArea || r.area > stageRect.area * 0.88)
            continue;
        if (textLen(el) < 18 && !el.querySelector?.('input,button,label,select,textarea,a[href],svg,img,canvas'))
            continue;
        const bg = visibleBackground(s);
        const border = num(s.borderTopWidth) + num(s.borderRightWidth) + num(s.borderBottomWidth) + num(s.borderLeftWidth) >= .75;
        const radius = maxNum(s.borderRadius);
        const shadow = String(s.boxShadow || 'none') !== 'none';
        const padding = num(s.paddingTop) + num(s.paddingRight) + num(s.paddingBottom) + num(s.paddingLeft);
        const score = (bg ? 2 : 0) + (border ? 1 : 0) + (radius >= 4 ? 1 : 0) + (shadow ? 1 : 0) + (padding >= 12 ? 1 : 0);
        if (!(bg || border || shadow) || score < 3)
            continue;
        boxes.push({ el, parent: el.parentElement, r, bg, border, radius: radius >= 4, shadow, padding: padding >= 12, w: r.width / stageRect.width, cx: r.cx, cy: r.cy });
    }
    return { boxes, text: textLen(stage), abs, stageRect };
}
function similar(a, b) {
    if (!a || !b)
        return 0;
    let hit = 0, total = 0;
    const add = (ok, w) => { total += w; if (ok)
        hit += w; };
    add(Math.abs(a.w - b.w) <= .13, .28);
    add(Math.abs(a.r.height - b.r.height) / Math.max(1, a.r.height, b.r.height) <= .48, .14);
    add(a.bg === b.bg, .12);
    add(a.border === b.border, .12);
    add(a.radius === b.radius, .10);
    add(a.shadow === b.shadow, .08);
    add(a.padding === b.padding, .08);
    add(a.parent === b.parent, .08);
    return total ? hit / total : 0;
}
function ratio(items) {
    if (items.length < 2)
        return 0;
    let pairs = 0, hits = 0;
    for (let i = 0; i < items.length; i++)
        for (let j = i + 1; j < items.length; j++) {
            pairs++;
            if (similar(items[i], items[j]) >= .72)
                hits++;
        }
    return pairs ? hits / pairs : 0;
}
function geometry(items) {
    if (items.length < 3)
        return 'mixed';
    const xs = items.map(x => x.cx), ys = items.map(x => x.cy), dx = Math.max(...xs) - Math.min(...xs), dy = Math.max(...ys) - Math.min(...ys);
    return dx > dy * 1.35 ? 'row' : dy > dx * 1.35 ? 'column' : 'grid';
}
function renderedProfile(details) {
    const data = collectBoxes(details), { boxes } = data;
    let grid = false, stack = false, siblingRepeat = false;
    const groups = new Map();
    for (const box of boxes) {
        if (!box.parent)
            continue;
        const list = groups.get(box.parent) || [];
        list.push(box);
        groups.set(box.parent, list);
    }
    for (const [parent, items] of groups) {
        if (items.length < 3 || ratio(items) < .34)
            continue;
        siblingRepeat = true;
        const s = styleOf(parent), display = String(s?.display || ''), direction = String(s?.flexDirection || ''), wrap = String(s?.flexWrap || ''), g = geometry(items);
        if (display.includes('grid') || g === 'grid' || (display.includes('flex') && (wrap !== 'nowrap' || g === 'row')))
            grid = true;
        if ((display.includes('flex') && direction === 'column') || (!display.includes('grid') && g === 'column'))
            stack = true;
    }
    const allRatio = ratio(boxes);
    const repeated = siblingRepeat || (boxes.length >= 4 && allRatio >= .22) || (boxes.length >= 6 && allRatio >= .14);
    const rounded = repeated && boxes.filter(x => x.radius).length / Math.max(1, boxes.length) >= .55;
    const flat = data.text >= 520 && data.abs <= 1 && !details.querySelector?.('svg[viewBox],canvas') && (stack || (repeated && geometry(boxes.slice(0, 8)) === 'column'));
    const info = (repeated && boxes.length >= 4 && data.text >= 260) || grid || stack;
    const flags = [];
    if (grid)
        flags.push('same_grid_card_risk');
    if (stack)
        flags.push('same_block_stack');
    if (repeated)
        flags.push('repeated_unit_shape');
    if (flat)
        flags.push('flat_vertical_flow');
    if (info)
        flags.push('info_page_degrade');
    return { ...data, allRatio, repeated, rounded, grid, stack, flat, info, flags };
}
function parseSkeleton(value = '') {
    const out = {};
    for (const part of String(value).split(__rmT("7os"))) {
        const m = part.match(/^\s*([a-z_]+)\s*:\s*(.+?)\s*$/i);
        if (m)
            out[m[1]] = m[2];
    }
    return out;
}
function mergeSkeleton(base, palette, profile) {
    const f = parseSkeleton(base), b = String(palette?.brightness || '');
    if (b === 'dark')
        f.contrast_family = 'contrast: dark_weighted';
    else if (b === 'light')
        f.contrast_family = 'contrast: light_weighted';
    else if (b === 'mid')
        f.contrast_family = 'contrast: mid_tone_or_mixed';
    if (profile.repeated) {
        f.unit_family = __rmT("x3sA4T7oQWQ8RYWGno.SLwbem2f9jh");
        f.contour_family = profile.rounded ? 'contour: rounded_panel_cluster' : 'contour: repeated_rectangular_blocks';
    }
    if (profile.grid) {
        f.reading_family = __rmT("2h84BmXKK4EiqfeuT3p");
        f.space_family = 'space: grid_plane';
    }
    else if (profile.stack || profile.flat) {
        f.reading_family = __rmT("SrMzWrkS_HSgDhLv6uDQxk");
        f.space_family = 'space: flat_content_surface';
    }
    const order = ['layout_family', 'operation_family', 'operation_families', 'mechanisms', 'surface_family', 'contrast_family', 'contour_family', 'reading_family', 'unit_family', 'space_family', 'interaction_family', 'mood'];
    return order.filter(k => f[k]).map(k => `${k}: ${f[k]}`).join(__rmT("7os"));
}
function sourceHtml(details) {
    try {
        const clone = restoreRabbitMirrorAvatarClone(details, details.cloneNode(true));
        clone.querySelectorAll?.(TOOL)?.forEach(n => n.remove());
        return `<toto data-rabbit-mirror="true" style="display:block;">${clone.outerHTML}</toto>`;
    }
    catch {
        return '';
    }
}
function commit(host, details, expectedSeq = 0) {
    if (!eligible(details, host))
        return false;
    const historyOwner = visualHistoryTarget(details);
    if (!historyOwner)
        return false;
    if (host?.dataset?.rmSource === 'independent' && expectedSeq > 0 && (Number(hostSeq.get(host) || 0) !== expectedSeq || expectedSeq !== seq || host !== latestHost))
        return false;
    const html = sourceHtml(details);
    if (!html)
        return false;
    const key = `${ownerIndex(details, host)}|${host?.dataset?.rmKey || ''}|${host?.dataset?.rmSourceHash || ''}|${html.length}|${hash(html)}`;
    if (seen.has(key))
        return false;
    const scan = scanRabbitMirrorHtml(html, host || details) || {}, profile = renderedProfile(details), palette = scan.paletteFingerprint && typeof scan.paletteFingerprint === 'object' ? scan.paletteFingerprint : null;
    const skeleton = mergeSkeleton(scan.skeleton || '', palette, profile);
    const flags = [...new Set([...(profile.flags || []), ...(Array.isArray(scan.riskFlags) ? scan.riskFlags : [])])].slice(0, 8);
    if (!updateLatestVisualSignature(scan.signature || '', skeleton || scan.skeleton || '', flags, palette, scan.interactionFamily || null, historyOwner))
        return false;
    seen.set(key, Date.now());
    while (seen.size > 48)
        seen.delete(seen.keys().next().value);
    globalThis.__rabbitMirrorRenderedVisualFeedbackLast = { version: VERSION, ownerMesid: ownerIndex(details, host), source: String(host?.dataset?.rmSource || 'inline'), brightness: String(palette?.brightness || ''), darkAreaRatio: Number(palette?.darkAreaRatio || 0), averageLuminance: Number(palette?.averageLuminance || 0), renderedBoxes: profile.boxes.length, renderedSimilarity: Number(profile.allRatio.toFixed(3)), riskFlags: flags, skeleton, ts: Date.now() };
    console.debug('[RabbitMirror] rendered visual feedback committed:', globalThis.__rabbitMirrorRenderedVisualFeedbackLast);
    return true;
}
function cancelSchedule() { if (raf1)
    globalThis.cancelAnimationFrame?.(raf1); if (raf2)
    globalThis.cancelAnimationFrame?.(raf2); if (timer)
    clearTimeout(timer); raf1 = raf2 = timer = 0; }
function schedule(host, details, expectedSeq = 0) {
    if (!eligible(details, host))
        return;
    cancelSchedule();
    const run = () => { timer = 0; commit(host, details, expectedSeq); };
    if (typeof requestAnimationFrame === 'function')
        raf1 = requestAnimationFrame(() => { raf1 = 0; raf2 = requestAnimationFrame(() => { raf2 = 0; timer = setTimeout(run, 72); }); });
    else
        timer = setTimeout(run, 90);
}
function onToggle(event) {
    const details = event?.target;
    if (!details || details.tagName !== 'DETAILS' || !details.open || !isMirror(details))
        return;
    const host = details.closest?.(HOST) || null;
    if (!eligible(details, host))
        return;
    schedule(host, details, host?.dataset?.rmSource === 'independent' ? Number(hostSeq.get(host) || 0) : 0);
}
function onState(records) {
    for (const rec of records) {
        if (rec.type !== 'attributes' || rec.attributeName !== 'data-rm-state')
            continue;
        const host = rec.target;
        if (!host?.matches?.(READY_INDEPENDENT))
            continue;
        const old = String(rec.oldValue || '');
        if (!old || old === 'ready')
            continue;
        seq++;
        latestHost = host;
        hostSeq.set(host, seq);
        const details = host.querySelector?.(':scope > details');
        if (details?.open)
            schedule(host, details, seq);
    }
}
function install() {
    root = document.querySelector?.('#chat') || null;
    if (!root)
        return false;
    root.addEventListener('toggle', onToggle, true);
    if (typeof MutationObserver !== 'undefined') {
        observer = new MutationObserver(onState);
        observer.observe(root, { subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ['data-rm-state'] });
    }
    return true;
}
export function destroyRenderedVisualFeedback() {
    cancelSchedule();
    observer?.disconnect?.();
    observer = null;
    root?.removeEventListener?.('toggle', onToggle, true);
    root = null;
    seq = 0;
    latestHost = null;
    seen.clear();
    try {
        delete globalThis.__rabbitMirrorRenderedVisualFeedbackLast;
    }
    catch { }
    if (globalThis.__rabbitMirrorRenderedVisualFeedbackHotfixCleanup === destroyRenderedVisualFeedback)
        delete globalThis.__rabbitMirrorRenderedVisualFeedbackHotfixCleanup;
}
export function initRenderedVisualFeedback() {
    try {
        globalThis.__rabbitMirrorRenderedVisualFeedbackHotfixCleanup?.();
    }
    catch { }
    destroyRenderedVisualFeedback();
    const ok = install();
    if (!ok)
        timer = setTimeout(() => { timer = 0; if (!root)
            install(); }, 600);
    globalThis.__rabbitMirrorRenderedVisualFeedbackHotfixCleanup = destroyRenderedVisualFeedback;
    console.log(`[RabbitMirror] rendered visual feedback hotfix ${VERSION} ${ok ? 'active' : 'waiting for #chat'}`);
}
