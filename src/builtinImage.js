import { getSettings } from './settings.js?rmv=1.67.90';
import { generateMirrorImage, getImageCharacters } from './baibaiImage.js?rmv=1.67.90';
import { loadMirrorImage, saveMirrorImage } from './imageStore.js?rmv=1.67.90';
import { getContext, hashText } from './independentApi/runtime.js?rmv=1.67.90';
import { imageLlmConfigured } from './imageLlm.js?rmv=1.67.90';
import { isRabbitMirrorLinkedAvatarFrame, prepareRabbitMirrorAvatarFrame } from './chatAvatars.js?rmv=1.67.90';
import { rabbitMirrorAvatarPromptIdentity } from './chatAvatarPromptReady.js?rmv=1.67.90';

// 同一提示词在滚动、重挂载时共用这一次请求，避免每刷一次工具就再打一次柏宝绘。
const inflight = new Map();
const waiters = new Map();
const progress = new Map();
// 没连上柏宝绘时不要在每次刷新里反复请求。刷新页面后可以再试。
const failed = new Map();

function safeImageUrl(value) {
    const text = String(value || '');
    if (!text) return '';
    if (/^data:image\/(?:png|jpeg|webp|gif);base64,[a-z\d+/=\s]+$/i.test(text)) return text;
    try {
        const url = new URL(text, document.baseURI);
        if (['http:', 'https:'].includes(url.protocol)) return url.href;
        const host = new URL(document.location?.href || document.baseURI);
        if (host.protocol === 'tauri:' && host.host === 'localhost'
            && url.protocol === host.protocol && url.host === host.host
            && !host.username && !host.password && !url.username && !url.password) return url.href;
        return '';
    } catch { return ''; }
}

function characterGroup() {
    const ctx = getContext();
    const person = ctx.characters?.[ctx.characterId] || ctx.character || {};
    return String(person.name || ctx.name2 || '').trim() || '兔子镜';
}

function readPrompt(frame) {
    const node = frame.querySelector?.('[data-rm-draw-prompt]');
    let text = node ? node.textContent : '';
    if (!String(text).trim()) {
        const attr = frame.getAttribute?.('data-rm-draw-prompt') || '';
        if (attr && attr !== '1') text = attr;
    }
    text = String(text || '').replace(/\s+/g, ' ').trim();
    if (text.length < 4) return '';
    return text.slice(0, 800);
}

// NAI 5（自然语言＋标签）：图框里另写的一行英文短标签，进标签栏；自然语言画面进自然语言栏，两栏不再塞同一段话。
function readTags(frame) {
    const node = frame.querySelector?.('[data-rm-draw-tags]');
    return String(node ? node.textContent : '').replace(/\s+/g, ' ').trim().slice(0, 600);
}

// 图框里逐个写的出场人物外貌：<p data-rm-draw-char="原名" hidden>外貌</p>。
// NAI 5 时另写的 <p data-rm-draw-char-tags="原名" hidden>简短外貌英文标签</p>，按原名配给同一个人，进人物的标签栏。
function readCharacters(frame) {
    const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
    const tags = new Map();
    for (const node of frame.querySelectorAll?.('[data-rm-draw-char-tags]') || []) {
        const name = clean(node.getAttribute('data-rm-draw-char-tags')).slice(0, 40);
        const text = clean(node.textContent).slice(0, 300);
        if (name && text && !tags.has(name)) tags.set(name, text);
    }
    const nodes = [...(frame.querySelectorAll?.('[data-rm-draw-char]') || [])].slice(0, 4);
    return nodes.map(node => {
        const name = clean(node.getAttribute('data-rm-draw-char')).slice(0, 40);
        return { name, text: clean(node.textContent), modelTag: tags.get(name) || '' };
    }).filter(person => person.name && (person.text.length >= 2 || person.modelTag));
}

// 逗号标签合并：前面的优先，大小写不同的同一标签只留一个。
function mergeTagLists(...lists) {
    const seen = new Set();
    return lists.flatMap(list => String(list || '').split(',')).map(part => part.trim()).filter(part => {
        const key = part.toLowerCase();
        if (!part || seen.has(key)) return false;
        seen.add(key);
        return true;
    }).join(', ');
}

