import { getSettings, updateSettings, resetSettings } from './settings.js';
import { clearLastCombo } from './storage.js';
import { clearRabbitHolePrompt } from './injector.js';

function checked(id, value) {
    $(id).prop('checked', !!value);
}

function val(id, value) {
    $(id).val(String(value));
}

export function initRabbitHoleUI() {
    const settings = getSettings();
    if ($('#rabbit_hole_theater_settings').length) return;

    const html = `
<div id="rabbit_hole_theater_settings" class="rabbit-hole-settings">
  <div class="inline-drawer">
    <div class="inline-drawer-toggle inline-drawer-header">
      <b>兔子洞小剧场 / Rabbit Hole Theater</b>
      <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
    </div>
    <div class="inline-drawer-content">
      <label class="checkbox_label"><input id="rh_enabled" type="checkbox"> 启用自动注入</label>
      <label>模式</label>
      <select id="rh_mode" class="text_pole">
        <option value="independent">Independent：独立兔子洞，不引用正文</option>
        <option value="canon">Canon：正文衍生，可用弹幕/演员回看/后日谈</option>
        <option value="off">Off：关闭</option>
      </select>
      <label>Raw Policy / 原始规则注入策略</label>
      <select id="rh_raw_policy" class="text_pole">
        <option value="balanced">balanced：保留执行规则+通用规则+本轮抽取条目（推荐）</option>
        <option value="minimal">minimal：尽量少注入，只保留核心规则和本轮条目</option>
        <option value="full">full：每轮注入完整原始母本（非常占 token）</option>
      </select>
      <div class="flex-container alignItemsCenter gap5">
        <label>主题数量</label><input id="rh_themes_min" type="number" min="1" max="3" class="text_pole rh-num"><span>～</span><input id="rh_themes_max" type="number" min="1" max="3" class="text_pole rh-num">
      </div>
      <div class="flex-container alignItemsCenter gap5">
        <label>展现形式数量</label><input id="rh_formats_min" type="number" min="1" max="2" class="text_pole rh-num"><span>～</span><input id="rh_formats_max" type="number" min="1" max="2" class="text_pole rh-num">
      </div>
      <div class="flex-container alignItemsCenter gap5">
        <label>注入深度</label><input id="rh_depth" type="number" min="0" max="20" class="text_pole rh-num">
        <label>角色</label>
        <select id="rh_role" class="text_pole">
          <option value="system">system</option>
          <option value="user">user</option>
          <option value="assistant">assistant</option>
        </select>
      </div>
      <label class="checkbox_label"><input id="rh_show_wonderland" type="checkbox"> 输出 &lt;wonderland&gt; 执行摘要</label>
      <label class="checkbox_label"><input id="rh_safety" type="checkbox"> 启用安全补丁</label>
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
        原始四大模块完整保存在 <code>data/raw/</code>；结构化随机索引保存在 <code>data/structured/</code>。默认不会把完整主题库/展现形式库每轮全塞进 prompt。
      </div>
    </div>
  </div>
</div>`;

    $('#extensions_settings2').append(html);

    checked('#rh_enabled', settings.enabled);
    val('#rh_mode', settings.mode);
    val('#rh_raw_policy', settings.rawPolicy);
    val('#rh_themes_min', settings.themesMin);
    val('#rh_themes_max', settings.themesMax);
    val('#rh_formats_min', settings.formatsMin);
    val('#rh_formats_max', settings.formatsMax);
    val('#rh_depth', settings.depth);
    val('#rh_role', settings.role);
    checked('#rh_show_wonderland', settings.showWonderland);
    checked('#rh_safety', settings.includeSafetyPatch);
    checked('#rh_avoid_repeat', settings.avoidRepeat);
    checked('#rh_skip_quiet', settings.skipQuiet);
    checked('#rh_skip_impersonate', settings.skipImpersonate);
    checked('#rh_debug', settings.debug);

    $('#rh_enabled').on('change', e => updateSettings({ enabled: e.target.checked }));
    $('#rh_mode').on('change', e => updateSettings({ mode: e.target.value }));
    $('#rh_raw_policy').on('change', e => updateSettings({ rawPolicy: e.target.value }));
    $('#rh_themes_min').on('change', e => updateSettings({ themesMin: Number(e.target.value) || 1 }));
    $('#rh_themes_max').on('change', e => updateSettings({ themesMax: Number(e.target.value) || 3 }));
    $('#rh_formats_min').on('change', e => updateSettings({ formatsMin: Number(e.target.value) || 1 }));
    $('#rh_formats_max').on('change', e => updateSettings({ formatsMax: Number(e.target.value) || 2 }));
    $('#rh_depth').on('change', e => updateSettings({ depth: Number(e.target.value) || 0 }));
    $('#rh_role').on('change', e => updateSettings({ role: e.target.value }));
    $('#rh_show_wonderland').on('change', e => updateSettings({ showWonderland: e.target.checked }));
    $('#rh_safety').on('change', e => updateSettings({ includeSafetyPatch: e.target.checked }));
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
