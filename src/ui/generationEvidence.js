import { rmT as __rmT } from "../textTable.js?rmv=2.1.4";
import { armGenerationEvidence, cancelGenerationEvidenceArm, clearGenerationEvidence, exportGenerationEvidence, exportRecentGenerationEvidence, getGenerationEvidenceState, subscribeGenerationEvidence } from '../generationEvidence.js?rmv=2.1.4';
import { formatGenerationElapsed } from '../generationTiming.js?rmv=2.1.4';
let cleanup = null;
export function destroyGenerationEvidenceUi() { cleanup?.(); cleanup = null; }
export function mountGenerationEvidenceUi(root, getSettings) {
    destroyGenerationEvidenceUi();
    const get = id => root?.querySelector?.(`#${id}`);
    const start = get('rh_generation_evidence_start'), download = get('rh_generation_evidence_download');
    const copy = get('rh_generation_evidence_copy'), clear = get('rh_generation_evidence_clear');
    const status = get('rh_generation_evidence_status'), output = get('rh_generation_evidence_output');
    const recentButton = get('rh_generation_evidence_recent');
    if (![start, download, copy, clear, status, output].every(Boolean))
        return;
    let url = null, renderedId = '';
    const render = () => {
        const state = getGenerationEvidenceState();
        start.disabled = state.pinned && state.status === 'capturing';
        start.textContent = state.armed ? __rmT("WFOL67mSkGY") : __rmT("cXB1fsS2sS_cFjVy1.k");
        download.disabled = copy.disabled = !state.hasReport || state.armed;
        if (recentButton)
            recentButton.disabled = !state.recentCount;
        clear.disabled = !state.hasReport && !state.armed;
        status.textContent = state.armed ? __rmT("9o8n4GBtdOu4Lpmchu2Kq2cX1Edsjoth8243uLaigIiwRSC6IKD3JzJsVh8ZMG0.sixY3h") : state.status === 'capturing' ? `${__rmT("IkuMZqRoH5N_8TV2gPD")}${state.mesid ?? __rmT("uP8Onk")}${__rmT("FjTVL5sj")}${state.hasRequest ? __rmT("4RMWEsP8") : __rmT("YFbAF8bJbBE")}${__rmT("sWTEOWkS")}${state.hasResponse ? __rmT("4R6p.YAH") : __rmT(".mOq0ckc")}${__rmT("jzk")}` : state.hasReport ? `${state.pinned ? __rmT("k9UaAiBZAGY") : __rmT("ZNTt4c2jHPp")}${state.status === 'complete' ? __rmT("WFhbzKPzU6h") : state.status === 'incomplete' ? __rmT("Cm2mqop9riD3vo4vQTuzC0IIlUgB.nBCkwh") : __rmT("L.kiRlB4riQF5i4vQTuzC0IIlUgB.nBCkwh")}${__rmT("4b8RjaFyWmwFksBq")}${state.mesid ?? __rmT("uP8Onk")}${__rmT("ueaKn5Xyz4hz6rRSyyk")}${state.pinned ? __rmT("OvHYUY4QvhYaBr.O4b19ysK1") : ''}${__rmT("Wie5wIfMHz16nnKNVKdKtnCx")}${state.recentCount}${__rmT("qGtniqKg")}` : __rmT("WO4upGrjmSzjhmSFsbCAGeroE5hEwE59YSmk8bydHx94jQwrOgbvcVYDhGUMLN_EDrcP1RVoVUr2OPmIkhOhG_VF7arESuFHR0L4479Gm8pcP7LNTicKNXazCs5AvhAmePPH6EuB1FT");
        if (state.timing.requestToResponseMs !== null) {
            status.textContent += `${__rmT("wRLGYztyQw18er.axlk5cfty")}${formatGenerationElapsed(state.timing.requestToResponseMs)}${__rmT("jzk")}`;
        }
        if (!state.hasReport || state.armed || renderedId !== state.id) {
            output.value = '';
            output.hidden = true;
            if (url) {
                URL.revokeObjectURL(url);
                url = null;
            }
        }
        renderedId = state.id;
    };
    const onStart = () => {
        if (getGenerationEvidenceState().armed)
            cancelGenerationEvidenceArm();
        else if (getSettings?.().generationSource !== 'independent')
            status.textContent = __rmT("4Jw5AkIjis5I1xibr79BQZy.7V6qPVcksPodA2rDvviSOcdk17zG0YMZWIS8jqaksc_7vw4lq5vQUD3NUnfTrsjJ33ZFN7t10UGGVlxL79s");
        else
            armGenerationEvidence();
    };
    const reveal = text => { output.value = text; output.hidden = false; };
    const onDownload = () => {
        const text = exportGenerationEvidence();
        if (!text)
            return;
        try {
            if (url)
                URL.revokeObjectURL(url);
            url = URL.createObjectURL(new Blob([text], { type: 'application/json;charset=utf-8' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `rabbitmirror-evidence-${getGenerationEvidenceState().id}.json`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            status.textContent = __rmT("9o65k7ws1ARPf1nH.HWL.Vxld_vBu.WU5Gq9HY793kMzG.QtGmT7NSrxmhPZ656SVucY3h");
        }
        catch {
            reveal(text);
            status.textContent = __rmT("I9NjYF6FmqJJT4rYS_qq3IIOnr_N_x.2jYIFxH6a6rM.bh");
        }
    };
    const onRecent = () => {
        const text = exportRecentGenerationEvidence();
        if (!text)
            return;
        try {
            if (url)
                URL.revokeObjectURL(url);
            url = URL.createObjectURL(new Blob([text], { type: 'application/json;charset=utf-8' }));
            const link = document.createElement('a');
            link.href = url;
            link.download = `rabbitmirror-evidence-recent-${Date.now()}.json`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            status.textContent = __rmT("HCTuE_GNcXCP4.IMNxCnGY5yVs5ni14Iq9bBYfndCXwon56dpiApzq5X");
        }
        catch {
            reveal(text);
            status.textContent = __rmT("I9NjYF6FmqJJT4rYS_qq3IIOnr_N_x.2jYIFxH6a6rM.bh");
        }
    };
    const onCopy = async () => {
        const text = exportGenerationEvidence();
        if (!text)
            return;
        try {
            await navigator.clipboard.writeText(text);
            status.textContent = __rmT("SQ5Tz6TnrEXhlof1");
        }
        catch {
            reveal(text);
            output.focus();
            output.select();
            let copied = false;
            try {
                copied = document.execCommand('copy');
            }
            catch { }
            status.textContent = copied ? __rmT("SQ5Tz6TnrEXhlof1") : __rmT("bDFAerH9HPiaxYjcUqboBn58SYq5xOs2");
        }
    };
    const handlers = [[start, onStart], [download, onDownload], [copy, onCopy], [clear, clearGenerationEvidence], ...(recentButton ? [[recentButton, onRecent]] : [])];
    for (const [node, handler] of handlers)
        node.addEventListener('click', handler);
    const unsubscribe = subscribeGenerationEvidence(render);
    cleanup = () => {
        unsubscribe();
        for (const [node, handler] of handlers)
            node.removeEventListener('click', handler);
        if (url)
            URL.revokeObjectURL(url);
    };
    render();
}
