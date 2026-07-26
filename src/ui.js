import { getSettings, updateSettings, resetSettings } from './settings.js?rmv=0.34.0';
import { clearLastCombo } from './storage.js?rmv=0.34.0';
import { clearRabbitMirrorPrompt } from './injector.js?rmv=0.34.0';
import { clearFeedbackCatExtensionPrompt, getActiveFeedbackForCurrentChat, syncFeedbackCatExtensionPrompt } from './feedbackCat.js?rmv=0.34.0';
import { refreshFeedbackCats, refreshMaintenanceRabbits, triggerInteractionDiagnosticOnce } from './outputSanitizer.js?rmv=0.34.0';
import { scanMemoryPlugins, testMemoryProvider } from './memoryScanner.js?rmv=0.34.0';
import { getLastRabbitMirrorTokenRecord, TOKEN_METER_EVENT } from './tokenMeter.js?rmv=0.34.0';

const SETTINGS_UI_VERSION = '0.34.0';
const RUNTIME_VERSION = '0.34.0';

function isCurrentRuntime() {
    return globalThis.__rabbitMirrorRuntimeVersion === RUNTIME_VERSION;
}
let uiMountRetryTimer = 0;
let uiMountRetryCount = 0;

function scheduleUiMountRetry() {
    if (!isCurrentRuntime() || uiMountRetryTimer || uiMountRetryCount >= 20) return;
    uiMountRetryCount += 1;
    uiMountRetryTimer = setTimeout(() => {
        uiMountRetryTimer = 0;
        initRabbitMirrorUI();
    }, Math.min(1000, 120 + uiMountRetryCount * 40));
}

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


function formatMeterNumber(value) {
    return Math.max(0, Number(value) || 0).toLocaleString('zh-CN');
}

function tokenMeterNoInjectionLabel(reason) {
    const labels = {
        disabled: '本轮未注入：兔子镜已关闭',
        'quiet-skipped': '本轮未注入：静默生成已跳过',
        'impersonate-skipped': '本轮未注入：角色扮演生成已跳过',
        'directive-skipped': '本轮未注入：用户指令要求跳过',
        empty: '本轮未注入：没有形成有效 Prompt',
        cleared: '当前注入已清空',
        manual: '当前注入已手动清空',
    };
    return labels[String(reason || '')] || '本轮未注入';
}

function renderTokenMeter(record = getLastRabbitMirrorTokenRecord()) {
    const root = $('#rh_token_meter');
    if (!root.length) return;
    const main = root.find('[data-rh-token-meter-main]');
    const exact = root.find('[data-rh-token-meter-exact]');
    const detail = root.find('[data-rh-token-meter-detail]');
    if (!record) {
        main.text('尚无生成记录');
        exact.text('发送下一轮消息后自动更新。');
        detail.text('只统计 RabbitMirror 自己写入的 Prompt。');
        return;
    }
    if (record.status !== 'injected') {
        main.text('0 Token');
        exact.text(tokenMeterNoInjectionLabel(record.reason));
        detail.text('未向模型追加 RabbitMirror Prompt。');
        return;
    }

    const tokens = record.tokens || {};
    const chars = record.chars || {};
    main.text(`约 ${formatMeterNumber(tokens.estimated)} Token`);
    exact.text(`保守范围 ${formatMeterNumber(tokens.min)}–${formatMeterNumber(tokens.max)}；精确字符数 ${formatMeterNumber(chars.total)}`);
    const parts = [
        `基础约 ${formatMeterNumber(tokens.baseEstimated)}`,
        chars.feedback ? `挨打猫追加约 ${formatMeterNumber(tokens.feedbackEstimated)}` : '挨打猫追加 0',
        `其中母本补充 ${formatMeterNumber(chars.motherLibrary)} 字符`,
        chars.sharedMemory ? `共同回忆资料 ${formatMeterNumber(chars.sharedMemory)} 字符` : '',
    ].filter(Boolean);
    detail.text(parts.join('；'));
}

