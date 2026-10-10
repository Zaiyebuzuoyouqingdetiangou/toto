// In-memory provenance only: generated data attributes cannot impersonate a
// runtime override. Restore on detached copies, never mutate the live controls.
import { restoreRabbitMirrorAvatarClone } from './chatAvatars.js?rmv=1.67.57';
const authoredAnimationStyles = new WeakMap();
export const ANIMATION_SUSPENDED_ATTR = 'data-rm-animation-suspended';

export function rememberRuntimeAnimationStyle(element, property = 'animation-play-state') {
    if (property !== 'animation-play-state' || !element?.style || authoredAnimationStyles.has(element)) return;
    authoredAnimationStyles.set(element, {
        value: element.style.getPropertyValue(property), priority: element.style.getPropertyPriority(property),
    });
}

export function restoreRuntimeAnimationClone(source, clone) {
    const stack = [[source, clone]];
    while (stack.length) {
        const [before, after] = stack.pop();
        if (!before || !after || before.nodeType !== after.nodeType || before.nodeName !== after.nodeName) continue;
        after.removeAttribute?.(ANIMATION_SUSPENDED_ATTR);
        const baseline = authoredAnimationStyles.get(before);
        if (baseline && after.style) {
            if (baseline.value) after.style.setProperty('animation-play-state', baseline.value, baseline.priority);
            else after.style.removeProperty('animation-play-state');
        }
        const children = before.childNodes || [];
        if (children.length !== after.childNodes?.length) continue;
        for (let i = 0; i < children.length; i++) stack.push([children[i], after.childNodes[i]]);
    }
    return restoreRabbitMirrorAvatarClone(source, clone);
}
