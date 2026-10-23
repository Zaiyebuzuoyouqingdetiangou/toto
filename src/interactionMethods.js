// 交互方式词表与插件驱动写法。不是交互池：不按关键词指派，也不要求必须采用。
// 每面只随机提供 3 种插件驱动方式的写法（避开上一面提供过的），HTML/CSS 能直接实现的方式只给名称；
// 名称每次打乱顺序，避免模型总挑排在前面的那几个。
export const CSS_METHODS = Object.freeze(['折叠', '整幕切换', '翻面', '图层控制', '物件开合与变形', '连续滑动浏览', '组合解锁', '分支选择']);

export const DRIVER_METHODS = Object.freeze({
    popup: { names: ['弹窗'], how: 'button popovertarget 指向本面 div popover，内置 popovertargetaction="hide" 关闭钮，不预先展开' },
    toggle: { names: ['翻面', '开关切换'], how: 'data-rm-ui="toggle"，点 data-rm-toggle 部件（不写则点整个容器）切换容器的 [data-rm-on~="on"]，CSS 据此翻转，或用 data-rm-show="on"／"!on" 分出两面' },
    pick: { names: ['分支选择', '整幕切换'], how: 'data-rm-ui="pick"，各选项 data-rm-pick="键"，对应内容 data-rm-show="键"，选中项带 [data-rm-active]；容器写 data-rm-picked="键" 设初始项' },
    pager: { names: ['翻页阅读', '逐页推进'], how: 'data-rm-ui="pager"，每页 data-rm-page，data-rm-prev／data-rm-next 翻页（也可左右划；乙女游戏式对话框可把整个对话框写成 data-rm-next，点一下出下一句），只显示当前页，容器带 [data-rm-index="页码"]' },
    roll: { names: ['随机抽取', '抽签掷骰'], how: 'data-rm-ui="roll"，每个结果 data-rm-show="键"，点 data-rm-roll 随机显示其中一个，不连着重复' },
    connect: { names: ['配对连线', '线索连接'], how: 'data-rm-ui="connect"，成对的两端 data-rm-end 写同一个键，先后点两端连上线，连上的带 [data-rm-paired]，全部连完容器带 [data-rm-done]' },
    turn: { names: ['旋转拨盘', '转盘对位'], how: 'data-rm-ui="turn"，转钮 data-rm-knob 可拖转也可点按，容器写 data-rm-stops="格数" 时按格停并带 [data-rm-index]，写 data-rm-answer="格号" 对准时带 [data-rm-match]，停在第几格（从 0 数）时 data-rm-show="格号" 的内容出现' },
    sequence: { names: ['顺序解锁', '按序点亮'], how: 'data-rm-ui="sequence"，各键 data-rm-code="键"，容器 data-rm-answer="键1,键2,…"，按过的键带 [data-rm-done]，按对顺序容器带 [data-rm-match]，按错带 [data-rm-miss] 并重来' },
    input: { names: ['输入口令', '填写回应'], how: 'data-rm-ui="input" 内放文本框和 output（实时显示输入），容器写 data-rm-answer="答案" 时答对带 [data-rm-match]' },
    effect: { names: ['触发效果', '逐字显现', '盖章印记'], how: 'data-rm-ui="effect" 内 button data-rm-fire 触发 data-rm-part 的关键帧，每次从头播放，按过后 data-rm-show="changed" 的内容出现' },
    drag: { names: ['拖动与组合', '投放收纳'], how: 'data-rm-ui="drag"，物件 data-rm-item="键"，可选同键 data-rm-slot 吸附槽，button data-rm-reset 复原' },
    adjust: { names: ['连续调节', '调光调色'], how: 'data-rm-ui="adjust" 内放 range，CSS 用 --rm-p(0～1) 连续改变主体' },
    reveal: { names: ['局部揭示', '刮擦揭开', '对照滑块'], how: 'data-rm-ui="reveal" 包住底图与 data-rm-cover 遮层，range（从最左开始）或横拖逐步揭开，揭到底时 data-rm-show="done" 的内容出现，data-rm-reset 复原；data-rm-cover 写在盖住内容的那层上，不写在 range 上' },
    view: { names: ['视野操作'], how: 'data-rm-ui="view" 内 data-rm-part 可滚动浏览，range(1～3) 连续缩放，data-rm-reset 还原' },
    draw: { names: ['手绘描画'], how: 'data-rm-ui="draw" 内 svg data-rm-canvas 供手指描画，button data-rm-reset 清除' },
    motion: { names: ['进程控制'], how: 'data-rm-ui="motion" 内 data-rm-part 要有 @keyframes 动画（只写静态样式时没东西可播），button data-rm-play 暂停继续，range 调进度' },
    hold: { names: ['临时预览'], how: 'data-rm-ui="hold" 的 button data-rm-hold，按住时容器和按钮都带 [data-rm-active="true"]，CSS 据此改变画面，或用 data-rm-show="active" 显示预览层' },
    follow: { names: ['跟随反馈'], how: 'data-rm-ui="follow" 内 data-rm-surface 为触摸区，CSS 用 --rm-x/--rm-y 定位光斑或线端' },
    reorder: { names: ['动态重排'], how: 'data-rm-ui="reorder"，同父层各项 data-rm-item，项内 button data-rm-prev/data-rm-next，data-rm-reset 复原' },
    accumulate: { names: ['累积改变'], how: 'data-rm-ui="accumulate" 内每项 button data-rm-step 切换 [data-rm-done="true"]，--rm-count 计数，data-rm-reset 撤回' },
    slide: { names: ['横滑浏览', '滚动推进'], how: 'data-rm-ui="slide" 容器里放一排 data-rm-item="键"（包在一个 data-rm-track 里横向滚动；纵向写 data-rm-axis="y"），说明文字放排外面；滑到哪张容器带 [data-rm-index="序号"]，看过的带 [data-rm-seen]，全看过容器带 [data-rm-done]；data-rm-prev／data-rm-next 可选' },
    timer: { names: ['倒计时', '延时显现', '等待'], how: 'data-rm-ui="timer" data-rm-duration="秒数" 一出现就开始走，--rm-p(0～1)、--rm-seconds 剩余秒，到点容器带 [data-rm-done]；里面写 data-rm-at="秒" 的元素到时带 [data-rm-done]，data-rm-clock 元素显示剩余时间，button data-rm-play 暂停继续，写 data-rm-manual 则按了才开始' },
    swipe: { names: ['左右一甩', '划走抉择'], how: 'data-rm-ui="swipe" 内叠放几张 data-rm-card="键"（CSS 绝对定位叠起来），最上面那张左划或右划甩出去并带 [data-rm-swiped="left|right"]，容器记 data-rm-swiped-left／data-rm-swiped-right="键…"，全甩完带 [data-rm-done]；button data-rm-left／data-rm-right 代替手势；data-rm-show="键:left"／"键:right" 显示对应结果' },
    rhythm: { names: ['按住充能', '连点冲刺', '限时反应'], how: 'data-rm-ui="rhythm" 三选一：button data-rm-charge 按住充能（data-rm-duration="秒" 充满，--rm-p 进度，充满带 [data-rm-done]）；button data-rm-tap 连点（data-rm-count="次数" data-rm-window="秒" 窗口内点够带 [data-rm-done]，--rm-count 当前次数）；button data-rm-qte 限时反应（--rm-qte 在 0～1 来回摆，按在 data-rm-zone="0.4-0.6" 区间带 [data-rm-match]，否则短暂 [data-rm-miss]）' },
    peek: { names: ['悬停窥视', '凑近细看'], how: 'data-rm-ui="peek" 内 data-rm-peek="键" 的元素，鼠标悬停时显示、手机点按钉住，对应内容 data-rm-show="键"，容器带 [data-rm-peeking="键"]' },
    spoiler: { names: ['剧透遮蔽', '涂黑揭字'], how: 'data-rm-ui="spoiler" 内 span data-rm-spoiler 默认涂成同色黑条，点一下显出来并带 [data-rm-revealed="true"]，全部揭开容器带 [data-rm-done]；data-rm-spoiler="键" 可配 data-rm-show="键"' },
    sense: { names: ['环境感应', '横屏彩蛋'], how: 'data-rm-ui="sense" 容器自动带 [data-rm-orientation="landscape|portrait"] [data-rm-scheme="dark|light"] [data-rm-width="narrow|wide"] [data-rm-pointer="touch|mouse"]，CSS 据此变，或 data-rm-show="landscape"／"dark" 等只在那种环境显示' },
    carry: { names: ['跨面继承', '记住选择'], how: '任一开关／选择／翻页／横滑／累积容器加 data-rm-memory="名"，这个聊天里它的状态会记下来，后面的面同名容器打开时恢复（甩卡、遮蔽的容器只记结果、不恢复画面）；别的容器写 data-rm-recall="名" 后，可用 data-rm-show="那边的键" 或 "remembered" 显示另一面记下的结果' },
});

