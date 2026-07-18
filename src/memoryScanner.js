import { extension_settings } from '../../../../extensions.js';

const MEMORY_NAME_RE = /(memory|memories|memo|recall|remember|summary|summar|history|context|lore|book|horae|vector|记忆|回忆|忆|摘要|总结|往事|历史)/i;
const MEMORY_METHOD_RE = /^(getInjectedHistory|getHistory|getMemor(?:y|ies)|readMemor(?:y|ies)|queryMemor(?:y|ies)|searchMemor(?:y|ies)|recall(?:Memory|Memories)?|getSummar(?:y|ies)|readSummar(?:y|ies))$/i;
const EXCLUDED_GLOBAL_KEYS = new Set(['history', 'window', 'self', 'globalThis', 'document', 'location', 'navigator', 'performance', 'localStorage', 'sessionStorage', 'caches', 'frames', 'parent', 'top', 'opener', 'SillyTavern', '$', 'jQuery', 'toastr']);
const KNOWN_BAIBAI_KEYS = ['STBaiBaiBook'];
const MAX_SCAN_RESULTS = 40;

function safeGlobalValue(key) {
    try {
        return globalThis?.[key];
    } catch {
        return undefined;
    }
}

function safeFunctionNames(value) {
    if (!value || (typeof value !== 'object' && typeof value !== 'function')) return [];
    const names = new Set();
    let cursor = value;
    let depth = 0;
    while (cursor && depth < 3) {
        try {
            for (const name of Object.getOwnPropertyNames(cursor)) {
                if (name === 'constructor') continue;
                let member;
                try { member = value[name]; } catch { continue; }
                if (typeof member === 'function') names.add(name);
            }
        } catch {}
        try { cursor = Object.getPrototypeOf(cursor); } catch { cursor = null; }
        depth += 1;
    }
    return [...names].slice(0, 80);
}

function titleFromToken(token) {
    return String(token || '')
        .replace(/^global:/, '')
        .replace(/^settings:/, '')
        .replace(/^script:/, '')
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim() || '未命名插件';
}

