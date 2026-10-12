import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';

export const FIXED_NOW = 1789375200000;

export function createStore(entries = [], quota = Infinity) {
    const values = new Map(entries);
    return {
        values,
        quota,
        get length() { return values.size; },
        key(index) { return [...values.keys()][index] ?? null; },
        getItem(key) { return values.get(String(key)) ?? null; },
        setItem(key, value) {
            key = String(key); value = String(value);
            const updated = new Map(values).set(key, value);
            const size = [...updated].reduce((sum, [k, v]) => sum + k.length + v.length, 0);
            if (size > this.quota) {
                const error = new Error('Test localStorage quota');
                error.name = 'QuotaExceededError'; error.code = 22;
                throw error;
            }
            values.set(key, value);
        },
        removeItem(key) { values.delete(String(key)); },
        clear() { values.clear(); },
    };
}

/** Execute real repository modules. Only the two absent host modules are stubs. */
export function createRuntime(root, { store = createStore(), fetch } = {}) {
    root = path.resolve(root);
    let seed = 173;
    const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 0x100000000);
    const math = Object.create(Math);
    math.random = random;
    class Clock extends Date {
        constructor(...args) { super(...(args.length ? args : [FIXED_NOW])); }
        static now() { return FIXED_NOW; }
    }
    const context = vm.createContext({
        console, URL, Map, Set, TextEncoder, TextDecoder, Uint8Array, Uint32Array,
        AbortController, Response, Headers, ReadableStream, TransformStream,
        structuredClone, Date: Clock, Math: math, localStorage: store,
        location: { href: 'https://test.invalid/', pathname: '/' },
        SillyTavern: { getContext: () => ({ chatId: 'quota-parity', chat: [] }) },
        fetch: fetch || (() => { throw new Error('Network is forbidden in this test'); }),
    });
    const cache = new Map();
    function getModule(file) {
        if (cache.has(file)) return cache.get(file);
        let module;
        if (file !== root && !file.startsWith(root + path.sep)) {
            const name = path.basename(file);
            if (name === 'extensions.js') {
                module = new vm.SyntheticModule(['extension_settings'], function () {
                    this.setExport('extension_settings', {});
                }, { context, identifier: file });
            } else if (name === 'script.js') {
                module = new vm.SyntheticModule(['saveSettingsDebounced', 'eventSource', 'event_types'], function () {
                    this.setExport('saveSettingsDebounced', () => {});
                    const listeners = new Map();
                    this.setExport('eventSource', {
                        on(name, fn) { if (!listeners.has(name)) listeners.set(name, []); listeners.get(name).push(fn); },
                        removeListener(name, fn) { listeners.set(name, (listeners.get(name) || []).filter(item => item !== fn)); },
                        async emit(name, data) { for (const fn of listeners.get(name) || []) await fn(data); },
                    });
                    this.setExport('event_types', { CHAT_COMPLETION_PROMPT_READY: 'chat_completion_prompt_ready', GENERATE_AFTER_COMBINE_PROMPTS: 'generate_after_combine_prompts', CHAT_CHANGED: 'chat_id_changed' });
                }, { context, identifier: file });
            } else throw new Error(`Unexpected host dependency: ${file}`);
        } else {
            module = new vm.SourceTextModule(readFileSync(file, 'utf8'), { context, identifier: file,
                initializeImportMeta(meta) { meta.url = pathToFileURL(file).href; } });
        }
        cache.set(file, module);
        return module;
    }
    async function load(relative) {
        const module = getModule(path.resolve(root, relative));
        if (module.status === 'unlinked') await module.link((specifier, importer) => {
            if (!specifier.startsWith('.')) throw new Error(`Unexpected package: ${specifier}`);
            return getModule(path.resolve(path.dirname(importer.identifier), specifier.split('?')[0]));
        });
        if (module.status === 'linked') await module.evaluate();
        return module.namespace;
    }
    return { load, store, context };
}
