import { rmT as __rmT } from "./textTable.js?rmv=2.5.3";
import { getContext, RUNTIME_VERSION } from './independentApi/runtime.js?rmv=2.5.3';
import { chatKey, swipeId } from './independentApi/connection.js?rmv=2.5.3';
import { chatPersistedOwnerKeys, persistedOwnerForMessage } from './independentApi/persistence.js?rmv=2.5.3';
import { getRabbitMirrorRecipe } from './blacklist.js?rmv=2.5.3';
import { messageStampSeconds } from './messageStamp.js?rmv=2.5.3';
import { scanRabbitMirrorHtml } from './visualScanner.js?rmv=2.5.3';
import { readGenerationStamp } from './generationStamp.js?rmv=2.5.3';
import { PRESENTATION_FORMATS } from '../data/structured/presentationIndex.js?rmv=2.5.3';
import { analyzeStoredFace, splitStoredFaces, formatNameOf, faceHasSelfInvent, summarizeFaceHealth, buildFaceHealthText, uiName, HUE_NAMES, BRIGHTNESS_NAMES, healthDay } from './faceHealth.js?rmv=2.5.3';
const PANEL_ATTR = 'data-rabbit-mirror-face-health';
const HUE_DOTS = { red: '#d9534f', orange: '#e8914a', yellow: '#e2c044', green: '#5fae6e', cyan: '#4fb7b7', blue: '#5b84d6', purple: '#9b6cd1', pink: '#e08ab3', neutral: '#9a9a9a' };
let builtinFormatIds = null;
const isBuiltinFormatId = id => {
    builtinFormatIds ??= new Set((Array.isArray(PRESENTATION_FORMATS) ? PRESENTATION_FORMATS : []).map(item => String(item?.id || '')).filter(Boolean));
    return builtinFormatIds.has(String(id || ''));
};
function recipeFaces(record) {
    const request = record?.apiRequest && typeof record.apiRequest === 'object' ? record.apiRequest : null;
    if (Array.isArray(request?.faces) && request.faces.length)
        return request.faces;
    return request ? [request] : [];
}
function recipeFormatBuiltin(recipe) {
    if (!recipe || typeof recipe !== 'object')
        return false;
    const menu = Array.isArray(recipe.atmosphereMenu) ? recipe.atmosphereMenu : [];
    const picked = menu.length > 1 && Number.isInteger(recipe.atmosphereChoice) ? menu[recipe.atmosphereChoice] : null;
    const ids = (Array.isArray(picked?.formatIds) ? picked.formatIds : (Array.isArray(recipe.formatIds) ? recipe.formatIds : [])).filter(Boolean);
    return ids.length > 0 && ids.every(isBuiltinFormatId);
}
function probeOf(details) {
    if (!details)
        return null;
    const state = details.getAttribute('data-rabbit-mirror-auto-probe') || '';
    let probe = null;
    try {
        probe = JSON.parse(details.getAttribute('data-rabbit-mirror-generic-probe') || 'null');
    }
    catch {
        probe = null;
    }
    if (!probe || !['done', 'incomplete'].includes(state))
        return null;
    const dead = (Array.isArray(probe.dead) ? probe.dead.length : 0) + (Array.isArray(probe.feedbackOnly) ? probe.feedbackOnly.length : 0);
    if (state === 'incomplete' && !dead)
        return null;
    return { tested: true, dead };
}
function mountedFaceDetails(index, faceIndex, source) {
    const message = document.querySelector(`#chat .mes[mesid="${Number(index)}"]`);
    if (!message)
        return null;
    if (source === 'independent') {
        const faces = [...message.querySelectorAll('[data-rabbit-mirror-external-source="true"][data-rm-source="independent"] > details[data-rabbit-mirror-external-details="true"]:not(.rabbit-mirror-external-placeholder)')];
        return faces.find(details => Number(details.dataset.rabbitMirrorFaceIndex || 0) === faceIndex) || (faces.length === 1 && faceIndex === 0 ? faces[0] : null);
    }
    return message.querySelectorAll('.mes_text toto[data-rabbit-mirror="true"] > details')[faceIndex] || null;
}
function risksOf(html) {
    try {
        const wrapped = /<toto\b/i.test(html) ? html : `<toto data-rabbit-mirror="true">${html}</toto>`;
        return [...(scanRabbitMirrorHtml(wrapped)?.riskFlags || [])];
    }
    catch {
        return [];
    }
}
const squash = html => String(html || '').replace(/\s+/g, ' ').trim();
function repairedFaceIndexes(record, faces) {
    if (!record?.repairedByMaintenance)
        return new Set();
    if (faces.length <= 1)
        return new Set(faces.map(face => face.faceIndex));
    const before = new Map(splitStoredFaces(record.initialHtml || '').map(face => [face.faceIndex, squash(face.html)]));
    if (!before.size)
        return new Set(faces.map(face => face.faceIndex));
    const changed = faces.filter(face => before.get(face.faceIndex) !== squash(face.html)).map(face => face.faceIndex);
    return new Set(changed.length ? changed : faces.map(face => face.faceIndex));
}
const yieldToPage = () => new Promise(resolve => setTimeout(resolve, 0));
export async function collectChatFaces(ctx = getContext(), { limit = 0, onProgress = null } = {}) {
    const chat = Array.isArray(ctx?.chat) ? ctx.chat : [];
    const key = chatKey(ctx);
    const messageTime = (index, swipe) => messageStampSeconds(chat[index], swipe) * 1000;
    const sources = [];
    const owned = new Set();
    for (const { index, swipe } of chatPersistedOwnerKeys(ctx)) {
        owned.add(`${index}:${swipe}`);
        sources.push({ source: 'independent', index, swipe, time: messageTime(index, swipe) });
    }
    chat.forEach((message, index) => {
        if (!message || message.is_user || message.is_system)
            return;
        const swipe = swipeId(message);
        if (owned.has(`${index}:${swipe}`))
            return;
        const text = String(message.mes || '');
        if (!text.includes('<toto'))
            return;
        sources.push({ source: 'follow', index, swipe, time: messageTime(index, swipe), message });
    });
    sources.sort((a, b) => (b.time - a.time) || (b.index - a.index) || (b.swipe - a.swipe));
    const picked = [];
    let read = 0;
    for (const item of sources) {
        if (limit > 0 && picked.length >= limit)
            break;
        read += 1;
        if (read % 6 === 0)
            await yieldToPage();
        if (item.source === 'independent') {
            const record = persistedOwnerForMessage(ctx, item.index, { swipe_id: item.swipe });
            if (!record || record.deleted || !record.html)
                continue;
            const faces = splitStoredFaces(record.html);
            const recipes = recipeFaces(record);
            const repaired = repairedFaceIndexes(record, faces);
            const current = Number(swipeId(chat[item.index])) === Number(item.swipe);
            for (const face of [...faces].reverse()) {
                const stamp = readGenerationStamp(face.html);
                const recipe = recipes.length > 1 ? recipes[face.faceIndex] || null : recipes[0] || null;
                picked.push({
                    source: 'independent', index: item.index, swipe: item.swipe, faceIndex: face.faceIndex, faceCount: faces.length,
                    ts: (item.time || stamp?.t || Number(record.ts || 0)) + face.faceIndex, version: stamp?.v || String(record.runtime || '') || __rmT("uP8Onk"), versionApprox: !stamp,
                    html: face.html, recipe, repaired: repaired.has(face.faceIndex), current,
                    timing: stamp?.ms ? { totalMs: stamp.ms, thinkMs: stamp.th || 0, batch: `${stamp.v}:${stamp.t}` } : null,
                });
            }
        }
        else {
            const text = String(item.message.mes || '');
            const blocks = [...text.matchAll(/<toto\b[^>]*>[\s\S]*?<\/toto\s*>/gi)].map(match => match[0]).filter(html => /<details\b/i.test(html));
            [...blocks.entries()].reverse().forEach(([faceIndex, html]) => picked.push({
                source: 'follow', index: item.index, swipe: item.swipe, faceIndex, faceCount: blocks.length, ts: item.time + faceIndex, version: __rmT("UCu7V0jvkgs"), versionApprox: false, html,
                recipe: getRabbitMirrorRecipe({ chatKey: key, messageIndex: item.index, swipeId: item.swipe, message: item.message, faceIndex: blocks.length > 1 ? faceIndex : null, includeExternalOnly: true }),
                repaired: false, timing: null, current: true,
            }));
        }
    }
    const more = read < sources.length;
    const chosen = (limit > 0 ? picked.slice(0, limit) : picked).reverse();
    const faces = [];
    for (const [position, item] of chosen.entries()) {
        const details = item.current ? mountedFaceDetails(item.index, item.faceIndex, item.source) : null;
        faces.push({
            source: item.source, index: item.index, swipe: item.swipe, faceIndex: item.faceIndex, faceCount: item.faceCount,
            ts: item.ts, version: item.version, versionApprox: item.versionApprox,
            format: formatNameOf(item.recipe, item.html), formatBuiltin: !faceHasSelfInvent(item.html) && recipeFormatBuiltin(item.recipe), analysis: analyzeStoredFace(item.html),
            repaired: item.repaired, timing: item.timing, probe: probeOf(details), risks: risksOf(item.html),
        });
        if (position % 4 === 3) {
            onProgress?.(position + 1, chosen.length);
            await yieldToPage();
        }
    }
    return { faces, more, records: sources.length };
}
function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className)
        node.className = className;
    if (text !== undefined)
        node.textContent = text;
    return node;
}
function bars(items, { nameOf = item => item.key, dotOf = null, limit = 8 } = {}) {
    const list = element('div', 'rm-health-bars');
    const max = Math.max(1, ...items.map(item => item.count));
    for (const item of items.slice(0, limit)) {
        const row = element('div', 'rm-health-bar');
        const name = element('span', 'rm-health-bar-name');
        const color = dotOf?.(item);
        if (color) {
            const dot = element('i', 'rm-health-dot');
            dot.style.background = color;
            name.append(dot);
        }
        name.append(document.createTextNode(nameOf(item) || __rmT("w8H089otNHxxtf")));
        const track = element('span', 'rm-health-bar-track');
        const fill = element('span', 'rm-health-bar-fill');
        fill.style.width = `${Math.max(4, Math.round(item.count / max * 100))}%`;
        track.append(fill);
        row.append(name, track, element('span', 'rm-health-bar-count', String(item.count)));
        list.append(row);
    }
    if (items.length > limit)
        list.append(element('div', 'rm-health-more', `${__rmT("Qh56.cc6")}${items.length - limit}${__rmT("2RCQfh")}`));
    if (!items.length)
        list.append(element('div', 'rm-health-more', __rmT("Qfp2lA_HHxq4tymD")));
    return list;
}
function section(title, note) {
    const box = element('section', 'rm-health-section');
    const head = element('h4', 'rm-health-section-title', title);
    if (note)
        head.append(element('span', 'rm-health-section-note', note));
    box.append(head);
    return box;
}
function stat(label, value) {
    const node = element('div', 'rm-health-stat');
    node.append(element('span', 'rm-health-stat-value', value), element('span', 'rm-health-stat-label', label));
    return node;
}
function renderSummary(body, summary) {
    body.replaceChildren();
    if (!summary.total) {
        body.append(element('p', 'rm-health-empty', __rmT("_NNntfljNF4y5ldsynYTVmD747lcSXPiEtNtEumBOeiIWFejNqxO_GELzBG")));
        return;
    }
    const top = element('div', 'rm-health-top');
    top.append(element('div', 'rm-health-range', `${summary.more ? `${__rmT("mif0jcc6")}${summary.total}${__rmT("uNe_ToZ2n5u489NRmkQ1YdIn3C_8.qtuuLf")}` : `${__rmT("wiQ8YGUea5Isq8NPgPD")}${summary.total}${__rmT("2RddPk")}`} · ${healthDay(summary.from)}${__rmT("qGyEgcc6")}${healthDay(summary.to)}`));
    const strip = element('div', 'rm-health-strip');
    strip.setAttribute('aria-hidden', 'true');
    for (const cell of summary.strip) {
        const chip = element('i', 'rm-health-chip');
        if (cell.color)
            chip.style.background = cell.color;
        if (cell.accent)
            chip.style.borderBottomColor = cell.accent;
        strip.append(chip);
    }
    top.append(strip);
    const stats = element('div', 'rm-health-stats');
    stats.append(stat(__rmT("ohT_aN3qjuxqWf"), String(summary.distinctFormats)), stat(__rmT("oh52v6KLl4TNef"), String(summary.avgUis)), stat(__rmT("yHLucT1zGNp"), String(summary.avgChars)), stat(__rmT("yHLucq6E_2s"), summary.avgSeconds === null ? '—' : `${summary.avgSeconds}${__rmT("2RCLfh")}`));
    top.append(stats);
    body.append(top);
    const formats = section(__rmT("1Q3is5nrSDY"), `${__rmT("tB0CyT")}${summary.distinctFormats}${__rmT("9TjriplQrwYwGI0OuPyZbUbmrWI4a0AP")}${summary.sameFormat}${__rmT("2RWUYk")}`);
    formats.append(bars(summary.formats, { nameOf: item => item.key }));
    body.append(formats);
    const colors = section(__rmT("kYSaif"), `${__rmT("cR6.TlVbJ8Y0RO79csfHbI4Pa26CJk")}${summary.sameColor}${__rmT("2RWUYk")}`);
    colors.append(bars(summary.brightness, { nameOf: item => BRIGHTNESS_NAMES[item.key] || item.key, limit: 3 }));
    colors.append(bars(summary.hues, { nameOf: item => HUE_NAMES[item.key] || item.key, dotOf: item => HUE_DOTS[item.key] || '', limit: 9 }));
    body.append(colors);
    const uis = section(__rmT("qH3ENf"), `${__rmT("xzEyA.Owje7BTh")}${summary.avgUis}${__rmT("uNj5gsxCD2UQPpcOq4xRwHKMprKFh1tunQE")}${summary.noUi}${__rmT("tMyfaJEBRNv7Qduzbtyt_2cFape4bJoLh4roDf")}${summary.sameUis}${__rmT("2RWUYk")}`);
    uis.append(bars(summary.uis, { nameOf: item => item.name || uiName(item.key) || item.key, limit: 10 }));
    body.append(uis);
    const quality = section(__rmT("RQgn5SwkPMs"));
    const facts = element('ul', 'rm-health-facts');
    const fact = text => facts.append(element('li', '', text));
    fact(`${__rmT("aBIYpIGbX3U76lBq")}${summary.repaired}${__rmT("qGyf7qKg")}`);
    fact(summary.tested
        ? `${__rmT("eSOvVexHXpxBTh")}${summary.tested}${__rmT("4b6BvpJxB_o6g_Bq")}${summary.deadFaces}${__rmT("tMyfaDQmSssqN4KBz0kmBeiBbaSYLJsWxhSoDf")}${summary.deadControls}${__rmT("N_wA5UKdOoG")}` : __rmT("FhMi6s8loyHisNHdMsESCh8s7104uiYf06kTWVEKCRX.IuKIdP6NtaDmH5AxsYNsYpWKWFypwBIHpmWY2iJr8T4SDcg9xgQar2w9eCw9"));
    fact(`${__rmT("OHwXmLqEHKG")}${summary.pixelArt}${__rmT("4JhAxm6ifdL8tN3O9lFv_FgBa8nCJk")}${summary.avgTextChars}${__rmT("qGtBWWKg")}`);
    if (summary.timed)
        fact(`${__rmT("WjYspLB68blZV_Bq")}${summary.timed}${__rmT("fiXHijtjN2ZI0sy1TNbdHT")}${summary.avgSeconds}${__rmT("2RCLfh")}${summary.avgThinkSeconds !== null ? `${__rmT("Df1l4dlkCmrgksBq")}${summary.avgThinkSeconds}${__rmT("2RCLfh")}` : ''}${__rmT("jzk")}`);
    else
        fact(__rmT("zBI_ai_AMxvpVX1fnCiZmbyoqd4ZM9s2NakhwogP5jxeZf.vq8_"));
    quality.append(facts);
    if (summary.risks.length) {
        quality.append(element('div', 'rm-health-subtitle', __rmT("5RcaJV.6p4aFaBFLI0bkj7zRAqvB7sJmlvXqqh")));
        quality.append(bars(summary.risks, { nameOf: item => item.name, limit: 8 }));
    }
    body.append(quality);
    const versions = section(__rmT("fJSLsWPXY6p"), __rmT("gxKXoAUBfhvokTMEItT"));
    const scroller = element('div', 'rm-health-table-wrap');
    const table = element('table', 'rm-health-table');
    const head = element('tr');
    for (const name of [__rmT("IJwGjk"), __rmT("gCMAjh"), __rmT("yHLucT1zGNp"), __rmT("a8eaAWduFYA"), __rmT("jXKhW.YH"), __rmT("zwA_W6PA"), __rmT("OSTsKnhp3JMmnf"), __rmT("dPeNF82MVYE"), __rmT("yHLucq6E_2s")])
        head.append(element('th', '', name));
    const thead = element('thead');
    thead.append(head);
    const tbody = element('tbody');
    for (const row of summary.versions) {
        const tr = element('tr');
        for (const value of [`${row.version}${row.approx ? ' ≈' : ''}`, row.faces, row.avgChars, row.avgUis, row.noUi, row.repaired, `${row.deadFaces}/${row.tested}`, row.risky, row.avgSeconds === null ? '—' : `${row.avgSeconds}${__rmT("2RCLfh")}`])
            tr.append(element('td', '', String(value)));
        tbody.append(tr);
    }
    table.append(thead, tbody);
    scroller.append(table);
    versions.append(scroller);
    if (summary.approxVersions)
        versions.append(element('p', 'rm-health-note', __rmT("tKHMu52cTXek053mNcrAcNBe7ZF4irNGRjqnsUUUA0jj_4fFNMhEjpsPFSgiJuk2jupAmcOtwsZpBg1Q35541ldfZtcrI_N2_yBQGXEOoldkg1_hUgIoNOqVej9HjPZdjc3JFp8I7iTIo0gOMEpmW5c1ASi3iq.J5uybrqqcFs_u8W52zKaiBQGk253yQnCvtLKgfQFD")));
    body.append(versions);
}
export function closeFaceHealthReport() {
    document.querySelectorAll(`[${PANEL_ATTR}]`).forEach(node => {
        try {
            if (node.open)
                node.close();
        }
        catch { }
        node.remove();
    });
}
function download(text) {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = __rmT("qc72d0X_hte_6v4mop1suI.GsIZKUrCP");
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
}
export async function openFaceHealthReport({ limit = 30, ctx = getContext() } = {}) {
    closeFaceHealthReport();
    const overlay = element('dialog', 'rabbit-mirror-health-overlay');
    overlay.setAttribute(PANEL_ATTR, 'true');
    const dialog = element('section', 'rabbit-mirror-health-dialog');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-label', __rmT("guUPAJ8b3f1Vgzub"));
    const header = element('header', 'rabbit-mirror-health-header');
    header.append(element('strong', '', __rmT("guUPAJ8b3f1Vgzub")));
    const close = element('button', 'rabbit-mirror-health-close', '×');
    close.type = 'button';
    close.setAttribute('aria-label', __rmT("t8hHPh"));
    header.append(close);
    const controls = element('div', 'rabbit-mirror-health-controls');
    const select = element('select', 'text_pole rabbit-mirror-health-limit');
    select.setAttribute('aria-label', __rmT("wkQQ8ENgqFDNef"));
    for (const [value, label] of [['10', __rmT("uT94CXteTaCC0C862zY")], ['30', __rmT("uT94CXteTLCC0C862zY")], ['60', __rmT("uT94CXtexrCC0C862zY")], ['0', __rmT("K1rfpfnytEmXlhMW")]]) {
        const option = element('option', '', label);
        option.value = value;
        select.append(option);
    }
    select.value = String(limit);
    if (select.value !== String(limit))
        select.value = '30';
    const exportButton = element('button', 'menu_button rabbit-mirror-health-export', __rmT("ANek4OAIcm85kNx0"));
    exportButton.type = 'button';
    controls.append(select, exportButton);
    const body = element('div', 'rabbit-mirror-health-body');
    const status = element('p', 'rm-health-empty', __rmT("nHLZzQpT.OaTfskj"));
    status.setAttribute('role', 'status');
    body.append(status);
    dialog.append(header, controls, body);
    overlay.append(dialog);
    document.body.append(overlay);
    dialog.setAttribute('tabindex', '-1');
    try {
        if (typeof overlay.showModal === 'function' && !overlay.open)
            overlay.showModal();
        else
            overlay.setAttribute('open', '');
    }
    catch (error) {
        const settings = document.getElementById('rabbit_mirror_theater_settings');
        if (settings?.open)
            settings.append(overlay);
        overlay.setAttribute('open', '');
        console.warn(__rmT("0ntRcB.fj8nRJx729d5YYO5uuIJ1Sxz9LaHIHc3rcaEAZMSauB8TJ6CfX0JUxi01knv2yRCHAIU0Jf"), error);
    }
    try {
        dialog.focus({ preventScroll: true });
    }
    catch { }
    let summary = null;
    let run = 0;
    const load = async () => {
        const mine = ++run;
        exportButton.disabled = true;
        body.replaceChildren(status);
        status.textContent = __rmT("nHLZzQpT.OaTfskj");
        try {
            const wanted = Number(select.value) || 0;
            const collected = await collectChatFaces(ctx, { limit: wanted, onProgress: (done, all) => { if (mine === run)
                    status.textContent = `${__rmT("nHLZzQpT.OaTfskj")}${done}/${all}`; } });
            if (mine !== run || !overlay.isConnected)
                return;
            summary = summarizeFaceHealth(collected.faces, { limit: wanted });
            summary.more = summary.more || collected.more;
            renderSummary(body, summary);
            exportButton.disabled = !summary.total;
        }
        catch (error) {
            if (mine !== run)
                return;
            body.replaceChildren(element('p', 'rm-health-empty', `${__rmT("0QQUDomV6_b5It5D")}${String(error?.message || error || '')}`));
        }
    };
    select.addEventListener('change', () => { void load(); });
    exportButton.addEventListener('click', () => {
        if (!summary?.total)
            return;
        try {
            download(buildFaceHealthText(summary, { runtimeVersion: RUNTIME_VERSION }));
            globalThis.toastr?.info?.(__rmT("uLZp_pt.dydR53M9IJ2VCnem6WJ.nGcldvRQAbqnoMQt6jlbQ2NE_87c.uk2Iv8OWUE"));
        }
        catch (error) {
            globalThis.toastr?.error?.(`${__rmT("5F9bEsnkWvZ12HHA6osQcfty")}${String(error?.message || error || '')}`);
        }
    });
    const finish = () => {
        run += 1;
        try {
            if (overlay.open)
                overlay.close();
        }
        catch { }
        overlay.remove();
    };
    overlay.addEventListener('cancel', event => { event.preventDefault(); finish(); });
    close.addEventListener('click', event => { event.preventDefault(); finish(); });
    overlay.addEventListener('click', event => { if (event.target === overlay)
        finish(); });
    await load();
    return overlay;
}
