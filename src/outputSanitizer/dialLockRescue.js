// 密码箱：几列「拨动 ▴」按钮（多半是 <label for="d1_step">，对应的输入框连同脚本一起被拿掉了）、
// 每列一个只写着一位数字的转轮，旁边写着提示「七 · 三 · 九」，样式里写好了 [data-rm-status="unlocked"] .抽屉{display:block}。
// 脚本没了，按了不转、也永远开不了锁。这里只认很确定的结构：
// - 至少两列，每列恰好一个「拨动」控件（悬空的 label[for]，或没写任何动作的按钮）和一个只含一位数字的叶子元素；
// - 不在新交互驱动（data-rm-ui）里面；
// 按一下转一格（0→9 循环，写着 ▾／下／减 的往回转）。面上有一串和转轮一样多的数字（汉字或阿拉伯数字，用 · 、， 空格隔开）
// 就当密码；对上时，把样式里写了「解锁」值（unlocked/open/opened/solved/success/done/true）的那个状态属性改成这个值。

const BOUND_ATTR = 'data-rm-dial-lock';
const WHEEL_ATTR = 'data-rm-dial-wheel';
const OPEN_ATTR = 'data-rm-dial-open';
const BOUND = new WeakSet();
const CN = '零一二三四五六七八九';
const DIGIT = `[0-9${CN}]`;
const OPEN_WORD = /^(?:unlocked|unlock|open|opened|solved|success|succeeded|done|true|win|cleared|revealed)$/i;

function faceRules(root) {
    const rules = [];
    const walk = list => {
        for (const rule of list || []) {
            if (typeof rule.selectorText === 'string' && rule.style) rules.push(rule);
            else if (rule.cssRules) walk(rule.cssRules);
        }
    };
    for (const node of root.querySelectorAll('style')) { try { walk(node.sheet?.cssRules); } catch { /* 未解析 */ } }
    return rules;
}

function hasOwnAction(control) {
    if (control.tagName === 'LABEL') {
        const id = control.getAttribute('for');
        if (!id) return true;
        // 对应的输入框还在（面里或页面上）就不是悬空的，交给它自己。
        return Boolean(control.ownerDocument.getElementById(id) || control.querySelector('input, select, textarea'));
    }
    if (control.disabled || control.hasAttribute('popovertarget') || control.hasAttribute('commandfor')) return true;
    if (control.closest('a[href], form, label')) return true;
    if ([...control.attributes].some(attr => /^data-rm-(?!polish|press|dial)/.test(attr.name) || /^data-rabbit-mirror-.*(?:rescue|wired|fallback)/.test(attr.name))) return true;
    return /^(?:submit|reset)$/i.test(control.getAttribute('type') || '');
}

function digitLeaves(column) {
    return [...column.querySelectorAll('*')].filter(node => !node.children.length && /^\s*\d\s*$/.test(node.textContent || '') && !node.closest('label, button'));
}

function findColumns(root) {
    const columns = [];
    const seen = new Set();
    for (const control of root.querySelectorAll('label[for], button, [role="button"]')) {
        if (control.closest('[data-rm-ui]') || hasOwnAction(control)) continue;
        if (!/拨|转|旋|turn|spin|roll|[▴▾▲▼↑↓+＋−\-]/i.test(control.textContent || '')) continue;
        // 从控件往上找第一个恰好包着一个数字转轮的祖先当这一列。
        for (let column = control.parentElement; column && column !== root; column = column.parentElement) {
            const wheels = digitLeaves(column);
            if (!wheels.length) continue;
            if (wheels.length === 1) {
                if (!seen.has(column)) { seen.add(column); columns.push({ column, wheel: wheels[0], controls: [] }); }
                columns.find(item => item.column === column).controls.push(control);
            }
            break;
        }
    }
    // 一列只认一个拨动方向的控件以内（▴ 和 ▾ 各一个也行），再多就不是转轮了。
    return columns.filter(item => item.controls.length <= 2);
}

function toNumber(char) {
    const index = CN.indexOf(char);
    return index >= 0 ? index : Number(char);
}

