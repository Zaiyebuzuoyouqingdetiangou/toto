import { rmT as __rmT } from "../textTable.js?rmv=2.1.1";
import { EXTERNAL_WORLD_BOOK_ERROR_CODES, ExternalWorldBookError } from './errors.js?rmv=2.1.1';
export function getWorldInfoNamesFromContext(context = globalThis.SillyTavern?.getContext?.()) {
    try {
        if (typeof context?.getWorldInfoNames !== 'function')
            return null;
        const value = context.getWorldInfoNames();
        return Array.isArray(value) ? value.map(name => String(name || '').trim()).filter(Boolean) : null;
    }
    catch {
        return null;
    }
}
export async function getHostRequestHeaders() {
    try {
        const module = await import('../../../../../../script.js');
        if (typeof module?.getRequestHeaders !== 'function')
            return null;
        return module.getRequestHeaders();
    }
    catch {
        return null;
    }
}
export async function detectWorldBookCapabilities(options = {}) {
    const contextProvider = options.contextProvider || (() => globalThis.SillyTavern?.getContext?.());
    const headerProvider = options.headerProvider || getHostRequestHeaders;
    const contextNames = getWorldInfoNamesFromContext(contextProvider());
    const headers = await headerProvider();
    return {
        canListWorldBooks: Array.isArray(contextNames) || !!headers,
        canReadWorldBook: !!headers,
        canReadDisabledWorldBooks: !!headers,
        source: Array.isArray(contextNames) ? 'context-api' : headers ? 'endpoint' : null,
        contextNames: Array.isArray(contextNames) ? contextNames : [],
        headersAvailable: !!headers,
        reason: headers || Array.isArray(contextNames) ? '' : EXTERNAL_WORLD_BOOK_ERROR_CODES.CAPABILITY_UNAVAILABLE,
    };
}
export function requireHostHeaders(headers) {
    if (!headers || typeof headers !== 'object') {
        throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.CAPABILITY_UNAVAILABLE, __rmT("cBtfjftcvqZMRAeYstmwfq.Th6N8akObDQDie139lCGFKdg9qL2hr449veTrK_Yui7g.P9dAlx84UhJhk5jYJiuyEOtBUml8d0oQKIDfrECL56gZ8MdsG51Y8ik"));
    }
    return headers;
}