function storageKey(root, frame, prompt) {
    const details = frame.closest?.('details');
    const ctx = getContext();
    const chat = details?.dataset?.rabbitMirrorOwnerChat
        || String(ctx.getCurrentChatId?.() ?? ctx.chatId ?? '');
    const mes = details?.dataset?.rabbitMirrorOwnerMesid ?? '';
    const swipe = details?.dataset?.rabbitMirrorOwnerSwipe ?? '';
    const frames = [...(root.querySelectorAll?.('[data-rm-draw-frame]') || [])];
    const index = Math.max(0, frames.indexOf(frame));
    return `builtin:${chat}:${mes}:${swipe}:${index}:${hashText(prompt)}`;
}

function readSaved(key) {
    try { return { record: loadMirrorImage(key) }; }
    catch { return { broken: true }; }
}

function frameImageSize(frame) {
    const width = frame.clientWidth;
    const height = frame.clientHeight;
    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
        return width >= height ? 'landscape' : 'portrait';
    }
    // Hidden frames can still declare their intended shape. Unknown geometry keeps the backend default.
    const view = frame.ownerDocument?.defaultView;
    const ratio = String(view?.getComputedStyle?.(frame)?.aspectRatio
        || frame.style?.getPropertyValue('aspect-ratio') || '').trim().replace(/^auto\s+/, '');
    const parts = ratio.split('/').map(part => Number(part.trim()));
    if (parts.length > 2 || parts.some(value => !Number.isFinite(value) || value <= 0)) return undefined;
    return parts[0] >= (parts[1] || 1) ? 'landscape' : 'portrait';
}

// 图框比例和画出来的图差太多时（比如图框是一条很扁的横幅，图是 3:2），铺满会把人头、手切掉。
// 这时不再裁：图框改成跟图一样的比例、高度跟着图走，整张图完整显示；图框的边框、圆角等其余样式不动。
const FIT_CROP_TOLERANCE = 1.15;
function unfitFrameToImage(frame, image) {
    const naturalWidth = image.naturalWidth, naturalHeight = image.naturalHeight;
    const width = frame.clientWidth, height = frame.clientHeight;
    if (!(naturalWidth > 0 && naturalHeight > 0 && width > 0 && height > 0)) return false;
    const imageRatio = naturalWidth / naturalHeight, frameRatio = width / height;
    if (Math.max(imageRatio / frameRatio, frameRatio / imageRatio) <= FIT_CROP_TOLERANCE) return false;
    frame.setAttribute('data-rm-draw-fit', 'image');
    frame.style.setProperty('height', 'auto', 'important');
    frame.style.setProperty('min-height', '0', 'important');
    frame.style.setProperty('max-height', 'none', 'important');
    frame.style.setProperty('aspect-ratio', `${naturalWidth} / ${naturalHeight}`, 'important');
    image.style.setProperty('height', '100%', 'important');
    return true;
}

function fitFrameImage(image, record) {
    // Only newly generated records opt into filling the frame; legacy saves retain their display policy.
    const cover = record?.builtinImageFit === 'cover';
    image.style.setProperty('object-fit', cover ? 'cover' : 'contain', 'important');
    image.style.setProperty('object-position', 'center', 'important');
    const frame = image.closest?.('[data-rm-draw-frame]');
    if (!cover || !frame) return;
    const check = () => {
        try {
            if (frame.clientWidth > 0 && frame.clientHeight > 0) { unfitFrameToImage(frame, image); return; }
            // 镜面折叠着量不到尺寸：等它展开时再量一次。
            frame.closest?.('details')?.addEventListener('toggle', () => { try { unfitFrameToImage(frame, image); } catch {} }, { once: true });
        } catch { /* 量不到就照旧铺满 */ }
    };
    if (image.complete && image.naturalWidth) check();
    image.addEventListener('load', check, { once: true });
}

function paint(frame, record) {
    if (isRabbitMirrorLinkedAvatarFrame(frame)) return false;
    const url = safeImageUrl(record?.url || record?.path || record?.dataUrl);
    if (!url) return false;
    const promptNode = frame.querySelector?.('[data-rm-draw-prompt]');
    if (promptNode) promptNode.hidden = true;
    hideFrameExtraMedia(frame);
    frame.querySelector?.('[data-rm-draw-status]')?.remove();
    let image = frame.querySelector?.('img[data-rm-draw-result]');
    if (!image) {
        image = frame.ownerDocument.createElement('img');
        image.setAttribute('data-rm-draw-result', '1');
        image.alt = '这一面的画面';
        image.style.cssText = 'display:block;width:100%;height:100%;';
        frame.prepend(image);
    }
    fitFrameImage(image, record);
    image.src = url;
    return true;
}

