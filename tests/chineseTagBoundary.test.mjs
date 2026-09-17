import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createRuntime } from './helpers/vmLoader.mjs';

// Run the actual private filtering functions, not a reimplemented parser.
// Browser integration is additionally exercised with the offline Chromium harness.
const root = fileURLToPath(new URL('..', import.meta.url));
const settings = await createRuntime(root).load('src/settings.js');
const source = fs.readFileSync(new URL('../src/independentApi.js', import.meta.url), 'utf8');
const start = source.indexOf('const HISTORICAL_RABBIT_MIRROR_BLOCK_RE=');
const end = source.indexOf('function createIndependentVisibleTextReader(');
assert.ok(start >= 0 && end > start);
const scope = vm.createContext({ Set, Map, console,
    normalizeIndependentContextExcludedTags: settings.normalizeIndependentContextExcludedTags });
vm.runInContext(source.slice(start, end) + '\n globalThis.api={scanIndependentMarkupToken,stripConfiguredIndependentTagBlocks,discoverIndependentContextTagNamesInText,verifiedUnicodeTagFilteringForLiveText};', scope);
const api = scope.api;
const names = ['角色手机', '幕后故事', '幕后摘记', '主持评价', '𠀀注释', 'a𠀀注释', 'thinking'];
for (const name of names) {
    test(`保存、扫描与过滤采用相同名称：${name}`, () => {
        assert.deepEqual([...settings.normalizeIndependentContextExcludedTags([name, `<${name}>`])], [name]);
        const counts = api.discoverIndependentContextTagNamesInText(`<${name}>秘密</${name}>`);
        assert.equal(counts.get(name), 1);
        assert.equal(api.stripConfiguredIndependentTagBlocks(`前<${name}>秘密</${name}>后`, new Set([name])).text, '前后');
    });
    test(`同名嵌套与属性：${name}`, () => {
        const raw = `前<${name} note=">">秘密<${name}>内层</${name}>秘密</${name}>后`;
        assert.equal(api.stripConfiguredIndependentTagBlocks(raw, new Set([name])).text, '前后');
    });
    test(`转义和二次转义：${name}`, () => {
        let raw = `前<${name}>秘密</${name}>后`.replaceAll('<','&lt;').replaceAll('>','&gt;');
        assert.equal(api.stripConfiguredIndependentTagBlocks(raw,new Set([name])).text,'前后');
        raw=raw.replaceAll('&','&amp;');
        assert.equal(api.stripConfiguredIndependentTagBlocks(raw,new Set([name])).text,'前后');
    });
    test(`未闭合与未勾选：${name}`, () => {
        const raw=`前<${name}>秘密`;
        assert.equal(api.stripConfiguredIndependentTagBlocks(raw,new Set([name])).text,'前');
        assert.equal(api.stripConfiguredIndependentTagBlocks(raw,new Set()).text,raw);
        assert.equal(api.stripConfiguredIndependentTagBlocks(`前<${name} x="未完成`,new Set([name])).text,'前');
    });
}
for(const name of names.filter(n=>! /^[a-z]/i.test(n))) {
    test(`DOM 吞掉结束标签时从当前可见文本保留后文：${name}`, () => {
        const msg={mes:`前<${name}>秘密</${name}>后`,extra:{}};
        const result=api.verifiedUnicodeTagFilteringForLiveText(msg,`前<${name}>秘密后`,new Set([name]));
        assert.equal(result?.text,'前后');
        assert.equal(msg.mes,`前<${name}>秘密</${name}>后`);
    });
}
test('64 个码点边界一致，不接受 65 个名称字符或非法前缀', () => {
    const legal='𠀀'.repeat(64),tooLong='𠀀'.repeat(65);
    assert.deepEqual([...settings.normalizeIndependentContextExcludedTags([legal,tooLong,'1错误'])],[legal]);
    assert.equal(api.scanIndependentMarkupToken(`<${legal}>`,0)?.name,legal);
    assert.equal(api.scanIndependentMarkupToken(`<${tooLong}>`,0),null);
    assert.equal(api.scanIndependentMarkupToken('<1错误>',0),null);
    assert.equal(api.stripConfiguredIndependentTagBlocks(`<${tooLong}>正常`,new Set([legal])).text,`<${tooLong}>正常`);
});
test('不把伪造注释当作真实结束标签', () => {
    const msg={mes:'前<幕后摘记>秘密<!--幕后摘记-->仍是秘密',extra:{}};
    assert.equal(api.verifiedUnicodeTagFilteringForLiveText(msg,'前<幕后摘记>秘密仍是秘密',new Set(['幕后摘记']))?.text,'前');
});
test('过时源码不可冒充当前可见正文', () => {
    const msg={mes:'旧<幕后摘记>秘密</幕后摘记>旧后文',extra:{}};
    assert.equal(api.verifiedUnicodeTagFilteringForLiveText(msg,'新<幕后摘记>秘密新后文',new Set(['幕后摘记'])),null);
});
test('不读取额外 reasoning/thoughts，隐藏源文字不能补入正文', () => {
    const extra={};
    for(const key of ['reasoning','thoughts']) Object.defineProperty(extra,key,{get(){throw new Error('Private field accessed');}});
    const msg={mes:'前<div hidden>HIDDEN</div><幕后摘记>秘密</幕后摘记>后',extra};
    assert.equal(api.verifiedUnicodeTagFilteringForLiveText(msg,'前<幕后摘记>秘密后',new Set(['幕后摘记']))?.text,'前后');
});
test('混合英文已选块与未选择的中文文字均保持正确边界', () => {
    const msg={mes:'前<thinking>秘密</thinking><未选择>正常</未选择><幕后摘记>秘密</幕后摘记>后',extra:{}};
    const live='前秘密<未选择>正常<幕后摘记>秘密后';
    assert.equal(api.verifiedUnicodeTagFilteringForLiveText(msg,live,new Set(['thinking','幕后摘记']))?.text,'前<未选择>正常后');
});
test('宿主移除 Markdown 强调符号后，仍只取当前 DOM 正文', () => {
    const msg={mes:'**前文**<幕后摘记>秘密</幕后摘记>**后文**',extra:{}};
    assert.equal(api.verifiedUnicodeTagFilteringForLiveText(msg,'前文<幕后摘记>秘密后文',new Set(['幕后摘记']))?.text,'前文后文');
});
test('临时边界占位符不可由消息内容伪造', () => {
    const prefix='\uE000RM_TAG_0\uE001';
    const msg={mes:prefix+'前<幕后摘记>秘密</幕后摘记>后',extra:{}};
    assert.equal(api.verifiedUnicodeTagFilteringForLiveText(msg,prefix+'前<幕后摘记>秘密后',new Set(['幕后摘记']))?.text,prefix+'前后');
});
