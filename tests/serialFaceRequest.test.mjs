import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRuntime } from './helpers/featureRuntime.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const request = readFileSync(new URL('../src/independentApi/request.js', import.meta.url), 'utf8');
const mount = readFileSync(new URL('../src/independentApi/mount.js', import.meta.url), 'utf8');
const copy = value => JSON.parse(JSON.stringify(value));
const between = (source, start, end) => {
    const from = source.indexOf(start), to = source.indexOf(end, from);
    assert.ok(from >= 0 && to > from, start);
    return source.slice(from, to).replace(/^export /gm, '');
};

// Run the actual request/serial orchestration, owner checks, prompt planner and
// selection registry. The absent host and provider/DOM postprocessing are boundaries.
async function fixture({ count = 3, retry = 0, beforeTransport, afterTransport, scanFace, maxRequestChars = 1000000 } = {}) {
    const rt = createRuntime(root);
    const config = await rt.load('src/settings.js');
    const modules = {};
    for (const file of ['promptBuilder', 'presentationMode', 'faceDrawRules', 'automaticReroll', 'independentTiming', 'atmosphereChoice', 'multifaceProtocol', 'storage', 'serialPaletteContext'])
        Object.assign(modules, await rt.load(`src/${file}.js`));
    const ctx = { chatId: 'quota-parity', chat: [{ is_user: false, mes: 'The completed story remains unchanged.', swipe_id: 0 }] };
    rt.context.SillyTavern.getContext = () => ctx;
    config.updateSettings({ enabled: true, autoRabbitMirrorInjection: true, mode: 'integrated', generationSource: 'independent',
        independentGenerationTiming: 'auto', rabbitMirrorFaceCount: count, multifaceDispatch: 'serial',
        rabbitMirrorPresentationModes: Array(count).fill('html'), rabbitMirrorAutoTextRatio: 0,
        userDirectivePriority: false, memoryScanEnabled: false, externalWorldBookRandomEnabled: false,
        independentReadCharacterWorldBook: false, independentApiBaseUrl: 'https://fixture.invalid', independentApiModel: 'fixture',
        automaticRerollEnabled: retry > 0, independentAutomaticRerollMax: retry,
        rabbitMirrorFaceDrawRules: Array.from({ length: count }, (_, i) => ({ enabled: true,
            theme: { requiredIds: [`C.${i + 1}`] }, format: { requiredIds: ['1.1.1'] } })) });
    const settings = config.getSettings();
    const posts = [], recipes = [], batches = [];
    let activeBatch = null, epoch = 1, consumes = 0;
    const lease = { epoch: 1, consume() { if (consumes >= count + retry) return false; consumes++; return true; }, consumed: () => consumes > 0, consumeCount: () => consumes };
    const controller = new AbortController();
    const h = { settings, config, ctx, posts, recipes, batches, lease, controller, setBatch: value => { activeBatch = value; }, advanceEpoch: () => epoch++,
        releaseBatch: () => modules.releasePendingComboBatch(activeBatch) };
    const sandbox = { Date, console, ...modules,
        API_PROFILE_ORDER: ['chat_system_user_full'], getRememberedApiProfile: () => '',
        getSettings: config.getSettings, getContext: () => ctx, chatKey: () => 'chat:quota-parity',
        swipeId: message => message.swipe_id, messageSourceFingerprint: message => message.mes,
        messageBaseSlotKey: () => 'slot', operationEpochForBase: () => epoch, hashText: String,
        createIndependentVisibleTextReader: () => message => ({ text: message.mes }), isRabbitMirrorEligibleAssistantMessage: () => true,
        automaticIndependentTiming: () => true, prepareRabbitMirrorAvatarPrompt: () => null, rabbitMirrorAvatarPromptIdentity: () => '',
        manualBodyOwnerCurrent: () => true,
        getExternalPoolHydrationStatus: () => ({ hydrated: true }),
        independentLocalPreflightFailure: cause => cause, describeExternalWorldBookPreflightFailure: cause => ({ message: cause.message, code: cause.code }),
        independentVisualHistoryContext: () => null,
        configuredIndependentMaxRequestChars: () => typeof maxRequestChars === 'function' ? maxRequestChars() : maxRequestChars, globalWorldInfoSnapshotFor: () => null, globalWorldInfoContextView: () => ({}),
        contextBundle: () => ({ text: ctx.chat[0].mes, targetVisibleChars: ctx.chat[0].mes.length }), recordRabbitMirrorIndependentPrompt() {}, promptSectionBreakdown: () => [], resolveBehaviorRuleText: () => '',
        independentBatchPlanPreflightError: code => Object.assign(new Error(code), { code, requestCount: 0 }),
        generationEvidenceFor: () => null, assertIndependentMarkupComplexityWithDiagnostic() {}, designSamplingChecksFromHtml: () => [],
        extractMirrorInner: raw => raw.replace(/^<toto[^>]*>/, '').replace(/<\/toto>$/, ''), independentMirrorBodyEvidence: value => value.includes('<p>'),
        prepareIndependentReadyHtml: value => value, bindRolePaletteCode: value => value, rememberApiProfile() {}, scanRabbitMirrorHtml: scanFace || (() => ({})),
        async requestIndependentCompletion(st, system, user, options) {
            await beforeTransport?.(h, options);
            assert.equal(options.dispatchLease.consume(), true, 'only the owned request may consume the lease');
            const profile = sandbox.independentRequestProfiles(st, system, user)[0];
            const entry = { face: options.evidenceFaceIndex, diagnostic: copy(options.diagnosticContext), system, user,
                body: copy(profile.body) };
            posts.push(entry);
            await afterTransport?.(h, entry);
            return { response: { ok: true }, result: { text: `<toto><details><summary>Face ${entry.face + 1}</summary><p>Complete content for face ${entry.face + 1}.</p></details></toto>` },
                profile: 'fixture', requestDiagnostic: entry.diagnostic };
        },
    };
    vm.createContext(sandbox);
    vm.runInContext(between(request, 'function independentRequestProfiles(', '\nfunction nextCompatibilityProfileName('), sandbox);
    vm.runInContext(between(request, 'function independentPromptOwnerPreflightError()', '\nexport function externalOwnerMesid('), sandbox);
    h.call = (options = {}) => sandbox.callIndependentApi(ctx, 0, ctx.chat[0], controller.signal, {
        dispatchLease: lease, isPromptOwnerCurrent: () => true, currentBatchPlan: () => activeBatch,
        onBatchPlan: plan => { activeBatch = plan; batches.push(plan); }, onRequestSelection: value => recipes.push(copy(value)), ...options,
    });
    // The real outer mount gate consumes the diagnostic from the real serial
    // result. A writing-style edit keeps the chat current, so it must not gain
    // another paid attempt just because face 1 already consumed one request.
    const gate = { ...modules, dispatchLease: lease, flight: { attemptToken: { consumeCountAtStart: 0 } },
        manualResay: false, stillCurrent: () => true, independentRerollMax: () => retry };
    vm.createContext(gate);
    vm.runInContext(between(mount, ' const independentDiagnostic=', ' const beginAutomaticReroll=') + '\nglobalThis.mayRetry=canReroll;', gate);
    h.mayRetry = result => gate.mayRetry(null, result, result.failedFaces.map(item => item.faceIndex));
    return h;
}

