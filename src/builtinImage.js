import { rmT as __rmT, rmR as __rmR } from "./textTable.js?rmv=2.5.2";
import { getSettings } from './settings.js?rmv=2.5.2';
import { generateMirrorImage, getImageCharacters } from './baibaiImage.js?rmv=2.5.2';
import { captureMirrorImageOwner, mirrorImageOwnerSourceKey, mirrorImageOwnerMatchesKey, saveMirrorImageForOwner, findUnambiguousBuiltinImageKey, imagePromptFingerprint, mirrorImageChatLoading, removeMirrorImage, builtinImageKeysCompatible, findBuiltinImageKeyFromOtherChat, findCompatibleBuiltinImageKey, findShiftedBuiltinImageKey, builtinImageKeysShifted, loadMirrorImage, replaceMirrorImageVersions } from './imageStore.js?rmv=2.5.2';
import { getContext, hashText } from './independentApi/runtime.js?rmv=2.5.2';
import { freshDrawSlotIdentity } from './freshDrawSlots.js?rmv=2.5.2';
import { imageLlmConfigured } from './imageLlm.js?rmv=2.5.2';
import { tidyImagePayload } from './imageTagTidy.js?rmv=2.5.2';
import { isRabbitMirrorLinkedAvatarFrame, prepareRabbitMirrorAvatarFrame } from './chatAvatars.js?rmv=2.5.2';
import { rabbitMirrorAvatarPromptIdentity } from './chatAvatarPromptReady.js?rmv=2.5.2';
import { explicitGenderStatements, isExplicitGenderStatement } from './characterWorldBook.js?rmv=2.5.2';
const inflight = new Map();
const waiters = new Map();
const progress = new Map();
const failed = new Map();
function safeImageUrl(value) {
    const text = String(value || '');
    if (!text)
        return '';
    if (/^data:image\/[a-z\d.+-]+;base64,[a-z\d+/=\s]+$/i.test(text))
        return text;
    try {
        const url = new URL(text, document.baseURI);
        if (['http:', 'https:'].includes(url.protocol))
            return url.href;
        const host = new URL(document.location?.href || document.baseURI);
        if (host.protocol === 'tauri:' && host.host === 'localhost'
            && url.protocol === host.protocol && url.host === host.host
            && !host.username && !host.password && !url.username && !url.password)
            return url.href;
        return '';
    }
    catch {
        return '';
    }
}
function characterGroup() {
    const ctx = getContext();
    const person = ctx.characters?.[ctx.characterId] || ctx.character || {};
    return String(person.name || ctx.name2 || '').trim() || __rmT("9.JSSv1i");
}
export function adoptDrawNotes(root) {
    if (!root?.querySelectorAll)
        return 0;
    let moved = 0;
    const PART = '[data-rm-draw-prompt],[data-rm-draw-tags],[data-rm-draw-char],[data-rm-draw-char-tags]';
    for (const notes of [...root.querySelectorAll('[data-rm-draw-notes]')]) {
        const number = String(notes.getAttribute('data-rm-draw-notes') || '1').trim() || '1';
        let scope = notes.closest?.('details') || root;
        while (scope !== root && !scope.querySelector?.('[data-rm-draw-frame]')) {
            const outer = scope.parentElement?.closest?.('details');
            scope = outer && root.contains?.(outer) ? outer : root;
        }
        const frames = [...scope.querySelectorAll('[data-rm-draw-frame]')];
        const empty = node => !node.querySelector('[data-rm-draw-prompt]');
        let frame = frames.find(node => String(node.getAttribute('data-rm-draw-frame') || '1').trim() === number && empty(node));
        if (!frame) {
            const nth = frames[Number(number) - 1];
            frame = (nth && empty(nth) ? nth : null) || frames.find(empty) || null;
        }
        const parts = [...notes.querySelectorAll(PART)].filter(node => !node.parentElement?.closest?.(PART) || node.parentElement === notes);
        const shell = notes.parentElement?.closest?.('details') || null;
        if (frame && parts.length) {
            for (const part of parts)
                part.hidden = true;
            frame.prepend(...parts);
            moved += 1;
            notes.remove();
            pruneEmptiedNotesShell(shell, root);
        }
        else if (!parts.length) {
            notes.remove();
            pruneEmptiedNotesShell(shell, root);
        }
        else
            notes.hidden = true;
    }
    return moved;
}
function pruneEmptiedNotesShell(start, root) {
    let shell = start;
    while (shell && shell !== root && shell.parentNode && !shell.contains(root)) {
        if (shell.hasAttribute('data-rabbit-mirror-css-scope') || shell.hasAttribute('data-rabbit-mirror-external-details') || shell.querySelector(':scope > summary[data-rm-title-chrome]'))
            return;
        const MEDIA = '[data-rm-draw-frame],[data-rm-draw-notes],img,video,canvas,svg,audio,iframe,input,button,textarea,select,object,embed';
        for (const child of shell.childNodes) {
            if (child.nodeType === 3) {
                if (child.textContent.trim())
                    return;
                continue;
            }
            if (child.nodeType !== 1)
                continue;
            if (child.tagName === 'SUMMARY')
                continue;
            if (/^(STYLE|SCRIPT)$/.test(child.tagName))
                continue;
            if (child.matches?.(MEDIA) || child.querySelector?.(MEDIA))
                return;
            if ((child.textContent || '').trim())
                return;
        }
        const outer = shell.parentElement?.closest?.('details') || null;
        shell.remove();
        shell = outer;
    }
}
function fallbackTitle(frame) {
    const summary = frame.closest?.('details')?.querySelector?.(':scope > summary');
    if (!summary)
        return '';
    const label = summary.querySelector?.('[data-rm-title-label]');
    let text = '';
    if (label)
        text = label.textContent || '';
    else {
        const copy = summary.cloneNode(true);
        copy.querySelectorAll?.('[data-rabbit-mirror-tool-entry-host], [data-rm-face-swipe-host], [data-rm-face-favorite-star], button').forEach(node => node.remove());
        text = copy.textContent || '';
    }
    return text.replace(/\s+/g, ' ').replace(__rmR("rMYiu.RCTihFK6zB0UiUqjtgqvrRAGZw7HE", ""), '').replace(__rmR("LtwTh1vuGKG", ""), '').trim();
}
function hasModelPrompt(frame) {
    const node = frame?.querySelector?.('[data-rm-draw-prompt]');
    let text = node ? node.textContent : '';
    if (!String(text).trim()) {
        const attr = frame?.getAttribute?.('data-rm-draw-prompt') || '';
        if (attr && attr !== '1')
            text = attr;
    }
    return String(text || '').replace(/\s+/g, ' ').trim().length >= 4;
}
function legacyTitle(frame) {
    return String(frame.closest?.('details')?.querySelector?.(':scope > summary')?.textContent || '').replace(/\s+/g, ' ').replace(__rmR("rMYiu.RCTihFK6zB0UiUqjtgqvrRAGZw7HE", ""), '').replace(__rmR("joWhyT", ""), '').trim();
}
function readPrompt(frame, { cleanTitle = false, legacyCaption = false, legacyTitleText = false } = {}) {
    const node = frame.querySelector?.('[data-rm-draw-prompt]');
    let text = node ? node.textContent : '';
    if (!String(text).trim()) {
        const attr = frame.getAttribute?.('data-rm-draw-prompt') || '';
        if (attr && attr !== '1')
            text = attr;
    }
    text = String(text || '').replace(/\s+/g, ' ').trim();
    if (text.length < 4) {
        const title = legacyTitleText ? legacyTitle(frame) : fallbackTitle(frame);
        const caption = frameCaption(frame, { legacy: legacyCaption }).replace(__rmR("_9h2kwmiR7DAWLSsRC3uJgXrCGbocT", "g"), ' ').replace(/\s*\/\s*/g, __rmT("Yis")).trim();
        const fallback = [title, caption].filter(Boolean).join(__rmT("7ys")).replace(/\s+/g, ' ').trim();
        return fallback.length >= 8 ? fallback.slice(0, 400) : '';
    }
    return text.slice(0, 800);
}
function frameCaption(frame, { legacy = false } = {}) {
    const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
    const textOf = node => {
        if (!node)
            return '';
        if (node.nodeType === 3)
            return clean(node.textContent);
        if (node.nodeType !== 1 || node.hidden || node.matches?.('script,style,template,[hidden],[data-rm-draw-frame],[aria-hidden="true"]'))
            return '';
        if (node.querySelector?.('[data-rm-draw-frame]'))
            return '';
        return clean(legacy && typeof node.innerText === 'string' ? node.innerText : node.textContent);
    };
    const before = [];
    const after = [];
    let node = frame;
    for (let level = 0; level < 3 && node && !node.matches?.('details'); level += 1) {
        for (let prev = node.previousSibling, count = 0; prev && count < 2; prev = prev.previousSibling) {
            const text = textOf(prev);
            if (text) {
                before.unshift(text.slice(-160));
                count += 1;
            }
        }
        for (let next = node.nextSibling, count = 0; next && count < 2; next = next.nextSibling) {
            const text = textOf(next);
            if (text) {
                after.push(text.slice(0, 160));
                count += 1;
            }
        }
        if ((before.join('') + after.join('')).length >= 120)
            break;
        node = node.parentElement;
    }
    return [before.length ? `${__rmT("kBwoxk")}${before.join(' / ')}` : '', after.length ? `${__rmT("fGqoxk")}${after.join(' / ')}` : ''].filter(Boolean).join(__rmT("7os")).slice(0, 300);
}
function readTags(frame) {
    const node = frame.querySelector?.('[data-rm-draw-tags]');
    return String(node ? node.textContent : '').replace(/\s+/g, ' ').trim().slice(0, 600);
}
function readCharacters(frame) {
    const clean = value => String(value || '').replace(/\s+/g, ' ').trim();
    const cleanLooks = value => String(value || '').replace(/\r\n?/g, '\n').replace(/[^\S\n]+/g, ' ').trim();
    const tags = new Map();
    for (const node of frame.querySelectorAll?.('[data-rm-draw-char-tags]') || []) {
        const name = clean(node.getAttribute('data-rm-draw-char-tags')).slice(0, 40);
        const text = clean(node.textContent).slice(0, 600);
        if (name && text && !tags.has(name))
            tags.set(name, text);
    }
    const nodes = [...(frame.querySelectorAll?.('[data-rm-draw-char]') || [])];
    const seen = new Set();
    return nodes.map(node => {
        const name = clean(node.getAttribute('data-rm-draw-char')).slice(0, 40);
        return { name, text: cleanLooks(node.textContent).slice(0, 800), modelTag: tags.get(name) || '' };
    }).filter(person => {
        if (!person.name || seen.has(person.name) || !(person.text.length >= 2 || person.modelTag))
            return false;
        seen.add(person.name);
        return true;
    }).slice(0, 4);
}
const TAG_HUE = '(?:black|white|silver|grey|gray|blonde?|brown|red|pink|blue|green|purple|violet|orange|yellow|aqua|teal|cyan|magenta|lavender|golden|gold|crimson|amber|azure|platinum|beige|cream|ash|navy|rainbow'
    + '|auburn|hazel|chestnut|ginger|copper|scarlet|emerald|ruby|sapphire|turquoise|indigo|lilac|maroon|olive|burgundy|peach|coral|mint|ivory|jet|raven|honey|caramel|rose|wine|plum|cerulean|cobalt|periwinkle|mauve|tan|bronze|rust|vermilion|viridian|aquamarine|lime|khaki|sand|snow|pearl|smoke|charcoal|ebony|flaxen|strawberry|lavender|orchid|fuchsia|salmon|apricot|mocha|hazelnut|ochre|umber|sepia|tangerine|lemon|sky|ice|midnight|moss|jade|sage|slate|steel|gunmetal|pewter|ultramarine|cherry|garnet|brick|rosy|pinkish|bluish|greenish|reddish|purplish|yellowish|brownish|greyish|grayish|whitish|blackish)';
