// 插件区域的部件归属：一个 data-rm-* 部件归哪个 [data-rm-ui] 区域。
// 一般是离它最近的区域；但模型常把区域套在一起（比如按住区域里套着累积区域），外层的按钮写进了内层——
// 最近的区域不认这个部件、外层认时，归外层。所有驱动、类型核对都用这一套，接线和检查才对得上。
import { EXTRA_CONTROLS } from './behaviorExtras.js?rmv=1.79.5';

export const BEHAVIOR_GROUP = '[data-rm-ui]';
// 每类驱动认哪些部件；不属于本类的标识（比如拖动区里碰巧写了 data-key）不接管它的点击。
export const TYPE_CONTROLS = Object.freeze({ drag: ['place', 'return', 'move'], effect: ['fire'], motion: ['play', 'reverse', 'seek'], hold: ['hold'], reorder: ['prev', 'next'], accumulate: ['step'],
    toggle: ['toggle'], pick: ['pick'], pager: ['prev', 'next', 'goto'], roll: ['roll'], connect: ['end'], turn: ['knob'], sequence: ['code'], ...EXTRA_CONTROLS });
const ALL_CONTROL_NAMES = [...new Set(Object.values(TYPE_CONTROLS).flat())];

export function behaviorOwnerGroup(node) {
    const near = node?.closest?.(BEHAVIOR_GROUP);
    if (!near || node === near) return near || null;
    let names = null;
    for (const name of ALL_CONTROL_NAMES) if (node.hasAttribute(`data-rm-${name}`)) (names ||= []).push(name);
    if (!names) return near;
    const claims = group => (TYPE_CONTROLS[group.getAttribute('data-rm-ui')] || []).some(name => names.includes(name));
    if (claims(near)) return near;
    for (let group = near.parentElement?.closest(BEHAVIOR_GROUP); group; group = group.parentElement?.closest(BEHAVIOR_GROUP)) if (claims(group)) return group;
    return near;
}

export const ownBehaviorNodes = (group, selector) => [...group.querySelectorAll(selector)].filter(node => behaviorOwnerGroup(node) === group);