// 真实用法 → 插件写法：按用法里的动作认它最贴近的那类写法。先认越专门的动作，一条用法只配一种写法。
// 用法里配不上的，写法照旧随机补齐。
const USAGE_DRIVER_RULES = Object.freeze([
    ['roll', /抽(?!出|屉|走)|掷|摇签|求签|洗牌|切牌|扭蛋|盲盒|十连|骰|投掷硬币|转盘|占卜|卦|随机/],
    ['connect', /连线|连起|连成|红线|配对|配成|牵线|穿针|串起|对照(?!.*(范围|金额|日期))|比对/],
    ['sequence', /密码|拨号|开锁|解锁屏幕|按顺序按|按\s?[A-Z]\s?键|按方向键|按重拨|按回车|口令|暗号|念咒|按下机关/],
    ['swipe', /左[划滑](不要|淘汰|拒绝|丢|跳过)|右[划滑](喜欢|收下|通过|留)|划走|甩(出|走|掉|开)|扔掉|丢掉|划到一边|滑走|甩卡|左右一甩/],
    ['rhythm', /连点|连按|快速点|狂点|蓄力|充能|按住.*秒|按准|时机|节拍|按下的瞬间|QTE|接住|按停/i],
    ['peek', /悬停|移上去|鼠标停|瞄一眼|窥|停在上面|hover/i],
    ['spoiler', /剧透|涂黑|黑条|遮住的字|划选|选中文字|揭字|遮蔽/],
    ['sense', /横屏|竖屏|转过手机|转个方向|深色模式下|夜间模式下|浅色模式下|跟着系统|放大窗口|窄屏|宽屏/],
    ['carry', /记住(我|这个|上次)|沿用上次|继承|上一面|带到下一面|存下来|下一面|延续到|记在心里/],
    ['slide', /横滑|横向滑|左右滑|滑动浏览|(?<!拖动)滚动|划到下一|往下滑|往下滚|滚到|一屏一屏|轮播/],
    ['turn', /旋钮|拧(?!干)|拨动|转动|扭(?!蛋)|调到|表冠|调频|上弦|上发条|调焦|调时间|对时|星盘|转经/],
    ['adjust', /推动(时间|季节)|昼夜|推移|调(温度|音量|亮|字号|整颜色|整数量|零|高|弹幕)|调整(字号|光线)|改变光线|让它长大|拉近|晃杯|拖动(推进|.*刻度|让|色带|倾斜|字号|看|加速|秒针|时间轴|选|织|滚动|翻转)/],
    ['hold', /长按|按住|捂住|遮住|屏住|对着光|透光|凑近|透视|探头/],
    ['timer', /倒计时|等.*秒|过一会|慢慢显|等它.*(来|亮|开)|(?<!翻转)沙漏|计时|到点|等待|等天亮|等潮水|定时/],
    ['reveal', /刮|揭开|揭起|揭晓|划过|哈气|掀(?!起盖头)|撕(?!成|毁)|擦(?!拭镜片)|拨开|显影|涂黑|被涂掉|划掉|抹|被盖住|割开/],
    ['draw', /画(符|圈|一|出|下|上)|^画|描|涂(?!改)|写字|签名|签上|手写|圈出|划线|落笔|上色|晕染|批注|写想法|在.*写|抄下/, /^(看|查看|点开|翻|调整|移开|展开|擦掉|读|对照|找到|收藏|播放|放大|点亮)/],
    ['input', /^(输入|打出|填|搜索(?!历史)|备注|改名|重命名|给它取名|取名|回复(?!可见)|评论|留言|写(评价|留言|短评|差评)|发(一条)?(段评|弹幕)|作答|念出|修改|引用|提一个问题|喊出|提交|写一(条|个|句)|发一条评论|写.*问题)/],
    // 进程控制只给「拖进度、快进、倍速」这类真要拨时间的用法；单纯播放／暂停／回放用开关写更稳（见下面 toggle）。
    ['motion', /进度|倍速|快进|倒放|读条|拖动时间轴/],
    ['view', /拖动视角|放大|缩放|双指|细节|大图|地图|街景|取景|望远|放大镜/],
    ['follow', /照亮|手电|追着光|探照|跟着|光斑|灯笼|光源|举灯/],
    ['reorder', /排序|排好|排开|排成|排列|重排|置顶|调换|按.*顺序|按时间线|按年份|按日期|交换位置/],
    ['drag', /拖|放进|放入|放回|放上|放置|放下一|移开|塞|投进|移动|移到|摆|拼(起|上|好|成|合|单)|贴(上|到)|叠(放|好|起|上)|抽出|取出|拿起|拿出|推开|拉开|推回|倒入|倒出|装进|夹进|收进|挂(起|上|回)|插(进|入|上|回)|粘|递|捡起|拾起/, /播放|回放|放映/],
    ['accumulate', /勾选|打勾|勾(掉|上)|送礼物|投(一|心动)票|下注|买下|收过路费|点有用|点出|播种|施肥|点赞|收集|集齐|盖(章|印|邮戳|纪念章|上)|按手印|打卡|签到|一件件|一针一针|记一笔|标记|收藏|计算|算分|加砝码|续杯|加料|加入|关注|打分|评分|打星|点喜欢|Kudos|投月票|加精|^加点|加一条|解锁(一|隐藏)/],
    ['toggle', /播放|暂停|回放|放映|唱针|(?<!查看.{0,6})(?:删除|撤回)|恢复默认|确认收货|申请售后|保存|卸下|挖开|翻面|翻过来|翻转|翻牌|翻开(?!夹层|卷宗)|翻到.*背面|翻到画背面|开关|开灯|关灯|打开|合上|关上|开窗|拉窗帘|点亮|点燃|吹灭|展开|收起|对折|折(一下|起|好|回)|折痕|戴|取下|穿上|脱下|系(上|紧|好|回)|替对方系|扣上|解开|开机|关机|倒扣|倒转|倒过来|披上|卷起|拆开|撬开|剥开|掰|摊开|抖开|摘下/],
    ['pager', /翻页|翻到|翻回|翻看|翻开|走一步|退回上一|下一(页|章|张|首|格|幕|条|版|个|集|步|站|题|篇|句)|跳过|上一(页|章|张|首|集)|左右滑|跳到|跳回|切歌|换台|切到|翻.*记录|翻阅|逐行|逐条阅读/],
    ['pick', /选|挑|切换|换(一|上|地|墙)|安排|投凶|上一层|剪短|筛选|分类|指认|投票|投出|只看|设为|模式|按热度|按销量|规格|口味|出示|指出|岔路|^同意|^驳回|存档|读档/],
    ['popup', /^点开|^查看|关掉弹窗|关闭键|菜单|详情|资料|主页|属性|提示|说明|目录|版规|小传|脚注|附录|索引|条款|搜索历史/],
    ['effect', /拍一拍|戳一戳|敲|摇|甩|吹|碰杯|按快门|按下|撞钟|鸣|响|弹出|发射|喂|浇|撒|投石|出拳|抛竿|抢答|拍打|投币|拉杆|拉动机关|挂断|鼓掌|举杯|戳|刷新|轻触|再来一(次|局)|消除|用掉|突破|打坐|切菜|下锅|加一勺|摸摸|收线|触发|倒计时|和它玩|大声读|分享/],
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
const SLIDE_DRIVERS = new Set(['adjust', 'drag', 'reveal', 'view', 'motion', 'turn', 'swipe', 'slide']);
// 近期翻面、展开、切页用得多时，这几种（翻面、多选一、翻页）先不提供。
const FLIP_DRIVERS = new Set(['toggle', 'pick', 'pager']);
// 近期一排按钮切换内容（标签页、分页按钮）用得多时，多选一和翻页这两种先不提供。
const TAB_DRIVERS = new Set(['pick', 'pager']);

// 交互大分类：同一类本质上是同一种操作，只是写法不同。每面给的 3 种写法各来自不同大类，
// 一类最多出一种；随机补位按大类抽（每类机会相同），抽中了再从类里挑一种写法。
export const DRIVER_FAMILIES = Object.freeze({
    drag: { label: '拖动', drivers: ['adjust', 'reveal', 'motion', 'turn', 'drag', 'view', 'follow', 'draw', 'reorder'] },
    scroll: { label: '滚动', drivers: ['slide'] },
    time: { label: '时间', drivers: ['timer'] },
    swipe: { label: '滑动手势', drivers: ['swipe'] },
    rhythm: { label: '节奏连击', drivers: ['rhythm'] },
    peek: { label: '悬停窥视', drivers: ['peek'] },
    spoiler: { label: '文字遮蔽', drivers: ['spoiler'] },
    sense: { label: '环境感应', drivers: ['sense'] },
    carry: { label: '跨面继承', drivers: ['carry'] },
    page: { label: '翻页', drivers: ['pager'] },
    choose: { label: '选择切换', drivers: ['pick'] },
    fold: { label: '折叠开合', drivers: ['toggle'] },
    popup: { label: '弹窗', drivers: ['popup'] },
    hold: { label: '按住', drivers: ['hold'] },
    fire: { label: '触发效果', drivers: ['effect'] },
    collect: { label: '收集累积', drivers: ['accumulate'] },
    puzzle: { label: '解谜对位', drivers: ['sequence', 'connect'] },
    input: { label: '输入', drivers: ['input'] },
    random: { label: '随机抽取', drivers: ['roll'] },
});
export function driverFamilyOf(key) {
    return Object.keys(DRIVER_FAMILIES).find(family => DRIVER_FAMILIES[family].drivers.includes(key)) || key;
}

// usages：这一面抽到的真实用法（展现形式自己的玩法优先）。用法里认得出的动作先配上对应写法，一个大类只配一种；
// 其余位置按大类随机补齐、避开上一面给过的；related 是这个媒介大类的全部用法，同一大类里优先挑其中用得上的写法。
// 「开关切换＋弹窗」是最省事的一对，模型拿到就凑成「一个切换按钮＋几个点开的小框」。
const SWITCH_POPUP_DRIVERS = new Set(['toggle', 'popup']);
export function drawDriverOffer({ avoidSlide = false, avoidFlip = false, avoidTabs = false, avoidSwitchPopup = false, usages = [], related = [] } = {}) {
    let recent = [];
    try { recent = JSON.parse(globalThis.localStorage?.getItem(RECENT_KEY) || '[]'); } catch { recent = []; }
    const all = Object.keys(DRIVER_METHODS).filter(key => (!avoidSlide || !SLIDE_DRIVERS.has(key)) && (!avoidFlip || !FLIP_DRIVERS.has(key))
        && (!avoidTabs || !TAB_DRIVERS.has(key)) && (!avoidSwitchPopup || !SWITCH_POPUP_DRIVERS.has(key)));
    const matched = [];
    const taken = new Set();
    for (const [key] of matchDriversToUsages(usages, all)) {
        const family = driverFamilyOf(key);
        if (taken.has(family)) continue;
        taken.add(family);
        matched.push(key);
        if (matched.length >= OFFER_SIZE) break;
    }
    const need = OFFER_SIZE - matched.length;
    const near = new Set(related.flatMap(usage => driversForUsage(usage).slice(0, 1)));
    // 还没占的大类，每类先挑出候选写法：优先这个媒介常用、上一面没给过的。
    const families = Object.keys(DRIVER_FAMILIES).filter(family => !taken.has(family)).map(family => {
        const members = DRIVER_FAMILIES[family].drivers.filter(key => all.includes(key));
        const prefer = list => list.filter(key => !recent.includes(key));
        const nearMembers = members.filter(key => near.has(key));
        const pick = prefer(nearMembers).length ? prefer(nearMembers) : nearMembers.length ? nearMembers : prefer(members).length ? prefer(members) : members;
        return { family, pick, fresh: members.some(key => !recent.includes(key)) };
    }).filter(item => item.pick.length);
    const freshFamilies = families.filter(item => item.fresh);
    const pool = freshFamilies.length >= need ? freshFamilies : families;
    let offer = [...matched, ...shuffled(pool).slice(0, need).map(item => shuffled(item.pick)[0])];
    // 一份清单里不同时给「开关切换」和「弹窗」：留先排上的那个（多半是配了用法的），另一个换成别的大类。
    if (offer.includes('toggle') && offer.includes('popup')) {
        const drop = offer.indexOf('toggle') < offer.indexOf('popup') ? 'popup' : 'toggle';
        const used = new Set(offer.map(driverFamilyOf));
        const spare = shuffled(families.filter(item => !used.has(item.family) && !item.pick.some(key => SWITCH_POPUP_DRIVERS.has(key))))[0];
        offer = spare ? offer.map(key => key === drop ? shuffled(spare.pick)[0] : key) : offer.filter(key => key !== drop);
    }
    try { globalThis.localStorage?.setItem(RECENT_KEY, JSON.stringify(offer)); } catch { /* best effort */ }
    return Object.freeze(offer);
}

export function interactionMethodNames(offer) {
    const keys = normalizeDriverOffer(offer) || [];
    return shuffled([...new Set([...CSS_METHODS, ...keys.flatMap(key => DRIVER_METHODS[key].names)])]);
}

const SHOW_DRIVERS = new Set(['toggle', 'pick', 'roll', 'hold', 'pager', 'connect', 'turn', 'sequence', 'slide', 'timer', 'swipe', 'peek', 'spoiler', 'sense', 'carry']);

// usages 给出时，配上了用法的写法注明“用于「某用法」”，模型写到这个用法就照这个写法写。
export function driverContractLines(offer, usages = []) {
    const keys = normalizeDriverOffer(offer) || [];
    const pairs = new Map(matchDriversToUsages(usages, keys));
    const lines = keys.map(key => `    ${DRIVER_METHODS[key].names.join('、')}${pairs.has(key) ? `（用于「${pairs.get(key)}」）` : ''}：${DRIVER_METHODS[key].how}。`);
    // data-rm-show 是各类驱动共用的显隐写法，提供了用得上它的驱动时补一句。
    if (keys.some(key => SHOW_DRIVERS.has(key))) lines.push('    以上容器里 data-rm-show="键" 的内容在该状态时才显示（"!键" 相反）。');
    return lines;
}
