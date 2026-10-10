import {
    buildFavoriteAtlas, deleteFavoriteAtlas, favoriteAtlasProgress, parseAtlasSlots,
    listFavoriteAtlases, saveFavoriteAtlas, setAtlasSelection,
} from './favoriteAtlases.js?rmv=1.67.42-face-atlas-test7';
import { createFavoriteAtlasDraftGenerator } from './favoriteAtlasGeneration.js?rmv=1.67.42-face-atlas-test7';

const STYLE = `
[data-rm-favorite-atlases]{margin-top:16px;font-size:14px;line-height:1.6;min-width:0;max-width:100%;overflow-wrap:anywhere}
[data-rm-favorite-atlases] *{box-sizing:border-box}
[data-rm-favorite-atlases] [hidden]{display:none!important}
[data-rm-favorite-atlases] button,[data-rm-favorite-atlases] summary{min-height:44px}
[data-rm-favorite-atlases] button{padding:8px 12px;border:1px solid var(--rh-border,#aaa);border-radius:10px;background:transparent;color:inherit;white-space:normal;overflow-wrap:anywhere}
[data-rm-favorite-atlases] button:disabled{opacity:.5;cursor:default}
[data-rm-favorite-atlases] button:not(:disabled):hover{background:color-mix(in srgb,currentColor 8%,transparent)}
[data-rm-favorite-atlases] button:not(:disabled):active{background:color-mix(in srgb,currentColor 14%,transparent)}
[data-rm-favorite-atlases] button.rm-atlas-primary{background:var(--rh-text,#284333);border-color:var(--rh-text,#284333);color:var(--rh-card,#fff);font-weight:600}
[data-rm-favorite-atlases] button.rm-atlas-primary:not(:disabled):is(:hover,:active){background:var(--rh-text,#284333);filter:brightness(.92)}
[data-rm-favorite-atlases] button.rm-atlas-tertiary{border-color:transparent;text-decoration:underline;text-underline-offset:3px}
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
.rm-atlas-form{display:flex;flex-direction:column;gap:16px;padding:20px 0;border-block:1px solid color-mix(in srgb,currentColor 16%,transparent);margin:16px 0}
.rm-atlas-form>strong{font-size:18px;line-height:1.3;font-weight:600}
.rm-atlas-form label{display:flex;flex-direction:column;gap:5px;font-weight:600}
.rm-atlas-form input,.rm-atlas-form textarea{width:100%;min-width:0;min-height:44px;padding:10px;border:1px solid var(--rh-border,#aaa);border-radius:6px;background:var(--rh-field,transparent);color:inherit;font:inherit;font-size:16px}
.rm-atlas-form textarea{min-height:160px;resize:vertical}
.rm-atlas-hint{font-size:13px;margin:6px 0;overflow-wrap:anywhere;max-width:65ch}
.rm-atlas-status{min-height:1.5em;margin:6px 0;overflow-wrap:anywhere}
.rm-atlas-status:empty{display:none}
.rm-atlas-draft-head{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
.rm-atlas-draft-head strong{font-variant-numeric:tabular-nums}
.rm-atlas-slot-edit{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.7fr) auto;gap:10px;align-items:end;padding:14px 0;border-bottom:1px solid color-mix(in srgb,currentColor 12%,transparent)}
.rm-atlas-slot-edit>label{min-width:0;font-size:12px;font-weight:500}
.rm-atlas-slot-edit[hidden]{display:none}
.rm-atlas-draft-preview{padding:12px;border-inline-start:3px solid var(--rh-primary,#416f45);background:color-mix(in srgb,currentColor 5%,transparent)}
.rm-atlas-draft-preview:empty{display:none}
.rm-atlas-draft-preview p{margin:0 0 8px}
.rm-atlas-empty{margin:4px 0;padding:12px 0}
.rm-atlas-bulk>summary{cursor:pointer;align-content:center}
.rm-atlas-bulk>label{margin:8px 0}
.rm-atlas-picker{max-height:300px;overflow:auto;margin:8px 0;border:1px solid var(--rh-border,#aaa);border-radius:10px;padding:4px 8px}
.rm-atlas-choice{display:flex;align-items:center;gap:8px;border-bottom:1px solid color-mix(in srgb,currentColor 10%,transparent)}
.rm-atlas-choice>label{display:flex;align-items:center;gap:8px;min-height:44px;flex:1;min-width:0;overflow-wrap:anywhere}
.rm-atlas-choice>label>span{min-width:0;overflow-wrap:anywhere}
.rm-atlas-choice input{flex:0 0 auto;width:20px;height:20px}
.rm-atlas-choice button{flex:0 0 auto}
.rm-atlas-confirm{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
.rm-atlas-confirm p{flex-basis:100%}
@media(max-width:380px){.rm-atlas-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:540px){.rm-atlas-slot-edit{grid-template-columns:minmax(0,1fr) auto}.rm-atlas-slot-edit>label:nth-child(2){grid-column:1 / -1;grid-row:2}.rm-atlas-slot-edit>button{grid-column:2;grid-row:1}}
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
export function createFavoriteAtlasPanel({ favorites, openFavorite, displayTitle, generateDraft = createFavoriteAtlasDraftGenerator() }) {
    let rows = favorites, atlases = [], busy = false;
    let activeEditor = null;
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
        activeEditor?.cancel();
        editor.replaceChildren();
        const form = node('div', '', 'rm-atlas-form');
        const session = { generating: false, cancel() { if (session.generating) generateDraft.cancel?.(); session.closed = true; } };
        activeEditor = session;
        const heading = node('strong', previous ? `编辑「${previous.name}」` : '新建图鉴');
        const nameLabel = node('label', '图鉴名称');
        const name = node('input');
        name.dataset.atlasName = 'true';
        name.type = 'text';
        name.value = previous?.name || '';
        name.placeholder = '例如：塔罗牌图鉴';
        nameLabel.append(name);
        const localStatus = node('p', '', 'rm-atlas-status');
        localStatus.setAttribute('role', 'status');
        localStatus.setAttribute('aria-live', 'polite');
        const draftSection = node('section');
        draftSection.setAttribute('aria-label', '图鉴格子草稿');
        const draftHead = node('div', '', 'rm-atlas-draft-head');
        const count = node('strong');
        const searchLabel = node('label', '查找格子');
        const search = node('input');
        search.type = 'search';
        search.placeholder = '名称或识别词';
        searchLabel.append(search);
        const slotList = node('div');
        const preview = node('div', '', 'rm-atlas-draft-preview');
        const editableSlot = slot => {
            const originalAliases = slot.keywords.filter(word => word !== slot.label);
            return { label: slot.label, aliases: originalAliases.join('，'), originalAliases };
        };
        let drafts = (previous?.slots || []).map(editableSlot);
        const failDraft = error => { localStatus.textContent = error?.code === 'ABORTED' ? '已停止生成，当前草稿已保留。' : `未完成：${error?.message || error}`; };
        function slotText() {
            return drafts.map(slot => {
                if (/[|\r\n\0]/.test(slot.label)) throw new Error('格子名称请使用单行文字，不含竖线。');
                // Saving an untouched field preserves aliases containing a comma.
                // Separators apply only when the user actually edits that field.
                const aliases = slot.originalAliases ?? slot.aliases.split(/[,，、;；|\r\n]+/).map(word => word.trim()).filter(Boolean);
                return [slot.label.trim(), ...aliases].join(' | ');
            }).join('\n');
        }
        function filterSlots() {
            const query = search.value.trim().toLocaleLowerCase();
            [...slotList.children].forEach((line, i) => { if (drafts[i]) line.hidden = !!query && !`${drafts[i].label} ${drafts[i].aliases}`.toLocaleLowerCase().includes(query); });
        }
        function paintSlots() {
            count.textContent = `${drafts.length} 个格子`;
            searchLabel.hidden = drafts.length === 0;
            save.disabled = drafts.length === 0;
            generate.classList.toggle('rm-atlas-primary', drafts.length === 0);
            save.classList.toggle('rm-atlas-primary', drafts.length > 0);
            slotList.replaceChildren();
            if (!drafts.length) slotList.append(node('p', '先填名称，一次生成格子和识别词；也可以自己添加。', 'rm-atlas-empty'));
            drafts.forEach((slot, index) => {
                const line = node('div', '', 'rm-atlas-slot-edit');
                const titleLabel = node('label', '格子名称');
                const title = node('input');
                title.value = slot.label; title.dataset.atlasSlotLabel = String(index);
                title.addEventListener('input', () => { slot.label = title.value; });
                titleLabel.append(title);
                const aliasLabel = node('label', '识别词 · 用逗号分隔');
                const aliases = node('input');
                aliases.value = slot.aliases; aliases.dataset.atlasSlotKeywords = String(index);
                aliases.placeholder = '例如：The Fool，0号愚者牌';
                aliases.addEventListener('input', () => { slot.aliases = aliases.value; delete slot.originalAliases; });
                aliasLabel.append(aliases);
                const remove = button('移除', () => { drafts.splice(index, 1); paintSlots(); });
                remove.className = 'rm-atlas-tertiary';
                remove.setAttribute('aria-label', `移除第 ${index + 1} 个格子`);
                line.append(titleLabel, aliasLabel, remove); slotList.append(line);
            });
            filterSlots();
        }
        search.addEventListener('input', filterSlots);
        const addSlot = button('添加格子', () => {
            drafts.push({ label: '', aliases: '' }); search.value = ''; paintSlots();
            slotList.lastElementChild?.querySelector('input')?.focus();
        });
        addSlot.className = 'rm-atlas-tertiary';
        draftHead.append(count, addSlot);
        draftSection.append(draftHead, searchLabel, slotList);
        const bulk = node('details', '', 'rm-atlas-bulk');
        const bulkLabel = node('label', '每行一个格子，别名用 | 分隔');
        const bulkText = node('textarea');
        bulkText.placeholder = '愚者 | The Fool\n魔术师 | The Magician';
        bulkLabel.append(bulkText);
        const applyBulk = button('填入这些格子', () => {
            try {
                const parsed = parseAtlasSlots(bulkText.value);
                if (!parsed.length) throw new Error('请先填写要粘贴的格子。');
                drafts = parsed.map(editableSlot);
                preview.replaceChildren(); search.value = ''; paintSlots(); bulk.open = false;
            } catch (error) { failDraft(error); }
        });
        applyBulk.className = 'rm-atlas-tertiary';
        bulk.append(node('summary', '批量粘贴（可选）'), bulkLabel, applyBulk);
        const generate = button('按名称生成草稿', async () => {
            if (session.generating || busy) return;
            if (!name.value.trim()) { failDraft(new Error('请先填写图鉴名称。')); name.focus(); return; }
            session.generating = true;
            form.setAttribute('aria-busy', 'true');
            const controls = [...form.querySelectorAll('button,input,textarea')].filter(control => control !== cancel).map(control => [control, control.disabled]);
            controls.forEach(([control]) => { control.disabled = true; });
            localStatus.textContent = '正在识别相关条目并生成草稿…';
            let observer;
            if (typeof MutationObserver === 'function' && root.isConnected) {
                observer = new MutationObserver(() => { if (!root.isConnected || !form.isConnected) session.cancel(); });
                observer.observe(document.documentElement, { childList: true, subtree: true });
            }
            try {
                const result = await generateDraft(name.value.trim());
                if (session.closed || activeEditor !== session || !form.isConnected) return;
                const apply = () => {
                    drafts = result.slots.map(editableSlot);
                    search.value = ''; paintSlots(); preview.replaceChildren();
                    localStatus.textContent = `已填入 ${drafts.length} 个格子。可以编辑，保存后才会更新图鉴。`;
                };
                const sources = result.relatedEntries.map(item => item.title).join('、');
                if (drafts.length) {
                    preview.replaceChildren(); preview.className = 'rm-atlas-draft-preview';
                    const actions = node('div', '', 'rm-atlas-actions');
                    const useDraft = button('采用这份草稿', apply);
                    useDraft.dataset.atlasApplyDraft = 'true';
                    actions.append(useDraft, button('保留当前内容', () => preview.replaceChildren()));
                    preview.append(node('p', `新草稿共 ${result.slots.length} 格，参考条目：${sources}。`), node('p', result.slots.map(slot => slot.label).join(' · '), 'rm-atlas-hint'), actions);
                    localStatus.textContent = '草稿已生成，当前编辑内容仍保留。';
                } else { apply(); localStatus.textContent += ` 参考条目：${sources}。`; }
            } catch (error) { if (!session.closed && activeEditor === session) failDraft(error); }
            finally {
                observer?.disconnect(); session.generating = false;
                if (!session.closed && activeEditor === session) {
                    form.removeAttribute('aria-busy');
                    controls.forEach(([control, disabled]) => { if (control.isConnected) control.disabled = disabled; });
                    save.disabled = drafts.length === 0;
                }
            }
        });
        generate.dataset.atlasGenerate = 'true';
        const generateHint = node('p', '使用兔子镜已配置的副 API，请求一次。参考内置与已启用外置库的主题、形式名称；不附带聊天或收藏正文。', 'rm-atlas-hint');
        const hint = node('p', '格子名称也会参与识别。按收藏标题、标题栏和独立标签点亮；漏识别可手动关联。', 'rm-atlas-hint');
        const actions = node('div', '', 'rm-atlas-actions');
        const save = button('保存图鉴', () => {
            if (session.generating) return;
            try {
                // An association may have been changed while this editor stayed
                // open. Preserve its latest committed value when saving text.
                const latest = previous ? atlases.find(item => item.id === previous.id) : null;
                const atlas = buildFavoriteAtlas({ name: name.value, slotsText: slotText(), previous: latest });
                void update(atlas, () => { session.cancel(); activeEditor = null; editor.replaceChildren(); });
            } catch (error) { failDraft(error); }
        });
        save.dataset.atlasSave = 'true';
        const cancel = button('取消', () => { session.cancel(); activeEditor = null; editor.replaceChildren(); add.focus(); });
        cancel.className = 'rm-atlas-tertiary';
        actions.append(save, cancel);
        form.append(heading, nameLabel, generate, generateHint, localStatus, preview, draftSection, hint, bulk, actions);
        editor.append(form);
        paintSlots();
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
