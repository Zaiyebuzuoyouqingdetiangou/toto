import { rmT as __rmT } from "../textTable.js?rmv=1.99.19";
import { getSettings } from '../settings.js?rmv=1.99.19';
import { getLastRabbitMirrorTokenRecordForSource, TOKEN_METER_EVENT } from '../tokenMeter.js?rmv=1.99.19';
import { API_REQUEST_DIAGNOSTIC_EVENT, getLastIndependentApiRequestDiagnostic } from '../independentApi.js?rmv=1.99.19';
import { escapeHtml } from './runtime.js?rmv=1.99.19';
import { formatGenerationElapsed } from '../generationTiming.js?rmv=1.99.19';
function independentApiProfileLabel(diagnostic) {
    if (!diagnostic?.profile)
        return __rmT("vMAXFoBZAGY");
    const numericStatus = Number(diagnostic.status || 0);
    const failures = { 'empty-stream': __rmT("OtCmOyCU"), 'empty-content': __rmT("W7J3zEUZjJ0mHT"), 'unparsed-stream': __rmT("P6E_0p2VdUs3VA9DFu.ITh"),
        'error-payload': __rmT("Q6zzluPIv_ztKhds"), 'host-api-error': __rmT("CmR.10roUAftBSbGbgOEJlrrOYBPGT"), 'incomplete-mirror': __rmT("HxoDA7HJEFhlHT"), 'empty-response': __rmT("7hbuZx3Ng4KiKy.9.XC"), 'model-refusal': __rmT("NJVec8n6AMp"),
        'truncated-output': __rmT("Qt95cgvlVN1eHT"), 'empty-mirror-body': __rmT("tux6zvAUCtyEguxR"), 'post-sanitize-empty': __rmT("H5xpnsaICfJnMc7c3lh"),
        'gateway-timeout': __rmT("rgZ.A3lY_2s"), 'parameter-error': __rmT("CyBf_krrhhvmIPxuAsT"), 'authentication': __rmT("Hgf.7WPkyP13FO.7eQD2af"), 'local-preflight': __rmT("E6vQfS1Ti2FGVF9XWrkIJk") };
    const failure = failures[diagnostic.semanticFailure];
    const status = diagnostic.ok ? __rmT("jg.2Nf") : failure ? `${failure}${numericStatus > 0 ? `${__rmT("Qf1vjxHyfF2rBsBq")}${numericStatus}${__rmT("eXs")}` : ''}`
        : numericStatus > 0 ? `${__rmT("Y6N.jAvSl32u_ynucw4dHT")}${numericStatus}` : diagnostic.transportCause === 'connection-interrupted' ? __rmT("dv92R_p9yKxOYsu985Mw0XewKCf_OdtxuLf") : __rmT("IEKhR3e4N7QWB0gGogOcJlrrYB3f3h");
    const temp = diagnostic.temperatureSent ? `${__rmT("cXcY0Uc6")}${Number(diagnostic.configuredTemperature ?? 0.8)}` : __rmT("CeeMzqmqDBf");
    const stream = diagnostic.streamSent ? __rmT("42nguk") : __rmT("GIZ5wjDC");
    return `${status}${__rmT("kis")}${temp}${__rmT("kis")}${stream}`;
}
function shortDiagnosticSelectionLabels(labels, ids, fallback) {
    if (!Array.isArray(labels) || !labels.length)
        return fallback;
    return labels.slice(0, 12).map((value, index) => {
        let title = typeof value === 'string' ? value.slice(0, 4096).trim() : '';
        const id = typeof ids?.[index] === 'string' ? ids[index].slice(0, 2048) : '';
        if (id && (title === id || title.startsWith(`${id} `)))
            title = title.slice(id.length).trim();
        title = title.replace(/^ext:\S+(?:\s+|$)/, '').replace(/^(?:[A-Z]|\d+)(?:\.\d+)+(?:\s+|$)/, '').trim();
        if (!title)
            return __rmT("iSrFm4c00Ah.Wf");
        const chars = Array.from(title.replace(/\s+/g, ' '));
        return chars.length > 64 ? `${chars.slice(0, 64).join('')}…` : chars.join('');
    }).join(__rmT("eos"));
}
const HUE_LABELS = { red: __rmT("mr8"), orange: __rmT("IqG"), yellow: __rmT("dG8"), green: __rmT("GL8"), cyan: __rmT("4D_"), blue: __rmT("hFf"), purple: __rmT("3LA"), pink: __rmT("caT") };
function renderDiagnosticSelection(diagnostic) {
    const faces = Array.isArray(diagnostic?.faces) ? diagnostic.faces.slice(0, 5) : [];
    const requested = Number(diagnostic?.faceCount);
    const count = Math.min(5, Math.max(faces.length, Number.isInteger(requested) && requested > 0 ? requested : 1));
    const hasLabels = Array.isArray(diagnostic?.themeLabels) || Array.isArray(diagnostic?.formatLabels);
    if (!faces.length && !hasLabels && count === 1)
        return '';
    const rows = Array.from({ length: count }, (_, index) => {
        const face = faces[index] || (index === 0 && !faces.length ? diagnostic : null);
        const themes = shortDiagnosticSelectionLabels(face?.themeLabels, face?.themeIds, face ? __rmT("_0ENaUHLAC06dh") : __rmT("iSrFm4c00Ah.Wf"));
        const formats = shortDiagnosticSelectionLabels(face?.formatLabels, face?.formatIds, __rmT("iSrFm4c00Ah.Wf"));
        const hue = Array.isArray(diagnostic?.hueFamilies) ? String(diagnostic.hueFamilies[index] || '') : '';
        const hueText = hue ? `${__rmT("M8HvvaLrsJuStf")}${escapeHtml(HUE_LABELS[hue] || hue)}` : '';
        return `<div data-rm-diagnostic-face="${index + 1}${__rmT("AF3x5_rM1iaZ7kEVTeWi6N8nhosfkRXxp3bBFJ3yjsGa1pDfsTvCBtY4BjX4EI3SgJX5gxyAJAD_ab6TY7ylN6GWCWNlAhVJIl1J3mNibUeousL92_mK76sQqqfPPVx5RGRhkECc350xUSjoq87iJp0EyKAFXZk5rmFtybd10FC4vVVb")}${index + 1}${__rmT("wHgpn.jWjsS6SpOhcUYHjB5uuLk")}${escapeHtml(themes)}${__rmT("VnZgqy29WZY")}${escapeHtml(formats)}${hueText}</div>`;
    }).join('');
    return `${__rmT("DMyfnmCBwJvRQwTAXLlLjoXsTw7oVG0BcedkDf")}${rows}`;
}
function renderIndependentApiDiagnostic(diagnostic = getLastIndependentApiRequestDiagnostic()) {
    const target = $('#rh_independent_api_diagnostic');
    if (!target.length)
        return;
    const text = independentApiProfileLabel(diagnostic);
    const attempts = '';
    const requestedModel = String(diagnostic?.model || '').trim();
    const model = requestedModel ? `${__rmT("c3JJfunXD2OiwQRPQRm5O4iJGdBSldOOy7tD51mpV6NNPxFy")}${escapeHtml(requestedModel)}` : '';
    const selection = renderDiagnosticSelection(diagnostic);
    const elapsed = diagnostic ? `<br><b>${diagnostic.requestTimingEnd === 'failure' ? __rmT("Y6N.jAySP8YV1bagCjkTTh") : __rmT("eP6y8Cpu_2s")}${__rmT("PBHcOnhpj_RrTh")}${formatGenerationElapsed(diagnostic.requestElapsedMs)}${typeof diagnostic.requestElapsedMs === 'number' ? `${__rmT("QfVRckTSxEeElOLa")}${diagnostic.requestTimingEnd === 'failure' ? __rmT("OSxEz4hpMu4TPT") : __rmT("UFqnaBjWagA")}${__rmT("Cdq8niFvMQs6KGD46SV1GzhP3dk")}` : ''}` : '';
    const worldInfo = diagnostic?.globalWorldInfoEnabled
        ? `${__rmT("aBi02M2Jqgi4ecGpx9inQzGzKF1MYw21ElNi0lR1")}${diagnostic.globalWorldInfoCaptured ? `${__rmT("iF28q0tDHKG")}${formatMeterNumber(diagnostic.globalWorldInfoEntries)}${__rmT("Yos")}${formatMeterNumber(diagnostic.globalWorldInfoTotalEntries || diagnostic.globalWorldInfoEntries)}${__rmT("qGyn.qrp")}${formatMeterNumber(diagnostic.globalWorldInfoChars)}${__rmT("qGyUScEk")}${diagnostic.globalWorldInfoTruncated ? __rmT("UdcYOlu606Hbs968bvFTn22E3dk") : ''}` : __rmT("ZTGsCvyT1nGsXTK_8lf")}` : __rmT("Nbd8keySX0v6098YwDy_.e4PqNDRc7pQofMSGTLYcL.zaT");
    const cast = diagnostic?.imageCastEnabled
        ? `${__rmT("c3JJfunXD2OiwQRPQRs2oGoT1Aw7rTarJv1D51mpV6NNPxFy")}${diagnostic.imageCastEntries ? `${__rmT("aRcAWUc6")}${formatMeterNumber(diagnostic.imageCastEntries)}${__rmT("qGyn.qLp")}${escapeHtml((diagnostic.imageCastTitles || []).join(__rmT("jvk")) || __rmT("1i2ciyj0"))}${__rmT("eXs")}` : `${__rmT("MJb8qCJFCmG")}${escapeHtml(diagnostic.imageCastReason || __rmT("cHhXcW5XB9A"))}`}` : '';
    target.html(`${__rmT(".TeHTeAQPugogx__WAXE5TUG9xZWUzlP")}${escapeHtml(text)}${escapeHtml(attempts)}${elapsed}${model}${selection}${worldInfo}${cast}`);
}
function formatMeterNumber(value) {
    return Math.max(0, Number(value) || 0).toLocaleString('zh-CN');
}
function tokenMeterSourceLabel(generationSource) {
    return String(generationSource || '').toLowerCase() === 'independent' ? __rmT("TBxxQLFyeH2rBMsq") : __rmT("wLD17kmQmPy._t1ucwztHT");
}
function tokenMeterRecordAgeLabel(record) {
    const recordedAt = Number(record?.recordedAt);
    const age = recordedAt > 0 ? Date.now() - recordedAt : Number.POSITIVE_INFINITY;
    return age >= 0 && age <= 30 * 60 * 1000 ? __rmT("ZNTt4XBZAGY") : __rmT("5FhEAXBZAGY");
}
function tokenMeterNoInjectionLabel(reason) {
    const labels = {
        disabled: __rmT("V_zjqLEl42hDJU0AmyZNpQsoltU06FkZzXO1FueJQYp"),
        'quiet-skipped': __rmT("eu8g0Hbfxev3_ou5Nimw9O7O8Wwt.4Qs7dTvmEhuB2LdEf"),
        'impersonate-skipped': __rmT("DuQ6lQsDvWvEMyLqUvbuPl.OgyWjF38l2aa6wPmPRCBLnFdScph"),
        'directive-skipped': __rmT("M2YF5Uzl1.ODfKElsPROjWpu0jztzAFGehHnihrGv5EmDzdx"),
        'independent-api': __rmT("yGUyzhjB0tqu9L6rjeu01QgXDdUAcwwE8bCfiGlX2phQ8LdFbpICVz5Ec4tHzVjHEx.Am90Bx.Gm4srU"),
        'mode-change': __rmT("ntvm1LRAFmc4oF3jaIN6jLNgcc7U7lL6E0bpLT"),
        empty: __rmT("iqY7FZMnloMDv4b9O1h.sl2sB5zLYtN6Ii2DfEKEhNdUnSTg1r26Z54e_8TO9k"),
        cleared: __rmT("R4DbnSiFU50dAa.e3lh"),
        manual: __rmT("58GZSBWyEz1YjvcRwXxHqrRg"),
    };
    return labels[String(reason || '')] || __rmT("BGOuj3PfogNj0F9X2Hv0Kh");
}
function renderTokenMeter(record = getLastRabbitMirrorTokenRecordForSource(getSettings().generationSource)) {
    renderTokenMeterSummary(record);
    renderTokenMeterSections(record);
}
function renderTokenMeterSections(record) {
    const root = $('#rh_token_meter');
    if (!root.length)
        return;
    let box = root.find('[data-rh-token-meter-sections]');
    if (!box.length) {
        box = $('<div class="rabbit-mirror-token-meter-note" data-rh-token-meter-sections style="margin-top:6px;white-space:pre-line;line-height:1.55;"></div>');
        root.append(box);
    }
    const lines = [];
    const sections = Array.isArray(record?.sections) ? record.sections.filter(item => Number(item?.chars) > 0) : [];
    if (sections.length) {
        lines.push(__rmT("nlB8IgE5WCBXKsHaaN77CqR.EWtk0wFf3df"));
        for (const item of [...sections].sort((a, b) => b.chars - a.chars))
            lines.push(`· ${item.label}${__rmT("jSk")}${formatMeterNumber(item.chars)}`);
    }
    const parts = record?.contextParts || {};
    const contextLines = [
        parts.transcript ? `${__rmT("mbehq17wiJuBTh")}${formatMeterNumber(parts.transcript)}` : '',
        parts.reference ? `${__rmT("UvxlcDAqdt3QPgTREVw.q7GA6ZrmAHNwnQE")}${formatMeterNumber(parts.reference)}` : '',
        parts.worldInfo ? `${__rmT("UnzZ_mS8Fz3BXTOcgPD")}${formatMeterNumber(parts.worldInfo)}` : '',
        parts.characterWorldBook ? `${__rmT(".ofhWwS2Fz3BXTOcgPD")}${formatMeterNumber(parts.characterWorldBook)}` : '',
    ].filter(Boolean);
    if (contextLines.length)
        lines.push(`${__rmT("nXEcrrEIWCuC8ERPhfPtO0LO790DhtFf3df")}${contextLines.join(' · ')}`);
    box.text(lines.join('\n'));
    box.toggle(lines.length > 0);
}
function renderTokenMeterSummary(record) {
    const root = $('#rh_token_meter');
    if (!root.length)
        return;
    const main = root.find('[data-rh-token-meter-main]');
    const exact = root.find('[data-rh-token-meter-exact]');
    const detail = root.find('[data-rh-token-meter-detail]');
    const generationSource = getSettings().generationSource;
    const sourceLabel = tokenMeterSourceLabel(generationSource);
    if (!record) {
        main.text(`${sourceLabel}${__rmT("wRjGaArS5v5rucuhhlj_yYxi")}`);
        exact.text(__rmT("niEXrlAtS_xF5SH_AhQGeS.B3pfU.pbJ29E"));
        detail.text(__rmT("aURPFLkT_rYhQAhlpfw84o2TQ3ckgIymGQ0SHpEOOQfQzsw77CDWtYJGAKppQKJtha5xX2CjqLKQRICuwVTtGr.JVmHb84YO"));
        return;
    }
    const ageLabel = tokenMeterRecordAgeLabel(record);
    if (record.status === 'independent') {
        const tokens = record.tokens || {};
        const chars = record.chars || {};
        main.text(`${sourceLabel} · ${ageLabel}${__rmT("9TLsTYlQLWFR5JqVrN9wBhYWpaK0M0AP")}${formatMeterNumber(tokens.estimated)}${__rmT("4JhzYDG7DOQJBh0GQp36ws_gvB4RcT")}`);
        const layerText = chars.independentContextLayers
            ? `${__rmT("4b8RjaFyVmV16lBq")}${formatMeterNumber(chars.independentContextLayers)}/${formatMeterNumber(chars.independentContextMaxLayers || chars.independentContextLayers)}${__rmT("2RdruT")}` : '';
        const filteredText = [
            chars.filteredRabbitMirrorChars ? `${__rmT("9McD4IGb7sqJKEBq")}${formatMeterNumber(chars.filteredRabbitMirrorChars)}${__rmT("qGyUScEk")}` : '',
            chars.filteredContextTagChars ? `${__rmT("EI2nqOIEf2OBTh")}${formatMeterNumber(chars.filteredContextTagChars)}${__rmT("qGyUScEk")}` : '',
        ].filter(Boolean).join(' · ');
        const totalRequestChars = Number(chars.totalRequest) || (Number(chars.total) || 0) + (Number(chars.independentContext) || 0);
        exact.text(`${__rmT("GX7gnwyNu7Dj4uH.gPD")}${formatMeterNumber(tokens.min)}–${formatMeterNumber(tokens.max)}${__rmT("RN_ZYPQXuKOqc7vn4q_Dv.LR6le_cpWLfy8s8RUY4g8")}${formatMeterNumber(totalRequestChars)}${__rmT("7aAV7XLiXH2fIq3HgPD")}${formatMeterNumber(chars.total)}${__rmT("PDH4vxxJiJuBTh")}${formatMeterNumber(chars.independentContext)}${__rmT("eXs")}${layerText}${filteredText ? `${__rmT("7aqU1ytek4nnkBHegPD")}${filteredText}` : ''}${__rmT("jzk")}`);
        const parts = [
            `${__rmT("EFvoXt4WHKG")}${formatMeterNumber(tokens.baseEstimated)}`,
            chars.feedback ? `${__rmT("OQOLrb4WHKG")}${formatMeterNumber(tokens.feedbackEstimated)}` : __rmT("OQOLrjNu.KG"),
            chars.executionLock ? `${__rmT("GgcfOrmE2tK93sI7ZRWJ54Cx")}${formatMeterNumber(tokens.executionLockEstimated)}${__rmT("4JhzYDG7DOQJBh0GQp36wa4mYe0RcT")}` : '',
            `${__rmT("3ZuJIuQeOHOBTh")}${formatMeterNumber(chars.motherLibrary)}${__rmT("qGyUScEk")}`,
            chars.sharedMemory ? `${__rmT("NZytaUyQH9uBTh")}${formatMeterNumber(chars.sharedMemory)}${__rmT("qGyUScEk")}` : '',
            chars.editableVisual ? `${__rmT("xqshIk_kA7KbMEBq")}${formatMeterNumber(chars.editableVisual)}${__rmT("qGyUScEk")}` : '',
        ].filter(Boolean);
        detail.text(parts.join(__rmT("7os")));
        return;
    }
    if (record.status !== 'injected') {
        main.text(`${sourceLabel} · ${ageLabel}${__rmT("fismACvSOVC.DWKDHw4aHT")}`);
        exact.text(tokenMeterNoInjectionLabel(record.reason));
        detail.text(__rmT("Ldx8cE8QG.baGSF7K1UbdANO75O52MV62osr219Q6uMDZS0fPdrXzS1JhK2g9iiPaY7H6ddOzW5y6ULuI3jpFQ1AWAT"));
        return;
    }
    const tokens = record.tokens || {};
    const chars = record.chars || {};
    main.text(`${sourceLabel} · ${ageLabel}${__rmT("3IVm8HajIRaRr8oOCsW5lSW8FCR0MZy9iby3IWZG5NeFJw0WZfoPSU6y")}${formatMeterNumber(tokens.estimated)}${__rmT("4JhzYDG7DOQJBh0GQp36ws_gvB4RcT")}`);
    exact.text(`${__rmT("O5PomOZ1vFeBTh")}${formatMeterNumber(tokens.min)}–${formatMeterNumber(tokens.max)}${__rmT("v3JsfBWX3ghqwQKPkZIY4TwdvhjeNnCgxCnvlxZb1EaDvhIy")}${formatMeterNumber(chars.total)}`);
    const parts = [
        `${__rmT("EFvoXt4WHKG")}${formatMeterNumber(tokens.baseEstimated)}`,
        chars.feedback ? `${__rmT("OQOLrb4WHKG")}${formatMeterNumber(tokens.feedbackEstimated)}` : __rmT("OQOLrjNu.KG"),
        `${__rmT("3ZuJIuQeOHOBTh")}${formatMeterNumber(chars.motherLibrary)}${__rmT("qGyUScEk")}`,
        chars.sharedMemory ? `${__rmT("NZytaUyQH9uBTh")}${formatMeterNumber(chars.sharedMemory)}${__rmT("qGyUScEk")}` : '',
        chars.editableVisual ? `${__rmT("xqshIk_kA7KbMEBq")}${formatMeterNumber(chars.editableVisual)}${__rmT("qGyUScEk")}` : '',
    ].filter(Boolean);
    detail.text(parts.join(__rmT("7os")));
}
function attachTokenMeterListener() {
    try {
        globalThis.__rabbitMirrorTokenMeterUiCleanup?.();
    }
    catch { }
    try {
        globalThis.__rabbitMirrorBlacklistUiCleanup?.();
    }
    catch { }
    globalThis.__rabbitMirrorBlacklistUiCleanup = null;
    const handler = () => renderTokenMeter();
    globalThis.addEventListener?.(TOKEN_METER_EVENT, handler);
    globalThis.__rabbitMirrorTokenMeterUiCleanup = () => globalThis.removeEventListener?.(TOKEN_METER_EVENT, handler);
}
export function attachIndependentApiDiagnosticListener() {
    try {
        globalThis.__rabbitMirrorIndependentApiDiagnosticUiCleanup?.();
    }
    catch { }
    const independentDiagnosticListener = event => { renderIndependentApiDiagnostic(event?.detail || null); };
    globalThis.addEventListener?.(API_REQUEST_DIAGNOSTIC_EVENT, independentDiagnosticListener);
    globalThis.__rabbitMirrorIndependentApiDiagnosticUiCleanup = () => globalThis.removeEventListener?.(API_REQUEST_DIAGNOSTIC_EVENT, independentDiagnosticListener);
}
export { renderTokenMeter, attachTokenMeterListener, renderIndependentApiDiagnostic };