function note(frame, text, root = null) {
    if (isRabbitMirrorLinkedAvatarFrame(frame)) return;
    frame.querySelector?.('[data-rm-draw-status]')?.remove();
    const doc = frame.ownerDocument;
    const box = doc.createElement('div');
    box.setAttribute('data-rm-draw-status', '1');
    box.style.cssText = 'margin:0;padding:12px;font-size:12px;line-height:1.45;display:grid;gap:8px;align-content:center;height:100%;box-sizing:border-box;';
    const line = doc.createElement('p');
    line.textContent = text;
    line.style.cssText = 'margin:0;opacity:.72;';
    box.append(line);
    if (root) {
        // 失败后由用户决定要不要再画一次；只在点击时发一次请求，不自动重试。
        const row = doc.createElement('div');
        row.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
        const button = (label, run) => {
            const node = doc.createElement('button');
            node.type = 'button';
            node.textContent = label;
            node.style.cssText = 'padding:5px 10px;border-radius:8px;border:1px solid currentColor;background:transparent;color:inherit;font-size:12px;cursor:pointer;';
            node.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); run(node); });
            return node;
        };
        row.append(button('重新生图', () => { const prompt = readPrompt(frame); failed.delete(storageKey(root, frame, prompt)); box.remove(); void fillFrame(root, frame); }));
        box.append(row);
    }
    frame.append(box);
}

function anyWaiterConnected(key) {
    const nodes = waiters.get(key);
    if (!nodes) return false;
    for (const waiter of nodes) if (waiter.frame.isConnected && waiter.isCurrent() && !isRabbitMirrorLinkedAvatarFrame(waiter.frame)) return true;
    return false;
}

function imageRequestOwner() {
    const context = getContext();
    const chat = context?.chat;
    const identity = rabbitMirrorAvatarPromptIdentity(context);
    return () => {
        const settings = getSettings(), current = getContext();
        return settings.builtinImageEnabled === true && settings.enabled !== false && settings.mode !== 'off'
            && current?.chat === chat && rabbitMirrorAvatarPromptIdentity(current) === identity;
    };
}

function staleImageRequest() {
    return Object.assign(new Error('聊天、人物或生图设置已变化，本次未继续请求。'), { code: 'stale_owner' });
}

function reportProgress(key, text) {
    if (progress.get(key) === text) return;
    progress.set(key, text);
    for (const { frame, isCurrent } of waiters.get(key) || []) if (frame.isConnected && isCurrent()) note(frame, text);
}

async function imageCharacters(floor) {
    try { return await getImageCharacters({ floor }); }
    catch (error) {
        console.warn('[RabbitMirror] 生图角色库暂不可用，保留本面已有角色资料', error);
        return [];
    }
}

// 没开生图 LLM 时，外貌原来只靠兔子镜模型顺手写的一句；用户在柏宝绘角色库／智绘姬角色预设里配好的外貌没用上。
// 这里按原名把角色库里唯一对得上的那份外貌放在前面，模型写的接在后面（两边都留，不互相覆盖）；
// 模型漏写了外貌、但画面里点了角色卡或 Persona 的名字时，也从角色库补上这个人。
function uniqueLibrary(list) {
    const counts = new Map();
    for (const person of list) counts.set(person.name, (counts.get(person.name) || 0) + 1);
    return new Map(list.filter(person => person.name && counts.get(person.name) === 1).map(person => [person.name, person]));
}

function mergeAppearance(library, modelText, tagsOnly) {
    // NAI 5：角色库的英文标签另放进标签栏，这里只合并自然语言外貌；角色库只有标签时，标签栏照样用上。
    const base = tagsOnly ? String(library?.tag || library?.nl || '') : String(library?.nl || '');
    if (!base.trim()) return modelText;
    if (!modelText) return base.trim();
    // 标签写法：角色库配了就只用角色库，不和模型写的标签混拼（混拼会出现同义重复和互相打架的标签）。
    if (tagsOnly) return base.trim();
    return modelText.includes(base.trim()) ? modelText : `${base.trim()}; ${modelText}`;
}

