import { rmT as __rmT } from "../textTable.js?rmv=2.1.5";
import { readLocalExternalImportFile, readPlainTextWorldBook } from './fileReader.js?rmv=2.1.5';
import { getSettings, updateSettings } from '../settings.js?rmv=2.1.5';
import { listHostWorldBooks, readHostWorldBook } from './hostReader.js?rmv=2.1.5';
import { searchNormalizedWorldBookEntries } from './normalize.js?rmv=2.1.5';
import { EXTERNAL_WORLD_BOOK_SELECTION_MODE, createEmptySelection, createFilteredSelection, createWholeBookSelection, entryIdentity, toggleEntrySelection, } from './selectionState.js?rmv=2.1.5';
import { EXTERNAL_WORLD_BOOK_CLASSIFICATION, applyExternalWorldBookBulkClassification, createExternalWorldBookClassificationDraft, externalWorldBookClassificationCounts, updateExternalWorldBookDraftItem, } from './classifier.js?rmv=2.1.5';
import { deleteExternalLibrary, listExternalLibraries, prepareExternalLibrarySnapshot, saveExternalLibrarySnapshot, setExternalLibraryEnabled, listExternalLibraryEntryChoices, setExternalLibraryEntryEnabled, hydrateExternalPoolMetadata, getExternalPoolHydrationStatus, rebuildExternalPoolMetadata, } from './store.js?rmv=2.1.5';
import { applyAppearanceTheme } from '../appearanceTheme.js?rmv=2.1.5';
import { getExternalPoolSnapshot } from './externalPool.js?rmv=2.1.5';
import { externalCandidateCounts } from './candidateCounts.js?rmv=2.1.5';
import { openExternalReclassificationPanel } from './reclassificationPanel.js?rmv=2.1.5';
const MODAL_ID = 'rh_external_worldbook_import_modal';
const PAGE_SIZE = 50;
const CLASSIFICATION_PAGE_SIZE = 40;
let state = null;
let pageState = null;
function openMotherLibraryPage() {
    const workbench = document.getElementById('rabbit_mirror_theater_settings')?.__rabbitMirrorWorkbench;
    workbench?.open?.();
    workbench?.navigate?.('library');
}
const CLASSIFICATION_LABELS = Object.freeze({
    [EXTERNAL_WORLD_BOOK_CLASSIFICATION.THEME]: __rmT("_GerrIjDHM_"),
    [EXTERNAL_WORLD_BOOK_CLASSIFICATION.FORMAT]: __rmT("1Q3is5nrSDY"),
    [EXTERNAL_WORLD_BOOK_CLASSIFICATION.TEXT]: __rmT("oo2o.TB1"),
    [EXTERNAL_WORLD_BOOK_CLASSIFICATION.MIXED]: __rmT("zo6MOtBE"),
    [EXTERNAL_WORLD_BOOK_CLASSIFICATION.AUXILIARY]: __rmT("5p7qAO1PlPp"),
    [EXTERNAL_WORLD_BOOK_CLASSIFICATION.IGNORE]: __rmT("EBNOnh"),
    [EXTERNAL_WORLD_BOOK_CLASSIFICATION.PENDING]: __rmT("oKv_9RWT"),
});
const CONFIDENCE_LABELS = Object.freeze({ high: __rmT("OGG"), medium: __rmT("_c8"), low: __rmT("pVs") });
function el(tag, options = {}) {
    const node = document.createElement(tag);
    if (options.className)
        node.className = state?.inline === true
            ? options.className
            : options.className.replace(/\bmenu_button\b/g, 'rh-external-button').replace(/\btext_pole\b/g, 'rh-external-input');
    if (options.text !== undefined)
        node.textContent = String(options.text);
    if (options.type)
        node.type = options.type;
    if (options.placeholder)
        node.placeholder = options.placeholder;
    if (options.value !== undefined)
        node.value = String(options.value);
    if (options.id)
        node.id = options.id;
    if (options.attrs)
        for (const [key, value] of Object.entries(options.attrs))
            node.setAttribute(key, String(value));
    if (options.style)
        Object.assign(node.style, options.style);
    if (options.style?.width && /^(button|input|select|textarea)$/.test(tag))
        node.style.setProperty('--rh-external-control-width', options.style.width);
    return node;
}
function button(text, onClick, style = {}) {
    const node = el('button', { className: 'menu_button', text, type: 'button', style });
    node.addEventListener('click', onClick);
    return node;
}
function setStatus(message, tone = '') {
    if (!state?.status)
        return;
    state.status.textContent = (tone === 'error' ? '⚠️ ' : '') + String(message || '');
    state.status.dataset.tone = tone;
    state.status.style.color = '';
}
function invalidateClassification() {
    if (!state)
        return;
    state.classificationDraft = [];
    state.classificationPage = 0;
    if (state.classificationPanel)
        state.classificationPanel.style.display = 'none';
}
function resetBookView() {
    state.currentBook = null;
    state.filteredEntries = [];
    state.page = 0;
    state.selectedIds.clear();
    state.selectionMode = EXTERNAL_WORLD_BOOK_SELECTION_MODE.WHOLE;
    state.entrySearch.value = '';
    state.fullText.checked = false;
    invalidateClassification();
    renderEntries();
    state.entrySection.style.display = 'none';
}
function renderBookList() {
    const query = state.bookSearch.value.trim().toLocaleLowerCase('zh-Hans-CN');
    const rows = state.hostBooks.filter(item => !query || `${item.displayName}\n${item.fileId}`.toLocaleLowerCase('zh-Hans-CN').includes(query));
    state.bookList.replaceChildren();
    if (!rows.length) {
        state.bookList.append(el('div', { text: __rmT("0_7bRKxzIDyPV47F9Sp5u9q5XHqrrk"), style: { opacity: '.65', fontSize: '12px', padding: '8px 2px' } }));
        return;
    }
    for (const item of rows) {
        const row = el('button', {
            className: 'menu_button',
            type: 'button',
            style: { width: '100%', textAlign: 'left', padding: '8px 9px', margin: '3px 0', minHeight: '44px' },
        });
        row.append(el('div', { text: item.displayName, style: { fontWeight: '700', overflowWrap: 'anywhere' } }));
        if (item.fileId !== item.displayName)
            row.append(el('div', { text: item.fileId, style: { opacity: '.55', fontSize: '10px', overflowWrap: 'anywhere' } }));
        row.addEventListener('click', async () => {
            const owner = state;
            setStatus(`${__rmT("cIFOAivtMuIAsh")}${item.displayName}${__rmT("foWSrT")}`);
            try {
                const book = await readHostWorldBook(item);
                if (state !== owner || !owner.overlay.isConnected)
                    return;
                showNormalizedBook(book);
                setStatus(`${__rmT("iFBUz84JHKG")}${book.entryCount}${__rmT("9Te9HW0atuEu695Siaa_eF6hNUwss7s2")}`, 'success');
            }
            catch (error) {
                if (state !== owner || !owner.overlay.isConnected)
                    return;
                resetBookView();
                setStatus(String(error?.message || error), 'error');
            }
        });
        state.bookList.append(row);
    }
}
function updateSelectionMeta() {
    const book = state?.currentBook;
    if (!book || !state?.entryMeta)
        return;
    const filteredCount = Array.isArray(state.filteredEntries) ? state.filteredEntries.length : 0;
    const modeLabel = state.selectionMode === EXTERNAL_WORLD_BOOK_SELECTION_MODE.WHOLE ? __rmT("yg5Gjk") : state.selectionMode === EXTERNAL_WORLD_BOOK_SELECTION_MODE.FILTERED ? __rmT("VMgR9T") : __rmT("I6.ENf");
    state.entryMeta.textContent = `${book.sourceName}${__rmT("kis")}${book.entryCount}${__rmT("fimH.nI3JGWkDGdJva1dHT")}${filteredCount}${__rmT("4b62yIJxF_ibssBq")}${state.selectedIds.size}${__rmT("qGyn.vrp")}${modeLabel}`;
}
function selectWholeBook() {
    const book = state?.currentBook;
    if (!book)
        return;
    const selection = createWholeBookSelection(book);
    state.selectedIds = selection.selectedIds;
    state.selectionMode = selection.mode;
    invalidateClassification();
    updateSelectionMeta();
    renderEntries();
    setStatus(`${__rmT("qMy55M_EBmyMIyG1")}${book.sourceName}${__rmT("s6y4hec6")}${book.entryCount}${__rmT("RN_WR3KyIFBZdAfVGotF1YxiJzkcFPb6KmwHXvzpgG8")}`);
}
function selectCurrentFilter() {
    const book = state?.currentBook;
    if (!book)
        return;
    const matches = searchNormalizedWorldBookEntries(book, state.entrySearch.value, { fullContent: state.fullText.checked });
    const selection = createFilteredSelection(matches);
    state.selectedIds = selection.selectedIds;
    state.selectionMode = selection.mode;
    state.filteredEntries = matches;
    invalidateClassification();
    updateSelectionMeta();
    renderEntries();
    setStatus(`${__rmT("2lXwZZuMlQbuaWp28_eSiA4ujFs")}${matches.length}${__rmT("qGyn.qKg")}`);
}
function clearSelection() {
    if (!state?.currentBook)
        return;
    const selection = createEmptySelection();
    state.selectedIds = selection.selectedIds;
    state.selectionMode = selection.mode;
    invalidateClassification();
    updateSelectionMeta();
    renderEntries();
    setStatus(__rmT("CgJRwI2BJGWkDPUQ2FgpUT"));
}
function renderEntries() {
    state.entryList.replaceChildren();
    const book = state.currentBook;
    if (!book) {
        state.entryMeta.textContent = __rmT("ogyS.u_HP8L2twvE8g6pUT");
        state.pager.textContent = '';
        return;
    }
    const query = state.entrySearch.value;
    const matches = searchNormalizedWorldBookEntries(book, query, { fullContent: state.fullText.checked });
    state.filteredEntries = matches;
    const pageCount = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
    state.page = Math.max(0, Math.min(state.page, pageCount - 1));
    const start = state.page * PAGE_SIZE;
    const rows = matches.slice(start, start + PAGE_SIZE);
    updateSelectionMeta();
    if (!rows.length) {
        const fallback = book.entries.every(entry => !entry.primaryKeywords.length && !entry.secondaryKeywords.length)
            ? __rmT("XaohtCpG6SNpEg.7zsBd70Mj_ZaP0yk_AFWekI5iuO_HrZXIdTi94.POGpsHWUoUZHHrk4rdahLl0VWvM2zKhRaQWAT") : __rmT("rW6Q4Nrvb7KIZB19ByimJ.RbVKbHuOomrKkxjDBFAw02aFykufncDloTvh_9uT");
        state.entryList.append(el('div', { text: fallback, style: { opacity: '.68', fontSize: '12px', padding: '10px 2px' } }));
    }
    for (const entry of rows) {
        const row = el('label', { style: { display: 'grid', gridTemplateColumns: '26px minmax(0,1fr)', gap: '8px', padding: '9px 4px', borderBottom: '1px solid color-mix(in srgb,currentColor 10%,transparent)', alignItems: 'start' } });
        const check = el('input', { type: 'checkbox' });
        const identity = entryIdentity(entry);
        check.checked = state.selectedIds.has(identity);
        check.addEventListener('change', () => {
            state.selectedIds = toggleEntrySelection(state.selectedIds, identity, check.checked);
            state.selectionMode = EXTERNAL_WORLD_BOOK_SELECTION_MODE.MANUAL;
            invalidateClassification();
            updateSelectionMeta();
        });
        row.append(check);
        const body = el('div');
        body.append(el('div', { text: entry.title, style: { fontWeight: '700', fontSize: '12px', overflowWrap: 'anywhere' } }));
        const keys = [...entry.primaryKeywords, ...entry.secondaryKeywords];
        const details = [];
        if (entry.sourceEntryUid !== null)
            details.push(`uid ${entry.sourceEntryUid}`);
        if (entry.disabled)
            details.push(__rmT("wu42yJk8F_wJlsFz"));
        if (entry.constant)
            details.push(__rmT("3DomGf"));
        details.push(keys.length ? `${__rmT("yHPTVuEZHKG")}${keys.slice(0, 5).join(' / ')}` : __rmT("5u._cHs3ulo8KSis"));
        body.append(el('div', { text: details.join(__rmT("kis")), style: { opacity: '.62', fontSize: '10px', lineHeight: '1.4', marginTop: '2px', overflowWrap: 'anywhere' } }));
        if (entry.previewText)
            body.append(el('div', { text: entry.previewText, style: { marginTop: '5px', opacity: '.82', fontSize: '11px', lineHeight: '1.5', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' } }));
        row.append(body);
        state.entryList.append(row);
    }
    state.pager.replaceChildren();
    const prev = button(__rmT("KlqvWh00"), () => { state.page -= 1; renderEntries(); }, { minHeight: '44px' });
    const next = button(__rmT("K_qvWh00"), () => { state.page += 1; renderEntries(); }, { minHeight: '44px' });
    prev.disabled = state.page <= 0;
    next.disabled = state.page >= pageCount - 1;
    state.pager.append(prev, el('span', { text: `${__rmT("BJgCyT")}${state.page + 1} / ${pageCount}${__rmT("2RdxGT")}`, style: { opacity: '.68', fontSize: '11px', alignSelf: 'center' } }), next);
}
function showNormalizedBook(book) {
    state.currentBook = book;
    state.page = 0;
    const selection = createWholeBookSelection(book);
    state.selectedIds = selection.selectedIds;
    state.selectionMode = selection.mode;
    state.entrySearch.value = '';
    state.fullText.checked = false;
    invalidateClassification();
    renderEntries();
    state.entrySection.style.display = '';
}
async function loadHostBooks() {
    const owner = state;
    setStatus(__rmT("Mr80UHSzoMu3lLByvaqM7eldCAN.14Eg"));
    state.hostBooks = [];
    state.bookList.replaceChildren();
    try {
        const books = await listHostWorldBooks();
        if (state !== owner || !owner.overlay.isConnected)
            return;
        state.hostBooks = books;
        renderBookList();
        setStatus(`${__rmT("iFNh8d2gHKG")}${state.hostBooks.length}${__rmT("fiXC.n85mAX2twvE8g6pUT")}`, 'success');
    }
    catch (error) {
        if (state !== owner || !owner.overlay.isConnected)
            return;
        setStatus(String(error?.message || error), 'error');
        state.bookList.append(el('div', { text: __rmT("yUpfrDu0kK3z1xSXXOeyfrFZa7I7mvkmSuq1FJMFRJuWpLWPcjjr0ZXZ8x07jvemEf.wP3znyaYu1FsVq_.tebWtr_MAhBwjvLR.J9uB79s"), style: { opacity: '.68', fontSize: '12px', padding: '8px 2px' } }));
    }
}
async function loadLocalFiles(files) {
    const owner = state;
    const list = Array.from(files || []);
    if (!list.length)
        return;
    if (owner.transferControls.isBusy()) {
        setStatus(__rmT("Uu85dq454lyXJmR057UjcCILl_SmEC1DaJ3KeTA8Yl3cnb0mL7W6iW5X"), 'error');
        return;
    }
    const ownSequence = ++owner.localFileSequence;
    owner.transferControls.clearPending();
    if (list.length > 20 || list.reduce((sum, file) => sum + Number(file?.size || 0), 0) > 32 * 1024 * 1024) {
        setStatus(__rmT("kFJr18GpeVPOc_GyBezLdt2Te3ABBwwNyKNnU43cI7X.b3Za7IYq_H0n.SFgNoBLoBIuyxBhorARy6Fs1OQdsWCG1DJeN5YO"), 'error');
        return;
    }
    setStatus(`${__rmT("cIFOAivtMuIBTh")}${list.length}${__rmT("7ac8YiXvT0MnMFOcJQD")}`);
    const books = [];
    const backups = [];
    const failures = [];
    for (const file of list) {
        try {
            const result = await readLocalExternalImportFile(file);
            if (result.kind === 'backup')
                backups.push({ name: file.name || __rmT("SpfUX31s_uf"), backup: result.backup });
            else
                books.push(result.book);
        }
        catch (error) {
            failures.push(`${file?.name || __rmT("W7DAA7HfiJNy0k")}${__rmT("7ys")}${String(error?.message || error)}`);
        }
        if (state !== owner || !owner.overlay.isConnected || owner.localFileSequence !== ownSequence)
            return;
    }
    state.localBooks = books;
    state.localBookList.replaceChildren();
    for (const book of books) {
        const row = button(`${book.sourceName}${__rmT("eis")}${book.entryCount}${__rmT("qGyn.qZp")}`, () => {
            showNormalizedBook(book);
            setStatus(`${__rmT("2GSCYgbxX7_LejIOLsEJmIYI")}${book.sourceName}${__rmT("foWrzT")}`, 'success');
        }, { width: '100%', textAlign: 'left', minHeight: '44px', margin: '3px 0' });
        state.localBookList.append(row);
    }
    for (const item of backups) {
        state.localBookList.append(button(`${item.name}${__rmT("Qf1yy.AfcOU.rw5D")}${item.backup.libraries.length}${__rmT("fiXC.LI3TJuaD3MODWwtLk")}`, () => {
            if (!owner.transferControls.prepareBackup(item.backup))
                setStatus(__rmT("NNuzzGn51GuOR0UCfKucXJ9m9EtU7bSsG3_ZhWBu49FwWF.Rray4_1BwzBG"), 'error');
        }, { width: '100%', textAlign: 'left', minHeight: '44px', margin: '3px 0' }));
    }
    if (!books.length && !backups.length)
        state.localBookList.append(el('div', { text: __rmT("Zg6OQwN_hy9HRv_8W9CGNpdxEAwA1zKVHzBnwgSKwKly8ZQX"), style: { opacity: '.65', fontSize: '12px', padding: '8px 2px' } }));
    if (books.length === 1)
        showNormalizedBook(books[0]);
    else if (!books.length)
        resetBookView();
    if (backups.length === 1)
        owner.transferControls.prepareBackup(backups[0].backup);
    const resultText = `${__rmT("iFBUz84JHKG")}${books.length}${__rmT("7ac8YiXvT08zTzQyNtT")}${backups.length ? `${__rmT("jvk")}${backups.length}${__rmT("dxg9QyvpGKIniy2AMqrX6KjskKRCnOyI8l9MwNKo9X3lJ5I5cXaB1TaqaERT4k")}` : ''}${__rmT("jzk")}`;
    setStatus(failures.length ? `${__rmT("6iV.hUc6")}${books.length + backups.length}${__rmT("4bMfpeLxQEX56EBq")}${failures.length}${__rmT("qGtBWWKg")}${failures[0] ? ` ${failures[0]}` : ''}` : resultText, failures.length ? 'error' : 'success');
}
function classificationRowsForView() {
    const draft = Array.isArray(state?.classificationDraft) ? state.classificationDraft : [];
    const mode = state?.classificationFilter?.value || 'review';
    if (mode === 'all')
        return draft;
    if (mode === 'review')
        return draft.filter(item => item.classification === EXTERNAL_WORLD_BOOK_CLASSIFICATION.PENDING || item.requiresReview);
    return draft.filter(item => item.classification === mode);
}
function renderClassification() {
    if (!state?.classificationPanel)
        return;
    const draft = Array.isArray(state.classificationDraft) ? state.classificationDraft : [];
    const counts = externalWorldBookClassificationCounts(draft);
    state.classificationMeta.textContent = `${__rmT("5Qf45T6zHKG")}${counts.total}${__rmT("4b62yIJxgRhyXsBq")}${counts.theme}${__rmT("_f1wkm8K3_dutlBq")}${counts.format}${__rmT("Vn7uFjPXHKG")}${counts.text}${__rmT("Vn724mmgHKG")}${counts.auxiliary}${__rmT("Vnf0q5tEHKG")}${counts.ignore}${__rmT("M8PlaWUsdAOBTh")}${counts.pending}`;
    const rows = classificationRowsForView();
    const pageCount = Math.max(1, Math.ceil(rows.length / CLASSIFICATION_PAGE_SIZE));
    state.classificationPage = Math.max(0, Math.min(state.classificationPage, pageCount - 1));
    const start = state.classificationPage * CLASSIFICATION_PAGE_SIZE;
    const pageRows = rows.slice(start, start + CLASSIFICATION_PAGE_SIZE);
    state.classificationList.replaceChildren();
    if (!pageRows.length) {
        state.classificationList.append(el('div', { text: __rmT("..ZltBXxMviAruUGs_vVmobXP6WNcpMxm9pSXwKq"), style: { opacity: '.65', fontSize: '12px', padding: '10px 2px' } }));
    }
    for (const item of pageRows) {
        const row = el('div', { style: { padding: '10px 4px', borderBottom: '1px solid color-mix(in srgb,currentColor 10%,transparent)' } });
        const top = el('div', { style: { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(128px,180px)', gap: '8px', alignItems: 'center' } });
        const label = el('div');
        label.append(el('div', { text: item.localTitle || item.sourceTitle, style: { fontWeight: '700', fontSize: '12px', overflowWrap: 'anywhere' } }));
        label.append(el('div', {
            text: `${__rmT("IRc_Laop")}${CLASSIFICATION_LABELS[item.suggestion] || item.suggestion}${__rmT("M8GWXwugducStf")}${CONFIDENCE_LABELS[item.confidence] || item.confidence}${item.reasons?.length ? `${__rmT("kis")}${item.reasons[0]}` : ''}`,
            style: { opacity: '.65', fontSize: '10px', marginTop: '2px', lineHeight: '1.4', overflowWrap: 'anywhere' },
        }));
        const select = el('select', { className: 'text_pole', style: { width: '100%', minHeight: '36px', boxSizing: 'border-box' } });
        for (const value of [
            EXTERNAL_WORLD_BOOK_CLASSIFICATION.PENDING,
            EXTERNAL_WORLD_BOOK_CLASSIFICATION.THEME,
            EXTERNAL_WORLD_BOOK_CLASSIFICATION.FORMAT,
            EXTERNAL_WORLD_BOOK_CLASSIFICATION.TEXT,
            EXTERNAL_WORLD_BOOK_CLASSIFICATION.AUXILIARY,
            EXTERNAL_WORLD_BOOK_CLASSIFICATION.IGNORE,
        ]) {
            const option = el('option', { text: CLASSIFICATION_LABELS[value], value });
            option.value = value;
            select.append(option);
        }
        select.value = item.classification;
        select.disabled = state.importKind === 'text';
        select.addEventListener('change', () => {
            state.classificationDraft = updateExternalWorldBookDraftItem(state.classificationDraft, item.entryIdentity, { classification: select.value, userConfirmed: true });
            renderClassification();
        });
        top.append(label, select);
        row.append(top);
        if (item.classification === EXTERNAL_WORLD_BOOK_CLASSIFICATION.PENDING || item.requiresReview) {
            const titleInput = el('input', { className: 'text_pole', type: 'text', value: item.localTitle, placeholder: __rmT("kudJz1kGgoX7zqMw"), style: { width: '100%', marginTop: '7px', boxSizing: 'border-box' } });
            const summaryInput = el('textarea', { className: 'text_pole', value: item.summary, placeholder: __rmT("dxQFAwH5uMbFZT"), style: { width: '100%', marginTop: '6px', minHeight: '58px', resize: 'vertical', boxSizing: 'border-box' } });
            titleInput.addEventListener('change', () => {
                state.classificationDraft = updateExternalWorldBookDraftItem(state.classificationDraft, item.entryIdentity, { localTitle: titleInput.value, userConfirmed: true });
            });
            summaryInput.addEventListener('change', () => {
                state.classificationDraft = updateExternalWorldBookDraftItem(state.classificationDraft, item.entryIdentity, { summary: summaryInput.value, userConfirmed: true });
            });
            row.append(titleInput, summaryInput);
        }
        state.classificationList.append(row);
    }
    state.classificationPager.replaceChildren();
    const prev = button(__rmT("KlqvWh00"), () => { state.classificationPage -= 1; renderClassification(); }, { minHeight: '44px' });
    const next = button(__rmT("K_qvWh00"), () => { state.classificationPage += 1; renderClassification(); }, { minHeight: '44px' });
    prev.disabled = state.classificationPage <= 0;
    next.disabled = state.classificationPage >= pageCount - 1;
    state.classificationPager.append(prev, el('span', { text: `${__rmT("BJgCyT")}${state.classificationPage + 1} / ${pageCount}${__rmT("2RdxGT")}`, style: { opacity: '.68', fontSize: '11px', alignSelf: 'center' } }), next);
}
function startClassificationReview() {
    const book = state?.currentBook;
    if (!book) {
        setStatus(__rmT("N7WiS4Zn.uiYxhB1mOwKEgPTbNs"), 'error');
        return;
    }
    if (!state.selectedIds.size) {
        setStatus(__rmT("5_qPSaFAN9X3rk_i2ztfG0gDbNs"), 'error');
        return;
    }
    state.classificationDraft = createExternalWorldBookClassificationDraft(book, state.selectedIds, { importKind: state.importKind });
    state.classificationPage = 0;
    state.classificationFilter.value = state.importKind === 'text' ? 'all' : 'review';
    state.classificationPanel.style.display = '';
    renderClassification();
    setStatus(state.importKind === 'text' ? `${__rmT("qMyskAboy.hZV_Bq")}${state.classificationDraft.length}${__rmT("6RTT0icbuXP1R59SHGYxQ_O1bqLtpPp_U7AgXO.ziLwzcz5nKSpr7f")}` : `${__rmT("qMyLy18up_frIlBq")}${state.classificationDraft.length}${__rmT("AC.ph0DAHZhunsrYsSlboQNGbztoOep8WxYvbXuusOQljKydyLbZVKh8VErvhdkm3THE4HGP")}`);
    try {
        state.classificationPanel.scrollIntoView({ block: 'start', behavior: 'smooth' });
    }
    catch { }
}
async function saveClassificationReview() {
    const owner = state;
    const book = state?.currentBook;
    if (!book || !state.classificationDraft?.length) {
        setStatus(__rmT("Nc8jSPG.EzphYIcno_2Dy7EI"), 'error');
        return;
    }
    try {
        const snapshot = prepareExternalLibrarySnapshot(book, state.classificationDraft, { enabled: false });
        const saved = await saveExternalLibrarySnapshot(snapshot);
        if (state !== owner || !owner.overlay.isConnected)
            return saved;
        const counts = externalWorldBookClassificationCounts(state.classificationDraft);
        setStatus(`${__rmT("6b8wkRR4Ew6U3sFwdmN1LyXFZce8MuvLgsroDf")}${counts.theme}${__rmT("gl6wkm8K3_dutlBq")}${counts.format}${__rmT("Zt.uFjPXHKG")}${counts.text}${__rmT("Zt.24mmgHKG")}${counts.auxiliary}${__rmT(".CjlaWUsdAOBTh")}${counts.pending}${__rmT("1uRzJOOrL0DeP_QC6xNWTzOUALOShBSlWvvspf")}`, 'success');
        if (state.inline)
            await renderSavedLibraries();
        else {
            state.dismiss(false);
            openMotherLibraryPage();
        }
        return saved;
    }
    catch (error) {
        if (state === owner)
            setStatus(String(error?.message || error), 'error');
        return null;
    }
}
async function renderSavedLibraries() {
    if (!state?.savedLibrariesList)
        return;
    const owner = state;
    const renderSequence = ++owner.savedLibrariesSequence;
    state.savedLibrariesList.replaceChildren();
    let libraries;
    let needsRebuild;
    try {
        libraries = await listExternalLibraries();
        await hydrateExternalPoolMetadata();
        needsRebuild = new Set(getExternalPoolHydrationStatus().metadataRebuildRequired);
    }
    catch (error) {
        if (state !== owner || !owner.overlay.isConnected || renderSequence !== owner.savedLibrariesSequence)
            return;
        state.savedLibrariesPanel.style.display = '';
        state.savedLibrariesList.append(el('div', { text: String(error?.message || error), style: { color: '#fca5a5', fontSize: '11px', padding: '8px 2px' } }));
        return;
    }
    if (state !== owner || !owner.overlay.isConnected || renderSequence !== owner.savedLibrariesSequence)
        return;
    state.savedLibrariesPanel.style.display = '';
    if (!libraries.length) {
        state.savedLibrariesList.append(el('div', { text: __rmT("Y899PLHi_gHjXanOvqHoGzldvrr0aOs2"), style: { opacity: '.65', fontSize: '11px', padding: '8px 2px' } }));
        void import('./serverBackup.js?rmv=2.1.5').then(module => module.findRestorableMotherLibraryBackup()).then(found => {
            if (!found || state !== owner || !owner.overlay.isConnected || renderSequence !== owner.savedLibrariesSequence)
                return;
            const box = el('div', { style: { padding: '8px 2px', fontSize: '12px', lineHeight: '1.6', overflowWrap: 'anywhere' } });
            const names = found.names.length ? `${__rmT("eis")}${found.names.join(__rmT("jvk"))}${found.libraryCount > found.names.length ? __rmT("2RdRfk") : ''}${__rmT("eXs")}` : '';
            box.append(el('div', { text: `${__rmT("auZRLJXBHQDt6OquppSNeMBahAA8ahbY")}${found.libraryCount}${__rmT("qGto.qxg")}${found.entryCount}${__rmT("2RdUjk")}${names}${__rmT("7nZraK0jHKG")}${backupTimeText(found.exportedAt)}${__rmT("SnYWHUUiquIOTTmpDJl3i4kr4j34aOs2")}` }));
            const restore = button(__rmT("ZBjTVnnFSGl"), async () => {
                restore.disabled = true;
                try {
                    const module = await import('./serverBackup.js?rmv=2.1.5');
                    const result = await module.restoreMotherLibrariesFromServerBackup();
                    setStatus(`${__rmT("2GS7Unl5YXCOLF.O33FOM5Cx")}${result.importedLibraries}${__rmT("qGto.qxg")}${result.importedEntries}${__rmT("9Te9HdpFpQ3xaKwqqj5VBufp0jtss7s2")}`);
                    await renderSavedLibraries();
                }
                catch (error) {
                    setStatus(String(error?.message || error), 'error');
                    restore.disabled = false;
                }
            }, { minHeight: '44px', marginTop: '6px' });
            box.append(restore);
            state.savedLibrariesList.append(box);
        }).catch(() => { });
        return;
    }
    const poolSnapshot = getExternalPoolSnapshot();
    for (const library of libraries) {
        const candidates = externalCandidateCounts(poolSnapshot, library.libraryId);
        const row = el('div', { style: { padding: '9px 3px', borderBottom: '1px solid color-mix(in srgb,currentColor 10%,transparent)' } });
        row.append(el('div', { text: library.displayName, style: { fontWeight: '700', fontSize: '12px', overflowWrap: 'anywhere' } }));
        row.append(el('div', {
            text: `${__rmT("Zv8EczxCnMuBTh")}${library.entryCount || 0}${__rmT("VnnU5E8IHKG")}${library.themeCount || 0}${__rmT("VnZgqy29HKG")}${library.formatCount || 0}${__rmT("Vn7uFjPXHKG")}${library.textCount || 0}${__rmT("Vn724mmgHKG")}${library.auxiliaryCount || 0}${__rmT("M8PlaWUsdAOBTh")}${library.pendingCount || 0}${__rmT("kis")}${library.enabled ? __rmT("4R63OVYy") : __rmT("4RMihVYy")}`,
            style: { opacity: '.65', fontSize: '10px', marginTop: '3px', overflowWrap: 'anywhere' },
        }));
        row.append(el('div', {
            text: `${__rmT("l24VhDtxxgZj08ij1d0dHT")}${candidates.theme}${__rmT("VnZgqy29HKG")}${candidates.format}${__rmT("Vn7uFjPXHKG")}${candidates.text}`,
            attrs: { 'data-rh-external-candidate-library': library.libraryId },
            style: { fontSize: '12px', lineHeight: '1.5', marginTop: '6px' },
        }));
        row.append(el('div', { text: `${__rmT("zO_qm0eFJHxStf")}${needsRebuild.has(library.libraryId) ? __rmT("SFgrYQUjHfPKmnqBOjh5BBT5ZeP.TxnY") : __rmT("G8PEnh")}`, style: { fontSize: '12px', lineHeight: '1.5', marginTop: '6px' } }));
        const actions = el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '7px' } });
        actions.append(button(__rmT("BG3LZMtxa5M2BIOYCshRcb31"), () => openSavedEntryChoices(library), { minHeight: '44px' }), button(__rmT("OVHiFe4gmJB"), () => {
            owner.savedEntrySequence++;
            owner.savedEntryLibrary = { libraryId: library.libraryId, displayName: library.displayName };
            openExternalReclassificationPanel(owner.savedEntriesPanel, library, {
                isCurrent: () => state === owner && owner.overlay.isConnected,
                onSaved: async () => { if (state === owner && owner.overlay.isConnected)
                    await renderSavedLibraries(); },
            });
            owner.savedEntriesPanel.scrollIntoView?.({ block: 'start' });
        }, { minHeight: '44px' }), button(library.enabled ? __rmT("pDWEnh") : needsRebuild.has(library.libraryId) ? __rmT("9wvGfirGF5uSApVwQE_") : __rmT("B8qEnh"), async (event) => {
            const control = event.currentTarget;
            control.disabled = true;
            try {
                if (!library.enabled && needsRebuild.has(library.libraryId))
                    await rebuildExternalPoolMetadata(library.libraryId);
                await setExternalLibraryEnabled(library.libraryId, !library.enabled);
                if (state !== owner || !owner.overlay.isConnected)
                    return;
                await renderSavedLibraries();
                setStatus(`${__rmT("PpA")}${library.enabled ? __rmT("pDWEnh") : __rmT("B8qEnh")}${__rmT("YSk")}${library.displayName}${__rmT("wZzC7J4FgjoVEnaCS10r6QkruYStWYvyoNjl_HnWMIgO.jv_K1pKUHbHAVIUGX0G065PVd_ncEd83EY1LZjdykBnPvGV7xi0E9LvWugXvp95aV1WVHM.4RFExxlEZf")}`);
            }
            catch (error) {
                setStatus(String(error?.message || error), 'error');
            }
            finally {
                control.disabled = false;
            }
        }, { minHeight: '44px' }), button(__rmT("Uv_.p5.04FnPWk"), async () => {
            if (typeof globalThis.confirm === 'function' && !globalThis.confirm(`${__rmT("4tGvxPVkrYU5KA9t1ym8u6W3rJjDrk")}${library.displayName}${__rmT("foW2xk")}`))
                return;
            try {
                await deleteExternalLibrary(library.libraryId);
                if (state === owner && owner.savedEntryLibrary?.libraryId === library.libraryId) {
                    owner.savedEntryLibrary = null;
                    owner.savedEntrySequence++;
                    owner.savedEntriesPanel.replaceChildren();
                    owner.savedEntriesPanel.hidden = true;
                }
                await renderSavedLibraries();
                setStatus(`${__rmT("oehPCTobXN7bX6TzsYZruXhWqpKI8Op2")}${library.displayName}${__rmT("foWrzT")}`);
            }
            catch (error) {
                setStatus(String(error?.message || error), 'error');
            }
        }, { minHeight: '44px' }));
        if (needsRebuild.has(library.libraryId)) {
            const rebuild = button(__rmT("8rKkkblENoaA1wRG"), async () => {
                rebuild.disabled = true;
                try {
                    await rebuildExternalPoolMetadata(library.libraryId);
                    await renderSavedLibraries();
                    if (state === owner)
                        setStatus(__rmT("tGr_o1KfewLmQSvgp2oy143RaoSbpnb9jfcbjGHVRaqGQyqDF5pr7f"), 'success');
                }
                catch (error) {
                    if (state === owner)
                        setStatus(String(error?.message || error), 'error');
                }
                finally {
                    rebuild.disabled = false;
                }
            }, { minHeight: '44px' });
            actions.append(rebuild);
            row.append(el('div', { text: __rmT("qBEla6lKxwKPIlksDrc4YwJeYIfGS3L8OwTVeUERrExrnKyxacM4lOC7RfbU2vZX_pYxkBLL0ZKXpEH9"), style: { fontSize: '12px', lineHeight: '1.5', marginTop: '6px' } }));
        }
        row.append(actions);
        state.savedLibrariesList.append(row);
    }
}
async function openSavedEntryChoices(library) {
    if (!state?.savedEntriesPanel)
        return;
    const owner = state;
    owner.savedEntryLibrary = { libraryId: library.libraryId, displayName: library.displayName };
    owner.savedEntryPage = 0;
    owner.savedEntryQuery = '';
    await renderSavedEntryChoices();
    if (state === owner && owner.overlay.isConnected && owner.savedEntryLibrary?.libraryId === library.libraryId) {
        try {
            owner.savedEntriesPanel.scrollIntoView({ block: 'start' });
            owner.savedEntriesPanel.focus({ preventScroll: true });
        }
        catch { }
    }
}
async function renderSavedEntryChoices() {
    const owner = state;
    if (!owner?.savedEntryLibrary || !owner.savedEntriesPanel)
        return;
    const library = owner.savedEntryLibrary;
    const sequence = ++owner.savedEntrySequence;
    const page = owner.savedEntryPage;
    const panel = owner.savedEntriesPanel;
    const current = () => state === owner && owner.overlay.isConnected && sequence === owner.savedEntrySequence;
    panel.hidden = false;
    panel.replaceChildren();
    panel.append(el('h3', { text: `${library.displayName}${__rmT("OrawZZuMGuiNxH_zUS8cE6quCoC")}`, style: { fontSize: '15px', margin: '0 0 8px', overflowWrap: 'anywhere' } }));
    panel.append(el('p', { text: __rmT("OSpoNNiL1IXMN3BmWUERhsbgJQHl5wgGOniaQxMfvP8RCqmynLl1aEz9a6gm4V_WCfX.Z6S47aB6qo8xbZhPfodLDcQb0dIFRv_s5zwOzV5CY1KA6jJ8XJYkcPLq6G_5jKhXrzrGXmqGrwPZG2wdZu10cDNGMzyuGJQt1v_sLRtQFDU.oLaOD6vhE.vDZCwJiEar_HJvxJ1CPmM2O5o2rEhT"), style: { fontSize: '13px', lineHeight: '1.6', margin: '0 0 8px' } }));
    const message = el('div', { text: __rmT("mbdy00Zn.u.RIvGiW_qfG0gDL2s"), attrs: { role: 'status', 'aria-live': 'polite' }, style: { fontSize: '13px', lineHeight: '1.5', margin: '8px 0' } });
    const searchLabel = el('label', { text: __rmT("2h85ova0KfrlVG.__Rk"), style: { display: 'block', fontSize: '13px' } });
    const search = el('input', { type: 'search', value: owner.savedEntryQuery, className: 'text_pole', style: { width: '100%', minHeight: '44px', boxSizing: 'border-box' } });
    searchLabel.append(search);
    const filter = () => { owner.savedEntryQuery = search.value.trim().slice(0, 200); owner.savedEntryPage = 0; renderSavedEntryChoices(); };
    const actions = el('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', margin: '8px 0' } });
    actions.append(button(__rmT("PJvh80bXNNT"), filter, { minHeight: '44px' }), button(__rmT("rFwRASsHXozbsTKe"), () => {
        owner.savedEntrySequence++;
        owner.savedEntryLibrary = null;
        panel.replaceChildren();
        panel.hidden = true;
    }, { minHeight: '44px' }));
    search.addEventListener('keydown', event => { if (event.key === 'Enter') {
        event.preventDefault();
        filter();
    } });
    panel.append(searchLabel, actions, message);
    try {
        const result = await listExternalLibraryEntryChoices(library.libraryId, { offset: page * PAGE_SIZE, pageSize: PAGE_SIZE, query: owner.savedEntryQuery });
        if (!current())
            return;
        message.textContent = result.choices.length ? `${__rmT("BJgCyT")}${page + 1}${__rmT("4b6txAJxym10XsBq")}${result.choices.length}${__rmT("kbjgaz.JRYMmOqdSbS.yGkqfAh_26g_qHCqsCIszCYfoZBOXq8_")}` : __rmT("tmMwwiU0NF5c6KTi2ztfG0gDbNs");
        for (const choice of result.choices) {
            const label = el('label', { style: { display: 'flex', alignItems: 'center', gap: '10px', minHeight: '44px', padding: '7px 0', borderBottom: '1px solid color-mix(in srgb,currentColor 12%,transparent)', overflowWrap: 'anywhere' } });
            const checkbox = el('input', { type: 'checkbox', attrs: { 'data-rh-external-entry-id': choice.externalId }, style: { flex: '0 0 auto' } });
            checkbox.checked = choice.enabled && choice.selectable;
            checkbox.disabled = !choice.selectable;
            const text = el('span', { text: `${choice.title}${__rmT("eis")}${CLASSIFICATION_LABELS[choice.classification] || __rmT("cyZ_9RWT")}${choice.selectable ? '' : __rmT("2OzVWJ6x3FOOkWi0yFJ8qk")}${__rmT("eXs")}`, style: { minWidth: '0', fontSize: '14px' } });
            label.append(checkbox, text);
            checkbox.addEventListener('change', async () => {
                const before = choice.enabled;
                const desired = checkbox.checked;
                checkbox.disabled = true;
                checkbox.setAttribute('aria-busy', 'true');
                message.textContent = `${__rmT("cIFOAEHguFOAsh")}${choice.title}${__rmT("foWSrT")}`;
                try {
                    const saved = await setExternalLibraryEntryEnabled(library.libraryId, choice.externalId, desired);
                    if (state === owner && owner.overlay.isConnected)
                        await renderSavedLibraries();
                    if (!current())
                        return;
                    choice.enabled = saved.enabled;
                    checkbox.checked = saved.enabled;
                    message.textContent = `${__rmT("iFB45T6zWZY")}${saved.enabled ? __rmT("EGwR9T") : __rmT("WFOL6N0g0CG")}${__rmT("YSk")}${choice.title}${__rmT("Toxna7H3zIXm4vzX7jBrwbOcN.FU1JjvKnk.adHud1cvQhGjR5Br7f")}`;
                }
                catch (error) {
                    if (!current())
                        return;
                    checkbox.checked = before;
                    message.textContent = String(error?.message || __rmT("vyhozoTWJeYoJG4y3i0vrkSvdwGMQR38406FQNcYgG8"));
                }
                finally {
                    if (current()) {
                        checkbox.disabled = false;
                        checkbox.removeAttribute('aria-busy');
                    }
                }
            });
            panel.append(label);
        }
        const pager = el('div', { style: { display: 'flex', gap: '8px', marginTop: '10px' } });
        const previous = button(__rmT("wn.QvaJ_j9ZL.k"), () => { owner.savedEntryPage = page - 1; renderSavedEntryChoices(); }, { minHeight: '44px' });
        const next = button(__rmT("w4.QvaJ_j9ZL.k"), () => { owner.savedEntryPage = page + 1; renderSavedEntryChoices(); }, { minHeight: '44px' });
        previous.disabled = page === 0;
        next.disabled = !result.hasNext;
        pager.append(previous, next);
        panel.append(pager);
    }
    catch (error) {
        if (current())
            message.textContent = String(error?.message || __rmT("1hkjtyLnx5N59lXtRnGc45YeCBzIvSZxUUBU6wKq"));
    }
}
function createExternalRandomControls() {
    const box = el('fieldset', { style: { border: '1px solid color-mix(in srgb,currentColor 22%,transparent)', borderRadius: '12px', padding: '10px', margin: '0 0 14px', minWidth: '0' } });
    box.append(el('legend', { text: __rmT("9JmYDlDNawaMI1eH"), style: { fontSize: '13px', fontWeight: '700' } }));
    const label = el('label', { style: { display: 'flex', alignItems: 'center', gap: '8px', minHeight: '44px', fontSize: '14px' } });
    const toggle = el('input', { id: 'rh_external_random_enabled', type: 'checkbox' });
    label.append(toggle, document.createTextNode(__rmT("qweFIlcC5LnSzY9twX2WoXmDD2rMYT")));
    const hint = el('p', { text: __rmT("PVf5q_Mej2BJ1.7WlGsQT6DeZR2UrD.1uDnEAulfknm16V8B5G7y9BySvKQ2tQzYWS0U1wRs2yxqoTUFbtytVoxtNdTVZvQHXZK1u_HxY85d9asEmZVo87NfDPKDNv_Tfpg8FKmNxLwcOGq9I7BPQMcRt0_CrFAyKsKW_Alzmr.Wj8oesaM9WMkXNggLMPczErB"), style: { fontSize: '12px', lineHeight: '1.55', margin: '0 0 8px' } });
    const modeLabel = el('label', { text: __rmT("iazDWk5ymD3U8gMF5P6kKf"), attrs: { for: 'rh_external_random_mix' }, style: { display: 'block', fontSize: '13px', margin: '6px 0' } });
    const mode = el('select', { id: 'rh_external_random_mix', className: 'text_pole', style: { width: '100%', minHeight: '44px', boxSizing: 'border-box' } });
    for (const [value, text] of [['builtin-preferred', __rmT("9bC8gmcokYlcWjvxC3Pt9_bBm2f9jh")], ['balanced', __rmT("LtZnxF1WNzajotKnJ7YWNxJVKr5xZpdViOoCok")], ['external-preferred', __rmT("Jy4.zpoYXwnqISg68wD8zQf9wGwDapMxY9qhMa8u")], ['external-only', __rmT("BeB0.JFShuJ_mwHGArAgY.mHGC9CsmR3")]]) {
        mode.append(el('option', { value, text }));
    }
    const status = el('div', { attrs: { role: 'status' }, style: { fontSize: '12px', lineHeight: '1.5', marginTop: '8px', overflowWrap: 'anywhere' } });
    const render = () => {
        const settings = getSettings();
        toggle.checked = settings.externalWorldBookRandomEnabled === true && settings.externalWorldBookMixMode !== 'builtin-only';
        mode.value = settings.externalWorldBookMixMode === 'builtin-only' ? 'builtin-preferred' : settings.externalWorldBookMixMode;
        mode.disabled = !toggle.checked;
        status.textContent = toggle.checked
            ? __rmT("kIBUihNbb8JwwMVZbzP1ZrOBGZHvNgwHiFKIu1cnoqYtBtX4wYvu1MkT3ivoPapLoIYdsFGP") : __rmT("HB3qrhe31_ThaOo9_ZybuWIVC6U4RAnIfn_IwoAM1CMXnTDnL43B8xbNziJmg_foz8ANQIXXkYVUVNWjGB8O5ra_QHDKiol_XEK7dwXzEPAQnCDYBJT");
    };
    toggle.addEventListener('change', () => {
        updateSettings({ externalWorldBookRandomEnabled: toggle.checked, ...(toggle.checked ? { externalWorldBookMixMode: mode.value || 'builtin-preferred' } : {}) });
        render();
    });
    mode.addEventListener('change', () => { updateSettings({ externalWorldBookMixMode: mode.value }); render(); });
    box.append(label, hint, modeLabel, mode, status);
    render();
    return box;
}
function createLibraryTransferControls() {
    const panel = el('section', { id: 'rh_external_transfer_panel', style: { margin: '12px 0 14px', minWidth: '0' } });
    panel.append(el('h3', { text: __rmT("3sn8a3GWVSoB.84yMRyNpIyj9_lbAcmuXb.4yeMIj4l"), style: { margin: '0 0 8px', fontSize: '16px' } }));
    panel.append(el('p', { text: __rmT("6K9k2DmQlWoWzS.L3t0GI23BPkWJhAcJ3uSQ8XDflka4cPlS0_RaH8sHve4kEQR_r4SJBclARU2eumAVjaEmcJ96JoNVScNqqMu685.tO5pM2gDBcDS6YCxc.LuacF._q60JmJPHzHKtBEGPPL.OGi170wsKyBWDyGG1pLnY3_pXuykdI2hVFNVymM6Beh"), style: { fontSize: '14px', lineHeight: '1.6', margin: '4px 0 12px', overflowWrap: 'anywhere' } }));
    const message = el('div', { id: 'rh_external_transfer_status', attrs: { role: 'status', 'aria-live': 'polite', tabindex: '-1' }, style: { fontSize: '12px', lineHeight: '1.5', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', marginTop: '8px' } });
    const file = el('input', { id: 'rh_external_transfer_file', type: 'file', className: 'text_pole', attrs: { accept: '.json,application/json', 'aria-describedby': message.id }, style: { width: '100%' } });
    let pending = null, busy = false, sequence = 0;
    const current = owner => state === owner && owner?.overlay.isConnected && panel.isConnected;
    const feedback = (text, error = false) => { message.textContent = text; if (error) {
        try {
            message.focus({ preventScroll: true });
        }
        catch { }
    } };
    const lock = value => { busy = value; exportButton.disabled = value; file.disabled = value; importButton.disabled = value || !pending; };
    const clearPending = () => { sequence++; pending = null; file.value = ''; importButton.disabled = true; message.textContent = ''; };
    const prepareBackup = backup => {
        if (busy)
            return false;
        clearPending();
        pending = backup;
        state?.showView('transfer', { announce: false });
        feedback(`${__rmT("UOqV1TaYXpxStf")}${backup.libraries.length}${__rmT("N_wvFsj1OiG")}${backup.libraries.reduce((sum, item) => sum + item.entries.length, 0)}${__rmT("SzWBVpiWLQYGyExsTkDc0c1gF4SZnmnXTbE6LDtZhHaUjdIMBY0vLFcIzBG")}`);
        lock(false);
        try {
            message.scrollIntoView({ block: 'center' });
        }
        catch { }
        return true;
    };
    const exportButton = button(__rmT("WQ.xnHqFgvVyY8MmkoopDGHw"), async () => {
        if (busy)
            return;
        const owner = state;
        lock(true);
        feedback(__rmT("RqPh.YB_O.mxQaLmp_mHk64vGxJqWsgAGJqw_xnJoz9SYAmRJ4DPcV0i"));
        try {
            const module = await import('./backup.js?rmv=2.1.5');
            if (!current(owner))
                return;
            const result = await module.exportExternalLibraryBackup();
            if (!current(owner))
                return;
            const url = URL.createObjectURL(new Blob([result.text], { type: 'application/json;charset=utf-8' }));
            const link = el('a', { attrs: { href: url, download: `RabbitMirror-external-libraries-${new Date().toISOString().slice(0, 10)}.json` } });
            panel.append(link);
            try {
                link.click();
            }
            finally {
                link.remove();
                setTimeout(() => URL.revokeObjectURL(url), 30000);
            }
            feedback(`${__rmT("iFBBAe1kHKG")}${result.libraryCount}${__rmT("N_wvFsj1OiG")}${result.entryCount}${__rmT("l13vyw5dRhrDZOSsBF1PSj9AwkDvmrE3pAleKKCQK.X8kl_mZWMobwoEuBf3N3Ke8sMdrJ0FcFy7.lExV7jfurGu")}`);
        }
        catch (error) {
            if (current(owner))
                feedback(String(error?.message || __rmT("3c6xCVQfS1h4jqmpPY2BYxstNUwss7s2")), true);
        }
        finally {
            if (current(owner))
                lock(false);
        }
    }, { minHeight: '44px', width: '100%', marginBottom: '8px' });
    const importButton = button(__rmT("4Q_ELu4F1D3lmAihkuYTMf"), async () => {
        if (busy || !pending)
            return;
        if (!globalThis.confirm(__rmT("3cqFr_jo8GwZ2dJeOvI.N5bIZyUUUkhxcHaYYv_3036F9gQERjnqpJRdVXPo9UyXN5E9gWvtHB01lIPXatWwKd_NeB6DN8Mao18HRW0W90ZbL_in2A5_vdpruOVTxbttygOqIkUOPZiB4.L3IVpb5DEnVHU860J6PSp")))
            return;
        const owner = state, backup = pending;
        lock(true);
        feedback(__rmT("RqPh.ZgpkR_k48RwcxWhQ55l9zkGV9BOeQYrBKWW8RkKf2ATwyEPcV0i"));
        try {
            const module = await import('./backup.js?rmv=2.1.5');
            if (!current(owner))
                return;
            const result = await module.importExternalLibraryBackup(backup);
            if (!current(owner))
                return;
            pending = null;
            file.value = '';
            feedback(`${__rmT("GaI59X4FN2Zj0TzsrJ0dHT")}${result.importedLibraries}${__rmT("qGto.qxg")}${result.importedEntries}${__rmT("xBihzlsctmndDO707SzzlFf9dgO5s6vu2pEgkKc1")}${result.skippedLibraries}${__rmT("9TYWHdpFOFgO6KWvBp1DZT8DOpiax7s2")}`);
            await renderSavedLibraries();
        }
        catch (error) {
            if (current(owner))
                feedback(String(error?.message || __rmT("4ey9CJKHkvrVzOEncdwk4oHyXKUd4Xtu7Jq0AOxxDc2GQzteiEDr7f")), true);
        }
        finally {
            if (current(owner))
                lock(false);
        }
    }, { minHeight: '44px', width: '100%', marginTop: '8px' });
    importButton.disabled = true;
    file.addEventListener('change', async () => {
        if (busy)
            return;
        if (state)
            state.localFileSequence++;
        pending = null;
        importButton.disabled = true;
        const selected = file.files?.[0];
        if (!selected)
            return;
        const owner = state, ownSequence = ++sequence;
        lock(true);
        feedback(__rmT("Oi4HytLS2SVXalRKbsF5Qr9DS8tJvUyLXHb9PR.W"));
        try {
            const module = await import('./backup.js?rmv=2.1.5');
            if (!current(owner))
                return;
            const backup = await module.readExternalLibraryBackupFile(selected);
            if (!current(owner) || sequence !== ownSequence)
                return;
            pending = backup;
            feedback(`${__rmT("UOqV1TaYXpxStf")}${backup.libraries.length}${__rmT("N_wvFsj1OiG")}${backup.libraries.reduce((sum, item) => sum + item.entries.length, 0)}${__rmT("SzWBVpiWLQYGyExsTkDc0c1gF4SZnmnXTbE6LDtZhHaUjdIMBY0vLFcIzBG")}`);
        }
        catch (error) {
            if (current(owner) && sequence === ownSequence) {
                file.value = '';
                feedback(String(error?.message || __rmT("je9CGi21D56ru6R464LM87EI")), true);
            }
        }
        finally {
            if (current(owner) && sequence === ownSequence)
                lock(false);
        }
    });
    panel.append(el('h4', { text: __rmT("mPNraZOKqYynAnzbVkFgUJ026lp"), style: { margin: '12px 0 8px', fontSize: '14px' } }), exportButton, el('h4', { text: __rmT("QDpoeUTIJ4QiKb2vJf4M01Rd5AReH14Jd.Y"), style: { margin: '16px 0 8px', fontSize: '14px' } }), el('label', { text: __rmT("0AxA2ftcvWZvRA.Ymwmmfc.TP6NWaIKbDQDweze9RZa_WUr1dn79Za9bDvHxiXeEsUxMQ72WHHY5XH8hMdoxcLT3X12f8.skW0C.hWhfksCJ56tZ0NUhXRthVH8"), attrs: { for: file.id }, style: { display: 'block', margin: '8px 0', fontSize: '13px', overflowWrap: 'anywhere' } }), file, importButton, message);
    panel.append(createServerBackupSection(() => current(state), renderSavedLibraries));
    panel.append(el('p', { text: __rmT("ui6dZlVKysfYmQYX4KTV0RhK6.Jo5osnUtgTNDzKIM29X23A.RFy5JZui_VgEyQ00uwp8.w0lI6PjppMiMhG34SzpDlqkd9RPOg9_iMlksCJiI6gNa9b82kX3nUCscD4Gf_eAr2urUwMct9ftyfuT0hVtOGs.yd455Notc7cosH4Se5Jv4rN66D9WOyThp5YEQKwChptImeFVql9e3UHt9Pca_VuVVh7VyPxqje8pMrN8Omn7Mxy24avwR7haf"), style: { fontSize: '12px', lineHeight: '1.6', margin: '12px 0 0', overflowWrap: 'anywhere' } }));
    return { panel, prepareBackup, clearPending, isBusy: () => busy, dispose: () => { sequence++; pending = null; file.value = ''; } };
}
function backupTimeText(at) {
    const date = new Date(Number(at) || 0);
    if (!Number(at) || Number.isNaN(date.getTime()))
        return '';
    const pad = value => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function createServerBackupSection(isCurrent, afterRestore) {
    const section = el('section', { id: 'rh_external_server_backup', style: { marginTop: '16px', minWidth: '0' } });
    section.append(el('h4', { text: __rmT("l18yZaw6OQSV0cHBg9gtLk"), style: { margin: '0 0 6px', fontSize: '14px' } }));
    section.append(el('p', { text: __rmT(".xhaCUduE0nDzSfC6WYjnz0KH9jQ8yANn5PKcKMcN8O_WWmYz.DnTNF3T8e9yjwRraCC_6zCVQD0MFsN7CrVEaRpYu64CXQFZvPUT6tDff65LYoa2jppBPPvyPdscI_omzWLKSRtbxKVQWn0R2qGOPtXleKQs.Q0.2TIrgC6eOxeM2X1eeL1uyX7UysCZe5Socdr_0igKJm0OEotKkDiNlhT"), style: { fontSize: '12px', lineHeight: '1.6', margin: '0 0 8px', overflowWrap: 'anywhere' } }));
    const line = el('div', { attrs: { role: 'status', 'aria-live': 'polite' }, style: { fontSize: '12px', lineHeight: '1.5', margin: '0 0 8px', overflowWrap: 'anywhere' } });
    let busy = false;
    const describe = status => {
        if (!status)
            return __rmT("lsnDJVyjDsz8f7FPUbD.HORmhVzUdNzIZOospf");
        if (status.ok)
            return `${__rmT("2ZR53FiyJour1XSSVpA")}${backupTimeText(status.savedAt)}${__rmT("sWv4hec6")}${status.libraryCount}${__rmT("qGto.qxg")}${status.entryCount}${__rmT("2RdUjk")}${status.keptFromServer ? `${__rmT("KW5uOVc6")}${status.keptFromServer}${__rmT("xBw.ztS.aRToy5V0XuizlFEFjYFmmEyhr6IbAwZ8")}` : ''}${__rmT("jzk")}`;
        return `${__rmT("WgJyer1EKIi12dKDnXedmkty")}${status.message || __rmT("cHhXcUwjS2T")}${status.savedAt ? `${__rmT("uecBYEy2ATDp6tVHVpA")}${backupTimeText(status.savedAt)}` : ''}`;
    };
    const refresh = async () => {
        const module = await import('./serverBackup.js?rmv=2.1.5');
        if (section.isConnected)
            line.textContent = describe(module.getMotherLibraryServerBackupStatus());
    };
    const lock = value => { busy = value; saveButton.disabled = value; restoreButton.disabled = value; };
    const saveButton = button(__rmT("AHvhOnnFouOTtd.LcrVkth"), async () => {
        if (busy)
            return;
        lock(true);
        line.textContent = __rmT("kBZhOnnFGUWb8nukGR4hOT");
        try {
            const module = await import('./serverBackup.js?rmv=2.1.5');
            const status = await module.saveMotherLibraryServerBackup();
            if (section.isConnected)
                line.textContent = describe(status);
        }
        catch (error) {
            if (section.isConnected)
                line.textContent = `${__rmT("VOUk8CKbRBcStf")}${String(error?.message || error)}`;
        }
        finally {
            if (section.isConnected)
                lock(false);
        }
    }, { minHeight: '44px', width: '100%', marginBottom: '8px' });
    const restoreButton = button(__rmT("9Zlk0YelKn4HTkx2kXE"), async () => {
        if (busy)
            return;
        lock(true);
        line.textContent = __rmT("Mr80UHSzoMu3lLByp2Dv70DxoeP0.4Eg");
        try {
            const module = await import('./serverBackup.js?rmv=2.1.5');
            const result = await module.restoreMotherLibrariesFromServerBackup();
            if (!section.isConnected)
                return;
            line.textContent = result.empty ? __rmT("auZRLJXB3j9i5yWTppSNeMBahAA8aOs2") : `${__rmT("kDXVSX4FN2Zj0Ke7LJ2dHT")}${result.importedLibraries}${__rmT("qGto.qxg")}${result.importedEntries}${__rmT("wRYXw1H3X7__uu7v1.WGx4Cx")}${result.skippedLibraries}${__rmT("RN39Rfkx42EbdKPIVPOzDXdNjsh5M6mLLRCKAArMgG8")}`;
            if (isCurrent())
                await afterRestore?.();
        }
        catch (error) {
            if (section.isConnected)
                line.textContent = `${__rmT("VOUk8WeClHHStf")}${String(error?.message || error)}${__rmT("CtGWHUUi1BBrxanOnWAjj4TtwjV.xOs2")}`;
        }
        finally {
            if (section.isConnected)
                lock(false);
        }
    }, { minHeight: '44px', width: '100%' });
    section.append(line, saveButton, restoreButton);
    void refresh().catch(() => { });
    return section;
}
function bindImportViewport(overlay) {
    const viewport = globalThis.visualViewport;
    let frame = 0;
    let disposed = false;
    const sync = () => {
        frame = 0;
        if (disposed || !overlay.isConnected)
            return;
        const width = Math.max(1, Number(viewport?.width) || window.innerWidth);
        const height = Math.max(1, Number(viewport?.height) || window.innerHeight);
        const values = { vw: width, vh: height, top: Math.max(0, Number(viewport?.offsetTop) || 0), left: Math.max(0, Number(viewport?.offsetLeft) || 0) };
        for (const [name, number] of Object.entries(values)) {
            const property = `--rh-external-${name}`;
            const value = `${Math.round(number * 100) / 100}px`;
            if (overlay.style.getPropertyValue(property) !== value)
                overlay.style.setProperty(property, value);
        }
    };
    const schedule = () => { if (!disposed && !frame)
        frame = requestAnimationFrame(sync); };
    viewport?.addEventListener('resize', schedule, { passive: true });
    viewport?.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    sync();
    return () => {
        disposed = true;
        if (frame)
            cancelAnimationFrame(frame);
        viewport?.removeEventListener('resize', schedule);
        viewport?.removeEventListener('scroll', schedule);
        window.removeEventListener('resize', schedule);
    };
}
function createModal(initialView = 'plain', importKind = '') {
    if (initialView === 'manage') {
        openMotherLibraryPage();
        return;
    }
    if (state?.inline === true)
        pageState = state;
    else
        state?.dismiss?.(false);
    state = null;
    document.getElementById(MODAL_ID)?.remove();
    const returnFocus = document.activeElement;
    const overlay = el('dialog', {
        id: MODAL_ID,
        attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-label': __rmT("SGvqZqbEdfeknJ.pyKdfMjxh") },
        style: { position: 'fixed', inset: '0', zIndex: '2147483010', background: 'rgba(8,10,14,.68)', padding: 'max(12px,env(safe-area-inset-top)) max(10px,env(safe-area-inset-right)) max(12px,env(safe-area-inset-bottom)) max(10px,env(safe-area-inset-left))', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    });
    overlay.append(el('style', { text: `
#${MODAL_ID}, #${MODAL_ID} * { box-sizing: border-box; writing-mode: horizontal-tb; }
#${MODAL_ID} {
 position: fixed !important; inset: var(--rh-external-top,0px) auto auto var(--rh-external-left,0px) !important; margin: 0 !important;
 width: var(--rh-external-vw,100%) !important; max-width: none !important; min-width: 0 !important;
 height: var(--rh-external-vh,100vh) !important; max-height: none !important; min-height: 0 !important;
 transform: none !important; translate: none !important; scale: none !important;
 border: 0 !important; overflow: hidden !important; contain: none !important;
 display: flex !important; flex-direction: row !important; flex-wrap: nowrap !important; align-items: center !important; justify-content: center !important;
 padding: max(12px,env(safe-area-inset-top)) max(10px,env(safe-area-inset-right)) max(12px,env(safe-area-inset-bottom)) max(10px,env(safe-area-inset-left)) !important;
}
#${MODAL_ID}::backdrop { background: transparent; }
#${MODAL_ID} > .rh-external-card {
 position: relative !important; inset: auto !important; transform: none !important; margin: 0 !important;
 min-width: 0 !important; min-height: 0 !important; max-width: 100% !important;
 max-height: calc(var(--rh-external-vh,100vh) - max(12px,env(safe-area-inset-top)) - max(12px,env(safe-area-inset-bottom))) !important;
 max-height: min(860px,calc(var(--rh-external-vh,100vh) - max(12px,env(safe-area-inset-top)) - max(12px,env(safe-area-inset-bottom)))) !important;
 display: flex !important; flex-direction: column !important;
}
#${MODAL_ID} .rh-external-header, #${MODAL_ID} .rh-external-status { flex: 0 0 auto; }
#${MODAL_ID} .rh-external-status { max-height: 4.5em; overflow-y: auto; overflow-wrap: anywhere; }
#${MODAL_ID} .rh-external-scroll { flex: 1 1 auto !important; min-height: 0 !important; overflow-y: auto !important; overflow-x: hidden; }
#${MODAL_ID} .rh-external-button, #${MODAL_ID} .rh-external-input {
 position: static !important; float: none !important; transform: none !important;
 width: var(--rh-external-control-width,100%) !important; min-width: 0 !important; max-width: 100% !important;
 height: auto !important; min-height: 44px !important; font: inherit; font-size: 14px !important;
 line-height: 1.5 !important; letter-spacing: normal !important; writing-mode: horizontal-tb !important;
 color: inherit; background: var(--SmartThemeBlurTintColor,#fff); border: 1px solid var(--SmartThemeBorderColor,#b8c5d6);
 border-radius: 12px; padding: 8px; margin: 0; opacity: 1; text-shadow: none;
}
#${MODAL_ID} .rh-external-button { display: block !important; white-space: normal !important; word-break: normal !important; overflow-wrap: break-word !important; cursor: pointer; touch-action: manipulation; }
#${MODAL_ID} .rh-external-button:disabled, #${MODAL_ID} .rh-external-input:disabled { opacity: .55; cursor: default; }
#${MODAL_ID} .rh-external-button:focus-visible, #${MODAL_ID} .rh-external-input:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
#${MODAL_ID} .rh-external-button:active:not(:disabled) { filter: brightness(.92); }
#${MODAL_ID} .rh-external-button[aria-pressed="true"] { border-width: 2px; font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }
#${MODAL_ID} #rh_external_local_file { display: none !important; }
#${MODAL_ID} #rh_external_choose_file { min-height: 44px !important; border-width: 2px; font-weight: 700; }
@media (pointer: coarse) { #${MODAL_ID} .rh-external-input { font-size: 16px !important; } }
` }));
    applyAppearanceTheme(overlay);
    const card = el('div', { className: 'rh-external-card', style: { width: 'min(820px,100%)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--SmartThemeBlurTintColor,#fff)', color: 'var(--SmartThemeBodyColor,#34495d)', border: '1px solid var(--SmartThemeBorderColor,#cfdae5)', borderRadius: '18px', boxShadow: '0 22px 70px rgba(0,0,0,.42)' } });
    const header = el('div', { className: 'rh-external-header', style: { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 44px', gap: '8px', alignItems: 'center', padding: '11px 12px', borderBottom: '1px solid color-mix(in srgb,currentColor 12%,transparent)' } });
    const title = el('div');
    title.append(el('div', { text: __rmT("Y2F5wtgs58mNLfRXrbIPMX7m"), style: { fontWeight: '700', fontSize: '16px' } }));
    title.append(el('div', { text: __rmT("oGb8jwS0m7mQvz4p3uq.tTfSTPu_XYcbLTJHR0DRSptuWPid5nnATl6lyq7XTvqWmcvpIVmWr3GuGbVA.5tTGkE.0zsRPRp7zxiwh1I1fGbh99dIgK.M98wZ8ik"), style: { fontSize: '12px', lineHeight: '1.5', marginTop: '2px' } }));
    let disposeViewport = () => { };
    const dismiss = (restoreFocus = true) => {
        clearTimeout(debounceId);
        disposeViewport();
        transferControls.dispose();
        plainInput.value = '';
        if (overlay.open && typeof overlay.close === 'function')
            overlay.close();
        overlay.remove();
        if (state?.overlay === overlay)
            state = pageState;
        if (pageState?.ready && pageState.overlay?.isConnected)
            void renderSavedLibraries();
        if (restoreFocus && returnFocus?.isConnected) {
            try {
                returnFocus.focus({ preventScroll: true });
            }
            catch { }
        }
    };
    const closeButton = button('×', () => dismiss(), { width: '44px', minWidth: '44px', height: '44px', padding: '0', fontSize: '20px' });
    closeButton.setAttribute('aria-label', __rmT("68ZvnWb6tokTnzHN_bzOaneL"));
    header.append(title, closeButton);
    const scroll = el('div', { className: 'rh-external-scroll', style: { padding: '12px', minHeight: '0', minWidth: '0', overflowY: 'auto', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y' } });
    scroll.append(el('p', { className: 'rh-external-import-notice', text: __rmT("eAL5V9tAxiB4Wq3.eLRMd1vtrFTTdMtqy2EFDvt2qR1qV0iz0sW0svApHy6JlPcv1C8R4azKgmvLi0j8BD1o9KoIWAT"), style: { margin: '0 0 12px', fontSize: '12px', lineHeight: '1.6', overflowWrap: 'anywhere' } }));
    const transferControls = createLibraryTransferControls();
    const navGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '8px', gridAutoRows: '1fr' };
    const sourceButtons = el('nav', { attrs: { 'aria-label': __rmT("fVEq80tXV6f") }, style: { ...navGridStyle } });
    const utilityButtons = el('nav', { attrs: { 'aria-label': __rmT("EzvAvxUJWPOX.h") }, style: { ...navGridStyle, marginTop: '8px' } });
    const hostPane = el('section', { id: 'rh_external_host_panel', style: { marginTop: '12px' } });
    const filePane = el('section', { id: 'rh_external_file_panel', style: { marginTop: '12px', display: 'none' } });
    const plainPane = el('section', { id: 'rh_external_plain_panel', style: { marginTop: '12px', display: 'none' } });
    const managePane = el('section', { id: 'rh_external_manage_panel', style: { marginTop: '12px', display: 'none' } });
    const entrySection = el('section', { id: 'rh_external_entry_panel', style: { display: 'none' } });
    const sourceWorkflow = el('div');
    const navButtons = new Map();
    const showView = (which, { announce = true } = {}) => {
        if (!navButtons.has(which))
            which = 'plain';
        overlay.dataset.activeView = which;
        const isSource = ['host', 'file', 'plain'].includes(which);
        hostPane.style.display = which === 'host' ? '' : 'none';
        filePane.style.display = which === 'file' ? '' : 'none';
        plainPane.style.display = which === 'plain' ? '' : 'none';
        transferControls.panel.style.display = which === 'transfer' ? '' : 'none';
        managePane.style.display = which === 'manage' ? '' : 'none';
        sourceWorkflow.style.display = isSource ? '' : 'none';
        for (const [view, control] of navButtons)
            control.setAttribute('aria-pressed', String(view === which));
        if (which === 'host')
            loadHostBooks();
        if (which === 'manage')
            renderSavedLibraries();
        if (which === 'plain') {
            try {
                plainInput.focus({ preventScroll: true });
            }
            catch { }
        }
        if (announce && which !== 'host')
            setStatus(which === 'transfer' ? __rmT("rWm4DbOC8K2BCR_7zigv7OFVHiX3U_R6WWmPtngavNOy8fVGgwYAuSD.NlefUJoxGdQRpkw0O7sPKra6qAk") : which === 'manage' ? __rmT("5.u6C8grEjUhmBTf_E8nCJtL6YclmQfsFruVg.pLIp_CpEdv_zeAcRF.j2zYKxi48vbwTdLU6V9mfpsdhhiyu3EtlTf7rTHXYsCZHhz4m23Fqf.5xx092Had25tzGayVvbqNwqlUTCZVSKaDDJuP9fB5Tvd2QOkn.1wOPxcOHoKz9LSO7lG") : __rmT("Z8c_mcTTvcJ0Inx3AqrpdJSDAeBAbhb4isutMa3MOQfbjloaLYpmIxS8sAdNRmmu3BzrX1lLmgIXIpvISE..6OGVP6eHi5YO"));
    };
    for (const [view, label, panelId, group] of [
        ['plain', __rmT("A2b9431sADp"), plainPane.id, 'source'],
        ['file', __rmT("9p9.E5PvHEgew8sAnHutjdvHMYlnM7v9CwtfISiGdNYnJHiGCjx4K1_x"), filePane.id, 'source'],
        ['host', __rmT("PJ1NfXG62F0II3Njo9i0Kh"), hostPane.id, 'source'],
        ['transfer', __rmT("nEwGaXQDYXqnyuvFDAbu_8njMguj3h"), transferControls.panel.id, 'utility'],
        ['manage', __rmT("VhFts3HwpMnPWk"), managePane.id, 'utility'],
    ]) {
        const control = button(label, () => {
            if (view === 'manage') {
                dismiss(false);
                openMotherLibraryPage();
                return;
            }
            showView(view);
        }, { minHeight: '44px' });
        control.setAttribute('aria-controls', panelId);
        navButtons.set(view, control);
        (group === 'source' ? sourceButtons : utilityButtons).append(control);
    }
    const importPurpose = el('select', { id: 'rh_external_import_kind', className: 'text_pole', attrs: { 'aria-label': __rmT(".uz6AZqUPDh") } });
    for (const [value, label] of [['', __rmT("osV_TOkeDgsDJWwTgsuWauholbZ4xM6BKiHK5qMResD")], ['text', __rmT("CEQ9RNBzVSbi0ObzCtMoQWdj4tW2Qynv3m.gDbXMkRC")]])
        importPurpose.append(el('option', { value, text: label }));
    importPurpose.value = importKind === 'text' ? 'text' : '';
    importPurpose.addEventListener('change', () => {
        if (state?.overlay !== overlay)
            return;
        state.importKind = importPurpose.value === 'text' ? 'text' : '';
        state.classificationDraft = [];
        state.classificationPanel.style.display = 'none';
        setStatus(state.importKind === 'text' ? __rmT("K0qIndPthsRl6xFSk4yJTGx1wWd8xrHjZ86_fo_xAalzxKgevvSzJSlQy7UZ_2dvD5Zg_Yf3Zc42OgPSGHJdMmwuVmxT3is2ANA") : __rmT("cjnNXULJ1yUi210_3ii5JOOf5k0xn5Iwg_HuwBBFKteVtnxYb4WblpN1btk9uT"));
    });
    scroll.append(el('label', { text: __rmT("n39NjAbomwn.1scU"), attrs: { for: importPurpose.id } }), importPurpose, el('p', { text: __rmT("vudIjizYNASLLdAq_znLpCIGnzr8M.wOEalOQj0xG1Ou82f2U029smaAtmz.GLUsICpJ1KIB4TXkeZ15_Cz8bgwCHR8qMYsEjLnJit_IcywhP4YcVhtW7IlZDbi54kDqhMsZdUAc"), style: { fontSize: '12px', lineHeight: '1.5' } }), el('div', { text: __rmT("nR9NjAbomwn5I1uu"), style: { fontSize: '13px', fontWeight: '700', margin: '10px 0 6px' } }), sourceButtons, el('div', { text: __rmT("Q9xjsZ_ANdoTBs_wJOOf0657cOLHdgAhQe89OetZGY9CPcejcph"), style: { fontSize: '13px', fontWeight: '700', margin: '14px 0 6px' } }), utilityButtons);
    const bookSearch = el('input', { className: 'text_pole', type: 'search', placeholder: __rmT("oTUTB3L2wOxvTrRwmEE"), style: { width: '100%', marginTop: '8px', boxSizing: 'border-box' } });
    const bookList = el('div', { style: { maxHeight: '210px', overflowY: 'auto', marginTop: '6px', padding: '4px 2px', WebkitOverflowScrolling: 'touch' } });
    bookSearch.addEventListener('input', renderBookList);
    hostPane.append(el('h3', { text: __rmT("YR5AZpdICuL365TiHz4jSv4UrE8"), style: { fontSize: '16px', margin: '0 0 8px' } }), bookSearch, bookList);
    const fileInput = el('input', { id: 'rh_external_local_file', type: 'file', attrs: { accept: '.json,.txt,.md,application/json,text/json,text/plain,text/markdown,application/octet-stream', multiple: 'multiple', tabindex: '-1', 'aria-label': __rmT("ANjb4GlUymp7IOIF") } });
    const chooseFile = button(__rmT("jBpOhQajIDvVfDsARHBAjdvHSARqMjr9XbtfICMGM9YLJGNGmWvJCBSk"), () => {
        if (state?.overlay === overlay && overlay.isConnected)
            fileInput.click();
    });
    chooseFile.id = 'rh_external_choose_file';
    chooseFile.setAttribute('aria-describedby', 'rh_external_file_help rh_external_file_selection');
    const fileSelection = el('div', { id: 'rh_external_file_selection', attrs: { role: 'status', 'aria-live': 'polite' }, text: __rmT("CeCOHd9u7QoDx72uqxyuenfgWCqlIIs2"), style: { fontSize: '13px', lineHeight: '1.5', marginTop: '8px', overflowWrap: 'anywhere' } });
    const localBookList = el('div', { style: { maxHeight: '210px', overflowY: 'auto', marginTop: '6px', padding: '4px 2px', WebkitOverflowScrolling: 'touch' } });
    fileInput.addEventListener('change', () => {
        const files = Array.from(fileInput.files || []);
        fileInput.value = '';
        if (state?.overlay !== overlay || !overlay.isConnected)
            return;
        if (!files.length)
            return;
        fileSelection.textContent = `${__rmT("iF2jpgm6HKG")}${files.length}${__rmT("Uqe0vFIOvBcStf")}${files.slice(0, 3).map(file => file.name).join(__rmT("jvk"))}${files.length > 3 ? '…' : ''}`;
        loadLocalFiles(files);
    });
    filePane.append(el('h3', { text: __rmT("r3zCtUywVtLU94eJtbnRyTP8h2qkPB415lN40gR1"), style: { fontSize: '16px', margin: '0 0 8px' } }), chooseFile, fileInput, fileSelection, el('div', { id: 'rh_external_file_help', text: __rmT("RpeIr4Wez_k.FcUs9EgccYEhrVXGFXfaruCz4RYJUDCZxoloSfiwpeKPS8GHGoKCq24KbswcelsfNMvzur3DwndqkcsjkkVxCQFgI8vTE.MllPepa2RqMr2rH.BRewX4eiDAjMyKZtQGVQ7tN2BORD8OLscFOYqw.f9shFZwyaNgyAMSUgjpRX9iTnMiC53YiQaaMfKc0.lguakwBqqqCZIq8gAEfvEAzT8Lc6Tn8AjEqkskTEbmJoh0lNNy7s_RCqZRi6WW6nQ45DKeh6TESKEzWBbWV1lRziOUa6Lz"), style: { fontSize: '12px', lineHeight: '1.6', marginTop: '8px' } }), localBookList);
    const plainTitle = el('input', { id: 'rh_external_plain_title', type: 'text', className: 'text_pole', attrs: { maxlength: '1000' }, value: __rmT("3hmLNEvQUnEiaoUoLoC"), style: { width: '100%' } });
    const plainInput = el('textarea', { id: 'rh_external_plain_text', className: 'text_pole', attrs: { 'aria-describedby': 'rh_external_plain_status' }, style: { width: '100%', minHeight: '140px', resize: 'vertical', whiteSpace: 'pre-wrap' } });
    const plainStatus = el('div', { id: 'rh_external_plain_status', attrs: { role: 'status' }, text: __rmT("EVF2y9BeKWhWBYocAcpGcgGr_Mg_SYvyPrfdurmj8ZFDmCS0aqGy1It8IaQHxp9abomeLtHxPm5v4oVlj1uxg7IEXlIU9k4xeJ9f7cWRVcCBXUdZaiOXN2sgsrsEZf"), style: { fontSize: '12px', lineHeight: '1.5', margin: '8px 0' } });
    const preparePlain = button(__rmT("cvykkaQA1CUutgcWZoC0oHPMs9.hGT"), () => {
        try {
            const book = readPlainTextWorldBook(plainInput.value, { name: plainTitle.value });
            showNormalizedBook(book);
            startClassificationReview();
            plainInput.value = '';
            plainInput.removeAttribute('aria-invalid');
            plainStatus.textContent = __rmT("uLZD_RbZVlJWrBpNlAeDH17UjX0pjPVb3vQPaR5LcGh2ZLLiwG3cPjLv_W4klhXPWUE");
        }
        catch (error) {
            plainInput.setAttribute('aria-invalid', 'true');
            plainStatus.textContent = String(error?.message || __rmT("8khV7vyTQTjwI2OG4DD"));
            plainInput.focus();
        }
    }, { minHeight: '44px', width: '100%' });
    plainPane.append(el('h3', { text: __rmT("q3CJaaEIToQ5YxO6_4hr0ruGFjtPOfntib_"), style: { fontSize: '16px', margin: '0 0 8px' } }), el('div', { text: __rmT("yJkAvVMUw4uf_GFzNh2gHPN5HR6V6n1LLhfFJwzLXT4IBio.9Pe2w5razn27_mWOH7MMgZJ_4eBjql2r5g2JSpt_gSW2HYWYEjzx0tNGX58hrDMGnf24MFdwDdt6ZLa_wV62Tw.7uWuAkdfF"), style: { fontSize: '13px', lineHeight: '1.6' } }), el('label', { text: __rmT("7NireQ5ErIEJu7rStbIOFCF9"), attrs: { for: plainTitle.id }, style: { display: 'block', margin: '8px 0' } }), plainTitle, el('label', { text: __rmT("C_6ISmetFJq4A5TzfZuC9Zmo9wl"), attrs: { for: plainInput.id }, style: { display: 'block', margin: '8px 0' } }), plainInput, plainStatus, preparePlain);
    sourceWorkflow.append(hostPane, filePane, plainPane);
    scroll.append(sourceWorkflow, transferControls.panel, managePane);
    const divider = el('div', { style: { borderTop: '1px solid color-mix(in srgb,currentColor 12%,transparent)', margin: '12px 0 9px' } });
    const entrySearch = el('input', { className: 'text_pole', type: 'search', placeholder: __rmT("K22JtDous_FbMkpZrXKqjU35NDMFLZHhRZ1pYLtpn2N7PA7y"), style: { width: '100%', boxSizing: 'border-box' } });
    const fullTextLabel = el('label', { style: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '7px', fontSize: '11px', opacity: '.78' } });
    const fullText = el('input', { type: 'checkbox' });
    fullTextLabel.append(fullText, document.createTextNode(__rmT("Zuq8bJqFEVWCFY.xSWv.GHbQPNQ2jA.1ieAKDsmvxVidEf")));
    const entryMeta = el('div', { text: __rmT("ogyS.u_HP8L2twvE8g6pUT"), style: { fontSize: '11px', opacity: '.66', margin: '7px 0' } });
    const selectionActions = el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: '7px', margin: '4px 0 8px' } });
    selectionActions.append(button(__rmT("DuPjpzgs96A"), selectWholeBook, { minHeight: '44px', fontWeight: '700' }), button(__rmT("xMa55xYc1huV1jHf"), selectCurrentFilter, { minHeight: '44px' }), button(__rmT("nJLCXUsQ2Ph"), clearSelection, { minHeight: '44px' }));
    const selectionHint = el('div', { text: __rmT("ZF.TQ5_X6eBQbOLilBrlpof.t9D62aAmi.Yd.E_ZN_feIBSnjWZEiyjMsdOeGVWgy6V_Jzph.QQtI_MWInccsKU3.zhAkIHE0qvqWLnXCCeJqm1miJBIyFREYOCEZf"), style: { fontSize: '10px', opacity: '.62', lineHeight: '1.45', marginBottom: '6px' } });
    const entryList = el('div', { style: { minHeight: '120px', maxHeight: '360px', overflowY: 'auto', WebkitOverflowScrolling: 'touch' } });
    const pager = el('div', { style: { display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px' } });
    let debounceId = 0;
    entrySearch.addEventListener('input', () => { clearTimeout(debounceId); debounceId = setTimeout(() => { state.page = 0; renderEntries(); }, 150); });
    fullText.addEventListener('change', () => { state.page = 0; renderEntries(); });
    const advanceActions = el('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '7px', marginTop: '8px' } });
    advanceActions.append(button(__rmT("KW1b4Ch_2yP8rAJs"), startClassificationReview, { minHeight: '44px', fontWeight: '700' }));
    entrySection.append(divider, entrySearch, fullTextLabel, entryMeta, selectionActions, selectionHint, entryList, pager, advanceActions);
    sourceWorkflow.append(entrySection);
    const classificationPanel = el('div', { style: { display: 'none', borderTop: '1px solid color-mix(in srgb,currentColor 12%,transparent)', marginTop: '14px', paddingTop: '10px' } });
    classificationPanel.append(el('div', { text: __rmT("nFdUm40ODcp"), style: { fontWeight: '700', fontSize: '13px' } }));
    classificationPanel.append(el('div', { text: __rmT("ZwITqxxl2nb9jFiHLs4J4JYL8vQ_o1XeNUaklFRyh5A5LFsb.NmDZP0sf7RGSBoZS4BIRHhIIVTkqTM_H9_qarNQMrhJ.yxObILWq7WnA6c2g9STnace.92mqDmOLw8xfYYovUcbvVJNrcu5WQ9vb_6kXlR8PGt7ngfS5aocD1G"), style: { opacity: '.8', fontSize: '12px', lineHeight: '1.5', marginTop: '3px' } }));
    const bulkActions = el('div', { style: { display: 'grid', gap: '8px', margin: '8px 0' } });
    const applyBulk = mode => {
        state.classificationDraft = applyExternalWorldBookBulkClassification(state.classificationDraft, mode);
        state.classificationPage = 0;
        renderClassification();
        const remaining = externalWorldBookClassificationCounts(state.classificationDraft).pending;
        setStatus(`${__rmT("2G0gOYWjAvQ3bdPfbiTcmnCx")}${remaining}${__rmT("tMynJkF16RfePBjg0kp423uXlLUD_eyX00vspf")}`);
    };
    const bulkCategory = el('select', { id: 'rh_external_bulk_category', className: 'text_pole', attrs: { 'aria-label': __rmT("F64d9EhHkp6ApWKDhJJKaT") } });
    for (const value of ['format', 'theme', 'text', 'auxiliary', 'ignore'])
        bulkCategory.append(el('option', { value, text: `${__rmT("rBGxGsYHPyOyY8Mm7oVLmkty")}${CLASSIFICATION_LABELS[value]}` }));
    bulkActions.append(button(__rmT("gbnLxiT9izxwmH3xqNZLw.uJGVTP0VCCuLf"), () => applyBulk('suggested')), bulkCategory, button(__rmT("zEvyPpH142kTkct8Cn3XeRPEIyl"), () => applyBulk(bulkCategory.value)));
    const classificationMeta = el('div', { style: { fontSize: '11px', opacity: '.72', margin: '7px 0' } });
    const classificationFilter = el('select', { className: 'text_pole', style: { width: '100%', minHeight: '36px', boxSizing: 'border-box' } });
    for (const [value, label] of [['review', __rmT("jZuzsOonY2w_Zf")], ['all', __rmT("3MqCXn6D2AG")], ['theme', __rmT("_GerrIjDHM_")], ['format', __rmT("1Q3is5nrSDY")], ['text', __rmT("oo2o.TB1")], ['auxiliary', __rmT("5p7qAO1PlPp")], ['ignore', __rmT("EBNOnh")], ['pending', __rmT("oKv_9RWT")]]) {
        const option = el('option', { text: label, value });
        option.value = value;
        classificationFilter.append(option);
    }
    classificationFilter.value = 'review';
    classificationFilter.addEventListener('change', () => { state.classificationPage = 0; renderClassification(); });
    const classificationList = el('div', { style: { maxHeight: '400px', overflowY: 'auto', WebkitOverflowScrolling: 'touch', marginTop: '6px' } });
    const classificationPager = el('div', { style: { display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px' } });
    const saveButton = button(__rmT("syGzYEUJrgnScw_wEkMIUm4unsh"), saveClassificationReview, { width: '100%', minHeight: '44px', marginTop: '8px', fontWeight: '700' });
    classificationPanel.append(classificationMeta, bulkActions, classificationFilter, classificationList, classificationPager, saveButton);
    sourceWorkflow.append(classificationPanel);
    const savedLibrariesPanel = el('div', { style: { display: 'none', borderTop: '1px solid color-mix(in srgb,currentColor 12%,transparent)', marginTop: '14px', paddingTop: '10px' } });
    savedLibrariesPanel.append(el('div', { text: __rmT("2GSzU4WFYfBTL8MmkbkhxqKm"), style: { fontWeight: '700', fontSize: '13px' } }));
    savedLibrariesPanel.append(el('div', { text: __rmT("NeaNVE5Dxtp41VSlxvUOmfOdY3Cl1DgBFjicynt7GJoVzwnhnOgC6qKP_jPml6F9oAROgSbgeiuAAukBZd_mn8Ogu1Wa4Kk.T8LXl2A2r7cvxqncNa0cMVFVCb5LacJnk5q70ZKjhNGaDjCeNY75rwjODncyjRpp92QJHW831_sKFzC4e5IbXPTUnEBLtn.ClUshNzVe29MNOsx5o1BUw1X4KvHIrcLyopleggWCjE4eXyhu86_"), style: { opacity: '.8', fontSize: '12px', lineHeight: '1.5', marginTop: '3px' } }));
    const savedLibrariesList = el('div', { style: { marginTop: '5px' } });
    savedLibrariesPanel.append(savedLibrariesList);
    const savedEntriesPanel = el('section', { id: 'rh_external_saved_entry_choices', attrs: { tabindex: '-1', 'aria-label': __rmT("2lKNh9HQk9KMm98Lenbtw.YiUwA") }, style: { marginTop: '14px', paddingTop: '12px', borderTop: '1px solid color-mix(in srgb,currentColor 18%,transparent)' } });
    savedEntriesPanel.hidden = true;
    managePane.append(el('p', { text: __rmT("zlxIEQ5hR6WRIJe.EwRE0O7NZht8urfO.YNcO5jRlBiZYyanDNRkgpekPPXu6yQg5kOOJgiKAhwViwE8UzGvnzCwTU8cxf"), style: { fontSize: '13px', lineHeight: '1.6', margin: '0' } }));
    scroll.append(el('div', { text: __rmT("rSPSff1Tj6AHJ9ABsEtGF3BeFUboerYpRViYBhuUTQ6.nCUB6JDao3Ij.lVA8GQx4uTZkZL.xjnLUCbFyoz1O369KNGcxf"), style: { marginTop: '10px', opacity: '.8', fontSize: '12px', lineHeight: '1.5' } }));
    const status = el('div', { className: 'rh-external-status', text: __rmT("aWL55M_E_wpr4of1"), style: { padding: '8px 12px', borderTop: '1px solid color-mix(in srgb,currentColor 12%,transparent)', fontSize: '11px', lineHeight: '1.45', minHeight: '34px', boxSizing: 'border-box' } });
    card.append(header, scroll, status);
    overlay.append(card);
    overlay.addEventListener('click', event => { if (event.target === overlay)
        dismiss(); });
    overlay.addEventListener('cancel', event => { event.preventDefault(); event.stopPropagation(); dismiss(); });
    overlay.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            dismiss();
        }
    });
    document.body.append(overlay);
    disposeViewport = bindImportViewport(overlay);
    state = {
        importKind: importKind === 'text' ? 'text' : '',
        overlay, dismiss, status, showView, entrySection, hostBooks: [], localBooks: [], currentBook: null, transferControls, localFileSequence: 0,
        filteredEntries: [], page: 0, selectedIds: new Set(), selectionMode: EXTERNAL_WORLD_BOOK_SELECTION_MODE.WHOLE,
        classificationDraft: [], classificationPage: 0,
        bookSearch, bookList, localBookList, entrySearch, fullText, entryMeta, entryList, pager,
        classificationPanel, classificationMeta, classificationFilter, classificationList, classificationPager,
        savedLibrariesPanel, savedLibrariesList, savedLibrariesSequence: 0,
        savedEntriesPanel, savedEntryLibrary: null, savedEntrySequence: 0, savedEntryPage: 0, savedEntryQuery: '',
    };
    if (typeof overlay.showModal === 'function')
        overlay.showModal();
    else {
        const parent = document.querySelector('dialog[open]');
        (parent || document.documentElement).append(overlay);
        overlay.setAttribute('open', '');
    }
    try {
        closeButton.focus({ preventScroll: true });
    }
    catch { }
    showView(initialView);
}
let restoredListener = false;
export function mountMotherLibraryManager(host) {
    if (!host?.isConnected)
        return;
    if (!restoredListener) {
        restoredListener = true;
        globalThis.addEventListener?.('rabbitmirror:mother-library-restored', () => {
            if (pageState?.host?.isConnected && (state === pageState || !state?.overlay?.isConnected)) {
                state = pageState;
                void renderSavedLibraries();
            }
        });
    }
    if (pageState?.host === host && pageState.ready) {
        if (state?.inline === true || !state?.overlay?.isConnected) {
            state = pageState;
            void renderSavedLibraries();
        }
        return;
    }
    host.replaceChildren();
    const previous = state?.inline === true || !state?.overlay?.isConnected ? null : state;
    const status = el('div', { attrs: { role: 'status' }, style: { fontSize: '12px', lineHeight: '1.5', marginTop: '8px', overflowWrap: 'anywhere' } });
    const savedLibrariesPanel = el('div', { style: { borderTop: '1px solid color-mix(in srgb,currentColor 12%,transparent)', marginTop: '14px', paddingTop: '10px' } });
    savedLibrariesPanel.append(el('div', { text: __rmT("UnztYFiy3OmuFYQ_WoT"), style: { fontWeight: '700', fontSize: '13px' } }));
    savedLibrariesPanel.append(el('div', { text: __rmT("NeaNVE5Dxtp41VSlxvUOmfOdY3Cl1DgBFjicynt7GJoVzwnhnOgC6qKP_jPml6F9oAROgSbgeiuAAukBZd_mn8Ogu1Wa4Kk.T8LXl2A2r7cvxqncNa0cMVFVCb5LacJnk5q70ZKjhNGaDjCeNY75rwjODncyjRpp92QJHW831_sKFzC4e5IbXPTUnEBLtn.ClUshNzVe29MNOsx5o1BUw1X4KvHIrcLyopleggWCjE4eXyhu86_"), style: { opacity: '.8', fontSize: '12px', lineHeight: '1.5', marginTop: '3px' } }));
    const savedLibrariesList = el('div', { style: { marginTop: '5px' } });
    savedLibrariesPanel.append(savedLibrariesList);
    const savedEntriesPanel = el('section', { attrs: { tabindex: '-1', 'aria-label': __rmT("2lKNh9HQk9KMm98Lenbtw.YiUwA") }, style: { marginTop: '14px', paddingTop: '12px', borderTop: '1px solid color-mix(in srgb,currentColor 18%,transparent)' } });
    savedEntriesPanel.hidden = true;
    pageState = {
        inline: true,
        ready: true,
        host,
        overlay: host,
        status,
        savedLibrariesPanel,
        savedLibrariesList,
        savedLibrariesSequence: 0,
        savedEntriesPanel,
        savedEntryLibrary: null,
        savedEntrySequence: 0,
        savedEntryPage: 0,
        savedEntryQuery: '',
        dismiss() { },
    };
    state = pageState;
    host.append(createExternalRandomControls(), savedLibrariesPanel, savedEntriesPanel, status);
    void renderSavedLibraries();
    if (previous?.overlay?.isConnected)
        state = previous;
}
export function openExternalWorldBookImportWizard(options = {}) {
    createModal(options?.initialView, options?.importKind);
}
