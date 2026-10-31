import { rmT as __rmT } from "./textTable.js?rmv=2.5.0";
import { getSettings } from './settings.js?rmv=2.5.0';
const CHIP_ATTR = 'data-rm-ready-chip';
const TITLE_MARK_OK = '🐇 ';
const TITLE_MARK_FAIL = '🐇❌ ';
const ICON = '<svg viewBox="0 0 32 32" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M10 16C4 2 11 1 14 14M18 14C20 1 27 2 23 16M9 16c-7 11 3 15 9 14s13-8 5-14c-4-3-10-3-14 0Z"/><path d="M12 22h1m6 0h1m-6 4 2 1 2-1"/></svg>';
let chip = null;
let targets = [];
let seenObserver = null;
let watchTimer = 0;
let titleMark = '';
let titleListening = false;
function settingsOn(key) {
    let st = null;
    try {
        st = getSettings();
    }
    catch {
        return key !== 'readyNoticeVibrate';
    }
    if (st?.readyNoticeEnabled === false)
        return false;
    if (key === 'readyNoticeVibrate')
        return st?.readyNoticeVibrate === true;
    return st?.[key] !== false;
}
export function faceOnScreen(el, view = globalThis) {
    if (!el?.isConnected || typeof el.getBoundingClientRect !== 'function')
        return false;
    const rect = el.getBoundingClientRect();
    const height = Number(view.innerHeight) || 0;
    if (!height || rect.height <= 0)
        return false;
    const form = view.document?.getElementById?.('send_form') || view.document?.getElementById?.('form_sheld');
    const bottom = Math.min(height, form?.getBoundingClientRect?.().top || height);
    const visible = Math.max(0, Math.min(rect.bottom, bottom) - Math.max(rect.top, 0));
    return visible >= Math.min(rect.height, bottom) * 0.3;
}
function clearTitleMark() {
    if (!titleMark)
        return;
    const doc = globalThis.document;
    if (doc && doc.title.startsWith(titleMark))
        doc.title = doc.title.slice(titleMark.length);
    titleMark = '';
}
function markTitle(failed) {
    const doc = globalThis.document;
    if (!doc || !doc.hidden || !settingsOn('readyNoticeTitle'))
        return;
    clearTitleMark();
    titleMark = failed ? TITLE_MARK_FAIL : TITLE_MARK_OK;
    doc.title = `${titleMark}${doc.title}`;
    if (!titleListening) {
        titleListening = true;
        doc.addEventListener('visibilitychange', () => { if (!doc.hidden)
            clearTitleMark(); });
    }
}
function removeChip() {
    clearInterval(watchTimer);
    watchTimer = 0;
    try {
        seenObserver?.disconnect();
    }
    catch { }
    seenObserver = null;
    targets = [];
    const node = chip;
    chip = null;
    if (!node)
        return;
    const reduce = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (reduce) {
        node.remove();
        return;
    }
    node.setAttribute('data-rm-leaving', 'true');
    setTimeout(() => node.remove(), 220);
}
export function dismissReadyNotice() { removeChip(); }
function placeChip(node) {
    const doc = globalThis.document;
    const form = doc?.getElementById?.('send_form') || doc?.getElementById?.('form_sheld');
    const top = form?.getBoundingClientRect?.().top;
    const height = Number(globalThis.innerHeight) || 0;
    const gap = Number.isFinite(top) && top > 0 && height ? Math.max(12, height - top + 12) : 84;
    node.style.setProperty('bottom', `${gap}px`);
}
function renderChip() {
    const doc = globalThis.document;
    if (!doc?.body)
        return;
    const live = targets.filter(item => item.el?.isConnected);
    targets = live;
    if (!live.length) {
        removeChip();
        return;
    }
    const failed = live.some(item => item.failed);
    const first = live[0].el;
    const above = first.getBoundingClientRect().bottom < 0;
    if (!chip) {
        chip = doc.createElement('button');
        chip.type = 'button';
        chip.setAttribute(CHIP_ATTR, 'true');
        chip.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            const target = targets.find(item => item.el?.isConnected)?.el;
            removeChip();
            if (!target)
                return;
            const details = target.matches?.('details') ? target : target.querySelector?.('details');
            if (details && !details.open) {
                try {
                    details.open = true;
                }
                catch { }
            }
            try {
                target.scrollIntoView({ behavior: globalThis.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ? 'auto' : 'smooth', block: 'start' });
            }
            catch {
                try {
                    target.scrollIntoView();
                }
                catch { }
            }
        });
        doc.body.append(chip);
    }
    let dark = false;
    try {
        dark = getSettings()?.darkVisualMode === true;
    }
    catch {
        dark = false;
    }
    if (dark)
        chip.setAttribute('data-rm-dark', 'true');
    else
        chip.removeAttribute('data-rm-dark');
    chip.toggleAttribute('data-rm-failed', failed);
    const text = failed
        ? __rmT("otCrz6dpM18v17ixDpo_Lt4CQ84tjT") : live.length > 1 ? `${live.length}${__rmT("UqYPphH6fHPX0k")}` : __rmT("oNm9IIg2ziWPydIF");
    chip.innerHTML = `<span class="rm-ready-chip-icon">${ICON}</span><span class="rm-ready-chip-text"></span>${!failed && live.length > 1 ? __rmT("8G9DPVYK2D1AcGgFEXIrnb6K1XLEEniFgTKhFXhF8heXNx0roJFSiUgHzhQRVl.HWqO_2G_03ZYXe7VLJxkGHfCDLbjqskfXBNHNpB6MtPJ614FbZsYd2j8F1Jrr3YDpZVd3XT") : ''}<span class="rm-ready-chip-arrow" aria-hidden="true">${above ? '↑' : '↓'}</span>`;
    chip.querySelector('.rm-ready-chip-text').textContent = text;
    chip.setAttribute('aria-label', `${text}${__rmT("NFgP2ly2XZby8JdA.op")}`);
    placeChip(chip);
}
function watchTargets() {
    try {
        seenObserver?.disconnect();
    }
    catch { }
    seenObserver = null;
    if (typeof IntersectionObserver === 'function') {
        seenObserver = new IntersectionObserver(entries => {
            let changed = false;
            for (const entry of entries) {
                if (entry.intersectionRatio < 0.3 && !faceOnScreen(entry.target))
                    continue;
                const before = targets.length;
                targets = targets.filter(item => item.el !== entry.target);
                if (targets.length !== before)
                    changed = true;
            }
            if (changed)
                renderChip();
        }, { threshold: [0.3] });
        for (const item of targets) {
            try {
                seenObserver.observe(item.el);
            }
            catch { }
        }
    }
    clearInterval(watchTimer);
    watchTimer = setInterval(() => {
        if (!chip) {
            clearInterval(watchTimer);
            watchTimer = 0;
            return;
        }
        if (!targets.some(item => item.el?.isConnected))
            removeChip();
        else
            placeChip(chip);
    }, 2000);
}
export function noteFacesReady(els, { failed = false } = {}) {
    const list = (Array.isArray(els) ? els : [els]).filter(el => el?.isConnected);
    if (!list.length || !settingsOn('readyNoticeEnabled'))
        return false;
    markTitle(failed);
    if (settingsOn('readyNoticeVibrate')) {
        try {
            globalThis.navigator?.vibrate?.(failed ? [40, 60, 40] : 35);
        }
        catch { }
    }
    if (!settingsOn('readyNoticeChip'))
        return false;
    const hidden = list.filter(el => !faceOnScreen(el));
    if (!hidden.length)
        return false;
    for (const el of hidden)
        if (!targets.some(item => item.el === el))
            targets.push({ el, failed });
    renderChip();
    watchTargets();
    return true;
}
