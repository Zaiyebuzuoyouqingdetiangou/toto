// 打码名单按角色卡分开；「找名字」在本机列候选，不读世界书正文、不调用模型。
import test from 'node:test';
import assert from 'node:assert/strict';
import { nameMaskRulesFor, normalizeNameMaskCardRules } from '../src/nameMask.js';
import { nameMaskCardKey, nameMaskCardLabel, findNameMaskCandidates, nameLikeParts } from '../src/nameMaskCandidates.js';

const ctx = {
    name1: '阿雪', name2: '阿岩', characterId: 0,
    characters: [{ name: '阿岩', avatar: 'ayan.png', data: { extensions: { world: '某城设定' } } }, { name: '阿竹', avatar: 'azhu.png' }],
    chat: [{ is_user: true, name: '阿雪' }, { name: '阿岩' }, { is_system: true, name: '系统' }],
    chatMetadata: { world_info: '聊天备忘' },
};

test('card key follows the card, or the group in group chats', () => {
    assert.equal(nameMaskCardKey(ctx), 'card:ayan.png');
    assert.equal(nameMaskCardLabel(ctx), '阿岩');
    const group = { ...ctx, groupId: 'g1', groups: [{ id: 'g1', name: '某教', members: ['ayan.png', 'azhu.png'] }] };
    assert.equal(nameMaskCardKey(group), 'group:g1');
    assert.equal(nameMaskCardLabel(group), '群聊：某教');
    assert.equal(nameMaskCardKey({}), '');
});

test('this card\'s list wins over the shared list for the same name; other cards do not leak in', () => {
    const settings = { nameMaskRules: [{ find: '阿竹', replace: '路人' }, { find: '某城', replace: '某地' }],
        nameMaskRulesByCard: normalizeNameMaskCardRules({ 'card:ayan.png': [{ find: '阿竹', replace: '阿乙' }], 'card:other.png': [{ find: '阿松', replace: 'X' }] }) };
    assert.deepEqual(nameMaskRulesFor(settings, 'card:ayan.png'), [{ find: '阿竹', replace: '阿乙' }, { find: '某城', replace: '某地' }]);
    assert.deepEqual(nameMaskRulesFor(settings, ''), [{ find: '阿竹', replace: '路人' }, { find: '某城', replace: '某地' }]);
});

test('name-like parts come from titles and keys, not sentences or regexes', () => {
    assert.deepEqual(nameLikeParts('人物：阿竹'), ['阿竹']);
    assert.deepEqual(nameLikeParts('【阿松】'), ['阿松']);
    assert.deepEqual(nameLikeParts('阿竹/竹哥'), ['阿竹', '竹哥']);
    assert.deepEqual(nameLikeParts('/阿.*/i'), []);
    assert.deepEqual(nameLikeParts('这是一句很长的描述，不是名字。'), []);
});

test('candidates are found locally from card, chat names and both world books; listed names are left out', async () => {
    const asked = [];
    const books = {
        某城设定: { entries: { 1: { comment: '人物：阿竹', key: ['阿竹', '竹哥', '/regex/'] }, 2: { comment: '关掉的', key: ['阿松'], disable: true } } },
        聊天备忘: { entries: [{ comment: '某城', key: [] }] },
    };
    const found = await findNameMaskCandidates(ctx, { exclude: ['阿雪'], fetchBook: async (_ctx, name) => { asked.push(name); return books[name]; } });
    assert.deepEqual(asked, ['某城设定', '聊天备忘']);
    assert.deepEqual(found.map(item => item.name), ['阿岩', '阿竹', '竹哥', '某城']);
    assert.equal(found.find(item => item.name === '竹哥').from, '世界书关键词');
});

test('an unreadable world book is skipped, not an error', async () => {
    const found = await findNameMaskCandidates(ctx, { fetchBook: async () => { throw new Error('offline'); } });
    assert.deepEqual(found.map(item => item.name), ['阿雪', '阿岩']);
});

test('NPC names written inside entry contents and active global books are found, and names seen in the chat come first', async () => {
    const npcCtx = { ...ctx, chat: [{ is_user: true, name: '阿雪', mes: '去找阿松' }, { name: '阿岩', mes: '阿松和阿竹在桥上，阿松先开口。' }] };
    const books = {
        某城设定: { entries: {} },
        聊天备忘: { entries: [] },
        全局人物: { entries: { 1: { comment: '江湖势力＆npc', key: ['落汤鸡'], content: '【阿竹】\n阿松（镇北司指挥使）：冷面\n外貌：高大\n性格：沉稳\n绰号：某甲、某乙\n【主要势力与组织】' } } },
    };
    const found = await findNameMaskCandidates(npcCtx, { exclude: ['阿雪', '阿岩'], extraBooks: ['全局人物', '某城设定'], fetchBook: async (_c, name) => books[name] });
    const names = found.map(item => item.name);
    assert.ok(['阿竹', '阿松', '某甲', '某乙'].every(name => names.includes(name)), names.join(','));
    assert.ok(!names.includes('外貌') && !names.includes('性格') && !names.includes('主要势力与组织'), names.join(','));
    assert.deepEqual(names.slice(0, 2), ['阿松', '阿竹'], '聊天里出现次数多的在前');
    assert.equal(found.find(item => item.name === '阿松').mentions, 3);
    assert.ok(names.indexOf('落汤鸡') > names.indexOf('阿竹'), '没在聊天里出现的杂词沉后面');
});

test('common ways of writing an NPC in a book are all picked up, and real names are not swallowed as field labels', async () => {
    const { namesFromText } = await import('../src/nameMaskCandidates.js');
    const cases = [
        ['- **阿松**：冷面', ['阿松']], ['**阿松**（指挥使）', ['阿松']], ['阿松，男，二十五岁', ['阿松']], ['name: 阿松', ['阿松']],
        ['### 阿松', ['阿松']], ['背景人物：阿松、阿竹', ['阿松', '阿竹']], ['角色名：阿松', ['阿松']], ['姓名：阿松（字某甲）', ['阿松', '某甲']],
        ['阿松 — 剑客', ['阿松']], ['李重要：账房', ['李重要']], ['外貌：高大', []], ['【人物设定】', []], ['这是一句话，没有名字。', []],
    ];
    for (const [text, expected] of cases) assert.deepEqual(namesFromText(text), expected, text);
});
