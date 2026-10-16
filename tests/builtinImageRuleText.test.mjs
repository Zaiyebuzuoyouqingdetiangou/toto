// 没开生图 LLM 时的内置生图规则：画面写足（约 150～300 字）、画风和媒材跟着这一面展现形式走、
// 比喻和象征变成画得出的东西、人物标签可写年龄气质和标志性衣着（4～10 个）。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../src/promptBuilder.js', import.meta.url), 'utf8');
const canon = source.match(/const CANON_APPEARANCE_RULE = [^\n]*;/)?.[0];
const fn = source.match(/function builtinImageFrameRule\([^]*?\r?\n}/)?.[0];
const context = vm.createContext({});
vm.runInContext(`${canon}\n${fn}\nglobalThis.rule = builtinImageFrameRule;`, context);
const rule = settings => context.rule({ builtinImageEnabled: true, ...settings });

test('NAI 5 natural-language rule', () => {
    const text = rule({ imagePromptFormat: 'nai5-natural' });
    assert.match(text, /约 150～300 字，细节写足/);
    assert.match(text, /开头按这一面展现形式本身的样子写出画风和媒材/);
    assert.match(text, /比喻和象征要变成画得出的东西再写/);
    assert.match(text, /不写对白和心理活动/);
    assert.doesNotMatch(text, /100～200|心理和比喻|4～8/);
    assert.match(text, /按人数与性别、画风与媒材、镜头构图/);
    assert.match(text, /年龄、气质和标志性衣着（这一幕换了衣服时以当时衣着为准）；外貌英文标签 4～10 个/);
    // 不给固定画风清单：只举形式→画风的对应，不列一串画风让模型挑。
    assert.doesNotMatch(text, /watercolor|anime|oil painting/i);
});

test('NAI 4.5 tag rule', () => {
    const text = rule({ imagePromptFormat: 'nai45-tags' });
    assert.match(text, /画风与媒材（按这一面展现形式本身的样子写/);
    assert.match(text, /比喻和象征要先变成画得出的东西再写成标签/);
    assert.match(text, /标志性衣着（这一幕换了衣服时以当时衣着为准），4～10 个/);
    assert.doesNotMatch(text, /4～8/);
});

test('with an image LLM the frame only carries a short hint', () => {
    const text = rule({ imagePromptFormat: 'nai5-natural', builtinImageLlmReady: true });
    assert.match(text, /正式提示词由生图 LLM 另写/);
    assert.doesNotMatch(text, /150～300/);
    assert.equal(context.rule({ builtinImageEnabled: false }), '');
});
