// A finite, extensible recipe catalogue, not a claim to enumerate every program.
// Only native HTML/CSS state is used. No model JavaScript or new runtime bridge.
// fit is a positive affinity to the selected form, not a new media taxonomy.
const recipe = (id, family, title, mechanism, fit, action, result, universal = false) => Object.freeze({
    id, family, title, mechanism, fit: Object.freeze(fit.split('|').filter(Boolean)), action, result, universal,
});

export const INTERACTION_RECIPES = Object.freeze([
    recipe('hinged-open', 'opening', '铰接开合', 'toggle', '盒|门|柜|窗|容器|机关', '点物件的把手或盖面，使盖板绕实际连接边转开；再次点合上', '内壁、厚度和藏物随开合显露，正文不放进旋转面背后'),
    recipe('sliding-open', 'opening', '滑盖抽取', 'toggle', '抽屉|盒|门|唱片|卡带|容器', '点拉手，使抽屉或滑盖沿轨道移开，再点收回', '轨道与内部物件位置同时变化，不能只展开一段说明'),
    recipe('peel-layer', 'opening', '揭层与复原', 'toggle', '信|封|包装|贴|标签|票|海报', '点封边掀开局部表层，露出下层证据，再点复原', '表层边缘、投影与下层图文互相遮挡，材料层次可辨'),
    recipe('pull-strip', 'opening', '拉出内页', 'toggle', '票|签|卷|胶片|信|报纸|纸', '点露出的纸端切换收纳和抽出位置', '纸带或内页实际伸出，卷轴或外套仍留在原位，内容正常流撑高'),
    recipe('unfold-object', 'opening', '展开折叠物', 'toggle', '地图|纸|折|书|信|扇|花', '点折缝，让相连的折面展开；再次操作收拢', '折面方向、接缝与可读面积变化，信息属于展开后的物件'),
    recipe('turn-over', 'opening', '正反面翻看', 'toggle', '卡|牌|照片|标本|明信片|证件|硬币', '点物件翻看正反面，再点返回', '两面有不同的物件证据和朝向；长内容由外层正常流承载'),

    recipe('rotate-object', 'transform', '转向检查', 'choice', '天体|模型|机械|物件|雕|罗盘|轮|仪', '选择物件上的朝向刻度，改变主体角度', '主体细节、遮挡或指针方向随档位变化，刻度是装置的一部分'),
    recipe('move-on-track', 'transform', '沿路径移动', 'choice', '地图|旅|轨|路线|棋|跑团|游戏|物流', '点路径上的目的位置，使可见对象沿路径切换位置', '角色、车、棋子或标记抵达对应位置，并呈现那里的短反馈'),
    recipe('close-inspection', 'transform', '近看细节', 'toggle', '照片|标本|物件|信|画|收藏|观察', '点画面中值得查看的部位，打开局部放大视图，再点回到全貌', '全貌与细节有明确对应标记，细节须实际绘制而非复制说明'),
    recipe('assemble-parts', 'transform', '逐件装配', 'combine', '拼|机械|玩具|模型|烹饪|修|工坊|装配', '逐一选择零件，零件在主体对应位置出现；取消可拆回', '单件、组合与完成状态都有不同可见构造，预先写明有限组合'),
    recipe('exploded-view', 'transform', '结构拆看', 'toggle', '机械|物件|仪|模型|装置|标本|分层', '点结构接合处，使构件沿各自轴线分离，再合拢', '各部件仍围绕原主体保持对应，不变成无关卡片列表'),
    recipe('shape-change', 'transform', '轮廓变形', 'choice', '情绪|花|生长|变形|天气|液|可视化', '选择媒介自身的状态刻度，让同一主体形态变化', '轮廓、开合、密度或高度实际变化，颜色仅作为辅助信号'),

    recipe('before-after', 'comparison', '同物前后对照', 'choice', '时间|照片|修|记忆|物品|历史|对照', '选择同一对象的两个时刻并可返回', '保留位置锚点，对照使用痕迹、姿态或环境变化，不仅换标题'),
    recipe('transparent-layer', 'comparison', '透层观察', 'toggle', '标本|结构|地图|模型|机械|人体|剖', '点表层使它半透明或移开，再还原', '内部结构与外壳对位，局部注记随实际结构出现'),
    recipe('overlay-evidence', 'comparison', '叠合证据', 'combine', '线索|侦|照片|地图|档案|证据|图', '独立开合与正文有关的证据层，可叠合也可分别查看', '重合位置显露差异或联系，保留原始证据与参照位置'),
    recipe('light-direction', 'comparison', '改变受光', 'choice', '场景|风景|物件|舞台|摄影|光|scenery', '点画面内的光源方向或时段标识', '主体亮面、暗面、投影方向共同变化，非整页换肤'),
    recipe('material-sample', 'comparison', '材质比照', 'choice', '布|服|材质|装修|工艺|商店|物件', '点与正文有关的材质样片，将材质应用到同一物件', '纹理、接缝、反光与厚度相应改变，保留同一形体供比较'),
    recipe('parallel-compare', 'comparison', '并置对应比较', 'choice', '', '在原媒介中选择要比较的证据位置，两份对应内容保持可见', '同时突出两边相同位置的差别，用连线、对齐或局部标记解释对应', true),

    recipe('step-process', 'sequence', '过程推进与回看', 'choice', '', '沿原形式的过程节点向前操作，也能回到已展示节点', '同一过程的对象状态、进度和结果同步改变；不是三个互不相关的段落', true),
    recipe('time-object', 'sequence', '物件随时间变化', 'choice', '时间|物品|记忆|历史|年代|照片|年轮', '点物件旁的时间位置查看各阶段', '同一物件的磨损、增减与空间关系揭示时间，短文字补充缘由'),
    recipe('growth-stage', 'sequence', '生长与消退', 'choice', '花|生长|植物|情绪|生命|月相|周期', '选择阶段，让主体逐步展开、积累或消退', '各阶段由相同构件连续变化，保留可返回的状态入口'),
    recipe('orbital-position', 'sequence', '轨道与相位', 'choice', '天体|星|轨|月|周期|钟|罗盘', '点轨道刻度或周期位置', '天体、指针或周期物件实际移位，并改变相对遮挡或相位'),
    recipe('weather-scene', 'sequence', '场景条件联动', 'choice', '场景|风景|天气|季|雨|scenery', '选择与正文有关的天气或季节节点', '植被、地面、天空和物件受光共同响应，内容仍在同一地点'),
    recipe('route-branch', 'sequence', '路径分支探索', 'choice', '路线|地图|游戏|跑团|旅|迷宫|分支', '在路口选择有限分支，提供回到路口的入口', '分支落在具体路径和场景结果上，不伪称未实现的自由移动'),

    recipe('combination-lock', 'combination', '组合解锁', 'combine', '锁|机关|谜|侦|游戏|跑团|实验', '依次切换机关的独立状态，尝试预设组合', '只有已写出的状态组合改变机关本体并显出结果，可逐项复位'),
    recipe('mix-components', 'combination', '配方组合', 'combine', '料理|烹饪|调|香|药|实验|配方|饮', '选择正文中的配料或部件，组合后观察成品', '容器内层次、颜色或实体组合随选择改变，只表示预先定义的有限结果'),
    recipe('connect-circuit', 'combination', '线路接通', 'combine', '机械|电|线路|装置|机关|网络', '逐个接通有意义的线路节点，也能断开', '线路高亮与末端装置状态由实际组合共同控制'),
    recipe('connect-stars', 'combination', '关系连缀', 'combine', '关系|星图|网络|人物|记忆|线索', '选择有关系的节点，逐段显露对应连接', '连接端点准确指向主体，组合关系在画面中成立，文字只解释具体联系'),
    recipe('layer-outfit', 'combination', '构件搭配', 'combine', '服|装扮|衣|玩偶|人物|造型|搭配', '开合或替换角色／物件的可见构件', '构件落到身体或物件的对应部位，轮廓、遮挡和组合随选择变化'),
    recipe('stack-collection', 'combination', '逐件收集成形', 'combine', '收藏|标本|物品|拼|堆|展|清单', '逐件标记或放入收集物，可取回', '收集物在容器、架位或组合图中实际累积，完成反馈由有限状态组合触发'),

    recipe('object-hotspots', 'exploration', '原位热点探索', 'toggle', '', '点原媒介里具体可见的证据或部位，再次点收回局部细节', '细节紧邻被操作对象并保持位置对应；多个热点各有自己的内容与状态', true),
    recipe('layer-discovery', 'exploration', '相关层探索', 'combine', '', '独立开启原媒介的相关层或注记，并可叠看', '层与同一内容对象对齐，开启后增加可见证据而非替换整篇文字', true),
    recipe('map-explore', 'exploration', '地图原位查看', 'choice', '地图|城市|地标|路线|旅|地理', '点实际地图上的地标查看局部', '所选地标位置、路径与附近场景同步突出，保留其他地标的空间参照'),
    recipe('space-sections', 'exploration', '空间剖面探索', 'choice', '房|屋|建筑|空间|箱|柜|舞台', '点空间中的房间或分区，显露其内部', '分区仍留在整体空间中，遮挡、灯光或内容物反映当前查看位置'),
    recipe('inventory-inspect', 'exploration', '物件轮流检视', 'choice', '物品|背包|收藏|展|标本|商店|柜', '点一个实际摆放的物件将它置于检查位，再换另一件', '原位置留有对应线索，检查位展示该物的不同细节，不只换一段介绍'),
    recipe('evidence-mark', 'exploration', '原文与证据联动', 'choice', '', '点原媒介的线索标记，让对应原文、图中位置或结构同时突出', '保留上下文和证据位置，以对应关系承载解释；不把全文搬到切页容器', true),

    recipe('page-turn', 'reading', '有装帧的翻阅', 'choice', '书|册|日记|报|杂志|画集|手账|相册', '点真实书页的页缘向前或向后翻阅', '页码、页缘和当前内容页对应，保持正文正常流可读与手机宽度适配'),
    recipe('marginal-notes', 'reading', '页边批注', 'toggle', '信|书|报|档案|文|日记|手账|记录', '点原文边的批注标记就地展开，再点收回', '批注与引用位置明确关联，原文持续可读，注记不会覆盖后续内容'),
    recipe('cross-reading', 'reading', '两份文献对读', 'choice', '信|书|报|档案|文献|记录|日记|记录', '点对应段落的索引，对齐两份材料中的证据', '两边相关段落同时突出，段落内容和上下文仍可阅读'),
    recipe('branch-reading', 'reading', '叙事分支回溯', 'choice', '故事|小说|信|日记|剧本|分支|跑团', '在情境内的明确选择处进入预先写好的分支，也可回看选择处', '分支改变具体情境或结局，并保留之前选择的可见线索'),
    recipe('folded-insert', 'reading', '正文内折页', 'disclosure', '书|报|档案|信|手账|记录|册|菜单', '用原生 details/summary 打开文内附页，再关闭', '附页是本形式的具体补充材料，有独立版式，展开撑高且保留上下文'),
    recipe('scroll-strip', 'reading', '横卷与连幅浏览', 'scroll', '卷|胶片|相册|连环|画集|时间轴|旅|分镜', '手指横向滑动连续画幅，停靠到下一幅', '相邻画幅具备连续物件或空间关系；可见滚动提示，不承诺滚动驱动其它变量'),

    recipe('motion-play', 'motion', '启动与暂停装置', 'motion', '机械|音乐|装置|钟|天体|scenery|动态|风景', '点装置自身开关启动或暂停连续动作', '运转部件真的运动或停在当前相位，开关只是入口，静态状态也能读懂'),
    recipe('motion-reverse', 'motion', '反向运转', 'choice', '机械|轨|钟|装置|天体|动态', '点方向刻度切换正转和反转', '实际运动部件改变方向；文字说明与当前方向对应'),
    recipe('motion-speed', 'motion', '离散档位', 'choice', '机械|音乐|装置|钟|仪|动态|天气', '点已有装置的档位刻度，切换事先写好的速度', '运动速度与装置读数同步变化；是离散档位，不伪装连续 range 联动'),
    recipe('motion-release', 'motion', '触发与复位', 'toggle', '花|烟花|机关|波|水|装置|舞台|动态', '点对应物件触发一次短动作，取消状态后可再次触发', '动作作用在主体或环境上并有清晰结束状态，避免只有入口闪光'),
    recipe('motion-focus', 'motion', '多层动静对比', 'combine', '风景|scenery|舞台|天体|装置|动态|场景', '分别暂停场景里有意义的运动层，再恢复', '层之间的相对运动、遮挡或关系变得可观察，遵循已有动画性能规则'),
    recipe('scroll-panorama', 'motion', '全景移步观察', 'scroll', '风景|scenery|地图|场景|旅|城市|长卷', '手指滑动镜内全景，逐段观察空间', '前后段有连续地平线、路径或物件，静态可浏览，不依赖滚动事件脚本'),
]);

export const INTERACTION_MECHANISMS = Object.freeze({
    toggle: 'checkbox 保存开合状态，label for 指向唯一 id；input 放在所控对象之前的共同父层，以 :checked ~ .stage .part 改变实际部件；再次点击复原。',
    choice: '同一面的 radio 共享面内唯一 name，预设一个 checked；label for 对应各 id，以 #state:checked ~ .stage .part 改变物件或对应内容；提供可返回入口。',
    combine: '独立 checkbox 放在同一共同父层，后置主体；以 #a:checked ~ #b:checked ~ .stage 及单状态规则表示实际可枚举组合；取消选择能回退，不做未实现的实时运算。',
    disclosure: '使用原生 details/summary，以 details[open] 控制局部边缘或附页外观；正文和附页留在正常流，不依赖外部事件。',
    scroll: '镜内可横滚容器使用 max-width:100%;overflow-x:auto;scroll-snap-type:x proximity，子项 scroll-snap-align:start；触屏原生滚动，保留滚动线索与可聚焦入口。',
    motion: 'checkbox :checked 联动主体 animation-play-state:running/paused，默认态可读；动效尊重 prefers-reduced-motion，并保留静态操作结果。',
});
