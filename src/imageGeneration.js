import { getSettings } from './settings.js?rmv=0.33.44';
import { buildRabbitMirrorImagePrompt } from './imageGenerationPrompt.js?rmv=0.33.44';

const IMAGE_SLOT_ATTR = 'data-rabbit-mirror-image-slot';
const IMAGE_KEY_ATTR = 'data-rabbit-mirror-image-key';
const IMAGE_LIGHTBOX_ID = 'rabbit-mirror-image-lightbox';
const DEFAULT_FREE_ENDPOINT = 'https://image.pollinations.ai/prompt/{prompt}?width={width}&height={height}';
const activeRequests = new Map();
const completedKeys = new Set();
const attemptedKeys = new Set();
const imageSources = new Map();
let missingConfigNoticeShown = false;

function hashText(value) {
    let hash = 2166136261;
    const source = String(value || '');
    for (let i = 0; i < source.length; i += 1) {
        hash ^= source.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
}

function firstNonEmpty(values) {
    for (const value of values) {
        if (typeof value === 'string' && value.trim()) return value.trim();
    }
    return '';
}

function safeContext() {
    try {
        return globalThis.SillyTavern?.getContext?.() || globalThis.getContext?.() || {};
    } catch {
        return {};
    }
}

function sentenceSegments(value) {
    return String(value || '')
        .replace(/\r/g, '\n')
        .split(/(?<=[。！？.!?；;])|\n+/)
        .map(item => item.replace(/\s+/g, ' ').trim())
        .filter(Boolean);
}

const APPEARANCE_HINT_RE = /(外貌|外观|长相|容貌|发色|头发|发型|眼睛|瞳|身高|身形|体型|肤色|皮肤|服装|衣着|穿着|佩戴|appearance|looks?|hair|eyes?|height|build|skin|wearing|clothes?|outfit|容姿|髪|瞳|身長|体格|肌|服装|衣装)/i;

function appearanceExcerpt(values) {
    const source = values.filter(Boolean).map(value => String(value)).join('\n');
    if (!source.trim()) return '';
    const segments = sentenceSegments(source);
    const matched = segments.filter(item => APPEARANCE_HINT_RE.test(item)).join(' ');
    return (matched || segments.slice(0, 4).join(' ')).replace(/\s+/g, ' ').trim().slice(0, 900);
}

function getCharacterRecord(context) {
    const characterId = Number(context?.characterId ?? context?.character_id ?? globalThis.this_chid);
    if (Array.isArray(context?.characters) && Number.isInteger(characterId) && characterId >= 0) {
        return context.characters[characterId] || {};
    }
    return context?.character || {};
}

function getAppearanceAnchors() {
    const context = safeContext();
    const character = getCharacterRecord(context);
    const characterData = character?.data || {};
    const powerUser = context?.powerUserSettings || globalThis.power_user || {};
    const persona = context?.persona || context?.userPersona || {};

    const charName = firstNonEmpty([
        context?.name2,
        character?.name,
        characterData?.name,
        globalThis.name2,
        'CHAR',
    ]);
    const userName = firstNonEmpty([
        context?.name1,
        context?.userName,
        persona?.name,
        powerUser?.persona_name,
        globalThis.name1,
        'USER',
    ]);

    const charAppearance = appearanceExcerpt([
        character?.description,
        characterData?.description,
        character?.personality,
        characterData?.personality,
        character?.scenario,
        characterData?.scenario,
        characterData?.extensions?.depth_prompt?.prompt,
    ]);
    const userAppearance = appearanceExcerpt([
        context?.personaDescription,
        context?.persona_description,
        persona?.description,
        persona?.prompt,
        powerUser?.persona_description,
        powerUser?.personaDescription,
        powerUser?.persona_descriptions?.[powerUser?.default_persona],
        powerUser?.persona_descriptions?.[powerUser?.persona],
        globalThis.persona_description,
    ]);

    return { charName, charAppearance, userName, userAppearance };
}

function elementIsVisible(element) {
    if (!element?.isConnected) return false;
    if (element.closest?.(`[${IMAGE_SLOT_ATTR}], .rabbit-mirror-maintenance-rabbit, .rabbit-mirror-feedback-cat, script, style, template, noscript`)) return false;
    if (element.matches?.('input, textarea, select, option')) return false;
    if (element.hidden || element.getAttribute?.('aria-hidden') === 'true') return false;
    try {
        const style = globalThis.getComputedStyle?.(element);
        if (style && (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) <= 0.02)) return false;
    } catch {
        // ignore
    }
    return true;
}

