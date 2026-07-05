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

export function scanRabbitHoleHtml(messageHtml) {
    const match = String(messageHtml || '').match(TOTO_RE);
    if (!match) return '';
    const html = match[0];
    const plain = stripTags(html);
    const tagCount = count(/<\w+\b/g, html);
    const divCount = count(/<div\b/gi, html);
    const repeated = extractStyleFingerprints(html);
    const textDensity = plain.length > 900 && tagCount < 65 ? '文本密度过高' : plain.length > 520 ? '文本密度中高' : '文本密度适中';
    const effects = [];
    if (/animation\s*:|@keyframes|<marquee\b|<animate\b/i.test(html)) effects.push('动态效果有');
    else effects.push('动态效果无');
    if (/linear-gradient|radial-gradient|conic-gradient|box-shadow|filter\s*:|backdrop-filter|mix-blend-mode|mask|clip-path/i.test(html)) effects.push('高级CSS有');
    else effects.push('高级CSS弱');
    if (/position\s*:\s*absolute|display\s*:\s*grid|transform\s*:|<svg\b|<path\b|<circle\b/i.test(html)) effects.push('空间构造有');
    else effects.push('空间构造弱');
    const structural = [];
    if (repeated.maxRepeat >= 4 || repeated.repeated >= 2) structural.push('存在重复同构内容块/卡片化倾向高');
    else if (repeated.maxRepeat >= 3) structural.push('存在重复同构内容块');
    if (/display\s*:\s*flex;[^"']*flex-direction\s*:\s*column|display\s*:\s*grid/i.test(html) && divCount >= 10) structural.push('纵向分组结构明显');
    if (count(/border-radius\s*:/gi, html) >= 4 && count(/padding\s*:/gi, html) >= 6) structural.push('圆角容器密集');
    if (count(/<!--/g, html) > 0) structural.push('HTML注释残留');
    if (/<pre\b|<code\b|```/i.test(html)) structural.push('代码块风险');
    const mediaStrength = (/clip-path|mask|<svg\b|<path\b|position\s*:\s*absolute|transform\s*:|border-radius\s*:\s*50%|aspect-ratio|radial-gradient|conic-gradient/i.test(html) && tagCount >= 35)
        ? '媒介轮廓中强'
        : (tagCount >= 40 ? '媒介轮廓中等' : '媒介轮廓弱');
    const summary = [mediaStrength, ...structural.slice(0, 4), textDensity, ...effects]
        .filter(Boolean)
        .join('；');
    return summary.slice(0, 220);
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
