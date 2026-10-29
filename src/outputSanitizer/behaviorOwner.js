import { EXTRA_CONTROLS } from './behaviorExtras.js?rmv=1.99.21';
export const BEHAVIOR_GROUP = '[data-rm-ui]';
export const TYPE_CONTROLS = Object.freeze({ drag: ['place', 'return', 'move'], effect: ['fire'], motion: ['play', 'reverse', 'seek'], hold: ['hold'], reorder: ['prev', 'next'], accumulate: ['step'],
    toggle: ['toggle'], pick: ['pick'], pager: ['prev', 'next', 'goto'], roll: ['roll'], connect: ['end'], turn: ['knob'], sequence: ['code'], ...EXTRA_CONTROLS });
const ALL_CONTROL_NAMES = [...new Set(Object.values(TYPE_CONTROLS).flat())];
export function behaviorOwnerGroup(node) {
    const near = node?.closest?.(BEHAVIOR_GROUP);
    if (!near || node === near)
        return near || null;
    let names = null;
    for (const name of ALL_CONTROL_NAMES)
        if (node.hasAttribute(`data-rm-${name}`))
            (names ||= []).push(name);
    if (!names)
        return near;
    const claims = group => (TYPE_CONTROLS[group.getAttribute('data-rm-ui')] || []).some(name => names.includes(name));
    if (claims(near))
        return near;
    for (let group = near.parentElement?.closest(BEHAVIOR_GROUP); group; group = group.parentElement?.closest(BEHAVIOR_GROUP))
        if (claims(group))
            return group;
    return near;
}
export const ownBehaviorNodes = (group, selector) => [...group.querySelectorAll(selector)].filter(node => behaviorOwnerGroup(node) === group);
