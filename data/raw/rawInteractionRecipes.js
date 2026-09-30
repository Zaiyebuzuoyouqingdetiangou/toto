// Finite native HTML/CSS constructions. This is not executable model JavaScript.
const DETAILS = Object.freeze({
    "hinged-open": Object.freeze({"action":"点物件的把手或盖面，使盖板绕实际连接边转开；再次点合上","result":"内壁、厚度和藏物随开合显露，正文不放进旋转面背后"}),
    "sliding-open": Object.freeze({"action":"点拉手，使抽屉或滑盖沿轨道移开，再点收回","result":"轨道与内部物件位置同时变化，不能只展开一段说明"}),
    "peel-layer": Object.freeze({"action":"点封边掀开局部表层，露出下层证据，再点复原","result":"表层边缘、投影与下层图文互相遮挡，材料层次可辨"}),
    "pull-strip": Object.freeze({"action":"点露出的纸端切换收纳和抽出位置","result":"纸带或内页实际伸出，卷轴或外套仍留在原位，内容正常流撑高"}),
    "unfold-object": Object.freeze({"action":"点折缝，让相连的折面展开；再次操作收拢","result":"折面方向、接缝与可读面积变化，信息属于展开后的物件"}),
    "turn-over": Object.freeze({"action":"点物件翻看正反面，再点返回","result":"两面有不同的物件证据和朝向；长内容由外层正常流承载"}),
    "rotate-object": Object.freeze({"action":"选择物件上的朝向刻度，改变主体角度","result":"主体细节、遮挡或指针方向随档位变化，刻度是装置的一部分"}),
    "move-on-track": Object.freeze({"action":"点路径上的目的位置，使可见对象沿路径切换位置","result":"角色、车、棋子或标记抵达对应位置，并呈现那里的短反馈"}),
    "close-inspection": Object.freeze({"action":"点画面中值得查看的部位，打开局部放大视图，再点回到全貌","result":"全貌与细节有明确对应标记，细节须实际绘制而非复制说明"}),
    "assemble-parts": Object.freeze({"action":"逐一选择零件，零件在主体对应位置出现；取消可拆回","result":"单件、组合与完成状态都有不同可见构造，预先写明有限组合"}),
    "exploded-view": Object.freeze({"action":"点结构接合处，使构件沿各自轴线分离，再合拢","result":"各部件仍围绕原主体保持对应，不变成无关卡片列表"}),
    "shape-change": Object.freeze({"action":"选择媒介自身的状态刻度，让同一主体形态变化","result":"轮廓、开合、密度或高度实际变化，颜色仅作为辅助信号"}),
    "before-after": Object.freeze({"action":"选择同一对象的两个时刻并可返回","result":"保留位置锚点，对照使用痕迹、姿态或环境变化，不仅换标题"}),
    "transparent-layer": Object.freeze({"action":"点表层使它半透明或移开，再还原","result":"内部结构与外壳对位，局部注记随实际结构出现"}),
    "overlay-evidence": Object.freeze({"action":"独立开合与正文有关的证据层，可叠合也可分别查看","result":"重合位置显露差异或联系，保留原始证据与参照位置"}),
    "light-direction": Object.freeze({"action":"点画面内的光源方向或时段标识","result":"主体亮面、暗面、投影方向共同变化，非整页换肤"}),
    "material-sample": Object.freeze({"action":"点与正文有关的材质样片，将材质应用到同一物件","result":"纹理、接缝、反光与厚度相应改变，保留同一形体供比较"}),
    "parallel-compare": Object.freeze({"action":"在原媒介中选择要比较的证据位置，两份对应内容保持可见","result":"同时突出两边相同位置的差别，用连线、对齐或局部标记解释对应"}),
    "step-process": Object.freeze({"action":"沿原形式的过程节点向前操作，也能回到已展示节点","result":"同一过程的对象状态、进度和结果同步改变；不是三个互不相关的段落"}),
    "time-object": Object.freeze({"action":"点物件旁的时间位置查看各阶段","result":"同一物件的磨损、增减与空间关系揭示时间，短文字补充缘由"}),
    "growth-stage": Object.freeze({"action":"选择阶段，让主体逐步展开、积累或消退","result":"各阶段由相同构件连续变化，保留可返回的状态入口"}),
    "orbital-position": Object.freeze({"action":"点轨道刻度或周期位置","result":"天体、指针或周期物件实际移位，并改变相对遮挡或相位"}),
    "weather-scene": Object.freeze({"action":"选择与正文有关的天气或季节节点","result":"植被、地面、天空和物件受光共同响应，内容仍在同一地点"}),
    "route-branch": Object.freeze({"action":"在路口选择有限分支，提供回到路口的入口","result":"分支落在具体路径和场景结果上，不伪称未实现的自由移动"}),
    "combination-lock": Object.freeze({"action":"依次切换机关的独立状态，尝试预设组合","result":"只有已写出的状态组合改变机关本体并显出结果，可逐项复位"}),
    "mix-components": Object.freeze({"action":"选择正文中的配料或部件，组合后观察成品","result":"容器内层次、颜色或实体组合随选择改变，只表示预先定义的有限结果"}),
    "connect-circuit": Object.freeze({"action":"逐个接通有意义的线路节点，也能断开","result":"线路高亮与末端装置状态由实际组合共同控制"}),
    "connect-stars": Object.freeze({"action":"选择有关系的节点，逐段显露对应连接","result":"连接端点准确指向主体，组合关系在画面中成立，文字只解释具体联系"}),
    "layer-outfit": Object.freeze({"action":"开合或替换角色／物件的可见构件","result":"构件落到身体或物件的对应部位，轮廓、遮挡和组合随选择变化"}),
    "stack-collection": Object.freeze({"action":"逐件标记或放入收集物，可取回","result":"收集物在容器、架位或组合图中实际累积，完成反馈由有限状态组合触发"}),
    "object-hotspots": Object.freeze({"action":"点原媒介里具体可见的证据或部位，再次点收回局部细节","result":"细节紧邻被操作对象并保持位置对应；多个热点各有自己的内容与状态"}),
    "layer-discovery": Object.freeze({"action":"独立开启原媒介的相关层或注记，并可叠看","result":"层与同一内容对象对齐，开启后增加可见证据而非替换整篇文字"}),
    "map-explore": Object.freeze({"action":"点实际地图上的地标查看局部","result":"所选地标位置、路径与附近场景同步突出，保留其他地标的空间参照"}),
    "space-sections": Object.freeze({"action":"点空间中的房间或分区，显露其内部","result":"分区仍留在整体空间中，遮挡、灯光或内容物反映当前查看位置"}),
    "inventory-inspect": Object.freeze({"action":"点一个实际摆放的物件将它置于检查位，再换另一件","result":"原位置留有对应线索，检查位展示该物的不同细节，不只换一段介绍"}),
    "evidence-mark": Object.freeze({"action":"点原媒介的线索标记，让对应原文、图中位置或结构同时突出","result":"保留上下文和证据位置，以对应关系承载解释；不把全文搬到切页容器"}),
    "page-turn": Object.freeze({"action":"点真实书页的页缘向前或向后翻阅","result":"页码、页缘和当前内容页对应，保持正文正常流可读与手机宽度适配"}),
    "marginal-notes": Object.freeze({"action":"点原文边的批注标记就地展开，再点收回","result":"批注与引用位置明确关联，原文持续可读，注记不会覆盖后续内容"}),
    "cross-reading": Object.freeze({"action":"点对应段落的索引，对齐两份材料中的证据","result":"两边相关段落同时突出，段落内容和上下文仍可阅读"}),
    "branch-reading": Object.freeze({"action":"在情境内的明确选择处进入预先写好的分支，也可回看选择处","result":"分支改变具体情境或结局，并保留之前选择的可见线索"}),
    "folded-insert": Object.freeze({"action":"用原生 details/summary 打开文内附页，再关闭","result":"附页是本形式的具体补充材料，有独立版式，展开撑高且保留上下文"}),
    "scroll-strip": Object.freeze({"action":"手指横向滑动连续画幅，停靠到下一幅","result":"相邻画幅具备连续物件或空间关系；可见滚动提示，不承诺滚动驱动其它变量"}),
    "motion-play": Object.freeze({"action":"点装置自身开关启动或暂停连续动作","result":"运转部件真的运动或停在当前相位，开关只是入口，静态状态也能读懂"}),
    "motion-reverse": Object.freeze({"action":"点方向刻度切换正转和反转","result":"实际运动部件改变方向；文字说明与当前方向对应"}),
    "motion-speed": Object.freeze({"action":"点已有装置的档位刻度，切换事先写好的速度","result":"运动速度与装置读数同步变化；是离散档位，不伪装连续 range 联动"}),
    "motion-release": Object.freeze({"action":"点对应物件触发一次短动作，取消状态后可再次触发","result":"动作作用在主体或环境上并有清晰结束状态，避免只有入口闪光"}),
    "motion-focus": Object.freeze({"action":"分别暂停场景里有意义的运动层，再恢复","result":"层之间的相对运动、遮挡或关系变得可观察，遵循已有动画性能规则"}),
    "scroll-panorama": Object.freeze({"action":"手指滑动镜内全景，逐段观察空间","result":"前后段有连续地平线、路径或物件，静态可浏览，不依赖滚动事件脚本"})
});

