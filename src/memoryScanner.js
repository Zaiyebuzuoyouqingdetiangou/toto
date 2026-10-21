import { extension_settings } from '../../../../extensions.js';

const MEMORY_TRACE_RE = /(memory|memories|memo|recall|remember|summary|summar|history|lore|book|horae|vector|记忆|回忆|忆|摘要|总结|往事|历史)/i;
const EXCLUDED_GLOBAL_KEYS = new Set([
    'history', 'window', 'self', 'globalThis', 'document', 'location', 'navigator', 'performance',
    'localStorage', 'sessionStorage', 'caches', 'frames', 'parent', 'top', 'opener', 'SillyTavern',
    '$', 'jQuery', 'toastr',
]);
const LEGACY_PROVIDER_ALIASES = new Map([
    ['baibai-book', 'global:STBaiBaiBook'],
]);
const MAX_READABLE_RESULTS = 12;

// ——— 千千结（ST-MyriadKnots）长期记忆：版本化只读桥 globalThis.qqj_v3_public_bridge_v1 ———
// 不走 getInjectedHistory：同步读 getPromptSnapshot()（千千结最近一次为正文准备好的召回与前情，
// 正文生成结束后照样保留），没有材料时再异步读 readMemory()。只读当前聊天，核对聊天身份，不写、不触发整理。
// 它的快照本来就是给正文生成之后读的，所以副 API（独立生成、重说、补楼）也可以读，不同于别的插件接口。
const QQJ_KEY = 'qqj_v3_public_bridge_v1';
export const QQJ_PROVIDER_ID = `global:${QQJ_KEY}`;
const QQJ_NAME = '千千结（长期记忆）';
const QQJ_ASYNC_TIMEOUT_MS = 6000;

function qqjBridge() {
    const api = safeGlobalValue(QQJ_KEY);
    return api && typeof api === 'object' && typeof api.getStatus === 'function' ? api : null;
}

function currentHostChatId() {
    try {
        const ctx = globalThis.SillyTavern?.getContext?.() || {};
        return String(ctx.getCurrentChatId?.() ?? ctx.chatId ?? '');
    } catch { return ''; }
}

function qqjStatus(api) {
    let status;
    try { status = api.getStatus(); } catch (error) { return { ok: false, message: `千千结状态读取失败：${error?.message || error}` }; }
    const state = String(status?.status || '');
    if (state === 'disabled') return { ok: false, message: '千千结当前已关闭' };
    if (state !== 'ready') return { ok: false, message: '千千结还没准备好当前聊天（切换聊天后稍等再试）' };
    const hostChatId = String(status?.identity?.hostChatId ?? '');
    const current = currentHostChatId();
    if (hostChatId && current && hostChatId !== current) return { ok: false, message: '千千结读到的不是当前聊天，本次不用' };
    return { ok: true, identity: status.identity || null };
}

function sameChat(identity) {
    const hostChatId = String(identity?.hostChatId ?? '');
    const current = currentHostChatId();
    return !hostChatId || !current || hostChatId === current;
}

function qqjSnapshotText(snapshot) {
    if (!snapshot || snapshot.status !== 'ready' || !sameChat(snapshot.identity)) return '';
    const prequel = safeText(snapshot.prequel?.text);
    const recall = safeText(snapshot.recall?.text);
    return [prequel && `［前情］\n${prequel}`, recall && `［相关记忆］\n${recall}`].filter(Boolean).join('\n\n');
}

function readQqjProvider() {
    const api = qqjBridge();
    if (!api) throw new Error('千千结的公开读取接口当前不可用（没装、没启用或还在加载）');
    const gate = qqjStatus(api);
    if (!gate.ok) throw new Error(gate.message);
    let snapshot = null;
    try { snapshot = typeof api.getPromptSnapshot === 'function' ? api.getPromptSnapshot() : null; } catch { snapshot = null; }
    return {
        providerId: QQJ_PROVIDER_ID,
        providerName: QQJ_NAME,
        text: qqjSnapshotText(snapshot),
        coverage: null,
        chat: { id: String(gate.identity?.hostChatId || ''), characterName: '' },
        revision: null,
        snapshotStatus: String(snapshot?.status || ''),
    };
}

