// 内置生图：画面里的每个人都要有自己的角色栏（用名字），一幕两人以内、近景或中景为主。
// 以前有一张图背上的女子只写成「女子」、没有角色栏，画出来是随机路人；画面塞了三个人加一堆道具，画得很散。
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const builder = readFileSync(`${root}src/promptBuilder.js`, 'utf8');
const plan = readFileSync(`${root}src/imagePlan.js`, 'utf8');

test('direct image prompts ask for every person by name and a close, small cast', () => {
    assert.equal((builder.match(/画面里有几个人就加几条，一个都不能少.*?每人一条（用正文里的名字，不写成「女子」「少年」）/g) || []).length, 2, 'both prompt formats');
    // 长相只逐人写（配给各自的人物栏），画面那一段不写，免得两人的发色混在一起；生图 LLM 模式也要逐人写外貌。
    assert.equal((builder.match(/长相不写在画面那一段里，逐人写在下面/g) || []).length, 2, 'both prompt formats');
    assert.match(builder, /正式提示词由生图 LLM 另写；出场人物的外貌照样逐人写：' \+ directCharacters/);
    assert.equal((builder.match(/两人以内、近景或中景为主/g) || []).length, 2, 'both prompt formats');
});

test('image LLM planning asks for the same', () => {
    assert.match(plan, /画面里的每个人都要有对应的 characters 项（用名字，不写成「女子」「少年」）/);
    assert.match(plan, /两人以内、近景或中景为主/);
});
