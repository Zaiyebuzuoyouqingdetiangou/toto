// 交互方式词表与插件驱动写法。不是交互池：不按关键词指派，也不要求必须采用。
// 每面只随机提供 4 种插件驱动方式的写法（避开上一面提供过的），HTML/CSS 能直接实现的方式只给名称；
// 名称每次打乱顺序，避免模型总挑排在前面的那几个。
export const CSS_METHODS = Object.freeze(['折叠', '整幕切换', '翻面', '图层控制', '物件开合与变形', '连续滑动浏览', '组合解锁', '分支选择']);

export const DRIVER_METHODS = Object.freeze({
    popup: { names: ['弹窗'], how: 'button popovertarget 指向本面 div popover，内置 popovertargetaction="hide" 关闭钮，不预先展开' },
    effect: { names: ['触发效果', '逐字显现', '盖章印记'], how: 'data-rm-ui="effect" 内 button data-rm-fire 触发 data-rm-part 的关键帧，每次从头播放' },
    drag: { names: ['拖动与组合', '投放收纳'], how: 'data-rm-ui="drag"，物件 data-rm-item="键"，可选同键 data-rm-slot 吸附槽，button data-rm-reset 复原' },
    adjust: { names: ['连续调节', '旋转拨盘'], how: 'data-rm-ui="adjust" 内放 range，CSS 用 --rm-p(0～1) 连续改变主体' },
    reveal: { names: ['局部揭示', '刮擦揭开', '对照滑块'], how: 'data-rm-ui="reveal" 包住底图与 data-rm-cover 遮层，range 或横拖逐步揭开，data-rm-reset 复原' },
    view: { names: ['视野操作'], how: 'data-rm-ui="view" 内 data-rm-part 可滚动浏览，range(1～3) 连续缩放，data-rm-reset 还原' },
    draw: { names: ['手绘描画'], how: 'data-rm-ui="draw" 内 svg data-rm-canvas 供手指描画，button data-rm-reset 清除' },
    motion: { names: ['进程控制'], how: 'data-rm-ui="motion" 内 data-rm-part 保留真实动画，button data-rm-play 暂停继续，range 调进度' },
    hold: { names: ['临时预览'], how: 'data-rm-ui="hold" 的 button data-rm-hold，按住时为 [data-rm-active="true"]，CSS 据此改变画面' },
    follow: { names: ['跟随反馈'], how: 'data-rm-ui="follow" 内 data-rm-surface 为触摸区，CSS 用 --rm-x/--rm-y 定位光斑或线端' },
    reorder: { names: ['动态重排'], how: 'data-rm-ui="reorder"，同父层各项 data-rm-item，项内 button data-rm-prev/data-rm-next，data-rm-reset 复原' },
    accumulate: { names: ['累积改变'], how: 'data-rm-ui="accumulate" 内每项 button data-rm-step 切换 [data-rm-done="true"]，--rm-count 计数，data-rm-reset 撤回' },
});

const OFFER_SIZE = 3;
const RECENT_KEY = 'rabbitMirrorDriverOfferRecent';

function randomIndex(limit) {
    try {
        const buffer = new Uint32Array(1);
        globalThis.crypto.getRandomValues(buffer);
        return buffer[0] % limit;
    } catch {
        return Math.floor(Math.random() * limit);
    }
}

function shuffled(list) {
    const copy = [...list];
    for (let index = copy.length - 1; index > 0; index -= 1) {
        const other = randomIndex(index + 1);
        [copy[index], copy[other]] = [copy[other], copy[index]];
    }
    return copy;
}

export function normalizeDriverOffer(value) {
    if (!Array.isArray(value)) return null;
    const keys = [...new Set(value.filter(key => Object.prototype.hasOwnProperty.call(DRIVER_METHODS, key)))];
    return keys.length ? Object.freeze(keys) : null;
}

// 这几种驱动都靠滑杆或拖动来操作。一次最多给一种，免得写法清单里一半都是滑杆；
// 近期滑杆、拖动用得多时一种也不给。
const SLIDE_DRIVERS = new Set(['adjust', 'drag', 'reveal', 'view', 'motion']);

export function drawDriverOffer({ avoidSlide = false } = {}) {
    let recent = [];
    try { recent = JSON.parse(globalThis.localStorage?.getItem(RECENT_KEY) || '[]'); } catch { recent = []; }
    const all = Object.keys(DRIVER_METHODS).filter(key => !avoidSlide || !SLIDE_DRIVERS.has(key));
    const fresh = all.filter(key => !recent.includes(key));
    const pool = fresh.length >= OFFER_SIZE ? fresh : all;
    // 滑杆／拖动这一族整体只占一个抽签位，抽中了再从族里随机挑一种。
    const slides = pool.filter(key => SLIDE_DRIVERS.has(key));
    const units = [...pool.filter(key => !SLIDE_DRIVERS.has(key)), ...(slides.length ? [''] : [])];
    const offer = shuffled(units).slice(0, OFFER_SIZE).map(key => key || shuffled(slides)[0]);
    try { globalThis.localStorage?.setItem(RECENT_KEY, JSON.stringify(offer)); } catch { /* best effort */ }
    return Object.freeze(offer);
}

export function interactionMethodNames(offer) {
    const keys = normalizeDriverOffer(offer) || [];
    return shuffled([...CSS_METHODS, ...keys.flatMap(key => DRIVER_METHODS[key].names)]);
}

export function driverContractLines(offer) {
    const keys = normalizeDriverOffer(offer) || [];
    return keys.map(key => `    ${DRIVER_METHODS[key].names.join('、')}：${DRIVER_METHODS[key].how}。`);
}
