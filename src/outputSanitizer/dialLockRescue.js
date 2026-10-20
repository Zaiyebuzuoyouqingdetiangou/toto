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
        if (!/拨|转|旋|\b(?:turn|spin|roll)\b|[▴▾▲▼↑↓+＋−\-]/i.test(control.textContent || '')) continue;
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
    // 连着写的「密码：739」「提示：七三九」：只认紧跟在提示字样后面、位数正好的那一串。
    const tight = new RegExp(`(?:提示|密码|密匙|密钥|口令|暗码|code|hint)[^0-9${CN}]{0,8}?(${DIGIT}{${count}})(?![0-9${CN}])`, 'i');
    for (const text of texts) {
        const match = text.match(tight);
        if (match) return [...match[1]].map(toNumber);
    }
    return null;
}

const TARGET_ATTR = 'data-rm-dial-target';
const LOCK_DEPTH = 4;
const WRONG_TEXT = /错|不对|再试|失败|重试|wrong|incorrect|try again/i;

// 几列转轮最近的共同祖先。
function lockScope(root, columns) {
    let scope = columns[0].column.parentElement;
    while (scope && scope !== root && !columns.every(item => scope.contains(item.column))) scope = scope.parentElement;
    return scope || root;
}

// 锁得是包着这几列转轮的元素，而且离转轮不远：面上别处的菜单、待办、手风琴写的 .open／.done 不算。
function nearScope(node, scope, root) {
    if (!node.contains(scope) || !root.contains(node) || node.closest('[data-rm-ui]')) return false;
    let depth = 0;
    for (let up = scope; up && up !== node; up = up.parentElement) depth += 1;
    return depth <= LOCK_DEPTH;
}

