import { armGenerationEvidence, cancelGenerationEvidenceArm, clearGenerationEvidence,
    exportGenerationEvidence, getGenerationEvidenceState, subscribeGenerationEvidence } from '../generationEvidence.js?rmv=1.65.6';
import { formatGenerationElapsed } from '../generationTiming.js?rmv=1.65.6';

let cleanup = null;

export function destroyGenerationEvidenceUi() { cleanup?.(); cleanup = null; }

export function mountGenerationEvidenceUi(root, getSettings) {
    destroyGenerationEvidenceUi();
    const get = id => root?.querySelector?.(`#${id}`);
    const start = get('rh_generation_evidence_start'), download = get('rh_generation_evidence_download');
    const copy = get('rh_generation_evidence_copy'), clear = get('rh_generation_evidence_clear');
    const status = get('rh_generation_evidence_status'), output = get('rh_generation_evidence_output');
    if (![start, download, copy, clear, status, output].every(Boolean)) return;
    let url = null, renderedId = '';
    const render = () => {
        const state = getGenerationEvidenceState();
        start.disabled = state.status === 'capturing';
        start.textContent = state.armed ? '取消等待' : '记录下一次生成';
        download.disabled = copy.disabled = !state.hasReport || state.armed;
        clear.disabled = !state.hasReport && !state.armed;
        status.textContent = state.armed ? '已就绪。回到聊天正常生成或重说一次，完成后回来导出。'
            : state.status === 'capturing' ? `正在记录消息 ${state.mesid ?? '未知'}；请求${state.hasRequest ? '已捕获' : '尚未发出'}，回复${state.hasResponse ? '已收到' : '等待中'}。`
            : state.hasReport ? `${state.status === 'complete' ? '取证完成' : state.status === 'incomplete' ? '取证不完整，已保留现有证据' : '生成未完成，已保留现有证据'} · 消息 ${state.mesid ?? '未知'}。可导出或复制；下次生成不会覆盖。`
            : '未开启。记录只保留在本页，刷新前请导出。';
        if (state.timing.requestToResponseMs !== null) {
            status.textContent += ` 请求至回复结束：${formatGenerationElapsed(state.timing.requestToResponseMs)}。`;
        }
        if (!state.hasReport || state.armed || renderedId !== state.id) {
            output.value = ''; output.hidden = true;
            if (url) { URL.revokeObjectURL(url); url = null; }
        }
        renderedId = state.id;
    };
    const onStart = () => {
        if (getGenerationEvidenceState().armed) cancelGenerationEvidenceArm();
        else if (getSettings?.().generationSource !== 'independent') status.textContent = '此入口用于独立 API。当前是跟随正文 API，尚未开始记录，也未更改生成方式。';
        else armGenerationEvidence();
    };
    const reveal = text => { output.value = text; output.hidden = false; };
    const onDownload = () => {
        const text = exportGenerationEvidence();
        if (!text) return;
        try {
            if (url) URL.revokeObjectURL(url);
            url = URL.createObjectURL(new Blob([text], { type: 'application/json;charset=utf-8' }));
            const link = document.createElement('a');
            link.href = url; link.download = `rabbitmirror-evidence-${getGenerationEvidenceState().id}.json`;
            document.body.appendChild(link); link.click(); link.remove();
            status.textContent = '已发起文件下载。如宿主未弹出保存，请用“复制报告”。';
        } catch { reveal(text); status.textContent = '当前宿主不能下载，请复制下方报告。'; }
    };
    const onCopy = async () => {
        const text = exportGenerationEvidence();
        if (!text) return;
        try { await navigator.clipboard.writeText(text); status.textContent = '报告已复制。'; }
        catch {
            reveal(text); output.focus(); output.select();
            let copied = false;
            try { copied = document.execCommand('copy'); } catch {}
            status.textContent = copied ? '报告已复制。' : '请长按下方报告全选复制。';
        }
    };
    const handlers = [[start, onStart], [download, onDownload], [copy, onCopy], [clear, clearGenerationEvidence]];
    for (const [node, handler] of handlers) node.addEventListener('click', handler);
    const unsubscribe = subscribeGenerationEvidence(render);
    cleanup = () => {
        unsubscribe();
        for (const [node, handler] of handlers) node.removeEventListener('click', handler);
        if (url) URL.revokeObjectURL(url);
    };
    render();
}
