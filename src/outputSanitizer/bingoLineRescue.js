import { rmT as __rmT, rmR as __rmR } from "../textTable.js?rmv=1.99.8";
const BOARD_ATTR = 'data-rm-bingo-board';
const LINE_ATTR = 'data-rm-bingo-line';
const SEAL_ATTR = 'data-rm-bingo-seal';
const STYLE_ID = 'rabbit-mirror-bingo-line-style';
const BOUND = new WeakSet();
function ensureStyle() {
    if (typeof document === 'undefined' || document.getElementById(STYLE_ID))
        return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
[${BOARD_ATTR}] [${LINE_ATTR}="true"]{box-shadow:0 0 0 2px rgba(178,40,32,.78),0 0 10px rgba(178,40,32,.28)!important;}
[${SEAL_ATTR}]{position:absolute!important;left:50%!important;top:50%!important;z-index:2147483000!important;pointer-events:none!important;
 padding:6px 14px!important;border:3px double rgba(178,40,32,.92)!important;border-radius:8px!important;background:rgba(255,250,244,.82)!important;
 color:rgba(178,40,32,.95)!important;font:800 20px/1.2 serif!important;letter-spacing:4px!important;white-space:nowrap!important;
 transform:translate(-50%,-50%) rotate(-10deg) scale(1)!important;opacity:0;animation:rm-bingo-seal 2.4s ease forwards!important;}
@keyframes rm-bingo-seal{0%{opacity:0;transform:translate(-50%,-50%) rotate(-10deg) scale(1.8)}14%{opacity:1;transform:translate(-50%,-50%) rotate(-10deg) scale(.94)}
 22%{transform:translate(-50%,-50%) rotate(-10deg) scale(1)}72%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) rotate(-10deg) scale(1)}}
@media (prefers-reduced-motion: reduce){[${SEAL_ATTR}]{animation-duration:.01s!important;animation-delay:1.6s!important;opacity:1}}`;
    (document.head || document.documentElement).append(style);
}
function columnCount(board) {
    let text = '';
    try {
        text = String(getComputedStyle(board).gridTemplateColumns || '');
    }
    catch {
        return 0;
    }
    if (!text || text === 'none')
        return 0;
    const repeat = text.match(/^\s*repeat\(\s*(\d+)\s*,/);
    if (repeat)
        return Number(repeat[1]);
    let depth = 0, count = 0, inToken = false;
    for (const char of text) {
        if (char === '(')
            depth++;
        else if (char === ')')
            depth--;
        if (depth === 0 && /\s/.test(char)) {
            inToken = false;
            continue;
        }
        if (!inToken && depth >= 0) {
            count++;
            inToken = true;
        }
    }
    return count;
}
function boardInputs(board) {
    const cells = [...board.children].filter(node => !node.matches(`style, script, template, [${SEAL_ATTR}]`));
    const size = Math.round(Math.sqrt(cells.length));
    if (size < 3 || size > 5 || size * size !== cells.length)
        return null;
    if (columnCount(board) !== size)
        return null;
    if (board.querySelector('input[type="radio"], [data-rm-ui]') || board.closest('[data-rm-ui]'))
        return null;
    const inputs = [];
    for (const cell of cells) {
        const boxes = cell.matches('input[type="checkbox"]') ? [cell] : [...cell.querySelectorAll('input[type="checkbox"]')];
        if (boxes.length !== 1)
            return null;
        inputs.push(boxes[0]);
    }
    return { size, cells, inputs };
}
function linesOf(size) {
    const lines = [];
    for (let r = 0; r < size; r++)
        lines.push(Array.from({ length: size }, (_, c) => r * size + c));
    for (let c = 0; c < size; c++)
        lines.push(Array.from({ length: size }, (_, r) => r * size + c));
    lines.push(Array.from({ length: size }, (_, i) => i * size + i));
    lines.push(Array.from({ length: size }, (_, i) => i * size + (size - 1 - i)));
    return lines;
}
function refresh(board, grid, announce) {
    const done = linesOf(grid.size).filter(line => line.every(index => grid.inputs[index].checked));
    const inLine = new Set(done.flat());
    grid.cells.forEach((cell, index) => {
        if (inLine.has(index))
            cell.setAttribute(LINE_ATTR, 'true');
        else
            cell.removeAttribute(LINE_ATTR);
    });
    const before = Number(board.getAttribute('data-rm-bingo-lines') || 0);
    if (done.length) {
        board.setAttribute('data-rm-bingo', 'true');
        board.setAttribute('data-rm-bingo-lines', String(done.length));
    }
    else {
        board.removeAttribute('data-rm-bingo');
        board.removeAttribute('data-rm-bingo-lines');
    }
    board.querySelectorAll(`:scope > [${SEAL_ATTR}]`).forEach(node => { if (!done.length)
        node.remove(); });
    if (!announce || done.length <= before)
        return;
    board.querySelectorAll(`:scope > [${SEAL_ATTR}]`).forEach(node => node.remove());
    const seal = document.createElement('span');
    seal.setAttribute(SEAL_ATTR, 'true');
    seal.setAttribute('aria-hidden', 'true');
    seal.textContent = `${__rmT("CU2YLf")}${__rmT("W.vzUsuLiQ8kxC_xMxwNUD1TtET")[done.length - 1] || done.length}${__rmT("8L8")}`;
    seal.addEventListener('animationend', () => seal.remove(), { once: true });
    setTimeout(() => seal.remove(), 4000);
    board.append(seal);
}
const BINGO_WORDS = __rmR(".4tacB7fLGnkJTV2B4_VRfWuvQqUMfy9KXL0af.rOrHgjYtlaFlM14Sf60DCFuj9lWtVVL8AQEzqVf", "i");
function looksLikeBingo(root) {
    if (BINGO_WORDS.test(String(root.textContent || '')))
        return true;
    return [...root.querySelectorAll('[class]')].some(node => /bingo/i.test(String(node.getAttribute('class') || '')));
}
export function installBingoLineRescue(root) {
    if (!root?.querySelectorAll || typeof getComputedStyle !== 'function')
        return 0;
    if (!root.querySelector('input[type="checkbox"]') || !looksLikeBingo(root))
        return 0;
    let count = 0;
    const boards = new Set([...root.querySelectorAll('input[type="checkbox"]')].map(input => {
        let node = input.parentElement;
        for (let depth = 0; node && node !== root && depth < 3; depth++, node = node.parentElement) {
            if (node.parentElement && node.parentElement !== root) {
                const parent = node.parentElement;
                let display = '';
                try {
                    display = getComputedStyle(parent).display;
                }
                catch { }
                if (/grid/.test(display))
                    return parent;
            }
        }
        return null;
    }).filter(Boolean));
    for (const board of boards) {
        const grid = boardInputs(board);
        if (!grid)
            continue;
        ensureStyle();
        board.setAttribute(BOARD_ATTR, String(grid.size));
        try {
            if (getComputedStyle(board).position === 'static')
                board.style.position = 'relative';
        }
        catch { }
        refresh(board, grid, false);
        count++;
        if (BOUND.has(board))
            continue;
        BOUND.add(board);
        const later = () => setTimeout(() => { const current = boardInputs(board); if (current)
            refresh(board, current, true); }, 0);
        board.addEventListener('change', later);
        board.addEventListener('click', () => setTimeout(later, 80));
    }
    return count;
}
