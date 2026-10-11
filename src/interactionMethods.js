// 交互方式词表与插件驱动写法。不是交互池：不按关键词指派，也不要求必须采用。
// 每面只随机提供 3 种插件驱动方式的写法（避开上一面提供过的），HTML/CSS 能直接实现的方式只给名称；
// 名称每次打乱顺序，避免模型总挑排在前面的那几个。
export const CSS_METHODS = Object.freeze(['折叠', '整幕切换', '翻面', '图层控制', '物件开合与变形', '连续滑动浏览', '组合解锁', '分支选择']);

export const DRIVER_METHODS = Object.freeze({
    popup: { names: ['弹窗'], how: 'button popovertarget 指向本面 div popover，内置 popovertargetaction="hide" 关闭钮，不预先展开' },
    toggle: { names: ['翻面', '开关切换'], how: 'data-rm-ui="toggle"，点 data-rm-toggle 部件（不写则点整个容器）切换容器的 [data-rm-on~="on"]，CSS 据此翻转，或用 data-rm-show="on"／"!on" 分出两面' },
    pick: { names: ['分支选择', '整幕切换'], how: 'data-rm-ui="pick"，各选项 data-rm-pick="键"，对应内容 data-rm-show="键"，选中项带 [data-rm-active]；容器写 data-rm-picked="键" 设初始项' },
    pager: { names: ['翻页阅读', '逐页推进'], how: 'data-rm-ui="pager"，每页 data-rm-page，data-rm-prev／data-rm-next 翻页（也可左右划），只显示当前页，容器带 [data-rm-index="页码"]' },
    roll: { names: ['随机抽取', '抽签掷骰'], how: 'data-rm-ui="roll"，每个结果 data-rm-show="键"，点 data-rm-roll 随机显示其中一个，不连着重复' },
    connect: { names: ['配对连线', '线索连接'], how: 'data-rm-ui="connect"，成对的两端 data-rm-end 写同一个键，先后点两端连上线，连上的带 [data-rm-paired]，全部连完容器带 [data-rm-done]' },
    turn: { names: ['旋转拨盘', '转盘对位'], how: 'data-rm-ui="turn"，转钮 data-rm-knob 可拖转也可点按，容器写 data-rm-stops="格数" 时按格停并带 [data-rm-index]，写 data-rm-answer="格号" 对准时带 [data-rm-match]' },
    sequence: { names: ['顺序解锁', '按序点亮'], how: 'data-rm-ui="sequence"，各键 data-rm-code="键"，容器 data-rm-answer="键1,键2,…"，按过的键带 [data-rm-done]，按对顺序容器带 [data-rm-match]，按错带 [data-rm-miss] 并重来' },
    input: { names: ['输入口令', '填写回应'], how: 'data-rm-ui="input" 内放文本框和 output（实时显示输入），容器写 data-rm-answer="答案" 时答对带 [data-rm-match]' },
    effect: { names: ['触发效果', '逐字显现', '盖章印记'], how: 'data-rm-ui="effect" 内 button data-rm-fire 触发 data-rm-part 的关键帧，每次从头播放' },
    drag: { names: ['拖动与组合', '投放收纳'], how: 'data-rm-ui="drag"，物件 data-rm-item="键"，可选同键 data-rm-slot 吸附槽，button data-rm-reset 复原' },
    adjust: { names: ['连续调节', '调光调色'], how: 'data-rm-ui="adjust" 内放 range，CSS 用 --rm-p(0～1) 连续改变主体' },
    reveal: { names: ['局部揭示', '刮擦揭开', '对照滑块'], how: 'data-rm-ui="reveal" 包住底图与 data-rm-cover 遮层，range 或横拖逐步揭开，data-rm-reset 复原' },
    view: { names: ['视野操作'], how: 'data-rm-ui="view" 内 data-rm-part 可滚动浏览，range(1～3) 连续缩放，data-rm-reset 还原' },
    draw: { names: ['手绘描画'], how: 'data-rm-ui="draw" 内 svg data-rm-canvas 供手指描画，button data-rm-reset 清除' },
    motion: { names: ['进程控制'], how: 'data-rm-ui="motion" 内 data-rm-part 保留真实动画，button data-rm-play 暂停继续，range 调进度' },
    hold: { names: ['临时预览'], how: 'data-rm-ui="hold" 的 button data-rm-hold，按住时容器和按钮都带 [data-rm-active="true"]，CSS 据此改变画面，或用 data-rm-show="active" 显示预览层' },
    follow: { names: ['跟随反馈'], how: 'data-rm-ui="follow" 内 data-rm-surface 为触摸区，CSS 用 --rm-x/--rm-y 定位光斑或线端' },
    reorder: { names: ['动态重排'], how: 'data-rm-ui="reorder"，同父层各项 data-rm-item，项内 button data-rm-prev/data-rm-next，data-rm-reset 复原' },
    accumulate: { names: ['累积改变'], how: 'data-rm-ui="accumulate" 内每项 button data-rm-step 切换 [data-rm-done="true"]，--rm-count 计数，data-rm-reset 撤回' },
});

