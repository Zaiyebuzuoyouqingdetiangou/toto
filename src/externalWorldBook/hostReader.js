import { rmT as __rmT } from "../textTable.js?rmv=1.99.19";
import { detectWorldBookCapabilities, getHostRequestHeaders, requireHostHeaders } from './capabilities.js?rmv=1.99.19';
import { EXTERNAL_WORLD_BOOK_ERROR_CODES, ExternalWorldBookError } from './errors.js?rmv=1.99.19';
import { normalizeHostWorldBook } from './normalize.js?rmv=1.99.19';
const DEFAULT_TIMEOUT_MS = 10000;
async function postJson(path, body, options = {}) {
    const fetchFn = options.fetchFn || globalThis.fetch;
    const headerProvider = options.headerProvider || getHostRequestHeaders;
    if (typeof fetchFn !== 'function') {
        throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.CAPABILITY_UNAVAILABLE, __rmT("..ZltjiFBoloy5V0VmS.1AuqKKXVP261mlNC0tKq"));
    }
    const headers = requireHostHeaders(await headerProvider());
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), Math.max(1000, Number(options.timeoutMs) || DEFAULT_TIMEOUT_MS));
    try {
        const response = await fetchFn(path, {
            method: 'POST',
            credentials: 'same-origin',
            headers,
            body: JSON.stringify(body || {}),
            signal: controller.signal,
        });
        let payload = null;
        try {
            payload = await response.json();
        }
        catch { }
        if (!response.ok) {
            throw new ExternalWorldBookError(path.endsWith('/list') ? EXTERNAL_WORLD_BOOK_ERROR_CODES.LIST_FAILED : EXTERNAL_WORLD_BOOK_ERROR_CODES.READ_FAILED, `${__rmT("x4CNXaaImMoQf.WUH_8LsxGPUDqpQ0jYu5F_A_5rspvefYsDJams4yYEhwwDBWbowrE")}${response.status || '?'}`, { status: response.status || 0 });
        }
        return payload;
    }
    catch (error) {
        if (controller.signal.aborted) {
            throw new ExternalWorldBookError(path.endsWith('/list') ? EXTERNAL_WORLD_BOOK_ERROR_CODES.LIST_FAILED : EXTERNAL_WORLD_BOOK_ERROR_CODES.READ_FAILED, __rmT("WKT8MoCy8qPENVnEfyIPf.B6VG9tN0LjjOTbc1RBZ8lYpDBJJ4pr7f"));
        }
        throw error;
    }
    finally {
        clearTimeout(timeoutId);
    }
}
export async function listHostWorldBooks(options = {}) {
    const capabilities = await detectWorldBookCapabilities(options);
    if (!capabilities.canReadWorldBook) {
        throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.CAPABILITY_UNAVAILABLE, __rmT("AwekZAYv5p4XYqW7JSSNIWaTZTOL3WJejK8DSYZXIh0C58nHDtmpSSE90GQxo74HkRxpXnDWS3S7EL6z_QdeyU4q.T82EOywfpouZ5nhvo7_9u_U.DG0if"));
    }
    const books = new Map();
    if (capabilities.headersAvailable) {
        try {
            const payload = await postJson('/api/worldinfo/list', {}, options);
            if (!Array.isArray(payload)) {
                throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.LIST_FAILED, __rmT("MIJHNwnOjD6PRAdR47fXGNE4EV5xR6nCkl9RYyV1.wi3xdQ0b4d2IZyXNbf9uT"));
            }
            for (const item of payload) {
                const fileId = String(item?.file_id ?? item?.name ?? '').trim();
                if (!fileId)
                    continue;
                const displayName = String(item?.name ?? fileId).trim() || fileId;
                books.set(fileId, { fileId, displayName, extensions: item?.extensions && typeof item.extensions === 'object' ? item.extensions : {} });
            }
        }
        catch (error) {
            if (!capabilities.contextNames.length)
                throw error;
        }
    }
    if (!books.size && capabilities.contextNames.length) {
        for (const name of capabilities.contextNames)
            books.set(name, { fileId: name, displayName: name, extensions: {} });
    }
    if (!books.size && !capabilities.canListWorldBooks) {
        throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.CAPABILITY_UNAVAILABLE, __rmT("AwekZAYv5p4XYqW7JSSNIWaTZTOL3WJejK8DSYZXIh0C58nHDtmpSSE90GQxo74HkRxpXnDWS3S7EL6z_QdeyU4q.T82EOywfpouZ5nhvo7_9u_U.DG0if"));
    }
    return [...books.values()].sort((a, b) => a.displayName.localeCompare(b.displayName, 'zh-Hans-CN'));
}
export async function readHostWorldBook(book, options = {}) {
    const fileId = String(book?.fileId ?? book ?? '').trim();
    if (!fileId) {
        throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.NOT_FOUND, __rmT("T8yI.LYvCgZ2twvE8g6pUT"));
    }
    const payload = await postJson('/api/worldinfo/get', { name: fileId }, options);
    if (!payload || typeof payload !== 'object' || !Object.prototype.hasOwnProperty.call(payload, 'entries')) {
        throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.SCHEMA_UNSUPPORTED, __rmT("OntacBufYBnLJvU2wa5wYO4uuIJ2ScX9mojzsblTCd98eUdzwJJkraZfvdpW.p9xt1lhLAHWTB8obh"));
    }
    return normalizeHostWorldBook(payload, {
        sourceId: fileId,
        sourceName: String(book?.displayName || payload?.name || fileId),
        sourceTransport: 'endpoint',
    });
}