const TAG_COLOR = `(?:(?:(?:light|dark|pale|deep|bright)[-\\s]+)?${TAG_HUE}(?:ish)?(?:[-\\s]+${TAG_HUE})?|light|dark|pale|multicolou?red|two[-\\s]?tone|gradient|streaked)`;
const TAG_STYLE = /\b(?:very|absurdly|long|short|medium|shoulder[-\s]?length|wavy|curly|straight|messy|spiky|fluffy|silky|big|large|small|narrow|sharp|droopy|tsurime|tareme)\b/g;
const TAG_LENGTH = /\b(?:long|short|medium|shoulder[-\s]?length)\b/;
function isBangsTag(tag) {
    const bare = String(tag || '').toLowerCase().replace(/_/g, ' ').trim();
    return /(?:^|[^a-z])bangs(?:$|[^a-z])/.test(bare) || /(?:^|[^a-z])fringe\s*$/.test(bare) || bare === 'hair between eyes';
}
const TAG_TRAITS = [
    ['gender', bare => /^(?:1\s*(?:boy|girl|other)|male|female|man|woman|boy|girl|non[-\s]?binary|agender|genderfluid|trans(?:gender)?\s+(?:man|woman|male|female))$/.test(bare)],
    ['hair-color', bare => /\bhair$/.test(bare) && new RegExp(`^${TAG_COLOR}\\s+hair$`).test(bare.replace(TAG_STYLE, ' ').replace(/\s+/g, ' ').trim())],
    ['eye-color', bare => bare === 'heterochromia' || (/\b(?:eyes|pupils|irises)$/.test(bare) && new RegExp(`^${TAG_COLOR}\\s+(?:eyes|pupils|irises)$`).test(bare.replace(TAG_STYLE, ' ').replace(/\s+/g, ' ').trim()))],
    ['hair-length', bare => /\bhair$/.test(bare) && TAG_LENGTH.test(bare)],
    ['bangs', bare => isBangsTag(bare)],
];
function unbalancedGroup(part) {
    const count = (re) => (part.match(re) || []).length;
    return count(/\{/g) !== count(/\}/g) || count(/\[/g) !== count(/\]/g) || count(/\(/g) !== count(/\)/g) || count(/::/g) % 2 === 1;
}
function tagTraits(part, loose = false) {
    if (!loose && unbalancedGroup(part))
        return [];
    const bare = part.toLowerCase().replace(/^-?\d+(?:\.\d+)?::|::$/g, '').replace(/[{}[\]()]/g, '').replace(/:\s*-?\d+(?:\.\d+)?$/, '').replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
    return TAG_TRAITS.filter(([, test]) => test(bare)).map(([name]) => name);
}
function tagTrait(part, loose = false) { return tagTraits(part, loose)[0] || ''; }
const TAG_COLOR_WORD = new RegExp(`\\b${TAG_COLOR}\\b`, 'gi');
function withoutClaimedLooks(part, claimed) {
    const traits = tagTraits(part);
    const clash = traits.filter(trait => claimed.has(trait));
    if (!clash.length)
        return part;
    if (clash.includes('gender'))
        return '';
    if (/[{}()[\]]|::/.test(part) || clash.includes('eye-color') && /heterochromia/i.test(part) || clash.includes('bangs'))
        return '';
    const underscored = /_/.test(part);
    let rest = part.replace(/_/g, ' ');
    if (clash.includes('hair-color') || clash.includes('eye-color'))
        rest = rest.replace(TAG_COLOR_WORD, ' ');
    if (clash.includes('hair-length'))
        rest = rest.replace(new RegExp(TAG_LENGTH.source, 'gi'), ' ');
    rest = rest.replace(/\s+/g, ' ').trim();
    if (!rest || /^(?:(?:very|absurdly)\s+)*(?:hair|eyes|pupils|irises)$/i.test(rest))
        return '';
    return underscored ? rest.replace(/ /g, '_') : rest;
}
function mergeTagLists(...lists) {
    const seen = new Set();
    const claimed = new Set(String(lists[0] || '').split(',').flatMap(part => tagTraits(part.trim(), true)));
    return lists.flatMap((list, index) => String(list || '').split(',').map(part => [part.trim(), index]))
        .map(([part, index]) => (index > 0 && part ? withoutClaimedLooks(part, claimed) : part))
        .filter(part => {
        const key = part.toLowerCase();
        if (!part || seen.has(key))
            return false;
        seen.add(key);
        return true;
    }).join(', ');
}
function rawStorageKey(root, frame, prompt) {
    const owner = resolveFrameOwner(frame);
    const details = owner?.details || root;
    const frames = [...(details?.querySelectorAll?.('[data-rm-draw-frame]') || [])];
    const index = Math.max(0, frames.indexOf(frame));
    return `builtin:${owner?.chat || ''}:${owner?.mes ?? ''}:${owner?.swipe ?? ''}:f${owner?.faceIndex ?? 'u'}.${index}:${hashText(prompt)}`;
}
function storageKey(root, frame, prompt) {
    const key = rawStorageKey(root, frame, prompt);
    const previous = automaticFrameState(frame)?.previous;
    if (!previous || previous.key === key)
        return key;
    const saved = readSavedAnyChat(key, () => otherFrameKeys(root, frame), legacyKeyFor(root, frame));
    if (saved.record || saved.broken)
        return key;
    return key.slice(0, key.lastIndexOf(':') + 1) + previous.key.slice(previous.key.lastIndexOf(':') + 1);
}
function otherFrameKeys(root, frame) {
    const keys = new Set();
    for (const other of root?.querySelectorAll?.('[data-rm-draw-frame]') || []) {
        if (other === frame)
            continue;
        const text = readPrompt(other);
        if (text)
            keys.add(rawStorageKey(root, other, text));
    }
    return keys;
}
function readSaved(key) {
    try {
        return { record: loadMirrorImage(key) };
    }
    catch (error) {
        return { broken: true, code: error?.code };
    }
}
function shownTime(record) { const at = Number(record?.shownAt); return Number.isFinite(at) ? at : 0; }
function savedKeyFor(key, claimed = null, legacyKey = '') {
    const own = readSaved(key);
    if (own.broken)
        return key;
    if (own.record) {
        const moved = findShiftedBuiltinImageKey(key, claimed);
        if (moved && moved !== key) {
            const other = readSaved(moved);
            if (other.record && shownTime(other.record) > shownTime(own.record))
                return moved;
        }
        return key;
    }
    for (const other of [legacyKey, findCompatibleBuiltinImageKey(key), findBuiltinImageKeyFromOtherChat(key), findShiftedBuiltinImageKey(key, claimed)]) {
        if (other && other !== key) {
            const saved = readSaved(other);
            if (saved.record || saved.broken)
                return other;
        }
    }
    return key;
}
function legacyKeyFor(root, frame) {
    const owner = resolveFrameOwner(frame), prompt = readPrompt(frame);
    const key = rawStorageKey(root, frame, prompt);
    if (owner?.favorite && owner.details?.dataset?.rmImageOwnerFace === undefined)
        return findUnambiguousBuiltinImageKey(key);
    const saved = owner?.ctx?.chatMetadata?.rabbit_mirror_independent_outputs_v2?.owners?.[`${owner.mes}:${owner.swipe}`]?.html;
    const source = String(saved || owner?.msg?.swipes?.[owner.swipe] || owner?.msg?.mes || '');
    const sourceFrames = (source.match(/data-rm-draw-frame(?:\s|=|>)/g) || []).length;
    const boundary = owner?.shell || frame.closest?.('.mes[mesid]');
    const mounted = [...(boundary?.querySelectorAll?.('[data-rm-draw-frame]') || [])];
    const declared = Number(owner?.shell?.dataset?.rmFaceCount || 0);
    const complete = !declared || [...(boundary?.querySelectorAll?.('details') || [])].filter(face => !face.parentElement?.closest?.('details')).length >= declared;
    const uniqueSource = sourceFrames === 1 || (prompt && source.split(prompt).length === 2);
    const uniqueMounted = complete && mounted.length > 0 && mounted.filter(other => readPrompt(other) === prompt).length === 1;
    if (!uniqueSource && !uniqueMounted)
        return '';
    let found = findUnambiguousBuiltinImageKey(key, { legacyOnly: true });
    if (!found && !hasModelPrompt(frame)) {
        const legacy = readPrompt(frame, { legacyCaption: true, legacyTitleText: true });
        if (legacy)
            found = findUnambiguousBuiltinImageKey(rawStorageKey(root, frame, legacy), { legacyOnly: true });
    }
    return found;
}
function readSavedAnyChat(key, claimed = null, legacyKey = '') {
    const where = savedKeyFor(key, claimed, legacyKey);
    return where === key ? readSaved(key) : readSaved(where);
}
const SENT_WAIT_MS = 10 * 60 * 1000;
function liveEntry(entry) {
    if (!entry)
        return false;
    if (entry.sent === true)
        return Date.now() - (entry.sentAt || 0) < SENT_WAIT_MS;
    return entry.isCurrent?.() === true;
}
function inflightKeyFor(key, claimed = null) {
    for (const [other, entry] of inflight)
        if (liveEntry(entry) && mirrorImageOwnerMatchesKey(entry.owner, key))
            return other;
    const taken = (typeof claimed === 'function' ? claimed() : claimed) || new Set();
    for (const [other, entry] of inflight)
        if (liveEntry(entry) && builtinImageKeysShifted(key, other)
            && !taken.has(other) && mirrorImageOwnerMatchesKey(entry.owner, key, { matchEntry: false }))
            return other;
    return '';
}
function hasInflight(key, claimed = null) { return !!inflightKeyFor(key, claimed); }
function frameImageSize(frame) {
    const width = frame.clientWidth;
    const height = frame.clientHeight;
    if (Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
        return width >= height ? 'landscape' : 'portrait';
    }
    const view = frame.ownerDocument?.defaultView;
    const ratio = String(view?.getComputedStyle?.(frame)?.aspectRatio
        || frame.style?.getPropertyValue('aspect-ratio') || '').trim().replace(/^auto\s+/, '');
    const parts = ratio.split('/').map(part => Number(part.trim()));
    if (parts.length > 2 || parts.some(value => !Number.isFinite(value) || value <= 0))
        return undefined;
    return parts[0] >= (parts[1] || 1) ? 'landscape' : 'portrait';
}
const FIT_CROP_TOLERANCE = 1.15;
function unfitFrameToImage(frame, image) {
    const naturalWidth = image.naturalWidth, naturalHeight = image.naturalHeight;
    const width = frame.clientWidth, height = frame.clientHeight;
    if (!(naturalWidth > 0 && naturalHeight > 0 && width > 0 && height > 0))
        return false;
    const imageRatio = naturalWidth / naturalHeight, frameRatio = width / height;
    if (Math.max(imageRatio / frameRatio, frameRatio / imageRatio) <= FIT_CROP_TOLERANCE)
        return false;
    frame.setAttribute('data-rm-draw-fit', 'image');
    frame.style.setProperty('height', 'auto', 'important');
    frame.style.setProperty('min-height', '0', 'important');
    frame.style.setProperty('max-height', 'none', 'important');
    frame.style.setProperty('aspect-ratio', `${naturalWidth} / ${naturalHeight}`, 'important');
    image.style.setProperty('height', '100%', 'important');
    return true;
}
function fitFrameImage(image, record) {
    const cover = record?.builtinImageFit === 'cover';
    image.style.setProperty('object-fit', cover ? 'cover' : 'contain', 'important');
    image.style.setProperty('object-position', 'center', 'important');
    const frame = image.closest?.('[data-rm-draw-frame]');
    if (!cover || !frame)
        return;
    const check = () => {
        try {
            if (frame.clientWidth > 0 && frame.clientHeight > 0) {
                unfitFrameToImage(frame, image);
                return;
            }
            frame.closest?.('details')?.addEventListener('toggle', () => { try {
                unfitFrameToImage(frame, image);
            }
            catch { } }, { once: true });
        }
        catch { }
    };
    if (image.complete && image.naturalWidth)
        check();
    image.addEventListener('load', check, { once: true });
}
const unreadable = new Set();
const sessionRecords = new Map();
const automaticFrames = new WeakMap();
function imageJobIdentity(owner, matchEntry = true) {
    return JSON.stringify([owner.scope || `chat:${owner.chat}`, owner.token, owner.swipe, matchEntry ? owner.entry : null, mirrorImageOwnerSourceKey(owner)]);
}
function supersedeShiftedImageJobs(key, claimed = null) {
    let taken = null;
    for (const [other, entry] of inflight) {
        if (!builtinImageKeysShifted(key, other) || !mirrorImageOwnerMatchesKey(entry.owner, key, { matchEntry: false }))
            continue;
        taken ||= (typeof claimed === 'function' ? claimed() : claimed) || new Set();
        if (!taken.has(other))
            entry.superseded = true;
    }
}
function supersedeImageJobs(owner) {
    const identity = imageJobIdentity(owner);
    for (const entry of inflight.values()) {
        if (entry.followedOwners?.has(identity) || imageJobIdentity(entry.owner) === identity)
            entry.superseded = true;
    }
}
function resolveFrameOwner(frame) {
    let details = frame?.closest?.('details') || null;
    while (details?.parentElement?.closest?.('details'))
        details = details.parentElement.closest('details');
    const ctx = getContext(), current = String(ctx?.getCurrentChatId?.() ?? ctx?.chatId ?? '').replace(/^chat:/, '');
    const own = details?.dataset || {};
    const shellNode = details?.closest?.('[data-rabbit-mirror-external-source="true"]');
    const shell = shellNode?.dataset || {};
    const pick = (...values) => values.find(value => value !== undefined && value !== null && String(value) !== '') ?? '';
    const chat = String(pick(own.rmImageOwnerChat, own.rabbitMirrorOwnerChat, shell.rmOwnerChat, current));
    let mes = String(pick(own.rmImageOwnerMesid, own.rabbitMirrorOwnerMesid, shell.rmOwnerMesid, shell.rmExternalOwnerMessage));
    let swipe = String(pick(own.rmImageOwnerSwipe, own.rabbitMirrorOwnerSwipe, shell.rmOwnerSwipe));
    if (!own.rmImageOwnerChat && !/^\d+$/.test(mes))
        mes = String(frame?.closest?.('.mes[mesid]')?.getAttribute('mesid') ?? '');
    const msg = chat.replace(/^chat:/, '') === current && /^\d+$/.test(mes) ? ctx?.chat?.[Number(mes)] : null;
    if (!/^\d+$/.test(swipe) && msg)
        swipe = String(Number.isInteger(msg.swipe_id) ? msg.swipe_id : 0);
    let faceIndex = pick(own.rmImageOwnerFace, own.rabbitMirrorFaceIndex);
    const toto = details?.closest?.('toto[data-rabbit-mirror="true"]');
    if (faceIndex === '' && /^\d+$/.test(toto?.getAttribute?.('data-rm-face') || ''))
        faceIndex = Number(toto.getAttribute('data-rm-face')) - 1;
    if (faceIndex === '') {
        const boundary = shellNode || frame?.closest?.('.mes[mesid]');
        const faces = [...(boundary?.querySelectorAll?.('details') || [])].filter(face => !face.parentElement?.closest?.('details'));
        faceIndex = Math.max(0, faces.indexOf(details));
    }
    return { ctx, chat, details, shell: shellNode, msg, favorite: !!own.rmImageOwnerChat,
        mes: /^\d+$/.test(mes) ? Number(mes) : null, swipe: /^\d+$/.test(swipe) ? Number(swipe) : null,
        faceIndex: own.rmImageOwnerChat && own.rmImageOwnerFace === undefined ? null
            : Number.isInteger(Number(faceIndex)) && Number(faceIndex) >= 0 ? Number(faceIndex) : 0 };
}
function frameOwner(frame) {
    const owner = resolveFrameOwner(frame);
    return owner?.msg && !owner.favorite && Number(owner.msg.swipe_id || 0) === owner.swipe ? owner : null;
}
function automaticFrameState(frame) {
    const owner = frameOwner(frame);
    if (!owner || owner.msg.is_user)
        return null;
    const output = freshDrawSlotIdentity(owner.chat, owner.mes, owner.swipe, owner.faceIndex);
    if (!output)
        return null;
    const frames = [...(owner.details?.querySelectorAll?.('[data-rm-draw-frame]') || [])];
    const index = frames.indexOf(frame);
    if (index < 0)
        return null;
    let states = automaticFrames.get(owner.msg);
    if (!states) {
        states = new Map();
        automaticFrames.set(owner.msg, states);
    }
    const slot = `${String(owner.chat).replace(/^chat:/, '')}|${owner.swipe}|${owner.faceIndex}|${index}`;
    let previous = states.get(slot);
    if (previous?.output !== output)
        previous = null;
    const hash = previous?.key?.slice(previous.key.lastIndexOf(':') + 1);
    if (hash && hash !== hashText(readPrompt(frame))) {
        const prefix = slot.slice(0, slot.lastIndexOf('|') + 1);
        const known = [...states].filter(([name, value]) => name.startsWith(prefix) && value.output === output).length;
        const moved = frames.some(other => other !== frame && hashText(readPrompt(other)) === hash);
        if (moved && frames.length > known)
            previous = null;
        else if (moved || frames.length > 1 || known > 1)
            previous = {
                output, key: rawStorageKey(owner.details, frame, readPrompt(frame)), record: null,
            };
    }
    return { states, slot, output, previous: previous?.output === output ? previous : null };
}
function rememberAutomaticImage(frame, key, record) {
    const state = automaticFrameState(frame);
    if (state && !state.previous?.entry)
        state.states.set(state.slot, { output: state.output, key, record });
}
const CHAT_LOAD_WAIT_MS = 15000;
const waitingForChat = new WeakMap();
function clearChatLoadWait(target) {
    const waiting = waitingForChat.get(target);
    if (waiting?.timer)
        clearTimeout(waiting.timer);
    waitingForChat.delete(target);
}
function retryWhenChatLoaded(target, key, run, { isCurrent = () => true, onTimeout = () => { } } = {}) {
    let waiting = waitingForChat.get(target);
    const cancel = () => clearChatLoadWait(target);
    if (waiting && waiting.key !== key) {
        cancel();
        waiting = null;
    }
    if (!target.isConnected || !isCurrent()) {
        cancel();
        return true;
    }
    if (!mirrorImageChatLoading(key)) {
        cancel();
        return false;
    }
    if (waiting)
        return true;
    waiting = { key, deadline: Date.now() + CHAT_LOAD_WAIT_MS, timer: null };
    waitingForChat.set(target, waiting);
    const tick = () => {
        if (waitingForChat.get(target) !== waiting)
            return;
        waiting.timer = null;
        if (!target.isConnected || !isCurrent()) {
            cancel();
            return;
        }
        if (!mirrorImageChatLoading(key)) {
            cancel();
            run();
            return;
        }
        const remaining = waiting.deadline - Date.now();
        if (remaining <= 0) {
            onTimeout();
            return;
        }
        waiting.timer = setTimeout(tick, Math.min(300, remaining));
    };
    waiting.timer = setTimeout(tick, 300);
    return true;
}
const unsavedKeys = new Set();
function sessionRecordFor(key) {
    for (const value of sessionRecords.values())
        if (mirrorImageOwnerMatchesKey(value.owner, key))
            return value.record;
    return null;
}
function sameHostAlternative(url) {
    try {
        const parsed = new URL(url), here = new URL(document.baseURI);
        if (!['http:', 'https:'].includes(parsed.protocol) || parsed.origin === here.origin || !/^\/user\//.test(parsed.pathname))
            return '';
        return `${here.origin}${parsed.pathname}${parsed.search}`;
    }
    catch {
        return '';
    }
}
function paintCandidates(record) {
    const list = [record, ...(Array.isArray(record?.history) ? [...record.history].reverse() : [])];
    const seen = new Set();
    return list.flatMap(entry => [entry?.url || entry?.path, entry?.dataUrl]).map(safeImageUrl).flatMap(url => [sameHostAlternative(url), url])
        .filter(url => url && !seen.has(url) && seen.add(url));
}
function watchImageLoad(frame, image, record, root, key) {
    const candidates = paintCandidates(record);
    let index = 0;
    image.src = candidates[0];
    image.onerror = () => {
        index += 1;
        if (index < candidates.length) {
            image.src = candidates[index];
            return;
        }
        image.remove();
        if (key)
            unreadable.add(key);
        note(frame, __rmT("a1u2iElkg.1nahlch1bUx._L8sEaRbgWrLL1mGTBC9v.RKoRLLvBbjdoycjOLPT8yjcrfN0eu3N8ddTppg3YIPPDMfPbr6k68mrAvuGlS9krbMLzbRdn4jizvzgS7M19Pt1qlHIMxA9xnC0q3SSmRSHpWm0k6HZ._tpNXQWDZHZe7KLYEf8kwSrtHTwv_Z.sTCIziU16RE.0PvjuftCT6T"), root);
    };
}
function paint(frame, record, root = null, key = '') {
    if (isRabbitMirrorLinkedAvatarFrame(frame))
        return false;
    const url = safeImageUrl(record?.url || record?.path || record?.dataUrl);
    if (!url)
        return false;
    clearChatLoadWait(frame);
    const promptNode = frame.querySelector?.('[data-rm-draw-prompt]');
    if (promptNode)
        promptNode.hidden = true;
    hideFrameExtraMedia(frame);
    hideSiblingSubstituteImages(frame);
    frame.querySelector?.('[data-rm-draw-status]')?.remove();
    let image = frame.querySelector?.('img[data-rm-draw-result]');
    if (!image) {
        image = frame.ownerDocument.createElement('img');
        image.setAttribute('data-rm-draw-result', '1');
        image.alt = __rmT("K1rMpZ5uCXz.VGZh");
        image.style.cssText = 'display:block;width:100%;height:100%;';
        frame.prepend(image);
    }
    fitFrameImage(image, record);
    watchImageLoad(frame, image, record, root, key);
    return true;
}
function note(frame, text, root = null) {
    if (isRabbitMirrorLinkedAvatarFrame(frame))
        return;
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
        row.append(button(__rmT("OVHiFYWEoBT"), () => { const prompt = readPrompt(frame); failed.delete(storageKey(root, frame, prompt)); box.remove(); void fillFrame(root, frame, { manual: true }); }));
        box.append(row);
    }
    frame.append(box);
}
function anyWaiterConnected(key) {
    const nodes = waiters.get(key);
    if (!nodes)
        return false;
    for (const waiter of nodes)
        if (waiter.frame.isConnected && waiter.isCurrent() && !isRabbitMirrorLinkedAvatarFrame(waiter.frame))
            return true;
    return false;
}
function imageRequestOwner(frame) {
    const original = resolveFrameOwner(frame);
    const source = original?.msg ? String(Number(original.msg.swipe_id || 0) === original.swipe ? original.msg.mes ?? '' : original.msg.swipes?.[original.swipe] ?? '') : '';
    const appearance = JSON.stringify([readPrompt(frame), readTags(frame), readCharacters(frame)]);
    const context = getContext();
    const chat = context?.chat;
    const identity = rabbitMirrorAvatarPromptIdentity(context);
    return () => {
        const settings = getSettings(), current = getContext();
        return settings.builtinImageEnabled === true && settings.enabled !== false && settings.mode !== 'off'
            && current?.chat === chat && rabbitMirrorAvatarPromptIdentity(current) === identity
            && !!original?.msg && Number(original.msg.swipe_id || 0) === original.swipe && resolveFrameOwner(frame)?.msg === original.msg && resolveFrameOwner(frame)?.swipe === original.swipe
            && String(Number(original.msg.swipe_id || 0) === original.swipe ? original.msg.mes ?? '' : original.msg.swipes?.[original.swipe] ?? '') === source
            && JSON.stringify([readPrompt(frame), readTags(frame), readCharacters(frame)]) === appearance;
    };
}
function staleImageRequest() {
    return Object.assign(new Error(__rmT("89dfJCSWXD3PgT37Ov51QO0gl5o2f5zRi3zngVtix93y.WxKzct5WEDRzBG")), { code: 'stale_owner' });
}
function reportProgress(key, text) {
    if (progress.get(key) === text)
        return;
    progress.set(key, text);
    for (const { frame, isCurrent, quiet, onText } of waiters.get(key) || []) {
        if (onText) {
            try {
                onText(text);
            }
            catch { }
        }
        if (!quiet && frame.isConnected && isCurrent())
            note(frame, text);
    }
}
async function imageCharacters(floor) {
    try {
        return await getImageCharacters({ floor });
    }
    catch (error) {
        console.warn(__rmT("W9_mcaMXA_XkYyfBxstcFbBe.VbPkXejy7nOV5aNA9YQeA9zW647fWFLPs1jxlxJ4uvfk1rLscvKB._5P7K4eew0sAiiCk"), error);
        return [];
    }
}
function uniqueLibrary(list) {
    const counts = new Map();
    for (const person of list)
        counts.set(person.name, (counts.get(person.name) || 0) + 1);
    const unique = new Map(list.filter(person => person.name && counts.get(person.name) === 1).map(person => [person.name, person]));
    const ambiguous = new Set([...counts.keys()].filter(name => name && counts.get(name) > 1));
    return { unique, ambiguous };
}
const NAME_BOUNDARY = __rmR("ZnCmHlUbc9jBycMMnqjU1CFKn8FlU5hB.9V_Gan3ggX21nVniDo3vQ2HSZWoM7rns5Ugr0a.yRPN5_KMOIe3x6sIWsWg4E3wnRKYhGqXjtWIOk", "");
function looseNameMatch(a, b) {
    a = String(a || '');
    b = String(b || '');
    if (a.length < 2 || b.length < 2 || a === b)
        return false;
    const [short, long] = a.length < b.length ? [a, b] : [b, a];
    if (short.length === long.length)
        return false;
    if (long.startsWith(short) && NAME_BOUNDARY.test(long[short.length]))
        return true;
    return long.endsWith(short) && NAME_BOUNDARY.test(long[long.length - short.length - 1]);
}
function mentionedIn(text, key, keys = []) {
    key = String(key || '');
    if (!key)
        return false;
    let rest = String(text || '');
    for (const other of [...new Set(keys)].map(String).filter(other => other.length > key.length && other.includes(key)).sort((a, b) => b.length - a.length))
        rest = rest.split(other).join('\u0000');
    return rest.includes(key);
}
const CLOTHING_TAG = /\b(?:dress|gown|robe|robes|kimono|yukata|hanfu|qipao|cheongsam|shirt|t-shirt|blouse|sweater|hoodie|cardigan|coat|overcoat|trench\s+coat|jacket|blazer|cloak|cape|mantle|poncho|vest|suit|tuxedo|uniform|armor|armour|skirt|miniskirt|pants|trousers|jeans|shorts|leggings|pantyhose|stockings|thighhighs|thigh\s+highs|socks|kneehighs|boots|shoes|heels|sandals|slippers|apron|bikini|swimsuit|leotard|bodysuit|lingerie|underwear|bra|panties|pajamas|nightgown|sleepwear|outfit|clothes|clothing|attire|garment|naked|nude|topless|bottomless|shirtless|serafuku|sailor\s+collar|haori|hakama|obi|sash|corset|tunic|camisole|tank\s+top|crop\s+top|turtleneck|scarf|gloves|fur\s+(?:coat|cloak|trim))\b/i;
const CLOTHING_TEXT = __rmR("WuW8TCmGfZWt4oVNC3fCizvcr_ta5p9db7lH5Xlp1.3UqbGOLwr4S9ufHjx0cC7G9It0zgPLimcvSY34O2roxlSdOOWsdrNdvxgS0WGhj4Ex04r2_3oZ.JHFGkhc0Z1_LXaAxSL1QBBklw9p5S8chAP0vJITRnu3c3YAJ403t74YGD8.wInlGXpc1dqfad..4Wsziyc7XxQteTVUMMVhSBvMROZxGtVrtnOOM9vB.AQM.aFevo3GD_J3k323sIaK31B03X..cspSv6rNP7vjWMjzZ1ICSNfWYy1GsrcncsgxiRkkJRhNu2cJxMNhoF23bYnyV2lIvYA4_9cCYYkiUoQVZReuLyPtbEwPaPzoLMjIhLgx0_DQpAlYq6xBH50n9zB9ZJdt0hnsd0aZzxgZLE0ZTIVaYJNlPkOcgdLg6ujSQU0dCSkVrvI94bMPb8kdaG18RGCs_qTFjJi6BSf7KEFDPXqgSJUOEiZRu.PSDa_ZDbe6Ge5lVHoghLULp34dHTG3CHfdVkvARpcdAm46HChINdjTXcR4wO9_CYfvhUGtC5zJZ7ZKoA7XD1VqXgMHBQW1gNb3mtPnMhaWlZziZkpdpBuODZACmEBUeafxHKyD7uZCvqca8glqq8M78JIIQH2fTejIIMGNPstAQHd4zlwh7gx4k4DGZkY", "");
const HAIRSTYLE_TAG = /^\s*(?:(?:high|low|side|long|short|messy|loose)\s+)*(?:ponytail|twintails|twin\s+tails|pigtails|braid|braids|braided\s+hair|single\s+braid|twin\s+braids|french\s+braid|crown\s+braid|hair\s+buns?|buns?|double\s+buns?|updo|half\s+updo|topknot|chignon|hair\s+down|hair\s+up|loose\s+hair|tied\s+hair|hair\s+tied(?:\s+up)?|drill\s+hair|hair\s+over\s+(?:one\s+)?shoulder|hair\s+bobbles|hair\s+rings)\s*$/i;
const HAIRSTYLE_TEXT = __rmR("UgTFqOH4A6SHGNGB2LPxlm0MFlvSiukThU1l45KbXq9nDWpxpjlB8QWjwTRfqT4bWhtYBoYnZLjsfg0HqZmgrttIXBc0DlRCTNh9hByydFsme3_2nCO1YvcHjo.IC2nHqQiH66JK7fyLUnJrQMRGesSV0uhdw1fz2G88rvlgy.Z7y7LIdfHI4M.toFrIwlF7W47Lv3H1WjiG0A6zbMNvJbVL6HQKKRYW4yggXKToxrkGT2FZYNOysYhyT80EzLK9SXDIQH7LG81jZCjzIkjrz.kZbJSgRRFlcMtR8AkP1xJKBp5uhl9mDmKiAdWN9e_Lk8jICGNtenZv5mwB3acwk9TBs0bS6fCALexln0gBMJ4ClJ8TxaP.6E3.uKWuPKigvwvCjtjKYY2qyh0HhTp1O.piYQnkmhIX0uPyFf", "");
const SCENE_KINDS = [
    { name: 'clothing', tag: CLOTHING_TAG, text: CLOTHING_TEXT },
    { name: 'hairstyle', tag: HAIRSTYLE_TAG, text: HAIRSTYLE_TEXT },
];
const hasKindTags = (kind, tags) => String(tags || '').split(',').some(part => kind.tag.test(part));
const hasKindText = (kind, text) => kind.text.test(String(text || '')) || kind.tag.test(String(text || ''));
function personSceneKinds(person) {
    return SCENE_KINDS.filter(kind => hasKindText(kind, person?.text) || hasKindTags(kind, person?.text) || hasKindTags(kind, person?.modelTag));
}
const GARMENT_CN = __rmT("sMRcTv1MpW3BshX.UQuuqcU8epiMFaJt3Ui0egI9eelxAYprpFgqb_i8EwDZ8gA_kdUwGPnZM3oRXcQS4beY.0zksdH3WaQ0RxIzZjOjQxe2QUvS0pXyEFFp0sdfI4jEfwkHAGOmmphXCRoHRQ4cvBf6MhfuN6n9v9b0xnzy.R5ciQIqO6SlGYvAUHpWNb6fVhsiZNwFA2f.WXF8DdzJniXi0h98Z0iAuZaeQ.P5tLLAB9cDUyjvlHtrHdbaQR18f3yh9sUbD6ErdQHfk17ZDO6m5aMn7tI0ypwcQvmYHKnmonmbmngWED8fTkMB0E4pjtQk_rTWwM0Eerw1QBJ.LGduOlpbeb_uFvzDecjuCiHjQNE9mYDNtXycuYTsp8HAxkK1rBH3rxwazbQfPk8jyceb2BVTGg4n5YagSu8r9xcrdFo_tuS6S8TCKyN8AIC31bEXtUwNcS5eOmYZ5mjmzbR024m4rJxHrNYehoEwqf15U6sU");
const GARMENT_MOD = __rmT("lr6xvVseVgQDH4AvBIr94570TIk1gg_MO5LPN20Mp9rbk4sHtN4nJbU1.fXQDB96mTH_x3eEfkCnikYZf0zITgLrJtooxngJdrOPTdBJ2KIgEjMVrfT4oovuZTHHemFCH.OrS9o.o0lgUEXLf7KUWnIRHCJybVjJdLwiyL03xdvjlf");
const GARMENT_ADJ = __rmT("uwvZyNbGH0GrDJBYcIL14ge745IohK5vIaRaI4tKL8J4OgVsH_CMGg06nDjTcm4Ss4XNdaldI1J2ZPhfSzwVfd0MniPLRu22VUnm0WVzmB8I_liMx1GVzs87rNDefigxNDGAFdkV");
const GARMENT_MATERIAL = __rmT("UK5hUFOk3T7_kg.vIqjXtkJFMwDmFjBbRS7UJphLvT0vfvX1MU7F3f");
const CLOTHING_SPAN_CN = new RegExp(`${__rmT("h9vs6lilC8iK7Y9WVVMy_535QTwZdtIMkUAFGqqSf1GjavluzKVYaJvSli9h7gmbXbDnqM7qs2zpg3XRsGbPVQAQGOIL7VEz1CBCXMJceOefG5PXXhYExIS4HGlwDH3C39aRCVF4wXTINqLBqEmwRQ6vRA1wQ6mrbvEmSqAzjjb5dBLUAu2U9NMCttKcQxvtgB1c_WvuRK5B14oxmZoDwqqnt3dmesB6NlfDcjngV3hbRkTgQPE3FYyEPpVt..JcHvAsMLsKOqELJbhncMkU.PLvUjzZ3kbPjEPe.f")}${GARMENT_MOD}|${GARMENT_ADJ})?${GARMENT_MATERIAL}${GARMENT_CN}`, 'g');
const CLOTHING_WORDS_CN = __rmR("LAjxlq8OSe2WJlCO1zUszHF_rfM4rweHufzbZ2ctX0v5mzHoioiBxj6e0KNToxxBA4oAV8zVtynSvz.xmf5wa.AmT5TRc29Wbkz9JR0rPHGeBcMZRD5oRQ8k", "g");
const HAIRSTYLE_SPAN_CN = new RegExp(`${__rmT("HO9UlgVvAKFqCGSp32ZEDb3zD_fJwz.kOrlptsDblDKnhCEmoj0p3D5pMXGpIVwYuzTjnUr2jQnmP5b9Fqk")}${HAIRSTYLE_TEXT.source})`, 'g');
function stripSceneSpans(part, kinds) {
    let body = String(part);
    for (const kind of kinds) {
        if (kind.name === 'clothing')
            body = body.replace(CLOTHING_SPAN_CN, '\u0001')
                .replace(__rmR("NclgjoJ_lubc_lgwVFu7TcJvgE6W7FJyXg2.LGMfdVpITDPrSWHjdaxRRNZlpXhIE0JJaf9xQOjV.1wSKuxAXxVh485X75pstpF8LSz2GHdP7IDB04WSiI0FFzv7F_lpNrFT7YDJLGZonJoPw.FLb8PhV526sGampqjsrvyWeUN6rDD8LnfmxspkB685LkS9FJG3IA7nCuV7gDoO6EfJnSkVxPBf3MCuUG8", "g"), '')
                .replace(/\u0001/g, '').replace(CLOTHING_WORDS_CN, '');
        if (kind.name === 'hairstyle')
            body = body.replace(HAIRSTYLE_SPAN_CN, '');
    }
    if (/[a-z]{3}/i.test(body)) {
        body = body.split(/,\s*|(?<=\.)\s*|\s+(?:and|with)\s+/i).map(piece => piece.trim()).filter(piece => {
            if (!piece)
                return false;
            const bare = piece.replace(/^(?:she|he|they|wears?|wearing|wore|dressed\s+in|in|a|an|the|her|his|their)\s+/gi, '').replace(/^(?:a|an|the|her|his|their)\s+/i, '');
            return !kinds.some(kind => kind.tag.test(bare));
        }).join(', ');
    }
    return body.trim().replace(__rmR("bmLzwxuMs7TvB2tfl.PkmYmJhdzPJ_xiEe1BvKWjiIwx01_.KP_", ""), '').replace(__rmR("Y1lGXumz65wxu47Tihk.146XqtbIThA3pa091mN6yXmt0UAzoSAnc50_L9YX2PYQwFw_IbSb5QzR0UuYexOaDhpbg9HX99C_H17QV41st56W04vtF7_buo5WfK34JRAgPpM6vIR32jTSJmby7u22ojL.Mxrww4nEfvc2QGTsNv54iiVweUnIk5a0NXq_t65SCEtLVfrSJWzL8edhApvFyi8k", ""), '').trim();
}
function withoutSceneText(text, kinds) {
    if (!kinds?.length)
        return String(text || '');
    const keepLooks = part => {
        const found = [...String(part).matchAll(HAIR_WORDS)].map(match => match[0]).concat([...String(part).matchAll(EYE_WORDS)].map(match => match[0]));
        if (!found.some(word => __rmR("pEiOV2wia.G", "").test(word)))
            found.push(...[...String(part).matchAll(__rmR("aCENF7tge2QDlIP2WSMsOq2tqi15WYuhL2UECHDRwEHHSmbGAaUqnDShKD6G8uPcKkLeOYUD", "g"))].map(match => match[0]));
        return found.join(__rmT("Yis"));
    };
    return String(text || '').split(__rmR("Le0ZJZa5fHOvwhN.pUxBGy0b4xb7uN6_T3aXwPyOcvqMEuivrUMUu7IBqjBEgGglXeryVStS4ZOk4ci.xsWAwKvMtdE4DP7iXQA", "")).map(part => {
        if (!kinds.some(kind => hasKindText(kind, part)))
            return part;
        const lead = __rmR("_m6OjAJxyFNjY6Eq", "").test(part) ? (part[0] === ',' ? ', ' : part[0]) : '';
        const tail = __rmR("AkYQsj0aUwYyjsrjT.vQlrUGMOZBU4CP", "").test(part) ? part.slice(-1) : '';
        const stripped = stripSceneSpans(part.replace(__rmR("_m6OjAJxyFNjY6Eq", ""), '').replace(__rmR("AkYQsj0aUwYyjsrjT.vQlrUGMOZBU4CP", ""), ''), kinds);
        if (!kinds.some(kind => hasKindText(kind, stripped)))
            return stripped && /[\p{L}\p{N}]/u.test(stripped) ? `${lead}${stripped}${tail}` : '';
        const looks = keepLooks(part);
        return looks ? `${lead}${looks}` : '';
    }).join('')
        .replace(__rmR("cfefTLmahbYyCyJWx.vRlrUGKxZBU4BP", ""), '').replace(__rmR("bIrn8PXWZqtdfRPgRFBpGjyHdCR3Mfv9mmyPIhOjUNeBrHZGPjxfKVjy", "g"), '$1').replace(__rmR("4wWLmhaSxf5N0i_Y9GycXvro8yTer02a2fM3GAoYh09rnh", "g"), '').trim();
}
function withoutSceneTags(tags, kinds) {
    const raw = String(tags || '');
    if (!kinds?.length || /[{}()[\]]/.test(raw))
        return raw;
    return raw.split(',').map(part => part.trim()).filter(part => part && !kinds.some(kind => kind.tag.test(part))).join(', ');
}
function mergeAppearance(library, modelText, tagsOnly, sceneKinds = []) {
    let base = tagsOnly ? String(library?.tag || '') : String(library?.nl || '');
    if (sceneKinds.length)
        base = tagsOnly ? withoutSceneTags(base, sceneKinds) : withoutSceneText(base, sceneKinds);
    if (!base.trim())
        return modelText;
    if (!modelText)
        return base.trim();
    if (tagsOnly)
        return mergeTagLists(base, modelText);
    return modelText.includes(base.trim()) ? modelText : `${base.trim()}; ${modelText}`;
}
const COLOR = __rmT("j.KzNZZRxvW8mKmJlhk3BojbjdPzOJr5ze4icxPvPy5.NgPFwkImJK4lhdPgpVmBNLWCalbj5cMP98DIProjcm9cCI4YpBLoE3CvWtbU_5exZVjVmP4eXSKNjOCsFkqTOgNjeDVmA5E4F_HQql3w.gzQWbtOMlusCtl_dStAIRkF5i.9LvHWPPwc_D_3eyn6v54CZYq7WRUtH00kbDQZ4lQhz4rc0w_ju7K19x0s7OobFTl5WKaXWIQokiR6czwm3HlYOKxjXNdWtDL8PFJaL1PQ4YT2m3H.OA6yMHu0bYT7R77nJLMtU6PY89jZ7ehliMl_B3ogpIQuETX4zC.vMSEV1R4tqvuO3lQ_VBDt5jYPNy6GwZ3z5A.tjxs8GUX2SQSBTFm0FWf3z.iO.UAivmegA8WBNG7Wk3L5FD_dp1fCFU4P0qn4VYUTnHUGorqjL8H9Qh");
const HAIR = `${__rmT("RMtRn6pBhiJVbXDAxvabuHyhzujdBQ0BWUdIDf")}${COLOR}${__rmT("Lw5pPIkKlGrScHVE6X4Dyi6Kz2N0E25t2hmEiyc9sTLuyIH1BNFnQuKHLhQJVDIHv1ht2ERM_Zeve2YVB7kcH7BD.bjxPdBnrCZVVQo0PXynZ5a2iCozyCSwOv1rsWlp4eWbXT")}${COLOR}${__rmT("EAdUWmCyjSWWMS0E1ikWfGUcrDPy4rdjkkBwGeHrdf0Kfvi18efX3f")}${COLOR})?`;
const EYE = `${COLOR}${__rmT("_P3CiijMEIcfoMb5qq.ES0OtyrMaM8AFc0D2_UUyOiomGRYP67NKXiTmR17i4Mf6zHZSe2umR1rg1VjDwkKY3tJK_ald7tEbqJA3R1_1MMyHUfHi7hBkN1J9PyYO02Nyrrq8jVTPRfbXHy5.lEh9edc6T8OkNuwhNYXgugVSMbHBdui968jQu2jbfwVq3Ai7")}${COLOR}${__rmT("Arbq8Erjz8xiRXR4ZFuHqrZHXYlQMLwC9wtbB1SGsbVTJwoGKWTvKpny")}${COLOR})?`;
const HAIR_WORDS = new RegExp(HAIR, 'g');
const EYE_WORDS = new RegExp(EYE, 'g');
const HAS_HAIR = new RegExp(HAIR);
const HAS_EYE = new RegExp(EYE);
const SKIN_COLOR_CN = __rmT("escOBoXPWt9WmiMwlynkEgzgNBssx8tV_AqpnUXCX17gt6f.N2EnffXeuJVxFXL02eXdyYjRFrPc7hIcnCCAaA5mrPFpqv6taEXgfwv_K1ALFpBCBN0r4lbvWirHYVGFfxYMJrRAcnhyR4yBXTvvXRcW0baJBZ75rfypfBpKzoChqAaDwCv5hCm.F5rVq2v7kQVD2KKApJoui_4NVjZpGjwI7FQHhupbzae15h");
const MODEL_SKIN_WORDS = new RegExp(`(?:${SKIN_COLOR_CN}${__rmT(".5XNPbcMaigNVb.LwtxTrKTVJNRg8pappH5z0PUjmPkFo5zcyY53J8HV9ESEz26Uuxu7oeciZfYrxV2HVZIpGQEY4J0QGxkUd3RLXS0.4umDwEWtPicJXRlWFJM0R3thxMiHSpPacZ9L3cesa8.955BPKq8_BXoD4KwB95otWbl1B86AF6FxBaSzfVTllytcX6JWZf")}${SKIN_COLOR_CN}${__rmT("hzdr_qyjcuuujYs5UJBe_J7T7P3Z1PjocDywAcyQA_TuA2D4aZakB6KODPG")}`, 'g');
const HAIR_REACH = __rmT("6mQLmzJ1Ypj99R70NNnFFSgDRjd0G8tJ8cSxC2AZjftWcQka.aegPVffJBYCEfEY");
const HAIR_NOT_AFTER = __rmT("ZqoOq79B1k1digKH71nuY29Ty3QbTzT50Gy6Ai40IlASWn_BqP72ngra5amILaKw2osbdLYK0DEbHBGdMnP8o0YH");
const HAIR_NOT_AFTER_LEN = __rmT("0nl.ef8o8kXwGj8V.i70kKagBuKVXr4b3ZeQXsWQh1OSfu.YH25jpc4T3kGVc3jIPhpSJ5A1GmeInh");
const MODEL_HAIRLEN_WORDS = new RegExp(`${__rmT(".HJuabYBB8NhAfRhccLuxoyX7us")}${HAIR_REACH}${__rmT("OBKCKDSjJ9Zrh6O47zpanoeB6FdRo6BBoOkS9RKm2m8IZL46fh9_l6m6MlpBy_hDsS4wtmXlZ6tHufudn0365G4ldtw8xIsg1E83RCpSI2YQdUzv2dIyszYUPowcLWGIzsqlhuc3IUj8ij5hA5j4ZkQR1b9FXLyDP78jxRsqAm1clSFqGSK1se1Yf8ZN8VdnEPmfHqNwIDLGE8zDj2_nqT")}${HAIR_NOT_AFTER_LEN}${__rmT("2Fspb94T_NwXqloQ82bPNXy4ul_7jNjiHAbxCB02lF89D1wROVxPv7qfTVIc_66KD1Q3XIoFoOmNIJiBbdRVjOlGUwfypuxMwCR7tfttSVry2s4IMoKyUyjfk9UnyOyGQJyfhDe6BNT")}${HAIR_NOT_AFTER}${__rmT(".3Y0aA26Rxxl2Aswt6FnESlx")}${HAIR_REACH}${__rmT("WWeaOLEp6Hk1eT")}${HAIR_REACH}${__rmT("90tpcujVAttvJ8C.KdvdYC0uCdnJSvZ93aGfLV.rO7napvf5w3qR75ofsdpv.kMxBWRMLcQWBKAcnh")}`, 'g');
const MODEL_BANGS_WORDS = __rmR("piMhOBd9qfJmeWbj5Usm1pX24dCfdRaX.FMqOikKrgb18AjSHVkHBY6dBAdSLYyvvOEzmHzJPEDftt3N", "g");
const EN_BANGS_WORDS = /(?:^|(?<=[^a-z]))(?:(?:(?:blunt|swept|side[-_\s]swept|straight|wispy|curtain|parted|long|short|thick|choppy|asymmetrical|hime[-_\s]cut)[-_\s]+)+(?:bangs|fringe)|bangs)(?![a-z])/gi;
const EN_HAIR_THING = '(?![a-z])(?![-_\\s]+(?:salon|day|dryer|tie|band|clip|brush|stylist|product|spray|pin|ornament|ribbon))';
const EN_HAIR_COLOR_WORDS = new RegExp(`(?:^|(?<=[^a-z]))(?<!and[-_\\s]+)${TAG_COLOR}[-_\\s]+(?=(?:[a-z]+[-_\\s]+){0,2}hair${EN_HAIR_THING})`, 'gi');
const EN_EYE_COLOR_WORDS = new RegExp(`(?:^|(?<=[^a-z]))(?<!and[-_\\s]+)${TAG_COLOR}[-_\\s]+(?!and\\b)(?=(?:[a-z]+[-_\\s]+){0,1}(?:eyes|pupils|irises)(?![a-z])(?![-_\\s]+of\\b))`, 'gi');
const EN_HAIRLEN_WORDS = new RegExp(`(?:^|(?<=[^a-z]))(?:(?:very|absurdly)[-_\\s]+)?(?:long|short|medium|shoulder[-_\\s]length|waist[-_\\s]length)(?:[-_\\s]+(?:straight|wavy|curly))?(?=[-_\\s]+(?:[a-z]+[-_\\s]+)?hair${EN_HAIR_THING})`, 'gi');
const MODEL_MARK_WORDS = __rmR("5V_VUZxF_E4.CyGlCgkJYCMQWZZAre.qr_k6dqW4BgRQV0kdtbpHkFSRNmSHymCQZGh4I_sqX3sYukHdFXYgeyqCdBzuHtejL9l.QbYyrLRefWfkue7IkhfnZ07Bt2hmQ3hmLp5Wp8HBSIh43H.31ox_M_o5hA8J5UIeAaMyix0vTZpSBfpsX.vZ8bxOx3nbTaz3plRpQw64cdySZhG6YIKPKJztismKzI9z6Kdeg5.5fLcy88wGB2BS53cpgFjusFLXN88IcpI85awXwP1qWDetU6OBs9rARvxAUx4MRLuooNRfpBZ0M0GCdk_3l043rKFi0ZvDJj0FQscN2PHdY8MmGijpeSy2JVaUzXcfQPMLlNM2z3KS9LH69.ujdpqmpfTL7TWS3eTZzVkHuzs1CmXWPkdCUT3tw9iJn9jiUqqaHSnyTch5hfBDa2hW.itYpwp", "g");
const MODEL_SKIN_TAG_WORDS = /\b(?:very\s+)?(?:pale|fair|dark|tan|tanned|white|light|olive|brown|black)[-_\s]+skin(?:ned)?\b[-_\s]*/i;
const MODEL_MARK_TAG = /\b(?:mole|moles|beauty\s+mark|freckles?|birthmark)\b/i;
function stripHairColor(text) {
    return String(text || '').replace(HAIR_WORDS, match => {
        if (__rmR("GDl0hTmF", "").test(match))
            return '';
        const rest = match.replace(new RegExp(`${__rmT("zmWvk7MSm0v1TtOR9GycXvNoKMgr.JUmNf6HGTZY059fnh")}${COLOR}${__rmT("vJm6yT")}`), '');
        return __rmR("T.eqacMS6qkZLAswJgMK8nAx", "").test(rest) ? '' : rest;
    });
}
function stripFieldWords(text, set, name = '') {
    let rest = String(text || '');
    if (set.has('gender')) {
        for (const span of explicitGenderStatements(rest, name).filter(span => span.kind === 'identity').reverse()) {
            rest = rest.slice(0, span.start) + rest.slice(span.end);
        }
    }
    if (set.has('hair'))
        rest = stripHairColor(rest).replace(EN_HAIR_COLOR_WORDS, '');
    if (set.has('eye'))
        rest = rest.replace(EN_EYE_COLOR_WORDS, '');
    if (set.has('hairlen'))
        rest = rest.replace(MODEL_HAIRLEN_WORDS, (match, at, whole) => (__rmR("WBPhyT", "").test(match) && !set.has('hair') && __rmR("WtD2bECuFaIEwjWvdAe_4vM8nHwjHqNacWYDdJLbvIwd4p.yDafO7OMnKgFJlfBY", "").test(whole.slice(0, at)) ? __rmT("0Al") : ''));
    if (set.has('bangs'))
        rest = rest.replace(MODEL_BANGS_WORDS, '').replace(EN_BANGS_WORDS, '');
    if (set.has('hairlen'))
        rest = rest.replace(EN_HAIRLEN_WORDS, '');
    if (set.has('eye'))
        rest = rest.replace(EYE_WORDS, '');
    if (set.has('skin'))
        rest = rest.replace(MODEL_SKIN_WORDS, '');
    if (set.has('mark'))
        rest = rest.replace(MODEL_MARK_WORDS, '');
    return rest;
}
function stripModelLooks(person, fields) {
    const set = fields instanceof Set ? fields : new Set(Object.entries(fields || {}).filter(([, on]) => on).map(([name]) => name));
    if (!set.size)
        return;
    const rest = stripFieldWords(person.text, set, person.name).replace(/[ \t]{2,}/g, ' ')
        .replace(/\b(?:and|with)\s*(?=[,.;]|$)/gi, '').replace(/(^|[,.;]\s*)(?:and|with)\b\s*/gi, '$1').replace(/\s+([,.;])/g, '$1').trim();
    person.text = rest.replace(__rmR("tN_BY9VXeKhoJUMnV20K_BTojMOi.yL1H2e1.Vgb9lh", "g"), '$1').replace(__rmR("6mDvmI78.ON2rbe0p4weuvqDnXBSDs4JVk.4p_q..Gxtuy8rmke4g1YfWKB5lfEY", "g"), '').replace(__rmR("cfefTLmahbYyCyJWx.vRlrUGKxZBU4BP", ""), '').trim();
    if (set.has('gender') && person.modelTag)
        person.modelTag = String(person.modelTag).split(',')
            .filter(tag => !tagTraits(tag.trim()).includes('gender')).map(tag => tag.trim()).filter(Boolean).join(', ');
    const tags = String(person.modelTag || '');
    if (tags && !/[{}()[\]]/.test(tags)) {
        const claimed = new Set([set.has('hair') && 'hair-color', set.has('eye') && 'eye-color', set.has('hairlen') && 'hair-length', set.has('bangs') && 'bangs'].filter(Boolean));
        person.modelTag = tags.split(',').map(tag => withoutClaimedLooks(tag.trim(), claimed))
            .map(tag => (set.has('skin') ? tag.replace(MODEL_SKIN_TAG_WORDS, '').trim() : tag))
            .filter(tag => tag && !/^skin[-_\s]+tone$/i.test(tag) && !(set.has('mark') && MODEL_MARK_TAG.test(tag))
            && !(set.has('bangs') && isBangsTag(tag))).join(', ');
    }
}
function tagHasLooks(tags) {
    const parts = String(tags || '').split(',').map(part => part.trim()).filter(Boolean);
    return { hair: parts.some(part => tagTraits(part, true).includes('hair-color')), eye: parts.some(part => tagTraits(part, true).includes('eye-color')) };
}
const LOOK_FIELDS = ['gender', 'hair', 'hairlen', 'bangs', 'eye', 'skin', 'mark', 'build', 'face'];
const HAIR_COLOR_EN = new RegExp(`\\b${TAG_COLOR}[-\\s_]+(?:[a-z]+[-\\s_]+)?hair\\b`, 'i');
const LOOK_FIELD_TESTS = [
    ['gender', (text, name) => isExplicitGenderStatement(text, name) || tagTraits(String(text).trim(), true).includes('gender')],
    ['hair', text => HAS_HAIR.test(text) || HAIR_COLOR_EN.test(text)],
    ['hairlen', text => __rmR("B8z9rmMaOHRgIZyDLyviE5MwhP6d3PUPCCIBP_hlkVMDTBw26fjXvmxUrEyg5CYv1Fx7U181TmfnekbzV6OYdjL9x.RpukVjZPb0Lg0s8AOizwS2_ypgxWIDoGrYK1EOOXR9K_tQWscV_MFbynQHzroAkx1KiBijTSq9FZGmGwmC5eEhXAegpGy7uRJalOR0dXNF1deqxTcllI8iIzD5lcrafjId4q6SYztUGObkNVQCSpj902xVm9i6mfIdTTOR4ExqVZE2DwScb51vEyDNzWJqDygthCu5PNhP4ns3GPK3B3D7Yxcru6vxJh_", "i").test(text)],
    ['bangs', text => __rmR("GAzqIXnO2D6TR5LRYx7vGNT4Gc5xRmtCuBZKQopQAMd_n0kgVr25ZaWeL8xJeT", "i").test(text)],
    ['eye', text => HAS_EYE.test(text) || /\b[a-z-]+\s+(?:eyes|pupils|irises)\b|\bheterochromia\b/i.test(text) || __rmR("rAdNPoKMauL6BSChQkEA2zvVtU70iKBp1I6nXuYlM2kwovJc94H49KC0LCOkq26UX3hJXA.iZfYrxV2HBYudGJaUjJS4xqbN6BRqXOJXysaBw97BM6RpoS38TMFWtcMRHMVDwq98.0zq3TsQg.n1YYDMd9ZxsCv7BstYaFKKt13N3tDVS5_HOSxldvfPrFbU06JCZf", "").test(text)],
    ['skin', text => __rmR("LZSCKfHTC8UtJ1hO54Fsci2_EsgNYC_G4sB5dtpAwRPjlr2DYrcLwxlnhXpuig_JCjkwL135nMlK37njKCdLzTq8dOoDz_CvXzWG2yeJ0oktEtPAMy4QZU7DkZLga.kAcCerbGuZ9dadOrN_PJqJPfCcf5_6tt1RHrGbDEIbFDhHX2UiqFaSO5ttaTEjoyN9i6HuFtTNdmA", "i").test(text)],
    ['mark', text => __rmR("dTuPXfrq9aYQPQGeih4BmJpnqt_g8U4apaS0pAVQyXmP0MncoSce0S2_fK3K2OR_st4tIbn77w4B0hKY47hEDUhby.IZqbl_9qn3d0Jrl48wkOq8Mxb1IFyffKbyGtxsHpMBCnT9bWT5ZlJkwKSronL.HO15wrtEVzAzoluStv54iPht14g_k5wKMB0utFysIJNIVL5EumJB8Z0FAp5Ny9hk", "i").test(text)],
    ['build', text => __rmR("rzwjArNztbr9Xwx8uEdb0cdzyssaZPU5s5m0yHRlMqj965qe0K0Hl9kjiNFfqx9yTw8aM3nONdPPqrNuMCiGx7I5nLCdHTncV_W7XUfd5I4A7cdSbUgrcIxhFyahQ_lVabXYJvSfVXB611sOjsHzEq8Cd_vYsAvMmrBUCSSOpAB9wsqZLLDdF1lvx2R1urMEJapu.QJD5V4bSRFq6mtZ8CcQU315xhRLnjYH_YxD1iTYIrV5DitMvYpnyJYmDinwl7iRSfvmqp.XKKvIKQE", "i").test(text)],
    ['face', text => __rmR("af92Y2hiZFkV8XCzc7VQ2KKNYoj56Lk3F92hWpPtuVVbjn5m_xIYxTjL0tnDVQl.1Ffz6GMMvehdArAMXKsAkTXzbtZh34NRZx3yErVSTYDcU7LlFnbVM6Y31AueqEh9xAOlr00FpkYTV5HJnIwlVStDQGT7ZoFSuY4uTDEjg2V1MLNeqL4aGfUFXZtlF5yRMusFCUptebe2VaA9uRCY4wbchlpuVIE7Zy9qiOeDe9148C2nrNT224Zvh2lkMf", "i").test(text)],
];
const lookFieldsOf = (clause, name = '') => LOOK_FIELD_TESTS.filter(([, test]) => test(String(clause || ''), name)).map(([field]) => field);
const splitLookClauses = text => String(text || '').split(__rmR("y1_Ej_gLmD9KlP81RTlBkIl32cmTnkxr0Evk0hREJu1DmxVi3.RYgb2ZOhKdlkEyiuXIFT99Xm27csOLHc9NkYlH", "")).map(part => part.trim()).filter(part => /[\p{L}\p{N}]/u.test(part));
function lookFieldsOfText(text, name = '') {
    const fields = new Set();
    for (const clause of splitLookClauses(text)) {
        const found = lookFieldsOf(clause, name);
        found.forEach(field => fields.add(field));
    }
    return fields;
}
const looksComplete = person => LOOK_FIELDS.every(field => (person?.looksFields || []).includes(field));
function fillLooksFrom(person, looks, label) {
    const covered = new Set(person.looksFields || []);
    const ownGender = !covered.has('gender') && isExplicitGenderStatement(looks, person.name);
    const added = new Set();
    const keep = [];
    for (const clause of splitLookClauses(looks)) {
        const found = lookFieldsOf(clause, person.name);
        const birthContext = ownGender && explicitGenderStatements(clause, person.name).some(span => span.kind === 'birth');
        const fresh = found.filter(field => !covered.has(field));
        if (!fresh.length && !birthContext && !(found.length === 0 && SCENE_KINDS.some(kind => hasKindText(kind, clause)) && !covered.has('clothing')))
            continue;
        let piece = clause;
        piece = stripFieldWords(piece, new Set(found.filter(field => covered.has(field))), person.name);
        piece = piece.replace(__rmR("TQgKaY.i25o8Sz.f.VjzxBrXeQs", ""), '').trim();
        if (!piece)
            continue;
        keep.push(piece);
        fresh.forEach(field => added.add(field));
        if (!found.length && !fresh.length && !birthContext)
            added.add('clothing');
    }
    if (!keep.length || ![...added].some(field => field !== 'clothing'))
        return false;
    stripModelLooks(person, added);
    const ownLooks = withoutSceneText(keep.join(__rmT("Yis")), personSceneKinds(person));
    if (ownLooks)
        person.text = [ownLooks, person.text].filter(Boolean).join(' ');
    person.text = String(person.text || '').replace(__rmR("aC.6FejgQPQck4EC2qqRXZwtCBVU1Luh8y9BpE_RQYL5zmnG4IKpE8ahvP6i8_Fh7jJ6O2D2", "g"), '$1').replace(/\s{2,}/g, ' ').trim();
    person.looksFields = [...new Set([...covered, ...added])];
    const labels = String(person.looksSource || '').split(__rmT("eos")).filter(Boolean);
    if (!labels.includes(label))
        labels.push(label);
    person.looksSource = labels.join(__rmT("eos"));
    return true;
}
function newPersonFromLooks(name, looks, label, tagsOnly = false) {
    const person = { name, text: '', modelTag: '', looksFields: [] };
    return (tagsOnly ? fillTagLooksFrom : fillLooksFrom)(person, looks, label) ? person : null;
}
const LOOK_COLOR_TAGS = [
    [__rmT("z27R7T"), 'light pink'], [__rmT("P27R7T"), 'light pink'], [__rmT("z2fuwT"), 'light blue'], [__rmT("w2fuwT"), 'dark blue'],
    [__rmT("iCaAZT"), 'silver grey'], [__rmT("tJCuwT"), 'grey blue'], [__rmT("FDp67f"), 'dark green'], [__rmT("z2f67f"), 'light green'],
    [__rmT("NNApZk"), 'amber'], [__rmT("cH3mHf"), 'flaxen'], [__rmT("N9hZ7T"), 'caramel'], [__rmT("nU6Bwk"), 'honey'], [__rmT("9tGmi8DV"), 'emerald'],
    [__rmT("nhN7L4n8"), 'lavender'], [__rmT("FM9AnT"), 'rose'], [__rmT("Zjh"), 'chestnut'], [__rmT("kQ_eHf"), 'black'], [__rmT("HCXFnf"), 'white'],
    [__rmT("088"), 'black'], [__rmT("DaB"), 'white'], [__rmT("9Df"), 'silver'], [__rmT("08p"), 'blonde'], [__rmT("mr8"), 'red'], [__rmT("Sqh"), 'brown'],
    [__rmT("gdk"), 'grey'], [__rmT("3LA"), 'purple'], [__rmT("hFf"), 'blue'], [__rmT("caT"), 'pink'], [__rmT("GL8"), 'green'], [__rmT("nHC"), 'brown'],
    [__rmT("yHA"), 'red'], [__rmT("XLh"), 'green'], [__rmT("dG8"), 'yellow'], [__rmT("IqG"), 'orange'], [__rmT("wds"), 'emerald'],
];
function appearanceTagFacts(looks, name) {
    const facts = [];
    const add = (field, tag) => { if (tag && !facts.some(item => item.field === field && item.tag === tag))
        facts.push({ field, tag }); };
    const colors = value => {
        let rest = String(value), result = [];
        for (const [word, tag] of LOOK_COLOR_TAGS)
            if (rest.includes(word)) {
                result.push(tag);
                rest = rest.split(word).join('');
            }
        return [...new Set(result)];
    };
    for (const clause of splitLookClauses(looks)) {
        if (__rmR("GTN0Zzu7pGwMYot2toXqSUaBcSb6OrwydBoNjJUkNXGDbRhnOjbdVsYHZtT2iVWhUbhSseUTPKWzbXihg2NQhcH4xEk01b5CbTgZB0M5KCVIJMj5r1vUO4cY28_tHxQrOE6CBoBmA3nTfQ68.kg4PGeGjwU7E7q95Op", "i").test(clause))
            continue;
        for (const span of explicitGenderStatements(clause, name).filter(span => span.kind === 'identity')) {
            const identity = clause.slice(span.start, span.end);
            const gender = __rmR(".AeC4MLwB6hswQFP3RKb4cndOfjUNjBgApZ6lvqpL2NJPcUy", "i").test(identity) ? 'nonbinary'
                : __rmR("5lcxllF4R7QyBh1GZ2OgJDLrX3yaJk", "i").test(identity) ? 'agender' : __rmR("lE3.kQTnHDHic7Ln_BS7fbtOkNOI.J91U2eI.I1bZg8", "i").test(identity) ? 'genderfluid'
                    : __rmR("wHQ_JxF4Ii__kua3J5fdbwXQgP0q01KK0Li8tSzS9dLhy4GRnyxZu0MgDEYBmEuhTN0PIXNFEvm2BiH3X68dnq1v8Q_9CNPHlTFpAt_QEalF8Zr91P3pJIXd5sexA5I4dv9xl7W78jk76i5XYHHOC5Fd", "i").test(identity) ? 'female'
                        : __rmR("_oHb1wnTo3F8CGNQ0_QnPigciUtm54afeYX9EKXdvj9r49a5vRes7re1lT0Gzaz_7Ihao5m7NU12OPjIVIBfjd_Gvmf_pe_lXpRg2O6tZhM_tQjIe2T1UgnfjMW0YhzGRbjVhykSbMT", "i").test(identity) ? 'male' : '';
            add('gender', __rmR("3VO8iAPT9jIZkOfw3P8zEdGx", "i").test(identity) && /^(?:male|female)$/.test(gender) ? `transgender ${gender}` : gender);
        }
        let bare = clause.replace(/_/g, ' ').trim();
        bare = bare.replace(/^(?:hair|hair colou?r)\s*:\s*(.+)$/i, '$1 hair').replace(/^(?:eyes?|eye colou?r)\s*:\s*(.+)$/i, '$1 eyes');
        const tagFields = { gender: 'gender', 'hair-color': 'hair', 'hair-length': 'hairlen', 'eye-color': 'eye', bangs: 'bangs' };
        for (const trait of tagTraits(bare))
            add(tagFields[trait], bare);
        for (const part of clause.match(new RegExp(`${HAIR}${__rmT("ERxFM2Gy.j9Ol3rmjo4lpNFcnBPQNS9j_UQsxaCLSCNXfAwnKcf63f")}${COLOR}`, 'g')) || [])
            for (const color of colors(part))
                add('hair', `${color} hair`);
        for (const part of clause.match(EYE_WORDS) || [])
            for (const color of colors(part))
                add('eye', `${color === 'blonde' ? 'gold' : color} eyes`);
        for (const match of bare.matchAll(new RegExp(`\\b(${TAG_COLOR})\\s+(?:(?:long|short|straight|curly|wavy)\\s+){0,2}(hair|eyes|pupils|irises)\\b`, 'gi')))
            add(match[2].toLowerCase() === 'hair' ? 'hair' : 'eye', `${match[1].toLowerCase()} ${match[2].toLowerCase() === 'hair' ? 'hair' : 'eyes'}`);
        for (const [pattern, tag] of [[__rmR("OoPA1TR_qSDXb7wxZQJq9jAAHepVQhBDN.XDPUy21kadJVy2K7BGkSVi5sOWlU1oloLyJ0cDYEXbQ.zChiF6bgIu6WALdoNu0Npz.B8AFrvuPQ5otnNX4I_L8MIRXfrP55WEh2.twqlI7wA_DbC", "i"), 'long hair'],
            [__rmR("P.vS4xWc3ft6RxuYHwKSReRTUojWaVQbhsVHez.97za2WU91On7hZa9byZG8i6uEFexJQf5W6FY3XGhhEabxcjD3iq2_8icbca4cKzEfBECx5FqZ99CvXkSVh.k", "i"), 'short hair'],
            [__rmR("u5qar7AlCRtX0eJBw5yzHZAnGk9_VQLrMR82eAXxxMYW5Y1vHmVU16uuzFn.h_SYffguYSKj6bt3fD_REgDPVxWlzIrwNbAbqGDpsa_At56uKCwR.vqaIzN6KYiFOYCWo8A", "i"), 'shoulder-length hair'],
            [__rmR("LAjxlq8O.P7oGVOLe9p4b7B9xn9th8IHjkzvZ_LTH45n5pVix7ngxebeqRNmoTHB.4oMVKoVIrU.f1xxgDnYPupmV6ZYL6iWDp6puwMDxtCDBxqcIw.M2XUm", "i"), 'straight hair'],
            [__rmR("u5qar7AlwKCP4_twjrkYQZuk..B3UDyrFKMvtTyxhmlM5Y4vJ9Q618Uu1QnEh_vYeTJpYWxjEmtCfDBRTgQNVA6lbO19NolbhDQtsvpAJ06uKCwR.vqaIzN6KYiFOYCWo8A", "i"), 'curly hair']])
            if (pattern.test(`${clause}\n${bare}`))
                add('hairlen', tag);
        for (const [pattern, tag] of [[__rmR("PO59hhGL", ""), 'blunt bangs'], [__rmR("Bi29hhGL", ""), 'swept bangs'], [__rmR("l61J6p6gsg_", ""), 'wispy bangs'], [__rmR("uDjBAC6gsg_", ""), 'parted bangs']])
            if (pattern.test(clause))
                add('bangs', tag);
        if (__rmR("B8_96Qoh46FRAJvVFndEigMx5PC5i9I.brlfgbSI9s62u4nu_pgYS9XZXy18UZ1_YjrF152xZJXb.wFRzixwinI_fY9poYEV3ydTgv3B5RjwpSyWYuUGEDF49pjE6LsD7QmA0A3rQ7XOiaj.RErl4xWZejH2lWE8FvspLy7OjGPuWaMP2mG", "").test(clause))
            add('skin', 'pale skin');
        if (__rmR("LAjxlq8OVgm5tHTOYNV1b3Q_yrWkhMVHVh4XZBiTopGLnV7igHf17emeYV2vX7UBU4bOVsyVBddARwtxoBf0gfLm76fza6fUeYMuu9MDWtUVBAbczbw6sePO", "").test(clause))
            add('skin', 'dark skin');
        if (__rmR("OoPA1TR_PiiT8c0xUErbZvhAmkQjQhCDU851PwmDZFOnoxCNQaz8a8TKS7i5lTnoMLLh91uDfEmBQGrCqX6KzSwu91qrrnpua91MRBiaFdvoPQ5otnNX4IBL8MkFXYaPq0dgqj579WyjVjaDNwC", "").test(clause))
            add('skin', 'tan skin');
        const skin = bare.match(MODEL_SKIN_TAG_WORDS);
        if (skin)
            add('skin', skin[0].trim());
    }
    return facts;
}
function fillTagLooksFrom(person, looks, label) {
    const covered = new Set(person.looksFields || []);
    const facts = appearanceTagFacts(looks, person.name).filter(item => item.field && !covered.has(item.field));
    if (!facts.length)
        return false;
    const fields = new Set(facts.map(item => item.field));
    const tags = [...new Set(facts.map(item => item.tag))].join(', ');
    const model = { ...person, text: '', modelTag: person.text };
    stripModelLooks(model, fields);
    stripModelLooks(person, fields);
    person.text = mergeTagLists(tags, model.modelTag);
    person.modelTag = mergeTagLists(tags, person.modelTag);
    person.looksFields = [...new Set([...covered, ...fields])];
    person.looksSource = [...new Set([...String(person.looksSource || '').split(__rmT("eos")).filter(Boolean), label])].join(__rmT("eos"));
    return true;
}
function reconcileSceneAppearance(value, people, tagsOnly = false) {
    let scene = String(value || '');
    if (!scene.trim())
        return scene;
    const known = people.filter(person => person.looksFields?.length && person.name);
    if (!known.length)
        return scene;
    if (tagsOnly && people.length === 1 && !/[\u3400-\u9fff]/.test(scene)) {
        const counts = [...scene.matchAll(/\b(\d+)\s*(?:boys?|girls?|others?|people|persons?)\b/gi)];
        if (counts.reduce((sum, item) => sum + Number(item[1]), 0) > 1)
            return scene;
        const copy = { ...known[0], text: '', modelTag: scene };
        stripModelLooks(copy, new Set(known[0].looksFields));
        return copy.modelTag || 'solo';
    }
    const names = [...new Set(people.map(person => person.name).filter(Boolean))].sort((a, b) => b.length - a.length);
    const escape = name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const namePattern = new RegExp(names.map(escape).join('|'), 'g');
    const hits = [...scene.matchAll(namePattern)].filter(hit => {
        const before = scene[hit.index - 1] || '', after = scene[hit.index + hit[0].length] || '';
        if (/[\u3400-\u9fff]/.test(hit[0][0]) && /[\u3400-\u9fff]/.test(before) && !__rmR("E.QCVoSTcoiRlbAmR2CXfNzB.VVIlERHrssFBDQRvlXC81cy", "").test(before))
            return false;
        if (/[\u3400-\u9fff]/.test(hit[0].at(-1)) && /[\u3400-\u9fff]/.test(after)
            && !__rmR("pftR7IMtrYv7Ye.SRXUeo9i2EvVODM6ie02KjJJaNRBSaH5Z4DZw843E6xtem1vqkaLPy138gT4bipThNW7ztTygUaQyCm.KWarXS.RH03T_O8kv4AUWVxAHe1V9pZogITM9PQ.X1fOdB1ne5eTm7xFq4qBPy03JTNBizQMXTFlip7nO9EjFK0a6CHC4oRfikWXj4_gcbF8HIK2gDm.CEOzgNUVjAjq_Ax6_vLnLsXVwFt4FqJCh9bHQFx7r3V70lNOV_h", "").test(scene.slice(hit.index + hit[0].length)))
            return false;
        return !(/[A-Za-z0-9]/.test(hit[0][0]) && /[A-Za-z0-9]/.test(before))
            && !(/[A-Za-z0-9]/.test(hit[0].at(-1)) && /[A-Za-z0-9]/.test(after));
    });
    for (let i = hits.length - 1; i >= 0; i--) {
        const hit = hits[i], person = known.find(item => item.name === hit[0]);
        if (!person)
            continue;
        const start = hit.index + hit[0].length;
        let end = i + 1 < hits.length ? hits[i + 1].index : scene.length;
        const body = scene.slice(start, end);
        const stop = body.search(__rmR("PCls0gaCR.mytx9BbHRRaIbQtC7MZsVDVpSgNdsLr9_9Igo4GFIlgVwG_0dZKNeAxORqZEmKxllpMeCqkjaaSGM2IvPWz_6ymG51AbOrf0MFJ1uc_aSIhlNq9DSWTfRGp6viKxgKyVPoNF8RVy8XEfxh3wekHATORsNTLnK8e2pTPI4X_b5nism2lOy.T49OMEw5bEx.Z2eefxnp7GUOvJVf40wG8LL3DrVgoz2rD3IUn69Gl5e1cKo0zsZPN1jdQNvmT4aI77c2k.iN60bbSutR434sjbn9hara4frYt7GFIz_U8Vx5uOSqekkZR0e_Cz2nd4_nghVdXCfYhMMu0Vbwuu16RJJEWFviXdSQI_zQoHpsqd5mapPUui83s8QXCE__3HYpEKfjcLKXan7xvFF7zwBaftibZjDftIQCkGjZA0uQjD_3zhV9qXO7kO_PTp3RD_Q9gQk94Ur_.xkqboEhtG_SXl0TINR.vzOAfjq4VgVSOP1TD4E5r6Sk2BCGAcOaZPnWhhvWJxOqzJICKs_0DuPwJ.O5UL4uEsCLYGBHOSiiUbChg1RN3YBhgyHDJUf", "i"));
        if (stop >= 0)
            end = start + stop;
        let lead = scene.slice(start, end);
        if (!lead || __rmR("DgsIF6JfZUGOLaIL36u1B18L.hWOXKfnhmPoqsf1WeFLAyBnnAOiG2IaQq1PcqIBcVqFhXB0.har7pc6ovePGLUloBptZWimGuuV88NBPakkuftMEEbtIY8M3Xo8SSY9MZCcu2Xlkt5msco924UoXuabI6VDBILrL1LcdkdNGM7keRXqFSVdw1YkPHM8uh", "i").test(lead))
            continue;
        const fields = new Set(person.looksFields);
        if (fields.has('hair'))
            lead = lead.replace(/\b(?:blonde?|brunette|redhead)\b/gi, '');
        if (fields.has('hairlen'))
            lead = lead.replace(/\b(?:long|short|medium)[-_ ]haired\b/gi, '');
        if (fields.has('eye'))
            lead = lead.replace(new RegExp(`\\b${TAG_COLOR}[-_ ]eyed\\b`, 'gi'), '');
        lead = stripFieldWords(lead, fields, person.name);
        if (fields.has('gender'))
            lead = lead.replace(__rmR("qEVCiGnMG4VxnIaRA6_LMW.tQxE5H_EFVO5cuxHy5ugj0tUTGYX7GNxDbUKdYo7lD6X.4tBDE1yo7xLmFcBzgm9KerldAbIh9.nTwoRxKm5kT.Cf9D6Mlb6rmFDWXG9yjLaAjVTP_kohHg0._PsrDjF6Cwsu1GWhH0SKtm3SitG2d_N99ot1uoy7VmV0DTz7", "gi"), '');
        lead = lead.replace(__rmR("sPoimH.ze6YXbQjRtvQA9la.7dDQX_ZGvAs2DUmZZU3NC99PBVEXjFGyqGXphAIveV863WiePAKz_lr3OaBZJh", "g"), '')
            .replace(/\b(?:is\s+)?an?\s*(?=with\b|[,;]|$)/g, '')
            .replace(__rmR("_6RsYOIxTvN7seyWvSNQOt_eoHbfJRdz_Mf8KJBUpejejZC6H8CloW4Gich90fSaggcm7h", "g"), '$1')
            .replace(/[ \t]{2,}/g, ' ').replace(__rmR("zbjxwvLVFxvqQFgfeCiYmbvoxr4Xu6v7eTJUXmyQ.xi8TW_.KP_", "g"), '$1');
        scene = scene.slice(0, start) + lead + scene.slice(end);
    }
    return scene;
}
function frameCastNames(frame) {
    return [...new Set([...(frame?.querySelectorAll?.('[data-rm-draw-char]') || [])]
            .map(node => String(node.getAttribute('data-rm-draw-char') || '').replace(/\s+/g, ' ').trim().slice(0, 40)).filter(Boolean))].slice(0, 4);
}
async function withCardAppearance(people, frame, tagsOnly) {
    const names = frameCastNames(frame);
    const pending = names.filter(name => !looksComplete(people.find(person => person.name === name)));
    if (!pending.length)
        return people;
    let cast = '';
    let charName = '', personaName = '';
    try {
        const ctx = getContext();
        const char = ctx?.characters?.[ctx?.characterId] || ctx?.character || {};
        const data = char?.data && typeof char.data === 'object' ? char.data : char;
        charName = String(char?.name || data?.name || ctx?.name2 || '').trim();
        personaName = String(ctx?.name1 || globalThis.name1 || '').trim();
        const fill = value => String(value || '').replace(/\{\{\s*char\s*\}\}/gi, charName || '').replace(/\{\{\s*user\s*\}\}/gi, personaName || '');
        const rows = [];
        const charText = fill([data?.description || char?.description || '', data?.personality || char?.personality || ''].map(value => String(value || '')).join('\n')).trim();
        if (charName && charText)
            rows.push({ book: __rmT("gk9kYOTG"), title: charName, content: charText.slice(0, 12000) });
        const personaText = fill(ctx?.powerUserSettings?.persona_description || globalThis.power_user?.persona_description || ctx?.personaDescription || '').trim();
        if (personaName && personaText)
            rows.push({ book: 'Persona', title: personaName, content: personaText.slice(0, 12000) });
        cast = rows.map(row => JSON.stringify(row)).join('\n');
    }
    catch {
        cast = '';
    }
    if (!cast)
        return people;
    const { appearanceFromCast } = await import('./characterWorldBook.js?rmv=2.5.2');
    const merged = people.map(person => ({ ...person }));
    const others = [...new Set([...names, charName, personaName].filter(Boolean))];
    for (const name of pending) {
        const looks = appearanceFromCast(cast, name, others);
        if (!looks)
            continue;
        const person = merged.find(item => item.name === name);
        if (!person) {
            const fresh = merged.length < 4 && newPersonFromLooks(name, looks, __rmT("KH3MEk"), tagsOnly);
            if (fresh)
                merged.push(fresh);
            continue;
        }
        (tagsOnly ? fillTagLooksFrom : fillLooksFrom)(person, looks, __rmT("KH3MEk"));
    }
    return merged;
}
const MYRIAD_LOOK_FIELDS = ['hair', 'eyes', 'face', 'build', 'height', 'distinctiveFeatures', 'clothingStyle', 'appearance'];
export function myriadPeopleLooks() {
    const bridge = globalThis.qqj_v3_public_bridge_v1;
    if (!bridge || typeof bridge.getPeopleSnapshot !== 'function')
        return [];
    let snapshot;
    try {
        snapshot = bridge.getPeopleSnapshot();
    }
    catch {
        return [];
    }
    if (snapshot?.status !== 'ready' && snapshot?.people?.status !== 'ready')
        return [];
    const hostChatId = String(snapshot?.identity?.hostChatId ?? snapshot?.people?.identity?.hostChatId ?? '');
    if (hostChatId) {
        let current = '';
        try {
            const ctx = getContext();
            current = String(ctx?.getCurrentChatId?.() ?? ctx?.chatId ?? '');
        }
        catch {
            current = '';
        }
        if (hostChatId !== current)
            return [];
    }
    const items = Array.isArray(snapshot?.people?.items) ? snapshot.people.items : [];
    return items.map(item => {
        const profile = item?.profile && typeof item.profile === 'object' ? item.profile : {};
        const name = String(profile.name || item?.displayName || item?.entityDisplayName || '').trim();
        const aliases = [...new Set([...(Array.isArray(item?.aliases) ? item.aliases : []), ...String(profile.aliases || '').split(__rmR("xKeoMAaSaBs3kWqfZ68zECfx", ""))]
                .map(alias => String(alias || '').trim()).filter(alias => alias && alias !== name))];
        const looks = MYRIAD_LOOK_FIELDS.map(key => String(profile[key] || '').replace(/\s+/g, ' ').trim()).filter(Boolean).join(__rmT("Yis")).slice(0, 600);
        return { name, aliases, looks };
    }).filter(person => person.name && person.looks);
}
function myriadEntryFor(list, name) {
    const exact = list.filter(person => person.name === name || person.aliases.includes(name));
    if (exact.length === 1)
        return exact[0];
    if (exact.length > 1)
        return null;
    const loose = list.filter(person => [person.name, ...person.aliases].some(key => looseNameMatch(name, key)));
    return loose.length === 1 ? loose[0] : null;
}
async function withMyriadAppearance(people, frame, tagsOnly) {
    const names = frameCastNames(frame);
    const pending = names.filter(name => !looksComplete(people.find(person => person.name === name)));
    if (!pending.length)
        return people;
    const list = myriadPeopleLooks();
    if (!list.length)
        return people;
    const merged = people.map(person => ({ ...person }));
    for (const name of pending) {
        const entry = myriadEntryFor(list, name);
        if (!entry)
            continue;
        const person = merged.find(item => item.name === name);
        if (!person) {
            const fresh = merged.length < 4 && newPersonFromLooks(name, entry.looks, __rmT("w3zxhM8V"), tagsOnly);
            if (fresh)
                merged.push(fresh);
            continue;
        }
        (tagsOnly ? fillTagLooksFrom : fillLooksFrom)(person, entry.looks, __rmT("w3zxhM8V"));
    }
    return merged;
}
const worldCastCache = new Map();
function readWorldCast(names) {
    const ctx = getContext();
    const character = ctx?.characters?.[ctx?.characterId];
    const disabled = getSettings().independentWorldInfoDisabledBooks || [];
    const key = JSON.stringify([ctx?.characterId ?? '', character?.avatar || character?.name || '', character?.data?.extensions?.world || '', disabled, [...names].sort()]);
    const hit = worldCastCache.get(key);
    if (hit && Date.now() - hit.at < 60000)
        return hit.promise;
    const promise = Promise.all([import('./characterWorldBook.js?rmv=2.5.2'), import('./independentApi/connection.js?rmv=2.5.2')]).then(([module, connection]) => module.readCharacterWorldBookContext(ctx, {
        disabledBooks: disabled, focusText: names.join('\n'), onlyMentioned: true, maxChars: 4000,
        filterContent: value => connection.stripExcludedTagsFromReference(value),
    })).then(result => String(result?.text || '')).catch(() => { worldCastCache.delete(key); return ''; });
    worldCastCache.set(key, { at: Date.now(), promise });
    if (worldCastCache.size > 20)
        worldCastCache.delete(worldCastCache.keys().next().value);
    return promise;
}
async function withWorldBookAppearance(people, frame, tagsOnly, signal = null) {
    const names = frameCastNames(frame);
    if (!names.length || names.every(name => looksComplete(people.find(person => person.name === name))))
        return people;
    const cast = await readWorldCast(names);
    if (signal?.aborted)
        throw Object.assign(new Error(__rmT("lG.pz2TnT_Yo4if1")), { name: 'AbortError', code: 'aborted' });
    if (!cast)
        return people;
    const { appearanceFromCast } = await import('./characterWorldBook.js?rmv=2.5.2');
    const merged = people.map(person => ({ ...person }));
    let others = names;
    try {
        const ctx = getContext();
        others = [...new Set([...names, String(ctx?.name2 || '').trim(), String(ctx?.name1 || globalThis.name1 || '').trim()].filter(Boolean))];
    }
    catch { }
    for (const name of names) {
        const person = merged.find(item => item.name === name);
        if (looksComplete(person))
            continue;
        const looks = appearanceFromCast(cast, name, others);
        if (!looks)
            continue;
        if (!person) {
            const fresh = merged.length < 4 && newPersonFromLooks(name, looks, __rmT("MlaXH7Ec"), tagsOnly);
            if (fresh)
                merged.push(fresh);
            continue;
        }
        (tagsOnly ? fillTagLooksFrom : fillLooksFrom)(person, looks, __rmT("MlaXH7Ec"));
    }
    return merged;
}
async function withLibraryAppearance(people, prompt, frame, tagsOnly) {
    const details = frame?.closest?.('details');
    const floorValue = Number(details?.dataset?.rabbitMirrorOwnerMesid);
    const floor = Number.isSafeInteger(floorValue) && floorValue >= 0 ? floorValue : undefined;
    const raw = await imageCharacters(floor);
    const { unique: library, ambiguous } = uniqueLibrary((Array.isArray(raw) ? raw : []).map(person => ({
        name: String(person?.name || '').trim(), tag: String(person?.tag || '').trim(), nl: String(person?.nl || '').trim(),
    })).map(person => tagsOnly ? { ...person, tag: mergeTagLists(person.tag, appearanceTagFacts(person.nl, person.name).map(item => item.tag).join(', ')), nl: '' } : person)
        .filter(person => person.name && (person.tag || person.nl)));
    if (!library.size)
        return people;
    const entryFor = name => {
        if (library.has(name))
            return library.get(name);
        if (ambiguous.has(name))
            return null;
        const hits = [...library.keys(), ...ambiguous].filter(key => looseNameMatch(name, key));
        return hits.length === 1 && library.has(hits[0]) ? library.get(hits[0]) : null;
    };
    const merged = people.map(person => {
        const entry = entryFor(person.name);
        if (!entry)
            return { ...person };
        const next = { ...person };
        const looks = tagHasLooks(entry.tag);
        const nlLooks = { hair: HAS_HAIR.test(entry.nl || ''), eye: HAS_EYE.test(entry.nl || '') };
        const fields = new Set([...lookFieldsOfText(entry.nl || '', entry.name), ...lookFieldsOfText(String(entry.tag || '').replace(/,/g, __rmT("Yis")), entry.name)]);
        if (looks.hair || nlLooks.hair)
            fields.add('hair');
        if (looks.eye || nlLooks.eye)
            fields.add('eye');
        if (!tagsOnly)
            stripModelLooks(next, fields);
        if (tagsOnly && !String(entry.tag || '').trim())
            return next;
        const kinds = personSceneKinds(person);
        return { ...next, text: mergeAppearance(entry, next.text, tagsOnly, kinds), libraryTag: withoutSceneTags(entry.tag, kinds), fromLibrary: true, looksSource: __rmT(".GoWYT"), looksFields: [...fields] };
    });
    const ctx = getContext();
    const owners = [characterGroup(), String(ctx?.name1 || globalThis.name1 || '').trim()].filter(Boolean);
    for (const name of owners) {
        if (merged.length >= 4 || merged.some(person => person.name === name || looseNameMatch(person.name, name)))
            continue;
        if (!library.has(name) || !mentionedIn(prompt, name, [...library.keys(), ...ambiguous, ...merged.map(person => person.name)]))
            continue;
        const entry = library.get(name);
        const fields = [...new Set([...lookFieldsOfText(entry?.nl || '', name), ...lookFieldsOfText(String(entry?.tag || '').replace(/,/g, __rmT("Yis")), name)])];
        merged.push({ name, text: mergeAppearance(entry, '', tagsOnly), libraryTag: String(entry?.tag || ''), fromLibrary: true, looksSource: __rmT(".GoWYT"), looksFields: fields });
    }
    return merged.filter(person => person.text || person.libraryTag || person.modelTag);
}
function planningFailure() {
    return Object.assign(new Error(__rmT("W.m5nAYvAA42Yc07uS0QBNjPydG2kqYzMe3AaaOIkkhV5yj0pvp4PIT9KJQUIMEjHwHNVbEISh898v8KAsPOjcSzQoQVd0q6E5bLN6uxR8V0qQYG5tE0if")), { code: 'image_plan_failed' });
}
const planQueues = new Map();
function planGroupOf(key) { return String(key).split(':').slice(0, -2).join(':'); }
function planInOrder(key, run) {
    const group = planGroupOf(key);
    let queue = planQueues.get(group);
    if (!queue) {
        queue = { tail: Promise.resolve(), scenes: [], touched: 0 };
        planQueues.set(group, queue);
        if (planQueues.size > 30) {
            const oldest = [...planQueues.entries()].sort((a, b) => a[1].touched - b[1].touched)[0];
            if (oldest && oldest[0] !== group)
                planQueues.delete(oldest[0]);
        }
    }
    queue.touched = Date.now();
    const turn = queue.tail.catch(() => { }).then(async () => {
        const plan = await run(queue.scenes.slice(-4));
        const scene = String(plan?.nl || plan?.flatPrompt || plan?.prompt || '').replace(/\s+/g, ' ').trim().slice(0, 240);
        if (scene)
            queue.scenes.push(scene);
        if (queue.scenes.length > 8)
            queue.scenes.splice(0, queue.scenes.length - 8);
        return plan;
    });
    queue.tail = turn;
    return turn;
}
async function planWithImageLlm(frame, onProgress, promptFormat, isCurrent, otherScenes = []) {
    try {
        const details = frame?.closest?.('details');
        const bridge = globalThis.__rabbitMirrorIndependentActionsV1;
        const target = details && typeof bridge?.prepareImageTarget === 'function' ? bridge.prepareImageTarget(details) : null;
        if (!target?.plan)
            throw planningFailure();
        const focus = readPrompt(frame, { cleanTitle: true });
        const looksSettings = getSettings();
        const library = looksSettings.imageLooksLibrary !== false ? [...(await imageCharacters(target.floor) || [])] : [];
        const myriad = looksSettings.imageLooksMyriad !== false ? myriadPeopleLooks() : [];
        const faceText = [details?.textContent || '', focus, ...readCharacters(frame).map(person => person.name), ...frameCastNames(frame)].join('\n');
        const libraryName = person => String(person?.name || '').trim();
        const allKeys = [...library.map(libraryName), ...myriad.flatMap(person => [person.name, ...person.aliases])].filter(Boolean);
        let owners = [];
        try {
            owners = [characterGroup(), String(getContext()?.name1 || globalThis.name1 || '').trim()].filter(Boolean);
        }
        catch {
            owners = [];
        }
        const relevantLibrary = library.filter(person => libraryName(person) && (owners.includes(libraryName(person)) || mentionedIn(faceText, libraryName(person), allKeys)));
        const otherLibrary = library.filter(person => !relevantLibrary.includes(person));
        const have = new Set(library.map(libraryName));
        const keyOwners = new Map();
        for (const person of myriad)
            for (const key of new Set([person.name, ...person.aliases]))
                keyOwners.set(key, (keyOwners.get(key) || 0) + 1);
        const myriadRelevant = [];
        let cleanRef = value => value;
        try {
            cleanRef = (await import('./independentApi/connection.js?rmv=2.5.2')).stripExcludedTagsFromReference;
        }
        catch { }
        for (const person of myriad) {
            const keys = [person.name, ...person.aliases].filter(key => mentionedIn(faceText, key, allKeys));
            const name = keys.find(key => keyOwners.get(key) === 1);
            if (!name || have.has(person.name) || have.has(name) || myriadRelevant.some(item => item.name === name))
                continue;
            myriadRelevant.push({ name, tag: '', nl: cleanRef(String(person.looks || '')), source: __rmT("w3zxhM8V") });
        }
        const BUDGET = 24;
        const publicFirst = relevantLibrary.slice(0, BUDGET);
        const myriadCharacters = myriadRelevant.slice(0, Math.max(0, BUDGET - publicFirst.length));
        const publicCharacters = [...publicFirst, ...otherLibrary.slice(0, Math.max(0, BUDGET - publicFirst.length - myriadCharacters.length))];
        if (!isCurrent())
            throw staleImageRequest();
        const plan = await target.plan({ focus, frameCaption: frameCaption(frame), sceneCharacters: looksSettings.imageLooksModel !== false ? readCharacters(frame) : [], publicCharacters, myriadCharacters, promptFormat, otherScenes }, { builtin: true, onProgress });
        if (!plan || !String(plan.prompt || plan.flatPrompt || plan.nl || '').trim())
            throw planningFailure();
        return plan;
    }
    catch (error) {
        if (error?.code === 'stale_owner')
            throw error;
        console.warn(__rmT("vIRFk_5ObXd_vHV8n8A4ij4qlRiUokb8KJrADjoCjOEoUBkwpLBRF.D.6Jp_8N8JAyJ5s4Mo0TnNA05yEjrxaz3hhL3PqypYBbg9YT"), error);
        throw planningFailure();
    }
}
function startJob(key, prompt, frame, isCurrent, options = {}) {
    const existing = inflight.get(key);
    if (liveEntry(existing) && mirrorImageOwnerMatchesKey(existing.owner, key))
        return existing.job;
    const owner = captureMirrorImageOwner(key);
    if (!owner)
        throw staleImageRequest();
    const entry = { job: null, isCurrent, sent: false, owner };
    const automatic = automaticFrameState(frame);
    supersedeImageJobs(owner);
    const attempt = automatic ? { output: automatic.output, key, entry, record: null } : null;
    if (attempt)
        automatic.states.set(automatic.slot, attempt);
    const job = (async () => {
        if (!isCurrent())
            throw staleImageRequest();
        if (!options.direct && !hasModelPrompt(frame))
            prompt = readPrompt(frame, { cleanTitle: true }) || prompt;
        const size = frameImageSize(frame);
        const settings = { ...getSettings() };
        const withLlm = imageLlmConfigured(settings) && !options.reuse && !options.direct;
        if (withLlm)
            reportProgress(key, __rmT("1DJjYAlcQrqUreutmK9x0W8Q.xyNoMUiZa8ug4wNxJaQ2h"));
        const planned = options.reuse || (withLlm ? await planInOrder(key, otherScenes => {
            if (!isCurrent())
                throw staleImageRequest();
            reportProgress(key, __rmT("ZGTCeTrSS45g0GpYGGtHC4nQt8EJZOusRQCfTk1.N6rQ2h"));
            return planWithImageLlm(frame, phase => {
                if (isCurrent() && phase === 'response-chunk') {
                    reportProgress(key, __rmT("ZGTCeTrSS45g0GpYGGtHC4nQ2atQbIusRQCfTk1.N6rQ2h"));
                }
            }, settings.imagePromptFormat, isCurrent, otherScenes);
        }) : null);
        if (!isCurrent())
            throw staleImageRequest();
        const provider = settings.imageBackend === 'chatu8' ? __rmT("OyY9PHpS") : __rmT("lo7wSMYV");
        reportProgress(key, `${withLlm ? __rmT(".TFGufFok4ZBcjFukCA") : ''}${__rmT("J94acmgjj9f")}${provider}${__rmT("8bBlOU.2")}`);
        let tidy = { promptIsTags: true, flatTagLines: 'none' };
        let looksSources = options.looksSources && typeof options.looksSources === 'object' ? options.looksSources : null;
        const payload = planned ? {
            prompt: String(planned.prompt || planned.flatPrompt || planned.nl || ''),
            flatPrompt: String(planned.flatPrompt || ''),
            nl: String(planned.nl || ''),
            characters: Array.isArray(planned.characters) ? planned.characters : [],
            promptFormat: planned.promptFormat || settings.imagePromptFormat,
        } : await (async () => {
            const tagsOnly = settings.imagePromptFormat === 'nai45-tags';
            const tagOf = person => mergeTagLists(person.libraryTag, person.modelTag);
            const use = { library: settings.imageLooksLibrary !== false, card: settings.imageLooksCard !== false, myriad: settings.imageLooksMyriad !== false, world: settings.imageLooksWorldBook !== false, model: settings.imageLooksModel !== false };
            let cast = readCharacters(frame);
            if (tagsOnly)
                cast = cast.map(person => ({ ...person, text: /[\u3400-\u9fff]/.test(person.text) && person.modelTag ? person.modelTag : person.text }));
            if (!use.model)
                cast = cast.map(person => ({ ...person, text: '', modelTag: '' }));
            if (use.library)
                cast = await withLibraryAppearance(cast, prompt, frame, tagsOnly);
            if (use.card)
                cast = await withCardAppearance(cast, frame, tagsOnly);
            if (use.myriad)
                cast = await withMyriadAppearance(cast, frame, tagsOnly);
            if (use.world)
                cast = await withWorldBookAppearance(cast, frame, tagsOnly, options.signal || null);
            const people = cast
                .filter(person => tagsOnly ? String(person.text || '').trim() : String(person.text || '').trim() || tagOf(person));
            if (!isCurrent())
                throw staleImageRequest();
            const appearanceOf = person => tagsOnly ? person.text : [...new Set([person.text, tagOf(person)].filter(Boolean))].join('; ');
            const appearance = people.map(person => `${person.name}: ${appearanceOf(person)}`).join('\n');
            looksSources = Object.fromEntries(people.map(person => [person.name, person.looksSource || __rmT("NJVecsmDkMT")]));
            prompt = reconcileSceneAppearance(prompt, people, tagsOnly);
            const tags = tagsOnly ? '' : reconcileSceneAppearance(readTags(frame), people, true);
            return {
                prompt: tags || prompt,
                flatPrompt: [tags, prompt, appearance].filter(Boolean).join('\n'),
                nl: tagsOnly ? '' : prompt,
                characters: people.map(person => ({ name: person.name, tag: tagsOnly ? (/[\u3400-\u9fff]/.test(person.text) && tagOf(person) ? tagOf(person) : person.text) : tagOf(person), nl: tagsOnly ? '' : person.text })),
                promptFormat: settings.imagePromptFormat,
            };
        })();
        if (planned) {
            const plannedTagsOnly = (planned.promptFormat || settings.imagePromptFormat) === 'nai45-tags';
            const promptText = String(planned.prompt || '').trim();
            const promptIsTags = plannedTagsOnly ? !!promptText
                : options.reuse ? !!promptText && !!String(planned.nl || '').trim() && promptText !== String(planned.nl || '').trim()
                    : !!promptText;
            tidy = { promptIsTags, flatTagLines: plannedTagsOnly ? 'all' : 'none' };
        }
        else {
            const directTagsOnly = settings.imagePromptFormat === 'nai45-tags';
            const hasTags = !directTagsOnly && !!readTags(frame);
            tidy = { promptIsTags: directTagsOnly || hasTags, flatTagLines: directTagsOnly ? 'all' : hasTags ? 'first' : 'none' };
        }
        const generated = await generateMirrorImage(tidyImagePayload(payload, tidy), {
            character: characterGroup(),
            size,
            ...(options.signal ? { signal: options.signal } : {}),
            assertCurrent: () => {
                const ok = isCurrent() && anyWaiterConnected(key);
                if (ok) {
                    entry.sent = true;
                    entry.sentAt = Date.now();
                }
                return ok;
            },
            onProgress: event => {
                const phase = { queued: __rmT("2y4.7Ukc"), generating: __rmT("QwqphUkc"), 'queued-remote': __rmT("Nm9dm8eWDVee0k"), retrying: __rmT("N8vGw4svweXYDWcDYqwPMf"), saving: __rmT("Dsv9Sckc") }[event?.phase];
                if (entry.sent && !entry.superseded)
                    entry.sentAt = Date.now();
                if (phase && !entry.superseded && (isCurrent() || entry.sent))
                    reportProgress(key, `${provider}${__rmT("7ys")}${phase}…`);
            },
        });
        const record = { ...generated, builtinImageFit: 'cover', ...(looksSources ? { looksSources } : {}), ...(options.direct ? { editedPrompt: true } : {}) };
        const superseded = entry.superseded === true;
        Object.defineProperty(record, 'superseded', { value: superseded, enumerable: false });
        if (attempt)
            attempt.record = record;
        {
            const { dataUrl, ...light } = record;
            if (!superseded) {
                for (const [savedKey, saved] of sessionRecords)
                    if (saved.owner.scope === owner.scope && saved.owner.token === owner.token && saved.owner.entry === owner.entry && mirrorImageOwnerSourceKey(saved.owner) === mirrorImageOwnerSourceKey(owner))
                        sessionRecords.delete(savedKey);
                sessionRecords.set(owner, { record: record.path ? light : record, owner });
            }
            if (sessionRecords.size > 200)
                sessionRecords.delete(sessionRecords.keys().next().value);
            try {
                saveMirrorImageForOwner(key, record, owner, { preserveCurrent: superseded });
                if (!superseded)
                    unsavedKeys.delete(key);
            }
            catch (error) {
                let minimalSaved = error?.messageCopySaved === true;
                const meta = record.promptMetadata || {};
                const base = { url: record.url, path: record.path, ...(record.path ? {} : { dataUrl: record.dataUrl }), generatedAt: record.generatedAt,
                    provider: record.provider, builtinImageFit: record.builtinImageFit };
                const textMeta = Object.fromEntries(['prompt', 'nl', 'flatPrompt', 'characters', 'promptFormat', 'seed', 'size', 'backend', 'format', 'charactersApplied']
                    .filter(name => meta[name] !== undefined).map(name => [name, meta[name]]));
                const tiers = [
                    { ...base, ...(record.prompt ? { prompt: record.prompt } : {}), promptMetadata: textMeta,
                        ...(record.looksSources ? { looksSources: record.looksSources } : {}), ...(record.editedPrompt ? { editedPrompt: true } : {}) },
                    { ...base, promptMetadata: { seed: meta.seed, promptFormat: meta.promptFormat, size: meta.size } },
                ];
                if (!minimalSaved)
                    for (const tier of tiers) {
                        try {
                            saveMirrorImageForOwner(key, tier, owner, { preserveCurrent: superseded });
                            minimalSaved = true;
                            break;
                        }
                        catch (tierError) {
                            if (tierError?.messageCopySaved === true) {
                                minimalSaved = true;
                                break;
                            }
                        }
                    }
                console.warn(__rmT("h2b4mEIzr.lhblN4BSD79Qi.4dQ6.mzGKkIg3UL_ChB36BPo.hq5kHx6UoAlzUGKO0gJz_6pvv85VK1MX5cBfh"), error);
                if (minimalSaved) {
                    if (!superseded)
                        unsavedKeys.delete(key);
                }
                else {
                    unsavedKeys.add(key);
                    Object.defineProperty(record, 'saveError', { value: error, enumerable: false });
                }
            }
        }
        return record;
    })();
    entry.job = job;
    if (inflight.get(key) !== entry)
        progress.delete(key);
    inflight.set(key, entry);
    const cleanup = () => {
        entry.settled = true;
        if (inflight.get(key) === entry) {
            inflight.delete(key);
            progress.delete(key);
        }
    };
    job.then(cleanup, cleanup);
    return job;
}
async function fillFrame(root, frame, { manual = false } = {}) {
    const isCurrent = imageRequestOwner(frame);
    if (manual)
        clearChatLoadWait(frame);
    if (await prepareRabbitMirrorAvatarFrame(frame))
        return;
    if (!isCurrent() || !frame.isConnected)
        return;
    ensureFrameBox(frame);
    const existingImage = frame.querySelector?.('img[data-rm-draw-result][src]');
    if (existingImage)
        return;
    const prompt = readPrompt(frame);
    if (!prompt)
        return;
    const key = storageKey(root, frame, prompt);
    const saved = readSavedAnyChat(key, () => otherFrameKeys(root, frame), legacyKeyFor(root, frame));
    if (!saved.record && !saved.broken && !manual && retryWhenChatLoaded(frame, key, () => { void fillFrame(root, frame); }, {
        isCurrent: () => isCurrent() && root.isConnected && storageKey(root, frame, readPrompt(frame)) === key,
        onTimeout: () => note(frame, __rmT("TBNcpoD1Lgo7ihNXkEHwYTrBCjW4v0byMHQo3bsWQyiD_vODACeGEY.AUwjU.rv21oWOj.p_aPFn60WVrERDcLQ56pqeogd8MjvPRP0hnKzunHd72Zy5FpTRrjhFMuGeHNT8lcoip2rJR7Jicta88Yn9Er1o6AhePSp"), root),
    }))
        return;
    if (saved.broken && (!manual || saved.code !== 'image_version_unconfirmed')) {
        note(frame, saved.code === 'image_version_unconfirmed'
            ? __rmT("9EPybZNanebVxY.qRKlfrdkM8hTnFhCVY1OUTPct3cz69sgwzC2rn7ShKiNk6g17LVDqffPh.590lV.IvIYbvgFJxoJPNsFBuh1DJbqKE8vjRoU.A9YwCDUt") : __rmT("VeR7HXouzTvi1LQ6o2.XJCSTN_f2yq4T7Jqv57xxbuUvQO5vDkDr7f"), root);
        return;
    }
    const remembered = !manual && !unreadable.has(key) ? sessionRecordFor(key) : null;
    const newer = remembered && (!saved.record || unsavedKeys.has(key));
    if (newer && paint(frame, remembered, root, key)) {
        rememberAutomaticImage(frame, key, remembered);
        return;
    }
    if (saved.record && !unreadable.has(key) && paint(frame, saved.record, root, key)) {
        rememberAutomaticImage(frame, key, saved.record);
        return;
    }
    if (!manual && unreadable.has(key)) {
        note(frame, __rmT("Uqy.3mUmwpshoL_tavM3MSKF_vTvLm.PT6d2lcWJU80Zo88o_FKzAhLo8_ik6TCPSsMqnl6Q9uBBorIXbDslf0u3Jvlzq20QIqxexiKXg3KDOmnA5IpaKlwiUvIy4gTtrrjtiVAc"), root);
        return;
    }
    if (saved.record && !manual) {
        note(frame, __rmT("LzYReToUUSoEQdSDTU83Yzet2po0gut01BCdqC5HKo4YK1ptVmfOUckKI6HWNVMEqXJ5fSWUx4AeUHxPCw9aptjnGITP9xgpIPOgTEHSOMH3Tw2d38Y0if"), root);
        return;
    }
    if (failed.has(key)) {
        note(frame, failed.get(key), root);
        return;
    }
    const automatic = !manual ? automaticFrameState(frame) : null;
    const prior = automatic?.previous;
    if (prior) {
        if (prior.record && !unreadable.has(prior.key) && paint(frame, prior.record, root, prior.key))
            return;
        if (prior.entry && !prior.entry.settled && liveEntry(prior.entry))
            return void joinInflight(root, frame, prior.key, isCurrent, prior.entry);
        note(frame, __rmT("OOytTNVtXICE0QWrPgFtOTN8r6fPWYrbN3Eqh5v_t_8C7BqF1YA7s.DmgIAYAPSSi_uDiChdFggb7P4QUEgiGbNXjgItTSXP0_YkYAv.kbtdb9hGDOL.nyzC6zhGqRDr"), root);
        return;
    }
    if (!manual && !hasInflight(key, () => otherFrameKeys(root, frame)) && !automatic) {
        note(frame, __rmT("BWRBDWCPTCw.e0r3UqABvQvq8QSTd7TOZM.C.MDRA50xNwV7UWnB_O6rPgUTZjdrnjOCALGYei7nlvOCF5uTYsovdzGaeo0VqfQflnjn7eSAXL2W2gMqse7e.ukEZf"), root);
        return;
    }
    const joined = inflightKeyFor(key, () => otherFrameKeys(root, frame));
    if (joined && joined !== key)
        return void joinInflight(root, frame, joined, isCurrent);
    let nodes = waiters.get(key);
    if (!nodes) {
        nodes = new Set();
        waiters.set(key, nodes);
    }
    const waiter = { frame, isCurrent };
    nodes.add(waiter);
    if (progress.has(key))
        note(frame, progress.get(key));
    try {
        const record = await startJob(key, prompt, frame, isCurrent, { manual });
        unreadable.delete(key);
        if (!record.superseded && isCurrent() && frame.isConnected)
            paint(frame, record, root, key);
    }
    catch (error) {
        const code = error?.code;
        if (code === 'stale_owner' || !isCurrent()) {
            if (frame.isConnected)
                note(frame, __rmT("WzGXrD65pEKZaBMN4RZX.EOBSA29HXbR29E"), root);
            return;
        }
        const message = code === 'image_plan_failed' ? planningFailure().message : code === 'not_configured' || code === 'unsupported_api'
            ? `${String(error?.message || __rmT("buHaOp5lJCuemxrcL1X6mh"))}${__rmT("7xadUMatJFWRmLGjy4NgwIpcbNs")}` : __rmT("WzGXrD65pEKZaBMN4RZX.EOBSA29HXbR29E");
        if (['not_configured', 'unsupported_api', 'invalid_args', 'invalid_result', 'image_plan_failed'].includes(code))
            failed.set(key, message);
        if (frame.isConnected && !frame.querySelector?.('img[data-rm-draw-result][src]'))
            note(frame, message, root);
        console.warn(__rmT("54COXazIsNoZfinUEl8.sxBPUDqBQWPYkqIRHD9D0HB.2LpCsg71WM7gwNR163dDahl"), error);
    }
    finally {
        nodes.delete(waiter);
        if (!nodes.size)
            waiters.delete(key);
    }
}
async function joinInflight(root, frame, key, isCurrent, capturedEntry = null) {
    const entry = capturedEntry || inflight.get(key);
    if (!entry?.job)
        return;
    const followedOwner = captureMirrorImageOwner(storageKey(root, frame, readPrompt(frame)));
    if (followedOwner && imageJobIdentity(followedOwner, false) === imageJobIdentity(entry.owner, false)) {
        (entry.followedOwners ||= new Set()).add(imageJobIdentity(followedOwner));
    }
    const automatic = automaticFrameState(frame);
    const attempt = automatic ? { output: automatic.output, key, entry, record: null } : null;
    if (attempt)
        automatic.states.set(automatic.slot, attempt);
    let nodes = waiters.get(key);
    if (!nodes) {
        nodes = new Set();
        waiters.set(key, nodes);
    }
    const waiter = { frame, isCurrent };
    nodes.add(waiter);
    if (progress.has(key))
        note(frame, progress.get(key));
    try {
        const record = await entry.job;
        if (attempt)
            attempt.record = record;
        if (!record.superseded && isCurrent() && frame.isConnected)
            paint(frame, record, root, key);
    }
    catch {
        if (frame.isConnected && !frame.querySelector?.('img[data-rm-draw-result][src]'))
            note(frame, __rmT("WzGXrD65pEKZaBMN4RZX.EOBSA29HXbR29E"), root);
    }
    finally {
        nodes.delete(waiter);
        if (!nodes.size && waiters.get(key) === nodes)
            waiters.delete(key);
    }
}
const FRAME_EXTRA_MEDIA = 'img:not([data-rm-draw-result]), picture, video';
function hideFrameExtraMedia(frame) {
    for (const node of frame.querySelectorAll?.(FRAME_EXTRA_MEDIA) || []) {
        if (node.closest('[data-rm-draw-status]'))
            continue;
        if (node.matches('img') && node.closest('picture'))
            continue;
        node.setAttribute('data-rm-draw-extra', 'true');
        node.style.setProperty('display', 'none', 'important');
    }
    const style = frame.style;
    if (style && style.getPropertyValue('display') === 'none' && style.getPropertyPriority('display') !== 'important'
        && !frame.hasAttribute('data-rm-result-active') && !frame.hasAttribute('data-rm-show') && !frame.closest?.('[hidden]')) {
        style.setProperty('display', 'block');
        frame.setAttribute('data-rm-draw-unhidden', 'true');
    }
}
function hideSiblingSubstituteImages(frame) {
    for (const node of frame.parentElement?.children || []) {
        if (node === frame || !node.matches?.('img') || node.hasAttribute('data-rm-draw-result'))
            continue;
        if (!/^https?:/i.test(String(node.getAttribute('src') || '').trim()))
            continue;
        node.setAttribute('data-rm-draw-extra', 'true');
        node.style.setProperty('display', 'none', 'important');
    }
}
function ensureFrameBox(frame) {
    const style = frame?.style;
    if (!style)
        return;
    hideFrameExtraMedia(frame);
    let computed = null;
    try {
        computed = getComputedStyle(frame);
    }
    catch {
        computed = null;
    }
    if (!computed)
        return;
    if (computed.display === 'inline')
        style.setProperty('display', 'block');
    if (!style.margin && computed.marginLeft === '40px')
        style.setProperty('margin', '0');
    if (!style.aspectRatio && computed.aspectRatio === 'auto' && !style.height)
        style.setProperty('aspect-ratio', '4 / 3');
    if (computed.overflow === 'visible')
        style.setProperty('overflow', 'hidden');
    if (!style.borderRadius && computed.borderTopLeftRadius === '0px')
        style.setProperty('border-radius', '12px');
}
export function restoreSavedBuiltinImages(root) {
    if (!root?.querySelectorAll)
        return 0;
    adoptDrawNotes(root);
    const context = getContext(), chat = context?.chat;
    const identity = rabbitMirrorAvatarPromptIdentity(context);
    let restored = 0;
    for (const frame of root.querySelectorAll('[data-rm-draw-frame]')) {
        if (isRabbitMirrorLinkedAvatarFrame(frame))
            continue;
        if (frame.querySelector?.('img[data-rm-draw-result][src]'))
            continue;
        const prompt = readPrompt(frame);
        if (!prompt)
            continue;
        let saved = readSavedAnyChat(storageKey(root, frame, prompt), () => otherFrameKeys(root, frame), legacyKeyFor(root, frame));
        const key = storageKey(root, frame, prompt);
        if (!saved.record && retryWhenChatLoaded(frame, key, () => { restoreSavedBuiltinImages(root); }, {
            isCurrent: () => root.isConnected && getContext()?.chat === chat && rabbitMirrorAvatarPromptIdentity(getContext()) === identity
                && storageKey(root, frame, readPrompt(frame)) === key,
            onTimeout: () => note(frame, __rmT("5VvAe.a0qTNjiPkxcBff4fKTA626apcbhyiRrWARi1XppNj_meB4.yPzpjHvAlkjLhlNa.Mg5bJlNAKVOxDdhTE.5m.HOX84fIMWGg34OV0H99XTTmBSdVW_8ik")),
        }))
            continue;
        if (!saved.record) {
            for (const broken of frame.querySelectorAll?.('img[data-rm-draw-result]:not([src])') || [])
                broken.remove();
            continue;
        }
        ensureFrameBox(frame);
        const interactive = getSettings().builtinImageEnabled === true && !frame.closest?.('details')?.dataset?.rmImageOwnerChat;
        if (paint(frame, saved.record, interactive ? root : null, storageKey(root, frame, prompt)))
            restored += 1;
    }
    return restored;
}
export function fillBuiltinImageFrames(root) {
    if (getSettings().builtinImageEnabled !== true || !root?.querySelectorAll)
        return;
    adoptDrawNotes(root);
    for (const frame of root.querySelectorAll('[data-rm-draw-frame]')) {
        if (isRabbitMirrorLinkedAvatarFrame(frame))
            continue;
        hideFrameExtraMedia(frame);
        void fillFrame(root, frame);
    }
}
function versionsOf(record) {
    if (!record)
        return { list: [], current: -1 };
    const { history = [], ...shown } = record;
    const all = [...(Array.isArray(history) ? history : []), shown];
    const time = entry => { const value = Date.parse(entry?.generatedAt || ''); return Number.isFinite(value) ? value : 0; };
    const list = all.map((entry, order) => ({ entry, order })).sort((a, b) => time(a.entry) - time(b.entry) || a.order - b.order).map(item => item.entry);
    return { list, current: list.indexOf(shown) };
}
export function listBuiltinImageFrames(root) {
    if (!root?.querySelectorAll)
        return [];
    adoptDrawNotes(root);
    const list = [];
    for (const frame of root.querySelectorAll('[data-rm-draw-frame]')) {
        if (isRabbitMirrorLinkedAvatarFrame(frame))
            continue;
        const prompt = readPrompt(frame);
        if (!prompt)
            continue;
        const key = storageKey(root, frame, prompt);
        const saved = readSavedAnyChat(key, () => otherFrameKeys(root, frame), legacyKeyFor(root, frame));
        const { list: versions, current } = saved.broken ? { list: [], current: -1 } : versionsOf(saved.record);
        list.push({ frame, key, prompt, editPrompt: hasModelPrompt(frame) ? prompt : (readPrompt(frame, { cleanTitle: true }) || prompt), versions, current, broken: !!saved.broken, brokenCode: saved.broken ? String(saved.code || '') : '',
            busy: hasInflight(key, () => otherFrameKeys(root, frame)) });
    }
    return list;
}
export function builtinImageReady() { return getSettings().builtinImageEnabled === true; }
function adoptSavedKey(key, claimed = null, legacyKey = '') {
    const own = readSaved(key);
    if (own.broken)
        return;
    const other = savedKeyFor(key, claimed, legacyKey);
    if (!other || other === key)
        return;
    const moved = readSaved(other).record;
    if (!moved)
        return;
    let { history = [], ...current } = moved;
    if (own.record) {
        if (!builtinImageKeysShifted(key, other))
            return;
        const { history: ownHistory = [], ...ownCurrent } = own.record;
        const id = entry => JSON.stringify([entry?.path || entry?.url || entry?.dataUrl, entry?.generatedAt || '', entry?.promptMetadata?.seed ?? null]);
        const seen = new Set([id(current)]);
        history = [...history].reverse().concat([ownCurrent, ...[...ownHistory].reverse()])
            .filter(entry => { const k = id(entry); if (seen.has(k))
            return false; seen.add(k); return true; }).reverse();
    }
    const sameChat = other !== legacyKey && (builtinImageKeysCompatible(key, other) || builtinImageKeysShifted(key, other));
    try {
        replaceMirrorImageVersions(key, current, history);
        if (sameChat)
            removeMirrorImage(other, { keepSlotOf: key });
    }
    catch { }
}
function reusablePlan(saved) {
    const meta = saved?.promptMetadata;
    if (meta && String(meta.prompt || meta.flatPrompt || meta.nl || '').trim()) {
        const sent = String(saved.prompt || '').trim();
        const characters = Array.isArray(meta.characters) ? meta.characters : null;
        return {
            prompt: String(meta.prompt || ''), nl: String(meta.nl || ''),
            flatPrompt: (!characters && sent) ? sent : String(meta.flatPrompt || ''),
            characters: characters || [], promptFormat: meta.promptFormat,
        };
    }
    const sent = String(saved?.prompt || '').trim();
    return sent ? { prompt: sent, flatPrompt: sent, nl: '', characters: [], promptFormat: saved?.promptMetadata?.promptFormat } : null;
}
export function builtinImageReusable(record) { return !!reusablePlan(record); }
export async function rerollBuiltinImage(root, frame, { prompt: edited = '', signal = null, onText = null } = {}) {
    if (!builtinImageReady())
        throw Object.assign(new Error(__rmT("f9l1hTbvupk67NppyLZdlcDqn2Vo_9X73uMdd9K.eOA3RixHMN8cn.LfgC_E7zkC")), { code: 'disabled' });
    clearChatLoadWait(frame);
    const isCurrent = imageRequestOwner(frame);
    const original = readPrompt(frame);
    if (!original)
        throw Object.assign(new Error(__rmT("5zOE1zlGZP4o7Rtm1oswD9aB9ZlmZaqPgRWFQYy9gG8")), { code: 'no_prompt' });
    const key = storageKey(root, frame, original);
    if (hasInflight(key, () => otherFrameKeys(root, frame)))
        throw Object.assign(new Error(__rmT("xS5ZpyO59wiJYFgg0OhGuyZ2eV4w7aHQ0zvspf")), { code: 'busy' });
    supersedeShiftedImageJobs(key, () => otherFrameKeys(root, frame));
    adoptSavedKey(key, () => otherFrameKeys(root, frame), legacyKeyFor(root, frame));
    const savedState = readSaved(key);
    if (savedState.broken && savedState.code !== 'image_version_unconfirmed')
        throw Object.assign(new Error(__rmT("JsfVi.o3X_fwNAy5Pm2IZtzoMxUL8wbx9QKIu4c5FZgN7DN5LUrnTxP5xq16EpflpIj5sQGP")), { code: 'broken' });
    const saved = savedState.record;
    const text = String(edited || '').replace(/\s+/g, ' ').trim();
    const reuse = !text ? reusablePlan(saved) : null;
    failed.delete(key);
    unreadable.delete(key);
    let nodes = waiters.get(key);
    if (!nodes) {
        nodes = new Set();
        waiters.set(key, nodes);
    }
    const waiter = { frame, isCurrent, quiet: true, onText };
    nodes.add(waiter);
    try {
        const generated = await startJob(key, text || original, frame, isCurrent, { reuse, direct: !!text, manual: true, signal, ...(reuse && saved?.looksSources ? { looksSources: saved.looksSources } : {}) });
        let record = null;
        if (!generated?.saveError) {
            try {
                record = loadMirrorImage(key);
            }
            catch {
                record = null;
            }
        }
        if (!record)
            record = generated;
        const painted = !!(!generated?.superseded && record && frame.isConnected && isCurrent());
        if (painted) {
            ensureFrameBox(frame);
            paint(frame, record, root, key);
        }
        return { record, painted, saveError: generated?.saveError || null };
    }
    finally {
        nodes.delete(waiter);
        if (!nodes.size && waiters.get(key) === nodes)
            waiters.delete(key);
    }
}
export function showBuiltinImageVersion(root, frame, index) {
    const prompt = readPrompt(frame);
    if (!prompt)
        return null;
    const key = storageKey(root, frame, prompt);
    adoptSavedKey(key, () => otherFrameKeys(root, frame), legacyKeyFor(root, frame));
    const record = loadMirrorImage(key);
    const { list, current } = versionsOf(record);
    const chosen = list[index];
    if (!chosen || index === current)
        return record;
    const shown = list[current];
    const fingerprint = imagePromptFingerprint(chosen);
    const shownHasPrompt = !!String(shown?.promptMetadata?.prompt || shown?.promptMetadata?.nl || shown?.promptMetadata?.flatPrompt || shown?.prompt || '').trim();
    const picked = chosen?.slimmed === true && shown && shownHasPrompt && fingerprint && fingerprint === imagePromptFingerprint(shown) ? {
        ...chosen, slimmed: undefined, promptHash: undefined, prompt: shown.prompt,
        promptMetadata: { ...(shown.promptMetadata || {}), seed: chosen.promptMetadata?.seed ?? shown.promptMetadata?.seed },
        ...(shown.looksSources && !chosen.looksSources ? { looksSources: shown.looksSources } : {}),
    } : chosen;
    let next;
    try {
        next = replaceMirrorImageVersions(key, picked, list.filter((_, i) => i !== index));
    }
    catch (error) {
        throw Object.assign(new Error(__rmT("UqjM4_zMdR8guO44.Fw5sE2sakjeugizKXH1N86aPeuYD9ygpfLrJuUNQKl9uT")), { code: 'quota', cause: error });
    }
    for (const [savedKey, value] of sessionRecords)
        if (mirrorImageOwnerMatchesKey(value.owner, key))
            sessionRecords.delete(savedKey);
    unsavedKeys.delete(key);
    unreadable.delete(key);
    const selectedOwner = captureMirrorImageOwner(key);
    const automatic = automaticFrameState(frame);
    if (selectedOwner)
        supersedeImageJobs(selectedOwner);
    supersedeShiftedImageJobs(key, () => otherFrameKeys(root, frame));
    if (automatic)
        automatic.states.set(automatic.slot, { output: automatic.output, key, record: next });
    if (frame.isConnected) {
        ensureFrameBox(frame);
        paint(frame, next, root, key);
    }
    return next;
}
