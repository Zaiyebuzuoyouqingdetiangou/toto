import { rmT as __rmT } from "./textTable.js?rmv=2.1.3";
const COUNT_KEY = 'rabbitMirrorGeneratedCount';
const FIRST_KEY = 'rabbitMirrorFirstGeneratedAt';
const SHOWN_KEY = 'rabbitMirrorMilestonesShown';
const MILESTONES = [10, 50, 100, 200, 300, 500, 1000];
const COUNTED = new Set();
function read(key, fallback) {
    try {
        const value = globalThis.localStorage?.getItem(key);
        return value == null ? fallback : JSON.parse(value);
    }
    catch {
        return fallback;
    }
}
function write(key, value) {
    try {
        globalThis.localStorage?.setItem(key, JSON.stringify(value));
    }
    catch { }
}
function dateText(ts) {
    const date = new Date(Number(ts) || Date.now());
    return `${date.getFullYear()}${__rmT("JC8")}${date.getMonth() + 1}${__rmT("eW_")}${date.getDate()}${__rmT("iqY")}`;
}
export function recordMirrorMilestone(key = '') {
    const id = String(key || '');
    if (id && COUNTED.has(id))
        return;
    if (id)
        COUNTED.add(id);
    const count = Number(read(COUNT_KEY, 0)) + 1;
    write(COUNT_KEY, count);
    if (!read(FIRST_KEY, 0))
        write(FIRST_KEY, Date.now());
    const shown = read(SHOWN_KEY, []);
    if (!MILESTONES.includes(count) || shown.includes(count))
        return;
    write(SHOWN_KEY, [...shown, count]);
    showMilestoneCard(count, read(FIRST_KEY, Date.now()));
}
function showMilestoneCard(count, firstAt) {
    const doc = globalThis.document;
    if (!doc?.body)
        return;
    doc.querySelector('[data-rm-milestone-card]')?.remove();
    const card = doc.createElement('div');
    card.setAttribute('data-rm-milestone-card', 'true');
    card.setAttribute('role', 'status');
    card.style.cssText = 'position:fixed;left:50%;bottom:max(18px,env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:2147483600;'
        + 'box-sizing:border-box;width:min(340px,calc(100vw - 24px));padding:16px 16px 12px;border-radius:16px;'
        + 'background:var(--SmartThemeBlurTintColor,rgba(30,28,36,.97));color:var(--SmartThemeBodyColor,#f2f2f2);'
        + 'border:1px solid color-mix(in srgb,currentColor 18%,transparent);box-shadow:0 14px 40px rgba(0,0,0,.32);font-family:inherit;text-align:center;';
    const title = doc.createElement('div');
    title.style.cssText = 'font-size:17px;font-weight:800;margin-bottom:6px;';
    title.textContent = `${__rmT("LPeSTyteJXB6MpQkgPD")}${count}${__rmT("UqYPpCRe2FhCeT")}`;
    const line = doc.createElement('div');
    line.style.cssText = 'font-size:12px;line-height:1.6;opacity:.8;margin-bottom:12px;';
    line.textContent = `${__rmT("hHbCyT")}${dateText(firstAt)}${__rmT("3bUo3Tqux1gUrbxrZla0GOIOdLkcHCcreCkAc7t4PYa.bh")}`;
    const row = doc.createElement('div');
    row.style.cssText = 'display:flex;gap:8px;justify-content:center;flex-wrap:wrap;';
    const button = (label, run) => {
        const node = doc.createElement('button');
        node.type = 'button';
        node.className = 'menu_button';
        node.textContent = label;
        node.style.cssText = 'min-height:34px;padding:6px 14px;';
        node.addEventListener('click', event => { event.preventDefault(); run(); });
        return node;
    };
    row.append(button(__rmT("FI3QaSVOspuIdT"), () => {
        card.remove();
        void Promise.all([import('./theaterFavorites.js?rmv=2.1.3'), import('./independentApi.js?rmv=2.1.3')])
            .then(([favorites, api]) => favorites.openTheaterFavoriteLibrary((container, record) => api.hydrateIndependentFavoriteHtml(container, record)))
            .catch(() => globalThis.toastr?.warning?.(__rmT("XPdo2gxj47x04eyygJ8312mpSKCpQRwuPfsCsldeFeEyA.hDiTYr7f")));
    }), button(__rmT("oP5t3f"), () => card.remove()));
    card.append(title, line, row);
    doc.body.append(card);
    setTimeout(() => card.isConnected && card.remove(), 15000);
}
