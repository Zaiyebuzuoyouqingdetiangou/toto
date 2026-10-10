import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const injectorSource = readFileSync(new URL('../src/injector.js', import.meta.url), 'utf8');
const mountSource = readFileSync(new URL('../src/independentApi/mount.js', import.meta.url), 'utf8');
const intentsKey = '__rabbitMirrorIndependentGenerationIntents';
const ownerKey = Symbol.for('rabbitMirror.independentIntentOwner');
const eventNames = ['GENERATION_STARTED', 'GENERATION_ENDED', 'GENERATION_STOPPED', 'MESSAGE_SENT',
    'MESSAGE_SWIPED', 'STREAM_TOKEN_RECEIVED', 'MESSAGE_RECEIVED', 'CHARACTER_MESSAGE_RENDERED', 'CHAT_CHANGED'];
const eventTypes = Object.fromEntries(eventNames.map(name => [name, name]));
const noop = () => {};

function sourceFunction(source, name) {
    const match = source.match(new RegExp(`^(?:export )?function ${name}\\([^]*?^}`, 'm'));
    assert.ok(match, `Missing production function ${name}`);
    return match[0].replace(/^export /, '');
}

// Load the complete production bridge and interceptor. Host services and prompt
// dependencies are inert; no paid request, real timer or core startup can run.
async function harness({ chat, settings: overrides = {} } = {}) {
    const assistant = { is_user: false, mes: 'previous story', swipe_id: 2,
        swipes: ['first story', 'second story', 'previous story'], extra: {} };
    const host = { chatId: 'chat:swipe-test', chat: chat || [{ is_user: true, mes: 'continue' }, assistant],
        canPerformToolCalls: () => false, mainApi: 'openai', is_send_press: false };
    const settings = { enabled: true, autoRabbitMirrorInjection: true, mode: 'auto',
        generationSource: 'independent', independentGenerationTiming: 'auto',
        independentEarlyBodyEnabled: false, rabbitMirrorFaceCount: 2, ...overrides };
    const listeners = new Map(), timers = new Map(), authorizations = [];
    let timerSequence = 0;
    const eventSource = {
        on(event, handler) { if (!listeners.has(event)) listeners.set(event, new Set()); listeners.get(event).add(handler); },
        off(event, handler) { listeners.get(event)?.delete(handler); },
    };
    const context = vm.createContext({ console, Date, Symbol,
        SillyTavern: { getContext: () => host },
        setTimeout: callback => { timers.set(++timerSequence, callback); return timerSequence; },
        clearTimeout: id => timers.delete(id),
        fetch() { throw new Error('Network is forbidden'); },
    });
    const dependencies = {
        'script.js': { eventSource, event_types: eventTypes, setExtensionPrompt: noop,
            extension_prompt_types: { IN_CHAT: 0 }, extension_prompt_roles: { SYSTEM: 0 } },
        'settings.js': { MODULE_NAME: 'RabbitMirror', getSettings: () => settings },
        'faceDrawRules.js': { faceDrawNeedsExternal: () => false },
        'feedbackCat.js': { buildFeedbackCatFinalCheck: noop, buildFeedbackCatPrompt: noop,
            clearFeedbackCatExtensionPrompt: noop, getActiveFeedbackForCurrentChat: noop, markFeedbackCatInjected: noop },
        'tokenMeter.js': { recordRabbitMirrorInjection: noop, recordRabbitMirrorNoInjection: noop },
        'storage.js': { getCurrentChatKey: () => host.chatId, markPendingBatchAttempt: noop, releasePendingComboBatch: noop },
        'errors.js': { describeExternalWorldBookPreflightFailure: noop },
        'independentTiming.js': { independentGenerationTiming: value => value.independentGenerationTiming },
        'chatAvatarPromptReady.js': { prepareRabbitMirrorAvatarPrompt: noop, rabbitMirrorAvatarPromptIdentity: noop },
    };
    const modules = new Map();
    const module = new vm.SourceTextModule(injectorSource, { context, identifier: 'injector.js' });
    await module.link(specifier => {
        const name = specifier.split('?')[0].split('/').at(-1);
        assert.ok(dependencies[name], `Unexpected dependency ${specifier}`);
        if (!modules.has(name)) {
            const exports = dependencies[name];
            modules.set(name, new vm.SyntheticModule(Object.keys(exports), function () {
                for (const [key, value] of Object.entries(exports)) this.setExport(key, value);
            }, { context, identifier: name }));
        }
        return modules.get(name);
    });
    await module.evaluate();
    module.namespace.initIndependentGenerationIntentBridge();
    // Exercise the unchanged core consumer against the actual bridge output.
    Object.assign(context, {
        INDEPENDENT_GENERATION_INTENTS_KEY: intentsKey, INDEPENDENT_INTENT_OWNER: ownerKey,
        getContext: () => host, chatKey: ctx => ctx.chatId,
        deferredIndependentGenerationIntents: () => context[intentsKey] || [],
        swipeId: message => Number(message?.swipe_id ?? message?.swipeId ?? 0) || 0,
        isRabbitMirrorEligibleAssistantMessage: message => !!message && message.is_user !== true && !message.is_system && typeof message.mes === 'string',
        isRabbitMirrorToolResultMessage: message => message?.is_system === true,
        unlockAutomaticGenerationCutover: (ctx, index, reason, intent) => {
            authorizations.push({ chat: ctx.chat, index, reason, intent }); return true;
        },
    });
    vm.runInContext([
        sourceFunction(injectorSource, 'hashIndependentIntentText'),
        'function messageBodyFingerprint(message) { return hashIndependentIntentText(message?.mes || ""); }',
        ...['boundIndependentIntentOwner', 'deferredIndependentIntentCandidateIndex',
            'deferredIndependentIntentHasFinalProof', 'claimDeferredIndependentGenerationIntent'].map(name => sourceFunction(mountSource, name)),
    ].join('\n'), context);
    const emit = (event, ...args) => { for (const handler of listeners.get(event) || []) handler(...args); };
    const complete = index => { host.is_send_press = false; emit('MESSAGE_RECEIVED', index); emit('CHARACTER_MESSAGE_RENDERED', index); emit('GENERATION_ENDED'); };
    const claim = index => context.claimDeferredIndependentGenerationIntent(host, index, 'test-cold-recovery', { requireFinalProof: true });
    const promptChat = () => host.chat.filter(message => !message.is_system).slice(0, -1).map(message => ({ ...message }));
    return { host, settings, emit, complete, claim, promptChat, authorizations,
        intents: () => context[intentsKey] || [],
        intercept: (chat = promptChat(), type = 'swipe') => module.namespace.rabbitMirrorGenerateInterceptor(chat, 32768, noop, type),
        destroy: () => module.namespace.destroyIndependentGenerationIntentBridge(),
    };
}

