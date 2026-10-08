// 里程碑：第 10、50、100… 面兔子镜时，在本地弹一张小纪念卡。不请求模型、不写入 Prompt。
const COUNT_KEY = 'rabbitMirrorGeneratedCount';
const FIRST_KEY = 'rabbitMirrorFirstGeneratedAt';
const SHOWN_KEY = 'rabbitMirrorMilestonesShown';
const MILESTONES = [10, 50, 100, 200, 300, 500, 1000];
const COUNTED = new Set();

function read(key, fallback) {
    try { const value = globalThis.localStorage?.getItem(key); return value == null ? fallback : JSON.parse(value); } catch { return fallback; }
}
function write(key, value) {
    try { globalThis.localStorage?.setItem(key, JSON.stringify(value)); } catch { /* best effort */ }
}
function dateText(ts) {
    const date = new Date(Number(ts) || Date.now());
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

// 每次一面兔子镜成功生成后调用一次；同一面（同一键）只计一次。
export function recordMirrorMilestone(key = '') {
    const id = String(key || '');
    if (id && COUNTED.has(id)) return;
    if (id) COUNTED.add(id);
    const count = Number(read(COUNT_KEY, 0)) + 1;
    write(COUNT_KEY, count);
    if (!read(FIRST_KEY, 0)) write(FIRST_KEY, Date.now());
    const shown = read(SHOWN_KEY, []);
    if (!MILESTONES.includes(count) || shown.includes(count)) return;
    write(SHOWN_KEY, [...shown, count]);
    showMilestoneCard(count, read(FIRST_KEY, Date.now()));
}

function showMilestoneCard(count, firstAt) {
    const doc = globalThis.document;
    if (!doc?.body) return;
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
    title.textContent = `🐰 这是第 ${count} 面兔子镜`;
    const line = doc.createElement('div');
    line.style.cssText = 'font-size:12px;line-height:1.6;opacity:.8;margin-bottom:12px;';
    line.textContent = `从 ${dateText(firstAt)} 的第一面到今天，谢谢你一直在看。`;
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
    row.append(
        button('打开收藏夹', () => {
            card.remove();
            void Promise.all([import('./theaterFavorites.js?rmv=1.67.28'), import('./independentApi.js?rmv=1.67.28')])
                .then(([favorites, api]) => favorites.openTheaterFavoriteLibrary((container, record) => api.hydrateIndependentFavoriteHtml(container, record)))
                .catch(() => globalThis.toastr?.warning?.('收藏夹暂时打不开，可以从工具菜单里进入。'));
        }),
        button('收下', () => card.remove()),
    );
    card.append(title, line, row);
    doc.body.append(card);
    setTimeout(() => card.isConnected && card.remove(), 15000);
}