test('serial initial generation sends each pinned face exactly once without parent/child owner confusion', async () => {
    const h = await fixture();
    const result = await h.call();
    assert.deepEqual(h.posts.map(x => x.face), [0, 1, 2]);
    assert.equal(result.completedFaces, 3);
    assert.equal(result.requestDiagnostic.faceCount, 3);
    assert.equal(h.recipes.length, 1, 'publish the complete recipe once, not a child recipe');
    assert.equal(h.recipes[0].faces.length, 3);
    for (let i = 0; i < 3; i++) {
        assert.deepEqual(h.posts[i].diagnostic.themeIds, [`C.${i + 1}`]);
        assert.match(result.html, new RegExp(`data-rm-face="${i + 1}"`));
    }
});

test('configured automatic retry repeats only a failed serial face with its frozen selection', async () => {
    const h = await fixture({ retry: 1, afterTransport(h, entry) {
        if (entry.face === 1 && h.posts.length === 2) throw Object.assign(new Error('provider failed'), { requestCount: 1 });
    } });
    const result = await h.call();
    assert.deepEqual(h.posts.map(x => x.face), [0, 1, 2, 1]);
    assert.deepEqual(h.posts[1].diagnostic.themeIds, h.posts[3].diagnostic.themeIds);
    assert.equal(result.completedFaces, 3);
});

