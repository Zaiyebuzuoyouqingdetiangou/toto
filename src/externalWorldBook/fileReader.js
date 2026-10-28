import { rmT as __rmT } from "../textTable.js?rmv=1.99.9";
import { EXTERNAL_WORLD_BOOK_ERROR_CODES, ExternalWorldBookError } from './errors.js?rmv=1.99.9';
import { EXTERNAL_WORLD_BOOK_MAX_FILE_BYTES } from './schema.js?rmv=1.99.9';
import { normalizeFileWorldBook } from './normalize.js?rmv=1.99.9';
async function readFileText(file, maxBytes) {
    if (typeof file?.arrayBuffer === 'function' && typeof TextDecoder !== 'undefined') {
        let bytes;
        try {
            bytes = new Uint8Array(await file.arrayBuffer());
        }
        catch {
            throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.READ_FAILED, __rmT("EgQw0y21D563S2IsQi3QtxEI"));
        }
        if (bytes.byteLength > maxBytes) {
            throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.FILE_TOO_LARGE, `${__rmT("ZTHSZAZTIzo7kMdAgPD")}${Math.round(maxBytes / 1024 / 1024)}${__rmT("wHgPaNBBD_SASJl6hkZ6S8TGbNs")}`);
        }
        const utf32 = bytes.length >= 4 && ((bytes[0] === 0xff && bytes[1] === 0xfe && bytes[2] === 0 && bytes[3] === 0)
            || (bytes[0] === 0 && bytes[1] === 0 && bytes[2] === 0xfe && bytes[3] === 0xff));
        const encoding = bytes[0] === 0xff && bytes[1] === 0xfe ? 'utf-16le'
            : bytes[0] === 0xfe && bytes[1] === 0xff ? 'utf-16be' : 'utf-8';
        try {
            if (utf32)
                throw new Error('unsupported encoding');
            return new TextDecoder(encoding, { fatal: encoding !== 'utf-8' }).decode(bytes);
        }
        catch {
            throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.READ_FAILED, __rmT("Kzk8beQovVCw6HHpbED91a_RPngX5ekvZdjN.CB6lrm9UxDhhOnaxjbeE.N.oTOBFl0b33P2orUBfIOxZDZtPZeQr6n5LFJWyCMNuiZDdwUQBq9OiLP5FDUt"));
        }
    }
    if (typeof file?.text === 'function')
        return file.text();
    if (typeof FileReader === 'undefined') {
        throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.READ_FAILED, __rmT("ntvm1_7cZSju_1F7phKf.kdKKrxZfZzKf7ospf"));
    }
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.READ_FAILED, __rmT("EgQw0y21D563S2IsQi3QtxEI")));
        reader.onload = () => resolve(String(reader.result ?? ''));
        reader.readAsText(file);
    });
}
function fileIdentity(file) {
    const name = String(file?.name || 'worldbook.json');
    const size = Number(file?.size || 0);
    const lastModified = Number(file?.lastModified || 0);
    return `${name}:${size}:${lastModified}`;
}
export function readPlainTextWorldBook(text, options = {}) {
    if (typeof text !== 'string' || !text.trim())
        throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.ENTRY_CONTENT_INVALID, __rmT("ESFe4WYcV5zeK8U_YZafhfFdi1uL.M4A29E"));
    if (text.length > 1000000 || new TextEncoder().encode(text).byteLength > EXTERNAL_WORLD_BOOK_MAX_FILE_BYTES) {
        throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.FILE_TOO_LARGE, __rmT("xC4LnTJbdGvHCbhbD37iiZ0q_.wWop08hoXXoW1bfV6BT8kwprBGF.A.cc8w86GJMiosQzrhI8az5R5hfK0MmSUOu90kkil4VyCLRf"));
    }
    const name = String(options.name || __rmT("3hmLNEvQUnEiaoUoLoC")).trim().slice(0, 1000) || __rmT("3hmLNEvQUnEiaoUoLoC");
    let fingerprint = 2166136261, second = 5381;
    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        fingerprint = Math.imul(fingerprint ^ code, 16777619);
        second = Math.imul(second, 33) ^ code;
    }
    return normalizeFileWorldBook({ name, entries: [{ uid: 0, comment: name, content: text }] }, {
        sourceId: options.sourceId || `plain-text:${(fingerprint >>> 0).toString(36)}-${(second >>> 0).toString(36)}:${name}`,
        sourceName: name,
    });
}
async function readLocalFile(file, allowLibraryBackup = false) {
    if (!file || typeof file !== 'object') {
        throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.READ_FAILED, __rmT("tmMwwENDS99zxdBe0OEaGzPTbNs"));
    }
    const name = String(file.name || '').trim();
    if (name && !/\.(?:json|txt|md)$/i.test(name)) {
        throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.FILE_TYPE_UNSUPPORTED, __rmT("VBioFHy9xFafeCJ.U4R01lLTtOx2dR_ng.kvO_uwlg_VErqSkReMBozoYCdRz4nHnrLMdKX4jEPuDsH9"));
    }
    const plain = /\.(?:txt|md)$/i.test(name);
    const maxBytes = allowLibraryBackup && !plain ? 32 * 1024 * 1024 : EXTERNAL_WORLD_BOOK_MAX_FILE_BYTES;
    const size = Number(file.size || 0);
    if (size > maxBytes) {
        throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.FILE_TOO_LARGE, `${__rmT("ZTHSZAZTIzo7kMdAgPD")}${Math.round(maxBytes / 1024 / 1024)}${__rmT("wHgPaNBBD_SASJl6hkZ6S8TGbNs")}`, { size });
    }
    const text = await readFileText(file, maxBytes);
    const actualBytes = typeof text === 'string' && text.length <= maxBytes ? new TextEncoder().encode(text).byteLength : Infinity;
    if (actualBytes > maxBytes) {
        throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.FILE_TOO_LARGE, `${__rmT("ZTHSZAZTIzo7kMdAgPD")}${Math.round(maxBytes / 1024 / 1024)}${__rmT("wHgPaNBBD_SASJl6hkZ6S8TGbNs")}`);
    }
    if (plain)
        return { kind: 'worldbook', book: readPlainTextWorldBook(text, { name: name.replace(/\.(?:txt|md)$/i, ''), sourceId: fileIdentity(file) }) };
    let raw;
    try {
        raw = JSON.parse(text.replace(/^\uFEFF/, ''));
    }
    catch (cause) {
        throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.JSON_INVALID, __rmT("zoaXyicLG956QEAASrtUtmmiyrMqoC77Q5Mspf"), undefined, { cause });
    }
    if (allowLibraryBackup && raw?.format === 'RabbitMirror.ExternalLibraries') {
        const { validateExternalLibraryBackup } = await import('./backup.js?rmv=1.99.9');
        return { kind: 'backup', backup: validateExternalLibraryBackup(raw) };
    }
    if (size > EXTERNAL_WORLD_BOOK_MAX_FILE_BYTES || actualBytes > EXTERNAL_WORLD_BOOK_MAX_FILE_BYTES) {
        throw new ExternalWorldBookError(EXTERNAL_WORLD_BOOK_ERROR_CODES.FILE_TOO_LARGE, __rmT("V6qYJKIf8nRIlA0e5Pmggn6uWnw8IYBuD6qzk1WJRzm2E3EQkfQC2n.D8mfr3DqD7kNmR2Wsm5DXbuUzpjLQ51WEVS57S0M7BnmDvBUhoZZ8ai_z"));
    }
    return { kind: 'worldbook', book: normalizeFileWorldBook(raw, {
            fileName: name || 'worldbook.json',
            fileFingerprint: fileIdentity(file),
        }) };
}
export async function readLocalWorldBookFile(file) {
    return (await readLocalFile(file)).book;
}
export async function readLocalExternalImportFile(file) {
    return readLocalFile(file, true);
}