test('cold right-arrow swipe binds the raw assistant omitted from the interceptor prompt, then authorizes once', async () => {
    const h = await harness(), message = h.host.chat[1];
    const savedSwipes = structuredClone(message.swipes), settingsBefore = structuredClone(h.settings);
    message.swipe_id = 3;
    h.emit('MESSAGE_SWIPED', 1);
    h.emit('GENERATION_STARTED', 'swipe', {}, false);
    await h.intercept(); // ST passes coreChat after coreChat.pop(), ending in user.
    assert.equal(h.intents().length, 1);
    assert.equal(h.intents()[0].tailIndex, 1);
    assert.equal(h.intents()[0].tailRole, 'assistant');
    assert.equal(h.intents()[0][ownerKey].tail, message);
    assert.equal(h.claim(1), false, 'START plus interceptor is not final proof');
    message.mes = 'new fourth story';
    h.complete(1);
    assert.equal(h.claim(1), true);
    assert.equal(h.claim(1), false, 'the exact completed intent is consumed once');
    assert.equal(h.authorizations.length, 1);
    assert.deepEqual(message.swipes, savedSwipes, 'historical variants are untouched');
    assert.deepEqual(h.settings, settingsBefore, 'per-face settings are untouched');
});

test('raw swipe owner is independent of filtered system rows and prompt text transforms', async () => {
    const h = await harness();
    h.host.chat.splice(1, 0, { is_system: true, is_user: false, mes: 'system row' });
    const message = h.host.chat[2]; message.swipe_id = 3;
    h.emit('GENERATION_STARTED', 'swipe', {}, false);
    await h.intercept([{ ...h.host.chat[0], mes: 'prompt-only replacement' }]);
    message.mes = 'new fourth story'; h.complete(2);
    assert.equal(h.claim(2), true);
    assert.equal(h.authorizations[0].intent.tailIndex, 2);
});

