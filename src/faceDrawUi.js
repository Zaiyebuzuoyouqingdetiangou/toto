import { getSettings, updateSettings } from './settings.js?rmv=1.67.42-face-atlas-test6';
import { FACE_DRAW_KINDS, FACE_DRAW_LABELS, normalizeFaceDrawRule, normalizeFaceDrawRules, normalizeFaceDrawPresets } from './faceDrawRules.js?rmv=1.67.42-face-atlas-test6';
import { loadFaceDrawCatalog, faceCategorySelection, toggleFaceCategory, toggleFaceItem } from './faceDrawCatalog.js?rmv=1.67.42-face-atlas-test6';

const owners = new WeakMap();
const MODE_LABELS = { none: '不追加', random: '随机抽取', sequence: '顺序轮播' };
const STYLE = `
.rh-face-draw{--fd-line:var(--rh-border,#bccabf);--fd-accent:var(--rh-primary,#416d48);box-sizing:border-box;min-width:0;width:100%;max-width:100%;border:1px solid var(--fd-line);border-radius:12px;padding:0 14px;margin:0 0 14px;background:var(--rh-card,transparent);overflow-wrap:anywhere;text-align:left;font-size:13px;line-height:1.6}
.rh-face-draw *{box-sizing:border-box;min-width:0;max-width:100%}
.rh-face-draw[hidden],.rh-face-draw [hidden]{display:none!important}
.rh-face-draw summary{cursor:pointer;min-height:44px;padding:12px 0;white-space:normal;overflow-wrap:anywhere;font-weight:600}
.rh-face-draw>summary small{display:block;margin-left:16px;font-size:12px;font-weight:400;opacity:.78}
.rh-face-draw .rh-fd-body{display:grid;grid-template-columns:minmax(0,1fr);gap:14px;padding-bottom:14px}
.rh-face-draw .rh-fd-note{margin:0;opacity:.85;font-size:12px;line-height:1.6}
.rh-face-draw .rh-fd-check{display:flex;align-items:flex-start;gap:8px;min-height:44px;margin:0;padding:8px 0;white-space:normal;cursor:pointer}
.rh-face-draw input[type=checkbox]{flex:0 0 auto;width:18px;height:18px;margin:3px 0 0}
.rh-face-draw button{min-height:44px;padding:8px 12px;white-space:normal;overflow-wrap:anywhere;cursor:pointer;border-radius:8px;font:inherit;line-height:1.45;color:inherit;background:transparent;border:1px solid var(--fd-line);transition:background-color .15s}
.rh-face-draw button:hover{background:color-mix(in srgb,var(--fd-accent) 7%,transparent)}
.rh-face-draw button.rh-fd-primary,#rabbit_mirror_theater_settings .rh-face-draw button.rh-fd-primary{background:var(--rh-text,#284333);color:var(--rh-card,#fff);border-color:var(--rh-text,#284333);font-weight:600}
.rh-face-draw button.rh-fd-link{border-color:transparent;text-decoration:underline;text-underline-offset:3px;padding-inline:0}
.rh-face-draw button:disabled{opacity:.55;cursor:default}
.rh-face-draw button:active{opacity:.75}
.rh-face-draw :is(button,select,input):focus-visible,.rh-face-draw summary:focus-visible{outline:2px solid currentColor;outline-offset:2px}
.rh-face-draw .rh-fd-tabs,.rh-face-draw .rh-fd-actions{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.rh-face-draw .rh-fd-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:2px;border-bottom:1px solid var(--fd-line)}
.rh-face-draw .rh-fd-tabs button{border:0;border-radius:0;padding:10px 3px}
.rh-face-draw .rh-fd-tabs button[aria-pressed=true]{font-weight:700;box-shadow:inset 0 -3px var(--fd-accent)}
.rh-face-draw .rh-fd-fields{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-end}
.rh-face-draw .rh-fd-fields>label{display:grid;gap:4px;flex:1 1 140px;margin:0;white-space:normal}
.rh-face-draw .rh-fd-fields select,.rh-face-draw .rh-fd-fields input:not([type=checkbox]){width:100%;min-height:44px;margin:0;padding:8px;font:inherit;color:inherit}
.rh-face-draw .rh-fd-section{display:grid;gap:10px;min-width:0;border-top:1px solid var(--fd-line);padding-top:14px}
.rh-face-draw .rh-fd-section:first-of-type{border-top:0;padding-top:0}
.rh-face-draw .rh-fd-section-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.rh-face-draw .rh-fd-selection{margin:0;padding:9px 11px;background:var(--rh-bg,transparent);border-radius:8px;font-size:12px;overflow-wrap:anywhere}
.rh-face-draw .rh-fd-catalog{display:grid;gap:10px}
.rh-face-draw .rh-fd-advanced{border-top:1px solid var(--fd-line)}
.rh-face-draw .rh-fd-section h4{font:inherit;font-weight:700;margin:0}
.rh-face-draw .rh-fd-category{border-top:1px solid var(--fd-line);min-width:0}
.rh-face-draw .rh-fd-category-head{display:flex;align-items:center;gap:8px}
.rh-face-draw .rh-fd-category-head>label{flex:0 0 28px;display:flex;align-items:center;min-height:44px;margin:0}
.rh-face-draw .rh-fd-category-head>button{flex:1;border:0;text-align:left;display:flex;gap:8px;justify-content:space-between;align-items:center;padding-left:0}
.rh-face-draw .rh-fd-category-head small{flex:0 0 auto;font-size:11px}
.rh-face-draw .rh-fd-items{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:0 12px;padding:0 0 8px 8px}
.rh-face-draw .rh-fd-item-title{overflow-wrap:anywhere}
.rh-face-draw .rh-fd-muted{opacity:.65}
.rh-face-draw .rh-fd-warning{border-left:3px solid currentColor;padding:7px 9px;margin:0;font-size:12px;white-space:normal}
.rh-face-draw .rh-fd-invalid{display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.rh-face-draw .rh-fd-invalid span{flex:1 1 130px}
.rh-face-draw .rh-fd-status{min-height:1.6em;white-space:normal;overflow-wrap:anywhere}
@media(prefers-reduced-motion:reduce){.rh-face-draw button{transition:none}}
`;

