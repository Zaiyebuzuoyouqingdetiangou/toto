import test from 'node:test';
import assert from 'node:assert/strict';
// theaterFavorites.js 的 import 链现在经 settings.js 走到宿主的 extensions.js，直接 import 会找不到文件；
// 用仓库的 vm 加载器跑，宿主那两个模块由它打桩。
import { fileURLToPath } from 'node:url';
import { createRuntime } from './helpers/vmLoader.mjs';
const favoritesRuntime = createRuntime(fileURLToPath(new URL('..', import.meta.url)));
// 模块顶层会排一个定时器去刷新续写候选；测试里不跑它。
Object.assign(favoritesRuntime.context, { setTimeout: () => 0, clearTimeout: () => {} });
const { sanitizeTheaterFavoriteTitle, theaterFavoriteDisplayTitle } = await favoritesRuntime.load('src/theaterFavorites.js');

test('favorite viewer title drops swipe chrome leftover in saved names', () => {
    assert.equal(
        sanitizeTheaterFavoriteTitle('【兔子镜：极秘·小海带驯化手帐】‹1/1›×'),
        '【兔子镜：极秘·小海带驯化手帐】',
    );
    assert.equal(
        theaterFavoriteDisplayTitle({ title: '【兔子镜：梦境】< 2 / 5 >×  extra' }),
        '【兔子镜：梦境】 extra',
    );
});
