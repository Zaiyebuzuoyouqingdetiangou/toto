function text(value) { return typeof value === 'string' ? value : ''; }

function currentCharacter(ctx) {
    return ctx?.characters?.[ctx.characterId] || ctx?.character || null;
}

function abortError() {
    const error = new Error('角色世界书读取已取消。');
    error.name = 'AbortError';
    return error;
}

function staleError() {
    const error = new Error('读取期间当前角色或其绑定世界书已变化，请在当前角色重新生成。');
    error.code = 'CHARACTER_WORLD_BOOK_STALE';
    return error;
}

function sourceRow(value) {
    return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/【/g, '\\u3010');
}

// These are explicit current-character bindings, not the global worldbook
// directory, the chat/persona book, or RabbitMirror's random selection library.
// SillyTavern world-info.js uses data.extensions.world and data.character_book.
export async function readCharacterWorldBookContext(ctx, {
    signal, assertCurrent = () => {}, maxChars = 8000, disabledBooks = [],
} = {}) {
    if (!Number.isSafeInteger(maxChars) || maxChars < 0) throw new RangeError('角色世界书字符预算必须为非负整数。');
    const character = currentCharacter(ctx);
    const characterId = ctx?.characterId;
    const linkedName = text(character?.data?.extensions?.world).trim();
    const embedded = character?.data?.character_book ?? character?.character_book;
    const check = () => {
        if (signal?.aborted) throw abortError();
        assertCurrent();
        if (ctx?.characterId !== characterId || currentCharacter(ctx) !== character
            || text(character?.data?.extensions?.world).trim() !== linkedName
            || (character?.data?.character_book ?? character?.character_book) !== embedded) throw staleError();
        if (signal?.aborted) throw abortError();
    };
    check();
    const empty = () => ({ text: '', bookNames: [], entryCount: 0, truncated: false });
    if (!character || (!linkedName && !embedded)) return empty();
    const name = linkedName || text(embedded?.name).trim() || `${text(character.name).trim() || '当前角色'}的内嵌世界书`;
    const disabled = new Set((Array.isArray(disabledBooks) ? disabledBooks : [])
        .map(value => text(value).trim()).filter(Boolean));
    // A linked book is the live source; never fall back to its embedded stale
    // copy after a disable or read failure.
    if (disabled.has(name)) return empty();
    let book = embedded;
    if (linkedName) {
        let getHeaders = ctx?.getRequestHeaders;
        if (typeof getHeaders !== 'function') {
            const host = await import('../../../../../script.js');
            check();
            getHeaders = host.getRequestHeaders;
        }
        if (typeof getHeaders !== 'function') throw new Error('宿主未提供角色世界书读取请求头。');
        const suppliedHeaders = await getHeaders.call(ctx);
        check();
        if (!suppliedHeaders || typeof suppliedHeaders !== 'object') throw new Error('宿主角色世界书读取请求头无效。');
        const headers = new Headers(suppliedHeaders);
        headers.set('Content-Type', 'application/json');
        const response = await fetch('/api/worldinfo/get', {
            method: 'POST', credentials: 'same-origin', headers, signal,
            body: JSON.stringify({ name: linkedName }),
        });
        check();
        if (!response.ok) throw new Error(`角色世界书“${name}”读取失败：HTTP ${response.status}。`);
        book = await response.json();
        check();
    }
    const entries = book?.entries;
    if (!entries || typeof entries !== 'object') throw new TypeError(`角色世界书“${name}”缺少有效 entries。`);
    const rows = [];
    for (const entry of Object.values(entries)) {
        check();
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new TypeError(`角色世界书“${name}”包含无效条目。`);
        // Card-book entries use enabled; native world-info entries use disable.
        if (entry.enabled === false || entry.disable === true) continue;
        if (typeof entry.content !== 'string') throw new TypeError(`角色世界书“${name}”条目内容不是文本。`);
        if (!entry.content.trim()) continue;
        rows.push(sourceRow({ book: name, title: text(entry.comment) || text(entry.name) || text(entry.title), content: entry.content }));
    }
    check();
    const fullText = rows.join('\n');
    if (fullText.length <= maxChars) return { text: fullText, bookNames: [name], entryCount: rows.length, truncated: false };
    const note = maxChars >= 15 ? '\n【角色世界书已按预算截断】' : '【已截断】';
    const marker = note.slice(0, maxChars);
    const contentBudget = Math.max(0, maxChars - marker.length);
    let prefix = fullText.slice(0, contentBudget);
    // Never leave half a UTF-16 surrogate in the material sent to the model.
    if (/[\uD800-\uDBFF]$/.test(prefix)) prefix = prefix.slice(0, -1);
    let used = 0;
    let entryCount = 0;
    for (const row of rows) {
        if (used >= prefix.length) break;
        entryCount += 1;
        used += row.length + 1;
    }
    return { text: prefix + marker, bookNames: [name], entryCount, truncated: true };
}
