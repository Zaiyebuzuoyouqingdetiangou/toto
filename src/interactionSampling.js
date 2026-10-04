// VS-inspired interaction-plan experiment, not a catalogue of reusable plays.
// One completion reports a small distribution, selects a plan and implements it.
// Selection is model-reported, not a locally enforced random draw. The record is
// optional diagnostic evidence, never a generation gate or an interaction test.
export const INTERACTION_SAMPLING_RULE = `交互候选【VS 试验】：为本面已抽中的展现形式临时生成 5 个合理、实际操作结果不同的短方案，各用一句写清本体对象、操作与反馈，并给出自然生成该方案的估计概率 p（0～1，非质量分）。从完整可能性中取样，包含较少见但适配的方案；按这些概率归一化抽取一个，不默认取最高概率。先在本面最外层 details 的 data-rm-vs 属性写合法 JSON：{"c":[["短方案",0.1],…],"pick":1}（c 为五项，pick 从1起，属性引号按 HTML 转义），随后只实现选中方案。候选与概率不显示、不变成界面选项；不重抽主题或展现形式。`;

export function interactionSamplingDiagnostic(root) {
    let raw;
    try { raw = root?.getAttribute?.('data-rm-vs'); } catch { /* optional evidence */ }
    if (!raw) return 'VS 交互候选：无记录（旧作品或模型未提供；不据此判断交互质量）。';
    const invalid = 'VS 交互候选：记录无效；保留成品，不重试，不据此判断交互质量。';
    if (typeof raw !== 'string' || raw.length > 8192) return invalid;
    let record;
    try { record = JSON.parse(raw); } catch { return invalid; }
    if (!record || !Array.isArray(record.c) || record.c.length !== 5
        || !Number.isInteger(record.pick) || record.pick < 1 || record.pick > record.c.length) return invalid;
    if (record.c.some(item => !Array.isArray(item) || item.length !== 2
        || typeof item[0] !== 'string' || !item[0].trim()
        || typeof item[1] !== 'number' || !Number.isFinite(item[1]) || item[1] < 0 || item[1] > 1)
        || !record.c.some(item => item[1] > 0) || record.c[record.pick - 1][1] <= 0) return invalid;
    const lines = record.c.map(([plan, probability], index) => {
        const shortPlan = plan.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 240);
        return `  ${index + 1}. p=${probability} ${shortPlan}`;
    });
    return [`VS 交互候选：模型自报 ${record.c.length} 项，选中=${record.pick}；不是本地严格概率抽样，不代表差异或交互已实现。`, ...lines].join('\n');
}
