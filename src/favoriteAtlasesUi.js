import {
    atlasSlotsText, buildFavoriteAtlas, deleteFavoriteAtlas, favoriteAtlasProgress,
    listFavoriteAtlases, saveFavoriteAtlas, setAtlasSelection,
} from './favoriteAtlases.js?rmv=1.67.42-face-atlas-test1';

const STYLE = `
[data-rm-favorite-atlases]{margin-top:8px;font-size:13px;line-height:1.5;min-width:0;max-width:100%;overflow-wrap:anywhere}
[data-rm-favorite-atlases] *{box-sizing:border-box}
[data-rm-favorite-atlases] button,[data-rm-favorite-atlases] summary{min-height:44px}
[data-rm-favorite-atlases] button{padding:8px 12px;border:1px solid var(--rh-border,#aaa);border-radius:10px;background:transparent;color:inherit;white-space:normal;overflow-wrap:anywhere}
[data-rm-favorite-atlases] button:disabled{opacity:.5;cursor:default}
[data-rm-favorite-atlases] :is(button,input,textarea,summary):focus-visible{outline:2px solid var(--rh-primary,#ce729c);outline-offset:2px}
.rm-atlas-head,.rm-atlas-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.rm-atlas-head strong{flex:1;min-width:0;font-size:15px}
.rm-atlas-box{margin:10px 0;padding:8px 10px;border:1px solid color-mix(in srgb,currentColor 12%,transparent);border-radius:10px}
.rm-atlas-box>summary{cursor:pointer;display:list-item;align-content:center;font-weight:600}
.rm-atlas-bar{height:6px;margin:8px 0;border-radius:999px;background:color-mix(in srgb,currentColor 12%,transparent);overflow:hidden}
.rm-atlas-bar>span{display:block;height:100%;background:currentColor;opacity:.55;border-radius:999px}
.rm-atlas-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:5px;margin:10px 0}
.rm-atlas-grid button{padding:5px;font-size:12px;min-width:0}
.rm-atlas-grid button[data-collected="true"]{border-color:currentColor;background:color-mix(in srgb,currentColor 12%,transparent);font-weight:800}
.rm-atlas-form{display:flex;flex-direction:column;gap:10px;padding:12px 0}
.rm-atlas-form label{display:flex;flex-direction:column;gap:5px;font-weight:600}
.rm-atlas-form input,.rm-atlas-form textarea{width:100%;min-width:0;min-height:44px;padding:10px;border:1px solid var(--rh-border,#aaa);border-radius:10px;background:var(--rh-field,transparent);color:inherit;font:inherit}
.rm-atlas-form textarea{min-height:160px;resize:vertical}
.rm-atlas-hint{font-size:12px;opacity:.75;margin:6px 0;overflow-wrap:anywhere}
.rm-atlas-status{min-height:1.5em;margin:6px 0;overflow-wrap:anywhere}
.rm-atlas-picker{max-height:300px;overflow:auto;margin:8px 0;border:1px solid var(--rh-border,#aaa);border-radius:10px;padding:4px 8px}
.rm-atlas-choice{display:flex;align-items:center;gap:8px;border-bottom:1px solid color-mix(in srgb,currentColor 10%,transparent)}
.rm-atlas-choice>label{display:flex;align-items:center;gap:8px;min-height:44px;flex:1;min-width:0;overflow-wrap:anywhere}
.rm-atlas-choice>label>span{min-width:0;overflow-wrap:anywhere}
.rm-atlas-choice input{flex:0 0 auto;width:20px;height:20px}
.rm-atlas-choice button{flex:0 0 auto}
.rm-atlas-confirm{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
.rm-atlas-confirm p{flex-basis:100%}
@media(max-width:380px){.rm-atlas-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
`;

function node(tag, text, className) {
    const element = document.createElement(tag);
    if (text) element.textContent = text;
    if (className) element.className = className;
    return element;
}
function button(text, action) {
    const element = node('button', text);
    element.type = 'button';
    element.addEventListener('click', action);
    return element;
}

