import { rmT as __rmT } from "./textTable.js?rmv=2.5.4";
const fail = (code, message) => Object.assign(new Error(message), { code });
const copy = value => JSON.parse(JSON.stringify(value));
const str = max => value => typeof value === 'string' && value.length <= max && !value.includes('\0');
const bool = value => typeof value === 'boolean';
const num = (min, max, integer = false) => value => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max && (!integer || Number.isInteger(value));
const list = (count, max) => value => Array.isArray(value) && value.length <= count && value.every(str(max));
const oneOf = values => value => values.includes(value);
const connectionFields = {
    independentConnectionProfileId: str(160), independentApiBaseUrl: value => {
        if (value === '')
            return true;
        if (!str(2000)(value))
            return false;
        try {
            const u = new URL(value);
            return ['http:', 'https:'].includes(u.protocol) && !u.username && !u.password && !u.search && !u.hash;
        }
        catch {
            return false;
        }
    },
    independentApiKey: str(4096), independentApiModel: str(200),
    independentApiTemperature: num(0, 2), independentApiMaxTokens: num(512, 64000, true),
    independentMaxRequestChars: num(8000, 2000000, true),
    independentContextMaxLayers: num(1, 200, true),
    independentContextExcludedTags: list(128, 100),
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
    const check = () => { if (disposed || !host.isActive())
        throw fail('UNAVAILABLE', __rmT("kNSJLWAqBeKCqnFQq.yS0OIOnrbNiFcEhVcjmQ6q7Ld.bh")); };
    const read = fields => { check(); const s = host.getSettings(); return copy(Object.fromEntries(Object.keys(fields).filter(k => k !== 'independentApiKey').map(k => [k, s[k]]))); };
    const getConnection = () => ({ ...read(connectionFields), hasApiKey: !!host.getSettings().independentApiKey });
    const patch = (fields, value, kind) => {
        check();
        if (active)
            throw fail('BUSY', __rmT("sctpQOVcj3ZQl6q0RFpDsDF.6enCyZ.hHzN2ZlN2.yqG5ZQX"));
        if (!value || typeof value !== 'object' || Array.isArray(value))
            throw fail('INVALID_ARGUMENT', __rmT("qrndPNWKkCMqtCdzFq5pUT"));
        const entries = Object.entries(value);
        for (const [key, v] of entries) {
            if (!Object.hasOwn(fields, key) || !fields[key](v))
                throw fail('INVALID_ARGUMENT', `${__rmT("Cu.Twd4IYfuxL3Rpk3xf8hty")}${key}`);
        }
        const old = host.getSettings();
        if (kind === 'connection' && Object.hasOwn(value, 'independentApiBaseUrl') && value.independentApiBaseUrl !== old.independentApiBaseUrl && old.independentApiKey && !Object.hasOwn(value, 'independentApiKey')) {
            throw fail('KEY_REQUIRED', __rmT("K6PVVMH04TRJjUe3BezY58NWh60q_T_WT_xCToKztKEKrloat7ev_95nAKpbzKadK1p1sRCFvNTuzeat45UkGp.JVmHD84YO"));
        }
        const nextProfile = value.independentConnectionProfileId ?? old.independentConnectionProfileId;
        if (kind === 'connection' && nextProfile && value.independentApiKey)
            throw fail('INVALID_ARGUMENT', __rmT("EFRFWViIJOWBXLMnc8Yf4pM6NR8j4ME_QSABT6cpCkSQfaN1Hcfr7f"));
        if (entries.length) {
            host.updateSettings(copy(value));
            host.notify({ section: kind, keys: entries.map(([k]) => k) });
        }
        return kind === 'connection' ? getConnection() : read(memoryFields);
    };
    const remote = async (fn) => {
        check();
        try {
            const result = await fn();
            check();
            return copy(result);
        }
        catch (e) {
            if (disposed || !host.isActive())
                throw fail('UNAVAILABLE', __rmT("l5Tz7FKkk47DqCuy4DD"));
            throw fail('HOST_ERROR', __rmT("VqJzto5AGuGIAnUr9fk_mN9m9ERIZ2vtmK047EpzS2RQWc.PkAPNdSYzzBG"));
        }
    };
    const readMemory = async () => {
        check();
        const settings = copy(host.getSettings());
        if (!settings.memoryScanEnabled)
            return { enabled: false, text: '', sources: [], errorCount: 0 };
        const material = await remote(() => host.readMemory(settings));
        if (JSON.stringify(settings) !== JSON.stringify(host.getSettings()))
            throw fail('SETTINGS_CHANGED', __rmT("PWDlYHpHkdyBMnSItk0COlqRHQWton.NLwpqJtBV_6r.bh"));
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
            if (active)
                throw fail('BUSY', __rmT("r8mOQwxmlKKRvopQ6e7rBqYuYG6xpExYtOmzYeLduyNNxzQX"));
            if (!options || typeof options !== 'object' || Array.isArray(options) || Object.keys(options).some(k => !['prompt', 'systemPrompt', 'timeoutMs', 'includeMemory', 'manualRetry'].includes(k)) || !str(2000000)(options.prompt) || !options.prompt.trim() || (options.systemPrompt !== undefined && !str(2000000)(options.systemPrompt)) || (options.timeoutMs !== undefined && !num(1000, 300000, true)(options.timeoutMs)) || (options.includeMemory !== undefined && !bool(options.includeMemory)) || (options.manualRetry !== undefined && !bool(options.manualRetry)))
                throw fail('INVALID_ARGUMENT', __rmT("oIOzbhrrhh5AMvuo4DD"));
            const settings = copy(host.getSettings());
            if (!settings.independentConnectionProfileId && (!settings.independentApiBaseUrl || !settings.independentApiModel))
                throw fail('NOT_CONFIGURED', __rmT("GF9kEmkrtwyvpwEAeFugjhLHFCl4wO1Kagq72DmmPso1HLqgCXc0Sq5X"));
            const system = options.systemPrompt || '';
            if (system.length + options.prompt.length > settings.independentMaxRequestChars)
                throw fail('REQUEST_TOO_LARGE', __rmT("3hZCtUV1QnnfI7hpiNweNSKqE3XqKivsrcF2KmKq"));
            const fingerprint = JSON.stringify(settings);
            const assertContext = options.includeMemory ? host.captureContext?.() : null;
            const controller = new AbortController();
            active = controller;
            let consumed = false;
            const assertCurrent = () => {
                check();
                assertContext?.();
                if (controller.signal.aborted)
                    throw fail('ABORTED', __rmT("aWj8l6TnZs2Azyf1"));
                if (JSON.stringify(host.getSettings()) !== fingerprint)
                    throw fail('SETTINGS_CHANGED', __rmT("RBFUwHVY3N26xixGJ9O6GBYROF0.87s2"));
            };
            const lease = { consume() { assertCurrent(); if (consumed)
                    return false; consumed = true; return true; }, consumed: () => consumed, consumeCount: () => consumed ? 1 : 0 };
            const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 120000);
            let removeAbort = () => { };
            const aborted = new Promise((_, reject) => {
                const listener = () => reject(fail('ABORTED', __rmT("GF9J0CmJ4RvmJscLCxw.yc3LRI6Si9w6YGY10Y2pewNC9hjdbm_Aoj5X")));
                controller.signal.addEventListener('abort', listener, { once: true });
                removeAbort = () => controller.signal.removeEventListener('abort', listener);
            });
            const work = Promise.resolve().then(async () => {
                assertCurrent();
                const memory = options.includeMemory ? await readMemory() : null;
                assertCurrent();
                if (memory?.errorCount)
                    throw fail('MEMORY_UNAVAILABLE', __rmT("2lHbTVLN0AcJIbNrc5t5oK4bie6rrk"));
                const prompt = memory?.text ? `${options.prompt}${__rmT("GSd5_cdWfYY9JIZ5C_WfpigLox2.NVOeN352ji2EM5yOWTIlQ181UuV7k2G")}${memory.text}` : options.prompt;
                if (system.length + prompt.length > settings.independentMaxRequestChars)
                    throw fail('REQUEST_TOO_LARGE', __rmT("rDHiCyK31j6QmaYNr95ONxlnkDxZ6xs2"));
                return host.complete(settings, system, prompt, { signal: controller.signal, dispatchLease: lease, assertAdvancedCurrent: assertCurrent, manualRetry: options.manualRetry === true });
            }).finally(() => { if (active === controller)
                active = null; });
            try {
                const result = await Promise.race([work, aborted]);
                check();
                if (controller.signal.aborted)
                    throw fail('ABORTED', __rmT("aWj8l6TnZs2Azyf1"));
                if (!result?.response?.ok || result.semanticError || typeof result.result?.text !== 'string' || !result.result.text.trim())
                    throw fail('UPSTREAM_ERROR', __rmT("cp4hN.WOBD62R5aR7Wy_gOIegfXqfwotCo1RaWzzB_pfJfHND5qJqwFoNbl9uT"));
                return { text: result.result.text, requestCount: consumed ? 1 : 0 };
            }
            catch (e) {
                const code = controller.signal.aborted ? 'ABORTED' : ['UNAVAILABLE', 'SETTINGS_CHANGED', 'UPSTREAM_ERROR', 'MEMORY_UNAVAILABLE', 'REQUEST_TOO_LARGE', 'INVALID_ARGUMENT'].includes(e?.code) ? e.code : 'REQUEST_FAILED';
                throw fail(code, code === 'ABORTED' ? __rmT("GF9J0CmJ4RvmJscLCxw.yc3LRI6Si9w6YGY10Y2pewNC9hjdbm_Aoj5X") : __rmT("cp4hN.WOBD62R5aRdFsJ5o7Cnhoteuh28fsInLQi64S2lYOH5oq8RQSrsXG9uT"));
            }
            finally {
                clearTimeout(timer);
                removeAbort();
            }
        },
        stop() { check(); if (!active)
            return false; active.abort(); return true; },
    });
    return { api, dispose() { disposed = true; active?.abort(); } };
}
