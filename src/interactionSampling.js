// Three joint-design candidates in one completion. The program assigns a uniform
// ordinal BEFORE the completion; it cannot inspect ungenerated candidates. The
// reported probabilities are evidence, not weights for this local draw. Compliance
// and implementation remain model-dependent. Nothing here gates output or retries.
export const INTERACTION_SAMPLING_RULE = `整体设计候选【VS 试验】：正文挑签先选定一签。依本面展现形式与近期记录，构思 3 个具体可实现的整体短方案，每条一句写清本体构成、操作部位、哪个部件从何种状态变为何种状态、结果出现在哪里；从媒介在现实中的结构与用法出发，文字随状态变化出现，不以几个条目各对应一段文字作为方案。每条先写这个媒介现实中的使用过程（至少两步，后一步建立在前一步的结果上；可取用下方真实用法，也可另选），再另列交互方式标签；三条的主要用法互不相同。结构依次为：方案 1 只有一个主体，直接点按或拖动主体本身让它一步步变化；方案 2 整个媒介一起切换状态，不分条目；方案 3 自由。三条须有实质差异，不仅换名称、颜色或正文；各附概率 p（0～1）仅作记录，实现序号由程序指定。先用 HTML/CSS 建立部件及前后状态再填内容；选中高亮、图标抖动或文字切页不能冒充承诺的变化。在外层 details 的 data-rm-vs 写合法 JSON：c 为三项 [短方案,p]，m 为三项交互方式列表，pick 为指定序号，引号按 HTML 转义。候选不显示为菜单，不重抽选材。`;

export function designCandidatePick(value) {
    return Number.isInteger(value) && value >= 1 && value <= 3 ? value : null;
}

// slots=2 只在方案 1、2（单一主体／整体切换）之间抽，用于近期连续出现并列入口时换口味。
export function drawDesignCandidate({ slots = 3 } = {}) {
    const count = slots === 2 ? 2 : 3;
    try {
        const random = new Uint32Array(1);
        // 2^32 - 1 is divisible by three; 2^32 is divisible by two. Reject the one excess value for three.
        for (let i = 0; i < 8; i++) {
            globalThis.crypto.getRandomValues(random);
            if (count === 2) return random[0] % 2 + 1;
            if (random[0] < 0xffffffff) return random[0] % 3 + 1;
        }
    } catch { /* legacy hosts still receive one ordinary local draw */ }
    return Math.floor(Math.random() * count) + 1;
}

function readSamplingRecord(root) {
    let raw;
    try { raw = root?.getAttribute?.('data-rm-vs'); } catch { return { status: 'missing' }; }
    if (!raw) return { status: 'missing' };
    const invalid = { status: 'invalid' };
    if (typeof raw !== 'string' || raw.length > 8192) return invalid;
    let record;
    try { record = JSON.parse(raw); } catch { return invalid; }
    // Read legacy five-candidate records too; no old artwork is invalidated.
    if (!record || !Array.isArray(record.c) || ![3, 5].includes(record.c.length)
        || !Number.isInteger(record.pick) || record.pick < 1 || record.pick > record.c.length) return invalid;
    if (record.c.some(item => !Array.isArray(item) || item.length !== 2
        || typeof item[0] !== 'string' || !item[0].trim()
        || typeof item[1] !== 'number' || !Number.isFinite(item[1]) || item[1] < 0 || item[1] > 1)
        || !record.c.some(item => item[1] > 0)) return invalid;
    return { status: 'recorded', record };
}

// Compare only the exact request metadata and its response. Never use the most
// recent request as the expected choice for an arbitrary older displayed face.
export function designSamplingChecksFromHtml(html, metadata) {
    const faces = Array.isArray(metadata?.faces) && metadata.faces.length ? metadata.faces : [metadata];
    const checks = faces.slice(0, 5).flatMap((face, faceIndex) => {
        const expectedPick = designCandidatePick(face?.designCandidatePick);
        return expectedPick ? [{ faceIndex, expectedPick, reportedPick: null, status: 'unavailable' }] : [];
    });
    if (!checks.length || typeof html !== 'string' || html.length > 500000) return checks;
    try {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const frames = [...doc.querySelectorAll('toto')].filter(node => !node.parentElement?.closest('toto'));
        for (const check of checks) {
            const matches = faces.length === 1 ? frames : frames.filter(node => node.getAttribute('data-rm-face') === String(check.faceIndex + 1));
            if (matches.length !== 1) { check.status = 'missing'; continue; }
            const parsed = readSamplingRecord(matches[0].querySelector('details'));
            check.status = parsed.status;
            if (!parsed.record) continue;
            check.reportedPick = parsed.record.pick;
            check.status = parsed.record.c.length !== 3 ? 'invalid'
                : check.reportedPick === check.expectedPick ? 'matched' : 'mismatch';
        }
    } catch { /* optional evidence never blocks a paid response */ }
    return checks;
}

export function designSamplingChecksDiagnostic(checks) {
    if (!Array.isArray(checks) || !checks.length) return '';
    const labels = { matched: '序号一致', mismatch: '序号不一致', missing: '无回报', invalid: '记录无效', unavailable: '未能核对' };
    return ['整体设计序号核对（最近一次请求，不一定对应当前镜面；序号一致不代表交互已实现）：',
        ...checks.slice(0, 5).map(item => `  第 ${Number(item.faceIndex) + 1} 面：程序指定=${item.expectedPick} 模型回报=${item.reportedPick ?? '(无)'} ${labels[item.status] || labels.unavailable}`),
    ].join('\n');
}

export function interactionSamplingDiagnostic(root) {
    const parsed = readSamplingRecord(root);
    if (parsed.status === 'missing') return 'VS 方案候选：无记录（旧作品或模型未提供；不据此判断成品质量）。';
    const invalid = 'VS 方案候选：记录无效；保留成品，不重试，不据此判断成品质量。';
    if (!parsed.record) return invalid;
    const { record } = parsed;
    const lines = record.c.map(([plan, probability], index) => {
        const shortPlan = plan.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 240);
        return `  ${index + 1}. p=${probability} ${shortPlan}`;
    });
    return [`VS 方案候选：模型自报 ${record.c.length} 项，选中=${record.pick}；本段未核对程序指定，不代表设计差异或交互已实现。`, ...lines].join('\n');
}
