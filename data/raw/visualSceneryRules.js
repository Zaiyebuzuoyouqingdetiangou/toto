// Shared by pure scenery and scenery-plus-medium construction; not a subject pool.
export const VISUAL_SCENERY_EXPRESSION_RULE = '从正文氛围、情绪与联想自由构思；风景、动物、人物、物件、空间及抽象意象均可独立成景，表达对象与形态不限。可呈现回忆、想象、未来愿景或其他可能性，不必复刻当前场景，也不要求人物出镜；亲密感官意味作诗意化表达。';

// Qualify the existing three-plan VS only after the visual construction/beauty stages.
export const VISUAL_SCENERY_VS_GUIDANCE = '本面 VS 三条短方案从视觉主体、空间构图与动态过程探索不同表达，不固定类型。';

export const VISUAL_SCENERY_CONSTRUCTION_RULES = String.raw`
【Visual Scenery 动态画面本体】
${VISUAL_SCENERY_EXPRESSION_RULE}

【硬要求】
<details> 内首个主要内容块必须独立构成一幅构图完整、空间关系成立且持续动态的视觉画面，不得退化为横幅、装饰头图、背景板，或仅以 UI 卡片、信息面板、日志、报告、播放器和“静态画面加几个动点”代替。画面须落实选定视觉构思，按需要组合 HTML、内联 SVG 与 CSS，实际绘出主体轮廓、内部构件与空间关系，并用材质和光影形成层次；操作后先改变画面中对象的关系或状态，文字只作辅助反馈。不得让画面停留原状，只在下方展开大段文字来代替交互。
`;

export const VISUAL_SCENERY_MOTION_RULES = String.raw`
至少一个占据明确视觉权重的主体、关系结构或环境层必须使用打开即运行的 CSS animation + @keyframes + infinite，并在 1 秒内产生肉眼可见的位移、旋转、缩放、形变、遮罩、流体或光影变化；仅微尘、小点、同色弱光、低对比闪烁或极慢小幅漂移不能单独算动画。应优先让画面核心本身发生变化，并可与前景、背景、光影或象征元素协同运动，使整幅画面具有持续生命感。

动画从本面景物、物件或关系的运动因果生长，例如落叶落花随风飘落、车辆行进与路面后移、命运红线牵引两端对象；例子只作启发，不固定套用。主体与环境在方向、节奏或因果上呼应；仅让整张文字卡片漂浮、无关法阵旋转或通用光点游走，不能充当主动画。已有 rotate/scale 等静态 transform 时须在关键帧中保留，或由外层容器承载动画。transition、hover、点击后变化或仅绘出静态 SVG 不能代替持续动画。

【动态舞台落地】
首个主要画面根节点必须写入 data-rm-visual-scenery="true"。画面必须具有可辨认的背景层、中景主体层与前景／叙事层；至少一条主动画和一条协同环境动画应在打开后立即循环运行。不得把“视频播放器外观”“播放按钮”“进度条”“静态海报加微粒”当作动态场景本体，也不得先搭通用卡片页面再把一张会动的头图放在上方。
`;

// Full text stays available to existing importers; the prompt places construction first.
export const VISUAL_SCENERY_RULES = VISUAL_SCENERY_CONSTRUCTION_RULES + VISUAL_SCENERY_MOTION_RULES;
