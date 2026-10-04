// Only drawn mechanisms are sent. Drivers act inside the annotated object;
// generated scripts are never executed and no appearance is imposed.
export const INTERACTION_MECHANISMS = Object.freeze({
 fold:'原生 details/summary 初始不带 open；展开内容紧邻入口，再点收起。',
 popup:'button popovertarget 对应本面唯一 id 的 div popover；内置关闭按钮 popovertargetaction="hide"，不预先展开。',
 screen:'radio 配合 :checked 切换完整画面，只显示当前幕；下一幕内放返回入口，不能只切换说明段落。',
 effect:'局部 data-rm-ui="effect" 内，button data-rm-fire 触发 data-rm-part 上真实关键帧，每次点击从头播放。',
 flip:'checkbox :checked 驱动同一物件 rotateY；正背面背向隐藏，再点翻回，不能同时堆出两面。',
 drag:'容器 data-rm-ui="drag"，可拖物件 data-rm-item="键"，可选同键 data-rm-slot 为吸附槽；button data-rm-reset 复原。',
 adjust:'局部 data-rm-ui="adjust" 内放 range；驱动器更新 --rm-p(0～1)和 --rm-value，CSS须据此连续改变实际主体。',
 reveal:'局部 data-rm-ui="reveal" 包住底图与 data-rm-cover 遮层；range 或横拖逐步揭开；button data-rm-reset 复原。',
 view:'局部 data-rm-ui="view" 可滚动浏览 data-rm-part；range(min=1,max=3,step=.01)连续缩放该画面；button data-rm-reset 还原。',
 input:'局部 data-rm-ui="input" 内用 input type="text"＋output，文字原位显示；可选 data-rm-answer 校验并用 [data-rm-match="true"] 显示反馈。绘制则用 data-rm-ui="draw"＋svg data-rm-canvas；button data-rm-reset 清除。',
 motion:'局部 data-rm-ui="motion" 内 data-rm-part 保留真实动画；button data-rm-play 暂停/继续，range 调进度，可选 button data-rm-reverse 倒放；开场动画要求照常。',
 scroll:'局部 overflow-x:auto＋scroll-snap-type:x proximity，子项 scroll-snap-align:start；手机由本地驱动补左右点按浏览，不自动跳页。',
 hold:'局部 data-rm-ui="hold" 的 button data-rm-hold；按住设置 [data-rm-active="true"]，松开清除，CSS据此改变对应画面。',
 layers:'每层各用独立 checkbox，以 :checked 改变对应图层显隐；底图保留，多个勾选可同时生效。',
 transform:'checkbox :checked 改变实际部件的 transform/clip-path 等；转轴和连接跟随物件结构，再点复原。',
 follow:'局部 data-rm-ui="follow" 内 CSS 用 --rm-x/--rm-y(像素)定位光斑或线端；触摸区 data-rm-surface，拖动连续更新坐标。',
 reorder:'容器 data-rm-ui="reorder"，同父层各项 data-rm-item；拖放重排，项内 button data-rm-prev/data-rm-next 支持点按；button data-rm-reset 复原。',
 accumulate:'局部 data-rm-ui="accumulate" 内每项 button data-rm-step，点击切换自身 [data-rm-done="true"]；--rm-count 记录完成数，CSS改变对应实物；data-rm-reset 撤回全部。',
});
const DETAILS=Object.freeze({
 fold:['展开或收起相邻内容','收起时内容隐藏且不占正文空间'],
 popup:['打开后阅读，再关闭','浮层关闭后保留原来位置和主体状态'],
 'scene-switch':['进入下一幕并返回','场景主体与内容一起切换'],
 'trigger-effect':['点击本体触发一次变化','动画与被操作的对象有关，可重复触发'],
 flip:['翻到物件背面再返回','正背面附着同一物件'],
 'drag-combine':['拖动物件，叠合或放入对应位置','位置与组合关系实际改变'],
 'continuous-adjust':['连续改变调节幅度','中间幅度对应中间画面状态'],
 'local-reveal':['逐步移开遮挡','下层画面沿操作位置显露'],
 'viewport-explore':['移动视野或放大后退回','放大或移步发现主体内实际绘出的线索、细节与关系'],
 'input-draw':['输入或描画后查看反馈','留下实际文字或线条，可清除重来'],
 'progress-control':['操作运行中的对象','运动进度、方向或播放状态真实变化'],
 'scroll-browse':['滑动连续内容','视口随手指移动并自然停靠'],
 'hold-preview':['按住查看，松开恢复','临时画面只在按住时出现'],
 'layer-control':['分别打开或关闭不同层','图层可同时叠加，底图保持'],
 'object-transform':['打开或改变物件形态，再复原','部件位置与轮廓随之变化'],
 'pointer-follow':['在局部画面移动触点','对应部件连续跟随触点'],
 reorder:['把物件移到新的次序','次序变化带来不同的拼合关系或内容结果'],
 accumulate:['连续操作多个物件，再撤回','前次变化保留，完成状态累积'],
});
export function resolveInteractionDetail(id){
 const entry=Object.hasOwn(DETAILS,id) ? DETAILS[id] : null;
 return entry ? {action:entry[0],result:entry[1]} : null;
}
