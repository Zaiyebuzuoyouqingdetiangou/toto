// Optional local storage warm-up only. Keep this module independent of the DOM
// avatar renderer and do not make unavailable avatars a generation prerequisite.
export function prepareRabbitMirrorAvatarPrompt() {
    try {
        const api = globalThis.HearttraceAvatars;
        if (api?.apiVersion !== 1 || typeof api.getCurrent !== 'function'
            || typeof api.refresh !== 'function' || api.getCurrent()) return null;
        const pending = api.refresh();
        if (!pending || typeof pending.then !== 'function') return null;
        return new Promise(resolve => {
            let done = false;
            const finish = () => { if (done) return; done = true; clearTimeout(timer); resolve(); };
            const timer = setTimeout(finish, 500);
            Promise.resolve(pending).then(finish, finish);
        });
    } catch { return null; }
}

// The existing producers own cancellation. Include Persona changes in their
// identity guard during this extra await without depending on bridge internals.
export function rabbitMirrorAvatarPromptIdentity(context) {
    const text = value => typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
    const character = context?.characters?.[context?.characterId] || context?.character;
    let chat = context?.chatId, selectedPersona = '';
    try { chat = context?.getCurrentChatId?.() ?? chat; } catch { /* Host fallback. */ }
    try { selectedPersona = globalThis.document?.querySelector?.('#user_avatar_block .avatar-container.selected')?.getAttribute?.('data-avatar-id') || ''; }
    catch { /* Some hosts expose only the Persona in their context. */ }
    return JSON.stringify([context?.characterId, character?.avatar || character?.data?.avatar,
        context?.name2 || character?.name || character?.data?.name, chat, context?.groupId, context?.name1,
        context?.personaId, context?.persona_id, context?.currentPersonaId, context?.user_avatar,
        context?.userAvatar, context?.personaAvatar, context?.powerUserSettings?.persona_id,
        selectedPersona, context?.chatMetadata?.persona].map(text));
}