// 同步快照是空的（这一轮千千结没准备召回材料，比如刚打开聊天）：异步读一次整份记忆文本，限时，读不到就算了。
async function readQqjMemoryText() {
    const api = qqjBridge();
    if (!api || typeof api.readMemory !== 'function' || !qqjStatus(api).ok) return '';
    let timer = null;
    try {
        const result = await Promise.race([
            Promise.resolve().then(() => api.readMemory()),
            new Promise(resolve => { timer = setTimeout(() => resolve(null), QQJ_ASYNC_TIMEOUT_MS); }),
        ]);
        if (!result || result.status !== 'ready' || !sameChat(result.identity)) return '';
        return safeText(result.text);
    } catch { return ''; } finally { if (timer) clearTimeout(timer); }
}

function detectQqj(traces) {
    const api = qqjBridge();
    if (!api) return null;
    const gate = qqjStatus(api);
    const trace = traces.find(item => /myriadknots|qqj|千千结/i.test(`${item.token} ${item.details.join(' ')}`)) || null;
    return {
        id: QQJ_PROVIDER_ID,
        name: QQJ_NAME,
        kind: 'public-api',
        readable: true,
        selectedAllowed: true,
        status: gate.ok ? '可读取' : gate.message,
        source: `globalThis.${QQJ_KEY}`,
        details: `公开接口：getPromptSnapshot / readMemory · 读这一轮千千结为正文准备的前情与相关记忆${gate.ok ? '' : ` · 当前：${gate.message}`}`,
        matchedTraceId: trace?.id || '',
    };
}
const MAX_PENDING_RESULTS = 20;

function safeGlobalValue(key) {
    try {
        return globalThis?.[key];
    } catch {
        return undefined;
    }
}

function titleFromToken(token) {
    return String(token || '')
        .replace(/^global:/, '')
        .replace(/^settings:/, '')
        .replace(/^script:/, '')
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim() || '未命名来源';
}

function normalizedToken(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9\u3400-\u9fff]+/g, '');
}

