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
    // 完整长相逐人写（配给各自的人物栏）；自然语言画面里写到每个人时，最显眼的长相紧跟在这个人后面，不并成一串；
    // 标签画面里不写长相（标签分不清是谁的）。生图 LLM 模式也要逐人写外貌。
    assert.equal((builder.match(/完整长相逐人写在下面/g) || []).length, 2, 'both prompt formats');
    assert.match(builder, /把最显眼的长相紧跟在这个人后面/);
    assert.match(builder, /长相标签写在下面逐人那一条，这里不写/);
    assert.match(builder, /正式提示词由生图 LLM 另写；出场人物的外貌照样逐人写：' \+ directCharacters/);
    assert.equal((builder.match(/两人以内、近景或中景为主/g) || []).length, 2, 'both prompt formats');
});

test('image LLM planning asks for the same', () => {
    assert.match(plan, /画面里的每个人都要有对应的 characters 项（用名字，不写成「女子」「少年」）/);
    assert.match(plan, /两人以内、近景或中景为主/);
});

test('image planning (built-in with image LLM and the manual image panel) reads the character world book cast', async () => {
    const { buildImagePlanningPrompt } = await import(`${root}src/imagePlan.js`);
    const { systemPrompt, userPrompt } = buildImagePlanningPrompt({ faceText: '阿岩托着阿雪的下颌', worldBookCast: '{"title":"某教势力与npc","content":"阿岩：棕色短发"}' });
    assert.match(userPrompt, /worldBookCast/);
    assert.match(userPrompt, /棕色短发/);
    assert.match(systemPrompt, /materials\.worldBookCast/);
    const none = buildImagePlanningPrompt({ faceText: '阿岩' });
    assert.doesNotMatch(none.userPrompt, /worldBookCast/);
    const mount = readFileSync(`${root}src/independentApi/mount.js`, 'utf8');
    assert.match(mount, /readCharacterWorldBookContext\(getContext\(\),\{[^}]*onlyMentioned:true/);
});