async function withLibraryAppearance(people, prompt, frame, tagsOnly) {
    const details = frame?.closest?.('details');
    const floorValue = Number(details?.dataset?.rabbitMirrorOwnerMesid);
    const floor = Number.isSafeInteger(floorValue) && floorValue >= 0 ? floorValue : undefined;
    const raw = await imageCharacters(floor);
    const library = uniqueLibrary((Array.isArray(raw) ? raw : []).map(person => ({
        name: String(person?.name || '').trim(), tag: String(person?.tag || '').trim(), nl: String(person?.nl || '').trim(),
    })).filter(person => person.name && (person.tag || person.nl)));
    if (!library.size) return people;
    const merged = people.map(person => ({ ...person, text: mergeAppearance(library.get(person.name), person.text, tagsOnly), libraryTag: String(library.get(person.name)?.tag || '') }));
    const ctx = getContext();
    const owners = [characterGroup(), String(ctx?.name1 || globalThis.name1 || '').trim()].filter(Boolean);
    for (const name of owners) {
        if (merged.length >= 4 || merged.some(person => person.name === name)) continue;
        if (!library.has(name) || !String(prompt || '').includes(name)) continue;
        merged.push({ name, text: mergeAppearance(library.get(name), '', tagsOnly), libraryTag: String(library.get(name)?.tag || '') });
    }
    return merged.filter(person => person.text || person.libraryTag || person.modelTag);
}

function planningFailure() {
    return Object.assign(new Error('生图 LLM 未完成画面规划，本次未调用生图。请检查生图 LLM 设置后点“重新生图”。'), { code: 'image_plan_failed' });
}

// 简短线索不是完整提示词，规划失败时保留图框，不继续花费绘图额度。
async function planWithImageLlm(frame, onProgress, promptFormat, isCurrent) {
    try {
        const details = frame?.closest?.('details');
        const bridge = globalThis.__rabbitMirrorIndependentActionsV1;
        const target = details && typeof bridge?.prepareImageTarget === 'function' ? bridge.prepareImageTarget(details) : null;
        if (!target?.plan) throw planningFailure();
        const focus = readPrompt(frame);
        const publicCharacters = await imageCharacters(target.floor);
        if (!isCurrent()) throw staleImageRequest();
        // 图框里模型写好的出场人物外貌和当时衣着一并单独给生图 LLM，不让它从别处另找衣着、场景。
        const plan = await target.plan({ focus, sceneCharacters: readCharacters(frame), publicCharacters, promptFormat }, { builtin: true, onProgress });
        if (!plan || !String(plan.prompt || plan.flatPrompt || plan.nl || '').trim()) throw planningFailure();
        return plan;
    } catch (error) {
        if (error?.code === 'stale_owner') throw error;
        console.warn('[RabbitMirror] 生图 LLM 规划未完成，保留图框且不调用绘图', error);
        throw planningFailure();
    }
}