function extractVisibleMirrorContent(root) {
    if (!root || typeof document === 'undefined') return '';
    const showText = globalThis.NodeFilter?.SHOW_TEXT ?? 4;
    const walker = document.createTreeWalker(root, showText);
    const chunks = [];
    let node;
    while ((node = walker.nextNode())) {
        const text = String(node.nodeValue || '').replace(/\s+/g, ' ').trim();
        if (!text) continue;
        const parent = node.parentElement;
        if (!parent || !elementIsVisible(parent)) continue;
        chunks.push(text);
        if (chunks.join(' ').length >= 2800) break;
    }
    return chunks.join(' ').replace(/\s+/g, ' ').trim().slice(0, 2600);
}

function mirrorTitle(root) {
    return String(root?.querySelector?.('summary')?.textContent || '')
        .replace(/[🐇🐈⚪🟢🟡🔴]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 180);
}

function getMessageKey(message, chat) {
    const index = Array.isArray(chat) ? chat.lastIndexOf(message) : -1;
    const swipe = Number.isInteger(message?.swipe_id) ? message.swipe_id : 0;
    return `${index}:${swipe}:${hashText(message?.mes || '')}`;
}

function validateEndpoint(value) {
    const source = String(value || '').trim();
    if (!source) return '';
    try {
        const url = new URL(source, globalThis.location?.href || 'https://localhost/');
        if (!['http:', 'https:'].includes(url.protocol)) return '';
        return url.href;
    } catch {
        return '';
    }
}

function normalizeFreeTemplate(value) {
    const source = String(value || '').trim() || DEFAULT_FREE_ENDPOINT;
    const probe = source
        .replaceAll('{prompt}', 'test')
        .replaceAll('{width}', '1024')
        .replaceAll('{height}', '1024');
    try {
        const url = new URL(probe, globalThis.location?.href || 'https://localhost/');
        if (!['http:', 'https:'].includes(url.protocol)) return '';
        return source;
    } catch {
        return '';
    }
}

function parseSize(size) {
    const [width, height] = String(size || '1024x1024').split('x').map(value => Number(value) || 1024);
    return { width, height };
}

function ensureSlot(root, key) {
    const details = root.matches?.('details') ? root : root.querySelector?.(':scope > details') || root.querySelector?.('details');
    if (!details) return null;
    let slot = details.querySelector?.(`:scope > [${IMAGE_SLOT_ATTR}]`);
    if (!slot) {
        slot = document.createElement('div');
        slot.className = 'rabbit-mirror-image-slot';
        slot.setAttribute(IMAGE_SLOT_ATTR, 'true');
        details.appendChild(slot);
    }
    slot.setAttribute(IMAGE_KEY_ATTR, key);
    return slot;
}

function setSlotState(slot, state, detail = '') {
    if (!slot) return;
    slot.dataset.rabbitMirrorImageState = state;
    slot.title = detail || '';
    if (state === 'loading') {
        slot.innerHTML = '<div class="rabbit-mirror-image-frame rabbit-mirror-image-frame-loading" role="status" aria-label="兔子镜配图绘制中"><span>绘制中</span></div>';
    } else if (state === 'missing') {
        slot.innerHTML = '<div class="rabbit-mirror-image-frame rabbit-mirror-image-frame-error" role="status"><span>未配置</span></div>';
    } else if (state === 'error') {
        slot.innerHTML = '<div class="rabbit-mirror-image-frame rabbit-mirror-image-frame-error" role="status"><span>绘图失败</span></div>';
    }
}

