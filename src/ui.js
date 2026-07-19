import { getSettings, updateSettings, resetSettings } from './settings.js';
import { clearLastCombo } from './storage.js';
import { clearRabbitMirrorPrompt } from './injector.js';
import { refreshMaintenanceRabbits, triggerInteractionDiagnosticOnce } from './outputSanitizer.js';
import { scanMemoryPlugins, testMemoryProvider } from './memoryScanner.js';

function checked(id, value) {
    $(id).prop('checked', !!value);
}

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function renderMemoryScanResults(results) {
    const settings = getSettings();
    const selected = new Set(settings.memoryProviderIds || []);
    const container = $('#rh_memory_scan_results');
    if (!container.length) return;

    const list = Array.isArray(results) ? results : [];
    const readable = list.filter(item => item?.readable && item?.selectedAllowed);
    const pending = list.filter(item => !item?.readable);

    const contextBlock = `<div class="rh-memory-context" style="padding:8px 0 9px 0;">
      <div style="font-size:12px;"><b>当前模型上下文</b> <span style="font-size:11px;opacity:.82;">[已可用]</span></div>
      <div style="margin-top:3px;opacity:.68;font-size:11px;line-height:1.45;">近期对话、已注入世界书，以及模型当前已经获得的摘要或总结；无需由兔子镜重复读取。</div>
    </div>`;

    const readableRows = readable.map(item => {
        const checkedAttr = selected.has(item.id) ? ' checked' : '';
        return `<div class="rh-memory-provider" style="padding:8px 0;border-top:1px solid color-mix(in srgb, var(--SmartThemeBorderColor) 65%, transparent);">
          <label class="checkbox_label" style="align-items:flex-start;">
            <input class="rh-memory-provider-check" type="checkbox" data-provider-id="${escapeHtml(item.id)}"${checkedAttr}>
            <span><b>${escapeHtml(item.name)}</b> <span style="font-size:11px;opacity:.82;">[可读取]</span><br><span style="opacity:.7;font-size:11px;line-height:1.45;">来源类型：公开资料接口</span></span>
          </label>
          ${item.details ? `<div style="margin:3px 0 0 26px;opacity:.62;font-size:11px;line-height:1.4;word-break:break-word;">${escapeHtml(item.details)}</div>` : ''}
          <button class="menu_button rh-memory-test" type="button" data-provider-id="${escapeHtml(item.id)}" style="margin:6px 0 0 26px;padding:3px 8px;min-height:unset;font-size:12px;">测试读取</button>
        </div>`;
    }).join('');

    const readableBlock = readableRows || '<div style="opacity:.75;font-size:12px;line-height:1.5;padding:6px 0;">未检测到可额外读取的资料来源。</div>';

    let pendingBlock = '';
    if (pending.length) {
        const visiblePending = pending.slice(0, 10);
        const pendingRows = visiblePending.map(item => `<div style="padding:5px 0;border-top:1px solid color-mix(in srgb, var(--SmartThemeBorderColor) 45%, transparent);">
          <div style="font-size:12px;"><b>${escapeHtml(item.name)}</b> <span style="opacity:.58;font-size:11px;">[待适配]</span></div>
          <div style="opacity:.6;font-size:11px;line-height:1.4;word-break:break-word;">${escapeHtml(item.source || item.status || '')}</div>
        </div>`).join('');
        const omitted = pending.length > visiblePending.length
            ? `<div style="padding-top:5px;opacity:.58;font-size:11px;">另有 ${pending.length - visiblePending.length} 个候选未展开显示。</div>`
            : '';
        pendingBlock = `<details class="rh-memory-pending" style="margin-top:8px;border-top:1px dashed color-mix(in srgb, var(--SmartThemeBorderColor) 60%, transparent);padding-top:7px;">
          <summary style="cursor:pointer;font-size:12px;opacity:.72;">其他候选（${pending.length}）</summary>
          <div style="padding:4px 0 0 10px;">${pendingRows}${omitted}</div>
        </details>`;
    }

    if (!readable.length && !pending.length) {
        container.html(`${contextBlock}<div style="opacity:.75;font-size:12px;line-height:1.5;padding:6px 0;">未扫描到可额外读取的资料来源。</div>`);
        return;
    }
    container.html(`${contextBlock}${readableBlock}${pendingBlock}`);
}

