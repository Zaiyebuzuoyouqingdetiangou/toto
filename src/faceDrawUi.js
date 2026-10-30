import { rmT as __rmT } from "./textTable.js?rmv=2.1.8";
import { getSettings, updateSettings } from './settings.js?rmv=2.1.8';
import { FACE_DRAW_KINDS, FACE_DRAW_LABELS, normalizeFaceDrawRule, normalizeFaceDrawRules, normalizeFaceDrawPresets } from './faceDrawRules.js?rmv=2.1.8';
import { loadFaceDrawCatalog, faceCategorySelection, toggleFaceCategory, toggleFaceItem } from './faceDrawCatalog.js?rmv=2.1.8';
const owners = new WeakMap();
const MODE_LABELS = { none: __rmT("ssAtjKAH"), random: __rmT("xUqCFXw6YBC") };
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
    if (text != null)
        node.textContent = text;
    if (className)
        node.className = className;
    return node;
}
function button(doc, text, action) {
    const node = el(doc, 'button', text);
    node.type = 'button';
    node.addEventListener('click', action);
    return node;
}
function selectField(doc, title, values, value, action) {
    const label = el(doc, 'label', title), select = el(doc, 'select', null, 'text_pole');
    for (const [id, text] of values) {
        const option = el(doc, 'option', text);
        option.value = id;
        select.append(option);
    }
    select.value = value;
    select.addEventListener('change', () => action(select.value));
    label.append(select);
    return { label, input: select };
}
function inputField(doc, title, value, action, type = 'text') {
    const label = el(doc, 'label', title), input = el(doc, 'input', null, 'text_pole');
    input.type = type;
    input.value = String(value);
    if (type === 'number') {
        input.min = '0';
        input.step = '1';
        input.inputMode = 'numeric';
    }
    input.addEventListener('input', () => action(input.value));
    label.append(input);
    return { label, input };
}
function checkbox(doc, text, value, action) {
    const label = el(doc, 'label', null, 'rh-fd-check'), input = el(doc, 'input');
    input.type = 'checkbox';
    input.checked = value;
    input.addEventListener('change', () => action(input.checked));
    label.append(input, el(doc, 'span', text, 'rh-fd-item-title'));
    return { label, input };
}
function summary(rule) {
    if (!rule.enabled)
        return __rmT("IEKFIlcC7oaf4CM3EXiBZ0beDUS9eT");
    const parts = FACE_DRAW_KINDS.flatMap(kind => {
        const lane = rule[kind], labels = [];
        if (lane.requiredIds.length)
            labels.push(`${__rmT("x.aQZUc6")}${lane.requiredIds.length}${__rmT("2RdKGT")}`);
        if (lane.mode !== 'none')
            labels.push(`${MODE_LABELS[lane.mode]} ${lane.min === lane.max ? lane.min : `${lane.min}–${lane.max}`}${__rmT("2RdKGT")}`);
        return labels.length ? [`${FACE_DRAW_LABELS[kind]}${__rmT("7ys")}${labels.join(__rmT("Yis"))}`] : [];
    });
    return parts.join(__rmT("7os")) || __rmT("2lXQ0o3.25oyckk18_eBHcWwxEf");
}
function createOwner(container, dependencies) {
    const doc = container.ownerDocument;
    const style = el(doc, 'style', STYLE);
    container.append(style);
    const owner = { container, doc, controllers: new Map(), catalog: null, loading: false, ...dependencies };
    owner.load = async () => {
        if (owner.loading)
            return;
        owner.loading = true;
        for (const c of owner.controllers.values())
            c.renderCatalog();
        try {
            owner.catalog = await owner.loadCatalog(owner.getSettings());
        }
        catch (error) {
            owner.catalog = { theme: [], format: [], text: [], warnings: [`${__rmT("S7E1f5OoQ4GUcAiaVpA")}${String(error?.message || error)}${__rmT("ueaUUmZ1fh5u16iT4DD")}`] };
        }
        finally {
            owner.loading = false;
            if (container.isConnected)
                for (const c of owner.controllers.values())
                    c.renderCatalog();
        }
    };
    return owner;
}
function createController(owner, index, rule) {
    const { doc } = owner;
    const details = el(doc, 'details', null, 'rh-face-draw');
    details.dataset.rhFaceDraw = String(index);
    const heading = el(doc, 'summary', __rmT("kuWBvtlET_YGMDOD"));
    const headingState = el(doc, 'small', '');
    heading.append(headingState);
    const body = el(doc, 'div', null, 'rh-fd-body');
    details.append(heading, body);
    const c = { index, owner, details, draft: normalizeFaceDrawRule(rule), saved: JSON.stringify(normalizeFaceDrawRule(rule)), dirty: false, sections: [], invalidNumbers: new Set(), numberDrafts: new Map(), presetName: '' };
    const status = el(doc, 'div', '', 'rh-fd-status');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    const enabled = checkbox(doc, __rmT("HRxmeEKLkemIasBZe.6bid1_9_T"), c.draft.enabled, value => { c.draft.enabled = value; c.changed(); });
    body.append(enabled.label);
    const tabs = el(doc, 'div', null, 'rh-fd-tabs');
    tabs.setAttribute('aria-label', `${__rmT("BJgCyT")}${index + 1}${__rmT("7aATSAo035S.c7e1Qok")}`);
    let activeKind = 'theme';
    for (const kind of FACE_DRAW_KINDS) {
        const tab = button(doc, FACE_DRAW_LABELS[kind], () => {
            activeKind = kind;
            for (const node of tabs.children)
                node.setAttribute('aria-pressed', String(node.dataset.kind === kind));
            for (const section of c.sections) {
                section.kind = kind;
                section.editing = false;
                section.renderControls();
            }
        });
        tab.dataset.kind = kind;
        tab.setAttribute('aria-pressed', String(kind === activeKind));
        tabs.append(tab);
    }
    body.append(tabs);
    c.changed = () => {
        c.dirty = true;
        status.textContent = __rmT("EwjpnEumZNKQxqD62zRbSij2bNs");
        headingState.textContent = `${summary(c.draft)}${__rmT("4b8RjaFytbVgggFE")}`;
        renderWarnings();
    };
    function replaceDraft(next) {
        c.draft = normalizeFaceDrawRule(next);
        c.invalidNumbers.clear();
        c.numberDrafts.clear();
        enabled.input.checked = c.draft.enabled;
        for (const section of c.sections)
            section.renderControls();
        c.changed();
    }
    function save(targetIndex = index) {
        if (c.invalidNumbers.size) {
            status.textContent = __rmT("HUuf7Iq2e.TaoUGzYzJtl4vSdV5eSAX9zL9BAfl0Kp18qzizOP9a1W0kGSXAR41.T4cQtzk60.8obh");
            return false;
        }
        const fresh = owner.getSettings(), rules = normalizeFaceDrawRules(fresh.rabbitMirrorFaceDrawRules);
        rules[targetIndex] = normalizeFaceDrawRule(c.draft);
        try {
            owner.updateSettings({ rabbitMirrorFaceDrawRules: rules });
        }
        catch (error) {
            status.textContent = `${__rmT("so_yzK7D2Qs0WZKPpsgGu05QxN2ocT")}${String(error?.message || error)}`;
            return false;
        }
        const recipient = owner.controllers.get(targetIndex);
        if (recipient) {
            recipient.replaceDraft(rules[targetIndex]);
            recipient.saved = JSON.stringify(rules[targetIndex]);
            recipient.dirty = false;
            recipient.headingState.textContent = rules[targetIndex].enabled ? summary(rules[targetIndex]) : __rmT("akVMNevrnTwzq3zTBlA");
            recipient.status.textContent = targetIndex === index ? __rmT("x2LJcUOc__oh8ZTCfGfDs1JGHYiukwUi4vBpBgLOQsyTvSQX") : `${__rmT("7ZOpqzVLp6OBTh")}${index + 1}${__rmT("3bd8U9jYMe0J1KbPPinG2Q0Gs6SWLu7ELe19xkgxbdd.bh")}`;
        }
        if (targetIndex !== index)
            status.textContent = `${__rmT("2GOZhUbTGv66nnFAQXxkvnCx")}${targetIndex + 1}${__rmT("4JhAxXWikYNbp3XRDX_tnK007D4rrk")}`;
        return true;
    }
    function createSection(resident) {
        const node = el(doc, 'section', null, 'rh-fd-section');
        const sectionHeading = el(doc, 'div', null, 'rh-fd-section-head');
        sectionHeading.append(el(doc, 'strong', resident ? __rmT("_uLUr.tDtGp") : __rmT("pnTgYANpZ5DN6SucEKk")));
        const sectionBody = el(doc, 'div', null, 'rh-fd-body');
        node.append(sectionHeading, sectionBody);
        const selection = el(doc, 'p', '', 'rh-fd-selection');
        const controls = el(doc, 'div'), catalog = el(doc, 'div', null, 'rh-fd-catalog'), tree = el(doc, 'div');
        sectionBody.append(controls, selection, catalog);
        body.append(node);
        const section = { resident, kind: activeKind, source: 'all', query: '', expanded: new Set(), node, tree, controls, editing: false };
        const edit = button(doc, resident ? __rmT("fVEq8d61mpk") : __rmT("fVEq8UYN_8T"), () => {
            section.editing = !section.editing;
            section.renderControls();
            if (!owner.catalog && !owner.loading)
                owner.load();
        });
        sectionHeading.append(edit);
        section.renderSelection = () => {
            const lane = c.draft[section.kind], categories = owner.catalog?.[section.kind] || [];
            const titles = new Map(categories.flatMap(category => category.items).map(item => [item.id, item.title]));
            const ids = resident ? lane.requiredIds : lane.itemIds;
            const labels = [...(!resident ? lane.categoryIds.map(id => categories.find(category => category.id === id)?.title || id).map(name => `${name}${__rmT("fnZ9FZqU0SY")}`) : []), ...ids.map(id => titles.get(id) || id)];
            selection.textContent = resident ? (labels.length ? `${__rmT("oIFG6.Q2xuQStf")}${labels.join(__rmT("jvk"))}` : __rmT("T6jOA3MhuzQofx88sDx6fVrnPCwNmEcKt3gGeVLde0UevvQX"))
                : lane.mode === 'none' ? __rmT("ryWgkv4xPDGoJH0kNsbjRgir1KZqTwnuhSXxF_rpgG8") : lane.scope === 'all' ? __rmT("SXEZlu_BmiSItkRomZ6XiG3zPaKEEz1s29E") : (labels.length ? `${__rmT("zOobcOZ1vFeStf")}${labels.join(__rmT("jvk"))}` : __rmT("0ju62Z0V5Nxi6lXj3.LrIyEe728oiS.2gjgLTeP5Zpv.bh"));
        };
        section.renderControls = () => {
            controls.replaceChildren();
            const lane = c.draft[section.kind];
            const canEdit = resident || (lane.mode !== 'none' && lane.scope === 'selected');
            edit.hidden = !canEdit;
            edit.textContent = section.editing ? __rmT("bMMH4esQ2Ph") : resident ? __rmT("fVEq8d61mpk") : __rmT("fVEq8UYN_8T");
            edit.setAttribute('aria-expanded', String(section.editing && canEdit));
            catalog.hidden = !section.editing || !canEdit;
            section.renderSelection();
            if (!resident) {
                const fields = el(doc, 'div', null, 'rh-fd-fields');
                fields.append(selectField(doc, __rmT("KJCDAXmsSDY"), Object.entries(MODE_LABELS), lane.mode, value => {
                    lane.mode = value;
                    if (value === 'none')
                        for (const field of ['min', 'max', 'range']) {
                            c.invalidNumbers.delete(`${section.kind}:${field}`);
                            c.numberDrafts.delete(`${section.kind}:${field}`);
                        }
                    c.changed();
                    section.renderControls();
                }).label);
                if (lane.mode !== 'none') {
                    fields.append(selectField(doc, __rmT("KJCDAcYN_8T"), [['all', __rmT("7NKZ5Mp3tXtqIkOI")], ['selected', __rmT("xMaZzgk_1hNe8IQO")]], lane.scope, value => { lane.scope = value; section.editing = value === 'selected'; c.changed(); section.renderControls(); }).label);
                    for (const field of ['min', 'max']) {
                        const key = `${section.kind}:${field}`;
                        const number = inputField(doc, field === 'min' ? __rmT("uTH4f4FNY0E__7o0IAA") : __rmT("uTHD7nFNY0E__7o0IAA"), c.numberDrafts.get(key) ?? lane[field], value => {
                            c.numberDrafts.set(key, value);
                            const parsed = Number(value);
                            if (value.trim() === '' || !Number.isSafeInteger(parsed) || parsed < 0)
                                c.invalidNumbers.add(key);
                            else {
                                lane[field] = parsed;
                                c.invalidNumbers.delete(key);
                            }
                            const pairKey = `${section.kind}:range`;
                            if (lane.max < lane.min)
                                c.invalidNumbers.add(pairKey);
                            else
                                c.invalidNumbers.delete(pairKey);
                            c.changed();
                        }, 'number');
                        fields.append(number.label);
                    }
                }
                controls.append(fields);
            }
            const filters = el(doc, 'div', null, 'rh-fd-fields');
            filters.append(selectField(doc, __rmT("J2FYef"), [['all', __rmT("9bC8gsY7BODtBHZckXTRjbbbs9xj3h")], ['builtin', __rmT("vBS97k")], ['external', __rmT("qMyezaB6k_m811eH")]], section.source, value => { section.source = value; section.renderTree(); }).label);
            filters.append(inputField(doc, __rmT("92MMLf"), section.query, value => { section.query = value; section.renderTree(); }, 'search').label);
            catalog.replaceChildren(filters, tree, button(doc, __rmT("r9TJySsHXoI8V2RG"), () => owner.load()));
            section.renderTree();
        };
        section.renderTree = () => {
            section.renderSelection();
            const focused = tree.contains(doc.activeElement) ? doc.activeElement?.dataset?.fdFocus : '';
            tree.replaceChildren();
            const lane = c.draft[section.kind];
            if (!section.editing || (!resident && (lane.mode === 'none' || lane.scope === 'all')))
                return;
            if (owner.loading) {
                tree.append(el(doc, 'p', __rmT("m6Fq0QGHkvR1uBOuX_hF6ns7"), 'rh-fd-note'));
                return;
            }
            if (!owner.catalog)
                return;
            const query = section.query.trim().toLocaleLowerCase('zh-Hans-CN');
            const categories = owner.catalog[section.kind] || [];
            let shown = 0;
            for (const category of categories) {
                if (section.source !== 'all' && category.source !== section.source)
                    continue;
                const categoryMatch = category.title.toLocaleLowerCase('zh-Hans-CN').includes(query);
                const items = category.items.filter(item => !query || categoryMatch || item.title.toLocaleLowerCase('zh-Hans-CN').includes(query));
                if (!items.length)
                    continue;
                shown += 1;
                const group = el(doc, 'div', null, 'rh-fd-category');
                const head = el(doc, 'div', null, 'rh-fd-category-head');
                const state = faceCategorySelection(lane, category, resident);
                const checkLabel = el(doc, 'label'), check = el(doc, 'input');
                check.type = 'checkbox';
                check.checked = state.checked;
                check.indeterminate = state.mixed;
                check.disabled = !state.total;
                check.setAttribute('aria-label', `${__rmT("QD0R9T")}${category.title}`);
                check.dataset.fdFocus = `category:${category.id}`;
                check.addEventListener('change', () => { toggleFaceCategory(lane, category, check.checked, resident); c.changed(); c.renderCatalog(); });
                checkLabel.append(check);
                const key = `${section.kind}:${category.id}`, open = !!query || section.expanded.has(key);
                const expand = button(doc, '', () => { if (section.expanded.has(key))
                    section.expanded.delete(key);
                else
                    section.expanded.add(key); section.renderTree(); });
                expand.dataset.fdFocus = `expand:${category.id}`;
                expand.setAttribute('aria-expanded', String(open));
                expand.append(el(doc, 'span', `${category.title}${category.source === 'external' ? __rmT("UqjXOn_pJuGLwf") : ''}`), el(doc, 'small', `${state.count}/${state.total} ${open ? __rmT("oPv5.h") : __rmT("rBjpuk")}`));
                head.append(checkLabel, expand);
                group.append(head);
                if (open) {
                    const rows = el(doc, 'div', null, 'rh-fd-items');
                    const picked = new Set(resident ? lane.requiredIds : lane.itemIds);
                    const all = !resident && lane.categoryIds.includes(category.id);
                    for (const item of items) {
                        const on = picked.has(item.id) || (all && !item.blocked);
                        const row = checkbox(doc, `${item.title}${item.blocked ? __rmT("w89BrxHfNHIxtf") : ''}`, on, value => { toggleFaceItem(lane, category, item.id, value, resident); c.changed(); c.renderCatalog(); });
                        row.input.disabled = item.blocked;
                        row.input.dataset.faceDrawItem = item.id;
                        row.input.dataset.fdFocus = `item:${item.id}`;
                        if (item.blocked)
                            row.label.classList.add('rh-fd-muted');
                        rows.append(row.label);
                    }
                    group.append(rows);
                }
                tree.append(group);
            }
            if (!shown)
                tree.append(el(doc, 'p', __rmT("j1uA5_uiYOvd.xOzEgN5DjH7D6HKhWxj5A9cgG59nqhdErsZNM7QNg4ImlQBRJvt7p8K1I6WesP8XvzbqAk"), 'rh-fd-note'));
            if (!resident)
                tree.append(el(doc, 'p', __rmT("EKZYKFUyp8j2fhKyventgyZ1h1GxcrDOa.pc.HvUYVpF3ZabR5VRD4DEYBYZnKvx4hO9ZXWQgf9pI0QGUvT5RQEmWRxPavGSNrfD_eCqVysJStV6I6aOoFZyy3vJu6GWl0n1CvnCjRP3j5FJp_Vn1k"), 'rh-fd-note'));
            if (focused) {
                const replacement = [...tree.querySelectorAll('[data-fd-focus]')].find(node => node.dataset.fdFocus === focused);
                try {
                    replacement?.focus({ preventScroll: true });
                }
                catch {
                    replacement?.focus();
                }
            }
        };
        c.sections.push(section);
        section.renderControls();
    }
    createSection(true);
    createSection(false);
    const warnings = el(doc, 'div');
    body.append(warnings);
    function renderWarnings() {
        if (!warnings)
            return;
        warnings.replaceChildren();
        if (c.invalidNumbers.size)
            warnings.append(el(doc, 'p', __rmT("9uFGElqvWxq3cXVMZkppA50l.SBmVCjCcHn9jTWd7zeL3C2dgbA_915X"), 'rh-fd-warning'));
        for (const warning of owner.catalog?.warnings || [])
            warnings.append(el(doc, 'p', warning, 'rh-fd-warning'));
        if (owner.loading || !owner.catalog)
            return;
        for (const kind of FACE_DRAW_KINDS) {
            const lane = c.draft[kind], categories = owner.catalog[kind] || [];
            const items = new Map(categories.flatMap(category => category.items).map(item => [item.id, item]));
            for (const field of ['requiredIds', 'itemIds', 'categoryIds']) {
                for (const id of lane[field]) {
                    const item = field === 'categoryIds' ? categories.find(category => category.id === id) : items.get(id);
                    if (item && !item.blocked)
                        continue;
                    const row = el(doc, 'div', null, 'rh-fd-invalid rh-fd-warning');
                    row.append(el(doc, 'span', `${FACE_DRAW_LABELS[kind]} · ${field === 'requiredIds' ? __rmT("3DomGf") : __rmT("ncGT2f")}${__rmT("7ys")}${item?.title || id}${__rmT("eis")}${item?.blocked ? __rmT("D6IPTYlNfEYCld3R") : __rmT("S7E1fXM2_ksuTDVGQE_")}${__rmT("NFQ20z9qtvbQTn3yIAA")}`), button(doc, __rmT("nkT.pqRwRUy7Gk"), () => { lane[field] = lane[field].filter(value => value !== id); c.changed(); c.renderCatalog(); }));
                    warnings.append(row);
                }
            }
            if (c.draft.enabled && lane.mode !== 'none' && lane.min > 0) {
                const required = new Set(lane.requiredIds);
                const inRange = categories.flatMap(category => category.items.map(item => ({ item, category })))
                    .filter(({ item, category }) => lane.scope !== 'selected' || lane.itemIds.includes(item.id) || lane.categoryIds.includes(category.id));
                const usable = new Set(inRange.filter(({ item }) => !item.blocked && !required.has(item.id)).map(({ item }) => item.id)).size;
                if (usable < lane.min) {
                    const pinned = inRange.filter(({ item }) => required.has(item.id)).length;
                    warnings.append(el(doc, 'p', `${FACE_DRAW_LABELS[kind]}${__rmT("jc94R4GqUn93XSz_JR.SYEUdIU_6hb6DnQE")}${usable}${__rmT("4JhwvyWiLpMOg1PDgRsA3ITQtD1CJk")}${lane.min}${__rmT("qGygZrI2")}${pinned ? `${__rmT("QfrFqgGBaTobIlBq")}${pinned}${__rmT("kbjnQKEWIrJu_boyIRrTkwwkObGOp2AhBYAHdhfIojWU01Krcph")}` : lane.scope === 'selected' && !lane.itemIds.length && !lane.categoryIds.length ? __rmT("Uz91el4yqIbBYrXmV4aBFI4y") : ''}${__rmT("RK6VlCWRMYlnp4_WtCUSyMQG0u.7sEzVpF7acebV7r4PQAotFNg4CrM8panP310HpSXF0ZnSR1cSc_Rdf9lBBbXiRqBjVzby.fgz_nyAN0BwuJQx3kgdPGo.uOAMNFhEcqidMvHVMUKa2LfF")}`, 'rh-fd-warning'));
                }
            }
            if (lane.requiredIds.length + (lane.mode === 'none' ? 0 : lane.max) > 16)
                warnings.append(el(doc, 'p', `${FACE_DRAW_LABELS[kind]}${__rmT("gyBAxXeaYAE1VA2G12hnJlrrFYwrrk")}${lane.requiredIds.length > 16 ? `${__rmT("0vEv1XULiBcBTh")}${lane.requiredIds.length}${__rmT("o6R2vdzyeAq5h21HI8oapcr41tIcoKyzx.DdKgCUe_at2Y.gvm8Utvkjx72MqDCF9yKY3h")}` : __rmT("gbCKvgA.622qdq51r1_z50o58R8HXKq27RbYFfV1gG8")}`, 'rh-fd-warning'));
        }
    }
    const actions = el(doc, 'div', null, 'rh-fd-actions');
    const saveButton = button(doc, __rmT("UDZraqPXFYA"), () => save());
    saveButton.dataset.faceDrawSave = String(index);
    saveButton.classList.add('rh-fd-primary');
    actions.append(saveButton);
    body.append(actions, status);
    const copyFields = el(doc, 'div', null, 'rh-fd-fields');
    const copySelect = selectField(doc, __rmT("DJol4j8_s_LLgBZh"), Array.from({ length: 5 }, (_, i) => i).filter(i => i !== index).map(i => [String(i), `${__rmT("BJgCyT")}${i + 1}${__rmT("2RddPk")}`]), String(index === 0 ? 1 : 0), () => { });
    copyFields.append(copySelect.label, button(doc, __rmT("iSxmcaVN8GThdf"), () => save(Number(copySelect.input.value))));
    const presetDetails = el(doc, 'details', null, 'rh-fd-advanced');
    presetDetails.append(el(doc, 'summary', __rmT("DbVhkEUaJ8YtBCWG4g08u6W3E2oQif")));
    const presetBody = el(doc, 'div', null, 'rh-fd-body');
    presetBody.append(el(doc, 'p', __rmT("BygfKHVx5V0quX.nxub9RPxiY1iyDbsVEb7vC3rUwI3SATzFcf3UDRlP.gRhu2NDeh9DTwK887uBMXxP54tURDkTWW_8NO8QZrjELKh7u6ktaUEHfvcH42wZ36.pp_ozLhDyiChbp.TLY1UKVTFn1k"), 'rh-fd-note'));
    presetBody.append(copyFields);
    const nameFields = el(doc, 'div', null, 'rh-fd-fields');
    const name = inputField(doc, __rmT("uJXnpewR3Ml"), '', value => { c.presetName = value; });
    nameFields.append(name.label, button(doc, __rmT("sg1SIIA7LEZ6IMid"), () => {
        if (c.invalidNumbers.size) {
            status.textContent = __rmT("Nc8jSGm..Ow20_uKuKi0DxEI");
            return;
        }
        if (!c.presetName.trim()) {
            status.textContent = __rmT("avytg0vo1CEzIS.F7Xzsoo5Z2JPrrk");
            name.input.focus();
            return;
        }
        const presets = normalizeFaceDrawPresets(owner.getSettings().rabbitMirrorFaceDrawPresets)
            .filter(preset => preset.name !== c.presetName.trim());
        const id = globalThis.crypto?.randomUUID?.() || `face-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        presets.push({ id, name: c.presetName.trim(), rule: normalizeFaceDrawRule(c.draft) });
        try {
            owner.updateSettings({ rabbitMirrorFaceDrawPresets: presets });
            for (const controller of owner.controllers.values())
                controller.renderPresets();
            status.textContent = __rmT("MHBC2oPN7cWz_9HnVe5PsR9XSMC570JpJuvOBnH4UPvnr67.vFANivYhmJRbezkC");
        }
        catch (error) {
            status.textContent = `${__rmT("iSDJ7XMxwmhUcAiaVpA")}${String(error?.message || error)}`;
        }
    }));
    presetBody.append(nameFields);
    const presetFields = el(doc, 'div', null, 'rh-fd-fields');
    presetBody.append(presetFields);
    c.renderPresets = () => {
        const presets = normalizeFaceDrawPresets(owner.getSettings().rabbitMirrorFaceDrawPresets);
        presetFields.replaceChildren();
        const field = selectField(doc, __rmT("7ZSYvCKbp9_cYT"), [['', presets.length ? __rmT("ftFkVbFdp9_cYT") : __rmT("wXg5_l9vgvulcYRbfvl")], ...presets.map(preset => [preset.id, preset.name])], '', () => { });
        presetFields.append(field.label, button(doc, __rmT("8zxOsz3LpMfNef"), () => {
            const preset = normalizeFaceDrawPresets(owner.getSettings().rabbitMirrorFaceDrawPresets).find(item => item.id === field.input.value);
            if (!preset) {
                status.textContent = __rmT("Nc8jSdhvtIDdn4Vay.GODxEI");
                return;
            }
            replaceDraft(preset.rule);
            status.textContent = __rmT("Qr6D0lDU43N4nImlUXXdJ1CdjCuVXl2tQ0YaTp80j1bap8NsbBv33FWbK5HUAcTdfAR145kZXiEobh");
        }));
        let armedId = '';
        const remove = button(doc, __rmT("4N5ovubIflX6IMid"), () => {
            const id = field.input.value;
            const preset = normalizeFaceDrawPresets(owner.getSettings().rabbitMirrorFaceDrawPresets).find(item => item.id === id);
            if (!preset) {
                status.textContent = __rmT("avlokovIG1ziMANMZzMOjE5SAYgrrk");
                return;
            }
            if (armedId !== id) {
                armedId = id;
                remove.textContent = `${__rmT("M05P2ly2ATDAqk9.kGD")}${preset.name}${__rmT("Yvk")}`;
                return;
            }
            const next = normalizeFaceDrawPresets(owner.getSettings().rabbitMirrorFaceDrawPresets).filter(item => item.id !== id);
            try {
                owner.updateSettings({ rabbitMirrorFaceDrawPresets: next });
                for (const controller of owner.controllers.values())
                    controller.renderPresets();
                status.textContent = `${__rmT("qMyN4ZPBywg2siG1")}${preset.name}${__rmT("LlWBl3tmzAgfcX7OE.ryPq8QtFPnG572LAkjspPgNaM.bh")}`;
            }
            catch (error) {
                status.textContent = `${__rmT("75saSiMxwmhUcAiaVpA")}${String(error?.message || error)}`;
            }
        });
        field.input.addEventListener('change', () => { armedId = ''; remove.textContent = __rmT("4N5ovubIflX6IMid"); });
        if (presets.length)
            presetFields.append(remove);
    };
    presetDetails.append(presetBody);
    body.append(presetDetails);
    c.status = status;
    c.headingState = headingState;
    c.replaceDraft = replaceDraft;
    c.renderCatalog = () => { for (const section of c.sections)
        section.renderTree(); renderWarnings(); };
    c.refresh = next => {
        const normalized = normalizeFaceDrawRule(next), key = JSON.stringify(normalized);
        if (!c.dirty && key !== c.saved) {
            replaceDraft(normalized);
            c.dirty = false;
            c.saved = key;
            status.textContent = '';
        }
        if (!c.dirty)
            headingState.textContent = normalized.enabled ? summary(normalized) : __rmT("akVMNevrnTwzq3zTBlA");
        c.renderPresets();
    };
    details.addEventListener('toggle', () => { if (details.open && !owner.catalog && !owner.loading)
        owner.load(); });
    c.renderPresets();
    renderWarnings();
    return c;
}
export function renderFaceDrawSettings(container, settings = getSettings(), dependencies = {}) {
    if (!container)
        return;
    let owner = owners.get(container);
    if (!owner) {
        owner = createOwner(container, { getSettings, updateSettings, loadCatalog: loadFaceDrawCatalog, ...dependencies });
        owners.set(container, owner);
    }
    const rules = normalizeFaceDrawRules(settings.rabbitMirrorFaceDrawRules);
    const count = Math.min(5, Math.max(1, Number(settings.rabbitMirrorFaceCount) || 1));
    for (let index = 0; index < 5; index += 1) {
        const row = container.querySelector(`[data-rh-presentation-row="${index}"]`);
        if (!row)
            continue;
        let controller = owner.controllers.get(index);
        if (!controller) {
            controller = createController(owner, index, rules[index]);
            owner.controllers.set(index, controller);
            row.after(controller.details);
        }
        controller.details.hidden = index >= count;
        controller.refresh(rules[index]);
    }
}