// 样式里写了 [属性="解锁值"]、包着转轮的元素当前又是别的值：这就是锁。
function findLock(root, scope) {
    for (const rule of faceRules(root)) {
        for (const piece of rule.selectorText.split(',')) {
            for (const match of piece.matchAll(/\[(data-(?!rabbit-|rm-(?:ui|on|done|active|count|index|picked)\b)[\w-]+)\s*=\s*["']?([\w-]+)["']?\s*\]/g)) {
                if (!OPEN_WORD.test(match[2])) continue;
                const carrier = [...root.querySelectorAll(`[${match[1]}]`)].find(node => node.getAttribute(match[1]) !== match[2] && nearScope(node, scope, root));
                if (carrier) return { carrier, attr: match[1], value: match[2] };
            }
        }
    }
    // 写成类的：.box.unlocked .抽屉{display:block}、.is-open .抽屉…：给那个元素挂上这个类。
    for (const rule of faceRules(root)) {
        for (const piece of rule.selectorText.split(',')) {
            for (const compound of piece.split(/\s*[\s>+~]\s*/)) {
                const names = (compound.match(/\.[\w-]+/g) || []).map(name => name.slice(1));
                const open = names.find(name => OPEN_WORD.test(name.replace(/^(?:is|has|state|rm)[-_]/i, '')));
                if (!open) continue;
                const bare = compound.replace(new RegExp(`\\.${open}(?![\\w-])`), '').replace(/:[\w-]+(?:\([^()]*\))?/g, '').trim();
                if (!bare) continue;
                let carrier = null;
                try { carrier = [...root.querySelectorAll(bare)].find(node => !node.classList.contains(open) && nearScope(node, scope, root)); } catch { carrier = null; }
                if (carrier) return { carrier, className: open };
            }
        }
    }
    return null;
}

// 样式里没写解锁状态，但转轮后面紧跟着一块藏起来的内容（暗格、信笺）：对上了就把它放出来。最多往外找两层。
function findHiddenReward(root, columns, scope) {
    const last = columns[columns.length - 1].column;
    let box = scope;
    for (let level = 0; box && level < 3; level += 1, box = box === root ? null : box.parentElement) {
        const hidden = [...box.children].find(node => (last.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING) && !node.contains(last)
            && !node.matches('style, script, template, [data-rm-ui]') && !node.querySelector('[data-rm-ui]')
            && (node.hidden || getComputedStyle(node).display === 'none')
            && String(node.textContent || '').trim().length >= 8 && !WRONG_TEXT.test(String(node.textContent || '').slice(0, 40)));
        if (hidden) return { reward: hidden };
    }
    return null;
}

// 上次认定过的锁（存档带回来的、或这次之前接管过的）：沿用，不再重新找，免得开过的锁之后又去「开」别的东西。
function savedLock(root) {
    const carrier = root.querySelector(`[${TARGET_ATTR}]`);
    if (!carrier) return undefined;
    const mark = carrier.getAttribute(TARGET_ATTR) || '';
    let match = mark.match(/^attr:(data-[\w-]+)=([\w-]+)$/);
    if (match) return { carrier, attr: match[1], value: match[2] };
    match = mark.match(/^class:([\w-]+)$/);
    if (match) return { carrier, className: match[1] };
    if (mark === 'reward') return { reward: carrier };
    return null;
}

function rememberLock(lock) {
    if (lock.attr) lock.carrier.setAttribute(TARGET_ATTR, `attr:${lock.attr}=${lock.value}`);
    else if (lock.className) lock.carrier.setAttribute(TARGET_ATTR, `class:${lock.className}`);
    else lock.reward.setAttribute(TARGET_ATTR, 'reward');
}

function isOpen(lock) {
    if (lock.attr) return lock.carrier.getAttribute(lock.attr) === lock.value;
    if (lock.className) return lock.carrier.classList.contains(lock.className);
    return lock.reward.hasAttribute(OPEN_ATTR);
}

function openLock(lock) {
    if (lock.attr) {
        if (!lock.carrier.hasAttribute(OPEN_ATTR)) lock.carrier.setAttribute(OPEN_ATTR, lock.carrier.getAttribute(lock.attr) || '');
        lock.carrier.setAttribute(lock.attr, lock.value);
    } else if (lock.className) {
        lock.carrier.classList.add(lock.className);
        lock.carrier.setAttribute(OPEN_ATTR, lock.className);
    } else {
        lock.reward.hidden = false;
        lock.reward.style.setProperty('display', 'block', 'important');
        lock.reward.setAttribute(OPEN_ATTR, 'reward');
    }
}

// 写了「开锁／确认」按钮的：转对了也要按它才开，按错了闪一下。只在锁这一块里找。
function findConfirm(lock, columns, scope) {
    const region = lock.carrier || lock.reward.parentElement || scope;
    return [...region.querySelectorAll('button, [role="button"]')].find(button => !columns.some(item => item.controls.includes(button))
        && !button.closest('[data-rm-ui]') && !hasOwnAction(button)
        && /^\s*(?:[^\s]{0,4})?(?:开锁|解锁|开启|打开|开箱|确认|验证|提交|unlock|open|submit|confirm)/i.test(button.textContent || '')) || null;
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
    // 没有密码的不是密码锁（多半是数量加减），不接。
    if (!code) return 0;
    const scope = lockScope(root, columns);
    let lock = savedLock(root);
    if (lock === undefined) {
        lock = findLock(root, scope) || findHiddenReward(root, columns, scope);
        if (lock) rememberLock(lock);
    }
    const confirm = lock ? findConfirm(lock, columns, scope) : null;
    ensureStyle(root.ownerDocument || document);
    root.setAttribute(BOUND_ATTR, `${columns.length}:code${lock ? ':lock' : ''}${confirm ? ':confirm' : ''}`);
    const matches = () => wheels.every((wheel, index) => Number(String(wheel.textContent).trim()) === code[index]);
    const check = () => { if (lock && matches()) openLock(lock); };
    for (const { wheel, controls } of columns) {
        for (const control of controls) {
            control.setAttribute(WHEEL_ATTR, '');
            if (BOUND.has(control)) continue;
            BOUND.add(control);
            if (control.tagName === 'LABEL') { control.setAttribute('role', 'button'); control.tabIndex = 0; }
            const back = /[▾▼↓−\-]|下|减|退/.test(control.textContent || '');
            const turn = event => {
                event.preventDefault();
                if (lock && isOpen(lock)) return;
                const value = Number(String(wheel.textContent).trim()) || 0;
                wheel.textContent = String((value + (back ? 9 : 1)) % 10);
                if (!confirm) check();
            };
            control.addEventListener('click', turn);
            if (control.tagName === 'LABEL') control.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') turn(event); });
        }
    }
    if (confirm && !BOUND.has(confirm)) {
        BOUND.add(confirm);
        confirm.setAttribute(WHEEL_ATTR, 'confirm');
        confirm.addEventListener('click', event => {
            event.preventDefault();
            if (matches()) { openLock(lock); return; }
            for (const wheel of wheels) {
                wheel.style.setProperty('outline', '2px solid #c0392b');
                setTimeout(() => wheel.style.removeProperty('outline'), 600);
            }
        });
    }
    // 存档里转轮已经对上了：打开时直接是开着的（要按确认的，存档时已经按过才会是开着的状态，这里不替它按）。
    if (!confirm) check();
    return columns.length;
}
