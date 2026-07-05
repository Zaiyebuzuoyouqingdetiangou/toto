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
    for (const item of normalized) buckets.set(item, (buckets.get(item) || 0) + 1);
    const repeated = [...buckets.values()].filter(v => v >= 3).length;
    const maxRepeat = Math.max(0, ...buckets.values());
    return { repeated, maxRepeat };
}

function parseToto(html) {
    try {
        if (typeof DOMParser === 'undefined') return null;
        const doc = new DOMParser().parseFromString(String(html || ''), 'text/html');
        return doc.querySelector('toto[data-rabbit-hole="true"]') || doc.querySelector('toto');
    } catch {
        return null;
    }
}

function elementDepth(el) {
    if (!el || !el.children || !el.children.length) return 0;
    return 1 + Math.max(...[...el.children].map(child => elementDepth(child)));
}

function stylePropSet(el) {
    const style = (el?.getAttribute?.('style') || '').toLowerCase();
    return new Set(style.split(';').map(part => part.trim().split(':')[0]).filter(Boolean));
}

function setOverlapRatio(a, b) {
    if (!a.size && !b.size) return 1;
    let hit = 0;
    for (const item of a) if (b.has(item)) hit += 1;
    return hit / Math.max(1, Math.min(a.size, b.size));
}

function areSimilarBlocks(a, b) {
    if (!a || !b || a.nodeType !== 1 || b.nodeType !== 1) return false;
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
    if (!toto) return { maxSimilarRun: 0, summaryLength: 0, summaryFlags: [] };
    const summary = toto.querySelector('summary');
    const summaryLength = (summary?.textContent || '').replace(/\s+/g, '').length;
    const summaryFlags = [];
    if (summaryLength > 80) summaryFlags.push('summary疑似伪装正文承载区');
    else if (summaryLength > 60) summaryFlags.push('summary标题栏冗长');
    else if (summaryLength > 40) summaryFlags.push('summary标题偏长');

    let maxSimilarRun = 0;
    const containers = [toto, ...[...toto.querySelectorAll('details, div, section, article, main')].slice(0, 80)];
    for (const container of containers) {
        const children = [...container.children].filter(el => !['SUMMARY', 'STYLE', 'SCRIPT'].includes(el.tagName));
        let run = 1;
        for (let i = 1; i < children.length; i += 1) {
            if (areSimilarBlocks(children[i - 1], children[i])) {
                run += 1;
                maxSimilarRun = Math.max(maxSimilarRun, run);
            } else {
                run = 1;
            }
        }
    }
    return { maxSimilarRun, summaryLength, summaryFlags };
}

function detectGlobalCssRisk(html) {
    const styles = [...String(html || '').matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]).join('\n');
    if (!styles) return false;
    return /(^|[}\s,])(html|body|:root|\*|\.mes|\.message|\.chat|\.content|\.ts-message-container|#chat|#send_form)\s*[{,]/i.test(styles);
}

export function scanRabbitHoleHtml(messageHtml) {
    const match = String(messageHtml || '').match(TOTO_RE);
    if (!match) return '';
    const html = match[0];
    const plain = stripTags(html);
    const tagCount = count(/<\w+\b/g, html);
    const divCount = count(/<div\b/gi, html);
    const repeated = extractStyleFingerprints(html);
    const dom = analyzeDomStructure(html);
    const textDensity = plain.length > 900 && tagCount < 65 ? '文本密度过高' : plain.length > 520 ? '文本密度中高' : '文本密度适中';

    const spatialSignalCount = count(/position\s*:\s*absolute|grid-area\s*:|grid-template|display\s*:\s*grid|transform\s*:|clip-path\s*:|mask\s*:|z-index\s*:|<svg\b|<path\b|radial-gradient|conic-gradient|repeating-gradient|aspect-ratio/gi, html);
    const effects = [];
    if (/animation\s*:|@keyframes|<marquee\b|<animate\b/i.test(html)) effects.push('动态效果有');
    else effects.push('动态效果无');
    if (/linear-gradient|radial-gradient|conic-gradient|box-shadow|filter\s*:|backdrop-filter|mix-blend-mode|mask|clip-path/i.test(html)) effects.push('高级CSS有');
    else effects.push('高级CSS弱');
    if (spatialSignalCount >= 4) effects.push('空间构造信号强');
    else if (spatialSignalCount >= 2) effects.push('空间构造信号中');
    else effects.push('空间构造信号弱');

    const structural = [];
    if (dom.maxSimilarRun >= 3) structural.push('连续同构兄弟区块明显/卡片化倾向高');
    else if (dom.maxSimilarRun >= 2) structural.push('存在连续同构兄弟区块');
    if (repeated.maxRepeat >= 4 || repeated.repeated >= 2) structural.push('存在重复同构内容块/卡片化倾向高');
    else if (repeated.maxRepeat >= 3) structural.push('存在重复同构内容块');
    if (/display\s*:\s*flex;[^"']*flex-direction\s*:\s*column/i.test(html) && divCount >= 10) structural.push('纵向分组结构明显');
    if (spatialSignalCount < 2 && plain.length > 520 && (dom.maxSimilarRun >= 2 || repeated.maxRepeat >= 3 || divCount >= 10)) structural.push('主要依赖纵向文本流/媒介轮廓偏弱');
    if (count(/border-radius\s*:/gi, html) >= 4 && count(/padding\s*:/gi, html) >= 6) structural.push('圆角容器密集');
    if (count(/<!--/g, html) > 0) structural.push('HTML注释残留');
    if (/<pre\b|<code\b|```/i.test(html)) structural.push('代码块风险');
    if (detectGlobalCssRisk(html)) structural.push('全局CSS污染风险');
    structural.push(...dom.summaryFlags);

    const mediaStrength = (/clip-path|mask|<svg\b|<path\b|position\s*:\s*absolute|transform\s*:|border-radius\s*:\s*50%|aspect-ratio|radial-gradient|conic-gradient/i.test(html) && tagCount >= 35)
        ? '媒介轮廓中强'
        : (tagCount >= 40 ? '媒介轮廓中等' : '媒介轮廓弱');
    const summary = [mediaStrength, ...structural.slice(0, 6), textDensity, ...effects]
        .filter(Boolean)
        .join('；');
    return summary.slice(0, 280);
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
