import { rmR as __rmR } from "../textTable.js?rmv=1.99.12";
import { normalizeShowToken } from './behaviorResults.js?rmv=1.99.12';
const BOUND_ATTR = 'data-rm-dice-track';
const BOUND = new WeakSet();
const TRACK_HINT = __rmR("LA54G80I.roo.REPEhFpw.ryOBVOTUw3br0ds4JgiT8dT.BfjYZipydWngzPdLMjhO5D.sqHKDym_91cj6nZ24ZjFyWQfjQ3Yo3g0GiPT42MZNd29C_CKtlW7YmqywmCFBOgf8ZyJyzN2d4bwFUDK9_o_aihiArrgjnPRf", "i");
const NATIVE = 'button, input, textarea, select, a[href], summary, label';
function faceStyleText(root) {
    return [...root.querySelectorAll('style')].map(node => node.textContent || '').join('\n');
}
function escapeRegExp(text) {
    return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function ownCheckedRule(css, id) {
    const name = escapeRegExp(id);
    return new RegExp(`(?:#${name}|\\[id=["']?${name}["']?\\])\\s*:checked`).test(css);
}
function radioTrack(root, dice, maxPoint) {
    const groups = new Map();
    for (const input of root.querySelectorAll('input[type="radio"][name]')) {
        if (dice.contains(input) || input.closest('[data-rm-ui]'))
            continue;
        const name = input.getAttribute('name');
        if (!groups.has(name))
            groups.set(name, []);
        groups.get(name).push(input);
    }
    const css = faceStyleText(root);
    const tracks = [...groups.entries()].filter(([name, inputs]) => {
        if (inputs.length < 4 || inputs.length <= maxPoint)
            return false;
        const styled = inputs.filter(input => input.id && ownCheckedRule(css, input.id)).length;
        if (styled < Math.ceil(inputs.length / 2))
            return false;
        const words = [name, ...inputs.flatMap(input => [input.id, input.className])].join(' ');
        return TRACK_HINT.test(words) || inputs.length >= 8;
    }).map(([, inputs]) => inputs);
    return tracks.length === 1 ? tracks[0] : null;
}
export function installDiceTrackRescue(root) {
    if (!root?.querySelectorAll)
        return 0;
    let count = 0;
    for (const dice of root.querySelectorAll('[data-rm-ui="roll"]')) {
        if (BOUND.has(dice))
            continue;
        const keys = [...dice.querySelectorAll('[data-rm-show]')].map(node => normalizeShowToken(String(node.getAttribute('data-rm-show') || '').trim()));
        if (keys.length < 2 || !keys.every(key => /^(?:[1-9]|1[0-2])$/.test(key)))
            continue;
        const track = radioTrack(root, dice, Math.max(...keys.map(Number)));
        if (!track)
            continue;
        BOUND.add(dice);
        dice.setAttribute(BOUND_ATTR, String(track.length));
        const rolled = event => {
            const control = event.target.closest?.('[data-rm-roll]');
            if (!control || !dice.contains(control))
                return;
            if (event.type === 'keydown' && (event.key !== 'Enter' && event.key !== ' ' || control.matches(NATIVE)))
                return;
            const before = dice.getAttribute('data-rm-picked');
            setTimeout(() => {
                const picked = dice.getAttribute('data-rm-picked');
                if (!picked || picked === before || !dice.isConnected)
                    return;
                const points = Number(picked);
                if (!Number.isInteger(points) || points < 1)
                    return;
                const current = Math.max(0, track.findIndex(input => input.checked));
                const next = track[(current + points) % track.length];
                next.checked = true;
                next.dispatchEvent(new Event('change', { bubbles: true }));
            }, 0);
        };
        dice.addEventListener('click', rolled, true);
        dice.addEventListener('keydown', rolled, true);
        count += 1;
    }
    return count;
}