function closeLightbox() {
    document?.getElementById?.(IMAGE_LIGHTBOX_ID)?.remove?.();
}

function openLightbox(src, alt) {
    closeLightbox();
    const overlay = document.createElement('div');
    overlay.id = IMAGE_LIGHTBOX_ID;
    overlay.className = 'rabbit-mirror-image-lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.innerHTML = `<button type="button" class="rabbit-mirror-image-lightbox-close" aria-label="关闭配图">×</button><img alt="${String(alt || '兔子镜配图').replace(/"/g, '&quot;')}">`;
    overlay.querySelector('img').src = src;
    overlay.addEventListener('click', event => {
        if (event.target === overlay || event.target.closest?.('.rabbit-mirror-image-lightbox-close')) closeLightbox();
    });
    document.body.appendChild(overlay);
}

function showImage(slot, src, alt) {
    slot.dataset.rabbitMirrorImageState = 'ready';
    slot.innerHTML = '';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'rabbit-mirror-image-frame rabbit-mirror-image-frame-ready';
    button.title = '点击查看兔子镜配图';
    button.setAttribute('aria-label', button.title);
    const image = document.createElement('img');
    image.src = src;
    image.alt = alt || '兔子镜配图';
    button.appendChild(image);
    button.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        openLightbox(src, image.alt);
    });
    slot.appendChild(button);
}

function base64ToDataUrl(value, mimeType = 'image/png') {
    const source = String(value || '').trim();
    if (!source) return '';
    if (/^data:image\//i.test(source)) return source;
    return `data:${mimeType};base64,${source}`;
}

function firstImageFromJson(payload) {
    const candidates = [
        payload?.data?.[0],
        payload?.images?.[0],
        payload?.output?.[0],
        payload?.result?.images?.[0],
        payload?.result,
        payload,
    ].filter(Boolean);
    for (const item of candidates) {
        if (typeof item === 'string') {
            if (/^(?:https?:|data:image\/)/i.test(item)) return item;
            if (/^[A-Za-z0-9+/=\s]{200,}$/.test(item)) return base64ToDataUrl(item);
        }
        const url = firstNonEmpty([item?.url, item?.image_url, item?.imageUrl, item?.src]);
        if (url) return url;
        const imageValue = firstNonEmpty([item?.b64_json, item?.base64, item?.image_base64, item?.image]);
        if (/^(?:https?:|data:image\/)/i.test(imageValue)) return imageValue;
        if (imageValue) return base64ToDataUrl(imageValue, item?.mime_type || item?.mimeType || 'image/png');
    }
    return '';
}

function normalizeModelList(payload) {
    const rows = [
        ...(Array.isArray(payload?.data) ? payload.data : []),
        ...(Array.isArray(payload?.models) ? payload.models : []),
        ...(Array.isArray(payload) ? payload : []),
    ];
    const ids = rows.map(item => {
        if (typeof item === 'string') return item.trim();
        return firstNonEmpty([item?.id, item?.name, item?.model]);
    }).filter(Boolean);
    return [...new Set(ids)].slice(0, 200);
}

function deriveModelsEndpoint(endpoint) {
    const base = validateEndpoint(endpoint);
    if (!base) return '';
    try {
        const url = new URL(base);
        if (/\/images\/generations\/?$/i.test(url.pathname)) {
            url.pathname = url.pathname.replace(/\/images\/generations\/?$/i, '/models');
        } else if (/\/v1\/?$/i.test(url.pathname)) {
            url.pathname = url.pathname.replace(/\/?$/, '/models');
        } else if (/\/models\/?$/i.test(url.pathname)) {
            // keep
        } else {
            url.pathname = `${url.pathname.replace(/\/$/, '')}/models`;
        }
        url.search = '';
        return url.href;
    } catch {
        return '';
    }
}

function buildFreeEndpointUrl(template, prompt, size) {
    const normalized = normalizeFreeTemplate(template);
    if (!normalized) return '';
    const { width, height } = parseSize(size);
    const encodedPrompt = encodeURIComponent(prompt);
    let built = normalized
        .replaceAll('{prompt}', encodedPrompt)
        .replaceAll('{width}', String(width))
        .replaceAll('{height}', String(height));
    if (built.includes('{')) return '';
    try {
        const url = new URL(built, globalThis.location?.href || 'https://localhost/');
        if (!normalized.includes('{prompt}') && !url.searchParams.has('prompt')) url.searchParams.set('prompt', prompt);
        if (!url.searchParams.has('width')) url.searchParams.set('width', String(width));
        if (!url.searchParams.has('height')) url.searchParams.set('height', String(height));
        return url.href;
    } catch {
        return '';
    }
}

async function callCustomImageEndpoint({ endpoint, apiKey, model, size, prompt, signal }) {
    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
    const body = { prompt, n: 1, size };
    if (model) body.model = model;

    const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal,
    });
    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`接口返回 ${response.status}${text ? `：${text.slice(0, 240)}` : ''}`);
    }
    const contentType = String(response.headers.get('content-type') || '').toLowerCase();
    if (contentType.startsWith('image/')) return URL.createObjectURL(await response.blob());
    if (!contentType.includes('json')) {
        throw new Error('接口没有返回图片或 JSON；请填写完整的文生图 API 地址，而不是普通网站首页。');
    }
    const payload = await response.json();
    const image = firstImageFromJson(payload);
    if (!image) throw new Error('接口响应中未找到可识别的图片 URL 或 base64 数据。');
    return image;
}