function safeText(value) {
    return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function readDeclaredName(api) {
    if (!api || (typeof api !== 'object' && typeof api !== 'function')) return '';
    const direct = [
        api.displayName,
        api.pluginName,
        api.extensionName,
        api.name,
    ];
    const nested = [
        api.meta?.displayName,
        api.meta?.name,
        api.metadata?.displayName,
        api.metadata?.name,
        api.manifest?.display_name,
        api.manifest?.displayName,
        api.manifest?.name,
    ];
    for (const value of [...direct, ...nested]) {
        const name = safeText(value);
        if (name && !/^(object|function|api)$/i.test(name)) return name.slice(0, 100);
    }
    return '';
}

function collectExtensionTraces() {
    const traces = new Map();
    const add = (token, source, detail = '') => {
        const raw = String(token || '').trim();
        const context = `${raw} ${detail}`;
        if (!raw || !MEMORY_TRACE_RE.test(context)) return;
        const normalized = normalizedToken(raw) || raw.toLowerCase();
        const existing = traces.get(normalized) || {
            id: normalized,
            token: raw,
            sources: new Set(),
            details: new Set(),
        };
        existing.sources.add(source);
        if (detail) existing.details.add(String(detail).slice(0, 220));
        traces.set(normalized, existing);
    };

    try {
        for (const key of Object.keys(extension_settings || {})) add(key, '扩展设置');
    } catch {}

    try {
        for (const script of document.querySelectorAll('script[src]')) {
            const src = String(script.getAttribute('src') || '');
            if (!MEMORY_TRACE_RE.test(src)) continue;
            const parts = src.split(/[/?#]/).filter(Boolean);
            const thirdPartyIndex = parts.findIndex(x => x === 'third-party');
            const token = thirdPartyIndex >= 0
                ? parts[thirdPartyIndex + 1]
                : parts.at(-2) || parts.at(-1) || src;
            add(token, '已加载扩展', src);
        }
    } catch {}

    return [...traces.values()].map(item => ({
        id: item.id,
        token: item.token,
        sources: [...item.sources],
        details: [...item.details],
    }));
}

function findMatchingTrace(globalKey, traces) {
    const keyNorm = normalizedToken(globalKey);
    if (!keyNorm) return null;
    let best = null;
    for (const trace of traces) {
        const tokenNorm = normalizedToken(trace.token);
        const detailNorm = normalizedToken(trace.details.join(' '));
        const exact = tokenNorm === keyNorm;
        const contains = tokenNorm && (tokenNorm.includes(keyNorm) || keyNorm.includes(tokenNorm));
        const detailHit = detailNorm.includes(keyNorm);
        if (!exact && !contains && !detailHit) continue;
        const score = exact ? 3 : contains ? 2 : 1;
        if (!best || score > best.score) best = { trace, score };
    }
    return best?.trace || null;
}

function providerDisplayName(api, globalKey, trace = null) {
    return readDeclaredName(api)
        || safeText(trace?.token)
        || titleFromToken(globalKey)
        || '已检测到的记忆来源';
}

function providerDetails(api) {
    const parts = ['公开接口：getInjectedHistory'];
    const apiVersion = api?.apiVersion ?? api?.version;
    const pluginVersion = api?.pluginVersion ?? api?.extensionVersion;
    if (apiVersion !== undefined && apiVersion !== null && String(apiVersion).trim()) {
        parts.push(`API v${String(apiVersion).trim()}`);
    }
    if (pluginVersion !== undefined && pluginVersion !== null && String(pluginVersion).trim()) {
        parts.push(`版本 ${String(pluginVersion).trim()}`);
    }
    return parts.join(' · ');
}

function detectReadablePublicApis(traces) {
    const results = [];
    let keys = [];
    try {
        keys = Object.getOwnPropertyNames(globalThis);
    } catch {
        return results;
    }

    for (const key of keys) {
        if (EXCLUDED_GLOBAL_KEYS.has(key)) continue;
        const api = safeGlobalValue(key);
        if (!api || (typeof api !== 'object' && typeof api !== 'function')) continue;

        let reader;
        try {
            reader = api.getInjectedHistory;
        } catch {
            continue;
        }
        if (typeof reader !== 'function') continue;

        const trace = findMatchingTrace(key, traces);
        results.push({
            id: `global:${encodeURIComponent(key)}`,
            name: providerDisplayName(api, key, trace),
            kind: 'public-api',
            readable: true,
            selectedAllowed: true,
            status: '可读取',
            source: `globalThis.${key}`,
            details: providerDetails(api),
            matchedTraceId: trace?.id || '',
        });
        if (results.length >= MAX_READABLE_RESULTS) break;
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
    return [...map.values()];
}

export function scanMemoryPlugins() {
    const traces = collectExtensionTraces();
    const readable = detectReadablePublicApis(traces);
    const qqj = detectQqj(traces);
    if (qqj) readable.unshift(qqj);
    const matchedTraceIds = new Set(readable.map(item => item.matchedTraceId).filter(Boolean));
    const readableNames = readable.map(item => normalizedToken(`${item.name} ${item.source}`));

    const pending = [];
    for (const trace of traces) {
        if (matchedTraceIds.has(trace.id)) continue;
        const traceNorm = normalizedToken(`${trace.token} ${trace.details.join(' ')}`);
        if (readableNames.some(name => name && traceNorm && (name.includes(traceNorm) || traceNorm.includes(name)))) continue;
        pending.push({
            id: `trace:${encodeURIComponent(trace.token)}`,
            name: titleFromToken(trace.token),
            kind: 'installation-trace',
            readable: false,
            selectedAllowed: false,
            status: '待适配',
            source: trace.sources.join('、') || '扩展痕迹',
            details: trace.details[0] || '未检测到可直接调用的公开读取接口',
        });
        if (pending.length >= MAX_PENDING_RESULTS) break;
    }

    return dedupeScanResults([...readable, ...pending]).sort((a, b) => {
        if (a.readable !== b.readable) return a.readable ? -1 : 1;
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
        const nodeText = result.nodes
            .map(node => node?.relativeText || node?.text || node?.summary || '')
            .filter(Boolean)
            .join('\n');
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

function resolveProviderId(providerId) {
    const raw = String(providerId || '');
    return LEGACY_PROVIDER_ALIASES.get(raw) || raw;
}

function readGlobalProvider(providerId) {
    const resolvedId = resolveProviderId(providerId);
    const encoded = resolvedId.slice('global:'.length);
    const key = decodeURIComponent(encoded);
    const api = safeGlobalValue(key);
    if (!api || typeof api.getInjectedHistory !== 'function') {
        throw new Error(`${titleFromToken(key)} 的公开读取接口当前不可用`);
    }

    const result = api.getInjectedHistory();
    if (result && typeof result.then === 'function') {
        throw new Error('当前版本暂不支持异步 getInjectedHistory 接口');
    }

    let snapshot = null;
    if (typeof api.getSnapshot === 'function') {
        try {
            snapshot = api.getSnapshot();
        } catch {}
    }

    const traces = collectExtensionTraces();
    const trace = findMatchingTrace(key, traces);
    return {
        providerId: resolvedId,
        providerName: providerDisplayName(api, key, trace),
        text: normalizeMemoryText(result),
        coverage: result?.coverage || snapshot?.coverage || null,
        chat: result?.chat || snapshot?.chat || null,
        revision: result?.revision ?? snapshot?.revision ?? null,
    };
}

export function readMemoryProvider(providerId) {
    const resolvedId = resolveProviderId(providerId);
    if (resolvedId === QQJ_PROVIDER_ID) return readQqjProvider();
    if (resolvedId.startsWith('global:')) return readGlobalProvider(resolvedId);
    throw new Error('当前来源只有扫描记录，尚无可用读取接口');
}

export function testMemoryProvider(providerId) {
    const startedAt = globalThis.performance?.now?.() ?? Date.now();
    try {
        const result = readMemoryProvider(providerId);
        const elapsed = Math.max(0, Math.round((globalThis.performance?.now?.() ?? Date.now()) - startedAt));
        const text = String(result.text || '').trim();
        return {
            ok: true,
            providerId: result.providerId || providerId,
            providerName: result.providerName,
            chars: text.length,
            hasContent: !!text,
            chatId: result.chat?.id || '',
            characterName: result.chat?.characterName || '',
            coverageComplete: result.coverage?.complete,
            missingFloors: Array.isArray(result.coverage?.missingAiFloors) ? result.coverage.missingAiFloors.length : 0,
            revision: result.revision,
            elapsed,
            ...(result.providerId === QQJ_PROVIDER_ID && !text ? { note: result.snapshotStatus === 'empty'
                ? '这一轮千千结还没为正文准备召回材料；正式生成时会改读它的整份记忆' : '' } : {}),
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

export function readSelectedMemoryForPrompt(settings, maxChars = 2200, additionalMaterials = []) {
    if (!settings?.memoryScanEnabled) return null;
    const selected = Array.isArray(settings.memoryProviderIds) ? settings.memoryProviderIds : [];
    if (!selected.length && !additionalMaterials.length) return null;

    const chunks = [];
    const seen = new Set();
    const errors = [];
    const sources = [];
    const append = (result, providerId) => {
        const text = String(result?.text || '').trim();
        if (!text) return;
        const key = normalizedDedupKey(text);
        if (seen.has(key)) return;
        seen.add(key);
        sources.push(result.providerName || providerId);
        const coverageNote = result.coverage?.reason === 'worldbook-material-limit'
            ? '\n[来源提示：本次仅按字符上限选取部分世界书资料，不代表完整世界书。]'
            : result.coverage?.complete === false
                ? `\n[来源提示：该记忆存在缺口，缺失楼层数 ${Array.isArray(result.coverage?.missingAiFloors) ? result.coverage.missingAiFloors.length : '未知'}]`
                : '';
        chunks.push(`【来源：${result.providerName || providerId}】\n${text}${coverageNote}`);
    };

    for (const rawProviderId of selected.slice(0, 6)) {
        const providerId = resolveProviderId(rawProviderId);
        try {
            const result = readMemoryProvider(providerId);
            append(result, providerId);
        } catch (error) {
            errors.push(`${providerId}: ${error?.message || error}`);
        }
    }
    for (const result of additionalMaterials.slice(0, 2)) append(result, result?.providerId || '已绑定世界书');

    if (!chunks.length) return errors.length ? { text: '', sources: [], errors } : null;
    return {
        text: balancedLimit(chunks.join('\n\n'), maxChars),
        sources,
        errors,
    };
}

/** The async material phase runs after selection, never during scan/plan/preview. */
export async function prepareSelectedMemoryForPrompt(settings, options = {}) {
    if (!settings?.memoryScanEnabled || options.hasSharedMemoryTheme !== true) return null;
    const independent = String(options.generationType || 'normal') === 'independent';
    const maxChars = Math.max(600, Math.min(6000, Math.floor(Number(options.maxChars ?? settings.memoryMaxChars) || 2200)));
    const additional = [];
    let worldBookError = '';
    if (settings.memoryWorldBookEnabled === true && typeof settings.memoryWorldBookId === 'string' && settings.memoryWorldBookId.trim()) {
        try {
            const { readBoundMemoryWorldBook } = await import('./memoryWorldBook.js?rmv=1.73.17');
            const result = await readBoundMemoryWorldBook(settings, maxChars, options.worldBookOptions);
            if (result) additional.push(result);
        } catch (error) {
            worldBookError = `记忆世界书: ${error?.message || String(error)}`;
        }
    }
    // The new, explicitly bound worldbook is available in both generation modes.
    // Do not silently broaden the pre-existing plugin API access of independent mode.
    // 千千结例外：它的快照就是给正文生成之后读的。
    const selectedIds = Array.isArray(settings.memoryProviderIds) ? settings.memoryProviderIds : [];
    const materialSettings = independent ? { ...settings, memoryProviderIds: selectedIds.filter(id => id === QQJ_PROVIDER_ID) } : settings;
    // 千千结这一轮没有准备好的快照：异步补读一次整份记忆，放进附加材料里（同步读到的是空的，不会重复）。
    if (materialSettings.memoryProviderIds?.includes(QQJ_PROVIDER_ID)) {
        let snapshotText = '';
        try { snapshotText = readQqjProvider().text; } catch { snapshotText = ''; }
        if (!snapshotText) {
            const text = await readQqjMemoryText();
            if (text) additional.unshift({ providerId: QQJ_PROVIDER_ID, providerName: QQJ_NAME, text });
        }
    }
    const material = readSelectedMemoryForPrompt(materialSettings, maxChars, additional);
    if (!worldBookError) return material;
    return {
        ...(material || { text: '', sources: [], errors: [] }),
        errors: [...(material?.errors || []), worldBookError],
    };
}

export function memoryRequestSettingsKey(settings, generationType = 'normal') {
    return JSON.stringify([
        settings?.memoryScanEnabled === true,
        settings?.memoryWorldBookEnabled === true,
        String(settings?.memoryWorldBookId || ''),
        Number(settings?.memoryMaxChars) || 2200,
        (Array.isArray(settings?.memoryProviderIds) ? settings.memoryProviderIds : []).filter(id => generationType !== 'independent' || id === QQJ_PROVIDER_ID),
        settings?.enabled !== false, settings?.autoRabbitMirrorInjection !== false,
        String(settings?.generationSource || 'follow'), String(settings?.mode || ''),
    ]);
}

export function assertMemoryRequestSettings(settings, expected, generationType = 'normal') {
    if (memoryRequestSettingsKey(settings, generationType) === expected) return;
    const error = new Error('共同回忆资料设置在读取期间已变化；本轮未发送或注入兔子镜，请按当前设置重试。');
    error.code = 'RABBIT_MIRROR_MEMORY_STALE';
    error.requestCount = 0;
    throw error;
}
