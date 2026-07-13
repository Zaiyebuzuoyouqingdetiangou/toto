import { getSettings, updateSettings, resetSettings } from './settings.js';
import { clearLastCombo } from './storage.js';
import { clearRabbitMirrorPrompt } from './injector.js';
import { triggerCodeBlockRescue, triggerInteractionRescue } from './outputSanitizer.js';

const PANEL_ID = 'rabbit_mirror_theater_settings';
const VERSION = '0.31.80';

function notify(type, message) {
    try {
        const api = globalThis.toastr;
        if (api && typeof api[type] === 'function') api[type](message);
    } catch {}
}

function findSettingsMount() {
    const selectors = [
        '#extensions_settings2',
        '#extensions_settings',
        '#extensions_settings_content',
        '.extensions_settings',
        '#extensions-settings',
        '#extensions_settings_page',
    ];
    for (const selector of selectors) {
        const node = document.querySelector(selector);
        if (node) return { node, fallback: false };
    }
    return document.body ? { node: document.body, fallback: true } : null;
}

function setChecked(root, id, value) {
    const input = root.querySelector(`#${id}`);
    if (input) input.checked = Boolean(value);
}

function setValue(root, id, value) {
    const input = root.querySelector(`#${id}`);
    if (input) input.value = value;
}

function persist(patch) {
    try {
        updateSettings(patch);
        return true;
    } catch (error) {
        console.error('[RabbitMirror] settings update failed', patch, error);
        notify('error', '兔子镜设置保存失败，请查看浏览器控制台。');
        return false;
    }
}

function buildHtml(isFallback) {
    return `
<div id="${PANEL_ID}" class="rabbit-mirror-settings${isFallback ? ' rabbit-mirror-floating-fallback' : ''}" data-rabbit-mirror-panel="true">
  <div class="inline-drawer">
    <div class="inline-drawer-toggle inline-drawer-header">
      <b>兔子镜小剧场 / Rabbit Mirror Theater</b><span class="rabbit-mirror-toto-watermark">Toto v${VERSION}</span>
      <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
    </div>
    <div class="inline-drawer-content">
      ${isFallback ? '<div class="rabbit-mirror-fallback-note">未找到酒馆扩展设置容器，已启用备用面板。</div>' : ''}
      <label class="checkbox_label"><input id="rh_enabled" type="checkbox"> 兔子镜自动注入</label>
      <div class="rabbit-mirror-subnote">开启后每轮自动追加兔子镜规则。</div>

      <label for="rh_sampling_mode" class="flex-container alignitemscenter rabbit-mirror-row">
        <span>抽取模式</span>
        <select id="rh_sampling_mode" class="text_pole">
          <option value="classic">主题元素 + 展现形式（经典模式）</option>
          <option value="format_only">仅展现形式</option>
        </select>
      </label>

      <label class="checkbox_label"><input id="rh_creative_expansion" type="checkbox"> 发散孵化模式（测试版）</label>
      <div class="rabbit-mirror-subnote">开启后允许在主题与展现形式基础上扩展新媒介、新细节与新结构。</div>

      <label class="checkbox_label"><input id="rh_force_visual_scenery" type="checkbox"> 动态视觉模式</label>
      <div class="rabbit-mirror-subnote">开启后画面主体必须包含自动持续运行、肉眼可见的 CSS 动画。</div>

      <label class="checkbox_label"><input id="rh_force_interactive" type="checkbox"> 每轮可交互模式（测试版）</label>
      <div class="rabbit-mirror-subnote">开启后每轮内部必须包含无需 JS 的真实交互。</div>

      <label class="checkbox_label"><input id="rh_user_directive" type="checkbox"> 用户指令优先（正文/兔子镜点播）</label>
      <label class="checkbox_label"><input id="rh_ui_audit" type="checkbox"> UI 自查优化 / 丰富版式</label>
      <label class="checkbox_label"><input id="rh_avoid_repeat" type="checkbox"> 10轮冷却：避免重复主题/展现形式/近似视觉观感</label>

      <div class="rabbit-mirror-emergency rabbit-mirror-emergency-prominent">
        <label class="checkbox_label"><input id="rh_codeblock_rescue" type="checkbox"> 代码块急救模式</label>
        <div class="rabbit-mirror-subnote">兔子镜变成代码块时临时开启；先恢复真实 DOM，不改已有主容器 UI。</div>
        <label class="checkbox_label"><input id="rh_interaction_rescue" type="checkbox"> 智能交互急救（实验版）</label>
        <div class="rabbit-mirror-subnote">识别 checked、hover、嵌套 details 与 :target，并选择对应修复路径。</div>
      </div>

      <div class="rabbit-mirror-regex-helper">
        <div style="font-weight:600;margin-bottom:6px;">不发送小剧场正则</div>
        <button id="rh_copy_regex" class="menu_button" type="button">复制推荐正则</button>
      </div>

      <div class="rabbit-mirror-actions">
        <button id="rh_clear_last" class="menu_button" type="button">清除历史与冷却记录</button>
        <button id="rh_clear_injection" class="menu_button" type="button">清空当前注入</button>
        <button id="rh_reset" class="menu_button" type="button">恢复默认设置</button>
      </div>
    </div>
  </div>
</div>`;
}