function el(doc, tag, text, className = '') {
    const node = doc.createElement(tag);
    if (text != null) node.textContent = text;
    if (className) node.className = className;
    return node;
}
function button(doc, text, action) {
    const node = el(doc, 'button', text); node.type = 'button';
    node.addEventListener('click', action); return node;
}
function selectField(doc, title, values, value, action) {
    const label = el(doc, 'label', title), select = el(doc, 'select', null, 'text_pole');
    for (const [id, text] of values) { const option = el(doc, 'option', text); option.value = id; select.append(option); }
    select.value = value;
    select.addEventListener('change', () => action(select.value)); label.append(select);
    return { label, input: select };
}
function inputField(doc, title, value, action, type = 'text') {
    const label = el(doc, 'label', title), input = el(doc, 'input', null, 'text_pole');
    input.type = type; input.value = String(value); if (type === 'number') { input.min = '0'; input.step = '1'; input.inputMode = 'numeric'; }
    input.addEventListener('input', () => action(input.value)); label.append(input);
    return { label, input };
}
function checkbox(doc, text, value, action) {
    const label = el(doc, 'label', null, 'rh-fd-check'), input = el(doc, 'input');
    input.type = 'checkbox'; input.checked = value;
    input.addEventListener('change', () => action(input.checked));
    label.append(input, el(doc, 'span', text, 'rh-fd-item-title'));
    return { label, input };
}
function summary(rule) {
    if (!rule.enabled) return '未启用，沿用原抽取设置';
    const parts = FACE_DRAW_KINDS.flatMap(kind => {
        const lane = rule[kind], labels = [];
        if (lane.requiredIds.length) labels.push(`常驻 ${lane.requiredIds.length} 项`);
        if (lane.mode !== 'none') labels.push(`${MODE_LABELS[lane.mode]} ${lane.min === lane.max ? lane.min : `${lane.min}–${lane.max}`} 项`);
        return labels.length ? [`${FACE_DRAW_LABELS[kind]}：${labels.join('，')}`] : [];
    });
    return parts.join('；') || '已启用，尚未选择内容';
}