function attachTokenMeterListener() {
    try { globalThis.__rabbitMirrorTokenMeterUiCleanup?.(); } catch {}
    const handler = event => renderTokenMeter(event?.detail || getLastRabbitMirrorTokenRecord());
    globalThis.addEventListener?.(TOKEN_METER_EVENT, handler);
    globalThis.__rabbitMirrorTokenMeterUiCleanup = () => globalThis.removeEventListener?.(TOKEN_METER_EVENT, handler);
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
    if (!isCurrentRuntime()) return;
    const settings = getSettings();
    const noSendRegex = '/<toto\\b[^>]*>[\\s\\S]*?<\\/toto>\\s*/gi';
    const existing = $('#rabbit_mirror_theater_settings');
    if (existing.length) {
        const currentPanels = existing.filter(`[data-rabbit-mirror-ui-version="${SETTINGS_UI_VERSION}"][data-rabbit-mirror-runtime-version="${RUNTIME_VERSION}"]`)
            .filter((_, panel) => $(panel).find('#rh_feedback_cat').length && $(panel).find('#rh_maintenance_rabbit').length);
        if (existing.length === 1 && currentPanels.length === 1) return;
        // A hot reload may leave the old settings DOM alive even after manifest.json has updated.
        // Remove every stale/duplicate panel so the claimed runtime becomes the only UI owner.
        existing.remove();
    }

    const settingsMount = $('#extensions_settings2');
    if (!settingsMount.length) {
        scheduleUiMountRetry();
        return;
    }
    uiMountRetryCount = 0;

    const html = `
<div id="rabbit_mirror_theater_settings" class="rabbit-mirror-settings" data-rabbit-mirror-ui-version="${SETTINGS_UI_VERSION}" data-rabbit-mirror-runtime-version="${RUNTIME_VERSION}">
  <div class="inline-drawer">
    <div class="inline-drawer-toggle inline-drawer-header">
      <b>兔子镜小剧场 / Rabbit Mirror Theater <span style="font-size:11px;opacity:.72;">[Public Beta・挨打猫 v1.4＋小小维修兔 v1.59＋Menu QR v2.2]</span></b><span class="rabbit-mirror-toto-watermark">Toto v0.34.0 Public Beta</span>
      <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
    </div>
    <div class="inline-drawer-content">
      <div class="rabbit-mirror-primary-toggle">
        <label class="checkbox_label"><input id="rh_enabled" type="checkbox"> 兔子镜自动注入</label>
        <div class="rabbit-mirror-subnote" style="margin:-2px 0 0 26px;opacity:.72;font-size:12px;line-height:1.45;">开启后每轮自动追加兔子镜规则。</div>
      </div>


      <div id="rh_token_meter" class="rabbit-mirror-token-meter" aria-live="polite">
        <div class="rabbit-mirror-token-meter-head">
          <b>本轮 RabbitMirror 注入</b>
          <span data-rh-token-meter-main>尚无生成记录</span>
        </div>
        <div data-rh-token-meter-exact class="rabbit-mirror-token-meter-exact">发送下一轮消息后自动更新。</div>
        <div data-rh-token-meter-detail class="rabbit-mirror-token-meter-detail">只统计 RabbitMirror 自己写入的 Prompt。</div>
        <div class="rabbit-mirror-token-meter-note">字符数为精确值；Token 因模型分词器不同只能估算，因此同时给出保守范围。统计面板本身不会注入模型。</div>
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

          <label for="rh_raw_policy" class="flex-container alignitemscenter" style="gap:8px;flex-wrap:wrap;margin:8px 0;">
            <span>母本检索深度</span>
            <select id="rh_raw_policy" class="text_pole" style="max-width:300px;">
              <option value="compact">精简：仅索引摘要（最省 Token）</option>
              <option value="balanced">均衡：摘要＋关键母本片段（默认）</option>
              <option value="full">完整：较多母本片段（仍有限额）</option>
            </select>
          </label>
          <div class="rabbit-mirror-subnote" style="margin:-4px 0 8px 0;opacity:.72;font-size:12px;line-height:1.45;">均衡模式只检索本轮抽中的条目，并去掉与摘要重复的内容；每轮母本补充最多 900 字符。完整模式最多 2400 字符。</div>

          <label class="checkbox_label"><input id="rh_creative_expansion" type="checkbox"> 发散孵化模式（测试版）</label>
          <div class="rabbit-mirror-subnote" style="margin:-2px 0 6px 26px;opacity:.72;font-size:12px;line-height:1.45;">开启后，主题元素与展现形式只作为灵感基底，允许根据正文氛围发散出元素库之外的新内容、新媒介、新细节与新结构。</div>

          <label class="checkbox_label"><input id="rh_force_visual_scenery" type="checkbox"> Visual Scenery</label>
          <div class="rabbit-mirror-subnote" style="margin:-2px 0 6px 26px;opacity:.72;font-size:12px;line-height:1.45;">开启后强制生成一幅完整、统一、会持续变化的 CSS 动态视觉画面；画面本体承担持续动画，并保留由本轮内容自然产生的交互变化。</div>

          <label class="checkbox_label"><input id="rh_user_directive" type="checkbox"> 用户指令优先（正文/兔子镜点播）</label>
          <div class="rabbit-mirror-qr-download">
            <button id="rh_download_order_qr" class="menu_button" type="button">下载 RabbitMirror 点菜 QR（v2.2）</button>
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
        <summary><span>反馈、急救与诊断</span><span class="rabbit-mirror-section-note">按需使用</span></summary>
        <div class="rabbit-mirror-section-content">
          <label class="checkbox_label" style="font-weight:700;"><input id="rh_feedback_cat" type="checkbox"> 🐈 启用挨打猫</label>
          <div class="rabbit-mirror-subnote" style="margin:-2px 0 8px 26px;opacity:.78;font-size:12px;line-height:1.5;">挨打猫只把用户主动选择的反馈临时带入后续 1／3／10 轮生成；用户未选择时不向模型追加任何内容。</div>
          <label class="checkbox_label" style="font-weight:700;"><input id="rh_maintenance_rabbit" type="checkbox"> 🐇 启用小小维修兔</label>
          <div class="rabbit-mirror-subnote" style="margin:-2px 0 8px 26px;opacity:.78;font-size:12px;line-height:1.5;">小小维修兔只在用户点击后检查或维修当前这面兔子镜；未点击时不修改内容，也不增加模型 token。</div>
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

    settingsMount.append(html);
    attachTokenMeterListener();
    renderTokenMeter();

    checked('#rh_enabled', settings.autoRabbitMirrorInjection !== false && settings.enabled !== false);
    checked('#rh_feedback_cat', settings.feedbackCatEnabled);
    checked('#rh_maintenance_rabbit', settings.maintenanceRabbitEnabled);
    $('#rh_sampling_mode').val(settings.samplingMode || 'classic');
    $('#rh_raw_policy').val(settings.rawPolicy || 'balanced');
    checked('#rh_user_directive', settings.userDirectivePriority);
    checked('#rh_creative_expansion', settings.creativeExpansionMode);
    checked('#rh_force_visual_scenery', settings.forceVisualScenery);
    checked('#rh_avoid_repeat', settings.avoidRepeat);
    checked('#rh_memory_scan_enabled', settings.memoryScanEnabled);

    $('#rh_enabled').on('change', e => updateSettings({ enabled: e.target.checked, autoRabbitMirrorInjection: e.target.checked, mode: e.target.checked ? 'integrated' : 'off' }));
    $('#rh_feedback_cat').on('change', e => {
        updateSettings({ feedbackCatEnabled: e.target.checked });
        if (e.target.checked) syncFeedbackCatExtensionPrompt(getActiveFeedbackForCurrentChat());
        else clearFeedbackCatExtensionPrompt();
        refreshFeedbackCats();
        toastr?.[e.target.checked ? 'info' : 'success']?.(e.target.checked
            ? '挨打猫已启用：每条兔子镜会显示独立的 🐈，没有反馈时不会追加 Prompt。'
            : '挨打猫已关闭：标题入口已移除，已保存反馈暂停注入。');
    });
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
    $('#rh_raw_policy').on('change', e => updateSettings({ rawPolicy: e.target.value }));
    $('#rh_user_directive').on('change', e => updateSettings({ userDirectivePriority: e.target.checked }));
    $('#rh_download_order_qr').on('click', () => {
        try {
            const link = document.createElement('a');
            link.href = new URL('../assets/RabbitMirror-MenuQR-v2.2.json?rmv=0.34.0', import.meta.url).href;
            link.download = 'RabbitMirror-MenuQR-v2.2.json';
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
        clearRabbitMirrorPrompt('manual');
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

export function destroyRabbitMirrorUI() {
    if (uiMountRetryTimer) {
        clearTimeout(uiMountRetryTimer);
        uiMountRetryTimer = 0;
    }
    uiMountRetryCount = 0;
    try { globalThis.__rabbitMirrorTokenMeterUiCleanup?.(); } catch {}
    globalThis.__rabbitMirrorTokenMeterUiCleanup = null;
    $('#rabbit_mirror_theater_settings').remove();
}