function findCode(root, count, wheels) {
    const pattern = new RegExp(`(?:^|[^0-9${CN}])(${DIGIT}(?:\\s*[·・•,，、/\\-\\s]\\s*${DIGIT}){${count - 1}})(?![0-9${CN}])`);
    const texts = [];
    const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const parent = node.parentElement;
        if (!parent || wheels.some(wheel => wheel === parent) || parent.closest('[hidden], style, script, [data-rm-draw-frame]')) continue;
        texts.push(String(node.textContent || ''));
    }
    // 先看写着「提示／密码／密匙」的那段，再看全文。
    const ordered = [...texts.filter(text => /提示|密码|密匙|密钥|口令|code|hint/i.test(text)), ...texts];
    for (const text of ordered) {
        const match = text.match(pattern);
        if (match) return [...match[1].replace(/[^0-9零一二三四五六七八九]/g, '')].map(toNumber);
    }
    return null;
}

// 样式里写了 [属性="解锁值"] 的、面上又有元素当前是别的值：这就是锁。
function findLock(root) {
    for (const rule of faceRules(root)) {
        for (const piece of rule.selectorText.split(',')) {
            for (const match of piece.matchAll(/\[(data-(?!rabbit-|rm-(?:ui|on|done|active|count|index|picked)\b)[\w-]+)\s*=\s*["']?([\w-]+)["']?\s*\]/g)) {
                if (!OPEN_WORD.test(match[2])) continue;
                const carrier = [...root.querySelectorAll(`[${match[1]}]`)].find(node => node.getAttribute(match[1]) !== match[2] && !node.closest('[data-rm-ui]'));
                if (carrier) return { carrier, attr: match[1], value: match[2] };
            }
        }
    }
    return null;
}

function ensureStyle(doc) {
    if (doc.getElementById('rabbit-mirror-dial-lock-style')) return;
    const style = doc.createElement('style');
    style.id = 'rabbit-mirror-dial-lock-style';
    style.textContent = `[${BOUND_ATTR}] label[${WHEEL_ATTR}],[${BOUND_ATTR}] [${WHEEL_ATTR}]{cursor:pointer;user-select:none;-webkit-user-select:none;touch-action:manipulation;}`;
    (doc.head || doc.documentElement).append(style);
}

export function installDialLockRescue(root) {
    if (!root?.querySelectorAll || typeof document === 'undefined') return 0;
    const columns = findColumns(root);
    if (columns.length < 2 || columns.length > 8) return 0;
    const wheels = columns.map(item => item.wheel);
    const code = findCode(root, columns.length, wheels);
    const lock = code ? findLock(root) : null;
    ensureStyle(root.ownerDocument || document);
    root.setAttribute(BOUND_ATTR, `${columns.length}${code ? ':code' : ''}${lock ? ':lock' : ''}`);
    const check = () => {
        if (!code || !lock) return;
        const now = wheels.map(wheel => Number(String(wheel.textContent).trim()));
        if (now.every((value, index) => value === code[index])) {
            if (!lock.carrier.hasAttribute(OPEN_ATTR)) lock.carrier.setAttribute(OPEN_ATTR, lock.carrier.getAttribute(lock.attr) || '');
            lock.carrier.setAttribute(lock.attr, lock.value);
        }
    };
    for (const { wheel, controls } of columns) {
        for (const control of controls) {
            control.setAttribute(WHEEL_ATTR, '');
            if (BOUND.has(control)) continue;
            BOUND.add(control);
            if (control.tagName === 'LABEL') { control.setAttribute('role', 'button'); control.tabIndex = 0; }
            const back = /[▾▼↓−\-]|下|减|退/.test(control.textContent || '');
            const turn = event => {
                event.preventDefault();
                if (lock && lock.carrier.getAttribute(lock.attr) === lock.value) return;
                const value = Number(String(wheel.textContent).trim()) || 0;
                wheel.textContent = String((value + (back ? 9 : 1)) % 10);
                check();
            };
            control.addEventListener('click', turn);
            if (control.tagName === 'LABEL') control.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') turn(event); });
        }
    }
    // 存档里转轮已经对上了：打开时直接是开着的。
    check();
    return columns.length;
}