export function resolveInteractionDetail(id) {
    return Object.prototype.hasOwnProperty.call(DETAILS, id) ? DETAILS[id] : null;
}

export const INTERACTION_MECHANISMS = Object.freeze({
    "toggle": "checkbox 保存开合状态，label for 指向唯一 id；input 放在所控对象之前的共同父层，以 :checked ~ .stage .part 改变实际部件；再次点击复原。",
    "choice": "同一面的 radio 共享面内唯一 name，预设一个 checked；label for 对应各 id，以 #state:checked ~ .stage .part 改变物件或对应内容；提供可返回入口。",
    "combine": "独立 checkbox 放在同一共同父层，后置主体；以 #a:checked ~ #b:checked ~ .stage 及单状态规则表示实际可枚举组合；取消选择能回退，不做未实现的实时运算。",
    "disclosure": "使用原生 details/summary，以 details[open] 控制局部边缘或附页外观；正文和附页留在正常流，不依赖外部事件。",
    "scroll": "镜内可横滚容器使用 max-width:100%;overflow-x:auto;scroll-snap-type:x proximity，子项 scroll-snap-align:start；触屏原生滚动，保留滚动线索与可聚焦入口。",
    "motion": "checkbox :checked 联动主体 animation-play-state:running/paused，默认态可读；动效尊重 prefers-reduced-motion，并保留静态操作结果。"
});