function collectExtensionTraces() {
    const traces = new Map();
    const add = (token, source, detail = '') => {
        const raw = String(token || '').trim();
        if (!raw || !MEMORY_NAME_RE.test(`${raw} ${detail}`)) return;
        const normalized = raw.toLowerCase();
        const existing = traces.get(normalized) || { token: raw, sources: new Set(), details: new Set() };
        existing.sources.add(source);
        if (detail) existing.details.add(String(detail).slice(0, 180));
        traces.set(normalized, existing);
    };

    try {
        for (const key of Object.keys(extension_settings || {})) add(key, '设置记录');
    } catch {}

    try {
        for (const script of document.querySelectorAll('script[src]')) {
            const src = String(script.getAttribute('src') || '');
            if (!MEMORY_NAME_RE.test(src)) continue;
            const parts = src.split(/[/?#]/).filter(Boolean);
            const thirdPartyIndex = parts.findIndex(x => x === 'third-party');
            const token = thirdPartyIndex >= 0 ? parts[thirdPartyIndex + 1] : parts.at(-2) || parts.at(-1) || src;
            add(token, '已加载脚本', src);
        }
    } catch {}

    try {
        for (const node of document.querySelectorAll('#extensions_settings2 [id], #extensions_settings2 [class]')) {
            if (node.closest?.('#rabbit_mirror_theater_settings')) continue;
            const id = String(node.id || '');
            const cls = String(node.className || '');
            const text = String(node.textContent || '').trim().slice(0, 120);
            if (MEMORY_NAME_RE.test(`${id} ${cls} ${text}`)) add(id || cls || text, '扩展设置界面', text);
        }
    } catch {}

    return [...traces.values()].map(item => ({
        token: item.token,
        sources: [...item.sources],
        details: [...item.details],
    }));
}

function detectBaiBaiBook(traceTokens = []) {
    const api = KNOWN_BAIBAI_KEYS.map(safeGlobalValue).find(Boolean);
    const installedTrace = traceTokens.some(x => /baibai|柏宝书|st[-_ ]?baibai[-_ ]?book/i.test(x));
    if (!api && !installedTrace) return null;
    const readable = !!api && typeof api.getInjectedHistory === 'function';
    return {
        id: 'baibai-book',
        name: '柏宝书',
        kind: 'known-adapter',
        readable,
        selectedAllowed: readable,
        status: readable ? '可读取（已适配）' : '已检测到安装痕迹，公开 API 尚未就绪',
        source: api ? 'globalThis.STBaiBaiBook' : '扩展安装痕迹',
        details: api ? `API v${api.apiVersion ?? '?'} · 插件 ${api.pluginVersion ?? '未知版本'}` : '请确认柏宝书已启用并完成加载',
    };
}

function detectGlobalCandidates() {
    const results = [];
    let keys = [];
    try { keys = Object.getOwnPropertyNames(globalThis); } catch { return results; }
    for (const key of keys) {
        if (KNOWN_BAIBAI_KEYS.includes(key) || EXCLUDED_GLOBAL_KEYS.has(key)) continue;
        const value = safeGlobalValue(key);
        if (!value || (typeof value !== 'object' && typeof value !== 'function')) continue;
        const methods = safeFunctionNames(value);
        const nameHit = MEMORY_NAME_RE.test(key);
        const methodHit = methods.some(name => MEMORY_METHOD_RE.test(name));
        if (!nameHit && !methodHit) continue;

        const hasInjectedHistory = typeof value.getInjectedHistory === 'function';
        results.push({
            id: `global:${encodeURIComponent(key)}`,
            name: titleFromToken(key),
            kind: hasInjectedHistory ? 'generic-public-api' : 'unknown-global',
            readable: hasInjectedHistory,
            selectedAllowed: hasInjectedHistory,
            status: hasInjectedHistory ? '可试读（检测到 getInjectedHistory）' : '已检测到疑似记忆 API，暂无读取适配器',
            source: `globalThis.${key}`,
            details: methods.length ? `公开方法：${methods.filter(x => MEMORY_METHOD_RE.test(x)).slice(0, 8).join('、') || methods.slice(0, 5).join('、')}` : '未发现可识别的公开读取方法',
        });
        if (results.length >= MAX_SCAN_RESULTS) break;
    }
    return results;
}

function dedupeScanResults(results) {
    const map = new Map();
    for (const item of results) {
        if (!item?.id) continue;
        const key = item.id.toLowerCase();
        const existing = map.get(key);
        if (!existing || (!existing.readable && item.readable)) map.set(key, item);
    }
    return [...map.values()].slice(0, MAX_SCAN_RESULTS);
}

export function scanMemoryPlugins() {
    const traces = collectExtensionTraces();
    const traceTokens = traces.flatMap(item => [item.token, ...item.details]);
    const results = [];

    const baibai = detectBaiBaiBook(traceTokens);
    if (baibai) results.push(baibai);
    results.push(...detectGlobalCandidates());

    const knownText = results.map(x => `${x.name} ${x.source}`).join(' ').toLowerCase();
    for (const trace of traces) {
        const token = trace.token;
        if (baibai && /baibai|柏宝书|st[-_ ]?baibai[-_ ]?book/i.test(`${token} ${trace.details.join(' ')}`)) continue;
        if (!token || knownText.includes(token.toLowerCase())) continue;
        results.push({
            id: `trace:${encodeURIComponent(token)}`,
            name: titleFromToken(token),
            kind: 'installation-trace',
            readable: false,
            selectedAllowed: false,
            status: '疑似记忆插件，已发现但暂无读取适配器',
            source: trace.sources.join('、') || '扩展痕迹',
            details: trace.details[0] || '扫描只确认存在，不会读取内部变量或数据库',
        });
    }

    return dedupeScanResults(results).sort((a, b) => {
        if (a.readable !== b.readable) return a.readable ? -1 : 1;
        if (a.kind === 'known-adapter' && b.kind !== 'known-adapter') return -1;
        if (b.kind === 'known-adapter' && a.kind !== 'known-adapter') return 1;
        return a.name.localeCompare(b.name, 'zh-CN');
    });
}

function normalizeMemoryText(result) {
    if (result == null) return '';
    if (typeof result === 'string') return result.trim();
    if (Array.isArray(result)) {
        return result.map(item => normalizeMemoryText(item)).filter(Boolean).join('\n').trim();
    }
    if (typeof result !== 'object') return String(result).trim();

    const preferred = ['relativeText', 'text', 'content', 'memoryText', 'historyText', 'summary'];
    for (const key of preferred) {
        if (typeof result[key] === 'string' && result[key].trim()) return result[key].trim();
    }
    if (Array.isArray(result.nodes)) {
        const nodeText = result.nodes.map(node => node?.relativeText || node?.text || node?.summary || '').filter(Boolean).join('\n');
        if (nodeText.trim()) return nodeText.trim();
    }
    return '';
}

function balancedLimit(text, maxChars) {
    const raw = String(text || '').trim();
    const max = Math.max(400, Number(maxChars) || 2200);
    if (raw.length <= max) return raw;
    const headSize = Math.floor(max * 0.35);
    const tailSize = max - headSize - 26;
    return `${raw.slice(0, headSize).trim()}\n……[中段为控制长度已省略]……\n${raw.slice(-tailSize).trim()}`;
}

function readBaiBaiBook() {
    const api = safeGlobalValue('STBaiBaiBook');
    if (!api || typeof api.getInjectedHistory !== 'function') throw new Error('柏宝书公开 API 未就绪');
    const result = api.getInjectedHistory();
    if (result && typeof result.then === 'function') throw new Error('当前测试版暂不支持异步 getInjectedHistory 接口');
    let snapshot = null;
    if (typeof api.getSnapshot === 'function') {
        try { snapshot = api.getSnapshot(); } catch {}
    }
    return {
        providerId: 'baibai-book',
        providerName: '柏宝书',
        text: normalizeMemoryText(result),
        coverage: result?.coverage || snapshot?.coverage || null,
        chat: snapshot?.chat || null,
        revision: snapshot?.revision ?? null,
    };
}

function readGenericGlobal(providerId) {
    const encoded = String(providerId || '').slice('global:'.length);
    const key = decodeURIComponent(encoded);
    const api = safeGlobalValue(key);
    if (!api || typeof api.getInjectedHistory !== 'function') throw new Error(`${key} 的 getInjectedHistory 已不可用`);
    const result = api.getInjectedHistory();
    if (result && typeof result.then === 'function') throw new Error('当前测试版暂不支持异步 getInjectedHistory 接口');
    return {
        providerId,
        providerName: titleFromToken(key),
        text: normalizeMemoryText(result),
        coverage: result?.coverage || null,
        chat: result?.chat || null,
        revision: result?.revision ?? null,
    };
}

export function readMemoryProvider(providerId) {
    if (providerId === 'baibai-book') return readBaiBaiBook();
    if (String(providerId || '').startsWith('global:')) return readGenericGlobal(providerId);
    throw new Error('当前来源只有扫描结果，尚无可用读取适配器');
}

export function testMemoryProvider(providerId) {
    const startedAt = globalThis.performance?.now?.() ?? Date.now();
    try {
        const result = readMemoryProvider(providerId);
        const elapsed = Math.max(0, Math.round((globalThis.performance?.now?.() ?? Date.now()) - startedAt));
        const text = String(result.text || '').trim();
        return {
            ok: true,
            providerId,
            providerName: result.providerName,
            chars: text.length,
            hasContent: !!text,
            chatId: result.chat?.id || '',
            characterName: result.chat?.characterName || '',
            coverageComplete: result.coverage?.complete,
            missingFloors: Array.isArray(result.coverage?.missingAiFloors) ? result.coverage.missingAiFloors.length : 0,
            revision: result.revision,
            elapsed,
        };
    } catch (error) {
        return {
            ok: false,
            providerId,
            error: error?.message || String(error),
        };
    }
}

function normalizedDedupKey(text) {
    return String(text || '').toLowerCase().replace(/\s+/g, '').slice(0, 1200);
}

export function readSelectedMemoryForPrompt(settings, maxChars = 2200) {
    if (!settings?.memoryScanEnabled) return null;
    const selected = Array.isArray(settings.memoryProviderIds) ? settings.memoryProviderIds : [];
    if (!selected.length) return null;

    const chunks = [];
    const seen = new Set();
    const errors = [];
    const sources = [];

    for (const providerId of selected.slice(0, 6)) {
        try {
            const result = readMemoryProvider(providerId);
            const text = String(result.text || '').trim();
            if (!text) continue;
            const key = normalizedDedupKey(text);
            if (seen.has(key)) continue;
            seen.add(key);
            sources.push(result.providerName || providerId);
            const coverageNote = result.coverage?.complete === false
                ? `\n[来源提示：该记忆存在缺口，缺失楼层数 ${Array.isArray(result.coverage?.missingAiFloors) ? result.coverage.missingAiFloors.length : '未知'}]`
                : '';
            chunks.push(`【来源：${result.providerName || providerId}】\n${text}${coverageNote}`);
        } catch (error) {
            errors.push(`${providerId}: ${error?.message || error}`);
        }
    }

    if (!chunks.length) return errors.length ? { text: '', sources: [], errors } : null;
    return {
        text: balancedLimit(chunks.join('\n\n'), maxChars),
        sources,
        errors,
    };
}