function createOwner(container, dependencies) {
    const doc = container.ownerDocument;
    const style = el(doc, 'style', STYLE); container.append(style);
    const owner = { container, doc, controllers: new Map(), catalog: null, loading: false, ...dependencies };
    owner.load = async () => {
        if (owner.loading) return;
        owner.loading = true; for (const c of owner.controllers.values()) c.renderCatalog();
        try { owner.catalog = await owner.loadCatalog(owner.getSettings()); }
        catch (error) { owner.catalog = { theme: [], format: [], text: [], warnings: [`目录读取失败：${String(error?.message || error)}。请刷新重试。`] }; }
        finally {
            owner.loading = false;
            // A detached settings page must never paint into its replacement.
            if (container.isConnected) for (const c of owner.controllers.values()) c.renderCatalog();
        }
    };
    return owner;
}

function createController(owner, index, rule) {
    const { doc } = owner;
    const details = el(doc, 'details', null, 'rh-face-draw'); details.dataset.rhFaceDraw = String(index);
    const heading = el(doc, 'summary', '本面抽取设置');
    const headingState = el(doc, 'small', ''); heading.append(headingState);
    const body = el(doc, 'div', null, 'rh-fd-body'); details.append(heading, body);
    const c = { index, owner, details, draft: normalizeFaceDrawRule(rule), saved: JSON.stringify(normalizeFaceDrawRule(rule)), dirty: false, sections: [], invalidNumbers: new Set(), numberDrafts: new Map(), presetName: '' };
    const status = el(doc, 'div', '', 'rh-fd-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    const enabled = checkbox(doc, '为这一面单独设置抽取', c.draft.enabled, value => { c.draft.enabled = value; c.changed(); });
    body.append(enabled.label);
    const tabs = el(doc, 'div', null, 'rh-fd-tabs'); tabs.setAttribute('aria-label', `第 ${index + 1} 面的内容类别`);
    let activeKind = 'theme';
    for (const kind of FACE_DRAW_KINDS) {
        const tab = button(doc, FACE_DRAW_LABELS[kind], () => {
            activeKind = kind;
            for (const node of tabs.children) node.setAttribute('aria-pressed', String(node.dataset.kind === kind));
            for (const section of c.sections) { section.kind = kind; section.editing = false; section.renderControls(); }
        });
        tab.dataset.kind = kind; tab.setAttribute('aria-pressed', String(kind === activeKind)); tabs.append(tab);
    }
    body.append(tabs);
    c.changed = () => {
        c.dirty = true; status.textContent = '本面有未保存的修改。';
        headingState.textContent = `${summary(c.draft)} · 未保存`;
        renderWarnings();
    };
    function replaceDraft(next) {
        c.draft = normalizeFaceDrawRule(next); c.invalidNumbers.clear(); c.numberDrafts.clear(); enabled.input.checked = c.draft.enabled;
        for (const section of c.sections) section.renderControls(); c.changed();
    }
    function save(targetIndex = index) {
        if (c.invalidNumbers.size) { status.textContent = '数量请填写大于或等于 0 的整数，且最大值不能小于最小值。'; return false; }
        const fresh = owner.getSettings(), rules = normalizeFaceDrawRules(fresh.rabbitMirrorFaceDrawRules);
        rules[targetIndex] = normalizeFaceDrawRule(c.draft);
        try { owner.updateSettings({ rabbitMirrorFaceDrawRules: rules }); }
        catch (error) { status.textContent = `保存失败，草稿仍保留：${String(error?.message || error)}`; return false; }
        const recipient = owner.controllers.get(targetIndex);
        if (recipient) {
            recipient.replaceDraft(rules[targetIndex]); recipient.saved = JSON.stringify(rules[targetIndex]); recipient.dirty = false;
            recipient.headingState.textContent = rules[targetIndex].enabled ? summary(rules[targetIndex]) : '沿用原抽取设置';
            recipient.status.textContent = targetIndex === index ? '本面设置已保存，下一次新抽取时生效。' : `已复制第 ${index + 1} 面的搭配；本面的呈现方式未改变。`;
        }
        if (targetIndex !== index) status.textContent = `已复制并保存到第 ${targetIndex + 1} 面，呈现方式未改变。`;
        return true;
    }

    function createSection(resident) {
        const node = el(doc, 'section', null, 'rh-fd-section');
        const sectionHeading = el(doc, 'div', null, 'rh-fd-section-head');
        sectionHeading.append(el(doc, 'strong', resident ? '常驻内容' : '其余内容怎么抽'));
        const sectionBody = el(doc, 'div', null, 'rh-fd-body');
        node.append(sectionHeading, sectionBody);
        const selection = el(doc, 'p', '', 'rh-fd-selection');
        const controls = el(doc, 'div'), catalog = el(doc, 'div', null, 'rh-fd-catalog'), tree = el(doc, 'div');
        sectionBody.append(controls, selection, catalog); body.append(node);
        const section = { resident, kind: activeKind, source: 'all', query: '', expanded: new Set(), node, tree, controls, editing: false };
        const edit = button(doc, resident ? '选择常驻' : '选择范围', () => {
            section.editing = !section.editing; section.renderControls();
            if (!owner.catalog && !owner.loading) owner.load();
        }); sectionHeading.append(edit);
        section.renderSelection = () => {
            const lane = c.draft[section.kind], categories = owner.catalog?.[section.kind] || [];
            const titles = new Map(categories.flatMap(category => category.items).map(item => [item.id, item.title]));
            const ids = resident ? lane.requiredIds : lane.itemIds;
            const labels = [...(!resident ? lane.categoryIds.map(id => categories.find(category => category.id === id)?.title || id).map(name => `${name}（整类）`) : []), ...ids.map(id => titles.get(id) || id)];
            selection.textContent = resident ? (labels.length ? `每次必出：${labels.join('、')}` : '未选常驻，可只使用下面的随机或轮播。')
                : lane.mode === 'none' ? '不再追加，只使用本类的常驻内容。'
                : lane.scope === 'all' ? '从本类全部可用条目中抽取。' : (labels.length ? `抽取范围：${labels.join('、')}` : '还没有选择范围，请勾选分类或条目。');
        };
        section.renderControls = () => {
            controls.replaceChildren();
            const lane = c.draft[section.kind];
            const canEdit = resident || (lane.mode !== 'none' && lane.scope === 'selected');
            edit.hidden = !canEdit; edit.textContent = section.editing ? '收起选择' : resident ? '选择常驻' : '选择范围';
            edit.setAttribute('aria-expanded', String(section.editing && canEdit));
            catalog.hidden = !section.editing || !canEdit;
            section.renderSelection();
            if (!resident) {
                const fields = el(doc, 'div', null, 'rh-fd-fields');
                fields.append(selectField(doc, '抽取方式', Object.entries(MODE_LABELS), lane.mode, value => { lane.mode = value; c.changed(); section.renderControls(); }).label);
                if (lane.mode !== 'none') {
                    fields.append(selectField(doc, '抽取范围', [['all', '全部可用条目'], ['selected', '只在勾选范围']], lane.scope, value => { lane.scope = value; section.editing = value === 'selected'; c.changed(); section.renderControls(); }).label);
                    for (const field of ['min', 'max']) {
                        const key = `${section.kind}:${field}`;
                        const number = inputField(doc, field === 'min' ? '最少追加（项）' : '最多追加（项）', c.numberDrafts.get(key) ?? lane[field], value => {
                            c.numberDrafts.set(key, value);
                            const parsed = Number(value);
                            if (value.trim() === '' || !Number.isSafeInteger(parsed) || parsed < 0) c.invalidNumbers.add(key);
                            else { lane[field] = parsed; c.invalidNumbers.delete(key); }
                            const pairKey = `${section.kind}:range`;
                            if (lane.max < lane.min) c.invalidNumbers.add(pairKey); else c.invalidNumbers.delete(pairKey);
                            c.changed();
                        }, 'number');
                        fields.append(number.label);
                    }
                }
                controls.append(fields);
                if (lane.mode === 'sequence') controls.append(el(doc, 'p', '顺序按下方分类与条目目录依次轮播。生成成功并保存后才前进；失败重试继续本次选择。', 'rh-fd-note'));
            }
            const filters = el(doc, 'div', null, 'rh-fd-fields');
            filters.append(selectField(doc, '来源', [['all', '内置 + 已启用外置库'], ['builtin', '内置'], ['external', '已启用外置库']], section.source, value => { section.source = value; section.renderTree(); }).label);
            filters.append(inputField(doc, '查找', section.query, value => { section.query = value; section.renderTree(); }, 'search').label);
            catalog.replaceChildren(filters, tree, button(doc, '刷新条目目录', () => owner.load()));
            section.renderTree();
        };
        section.renderTree = () => {
            section.renderSelection();
            const focused = tree.contains(doc.activeElement) ? doc.activeElement?.dataset?.fdFocus : '';
            tree.replaceChildren(); const lane = c.draft[section.kind];
            if (!section.editing || (!resident && (lane.mode === 'none' || lane.scope === 'all'))) return;
            if (owner.loading) { tree.append(el(doc, 'p', '正在读取条目目录…', 'rh-fd-note')); return; }
            if (!owner.catalog) return;
            const query = section.query.trim().toLocaleLowerCase('zh-Hans-CN');
            const categories = owner.catalog[section.kind] || [];
            let shown = 0;
            for (const category of categories) {
                if (section.source !== 'all' && category.source !== section.source) continue;
                const categoryMatch = category.title.toLocaleLowerCase('zh-Hans-CN').includes(query);
                const items = category.items.filter(item => !query || categoryMatch || item.title.toLocaleLowerCase('zh-Hans-CN').includes(query));
                if (!items.length) continue; shown += 1;
                const group = el(doc, 'div', null, 'rh-fd-category');
                const head = el(doc, 'div', null, 'rh-fd-category-head');
                const state = faceCategorySelection(lane, category, resident);
                const checkLabel = el(doc, 'label'), check = el(doc, 'input'); check.type = 'checkbox'; check.checked = state.checked; check.indeterminate = state.mixed; check.disabled = !state.total;
                check.setAttribute('aria-label', `全选${category.title}`);
                check.dataset.fdFocus = `category:${category.id}`;
                check.addEventListener('change', () => { toggleFaceCategory(lane, category, check.checked, resident); c.changed(); c.renderCatalog(); });
                checkLabel.append(check);
                const key = `${section.kind}:${category.id}`, open = !!query || section.expanded.has(key);
                const expand = button(doc, '', () => { if (section.expanded.has(key)) section.expanded.delete(key); else section.expanded.add(key); section.renderTree(); });
                expand.dataset.fdFocus = `expand:${category.id}`;
                expand.setAttribute('aria-expanded', String(open));
                expand.append(el(doc, 'span', `${category.title}${category.source === 'external' ? ' · 外置' : ''}`), el(doc, 'small', `${state.count}/${state.total} ${open ? '收起' : '展开'}`));
                head.append(checkLabel, expand); group.append(head);
                if (open) {
                    const rows = el(doc, 'div', null, 'rh-fd-items');
                    const picked = new Set(resident ? lane.requiredIds : lane.itemIds);
                    const all = !resident && lane.categoryIds.includes(category.id);
                    for (const item of items) {
                        const on = picked.has(item.id) || (all && !item.blocked);
                        const row = checkbox(doc, `${item.title}${item.blocked ? '（黑名单）' : ''}`, on, value => { toggleFaceItem(lane, category, item.id, value, resident); c.changed(); c.renderCatalog(); });
                        row.input.disabled = item.blocked; row.input.dataset.faceDrawItem = item.id;
                        row.input.dataset.fdFocus = `item:${item.id}`;
                        if (item.blocked) row.label.classList.add('rh-fd-muted'); rows.append(row.label);
                    }
                    group.append(rows);
                }
                tree.append(group);
            }
            if (!shown) tree.append(el(doc, 'p', '没有匹配的可用条目。外置条目需要先导入母本库、完成分类并启用。', 'rh-fd-note'));
            if (!resident) tree.append(el(doc, 'p', '勾选大分类会包含该分类的可用条目，包括以后新增的条目；取消其中一项后，改为保留当前勾选的小条目。可以跨分类勾选。', 'rh-fd-note'));
            if (focused) {
                const replacement = [...tree.querySelectorAll('[data-fd-focus]')].find(node => node.dataset.fdFocus === focused);
                try { replacement?.focus({ preventScroll: true }); } catch { replacement?.focus(); }
            }
        };
        c.sections.push(section); section.renderControls();
    }
    createSection(true); createSection(false);
    const warnings = el(doc, 'div'); body.append(warnings);
    function renderWarnings() {
        if (!warnings) return;
        warnings.replaceChildren();
        if (c.invalidNumbers.size) warnings.append(el(doc, 'p', '追加数量需为非负整数，且最多不能小于至少。', 'rh-fd-warning'));
        for (const warning of owner.catalog?.warnings || []) warnings.append(el(doc, 'p', warning, 'rh-fd-warning'));
        if (owner.loading || !owner.catalog) return;
        for (const kind of FACE_DRAW_KINDS) {
            const lane = c.draft[kind], categories = owner.catalog[kind] || [];
            const items = new Map(categories.flatMap(category => category.items).map(item => [item.id, item]));
            for (const field of ['requiredIds', 'itemIds', 'categoryIds']) {
                for (const id of lane[field]) {
                    const item = field === 'categoryIds' ? categories.find(category => category.id === id) : items.get(id);
                    if (item && !item.blocked) continue;
                    const row = el(doc, 'div', null, 'rh-fd-invalid rh-fd-warning');
                    row.append(el(doc, 'span', `${FACE_DRAW_LABELS[kind]} · ${field === 'requiredIds' ? '常驻' : '范围'}：${item?.title || id}（${item?.blocked ? '与黑名单冲突' : '目录中暂不可用'}，选择仍保留）`), button(doc, '移除此选择', () => { lane[field] = lane[field].filter(value => value !== id); c.changed(); c.renderCatalog(); })); warnings.append(row);
                }
            }
            if (lane.requiredIds.length + (lane.mode === 'none' ? 0 : lane.max) > 16) warnings.append(el(doc, 'p', `${FACE_DRAW_LABELS[kind]}常驻加追加可能超过现有单面单类 16 项的保存格式上限。这里保留你的选择，请减少本次出场数以免生成前校验失败。候选范围不受这个数量影响。`, 'rh-fd-warning'));
        }
    }
    const actions = el(doc, 'div', null, 'rh-fd-actions');
    const saveButton = button(doc, '保存本面', () => save()); saveButton.dataset.faceDrawSave = String(index); saveButton.classList.add('rh-fd-primary');
    actions.append(saveButton); body.append(actions, status);
    const copyFields = el(doc, 'div', null, 'rh-fd-fields');
    const copySelect = selectField(doc, '复制到另一面', Array.from({ length: 5 }, (_, i) => i).filter(i => i !== index).map(i => [String(i), `第 ${i + 1} 面`]), String(index === 0 ? 1 : 0), () => {});
    copyFields.append(copySelect.label, button(doc, '复制并保存', () => save(Number(copySelect.input.value))));
    const presetDetails = el(doc, 'details', null, 'rh-fd-advanced'); presetDetails.append(el(doc, 'summary', '复制本面 / 保存搭配'));
    const presetBody = el(doc, 'div', null, 'rh-fd-body'); presetBody.append(el(doc, 'p', '搭配是这套勾选与抽取规则的副本。套用后仍可单独修改，不会联动其他面，也不会改变 HTML / 长文本的呈现方式。', 'rh-fd-note'));
    presetBody.append(copyFields);
    const nameFields = el(doc, 'div', null, 'rh-fd-fields');
    const name = inputField(doc, '搭配名称', '', value => { c.presetName = value; });
    nameFields.append(name.label, button(doc, '保存当前搭配', () => {
        if (c.invalidNumbers.size) { status.textContent = '请先修正追加数量。'; return; }
        if (!c.presetName.trim()) { status.textContent = '请给这套搭配填写名称。'; name.input.focus(); return; }
        const presets = normalizeFaceDrawPresets(owner.getSettings().rabbitMirrorFaceDrawPresets);
        const id = globalThis.crypto?.randomUUID?.() || `face-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        presets.push({ id, name: c.presetName.trim(), rule: normalizeFaceDrawRule(c.draft) });
        try { owner.updateSettings({ rabbitMirrorFaceDrawPresets: presets }); for (const controller of owner.controllers.values()) controller.renderPresets(); status.textContent = '搭配已保存。本面的修改仍需点击「保存本面」生效。'; }
        catch (error) { status.textContent = `保存搭配失败：${String(error?.message || error)}`; }
    })); presetBody.append(nameFields);
    const presetFields = el(doc, 'div', null, 'rh-fd-fields'); presetBody.append(presetFields);
    c.renderPresets = () => {
        const presets = normalizeFaceDrawPresets(owner.getSettings().rabbitMirrorFaceDrawPresets);
        presetFields.replaceChildren();
        const field = selectField(doc, '已保存搭配', [['', presets.length ? '请选择搭配' : '还没有保存搭配'], ...presets.map(preset => [preset.id, preset.name])], '', () => {});
        presetFields.append(field.label, button(doc, '套用到本面', () => {
            const preset = normalizeFaceDrawPresets(owner.getSettings().rabbitMirrorFaceDrawPresets).find(item => item.id === field.input.value);
            if (!preset) { status.textContent = '请先选择一套搭配。'; return; }
            replaceDraft(preset.rule); status.textContent = '已套用到本面草稿，呈现方式未改变。点击「保存本面」后生效。';
        }));
    };
    presetDetails.append(presetBody); body.append(presetDetails);
    c.status = status; c.headingState = headingState; c.replaceDraft = replaceDraft;
    c.renderCatalog = () => { for (const section of c.sections) section.renderTree(); renderWarnings(); };
    c.refresh = next => {
        const normalized = normalizeFaceDrawRule(next), key = JSON.stringify(normalized);
        if (!c.dirty && key !== c.saved) { replaceDraft(normalized); c.dirty = false; c.saved = key; status.textContent = ''; }
        if (!c.dirty) headingState.textContent = normalized.enabled ? summary(normalized) : '沿用原抽取设置';
        c.renderPresets();
    };
    details.addEventListener('toggle', () => { if (details.open && !owner.catalog && !owner.loading) owner.load(); });
    c.renderPresets(); renderWarnings();
    return c;
}

// Public DOM seam also used by the browser fixture. Existing settings controls
// stay in place; the only added nodes are inline disclosures after each face.
export function renderFaceDrawSettings(container, settings = getSettings(), dependencies = {}) {
    if (!container) return;
    let owner = owners.get(container);
    if (!owner) {
        owner = createOwner(container, { getSettings, updateSettings, loadCatalog: loadFaceDrawCatalog, ...dependencies });
        owners.set(container, owner);
    }
    const rules = normalizeFaceDrawRules(settings.rabbitMirrorFaceDrawRules);
    const count = Math.min(5, Math.max(1, Number(settings.rabbitMirrorFaceCount) || 1));
    for (let index = 0; index < 5; index += 1) {
        const row = container.querySelector(`[data-rh-presentation-row="${index}"]`);
        if (!row) continue;
        let controller = owner.controllers.get(index);
        if (!controller) { controller = createController(owner, index, rules[index]); owner.controllers.set(index, controller); row.after(controller.details); }
        controller.details.hidden = index >= count;
        controller.refresh(rules[index]);
    }
}
