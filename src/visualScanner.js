import { updateLatestVisualSignature } from './storage.js';

const TOTO_RE = /<toto\b[^>]*data-rabbit-hole=["']true["'][^>]*>[\s\S]*?<\/toto>/i;
let lastScannedHash = '';

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

function parseStyleProps(styleText) {
    return String(styleText || '')
        .toLowerCase()
        .split(';')
        .map(part => part.trim().split(':')[0])
        .filter(Boolean)
        .sort();
}

function extractStyleFingerprints(html) {
    const styles = [...String(html || '').matchAll(/<([a-z0-9-]+)\b[^>]*\sstyle=["']([^"']+)["'][^>]*>/gi)];
    const normalized = styles.map(match => {
        const tag = match[1].toLowerCase();
        const props = parseStyleProps(match[2]).join('|');
        return `${tag}:${props}`;
    }).filter(Boolean);
    const buckets = new Map();
    for (const item of normalized) buckets.set(item, (buckets.get(item) || 0) + 1);
    const repeated = [...buckets.values()].filter(v => v >= 3).length;
    const maxRepeat = Math.max(0, ...buckets.values());
    return { repeated, maxRepeat };
}

function parseTotoElement(html) {
    if (typeof DOMParser === 'undefined') return null;
    try {
        const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
        return doc.querySelector('toto[data-rabbit-hole="true"]') || doc.querySelector('toto');
    } catch {
        return null;
    }
}

function elementDepth(el) {
    if (!el || !el.children || !el.children.length) return 1;
    let max = 0;
    for (const child of el.children) max = Math.max(max, elementDepth(child));
    return max + 1;
}

function directChildTags(el) {
    return [...(el?.children || [])].slice(0, 8).map(child => child.tagName.toLowerCase()).join('>');
}

function elementShape(el) {
    const style = el?.getAttribute?.('style') || '';
    const props = parseStyleProps(style);
    return {
        tag: el?.tagName?.toLowerCase?.() || '',
        depth: elementDepth(el),
        childCount: el?.children?.length || 0,
        childTags: directChildTags(el),
        propSet: new Set(props),
        propCount: props.length,
    };
}

function propSimilarity(a, b) {
    if (!a?.propSet || !b?.propSet) return 0;
    const small = a.propSet.size <= b.propSet.size ? a.propSet : b.propSet;
    const large = a.propSet.size <= b.propSet.size ? b.propSet : a.propSet;
    if (!small.size && !large.size) return 1;
    let same = 0;
    for (const prop of small) if (large.has(prop)) same += 1;
    return same / Math.max(1, Math.max(a.propSet.size, b.propSet.size));
}

function shapeSimilarity(a, b) {
    let score = 0;
    if (a.tag && a.tag === b.tag) score += 2;
    if (Math.abs(a.depth - b.depth) <= 1) score += 2;
    if (Math.abs(a.childCount - b.childCount) <= 1) score += 1;
    if (a.childTags && a.childTags === b.childTags) score += 2;
    if (propSimilarity(a, b) >= 0.55) score += 2;
    return score;
}

function scanSiblingSimilarity(root) {
    if (!root) return { maxRun: 0, similarPairs: 0 };
    const groups = [];
    const details = root.querySelector?.('details') || root;
    const candidates = [root, details, ...details.querySelectorAll?.('div,section,article,ul,ol') || []];
    for (const parent of candidates) {
        const children = [...(parent.children || [])].filter(child => child.tagName.toLowerCase() !== 'summary');
        if (children.length >= 2) groups.push(children.slice(0, 12));
    }
    let maxRun = 0;
    let similarPairs = 0;
    for (const group of groups) {
        const shapes = group.map(elementShape);
        let run = 1;
        for (let i = 1; i < shapes.length; i += 1) {
            const similar = shapeSimilarity(shapes[i - 1], shapes[i]) >= 6;
            if (similar) {
                similarPairs += 1;
                run += 1;
                maxRun = Math.max(maxRun, run);
            } else {
                run = 1;
            }
        }
    }
    return { maxRun, similarPairs };
}

function summaryTextLength(root) {
    const text = root?.querySelector?.('summary')?.textContent || '';
    return text.replace(/\s+/g, '').length;
}

function styleGlobalRisk(html) {
    const styles = [...String(html || '').matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]).join('\n');
    if (!styles) return false;
    return /(^|[,{]\s*)(html|body|:root|\*|\.ts-message-container|\.mes|\.message|\.chat|#chat|#sheld)\b/i.test(styles);
}

function spatialSignals(html) {
    const text = String(html || '');
    const absoluteCount = count(/position\s*:\s*absolute/gi, text);
    const relativeCount = count(/position\s*:\s*relative/gi, text);
    const gridCount = count(/display\s*:\s*grid|grid-template|grid-area/gi, text);
    const transformCount = count(/transform\s*:|rotate\(|scale\(|translate\(/gi, text);
    const contourCount = count(/clip-path|\bmask\b|<svg\b|<path\b|<circle\b|z-index|aspect-ratio|radial-gradient|conic-gradient|repeating-/gi, text);
    const total = absoluteCount + gridCount + transformCount + contourCount;
    return { absoluteCount, relativeCount, gridCount, transformCount, contourCount, total };
}

function detectSvgFlatCard(html) {
    const text = String(html || '');
    const svgOpenCount = count(/<svg\b/gi, text);
    if (!svgOpenCount) return { flat: false, truncated: false, svgOpenCount: 0 };
    const svgBlocks = [...text.matchAll(/<svg\b[\s\S]*?<\/svg>/gi)].map(match => match[0]);
    const truncated = svgOpenCount > svgBlocks.length;
    let monotonicTextRuns = 0;
    let flatBlockCount = 0;
    for (const block of svgBlocks) {
        const rectCount = count(/<rect\b/gi, block);
        const textMatches = [...block.matchAll(/<text\b([^>]*)>/gi)];
        const textCount = textMatches.length;
        const complexCount = count(/<(path|circle|ellipse|polygon|polyline|line|g|use|mask|clipPath|filter)\b/gi, block);
        const ys = textMatches
            .map(match => Number((match[1].match(/\by=["']?(-?\d+(?:\.\d+)?)/i) || [])[1]))
            .filter(num => Number.isFinite(num));
        let monotonicPairs = 0;
        for (let i = 1; i < ys.length; i += 1) if (ys[i] >= ys[i - 1]) monotonicPairs += 1;
        const monotonicRatio = ys.length > 1 ? monotonicPairs / (ys.length - 1) : 0;
        if (textCount >= 3 && monotonicRatio >= 0.75) monotonicTextRuns += 1;
        if (rectCount >= 1 && textCount >= 4 && complexCount <= 2) flatBlockCount += 1;
    }
    return { flat: flatBlockCount > 0 && monotonicTextRuns > 0, truncated, svgOpenCount };
}

function scanRabbitHoleHtmlUnsafe(messageHtml) {
    const match = String(messageHtml || '').match(TOTO_RE);
    if (!match) return '';
    const html = match[0];
    const totoElement = parseTotoElement(html);
    const plain = stripTags(html);
    const tagCount = count(/<\w+\b/g, html);
    const divCount = count(/<div\b/gi, html);
    const repeated = extractStyleFingerprints(html);
    const siblings = scanSiblingSimilarity(totoElement);
    const spatial = spatialSignals(html);
    const svgFlat = detectSvgFlatCard(html);
    const summaryLen = summaryTextLength(totoElement);
    const textDensity = plain.length > 900 && tagCount < 65 ? '文本密度过高' : plain.length > 520 ? '文本密度中高' : '文本密度适中';

    const effects = [];
    if (/animation\s*:|@keyframes|<marquee\b|<animate\b/i.test(html)) effects.push('动态效果有');
    else effects.push('动态效果无');
    if (/linear-gradient|radial-gradient|conic-gradient|box-shadow|filter\s*:|backdrop-filter|mix-blend-mode|mask|clip-path/i.test(html)) effects.push('高级CSS有');
    else effects.push('高级CSS弱');
    if (spatial.total >= 3) effects.push('空间构造强');
    else if (spatial.total >= 1 || spatial.relativeCount >= 2) effects.push('空间构造中等');
    else effects.push('空间构造弱');

    const structural = [];
    if (siblings.maxRun >= 3 || siblings.similarPairs >= 3) structural.push('存在纵向同构区块/卡片化倾向高');
    else if (siblings.maxRun >= 2 || siblings.similarPairs >= 2) structural.push('存在相似兄弟区块');
    if (repeated.maxRepeat >= 4 || repeated.repeated >= 2) structural.push('重复样式块明显');
    else if (repeated.maxRepeat >= 3) structural.push('重复样式块存在');
    if (/display\s*:\s*flex;[^"']*flex-direction\s*:\s*column/i.test(html) && divCount >= 10) structural.push('纵向分组结构明显');
    if (spatial.total === 0 && plain.length > 520 && (siblings.similarPairs >= 2 || repeated.maxRepeat >= 3)) structural.push('主要依赖纵向文本流/信息页降级风险高');
    else if (spatial.total <= 1 && plain.length > 900) structural.push('空间构造信号弱/文本承载页倾向');
    if (summaryLen > 80) structural.push('summary严重冗长/疑似正文承载区');
    else if (summaryLen > 60) structural.push('summary标题栏冗长');
    else if (summaryLen > 40) structural.push('summary标题偏长');
    if (count(/border-radius\s*:/gi, html) >= 4 && count(/padding\s*:/gi, html) >= 6) structural.push('圆角容器密集');
    if (count(/<!--/g, html) > 0) structural.push('HTML注释残留');
    if (/<pre\b|<code\b|```/i.test(html)) structural.push('代码块风险');
    if (styleGlobalRisk(html)) structural.push('全局CSS选择器风险');
    if (svgFlat.flat) structural.push('单体SVG扁平承载倾向/疑似绕过DOM层级');
    if (svgFlat.truncated) structural.push('SVG结构可能残缺');

    const mediaStrength = (spatial.total >= 3 && tagCount >= 35)
        ? '媒介轮廓中强'
        : (spatial.total >= 1 && tagCount >= 35 ? '媒介轮廓中等' : '媒介轮廓偏弱');
    const summary = [mediaStrength, ...structural.slice(0, 6), textDensity, ...effects]
        .filter(Boolean)
        .join('；');
    return summary.slice(0, 280);
}

export function scanRabbitHoleHtml(messageHtml) {
    try {
        return scanRabbitHoleHtmlUnsafe(messageHtml);
    } catch (error) {
        console.warn('[RabbitHole Scanner] HTML truncation or parse failure detected:', error);
        return '生成遭遇截断/HTML结构残缺，建议重新完整生成';
    }
}

async function scanLatestAssistantMessage(mod) {
    const chat = mod?.chat || globalThis.chat;
    if (!Array.isArray(chat) || !chat.length) return;
    const recent = chat.slice(-4).reverse();
    const message = recent.find(item => !item?.is_user && typeof item?.mes === 'string' && TOTO_RE.test(item.mes));
    if (!message) return;
    const sigHash = hashText(message.mes);
    if (sigHash === lastScannedHash) return;
    lastScannedHash = sigHash;
    const signature = scanRabbitHoleHtml(message.mes);
    if (signature) {
        updateLatestVisualSignature(signature);
        console.debug('[RabbitHole] visual signature:', signature);
    }
}

export async function initVisualScanner() {
    try {
        const mod = await import('../../../../../script.js');
        const eventSource = mod?.eventSource;
        const eventTypes = mod?.event_types || {};
        if (!eventSource?.on) return;
        const scheduleScan = () => {
            setTimeout(() => scanLatestAssistantMessage(mod), 600);
            setTimeout(() => scanLatestAssistantMessage(mod), 1800);
        };
        const events = [eventTypes.MESSAGE_RECEIVED, eventTypes.GENERATION_ENDED, eventTypes.CHAT_CHANGED].filter(Boolean);
        for (const eventName of events) eventSource.on(eventName, scheduleScan);
        console.debug('[RabbitHole] visual scanner initialized');
    } catch (error) {
        console.debug('[RabbitHole] visual scanner disabled:', error);
    }
}
