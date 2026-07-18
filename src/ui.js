import { getSettings, updateSettings, resetSettings } from './settings.js';
import { clearLastCombo } from './storage.js';
import { clearRabbitMirrorPrompt } from './injector.js';
import { triggerPlainTextRescue, triggerCodeBlockRescue, triggerInteractionRescue, triggerInteractionDiagnosticOnce } from './outputSanitizer.js';

function checked(id, value) {
    $(id).prop('checked', !!value);
}

export function initRabbitMirrorUI() {
    const settings = getSettings();
    const noSendRegex = '/```(?:html|xml|HTML|XML)?\\s*<toto\\b[^>]*>[\\s\\S]*?<\\/toto>\\s*```|<toto\\b[^>]*>[\\s\\S]*?<\\/toto>\\s*/gi';
    if ($('#rabbit_mirror_theater_settings').length) return;

    const html = `
<div id="rabbit_mirror_theater_settings" class="rabbit-mirror-settings">
  <div class="inline-drawer">
    <div class="inline-drawer-toggle inline-drawer-header">
      <b>兔子镜小剧场 / Rabbit Mirror Theater</b><span class="rabbit-mirror-toto-watermark">Toto v0.32.35</span>
      <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
    </div>
    <div class="inline-drawer-content">
      <label class="checkbox_label"><input id="rh_enabled" type="checkbox"> 兔子镜自动注入</label>
      <div class="rabbit-mirror-subnote" style="margin:-2px 0 6px 26px;opacity:.72;font-size:12px;line-height:1.45;">开启后每轮自动追加兔子镜规则。</div>

      <label for="rh_sampling_mode" class="flex-container alignitemscenter" style="gap:8px;flex-wrap:wrap;margin:8px 0;">
        <span>抽取模式</span>
        <select id="rh_sampling_mode" class="text_pole" style="max-width:260px;">
          <option value="classic">主题元素 + 展现形式（经典模式）</option>
          <option value="format_only">仅展现形式</option>
        </select>
      </label>

      <label class="checkbox_label"><input id="rh_creative_expansion" type="checkbox"> 发散孵化模式（测试版）</label>
      <div class="rabbit-mirror-subnote" style="margin:-2px 0 6px 26px;opacity:.72;font-size:12px;line-height:1.45;">开启后，主题元素与展现形式只作为灵感基底，允许根据正文氛围发散出元素库之外的新内容、新媒介、新细节与新结构。</div>

      <label class="checkbox_label"><input id="rh_force_visual_scenery" type="checkbox"> Visual Scenery</label>
      <div class="rabbit-mirror-subnote" style="margin:-2px 0 6px 26px;opacity:.72;font-size:12px;line-height:1.45;">开启后强制生成一幅完整、统一、会持续变化的 CSS 动态插画；主场景承担动画，文字仅作画内题签，交互融入景物或透明热区。</div>

      <label class="checkbox_label"><input id="rh_user_directive" type="checkbox"> 用户指令优先（正文/兔子镜点播）</label>

      <label class="checkbox_label"><input id="rh_avoid_repeat" type="checkbox"> 10轮冷却：避免重复主题/展现形式/整体观感</label>
      <div class="rabbit-mirror-subnote" style="margin:-2px 0 6px 26px;opacity:.72;font-size:12px;line-height:1.45;">仅记录已经实际生成成功的兔子镜；用于避免连续复用相近的结构骨架与整体视觉家族。</div>

      <div class="rabbit-mirror-emergency rabbit-mirror-emergency-prominent" style="margin:12px 0 10px 0;padding:10px;border:1px solid var(--SmartThemeBorderColor);border-radius:8px;line-height:1.55;">
        <label class="checkbox_label" style="font-weight:600;"><input id="rh_plaintext_rescue" type="checkbox"> 纯文字急救</label>
        <div class="rabbit-mirror-subnote" style="margin:-2px 0 8px 26px;opacity:.78;font-size:12px;line-height:1.45;">仅在画面已经出现 CSS ERROR 时处理：读取整条兔子镜中的变量并安全展开、即时重绘。健康 UI 即使使用 var(...) 也不会被预防性改写。关闭后，代码块急救不会代替它触发 CSS ERROR 重绘。不会改 Prompt。</div>
        <label class="checkbox_label" style="font-weight:600;"><input id="rh_codeblock_rescue" type="checkbox"> 代码块急救模式</label>
        <div class="rabbit-mirror-subnote" style="margin:-2px 0 8px 26px;opacity:.78;font-size:12px;line-height:1.45;">兔子镜变成代码块时临时开启；先恢复为真实 DOM，不改已有主容器 UI。</div>
        <label class="checkbox_label" style="font-weight:600;"><input id="rh_interaction_rescue" type="checkbox"> 智能交互急救（实验版）</label>
        <div class="rabbit-mirror-subnote" style="margin:-2px 0 0 26px;opacity:.78;font-size:12px;line-height:1.45;">自动识别 checked、hover、嵌套 details、:target，以及简单的 onclick/onmouseover/onchange 伪交互；触屏会转换为安全点击或状态切换。可与代码块急救同时开启，固定先恢复代码、再修交互。</div>
        <button id="rh_interaction_diagnostic_once" class="menu_button" type="button" style="margin-top:8px;">开始一次交互诊断</button>
        <div class="rabbit-mirror-subnote" style="margin:4px 0 0 0;opacity:.78;font-size:12px;line-height:1.45;">点击后只等待你在聊天区操作一次出错的交互；捕获完成即自动停止，不持续扫描。报告可复制诊断文字、原始源码与实际渲染代码。</div>
      </div>

      <div class="rabbit-mirror-regex-helper" style="margin:10px 0;padding:10px;border:1px solid var(--SmartThemeBorderColor);border-radius:8px;line-height:1.55;">
        <div style="font-weight:600;margin-bottom:6px;">不发送小剧场正则</div>
        <div style="opacity:.82;font-size:12px;margin-bottom:8px;">设置：替换留空／勾选 AI输出／勾选 仅格式提示词</div>
        <button id="rh_copy_regex" class="menu_button" type="button">复制推荐正则</button>
      </div>

      <div class="rabbit-mirror-actions">
        <button id="rh_clear_last" class="menu_button">清除历史与冷却记录</button>
        <button id="rh_clear_injection" class="menu_button">清空当前注入</button>
        <button id="rh_reset" class="menu_button">恢复默认设置</button>
      </div>
    </div>
  </div>
</div>`;

    $('#extensions_settings2').append(html);

    checked('#rh_enabled', settings.autoRabbitMirrorInjection !== false && settings.enabled !== false);
    checked('#rh_plaintext_rescue', settings.plainTextRescueMode);
    checked('#rh_codeblock_rescue', settings.codeBlockRescueMode);
    checked('#rh_interaction_rescue', settings.interactionRescueMode);
    $('#rh_sampling_mode').val(settings.samplingMode || 'classic');
    checked('#rh_user_directive', settings.userDirectivePriority);
    checked('#rh_creative_expansion', settings.creativeExpansionMode);
    checked('#rh_force_visual_scenery', settings.forceVisualScenery);
    checked('#rh_avoid_repeat', settings.avoidRepeat);

    $('#rh_enabled').on('change', e => updateSettings({ enabled: e.target.checked, autoRabbitMirrorInjection: e.target.checked, mode: e.target.checked ? 'integrated' : 'off' }));
    $('#rh_plaintext_rescue').on('change', e => {
        updateSettings({ plainTextRescueMode: e.target.checked });
        if (e.target.checked) {
            toastr?.info?.('已开启纯文字急救：仅对已显示 CSS ERROR 的兔子镜安全展开变量并重绘；健康 UI 不会被改写。');
            setTimeout(() => triggerPlainTextRescue(), 80);
            setTimeout(() => triggerPlainTextRescue(), 350);
            setTimeout(() => triggerPlainTextRescue(), 900);
        } else {
            toastr?.success?.('已关闭纯文字急救：后续不再执行 CSS ERROR 检测、变量展开或纯文字强制重绘；已修复消息保持现状。');
        }
    });
    $('#rh_codeblock_rescue').on('change', e => {
        updateSettings({ codeBlockRescueMode: e.target.checked });
        if (e.target.checked) {
            toastr?.info?.('已开启代码块急救模式：正在尝试修复当前聊天中的代码块兔子镜。查看完成后建议关闭，以免影响后续 UI 发挥。');
            setTimeout(() => triggerCodeBlockRescue(), 80);
            setTimeout(() => triggerCodeBlockRescue(), 350);
            setTimeout(() => triggerCodeBlockRescue(), 900);
        } else {
            toastr?.success?.('已关闭代码块急救模式：后续兔子镜将恢复自由渲染。');
        }
    });
    $('#rh_interaction_rescue').on('change', e => {
        updateSettings({ interactionRescueMode: e.target.checked });
        if (e.target.checked) {
            toastr?.info?.('已开启智能交互急救：正在识别当前兔子镜的交互类型并选择修复路径；与代码块急救同时开启时，会先恢复代码再修交互。');
            const runRescueChain = () => (getSettings().plainTextRescueMode || getSettings().codeBlockRescueMode)
                ? triggerCodeBlockRescue()
                : triggerInteractionRescue();
            setTimeout(runRescueChain, 80);
            setTimeout(runRescueChain, 350);
            setTimeout(runRescueChain, 900);
        } else {
            toastr?.success?.('已关闭智能交互急救：后续不再处理尚未急救的新兔子镜；已救过的旧消息仍会保持修复。');
        }
    });
    $('#rh_interaction_diagnostic_once').on('click', () => {
        const started = triggerInteractionDiagnosticOnce();
        if (started) {
            toastr?.info?.('一次性诊断已就绪：请在聊天区点击一次出错的兔子镜交互。捕获后会自动停止并显示报告。');
        } else {
            toastr?.warning?.('未找到聊天区域，暂时无法开始诊断。请进入具体聊天后重试。');
        }
    });
    $('#rh_sampling_mode').on('change', e => updateSettings({ samplingMode: e.target.value }));
    $('#rh_user_directive').on('change', e => updateSettings({ userDirectivePriority: e.target.checked }));
    $('#rh_creative_expansion').on('change', e => updateSettings({ creativeExpansionMode: e.target.checked }));
    $('#rh_force_visual_scenery').on('change', e => updateSettings({ forceVisualScenery: e.target.checked }));
    $('#rh_avoid_repeat').on('change', e => updateSettings({ avoidRepeat: e.target.checked }));

    $('#rh_copy_regex').on('click', async () => {
        try {
            await navigator.clipboard.writeText(noSendRegex);
            toastr?.success?.('已复制推荐正则');
        } catch (error) {
            const textarea = document.createElement('textarea');
            textarea.value = noSendRegex;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.focus();
            textarea.select();
            document.execCommand('copy');
            textarea.remove();
            toastr?.success?.('已复制推荐正则');
        }
    });

    $('#rh_clear_last').on('click', () => {
        clearLastCombo();
        toastr?.success?.('已清除兔子镜上轮组合记录');
    });
    $('#rh_clear_injection').on('click', () => {
        clearRabbitMirrorPrompt();
        toastr?.success?.('已清空当前兔子镜注入');
    });
    $('#rh_reset').on('click', () => {
        resetSettings();
        location.reload();
    });
}