async function callFreeImageEndpoint({ template, prompt, size, signal }) {
    const endpoint = buildFreeEndpointUrl(template, prompt, size);
    if (!endpoint) throw new Error('免费成图地址无效；请填写可直接访问图片的地址模板。');
    const response = await fetch(endpoint, { method: 'GET', signal });
    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`免费成图返回 ${response.status}${text ? `：${text.slice(0, 240)}` : ''}`);
    }
    const contentType = String(response.headers.get('content-type') || '').toLowerCase();
    if (contentType.startsWith('image/')) return URL.createObjectURL(await response.blob());
    if (!contentType.includes('json')) throw new Error('免费成图没有返回图片；请检查免费成图地址是否支持直接生成图片。');
    const payload = await response.json();
    const image = firstImageFromJson(payload);
    if (!image) throw new Error('免费成图响应中未找到可识别的图片 URL 或 base64 数据。');
    return image;
}

export async function connectImageGenerationModels({ endpoint, apiKey } = {}) {
    const modelsEndpoint = deriveModelsEndpoint(endpoint);
    if (!modelsEndpoint) throw new Error('请先填写完整的文生图 API 地址。');
    const headers = {};
    if (apiKey) headers.Authorization = `Bearer ${String(apiKey).trim()}`;
    const response = await fetch(modelsEndpoint, { method: 'GET', headers });
    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`拉取模型失败 ${response.status}${text ? `：${text.slice(0, 240)}` : ''}`);
    }
    const payload = await response.json().catch(() => ({}));
    const models = normalizeModelList(payload);
    if (!models.length) throw new Error('接口已连接，但没有返回可选模型。');
    return models;
}

