import { normalizeShowToken } from './behaviorResults.js?rmv=1.83.0';
// 大富翁、飞行棋、走格子：一个掷骰子的区域（data-rm-ui="roll"，结果键是 1、2、3… 这样的点数），
// 旁边一排表示「棋子在第几格」的单选（每格一个，样式里按 #格:checked 把棋子画在那一格）。
// 模型把这两样写成了互不相干的：掷出几点，棋子不动。这里把它们接上：掷出 N 点，棋子往前走 N 格（走过终点从头接着走）。
// 只认很确定的：骰子结果键全是 1～12 的整数；这一面里恰好有一组像棋盘的单选——
// 不在任何机关区域里、大部分格子在样式里有自己的「#id:checked」、格子比骰子最大点数多，
// 而且名字／类名／id 看得出是格子位置（pos、cell、step、格、棋…），或者有 8 格以上（页签很少这么多）。

const BOUND_ATTR = 'data-rm-dice-track';
const BOUND = new WeakSet();
const TRACK_HINT = /pos|cell|step|square|tile|track|board|path|grid|slot|格|棋|位|步|盘/i;
// 驱动不接管键盘的原生元素（它们自己会发 click）：键盘这边也不管。
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
        if (dice.contains(input) || input.closest('[data-rm-ui]')) continue;
        const name = input.getAttribute('name');
        if (!groups.has(name)) groups.set(name, []);
        groups.get(name).push(input);
    }
    const css = faceStyleText(root);
    const tracks = [...groups.entries()].filter(([name, inputs]) => {
        if (inputs.length < 4 || inputs.length <= maxPoint) return false;
        const styled = inputs.filter(input => input.id && ownCheckedRule(css, input.id)).length;
        if (styled < Math.ceil(inputs.length / 2)) return false;
        const words = [name, ...inputs.flatMap(input => [input.id, input.className])].join(' ');
        return TRACK_HINT.test(words) || inputs.length >= 8;
    }).map(([, inputs]) => inputs);
    return tracks.length === 1 ? tracks[0] : null;
}

export function installDiceTrackRescue(root) {
    if (!root?.querySelectorAll) return 0;
    let count = 0;
    for (const dice of root.querySelectorAll('[data-rm-ui="roll"]')) {
        if (BOUND.has(dice)) continue;
        const keys = [...dice.querySelectorAll('[data-rm-show]')].map(node => normalizeShowToken(String(node.getAttribute('data-rm-show') || '').trim()));
        if (keys.length < 2 || !keys.every(key => /^(?:[1-9]|1[0-2])$/.test(key))) continue;
        const track = radioTrack(root, dice, Math.max(...keys.map(Number)));
        if (!track) continue;
        BOUND.add(dice);
        dice.setAttribute(BOUND_ATTR, String(track.length));
        // 只在这一下真的掷出了新点数时走：驱动没接管、点了没换点数，都不走。驱动掷骰子不会连着掷出同一个数。
        const rolled = event => {
            const control = event.target.closest?.('[data-rm-roll]');
            if (!control || !dice.contains(control)) return;
            if (event.type === 'keydown' && (event.key !== 'Enter' && event.key !== ' ' || control.matches(NATIVE))) return;
            const before = dice.getAttribute('data-rm-picked');
            setTimeout(() => {
                const picked = dice.getAttribute('data-rm-picked');
                if (!picked || picked === before || !dice.isConnected) return;
                const points = Number(picked);
                if (!Number.isInteger(points) || points < 1) return;
                const current = Math.max(0, track.findIndex(input => input.checked));
                const next = track[(current + points) % track.length];
                next.checked = true;
                next.dispatchEvent(new Event('change', { bubbles: true }));
            }, 0);
        };
        // 捕获阶段记下掷之前的点数（驱动在冒泡阶段换点数）。
        dice.addEventListener('click', rolled, true);
        dice.addEventListener('keydown', rolled, true);
        count += 1;
    }
    return count;
}