function startJob(key, prompt, frame, isCurrent) {
    const existing = inflight.get(key);
    if (existing?.isCurrent()) return existing.job;
    const entry = { job: null, isCurrent };
    const job = (async () => {
        if (!isCurrent()) throw staleImageRequest();
        const size = frameImageSize(frame);
        const settings = { ...getSettings() };
        const withLlm = imageLlmConfigured(settings);
        if (withLlm) reportProgress(key, '生图 LLM 正在构思画面提示词…');
        const planned = withLlm ? await planWithImageLlm(frame, phase => {
            if (isCurrent() && (phase === 'response-chunk' || phase === 'connection-manager-frame')) {
                reportProgress(key, '生图 LLM 正在返回画面提示词…');
            }
        }, settings.imagePromptFormat, isCurrent) : null;
        if (!isCurrent()) throw staleImageRequest();
        const provider = settings.imageBackend === 'chatu8' ? '智绘姬' : '柏宝绘';
        reportProgress(key, `${withLlm ? '提示词已完成，' : ''}正在交给${provider}生图…`);
        const generated = await generateMirrorImage(planned ? {
            prompt: String(planned.prompt || planned.flatPrompt || planned.nl || ''),
            flatPrompt: String(planned.flatPrompt || ''),
            nl: String(planned.nl || ''),
            characters: Array.isArray(planned.characters) ? planned.characters : [],
            promptFormat: settings.imagePromptFormat,
        } : await (async () => {
            // 没有生图 LLM：按提示词格式分开填，标签写法不再把同一句话当成自然语言再发一次。
            const tagsOnly = settings.imagePromptFormat === 'nai45-tags';
            // 人物标签栏：角色库里配了标签就只用角色库（用户自己写的，最准）；模型另写的标签只给角色库里没有的人。
            // 两边混在一起会出现 1girl 和 1 girl、pale skin 和 snow-white skin、冷脸和笑脸这种重复或打架的标签。
            const tagOf = person => String(person.libraryTag || '').trim() || mergeTagLists(person.modelTag);
            // 每个人至少要有这种写法用得上的外貌：标签写法看标签，NAI 5 看自然语言或标签，空的人不发。
            const people = (await withLibraryAppearance(readCharacters(frame), prompt, frame, tagsOnly))
                .filter(person => tagsOnly ? String(person.text || '').trim() : String(person.text || '').trim() || tagOf(person));
            if (!isCurrent()) throw staleImageRequest();
            // 角色库外貌在前、模型写的在后，两边都保留；单提示词也逐人具名，不匿名混拼。
            // 单提示词后端按「原名: 自然语言外貌; 标签」逐人具名，和 buildSingleImagePrompt 的写法一致，不重复同一人。
            // NAI 5 人物标签栏：角色库的标签在前，模型照角色卡、世界书写的简短外貌标签补在后面。
            const appearanceOf = person => tagsOnly ? person.text : [...new Set([person.text, tagOf(person)].filter(Boolean))].join('; ');
            const appearance = people.map(person => `${person.name}: ${appearanceOf(person)}`).join('\n');
            // NAI 5：标签栏放模型另写的英文短标签，自然语言栏放画面描述；旧镜面没写标签时仍只发画面描述这一份。
            const tags = tagsOnly ? '' : readTags(frame);
            return {
                prompt: tags || prompt,
                // 只收一段提示词的渠道：NAI 5 先放场景标签，再放自然语言画面，最后逐人外貌。
                flatPrompt: [tags, prompt, appearance].filter(Boolean).join('\n'),
                nl: tagsOnly ? '' : prompt,
                characters: people.map(person => ({ name: person.name, tag: tagsOnly ? person.text : tagOf(person), nl: tagsOnly ? '' : person.text })),
                promptFormat: settings.imagePromptFormat,
            };
        })(), {
            character: characterGroup(),
            size,
            assertCurrent: () => isCurrent() && anyWaiterConnected(key),
            onProgress: event => {
                const phase = { queued: '排队中', generating: '绘制中', 'queued-remote': '远端排队中', retrying: '按渠道规则重试中', saving: '保存中' }[event?.phase];
                if (phase && isCurrent()) reportProgress(key, `${provider}：${phase}…`);
            },
        });
        const record = { ...generated, builtinImageFit: 'cover' };
        try { if (inflight.get(key) === entry) saveMirrorImage(key, record); }
        catch (error) { console.warn('[RabbitMirror] 内置生图已画成，但没能写入本机存档', error); }
        return record;
    })();
    entry.job = job;
    inflight.set(key, entry);
    const cleanup = () => {
        if (inflight.get(key) === entry) { inflight.delete(key); progress.delete(key); }
    };
    job.then(cleanup, cleanup);
    return job;
}

async function fillFrame(root, frame) {
    const isCurrent = imageRequestOwner();
    // A saved pair may still be hydrating on reload. Resolve that local-only
    // bridge before an avatar placeholder can spend a drawing request.
    if (await prepareRabbitMirrorAvatarFrame(frame)) return;
    if (!isCurrent() || !frame.isConnected) return;
    ensureFrameBox(frame);
    const existingImage = frame.querySelector?.('img[data-rm-draw-result][src]');
    if (existingImage) return;
    const prompt = readPrompt(frame);
    if (!prompt) return;
    const key = storageKey(root, frame, prompt);
    const saved = readSaved(key);
    if (saved.broken) {
        note(frame, '这一面的画面存档读不出来，没有重新生图。', root);
        return;
    }
    if (saved.record && paint(frame, saved.record)) return;
    if (failed.has(key)) {
        note(frame, failed.get(key), root);
        return;
    }
    let nodes = waiters.get(key);
    if (!nodes) { nodes = new Set(); waiters.set(key, nodes); }
    const waiter = { frame, isCurrent };
    nodes.add(waiter);
    if (progress.has(key)) note(frame, progress.get(key));
    try {
        const record = await startJob(key, prompt, frame, isCurrent);
        if (isCurrent() && frame.isConnected) paint(frame, record);
    } catch (error) {
        const code = error?.code;
        if (code === 'stale_owner' || !isCurrent()) {
            // 归属变了就不画；图框还在页面上时留一个“重新生图”，不让它一直停在“绘制中…”。
            if (frame.isConnected) note(frame, '这一面的画面这次没有画成。', root);
            return;
        }
        const message = code === 'image_plan_failed' ? planningFailure().message : code === 'not_configured' || code === 'unsupported_api'
            ? `${String(error?.message || '生图渠道还没连好')}这一面先留着提示词。`
            : '这一面的画面这次没有画成。';
        if (['not_configured', 'unsupported_api', 'invalid_args', 'invalid_result', 'image_plan_failed'].includes(code)) failed.set(key, message);
        if (frame.isConnected) note(frame, message, root);
        console.warn('[RabbitMirror] 内置生图没有填进图框', error);
    } finally {
        nodes.delete(waiter);
        if (!nodes.size) waiters.delete(key);
    }
}