// 真实用法 → 插件写法：按用法里的动作认它最贴近的那类写法。先认越专门的动作，一条用法只配一种写法。
// 用法里配不上的，写法照旧随机补齐。
const USAGE_DRIVER_RULES = Object.freeze([
    ['roll', /抽(?!出|屉|走)|掷|摇签|求签|洗牌|切牌|扭蛋|盲盒|十连|骰|投掷硬币|转盘|占卜|卦|随机/],
    ['connect', /连线|连起|连成|红线|配对|配成|牵线|穿针|串起|对照(?!.*(范围|金额|日期))|比对/],
    ['sequence', /密码|拨号|开锁|解锁屏幕|按顺序按|按\s?[A-Z]\s?键|按方向键|按重拨|按回车|口令|暗号|念咒|按下机关/],
    ['turn', /旋钮|拧(?!干)|拨动|转动|表冠|调频|上弦|上发条|调焦|调时间|对时|星盘|转经/],
    ['adjust', /推动(时间|季节)|昼夜|推移|调(温度|音量|亮|字号|整颜色|整数量|零|高|弹幕)|调整(字号|光线)|改变光线|让它长大|拉近|晃杯|拖动(推进|.*刻度|让|色带|倾斜|字号|看|加速|秒针|时间轴|选|织|滚动|翻转)/],
    ['hold', /长按|按住|捂住|遮住|屏住|对着光|透光|凑近|透视|探头/],
    ['reveal', /刮|揭开|揭起|揭晓|划过|哈气|掀(?!起盖头)|撕(?!成|毁)|擦(?!拭镜片)|拨开|显影|涂黑|被涂掉|划掉|抹|被盖住|割开/],
    ['draw', /画(符|圈|一|出|下|上)|^画|描|涂(?!改)|写字|签名|签上|手写|圈出|划线|落笔|上色|晕染|批注|写想法|在.*写|抄下/, /^(看|查看|点开|翻|调整|移开|展开|擦掉|读|对照|找到|收藏|播放|放大|点亮)/],
    ['input', /^(输入|打出|填|搜索(?!历史)|备注|改名|重命名|给它取名|取名|回复(?!可见)|评论|留言|写(评价|留言|短评|差评)|发(一条)?(段评|弹幕)|作答|念出|修改|引用|提一个问题|喊出|提交)/],
    ['motion', /播放|暂停|倍速|进度|快进|回放|倒放|循环|唱针|放映|运转|计时|沙漏|等待|等它|看它|等(云|潮)|读条/],
    ['view', /拖动视角|放大|缩放|双指|细节|大图|地图|街景|取景|望远|放大镜/],
    ['follow', /照亮|手电|追着光|探照|跟着|光斑|灯笼|光源|举灯/],
    ['reorder', /排序|排好|排开|排成|排列|重排|置顶|调换|按.*顺序|按时间线|按年份|按日期|交换位置/],
    ['drag', /拖|放进|放入|放回|放上|放置|塞|投进|移动|移到|摆|拼(起|上|好|成|合|单)|贴(上|到)|叠(放|好|起|上)|抽出|取出|拿起|拿出|推开|拉开|推回|倒入|倒出|装进|夹进|收进|挂(起|上|回)|插(进|入|上|回)|粘|递|捡起|拾起/],
    ['accumulate', /勾选|打勾|点赞|收集|集齐|盖(章|印|邮戳|纪念章|上)|按手印|打卡|签到|一件件|一针一针|记一笔|标记|收藏|计算|算分|加砝码|续杯|加料|加入|关注|打分|评分|打星|点喜欢|Kudos|投月票|加精|^加点|加一条|解锁(一|隐藏)/],
    ['toggle', /翻面|翻过来|翻转|翻牌|翻开(?!夹层|卷宗)|翻到.*背面|翻到画背面|开关|开灯|关灯|打开|合上|关上|开窗|拉窗帘|点亮|点燃|吹灭|展开|收起|对折|折(一下|起|好|回)|折痕|戴|取下|穿上|脱下|系(上|紧|好|回)|替对方系|扣上|解开|开机|关机|倒扣|倒转|倒过来|披上|卷起|拆开|撬开|剥开|掰|摊开|抖开|摘下/],
    ['pager', /翻页|翻到|翻回|翻看|翻开|下一(页|章|张|首|格|幕|条|版|个|集|步|站|题|篇|句)|跳过|上一(页|章|张|首|集)|左右滑|跳到|跳回|切歌|换台|切到|翻.*记录|翻阅|逐行|逐条阅读/],
    ['pick', /选|挑|切换|换(一|上)|筛选|分类|指认|投票|投出|只看|设为|模式|按热度|按销量|规格|口味|出示|指出|岔路|^同意|^驳回|存档|读档/],
    ['popup', /^点开|关掉弹窗|关闭键|菜单|详情|资料|主页|属性|提示|说明|目录|版规|小传|脚注|附录|索引|条款|搜索历史/],
    ['effect', /拍一拍|戳一戳|敲|摇|甩|吹|碰杯|按快门|按下|撞钟|鸣|响|弹出|发射|喂|浇|撒|投石|出拳|抛竿|抢答|拍打|投币|拉杆|拉动机关|挂断|鼓掌|举杯|戳|刷新|轻触/],
]);

