import assert from 'node:assert/strict';
import test from 'node:test';

// thinking 模型生图构思解析的定向回归。
//
// 回归背景：extractBalancedJsonObjects 从整段开头扫描。thinking 模型把推理写进
// 正文时，推理文字里落单的 ASCII 引号会让扫描器误入字符串状态，之后引号开闭
// 全部错位，推理之后那份完好的 JSON 取不出来；非 thinking 模型没有推理文字，
// 所以只有 thinking 模型会失败。另一种更隐蔽的情况：推理里草拟过的 JSON 会被
// 误当作最终答案返回，不报错、直接拿草稿去生图。

const { parseImagePlan } = await import('../src/imagePlan.js');

const PLAN = JSON.stringify({ prompt: '1girl, library, window light', nl: '图书馆窗边' });
const NESTED = JSON.stringify({ prompt: '2girls, cafe', characters: [{ name: '甲', tag: 'short hair' }, { name: '乙', tag: 'long hair' }] });

// ── thinking 模型的真实输出形态：修复前会失败 ─────────────────────────
test('reasoning with an unmatched quote before the answer', () => {
    assert.equal(parseImagePlan('<think>她说"好吧，然后看向窗外。</think>\n' + PLAN).prompt, '1girl, library, window light');
});

test('reasoning whose opening tag was stripped by the proxy', () => {
    assert.equal(parseImagePlan('先分析场景，她说"嗯。\n</think>\n' + PLAN).prompt, '1girl, library, window light');
});

test('untagged reasoning containing stray quotes', () => {
    assert.equal(parseImagePlan('让我想想，角色说"你好"然后"离开。\n' + PLAN).prompt, '1girl, library, window light');
});

test('nested characters survive quote desync and inner objects are not mistaken for the plan', () => {
    const plan = parseImagePlan('<think>他说"走吧</think>' + NESTED);
    assert.equal(plan.prompt, '2girls, cafe');
    assert.equal(plan.characters.length, 2);
});

test('a drafted plan inside reasoning loses to the final answer', () => {
    const text = '<think>草稿 {"prompt":"draft"} 她说"不对</think>\n' + PLAN;
    assert.equal(parseImagePlan(text).prompt, '1girl, library, window light');
});

// ── 原本就成功的输入：行为必须不变 ────────────────────────────────────
test('plain JSON is unchanged', () => {
    assert.equal(parseImagePlan(PLAN).prompt, '1girl, library, window light');
});

test('fenced JSON with prose is unchanged', () => {
    assert.equal(parseImagePlan('好的：\n```json\n' + PLAN + '\n```\n完成').prompt, '1girl, library, window light');
});

test('clean reasoning without stray quotes is unchanged', () => {
    assert.equal(parseImagePlan('<think>先分析人物关系。</think>\n' + PLAN).prompt, '1girl, library, window light');
});

// ── 真正的失败仍然必须失败 ───────────────────────────────────────────
test('a reply with no plan still fails', () => {
    assert.throws(() => parseImagePlan('<think>她说"算了</think>抱歉，我无法完成。'), /没有返回有效 JSON/);
});

test('an object without a prompt is not accepted as the plan', () => {
    assert.throws(() => parseImagePlan('<think>她说"嗯</think>{"nl":"只有描述"}'), /没有返回有效 JSON|缺少生图提示词/);
});

test('truncated output still fails', () => {
    assert.throws(() => parseImagePlan('<think>她说"好</think>' + PLAN.slice(0, -10)), /没有返回有效 JSON/);
});