test('manual full-batch resay sends each requested face once and never retries a failed face automatically', async () => {
    const h = await fixture({ retry: 2, afterTransport(h, entry) {
        if (entry.face === 1) throw Object.assign(new Error('provider failed'), { requestCount: 1 });
    } });
    const result = await h.call({ manualRetry: true });
    assert.deepEqual(h.posts.map(x => x.face), [0, 1, 2]);
    assert.equal(result.completedFaces, 2);
    assert.match(result.html, /Complete content for face 1/);
    assert.match(result.html, /Complete content for face 3/);
});

test('manual first generation retains the configured automatic retry policy', async () => {
    const h = await fixture({ retry: 1, afterTransport(h, entry) {
        if (entry.face === 1 && h.posts.length === 2) throw Object.assign(new Error('provider failed'), { requestCount: 1 });
    } });
    const result = await h.call({ manualRetry: false, manualBodyOwner: { firstGeneration: true, visible: { text: h.ctx.chat[0].mes } } });
    assert.deepEqual(h.posts.map(x => x.face), [0, 1, 2, 1]);
    assert.equal(result.completedFaces, 3);
});

for (const mutation of ['batch', 'released batch', 'body', 'chat', 'epoch', 'settings', 'cancel']) test(`serial preparation still rejects a changed ${mutation} before sending`, async () => {
    let reachedTransport = false;
    const h = await fixture({ beforeTransport(h) {
        reachedTransport = true;
        if (mutation === 'batch') h.setBatch(null);
        if (mutation === 'released batch') assert.equal(h.releaseBatch(), true);
        if (mutation === 'body') h.ctx.chat[0].mes = 'Changed story';
        if (mutation === 'chat') h.ctx.chat = [{ ...h.ctx.chat[0] }];
        if (mutation === 'epoch') h.advanceEpoch();
        if (mutation === 'settings') h.config.updateSettings({ writingStyle: 'changed' });
        if (mutation === 'cancel') h.controller.abort();
    } });
    await assert.rejects(h.call(), error => error.code === 'RABBIT_MIRROR_DISPATCH_LEASE_REJECTED');
    assert.equal(reachedTransport, true);
    assert.equal(h.posts.length, 0);
});

test('local owner loss after face 1 stops the queue and preserves the successful face without retrying', async () => {
    const h = await fixture({ retry: 2, beforeTransport(h, options) {
        if (options.evidenceFaceIndex === 1) h.setBatch(null);
    } });
    const result = await h.call();
    assert.deepEqual(h.posts.map(x => x.face), [0]);
    assert.equal(result.completedFaces, 1);
    assert.deepEqual(copy(result.failedFaces).map(x => x.faceIndex), [1, 2]);
    assert.match(result.html, /Complete content for face 1/);
});

for (const reason of ['settings', 'quota', 'cancel']) test(`partial serial ${reason} stop cannot become an outer mount retry`, async () => {
    const h = await fixture({ retry: 2,
        beforeTransport(h, options) {
            if (options.evidenceFaceIndex !== 1) return;
            if (reason === 'settings') h.config.updateSettings({ writingStyle: 'changed during queue' });
            if (reason === 'cancel') h.controller.abort();
        },
        afterTransport(h, entry) {
            if (reason === 'quota' && entry.face === 1) throw Object.assign(new Error('insufficient quota'), { requestCount: 1, status: 402 });
        },
    });
    const result = await h.call();
    assert.equal(result.completedFaces, 1);
    assert.match(result.html, /Complete content for face 1/);
    assert.equal(h.mayRetry(result), false, 'the real outer canReroll must not authorize missing-face resends');
    assert.equal(h.posts.length, reason === 'quota' ? 2 : 1);
    assert.equal(result.requestDiagnostic.serialStopped, true);
    assert.equal(result.requestDiagnostic.semanticFailure, reason === 'quota' ? 'insufficient-quota' : reason === 'cancel' ? 'cancelled' : 'local-preflight');
});