export async function maybeGenerateImageForRabbitMirror({ message, chat, renderedToto } = {}) {
    const settings = getSettings();
    if (!settings.imageGenerationEnabled) return { skipped: 'disabled' };
    if (!renderedToto?.isConnected) return { skipped: 'missing-root' };

    const key = getMessageKey(message, chat);
    const existingSlot = [...(renderedToto.querySelectorAll?.(`[${IMAGE_SLOT_ATTR}]`) || [])]
        .find(slot => slot.getAttribute(IMAGE_KEY_ATTR) === key);
    const rememberedSource = imageSources.get(key);
    if (rememberedSource) {
        const restoredSlot = existingSlot || ensureSlot(renderedToto, key);
        showImage(restoredSlot, rememberedSource, `${mirrorTitle(renderedToto) || '兔子镜'}配图`);
        return { skipped: 'restored' };
    }
    if (attemptedKeys.has(key) || completedKeys.has(key) || activeRequests.has(key) || existingSlot?.dataset?.rabbitMirrorImageState === 'ready') {
        return { skipped: 'duplicate' };
    }

    const mode = settings.imageGenerationMode === 'custom' ? 'custom' : 'free';
    const endpoint = validateEndpoint(settings.imageApiUrl);
    const freeTemplate = normalizeFreeTemplate(settings.imageFreeSiteUrl);
    const model = String(settings.imageModel || '').trim();
    const apiKey = String(settings.imageApiKey || '').trim();
    const size = ['1024x1024', '1024x1536', '1536x1024'].includes(settings.imageSize)
        ? settings.imageSize
        : '1024x1024';
    const slot = ensureSlot(renderedToto, key);

    if ((mode === 'custom' && (!endpoint || !model)) || (mode === 'free' && !freeTemplate)) {
        const detail = mode === 'custom'
            ? '请先填写文生图 API 地址并连接模型。'
            : '请先填写可用的免费成图地址。';
        setSlotState(slot, 'missing', detail);
        if (!missingConfigNoticeShown) {
            missingConfigNoticeShown = true;
            globalThis.toastr?.warning?.(mode === 'custom'
                ? '兔子镜配图已开启，但自定义 API 地址或模型尚未配置完整。'
                : '兔子镜配图已开启，但免费成图地址尚未配置完整。');
        }
        return { skipped: 'missing-config' };
    }

    const mirrorContent = extractVisibleMirrorContent(renderedToto);
    const appearance = getAppearanceAnchors();
    const prompt = buildRabbitMirrorImagePrompt({
        mirrorContent,
        mirrorTitle: mirrorTitle(renderedToto),
        ...appearance,
    });
    const controller = new AbortController();
    attemptedKeys.add(key);
    activeRequests.set(key, controller);
    setSlotState(slot, 'loading', '正在根据本轮兔子镜内容生成配图。');

    try {
        const src = mode === 'custom'
            ? await callCustomImageEndpoint({ endpoint, apiKey, model, size, prompt, signal: controller.signal })
            : await callFreeImageEndpoint({ template: freeTemplate, prompt, size, signal: controller.signal });
        if (!renderedToto.isConnected || slot.getAttribute(IMAGE_KEY_ATTR) !== key) return { skipped: 'detached' };
        showImage(slot, src, `${mirrorTitle(renderedToto) || '兔子镜'}配图`);
        imageSources.set(key, src);
        completedKeys.add(key);
        return { ok: true, key };
    } catch (error) {
        if (error?.name === 'AbortError') return { skipped: 'aborted' };
        console.warn('[RabbitMirror] image generation failed:', error);
        setSlotState(slot, 'error', error?.message || String(error));
        globalThis.toastr?.warning?.(`兔子镜配图失败：${error?.message || error}`);
        return { ok: false, error };
    } finally {
        activeRequests.delete(key);
    }
}

export function onImageGenerationSettingChanged(enabled) {
    missingConfigNoticeShown = false;
    if (enabled) return;
    for (const controller of activeRequests.values()) controller.abort();
    activeRequests.clear();
    document?.querySelectorAll?.(`[${IMAGE_SLOT_ATTR}]`)?.forEach(slot => slot.remove());
    closeLightbox();
}

export function destroyImageGeneration() {
    onImageGenerationSettingChanged(false);
    completedKeys.clear();
    attemptedKeys.clear();
    imageSources.clear();
}

export function getImageGenerationPromptPreviewForLatestMirror() {
    const roots = [...document.querySelectorAll('toto[data-rabbit-mirror="true"]')];
    const root = roots[roots.length - 1];
    if (!root) return '';
    return buildRabbitMirrorImagePrompt({
        mirrorContent: extractVisibleMirrorContent(root),
        mirrorTitle: mirrorTitle(root),
        ...getAppearanceAnchors(),
    });
}
