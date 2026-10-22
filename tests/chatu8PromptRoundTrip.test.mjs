// 智绘姬：存档里的提示词重开、重画时，人物外貌不丢、也不拼两遍。
// 新记录存 characters；旧记录（没存 characters）用实际发出去的整段。
import test from 'node:test';
import assert from 'node:assert/strict';

const sent = [];
globalThis.SillyTavern = { getContext: () => ({
    extensionSettings: { 'st-chatu8': { scriptEnabled: true, mode: 'novelai' } },
    eventSource: (() => {
        const listeners = new Map();
        return {
            on(name, fn) { listeners.set(name, [...(listeners.get(name) || []), fn]); },
            removeListener(name, fn) { listeners.set(name, (listeners.get(name) || []).filter(item => item !== fn)); },
            emit(name, data) {
                if (name !== 'generate-image-request') return;
                sent.push(data.prompt);
                queueMicrotask(() => { for (const fn of listeners.get('generate-image-response') || []) fn({ id: data.id, success: true, imageData: '/user/images/rabbit.png' }); });
            },
        };
    })(),
}) };

const { generateViaChatu8, draftFromSavedImage } = await import('../src/chatu8Image.js?rmv=1.76.1');

const people = [
    { name: '阿雪', tag: 'white hair, red eyes', nl: '白发红眼的少女' },
    { name: '阿岩', tag: 'black hair, tall', nl: '高个黑发青年' },
];
const plans = {
    'NAI 5 + flatPrompt': { promptFormat: 'nai5-natural', prompt: 'snow, street', nl: '雪夜街头', flatPrompt: '雪夜街头，两人并肩走着', characters: people },
    'NAI 5 无 flatPrompt': { promptFormat: 'nai5-natural', prompt: 'snow, street', nl: '雪夜街头', flatPrompt: '', characters: people },
    'NAI 4.5 标签 + flatPrompt': { promptFormat: 'nai45-tags', prompt: 'snow, street', nl: '', flatPrompt: 'snow, street, 2people', characters: people },
    'NAI 4.5 标签 无 flatPrompt': { promptFormat: 'nai45-tags', prompt: 'snow, street', nl: '', flatPrompt: '', characters: people },
};

async function draw(plan) {
    const before = sent.length;
    const record = await generateViaChatu8(plan, {});
    assert.equal(sent.length, before + 1, '只发一次请求');
    // 存进本机再读出来（JSON）。
    return { record: JSON.parse(JSON.stringify(record)), text: sent.at(-1) };
}
const count = (text, part) => text.split(part).length - 1;
function assertLooksOnce(text, plan) {
    for (const person of people) {
        const looks = plan.promptFormat === 'nai45-tags' ? person.tag : `${person.nl}; ${person.tag}`;
        assert.equal(count(text, `${person.name}: ${looks}`), 1, `${person.name} 的外貌恰好一次：${text}`);
    }
}
// 旧版存档：promptMetadata 里没有 characters。
function legacy(record) {
    const { characters: ignored, ...meta } = record.promptMetadata;
    return { ...record, promptMetadata: meta };
}

for (const [label, plan] of Object.entries(plans)) {
    test(`${label}：新记录存了人物，重开重画发出同一段`, async () => {
        const first = await draw(plan);
        assertLooksOnce(first.text, plan);
        assert.deepEqual(first.record.promptMetadata.characters, people);
        const draft = draftFromSavedImage(first.record);
        assert.deepEqual(draft.characters, people);
        assert.equal(draft.promptFormat, plan.promptFormat);
        const again = await draw(draft);
        assert.equal(again.text, first.text);
        // 重画后的记录再重开一次也一样。
        assert.equal((await draw(draftFromSavedImage(again.record))).text, first.text);
    });

    test(`${label}：旧记录没存人物，用实际发出去的整段，外貌不丢也不重复`, async () => {
        const first = await draw(plan);
        const old = legacy(first.record);
        const draft = draftFromSavedImage(old);
        assert.deepEqual(draft.characters, []);
        assert.equal(draft.flatPrompt, first.text);
        const again = await draw(draft);
        assert.equal(again.text, first.text);
        assertLooksOnce(again.text, plan);
        // 旧记录重画出来的新记录（人物为空）再重开也稳定。
        assert.equal((await draw(draftFromSavedImage(again.record))).text, first.text);
    });
}

test('改过提示词后重开：按改过的人物和画面还原', async () => {
    const plan = plans['NAI 5 + flatPrompt'];
    const first = await draw(plan);
    const edited = { ...draftFromSavedImage(first.record), flatPrompt: '雪夜桥上，两人停下脚步',
        characters: [{ ...people[0], tag: 'white hair, blue scarf' }, people[1]] };
    const second = await draw(edited);
    assert.match(second.text, /雪夜桥上/);
    assert.match(second.text, /阿雪: 白发红眼的少女; white hair, blue scarf/);
    assert.doesNotMatch(second.text, /white hair, red eyes/);
    const reopened = draftFromSavedImage(second.record);
    assert.equal(reopened.flatPrompt, '雪夜桥上，两人停下脚步');
    assert.equal(reopened.characters[0].tag, 'white hair, blue scarf');
    assert.equal((await draw(reopened)).text, second.text);
});

test('旧记录：没有 flatPrompt、没有 promptMetadata、什么都没有', async () => {
    // 旧记录：标签写法、只有画面标签，外貌只在发出去的整段里。
    const tags = { prompt: 'snow, street\n阿竹: green hair', provider: 'st-chatu8',
        promptMetadata: { prompt: 'snow, street', nl: '', flatPrompt: '', promptFormat: 'nai45-tags' } };
    const draft = draftFromSavedImage(tags);
    assert.equal(draft.prompt, 'snow, street');
    assert.equal((await draw(draft)).text, 'snow, street\n阿竹: green hair');
    // 更早的记录：没有 promptMetadata，只有发出去的整段。
    const bare = draftFromSavedImage({ prompt: '某教的庭院\n阿竹: 绿发少年; green hair' });
    assert.equal(bare.flatPrompt, '某教的庭院\n阿竹: 绿发少年; green hair');
    assert.equal(bare.prompt, '某教的庭院\n阿竹: 绿发少年; green hair');
    assert.equal((await draw(bare)).text, '某教的庭院\n阿竹: 绿发少年; green hair');
    // 什么都没有：不还原。
    assert.equal(draftFromSavedImage({ promptMetadata: { seed: 1 } }), null);
    assert.equal(draftFromSavedImage(null), null);
});