test('the outer gate still allows an ordinary retryable missing-face result', async () => {
    const h = await fixture({ retry: 2 });
    h.lease.consume();
    assert.equal(h.mayRetry({ failedFaces: [{ faceIndex: 1 }], requestDiagnostic: { partial: true } }), true);
});

test('each serial face keeps its individual HTML or long-text presentation', async () => {
    const h = await fixture();
    h.config.updateSettings({ rabbitMirrorPresentationModes: ['html', 'longtext', 'html'] });
    const result = await h.call();
    assert.deepEqual(h.posts.map(x => x.diagnostic.requestedPresentationMode), ['html', 'longtext', 'html']);
    assert.equal(result.completedFaces, 3);
});

const observedColors = ['#123a70', '#6e2856', '#256341'];
const paletteScan = (html, scans) => {
    const faceIndex = Number(html.match(/data-rm-face="(\d+)"/)[1]) - 1;
    scans.push(faceIndex);
    return { paletteFingerprint: { confidence: .8, mainColors: [observedColors[faceIndex]], source: 'raw' } };
};
const paletteContext = user => user.match(/【本批已完成镜面的配色】[^\n]+/)?.[0] || '';

test('later serial requests observe accepted sibling colors once, without changing pinned selections or request count', async () => {
    const scans = [], scansAtPost = [];
    const h = await fixture({ scanFace: html => paletteScan(html, scans),
        beforeTransport: () => scansAtPost.push(scans.length) });
    const result = await h.call();
    assert.deepEqual(scansAtPost, [0, 1, 2], 'scan a completed face before preparing the next child');
    assert.deepEqual(scans, [0, 1, 2], 'reuse existing end-of-batch scans rather than adding scans');
    assert.equal(paletteContext(h.posts[0].user), '');
    assert.match(paletteContext(h.posts[1].user), /第1面.*#123a70/);
    assert.doesNotMatch(paletteContext(h.posts[1].user), /#6e2856|#256341/);
    assert.match(paletteContext(h.posts[2].user), /第1面.*#123a70.*第2面.*#6e2856/);
    for (const post of h.posts) {
        assert.equal(post.body.messages.find(message => message.role === 'user').content, post.user,
            'the real provider payload builder must retain the final serial reminder');
        assert.equal(post.body.messages.find(message => message.role === 'system').content, post.system);
    }
    assert.equal(result.completedFaces, 3);
    assert.deepEqual(h.posts.map(entry => entry.diagnostic.themeIds), [['C.1'], ['C.2'], ['C.3']]);
    assert.deepEqual(copy(result.faceScans).map(scan => scan.paletteFingerprint.mainColors[0]), observedColors);
    assert.equal(JSON.stringify(result.requestDiagnostic).includes('#123a70'), false, 'no new observed palette diagnostic payload');
    const other = await fixture({ scanFace: html => paletteScan(html, []) });
    await other.call();
    assert.equal(paletteContext(other.posts[0].user), '', 'no sibling context leaks into another batch');
});

test('a serial failed face is not a color observation; its configured retry sees completed siblings only', async () => {
    const scans = [];
    const h = await fixture({ retry: 1, scanFace: html => paletteScan(html, scans), afterTransport(h, entry) {
        if (entry.face === 1 && h.posts.length === 2) throw Object.assign(new Error('provider failed'), { requestCount: 1 });
    } });
    const result = await h.call();
    assert.deepEqual(h.posts.map(entry => entry.face), [0, 1, 2, 1]);
    assert.deepEqual(scans, [0, 2, 1]);
    assert.doesNotMatch(paletteContext(h.posts[2].user), /第2面|#6e2856/);
    assert.match(paletteContext(h.posts[3].user), /第1面.*#123a70.*第3面.*#256341/);
    assert.equal(result.completedFaces, 3);
});

test('long-text serial faces neither receive nor contribute sibling palette constraints', async () => {
    const h = await fixture({ scanFace: html => paletteScan(html, []) });
    h.config.updateSettings({ rabbitMirrorPresentationModes: ['html', 'longtext', 'html'] });
    await h.call();
    assert.equal(paletteContext(h.posts[1].user), '');
    assert.match(paletteContext(h.posts[2].user), /第1面.*#123a70/);
    assert.doesNotMatch(paletteContext(h.posts[2].user), /第2面|#6e2856/);
});

test('repeated actual palettes remain accepted without forcing extra requests', async () => {
    let scanCount = 0;
    const h = await fixture({ retry: 2, scanFace() {
        scanCount++;
        return { paletteFingerprint: { confidence: .8, mainColors: ['#123a70'], source: 'raw' } };
    } });
    const result = await h.call();
    assert.equal(result.completedFaces, 3);
    assert.equal(h.posts.length, 3);
    assert.equal(scanCount, 3);
});

test('serial palette observations remain inside the existing complete-request character budget', async () => {
    const normal = await fixture({ scanFace: html => paletteScan(html, []) });
    await normal.call();
    const second = normal.posts[1];
    const budget = second.system.length + second.user.length - 20;
    let budgetCalls = 0;
    const limited = await fixture({ retry: 2, scanFace: html => paletteScan(html, []),
        maxRequestChars: () => ++budgetCalls === 1 ? 1000000 : budget });
    const result = await limited.call();
    assert.equal(limited.posts.length, 1, 'the compact observation must not bypass the old size guard');
    assert.equal(result.completedFaces, 1);
    assert.equal(result.requestDiagnostic.terminalErrorCode, 'RABBIT_MIRROR_REQUEST_TOO_LARGE');
    assert.equal(limited.mayRetry(result), false);
});

function resayFixture({ errorCard = true, faceIndex = -1, form = 'html' } = {}) {
    const calls = [];
    const sandbox = { console, getSettings: () => ({ generationSource: 'independent', rabbitMirrorFaceCount: 3 }),
        resolveIndependentActionIdentity: () => ({ ctx: {}, msg: {}, index: 0, faceIndex, host: { dataset: { rmState: errorCard ? 'error' : 'ready' } } }),
        canIndependentFaceResay: () => ({ ok: true }), readStore: () => ({}), savedIndependentRecordForOwner: () => null,
        externalFaceDetails: () => faceIndex >= 0 ? Array.from({ length: 3 }, () => ({ hasAttribute: () => true })) : [],
        MULTIFACE_FAILURE_ATTR: 'failure', hasEphemeralFaceFailure: () => false, isBlankLongTextSelection: () => false,
        displayedFaceRecipe: () => null, generateFor: (...args) => calls.push(args), toastr: { info() {}, error() {}, warning() {} } };
    vm.createContext(sandbox);
    vm.runInContext(between(mount, 'export function resayIndependentMirror(', '\nconst unsavedIndependentOutputs'), sandbox);
    sandbox.resayIndependentMirror({}, {}, { mode: 'fresh', form });
    return calls;
}

test('fresh retry of an empty batch failure card retains the configured face count', async () => {
    const calls = resayFixture();
    assert.equal(calls.length, 1);
    assert.equal(calls[0][4], null);
    assert.equal(calls[0][7], null, 'an empty batch error card is not a one-face presentation resay');
    const h = await fixture();
    const result = await h.call({ manualRetry: true, multifaceResay: calls[0][4] || calls[0][7] });
    assert.equal(result.completedFaces, 3);
    assert.equal(h.posts.length, 3);
});

test('existing single-face form changes and individual failed-face resays retain their scope', () => {
    const single = resayFixture({ errorCard: false });
    assert.equal(single[0][7].presentationOverride, 'html');
    const face = resayFixture({ faceIndex: 1, errorCard: false });
    assert.equal(face[0][4].faceIndex, 1);
    assert.equal(face[0][7], null);
});