// openFavorite is the library's existing hydrated viewer; atlas cells never
// generate new content or substitute a newly rendered copy of a saved mirror.
export function createFavoriteAtlasPanel({ favorites, openFavorite, displayTitle }) {
    let rows = favorites, atlases = [], busy = false;
    const root = node('section');
    root.setAttribute('data-rm-favorite-atlases', 'true');
    root.setAttribute('aria-label', '自定义收藏图鉴');
    const style = node('style', STYLE);
    const head = node('div', '', 'rm-atlas-head');
    const status = node('p', '正在读取图鉴…', 'rm-atlas-status');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    const editor = node('div');
    const list = node('div');
    const add = button('新建图鉴', () => showEditor());
    add.disabled = true;
    head.append(node('strong', '我的图鉴'), add);
    root.append(style, head, node('p', '用收藏点亮自己的格子。图鉴、关联和收藏都保存在本机。', 'rm-atlas-hint'), status, editor, list);

    function fail(error) {
        status.textContent = `未完成：${error?.message || error}。原有收藏不会因此被清除。`;
    }
    function open(id) {
        Promise.resolve().then(() => openFavorite(id)).catch(fail);
    }
    async function persist(work, completed) {
        if (busy) return;
        busy = true;
        root.setAttribute('aria-busy', 'true');
        const controls = [...root.querySelectorAll('button,input,textarea')].map(control => [control, control.disabled]);
        controls.forEach(([control]) => { control.disabled = true; });
        status.textContent = '正在保存…';
        try { await work(); completed(); }
        catch (error) { fail(error); }
        finally {
            busy = false;
            root.removeAttribute('aria-busy');
            controls.forEach(([control, disabled]) => { if (control.isConnected) control.disabled = disabled; });
        }
    }
    function update(atlas, completed) {
        return persist(() => saveFavoriteAtlas(atlas), () => {
            const index = atlases.findIndex(item => item.id === atlas.id);
            if (index < 0) atlases.push(atlas); else atlases[index] = atlas;
            completed?.();
            paint(atlas.id);
            status.textContent = '已保存图鉴。';
        });
    }

    function showEditor(previous = null) {
        if (busy) return;
        editor.replaceChildren();
        const form = node('div', '', 'rm-atlas-form');
        const heading = node('strong', previous ? `编辑「${previous.name}」` : '新建图鉴');
        const nameLabel = node('label', '图鉴名称');
        const name = node('input');
        name.type = 'text';
        name.value = previous?.name || '';
        name.placeholder = '例如：塔罗牌图鉴';
        nameLabel.append(name);
        const slotsLabel = node('label', '格子和识别词（每行一个格子）');
        const slots = node('textarea');
        slots.value = previous ? atlasSlotsText(previous.slots) : '';
        slots.placeholder = '愚者 | The Fool | 0号愚者牌\n魔术师 | The Magician\n女祭司 | The High Priestess';
        slotsLabel.append(slots);
        const hint = node('p', '格式：格子名称 | 别名 | 另一个别名。按收藏标题、标题栏和独立标签识别，不会因为正文随口提到就点亮；短词要独立出现，漏识别可手动关联。改名或移除格子会清除该格子的手动关联，但不会删除收藏。', 'rm-atlas-hint');
        const actions = node('div', '', 'rm-atlas-actions');
        actions.append(button('保存图鉴', () => {
            try {
                // An association may have been changed while this editor stayed
                // open. Preserve its latest committed value when saving text.
                const latest = previous ? atlases.find(item => item.id === previous.id) : null;
                const atlas = buildFavoriteAtlas({ name: name.value, slotsText: slots.value, previous: latest });
                void update(atlas, () => editor.replaceChildren());
            } catch (error) { fail(error); }
        }), button('取消', () => { editor.replaceChildren(); add.focus(); }));
        form.append(heading, nameLabel, slotsLabel, hint, actions);
        editor.append(form);
        name.focus();
    }

    function showAssociations(atlas, container, slot) {
        container.replaceChildren();
        const progress = favoriteAtlasProgress(atlas, rows);
        const selectedSlot = progress.slots.find(item => item.id === slot.id);
        const selected = new Set(selectedSlot.matches.map(item => item.id));
        const title = node('strong', `「${slot.label}」的关联收藏`);
        const hint = node('p', '勾选后保存即改为手动关联，可保留多面；全部取消后保存会熄灭格子。恢复自动识别会再次按名称和别名匹配。', 'rm-atlas-hint');
        const search = node('input');
        search.type = 'search';
        search.placeholder = '按收藏标题筛选';
        search.setAttribute('aria-label', `筛选「${slot.label}」的关联收藏`);
        search.style.cssText = 'width:100%;min-height:44px;font:inherit;';
        const picker = node('div', '', 'rm-atlas-picker');
        function paintChoices() {
            picker.replaceChildren();
            const visible = rows.filter(row => displayTitle(row).toLocaleLowerCase().includes(search.value.trim().toLocaleLowerCase()));
            if (!visible.length) picker.append(node('p', '没有找到收藏。', 'rm-atlas-hint'));
            for (const row of visible) {
                const line = node('div', '', 'rm-atlas-choice');
                const label = node('label');
                const check = node('input');
                check.type = 'checkbox';
                check.checked = selected.has(row.id);
                check.addEventListener('change', () => { if (check.checked) selected.add(row.id); else selected.delete(row.id); });
                label.append(check, node('span', displayTitle(row)));
                line.append(label, button('查看', () => open(row.id)));
                picker.append(line);
            }
        }
        search.addEventListener('input', paintChoices);
        paintChoices();
        const actions = node('div', '', 'rm-atlas-actions');
        actions.append(
            button('保存关联', () => { void update(setAtlasSelection(atlas, slot.id, [...selected])); }),
            button('恢复自动识别', () => { void update(setAtlasSelection(atlas, slot.id, null)); }),
            button('收起', () => container.replaceChildren()),
        );
        container.append(title, hint, search, picker, actions);
        search.focus();
    }

    function paint(openId = '') {
        const previouslyOpen = new Set([...list.querySelectorAll('details[open]')].map(item => item.dataset.atlasId));
        list.replaceChildren();
        for (const atlas of atlases) {
            const progress = favoriteAtlasProgress(atlas, rows);
            const box = node('details', '', 'rm-atlas-box');
            box.dataset.atlasId = atlas.id;
            box.open = previouslyOpen.has(atlas.id) || openId === atlas.id;
            const summary = node('summary', `${atlas.name} ${progress.count}/${progress.total}`);
            const bar = node('div', '', 'rm-atlas-bar');
            bar.setAttribute('role', 'progressbar');
            bar.setAttribute('aria-label', `${atlas.name}收集进度`);
            bar.setAttribute('aria-valuemin', '0');
            bar.setAttribute('aria-valuemax', String(progress.total));
            bar.setAttribute('aria-valuenow', String(progress.count));
            const fill = node('span');
            fill.style.width = `${progress.count / progress.total * 100}%`;
            bar.append(fill);
            const grid = node('div', '', 'rm-atlas-grid');
            const linkGrid = node('div', '', 'rm-atlas-grid');
            const associations = node('div');
            for (const slot of progress.slots) {
                const cell = button(slot.label, () => {
                    if (slot.matches.length) open(slot.matches[0].id);
                    else showAssociations(atlas, associations, slot);
                });
                cell.dataset.collected = String(!!slot.matches.length);
                cell.setAttribute('aria-label', slot.matches.length ? `${slot.label}，已收集 ${slot.matches.length} 面，打开收藏` : `${slot.label}，未收集，手动关联收藏`);
                cell.title = slot.matches.length ? displayTitle(slot.matches[0]) : '未收集，可手动关联';
                grid.append(cell);
                linkGrid.append(button(`${slot.label}${slot.manual ? ' · 手动' : ''}`, () => showAssociations(atlas, associations, slot)));
            }
            const tools = node('div', '', 'rm-atlas-actions');
            const manage = node('details');
            manage.append(node('summary', '关联与纠正'), linkGrid);
            const confirm = node('div', '', 'rm-atlas-confirm');
            tools.append(button('编辑图鉴', () => showEditor(atlas)), button('删除图鉴', () => {
                confirm.replaceChildren();
                confirm.append(node('p', `只删除「${atlas.name}」的图鉴和关联，收藏仍会保留。`, 'rm-atlas-hint'), button('确认删除图鉴', () => {
                    void persist(() => deleteFavoriteAtlas(atlas.id), () => {
                        atlases = atlases.filter(item => item.id !== atlas.id);
                        editor.replaceChildren();
                        paint();
                        status.textContent = '图鉴已删除，收藏已保留。';
                    });
                }), button('取消', () => confirm.replaceChildren()));
            }));
            box.append(summary, bar, grid, node('p', '点亮的格子可打开收藏；关联多面时先打开最新一面，其余可在「关联与纠正」中查看。', 'rm-atlas-hint'), manage, associations, tools, confirm);
            list.append(box);
        }
    }

    root.setFavorites = next => { rows = next; paint(); };
    void listFavoriteAtlases().then(items => {
        atlases = items;
        add.disabled = false;
        paint();
        status.textContent = items.length ? '' : '还没有自定义图鉴，点「新建图鉴」开始。';
    }).catch(error => {
        fail(error);
        const retry = button('重新读取图鉴', () => {
            retry.disabled = true;
            void listFavoriteAtlases().then(items => {
                atlases = items; add.disabled = false; paint(); status.textContent = ''; retry.remove();
            }).catch(error => { fail(error); retry.disabled = false; });
        });
        root.append(retry);
    });
    return root;
}
