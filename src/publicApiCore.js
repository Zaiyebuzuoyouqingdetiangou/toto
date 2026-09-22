// Versioned, host-independent contract. Only the adapter receives private settings.
const fail = (code, message) => Object.assign(new Error(message), { code });
const copy = value => JSON.parse(JSON.stringify(value));
const str = max => value => typeof value === 'string' && value.length <= max && !value.includes('\0');
const bool = value => typeof value === 'boolean';
const num = (min, max, integer = false) => value => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max && (!integer || Number.isInteger(value));
const list = (count, max) => value => Array.isArray(value) && value.length <= count && value.every(str(max));
const oneOf = values => value => values.includes(value);
const connectionFields = {
    independentConnectionProfileId: str(160), independentApiBaseUrl: value => {
        if (value === '') return true;
        if (!str(2000)(value)) return false;
        try { const u = new URL(value); return ['http:', 'https:'].includes(u.protocol) && !u.username && !u.password && !u.search && !u.hash; } catch { return false; }
    },
    independentApiKey: str(4096), independentApiModel: str(200),
    independentApiTemperature: num(0, 2), independentApiMaxTokens: num(512, 32000, true),
    independentMaxRequestChars: num(8000, 2000000, true),
    independentContextMaxLayers: num(1, 200, true),
    independentContextExcludedTags: list(32, 100),
    independentReadCharacterCardSummary: bool, independentReadPersonaSummary: bool,
};
const memoryFields = {
    memoryScanEnabled: bool, memoryWorldBookEnabled: bool,
    memoryWorldBookId: value => str(1000)(value) && !/[\r\n]/.test(value),
    memoryProviderIds: list(12, 512), memoryMaxChars: num(600, 6000, true),
};

