import { getSettings, updateSettings, resetSettings } from './settings.js';
import { clearLastCombo } from './storage.js';
import { clearRabbitHolePrompt } from './injector.js';

function checked(id, value) {
    $(id).prop('checked', !!value);
}

export function initRabbitHoleUI() {
    const settings = getSettings();
    if ($('#rabbit_hole_theater_settings').length) return;

    const html = `
<div id="rabbit_hole_theater_settings" class="rabbit-hole-settings">
  <div class="inline-drawer">
    <div class="inline-drawer-toggle inline-drawer-header">
      <b>兔子洞小剧场 / Rabbit Hole Theater</b><span class="rabbit-hole-toto-watermark">Toto</span>
      <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
    </div>
    <div class="inline-drawer-content">
      <label class="checkbox_label"><input id="rh_enabled" type="checkbox"> 启用兔子洞自动注入</label>

      <div class="rabbit-hole-status-card">
        <div class="rabbit-hole-status-title">当前模式：一体化自动协议</div>
        <div class="rabbit-hole-status-line">完整原始四大模块保存在 <code>data/raw/</code>。</div>
        <div class="rabbit-hole-status-line">结构化索引只作为目录；每轮抽到 ID 后，会到 data/raw/ 母本中检索对应完整描述。</div>
        <div class="rabbit-hole-status-line">抽到正文衍生类条目时自动使用正文衍生分支；其他情况自动按独立兔子洞执行。</div>
      </div>

      <label class="checkbox_label"><input id="rh_show_cot" type="checkbox"> 输出 &lt;thinking&gt; 执行摘要</label>
      <label class="checkbox_label"><input id="rh_avoid_repeat" type="checkbox"> 避免连续重复主题/展现形式</label>
      <label class="checkbox_label"><input id="rh_skip_quiet" type="checkbox"> 跳过 quiet 后台生成</label>
      <label class="checkbox_label"><input id="rh_skip_impersonate" type="checkbox"> 跳过 impersonate 生成</label>
      <label class="checkbox_label"><input id="rh_debug" type="checkbox"> 控制台调试日志</label>

      <div class="rabbit-hole-actions">
        <button id="rh_clear_last" class="menu_button">清除上轮组合记录</button>
        <button id="rh_clear_injection" class="menu_button">清空当前注入</button>
        <button id="rh_reset" class="menu_button">恢复默认设置</button>
      </div>

      <div class="notes">
        这版不会把兔子洞拆成多个手动模式；兔子洞按一个整体协议自动运行，并采用 ID → 母本片段检索。Toto 仅作为本设置界面水印，不会要求生成进小剧场。
      </div>
    </div>
  </div>
</div>`;

    $('#extensions_settings2').append(html);

    checked('#rh_enabled', settings.enabled);
    checked('#rh_show_cot', settings.showCot);
    checked('#rh_avoid_repeat', settings.avoidRepeat);
    checked('#rh_skip_quiet', settings.skipQuiet);
    checked('#rh_skip_impersonate', settings.skipImpersonate);
    checked('#rh_debug', settings.debug);

    $('#rh_enabled').on('change', e => updateSettings({ enabled: e.target.checked, mode: e.target.checked ? 'integrated' : 'off' }));
    $('#rh_show_cot').on('change', e => updateSettings({ showCot: e.target.checked }));
    $('#rh_avoid_repeat').on('change', e => updateSettings({ avoidRepeat: e.target.checked }));
    $('#rh_skip_quiet').on('change', e => updateSettings({ skipQuiet: e.target.checked }));
    $('#rh_skip_impersonate').on('change', e => updateSettings({ skipImpersonate: e.target.checked }));
    $('#rh_debug').on('change', e => updateSettings({ debug: e.target.checked }));

    $('#rh_clear_last').on('click', () => {
        clearLastCombo();
        toastr?.success?.('已清除兔子洞上轮组合记录');
    });
    $('#rh_clear_injection').on('click', () => {
        clearRabbitHolePrompt();
        toastr?.success?.('已清空当前兔子洞注入');
    });
    $('#rh_reset').on('click', () => {
        resetSettings();
        location.reload();
    });
}