// 模型有时在图框里另放一张图（比如外链的塔罗牌原图），和画好的图挤在同一个框里各占一半。
// 图框只显示画好的图：框里别的图片、视频不显示，只加一个运行时标记，原文不删。
const FRAME_EXTRA_MEDIA = 'img:not([data-rm-draw-result]), picture, video';
function hideFrameExtraMedia(frame) {
    for (const node of frame.querySelectorAll?.(FRAME_EXTRA_MEDIA) || []) {
        if (node.closest('[data-rm-draw-status]')) continue;
        if (node.matches('img') && node.closest('picture')) continue;
        node.setAttribute('data-rm-draw-extra', 'true');
        node.style.setProperty('display', 'none', 'important');
    }
    // 模型有时把图框自己写成 display:none，再在旁边放一张外链图顶替（比如塔罗牌原图），画好的图就永远看不到。
    // 图框只被它自己的普通内联 display:none 藏住时让它显示；交互驱动或 !important 状态规则管着的图框不碰。
    const style = frame.style;
    if (style && style.getPropertyValue('display') === 'none' && style.getPropertyPriority('display') !== 'important'
        && !frame.hasAttribute('data-rm-result-active') && !frame.hasAttribute('data-rm-show') && !frame.closest?.('[hidden]')) {
        style.setProperty('display', 'block');
        frame.setAttribute('data-rm-draw-unhidden', 'true');
    }
    // 和图框并排、直接放在同一层的外链图片，是顶替画面的那张，不显示。
    for (const node of frame.parentElement?.children || []) {
        if (node === frame || !node.matches?.('img') || node.hasAttribute('data-rm-draw-result')) continue;
        if (!/^https?:/i.test(String(node.getAttribute('src') || '').trim())) continue;
        node.setAttribute('data-rm-draw-extra', 'true');
        node.style.setProperty('display', 'none', 'important');
    }
}

// 图框的基本外形由插件补上，提示词里只给模型最短的写法；模型自己写了的样式一律保留。
function ensureFrameBox(frame) {
    const style = frame?.style;
    if (!style) return;
    hideFrameExtraMedia(frame);
    let computed = null;
    try { computed = getComputedStyle(frame); } catch { computed = null; }
    if (!computed) return;
    if (computed.display === 'inline') style.setProperty('display', 'block');
    if (!style.margin && computed.marginLeft === '40px') style.setProperty('margin', '0');
    if (!style.aspectRatio && computed.aspectRatio === 'auto' && !style.height) style.setProperty('aspect-ratio', '4 / 3');
    if (computed.overflow === 'visible') style.setProperty('overflow', 'hidden');
    if (!style.borderRadius && computed.borderTopLeftRadius === '0px') style.setProperty('border-radius', '12px');
}

// 关掉内置生图只是不再画新图：已经画好、存在本机的图照样放回图框，不发任何请求。
export function restoreSavedBuiltinImages(root) {
    if (!root?.querySelectorAll) return 0;
    let restored = 0;
    for (const frame of root.querySelectorAll('[data-rm-draw-frame]')) {
        if (isRabbitMirrorLinkedAvatarFrame(frame)) continue;
        if (frame.querySelector?.('img[data-rm-draw-result][src]')) continue;
        const prompt = readPrompt(frame);
        if (!prompt) continue;
        const saved = readSaved(storageKey(root, frame, prompt));
        if (!saved.record) continue;
        ensureFrameBox(frame);
        if (paint(frame, saved.record)) restored += 1;
    }
    return restored;
}

export function fillBuiltinImageFrames(root) {
    if (getSettings().builtinImageEnabled !== true || !root?.querySelectorAll) return;
    // 一面里有几个图框就画几张（比如分镜每格一张），每个图框各自存档、各自重试。
    for (const frame of root.querySelectorAll('[data-rm-draw-frame]')) {
        if (isRabbitMirrorLinkedAvatarFrame(frame)) continue;
        hideFrameExtraMedia(frame);
        void fillFrame(root, frame);
    }
}