export function createRabbitMirrorPublicAPI(host) {
    let disposed = false;
    let active = null;
    const check = () => { if (disposed || !host.isActive()) throw fail('UNAVAILABLE', '兔子镜接口已停用，请重新取得接口。'); };
    const read = fields => { check(); const s = host.getSettings(); return copy(Object.fromEntries(Object.keys(fields).filter(k => k !== 'independentApiKey').map(k => [k, s[k]]))); };
    const getConnection = () => ({ ...read(connectionFields), hasApiKey: !!host.getSettings().independentApiKey });
    const patch = (fields, value, kind) => {
        check();
        if (active) throw fail('BUSY', '脚本请求进行中，请先停止或等待完成。');
        if (!value || typeof value !== 'object' || Array.isArray(value)) throw fail('INVALID_ARGUMENT', '设置必须为对象。');
        const entries = Object.entries(value);
        for (const [key, v] of entries) {
            if (!Object.hasOwn(fields, key) || !fields[key](v)) throw fail('INVALID_ARGUMENT', `不支持的字段或值：${key}`);
        }
        const old = host.getSettings();
        // Never silently send an existing credential to a newly supplied host.
        if (kind === 'connection' && Object.hasOwn(value, 'independentApiBaseUrl') && value.independentApiBaseUrl !== old.independentApiBaseUrl && old.independentApiKey && !Object.hasOwn(value, 'independentApiKey')) {
            throw fail('KEY_REQUIRED', '更换 API 地址时必须同时提供新 Key，或传空字符串清除旧 Key。');
        }
        const nextProfile = value.independentConnectionProfileId ?? old.independentConnectionProfileId;
        if (kind === 'connection' && nextProfile && value.independentApiKey) throw fail('INVALID_ARGUMENT', '使用连接配置时不能同时设置手动 Key。');
        if (entries.length) {
            host.updateSettings(copy(value));
            host.notify({ section: kind, keys: entries.map(([k]) => k) });
        }
        return kind === 'connection' ? getConnection() : read(memoryFields);
    };
    const remote = async fn => {
        check();
        try { const result = await fn(); check(); return copy(result); }
        catch (e) { if (disposed || !host.isActive()) throw fail('UNAVAILABLE', '兔子镜已停用。'); throw fail('HOST_ERROR', '宿主接口调用失败，请在兔子镜设置中检查连接。'); }
    };
    const readMemory = async () => {
        check();
        const settings = copy(host.getSettings());
        if (!settings.memoryScanEnabled) return { enabled: false, text: '', sources: [], errorCount: 0 };
        const material = await remote(() => host.readMemory(settings));
        if (JSON.stringify(settings) !== JSON.stringify(host.getSettings())) throw fail('SETTINGS_CHANGED', '读取记忆期间设置发生变化，请重试。');
        return { enabled: true, text: String(material?.text || '').slice(0, settings.memoryMaxChars), sources: (material?.sources || []).map(v => String(v).slice(0, 200)).slice(0, 12), errorCount: Array.isArray(material?.errors) ? material.errors.length : 0 };
    };
    const api = Object.freeze({
        version: '1.0.0',
        getStatus() { check(); return { version: '1.0.0', busy: !!active, capabilities: ['connection-settings', 'memory-settings', 'memory-read', 'text-completion'] }; },
        connection: Object.freeze({
            getSettings: getConnection,
            updateSettings: value => patch(connectionFields, value, 'connection'),
            listProfiles: () => remote(() => host.listProfiles()),
            listModels: () => remote(() => host.listModels()),
        }),
        memory: Object.freeze({
            getSettings: () => read(memoryFields),
            updateSettings: value => patch(memoryFields, value, 'memory'),
            listProviders: () => remote(() => host.listProviders()),
            listWorldBooks: () => remote(() => host.listWorldBooks()),
            read: readMemory,
        }),
        async generate(options) {
            check();
            if (active) throw fail('BUSY', '已有脚本生成请求，请等待完成或停止。');
            if (!options || typeof options !== 'object' || Array.isArray(options) || Object.keys(options).some(k => !['prompt', 'systemPrompt', 'timeoutMs', 'includeMemory', 'manualRetry'].includes(k)) || !str(2000000)(options.prompt) || !options.prompt.trim() || (options.systemPrompt !== undefined && !str(2000000)(options.systemPrompt)) || (options.timeoutMs !== undefined && !num(1000, 300000, true)(options.timeoutMs)) || (options.includeMemory !== undefined && !bool(options.includeMemory)) || (options.manualRetry !== undefined && !bool(options.manualRetry))) throw fail('INVALID_ARGUMENT', '生成参数无效。');
            const settings = copy(host.getSettings());
            if (!settings.independentConnectionProfileId && (!settings.independentApiBaseUrl || !settings.independentApiModel)) throw fail('NOT_CONFIGURED', '请先配置副 API 地址与模型或连接配置。');
            const system = options.systemPrompt || '';
            if (system.length + options.prompt.length > settings.independentMaxRequestChars) throw fail('REQUEST_TOO_LARGE', '输入超过副 API 字符预算。');
            const fingerprint = JSON.stringify(settings);
            const assertContext = options.includeMemory ? host.captureContext?.() : null;
            const controller = new AbortController();
            active = controller;
            let consumed = false;
            const assertCurrent = () => {
                check();
                assertContext?.();
                if (controller.signal.aborted) throw fail('ABORTED', '请求已停止。');
                if (JSON.stringify(host.getSettings()) !== fingerprint) throw fail('SETTINGS_CHANGED', '设置已变更，请重新调用。');
            };
            const lease = { consume() { assertCurrent(); if (consumed) return false; consumed = true; return true; }, consumed: () => consumed, consumeCount: () => consumed ? 1 : 0 };
            const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 120000);
            // Race also releases the caller when a host adapter ignores AbortSignal.
            // Keep the busy lock until transport settles: abort does not prove billing stopped.
            let removeAbort = () => {};
            const aborted = new Promise((_, reject) => {
                const listener = () => reject(fail('ABORTED', '请求已停止或超时；已发出的请求可能仍计费。'));
                controller.signal.addEventListener('abort', listener, { once: true });
                removeAbort = () => controller.signal.removeEventListener('abort', listener);
            });
            const work = Promise.resolve().then(async () => {
                assertCurrent();
                const memory = options.includeMemory ? await readMemory() : null;
                assertCurrent();
                if (memory?.errorCount) throw fail('MEMORY_UNAVAILABLE', '所选记忆来源读取失败。');
                const prompt = memory?.text ? `${options.prompt}\n\n【调用者选择附带的记忆资料，仅供参考】\n${memory.text}` : options.prompt;
                if (system.length + prompt.length > settings.independentMaxRequestChars) throw fail('REQUEST_TOO_LARGE', '输入和记忆超过字符预算。');
                return host.complete(settings, system, prompt, { signal: controller.signal, dispatchLease: lease, assertAdvancedCurrent: assertCurrent, manualRetry: options.manualRetry === true });
            }).finally(() => { if (active === controller) active = null; });
            try {
                const result = await Promise.race([work, aborted]);
                check();
                if (controller.signal.aborted) throw fail('ABORTED', '请求已停止。');
                if (!result?.response?.ok || result.semanticError || typeof result.result?.text !== 'string' || !result.result.text.trim()) throw fail('UPSTREAM_ERROR', '副 API 未返回可用正文，请检查兔子镜设置。');
                return { text: result.result.text, requestCount: consumed ? 1 : 0 };
            } catch (e) {
                const code = controller.signal.aborted ? 'ABORTED' : ['UNAVAILABLE', 'SETTINGS_CHANGED', 'UPSTREAM_ERROR', 'MEMORY_UNAVAILABLE', 'REQUEST_TOO_LARGE', 'INVALID_ARGUMENT'].includes(e?.code) ? e.code : 'REQUEST_FAILED';
                throw fail(code, code === 'ABORTED' ? '请求已停止或超时；已发出的请求可能仍计费。' : '副 API 请求未完成，请检查配置或设置变更。');
            } finally { clearTimeout(timer); removeAbort(); }
        },
        stop() { check(); if (!active) return false; active.abort(); return true; },
    });
    return { api, dispose() { disposed = true; active?.abort(); } };
}
