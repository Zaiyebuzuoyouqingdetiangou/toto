import { rmT as __rmT } from "../textTable.js?rmv=2.1.4";
import { listExternalLibraryEntryChoices, reclassifyExternalLibraryEntries } from './store.js?rmv=2.1.4';
const LABELS = { theme: __rmT("_GerrIjDHM_"), format: __rmT("1Q3is5nrSDY"), text: __rmT("Ybcc.ep_"), auxiliary: __rmT("5p7qAO1PlPp"), pending: __rmT("oKv_9RWT"), mixed: __rmT("zo6MOtBE"), ignore: __rmT("EBNOnh") };
const PAGE_SIZE = 50;
export function openExternalReclassificationPanel(container, library, { onSaved = () => { }, isCurrent = () => true } = {}) {
    const doc = container.ownerDocument;
    const make = (tag, text = '') => { const node = doc.createElement(tag); node.textContent = text; return node; };
    const panel = make('section');
    panel.setAttribute('data-rh-reclassification', 'true');
    const alive = () => panel.isConnected && isCurrent();
    let page = 0, query = '', all = false, busy = false, sequence = 0;
    const ids = new Set(), excluded = new Set();
    const controls = make('fieldset');
    controls.style.cssText = 'border:0;padding:0;min-width:0;';
    const heading = make('h3', `${library.displayName}${__rmT("PB9pVJ3Oyup4wh")}`);
    const help = make('p', __rmT("K.oAJpovp20z9AeC5voKdxzRRqKRxeoBfzrr5quGTOKg70_9QeORqTeHGOniaPTUpH6SDoajpyuUZd.8K.PWkDrUOlXzzntKW_IJLWP_5XIUtjBV_EKP29ncUpBZB34xjWFE6E2.4NbiR7az7QDdKTKq2jO.Y6Y7Ka4Ap8gdU7KjaK6lu_n__5pS454YlgfrrV7U3HFD"));
    help.style.cssText = 'font-size:13px;line-height:1.6;';
    const searchLabel = make('label', __rmT("wOuy6BX_a9frGk"));
    const search = make('input');
    search.type = 'search';
    search.className = 'rh-external-input';
    search.style.cssText = 'width:100%;min-height:44px;box-sizing:border-box;';
    searchLabel.append(search);
    const toolbar = make('div');
    toolbar.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin:8px 0;';
    const action = (label, fn, parent = toolbar) => { const b = make('button', label); b.type = 'button'; b.className = 'rh-external-button'; b.style.minHeight = '44px'; b.addEventListener('click', fn); parent.append(b); return b; };
    const status = make('p');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    const selected = make('p');
    selected.setAttribute('data-rh-reclass-selection', 'true');
    const list = make('div');
    list.setAttribute('data-rh-reclass-list', 'true');
    const footer = make('div');
    footer.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;margin:8px 0;align-items:center;';
    const targetLabel = make('label', __rmT("325X3f"));
    const target = make('select');
    target.className = 'rh-external-input';
    target.style.minHeight = '44px';
    target.setAttribute('aria-label', __rmT("8rsJyCh_2yH8VoVb"));
    for (const kind of ['text', 'theme', 'format']) {
        const option = make('option', LABELS[kind]);
        option.value = kind;
        target.append(option);
    }
    targetLabel.append(target);
    footer.append(targetLabel);
    const apply = action(__rmT("iNzZJGtbHmyflucg"), async () => {
        if (busy || (!all && !ids.size))
            return;
        busy = true;
        controls.disabled = true;
        status.textContent = __rmT("IkuMZxMN90DZqIe1JQD");
        let saved;
        try {
            saved = await reclassifyExternalLibraryEntries(library.libraryId, all ? { all: true, excludedIds: [...excluded] } : { ids: [...ids] }, target.value);
        }
        catch (error) {
            if (alive())
                status.textContent = String(error?.message || __rmT("PWwz4atTW8uNIOql2KgA8jtg7PbanorFJ.DdStt36UvREAulFA8QLchvzBG"));
            return;
        }
        finally {
            busy = false;
            controls.disabled = false;
        }
        all = false;
        ids.clear();
        excluded.clear();
        if (alive()) {
            page = 0;
            await loadPage(`${__rmT("UnztYFiyMQB31CRcgPD")}${saved.selectedCount}${__rmT("4b62ypJxX3dwIEBq")}${saved.changedCount}${__rmT("qGyn.A_c")}${LABELS[target.value]}${__rmT("gH0QkaQAxYBkRCM3dEGCZ45QxN2rrk")}`);
        }
        try {
            await onSaved(saved);
        }
        catch {
            if (alive())
                status.textContent += __rmT("3I1bERYbuKF.QoH.lxEjGNtMzKJ40kgDc9TeBfmbZmSpuu45azFaS15X");
        }
    }, footer);
    const sync = () => {
        selected.textContent = all ? `${__rmT("tGpFiDvoXxXF4XXm61r.Q6eH1mNk4bwOfJa6grzyibbywQ1CiEDC3f")}${excluded.size}${__rmT("qGyn.qKg")}` : `${__rmT("iF2jpgm6HKG")}${ids.size}${__rmT("wRYXwrU3tbcndP.hnE.Un7EI")}`;
        apply.disabled = busy || (!all && !ids.size);
        for (const input of list.querySelectorAll('input[type="checkbox"]'))
            input.checked = all ? !excluded.has(input.value) && !input.disabled : ids.has(input.value);
    };
    const filter = () => { if (busy)
        return; query = search.value.trim().slice(0, 200); page = 0; void loadPage(); };
    action(__rmT("PJvh80bXNNT"), filter);
    action(__rmT("zPMIfO01e2rV0cOYsa0tLk"), () => { all = true; ids.clear(); excluded.clear(); sync(); });
    action(__rmT("DuPjp1PXsCD"), () => { for (const input of list.querySelectorAll('input[type="checkbox"]'))
        if (!input.disabled) {
            if (all)
                excluded.delete(input.value);
            else
                ids.add(input.value);
        } sync(); });
    action(__rmT("WFOL6n6D0CG"), () => { all = false; ids.clear(); excluded.clear(); sync(); });
    action(__rmT("rFwRAGtbHmyflucg"), () => { sequence++; panel.remove(); });
    search.addEventListener('keydown', event => { if (event.key === 'Enter') {
        event.preventDefault();
        filter();
    } });
    const pager = make('div');
    pager.style.cssText = 'display:flex;gap:8px;';
    const previous = action(__rmT("KlqvWh00"), () => { page--; void loadPage(); }, pager);
    const next = action(__rmT("K_qvWh00"), () => { page++; void loadPage(); }, pager);
    controls.append(searchLabel, toolbar, selected, footer, list, pager);
    panel.append(heading, help, status, controls);
    container.hidden = false;
    container.replaceChildren(panel);
    async function loadPage(notice = '') {
        const ticket = ++sequence;
        previous.disabled = true;
        next.disabled = true;
        list.replaceChildren();
        status.textContent = notice || __rmT("IkuMZ5OoQ4HcMBIRJQD");
        sync();
        try {
            const result = await listExternalLibraryEntryChoices(library.libraryId, { offset: page * PAGE_SIZE, pageSize: PAGE_SIZE, query });
            if (!alive() || ticket !== sequence)
                return;
            for (const choice of result.choices) {
                const label = make('label');
                label.style.cssText = 'display:flex;align-items:center;gap:10px;min-height:44px;padding:7px 0;border-bottom:1px solid color-mix(in srgb,currentColor 12%,transparent);overflow-wrap:anywhere;';
                const input = make('input');
                input.type = 'checkbox';
                input.value = choice.externalId;
                input.disabled = !choice.reclassifiable;
                const text = make('span', `${choice.title}${__rmT("eis")}${LABELS[choice.classification] || choice.classification}${__rmT("7os")}${choice.enabled ? __rmT("4R63OVYy") : __rmT("4RMihVYy")}${choice.reclassifiable ? '' : __rmT("RhrLyrsUr.SwIHcg")}${__rmT("eXs")}`);
                label.append(input, text);
                list.append(label);
                input.addEventListener('change', () => { if (all) {
                    if (input.checked)
                        excluded.delete(input.value);
                    else
                        excluded.add(input.value);
                }
                else if (input.checked)
                    ids.add(input.value);
                else
                    ids.delete(input.value); sync(); });
            }
            previous.disabled = page === 0;
            next.disabled = !result.hasNext;
            status.textContent = notice || `${__rmT("BJgCyT")}${page + 1}${__rmT("4b6txAJxym10XsBq")}${result.choices.length}${__rmT("dxJO4uP75.v2HK047r1r6XQC853ZHSZIpRNMLBwarRCy1sHeLxyB1FaNjK_9uT")}`;
            sync();
        }
        catch (error) {
            if (alive() && ticket === sequence)
                status.textContent = String(error?.message || __rmT("cvykkK7D2Qs0WuV08Zden2gCWD5rrk"));
        }
    }
    void loadPage();
    return panel;
}