test('swiping a sole assistant greeting can recover even when coreChat is empty', async () => {
    const h = await harness({ chat: [{ is_user: false, mes: 'greeting', swipe_id: 1, swipes: ['greeting'] }] });
    h.emit('GENERATION_STARTED', 'swipe', {}, false);
    await h.intercept([]);
    h.host.chat[0].mes = 'new greeting'; h.complete(0);
    assert.equal(h.claim(0), true);
});

test('historical swipe rendering without a new host generation never produces a new intent', async () => {
    const h = await harness(), message = h.host.chat[1];
    message.swipe_id = 0; message.mes = message.swipes[0];
    h.emit('MESSAGE_SWIPED', 1); h.complete(1);
    assert.equal(h.intents().length, 0);
    assert.equal(h.claim(1), false);
    assert.equal(h.authorizations.length, 0);
});

test('a real swipe intent cannot bind a historical swipe selected before the final render', async () => {
    const h = await harness(), message = h.host.chat[1]; message.swipe_id = 3;
    h.emit('GENERATION_STARTED', 'swipe', {}, false); await h.intercept();
    message.swipe_id = 0; message.mes = message.swipes[0];
    h.emit('MESSAGE_SWIPED', 1); h.complete(1);
    assert.equal(h.claim(1), false);
    assert.equal(h.authorizations.length, 0);
});

for (const invalidation of ['chat-array', 'chat-id', 'message-object', 'swipe', 'stop', 'end', 'destroy', 'chat-event']) {
    test(`a ${invalidation} change before the interceptor invalidates the captured swipe owner`, async () => {
        const h = await harness(); h.host.chat[1].swipe_id = 3;
        h.emit('GENERATION_STARTED', 'swipe', {}, false);
        if (invalidation === 'chat-array') h.host.chat = [...h.host.chat];
        if (invalidation === 'chat-id') h.host.chatId = 'other-chat';
        if (invalidation === 'message-object') h.host.chat[1] = { ...h.host.chat[1] };
        if (invalidation === 'swipe') h.host.chat[1].swipe_id = 0;
        if (invalidation === 'stop') h.emit('GENERATION_STOPPED');
        if (invalidation === 'end') h.emit('GENERATION_ENDED');
        if (invalidation === 'destroy') h.destroy();
        if (invalidation === 'chat-event') h.emit('CHAT_CHANGED');
        await h.intercept(); h.host.chat[1].mes = 'different story'; h.complete(1);
        assert.equal(h.claim(1), false);
        assert.equal(h.authorizations.length, 0);
    });
}

test('a dry-run swipe does not authorize a prompt-tail fallback', async () => {
    const h = await harness(); h.host.chat[1].swipe_id = 3;
    h.emit('GENERATION_STARTED', 'swipe', {}, true); await h.intercept();
    h.host.chat[1].mes = 'different story'; h.complete(1);
    assert.equal(h.claim(1), false);
});

test('wrong message render cannot consume the real swipe owner', async () => {
    const h = await harness();
    h.host.chat.unshift({ is_user: false, mes: 'earlier assistant' });
    h.host.chat[2].swipe_id = 3;
    h.emit('GENERATION_STARTED', 'swipe', {}, false); await h.intercept();
    h.host.chat[2].mes = 'new fourth story';
    h.emit('CHARACTER_MESSAGE_RENDERED', 0);
    assert.equal(h.claim(0), false); assert.equal(h.claim(2), false);
    h.complete(2); assert.equal(h.claim(2), true);
});

test('existing normal generation bridge still recovers the next assistant', async () => {
    const h = await harness({ chat: [{ is_user: true, mes: 'continue' }] });
    h.emit('GENERATION_STARTED', 'normal', {}, false);
    await h.intercept(h.host.chat.map(message => ({ ...message })), 'normal');
    h.host.chat.push({ is_user: false, mes: 'new normal story', swipe_id: 0 });
    h.complete(1); assert.equal(h.claim(1), true);
});