function bindCheckbox(root, id, key, onChange = null) {
    const input = root.querySelector(`#${id}`);
    if (!input) return;
    input.style.pointerEvents = 'auto';
    input.addEventListener('click', event => event.stopPropagation());
    input.addEventListener('change', event => {
        const value = Boolean(event.currentTarget.checked);
        persist({ [key]: value });
        if (typeof onChange === 'function') onChange(value);
    });
}

function mountRabbitMirrorUI() {
    if (document.getElementById(PANEL_ID)) return true;
    const target = findSettingsMount();
    if (!target) return false;

    target.node.insertAdjacentHTML('beforeend', buildHtml(target.fallback));
    const root = document.getElementById(PANEL_ID);
    if (!root) return false;

    const settings = getSettings();
    setChecked(root, 'rh_enabled', settings.autoRabbitMirrorInjection !== false && settings.enabled !== false);
    setChecked(root, 'rh_codeblock_rescue', settings.codeBlockRescueMode);
    setChecked(root, 'rh_interaction_rescue', settings.interactionRescueMode);
    setValue(root, 'rh_sampling_mode', settings.samplingMode || 'classic');
    setChecked(root, 'rh_user_directive', settings.userDirectivePriority);
    setChecked(root, 'rh_creative_expansion', settings.creativeExpansionMode);
    setChecked(root, 'rh_force_visual_scenery', settings.forceVisualScenery);
    setChecked(root, 'rh_force_interactive', settings.forceInteractiveMode);
    setChecked(root, 'rh_ui_audit', settings.uiAudit);
    setChecked(root, 'rh_avoid_repeat', settings.avoidRepeat);

    bindCheckbox(root, 'rh_enabled', 'enabled', value => {
        persist({ autoRabbitMirrorInjection: value, mode: value ? 'integrated' : 'off' });
    });
    bindCheckbox(root, 'rh_creative_expansion', 'creativeExpansionMode');
    bindCheckbox(root, 'rh_force_visual_scenery', 'forceVisualScenery');
    bindCheckbox(root, 'rh_force_interactive', 'forceInteractiveMode');
    bindCheckbox(root, 'rh_user_directive', 'userDirectivePriority');
    bindCheckbox(root, 'rh_ui_audit', 'uiAudit');
    bindCheckbox(root, 'rh_avoid_repeat', 'avoidRepeat');

    bindCheckbox(root, 'rh_codeblock_rescue', 'codeBlockRescueMode', value => {
        if (!value) return notify('success', '已关闭代码块急救模式。');
        notify('info', '已开启代码块急救模式，正在扫描当前聊天。');
        [80, 350, 900].forEach(ms => setTimeout(() => triggerCodeBlockRescue(), ms));
    });

    bindCheckbox(root, 'rh_interaction_rescue', 'interactionRescueMode', value => {
        if (!value) return notify('success', '已关闭智能交互急救。');
        notify('info', '已开启智能交互急救，正在扫描当前聊天。');
        const run = () => getSettings().codeBlockRescueMode ? triggerCodeBlockRescue() : triggerInteractionRescue();
        [80, 350, 900].forEach(ms => setTimeout(run, ms));
    });

    root.querySelector('#rh_sampling_mode')?.addEventListener('change', event => {
        persist({ samplingMode: event.currentTarget.value });
    });

    const noSendRegex = '/```(?:html|xml|HTML|XML)?\\s*<toto\\b[^>]*>[\\s\\S]*?<\\/toto>\\s*```|<toto\\b[^>]*>[\\s\\S]*?<\\/toto>\\s*/gi';
    root.querySelector('#rh_copy_regex')?.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(noSendRegex);
            notify('success', '已复制推荐正则');
        } catch {
            const textarea = document.createElement('textarea');
            textarea.value = noSendRegex;
            textarea.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            textarea.remove();
            notify('success', '已复制推荐正则');
        }
    });

    root.querySelector('#rh_clear_last')?.addEventListener('click', () => {
        clearLastCombo();
        notify('success', '已清除兔子镜历史与冷却记录');
    });
    root.querySelector('#rh_clear_injection')?.addEventListener('click', () => {
        clearRabbitMirrorPrompt();
        notify('success', '已清空当前兔子镜注入');
    });
    root.querySelector('#rh_reset')?.addEventListener('click', () => {
        resetSettings();
        location.reload();
    });

    console.log('[RabbitMirror] native settings panel mounted', { fallback: target.fallback });
    return true;
}

export function initRabbitMirrorUI() {
    if (document.getElementById(PANEL_ID)) return;
    let attempts = 0;
    const tryMount = () => {
        attempts += 1;
        try {
            return mountRabbitMirrorUI();
        } catch (error) {
            console.error('[RabbitMirror] native panel mount failed', error);
            notify('error', '兔子镜设置面板加载失败。');
            return false;
        }
    };

    if (tryMount()) return;
    const timer = setInterval(() => {
        if (tryMount() || attempts >= 80) clearInterval(timer);
    }, 250);
}
