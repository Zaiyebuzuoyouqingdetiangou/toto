import { listExternalLibraryEntryChoices, reclassifyExternalLibraryEntries } from './store.js?rmv=1.5.53-text1';

const LABELS = { theme: '主题元素', format: '展现形式', text: '纯文本', auxiliary: '辅助片段', pending: '待确认', mixed: '混合型', ignore: '忽略' };
const PAGE_SIZE = 50;

// Selection is local to this editor. It never changes the independent draw
// enabled checkboxes, and only lightweight titles/IDs are loaded for display.
export function openExternalReclassificationPanel(container, library, { onSaved = () => {}, isCurrent = () => true } = {}) {
    const doc = container.ownerDocument;
    const make = (tag, text = '') => { const node = doc.createElement(tag); node.textContent = text; return node; };
    const panel = make('section'); panel.setAttribute('data-rh-reclassification', 'true');
    const alive = () => panel.isConnected && isCurrent();
    let page = 0, query = '', all = false, busy = false, sequence = 0;
    const ids = new Set(), excluded = new Set();
    const controls = make('fieldset'); controls.style.cssText = 'border:0;padding:0;min-width:0;';
    const heading = make('h3', `${library.displayName}：重新分类`);
    const help = make('p', '可修改已分类的主题元素、展现形式和文本类。全选整本会包含其他页及搜索范围外的这些条目；辅助片段、待确认等保持原样。原文、摘要与参与抽签的启用状态不变。');
    help.style.cssText = 'font-size:13px;line-height:1.6;';
    const searchLabel = make('label', '按标题查找');
    const search = make('input'); search.type = 'search'; search.className = 'rh-external-input'; search.style.cssText = 'width:100%;min-height:44px;box-sizing:border-box;'; searchLabel.append(search);
    const toolbar = make('div'); toolbar.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin:8px 0;';
    const action = (label, fn, parent = toolbar) => { const b = make('button', label); b.type = 'button'; b.className = 'rh-external-button'; b.style.minHeight = '44px'; b.addEventListener('click', fn); parent.append(b); return b; };
    const status = make('p'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    const selected = make('p'); selected.setAttribute('data-rh-reclass-selection', 'true');
    const list = make('div'); list.setAttribute('data-rh-reclass-list', 'true');
    const footer = make('div'); footer.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin:8px 0;align-items:center;';
    const targetLabel = make('label', '改为'); const target = make('select'); target.className = 'rh-external-input'; target.style.minHeight = '44px'; target.setAttribute('aria-label', '重新分类目标');
    for (const kind of ['text', 'theme', 'format']) { const option = make('option', LABELS[kind]); option.value = kind; target.append(option); }
    targetLabel.append(target); footer.append(targetLabel);
    const apply = action('应用重新分类', async () => {
        if (busy || (!all && !ids.size)) return;
        busy = true; controls.disabled = true; status.textContent = '正在保存分类…';
        let saved;
        try {
            saved = await reclassifyExternalLibraryEntries(library.libraryId, all ? { all: true, excludedIds: [...excluded] } : { ids: [...ids] }, target.value);
        } catch (error) {
            if (alive()) status.textContent = String(error?.message || '分类未保存，请重试；原有内容和选择保持不变。');
            return;
        } finally { busy = false; controls.disabled = false; }
        all = false; ids.clear(); excluded.clear();
        if (alive()) {
            page = 0;
            await loadPage(`已保存：选中 ${saved.selectedCount} 条，修改 ${saved.changedCount} 条为${LABELS[target.value]}。原文和启用状态保留。`);
        }
        try { await onSaved(saved); } catch { if (alive()) status.textContent += ' 列表刷新失败，可重新打开查看已保存分类。'; }
    }, footer);
    const sync = () => {
        selected.textContent = all ? `已全选整本可重新分类条目（跨页），排除 ${excluded.size} 条。` : `已选择 ${ids.size} 条（跨页保留）。`;
        apply.disabled = busy || (!all && !ids.size);
        for (const input of list.querySelectorAll('input[type="checkbox"]')) input.checked = all ? !excluded.has(input.value) && !input.disabled : ids.has(input.value);
    };
    const filter = () => { if (busy) return; query = search.value.trim().slice(0, 200); page = 0; void loadPage(); };
    action('查找条目', filter);
    action('全选整本（跨页）', () => { all = true; ids.clear(); excluded.clear(); sync(); });
    action('全选本页', () => { for (const input of list.querySelectorAll('input[type="checkbox"]')) if (!input.disabled) { if (all) excluded.delete(input.value); else ids.add(input.value); } sync(); });
    action('取消全选', () => { all = false; ids.clear(); excluded.clear(); sync(); });
    action('收起重新分类', () => { sequence++; panel.remove(); });
    search.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); filter(); } });
    const pager = make('div'); pager.style.cssText = 'display:flex;gap:8px;';
    const previous = action('上一页', () => { page--; void loadPage(); }, pager);
    const next = action('下一页', () => { page++; void loadPage(); }, pager);
    controls.append(searchLabel, toolbar, selected, footer, list, pager);
    panel.append(heading, help, status, controls); container.hidden = false; container.replaceChildren(panel);
    async function loadPage(notice = '') {
        const ticket = ++sequence;
        previous.disabled = true; next.disabled = true; list.replaceChildren();
        status.textContent = notice || '正在读取条目…'; sync();
        try {
            const result = await listExternalLibraryEntryChoices(library.libraryId, { offset: page * PAGE_SIZE, pageSize: PAGE_SIZE, query });
            if (!alive() || ticket !== sequence) return;
            for (const choice of result.choices) {
                const label = make('label'); label.style.cssText = 'display:flex;align-items:center;gap:10px;min-height:44px;padding:7px 0;border-bottom:1px solid color-mix(in srgb,currentColor 12%,transparent);overflow-wrap:anywhere;';
                const input = make('input'); input.type = 'checkbox'; input.value = choice.externalId; input.disabled = !choice.reclassifiable;
                const text = make('span', `${choice.title}（${LABELS[choice.classification] || choice.classification}；${choice.enabled ? '已启用' : '已停用'}${choice.reclassifiable ? '' : '；本次不改类'}）`);
                label.append(input, text); list.append(label);
                input.addEventListener('change', () => { if (all) { if (input.checked) excluded.delete(input.value); else excluded.add(input.value); } else if (input.checked) ids.add(input.value); else ids.delete(input.value); sync(); });
            }
            previous.disabled = page === 0; next.disabled = !result.hasNext;
            status.textContent = notice || `第 ${page + 1} 页，本页 ${result.choices.length} 条。勾选仅用于本次重新分类，点击应用后保存。`;
            sync();
        } catch (error) { if (alive() && ticket === sequence) status.textContent = String(error?.message || '读取失败，请重新打开。'); }
    }
    void loadPage();
    return panel;
}