function memoryTestMessage(result) {
    if (!result?.ok) return `读取失败：${result?.error || '未知错误'}`;
    const parts = [
        `${result.providerName || '资料来源'}读取成功`,
        `资料正文 ${result.chars} 字符`,
        result.characterName ? `角色：${result.characterName}` : '',
        result.chatId ? `聊天：${result.chatId}` : '',
        result.coverageComplete === false ? `覆盖不完整（缺失 ${result.missingFloors || 0} 个 AI 楼层）` : '',
        `耗时 ${result.elapsed || 0}ms`,
    ].filter(Boolean);
    return parts.join('；');
}

export function initRabbitMirrorUI() {
    const settings = getSettings();
    const noSendRegex = '/<toto\\b[^>]*>[\\s\\S]*?<\\/toto>\\s*/gi';
    if ($('#rabbit_mirror_theater_settings').length) return;

    const html = `
<div id="rabbit_mirror_theater_settings" class="rabbit-mirror-settings">
  <div class="inline-drawer">
    <div class="inline-drawer-toggle inline-drawer-header">
      <b>兔子镜小剧场 / Rabbit Mirror Theater <span style="font-size:11px;opacity:.72;">[小小维修兔 v1.2＋Menu QR v2.1 测试版]</span></b><span class="rabbit-mirror-toto-watermark">Toto v0.33.2 TEST</span>
      <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
    </div>
    <div class="inline-drawer-content">
      <div class="rabbit-mirror-primary-toggle">
        <label class="checkbox_label"><input id="rh_enabled" type="checkbox"> 兔子镜自动注入</label>
        <div class="rabbit-mirror-subnote" style="margin:-2px 0 0 26px;opacity:.72;font-size:12px;line-height:1.45;">开启后每轮自动追加兔子镜规则。</div>
      </div>

      <details class="rabbit-mirror-section">
        <summary><span>生成设置</span><span class="rabbit-mirror-section-note">抽取・视觉・冷却</span></summary>
        <div class="rabbit-mirror-section-content">
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
          <div class="rabbit-mirror-subnote" style="margin:-2px 0 6px 26px;opacity:.72;font-size:12px;line-height:1.45;">开启后强制生成一幅完整、统一、会持续变化的 CSS 动态视觉画面；画面本体承担持续动画，并保留由本轮内容自然产生的交互变化。</div>

          <label class="checkbox_label"><input id="rh_user_directive" type="checkbox"> 用户指令优先（正文/兔子镜点播）</label>
          <div class="rabbit-mirror-qr-download">
            <button id="rh_download_order_qr" class="menu_button" type="button">下载 RabbitMirror 点菜 QR（v2.1）</button>
            <div class="rabbit-mirror-subnote">下载后请在快捷回复中手动导入。</div>
          </div>

          <label class="checkbox_label"><input id="rh_avoid_repeat" type="checkbox"> 10轮冷却：避免重复主题/展现形式/整体观感</label>
          <div class="rabbit-mirror-subnote" style="margin:-2px 0 2px 26px;opacity:.72;font-size:12px;line-height:1.45;">仅记录已经实际生成成功的兔子镜；用于避免连续复用相近的结构骨架与整体视觉家族。</div>
        </div>
      </details>

      <details class="rabbit-mirror-section rabbit-mirror-memory-test">
        <summary><span>共同回忆资料来源</span><span class="rabbit-mirror-section-note">TEST</span></summary>
        <div class="rabbit-mirror-section-content">
          <label class="checkbox_label"><input id="rh_memory_scan_enabled" type="checkbox"> 启用额外资料来源（测试）</label>
          <div class="rabbit-mirror-subnote" style="margin:-2px 0 8px 26px;opacity:.76;font-size:12px;line-height:1.45;">只有抽中 I.1「共同回忆」时才读取已勾选的额外资料；普通轮次不追加资料正文。当前对话与已注入世界书由模型直接使用，不会重复读取。</div>
          <button id="rh_memory_scan_now" class="menu_button" type="button">扫描可用资料来源</button>
          <div style="margin-top:6px;opacity:.68;font-size:11px;line-height:1.45;">列出模型已可见资料与检测到的额外资料来源；请勾选需要额外读取的项目。其他候选默认收起。</div>
          <div id="rh_memory_scan_results" style="margin-top:8px;"></div>
        </div>
      </details>

      <details class="rabbit-mirror-section rabbit-mirror-emergency rabbit-mirror-emergency-prominent">
        <summary><span>急救与诊断</span><span class="rabbit-mirror-section-note">故障时展开</span></summary>
        <div class="rabbit-mirror-section-content">
          <label class="checkbox_label" style="font-weight:700;"><input id="rh_maintenance_rabbit" type="checkbox"> 🐇 启用小小维修兔</label>
          <div class="rabbit-mirror-subnote" style="margin:-2px 0 8px 26px;opacity:.78;font-size:12px;line-height:1.5;">在每条已渲染兔子镜标题后安装独立维修入口；一只维修兔只负责当前这一条，不扫描或修改其他兔子镜。</div>
          <div class="rabbit-mirror-maintenance-help" style="margin-top:8px;padding:10px 0;border-top:1px dashed color-mix(in srgb, var(--SmartThemeBorderColor) 62%, transparent);border-bottom:1px dashed color-mix(in srgb, var(--SmartThemeBorderColor) 62%, transparent);">
            <div style="font-weight:700;margin-bottom:5px;">🐇 小小维修兔 v1.1</div>
            <div class="rabbit-mirror-subnote" style="opacity:.8;font-size:12px;line-height:1.55;">🐇⚪ 点击巡逻；🐇🟢 当前条目正常；🐇🟡 再点一次，仅维修当前条目；🐇🔴 点击后直接生成当前条目的全链路诊断。</div>
            <div class="rabbit-mirror-subnote" style="margin-top:5px;opacity:.72;font-size:12px;line-height:1.5;">代码块／纯文字恢复、交互恢复、源码与 SVG 保主体能力已归入维修兔内部，不再提供互相重叠的旧急救开关。没有证据证明它损坏，就不会修改。</div>
          </div>
          <button id="rh_interaction_diagnostic_once" class="menu_button" type="button" style="margin-top:10px;">开始一次 RabbitMirror 全链路诊断</button>
          <div class="rabbit-mirror-subnote" style="margin:4px 0 0 0;opacity:.78;font-size:12px;line-height:1.45;">用于没有维修兔入口的代码块／纯文字源码，或维修兔显示红灯时的维护报告。点击后再选择异常消息，捕获完成即自动停止。</div>
        </div>
      </details>

      <details class="rabbit-mirror-section rabbit-mirror-tools">
        <summary><span>工具与维护</span><span class="rabbit-mirror-section-note">正则・清理・重置</span></summary>
        <div class="rabbit-mirror-section-content">
          <div class="rabbit-mirror-regex-helper">
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
      </details>
    </div>
  </div>
</div>`;

    $('#extensions_settings2').append(html);

    checked('#rh_enabled', settings.autoRabbitMirrorInjection !== false && settings.enabled !== false);
    checked('#rh_maintenance_rabbit', settings.maintenanceRabbitEnabled);
    $('#rh_sampling_mode').val(settings.samplingMode || 'classic');
    checked('#rh_user_directive', settings.userDirectivePriority);
    checked('#rh_creative_expansion', settings.creativeExpansionMode);
    checked('#rh_force_visual_scenery', settings.forceVisualScenery);
    checked('#rh_avoid_repeat', settings.avoidRepeat);
    checked('#rh_memory_scan_enabled', settings.memoryScanEnabled);

    $('#rh_enabled').on('change', e => updateSettings({ enabled: e.target.checked, autoRabbitMirrorInjection: e.target.checked, mode: e.target.checked ? 'integrated' : 'off' }));
    $('#rh_maintenance_rabbit').on('change', e => {
        updateSettings({ maintenanceRabbitEnabled: e.target.checked });
        refreshMaintenanceRabbits();
        toastr?.[e.target.checked ? 'info' : 'success']?.(e.target.checked
            ? '小小维修兔已启用：每条兔子镜会显示独立的 🐇⚪，只有点击后才巡逻。'
            : '小小维修兔已关闭：标题入口已移除，不会影响兔子镜内容。');
    });
    $('#rh_interaction_diagnostic_once').on('click', () => {
        const started = triggerInteractionDiagnosticOnce();
        if (started) {
            toastr?.info?.('RabbitMirror 全链路诊断已就绪：请在聊天区点击异常的兔子镜、代码块或纯文字源码消息。捕获后会自动停止并显示报告。');
        } else {
            toastr?.warning?.('未找到聊天区域，暂时无法开始诊断。请进入具体聊天后重试。');
        }
    });

    $('#rh_memory_scan_enabled').on('change', e => {
        updateSettings({ memoryScanEnabled: e.target.checked });
        toastr?.[e.target.checked ? 'info' : 'success']?.(e.target.checked
            ? '已开启共同回忆额外资料读取：只有抽中 I.1 时才会读取已勾选来源。'
            : '已关闭额外资料读取；扫描结果和勾选记录会保留。');
    });
    $('#rh_memory_scan_now').on('click', () => {
        const results = scanMemoryPlugins();
        renderMemoryScanResults(results);
        const readableCount = results.filter(item => item.readable).length;
        const pendingCount = results.length - readableCount;
        toastr?.info?.(`扫描完成：${readableCount} 个可读取${pendingCount ? `，${pendingCount} 个其他候选已收起` : ''}。`);
    });
    $('#rh_memory_scan_results').on('change', '.rh-memory-provider-check', function () {
        const id = String($(this).data('provider-id') || '');
        const current = new Set(getSettings().memoryProviderIds || []);
        if (this.checked) current.add(id); else current.delete(id);
        updateSettings({ memoryProviderIds: [...current] });
    });
    $('#rh_memory_scan_results').on('click', '.rh-memory-test', function () {
        const id = String($(this).data('provider-id') || '');
        const result = testMemoryProvider(id);
        if (result.ok) toastr?.success?.(memoryTestMessage(result));
        else toastr?.error?.(memoryTestMessage(result));
    });

    $('#rh_sampling_mode').on('change', e => updateSettings({ samplingMode: e.target.value }));
    $('#rh_user_directive').on('change', e => updateSettings({ userDirectivePriority: e.target.checked }));
    $('#rh_download_order_qr').on('click', () => {
        try {
            const link = document.createElement('a');
            link.href = new URL('../assets/RabbitMirror-MenuQR-v2.1.json', import.meta.url).href;
            link.download = 'RabbitMirror-MenuQR-v2.1.json';
            link.rel = 'noopener';
            document.body.appendChild(link);
            link.click();
            link.remove();
            toastr?.success?.('RabbitMirror 点菜 QR 已开始下载；下载后请在快捷回复中手动导入。');
        } catch (error) {
            console.error('[RabbitMirror] QR download failed', error);
            toastr?.error?.('点菜 QR 下载失败，请重新安装扩展后再试。');
        }
    });
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
    if (settings.memoryScanEnabled || (settings.memoryProviderIds || []).length) {
        setTimeout(() => renderMemoryScanResults(scanMemoryPlugins()), 180);
    }

    $('#rh_reset').on('click', () => {
        resetSettings();
        location.reload();
    });
}