export function driversForUsage(usage) {
    const text = String(usage || '');
    return USAGE_DRIVER_RULES.filter(([, pattern, exclude]) => pattern.test(text) && !exclude?.test(text)).map(([key]) => key);
}

// 给出写法与用法的对应：同一种写法只配一条用法，一条用法只配一种写法。
export function matchDriversToUsages(usages = [], allowed = null) {
    const pairs = [];
    const used = new Set();
    for (const usage of usages) {
        const key = driversForUsage(usage).find(item => !used.has(item) && (!allowed || allowed.includes(item)));
        if (!key) continue;
        used.add(key);
        pairs.push([key, usage]);
    }
    return pairs;
}

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
const SLIDE_DRIVERS = new Set(['adjust', 'drag', 'reveal', 'view', 'motion', 'turn']);
// 近期翻面、展开、切页用得多时，这几种（翻面、多选一、翻页）先不提供。
const FLIP_DRIVERS = new Set(['toggle', 'pick', 'pager']);

// usages：这一面抽到的真实用法。用法里认得出的动作先配上对应写法（滑杆／拖动一族仍只占一个位置），
// 其余位置随机补齐、避开上一面给过的；related 是这个媒介大类的全部用法，补位优先挑其中用得上的写法。
export function drawDriverOffer({ avoidSlide = false, avoidFlip = false, usages = [], related = [] } = {}) {
    let recent = [];
    try { recent = JSON.parse(globalThis.localStorage?.getItem(RECENT_KEY) || '[]'); } catch { recent = []; }
    const all = Object.keys(DRIVER_METHODS).filter(key => (!avoidSlide || !SLIDE_DRIVERS.has(key)) && (!avoidFlip || !FLIP_DRIVERS.has(key)));
    const matched = [];
    for (const [key] of matchDriversToUsages(usages, all)) {
        if (SLIDE_DRIVERS.has(key) && matched.some(item => SLIDE_DRIVERS.has(item))) continue;
        matched.push(key);
        if (matched.length >= OFFER_SIZE) break;
    }
    const hasSlide = matched.some(key => SLIDE_DRIVERS.has(key));
    const allRest = all.filter(key => !matched.includes(key) && !(hasSlide && SLIDE_DRIVERS.has(key)));
    // 补位先从这个媒介常用动作对应的写法里挑（够数时），不够再放开到全部。
    const near = new Set(related.flatMap(usage => driversForUsage(usage).slice(0, 1)));
    const nearRest = allRest.filter(key => near.has(key));
    const rest = nearRest.length >= OFFER_SIZE - matched.length ? nearRest : allRest;
    const fresh = rest.filter(key => !recent.includes(key));
    const need = OFFER_SIZE - matched.length;
    const pool = fresh.length >= need ? fresh : rest;
    // 滑杆／拖动这一族整体只占一个抽签位，抽中了再从族里随机挑一种。
    const slides = pool.filter(key => SLIDE_DRIVERS.has(key));
    const units = [...pool.filter(key => !SLIDE_DRIVERS.has(key)), ...(slides.length ? [''] : [])];
    const offer = [...matched, ...shuffled(units).slice(0, need).map(key => key || shuffled(slides)[0])];
    try { globalThis.localStorage?.setItem(RECENT_KEY, JSON.stringify(offer)); } catch { /* best effort */ }
    return Object.freeze(offer);
}

export function interactionMethodNames(offer) {
    const keys = normalizeDriverOffer(offer) || [];
    return shuffled([...new Set([...CSS_METHODS, ...keys.flatMap(key => DRIVER_METHODS[key].names)])]);
}

const SHOW_DRIVERS = new Set(['toggle', 'pick', 'roll', 'hold', 'pager', 'connect', 'turn', 'sequence']);

// usages 给出时，配上了用法的写法注明“用于「某用法」”，模型写到这个用法就照这个写法写。
export function driverContractLines(offer, usages = []) {
    const keys = normalizeDriverOffer(offer) || [];
    const pairs = new Map(matchDriversToUsages(usages, keys));
    const lines = keys.map(key => `    ${DRIVER_METHODS[key].names.join('、')}${pairs.has(key) ? `（用于「${pairs.get(key)}」）` : ''}：${DRIVER_METHODS[key].how}。`);
    // data-rm-show 是各类驱动共用的显隐写法，提供了用得上它的驱动时补一句。
    if (keys.some(key => SHOW_DRIVERS.has(key))) lines.push('    以上容器里 data-rm-show="键" 的内容在该状态时才显示（"!键" 相反）。');
    return lines;
}
