// VS-inspired joint-design experiment, not a catalogue of reusable plays.
// One completion reports a small distribution, selects a plan and implements it.
// Selection is model-reported, not a locally enforced random draw. The record is
// optional diagnostic evidence, never a generation gate or an interaction test.
export const INTERACTION_SAMPLING_RULE = `整体设计候选【VS 试验】：正文挑签先选定一签，未选中签不展开设计。遵循本面已确定展现形式的落地与美化要求，结合近期成品记录探索不同设计，临时生成 3 个合理、构图及操作结果不同的短方案，各用一句写清本体层次、材质配色、操作与反馈，避免同构换色，并给出自然生成该方案的估计概率 p（0～1，非质量分）。从完整可能性中取样，包含较少见但适配的方案；按这些概率归一化抽取一个，不默认取最高概率。先在本面最外层 details 的 data-rm-vs 属性写合法 JSON：{"c":[["短方案",0.1],…],"pick":1}（c 为三项，pick 从1起，属性引号按 HTML 转义），随后只实现选中方案，将其最有辨识度的本体构造、视觉层次与操作反馈落实到本体对应部位。候选与概率不显示、不变成界面选项；不重抽主题或展现形式。`;

export function interactionSamplingDiagnostic(root) {
    let raw;
    try { raw = root?.getAttribute?.('data-rm-vs'); } catch { /* optional evidence */ }
    if (!raw) return 'VS 方案候选：无记录（旧作品或模型未提供；不据此判断成品质量）。';
    const invalid = 'VS 方案候选：记录无效；保留成品，不重试，不据此判断成品质量。';
    if (typeof raw !== 'string' || raw.length > 8192) return invalid;
    let record;
    try { record = JSON.parse(raw); } catch { return invalid; }
    // Three candidates for new work; keep reading the five-candidate records
    // already emitted by 1.62.88. This remains diagnostic-only.
    if (!record || !Array.isArray(record.c) || ![3, 5].includes(record.c.length)
        || !Number.isInteger(record.pick) || record.pick < 1 || record.pick > record.c.length) return invalid;
    if (record.c.some(item => !Array.isArray(item) || item.length !== 2
        || typeof item[0] !== 'string' || !item[0].trim()
        || typeof item[1] !== 'number' || !Number.isFinite(item[1]) || item[1] < 0 || item[1] > 1)
        || !record.c.some(item => item[1] > 0) || record.c[record.pick - 1][1] <= 0) return invalid;
    const lines = record.c.map(([plan, probability], index) => {
        const shortPlan = plan.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 240);
        return `  ${index + 1}. p=${probability} ${shortPlan}`;
    });
    return [`VS 方案候选：模型自报 ${record.c.length} 项，选中=${record.pick}；不是本地严格概率抽样，不代表设计差异或交互已实现。`, ...lines].join('\n');
}
