// Broad actions and visible feedback; the selected presentation supplies objects, appearance and controls.
const DETAILS = Object.freeze({
    "open-reveal": Object.freeze({"action":"通过本体原有的开合、翻面或层次关系查看内容，并能还原","result":"被遮挡的部位或内容在原对象处显露，开合状态与承载结构一致"}),
    "explore-navigate": Object.freeze({"action":"在本体内选择部位、移动视点或沿路径浏览，支持返回","result":"位置、视角或局部细节真实变化，所见内容与原主体保持对应"}),
    "assemble-disassemble": Object.freeze({"action":"添加、连接或拆开本体的组成部分，并能撤回操作","result":"部件的位置、连接与整体构成实际变化，部分与整体保持对应"}),
    "overlay-align": Object.freeze({"action":"叠放相关图层或调整它们的相对位置，可分开查看","result":"重合与错位在原位置直接可见，并显出内容之间的关系"}),
    "compare-correspond": Object.freeze({"action":"选择同一对象的不同时刻、状态或相互对应的内容进行比较","result":"对应关系与差异清楚可见，保留比较所需的参照"}),
    "condition-linkage": Object.freeze({"action":"调整与内容有关的条件，使同一主体进入对应状态","result":"形态、材质或环境随条件发生相关变化，各部位的表现相互一致"}),
    "combine-feedback": Object.freeze({"action":"选择或撤回相互作用的输入，观察不同组合产生的结果","result":"结果由当前组合共同决定，在对应主体上可见，并与各输入状态一致"}),
    "connect-transmit": Object.freeze({"action":"建立、切换或断开对象之间的联系或通路","result":"连接准确落到对应对象，关联状态或传导过程沿实际关系变化"}),
    "motion-control": Object.freeze({"action":"通过本体的操作入口调节与内容有关的运动","result":"实际运动对象的运行状态随操作改变，反馈与当前运动一致"}),
    "trace-develop": Object.freeze({"action":"对内容中的表面施加作用，留下、显现或清除相关痕迹","result":"痕迹出现在受作用的位置，并与材料和操作过程对应"})
});

export function resolveInteractionDetail(id) {
    return Object.prototype.hasOwnProperty.call(DETAILS, id) ? DETAILS[id] : null;
}

export const INTERACTION_MECHANISMS = Object.freeze({
    "native": "依本面操作选择原生 checkbox、radio、details/summary 或滚动；label 指向唯一 id，互斥 radio 共用面内独立组名，以 :checked 或 [open] 联动实际对象；组合结果对应实际状态，切换可返回，滚动保留触屏操作。",
    "toggle": "checkbox 保存开合状态，label for 指向唯一 id；input 放在所控对象之前的共同父层，以 :checked ~ .stage .part 改变实际部件；再次点击复原。",
    "choice": "同一面的 radio 共享面内唯一 name，预设一个 checked；label for 对应各 id，以 #state:checked ~ .stage .part 改变物件或对应内容；提供可返回入口。",
    "combine": "独立 checkbox 放在同一共同父层，后置主体；以 #a:checked ~ #b:checked ~ .stage 及单状态规则表示实际可枚举组合；取消选择能回退，不做未实现的实时运算。",
    "disclosure": "使用原生 details/summary，以 details[open] 控制局部边缘或附页外观；正文和附页留在正常流，不依赖外部事件。",
    "scroll": "镜内可横滚容器使用 max-width:100%;overflow-x:auto;scroll-snap-type:x proximity，子项 scroll-snap-align:start；触屏原生滚动，保留滚动线索与可聚焦入口。",
    "motion": "checkbox :checked 联动主体 animation-play-state:running/paused，默认态可读；动效尊重 prefers-reduced-motion，并保留静态操作结果。"
});
