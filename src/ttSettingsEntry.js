// A settings-only escape hatch for TT, independent of chat ownership. No observers,
// timers, layout measurements, library reads or heavy imports live here.
const entries = new WeakMap();

function ttSettingsEntryHostNote(status) {
    // Only fixed status codes are presented; do not echo host error messages.
    if (status.errorCode === 'CHAT_SURFACE_STATUS_UNAVAILABLE') {
        return 'TT 聊天接口状态暂不可用；仍可打开设置与诊断，不代表聊天已接入。';
    }
    if (status.errorCode === 'CHAT_SURFACE_OWNERSHIP_UNAVAILABLE') {
        return 'TT 聊天所有权状态暂不可用；仍可打开设置与诊断，不能据此确认聊天已接入。';
    }
    if (status.errorCode === 'CHAT_SURFACE_PROTOCOL_UNSUPPORTED') {
        return '当前 TT 聊天接口协议不支持；仍可打开设置与诊断，聊天接入尚不可用。';
    }
    if (status.registrationFailure === 'late-projection') {
        return '兔子镜尝试注册时 TT 的首次聊天投影已开始，已错过注册窗口；反复点击设置不能补注册，具体加载时序请查看 TT 诊断。';
    }
    if (status.registrationFailure === 'duplicate-participant') {
        return 'TT 检测到重复的兔子镜参与者；请仅启用一份正式版或测试版，再重启。';
    }
    if (status.registrationFailure === 'host-rejected' || status.errorCode === 'CHAT_SURFACE_REGISTRATION_FAILED') {
        return 'TT 拒绝了兔子镜的聊天挂载登记；仍可打开设置，具体原因请查看 TT 诊断。';
    }
    if (status.errorCode === 'CHAT_SURFACE_CONSUMER_FAILED') {
        return 'TT 聊天挂载处理发生错误；仍可打开设置，具体原因请查看 TT 诊断。';
    }
    if (status.protocolVersion == null) {
        return 'TT 聊天接口未检测到；仍可打开完整设置，设置可用不代表聊天已接入。';
    }
    if (status.managed === false) {
        return '当前 TT 使用普通静态聊天模式，不要求 ChatSurface 挂载；完整设置按需加载。';
    }
    if (status.registered !== true) {
        return '兔子镜尚未获得 TT 聊天挂载；具体原因可在高级设置的「工具与维护」中查看 TT 诊断。';
    }
    return '兔子镜已登记 TT ChatSurface；具体消息挂载状态以诊断为准，完整设置按需加载。';
}

export function mountRabbitMirrorTtSettingsEntry({ runtimeVersion, isCurrent, getStatus, loadSettings, isTauriTavern = false, document: doc = globalThis.document }) {
    if (!isCurrent()) return null;
    let status;
    try { status = getStatus?.() || {}; }
    catch { status = { errorCode: 'CHAT_SURFACE_STATUS_UNAVAILABLE' }; }
    // The explicit option is supplied only after the bootstrap has detected the
    // real TT host object. A pending/missing chat API is not a settings gate.
    if (status.host !== 'tauritavern' && isTauriTavern !== true) return null;
    const mount = doc?.getElementById('extensions_settings2');
    if (!mount) return null;
    entries.get(doc)?.dispose();
    const fullPanel = () => {
        const panel = doc.getElementById('rabbit_mirror_theater_settings');
        return panel?.isConnected && panel.dataset.rabbitMirrorRuntimeVersion === runtimeVersion
            && panel.dataset.rabbitMirrorUiReady === 'true' ? panel : null;
    };
    if (fullPanel()) return null;
    // The shell intentionally does not match the full-settings intent selectors
    // in index.js: merely hovering or focusing it must not load the runtime.
    doc.getElementById('rabbit_mirror_tt_settings_entry')?.remove();
    const shell = doc.createElement('div');
    shell.id = 'rabbit_mirror_tt_settings_entry';
    shell.className = 'rabbit-mirror-settings';
    shell.dataset.rabbitMirrorRuntimeVersion = runtimeVersion;
    shell.innerHTML = `
      <style>#rh_tt_settings_entry_open:focus-visible { outline: 3px solid currentColor !important; outline-offset: 2px !important; }</style>
      <div class="inline-drawer">
        <div class="inline-drawer-header rabbit-mirror-drawer-header"><b>兔子镜小剧场</b></div>
        <div style="padding:12px;line-height:1.5;overflow-wrap:anywhere">
          <p id="rh_tt_settings_entry_note" style="margin:0 0 12px"><b>设置可用不代表聊天已接入。</b><br><span data-rm-tt-entry-host-note></span></p>
          <button id="rh_tt_settings_entry_open" class="menu_button" type="button" aria-describedby="rh_tt_settings_entry_note rh_tt_settings_entry_status" style="min-height:48px;min-width:48px!important;max-width:100%;box-sizing:border-box;white-space:normal!important;cursor:pointer;touch-action:manipulation">打开设置与诊断</button>
          <p id="rh_tt_settings_entry_status" role="status" aria-live="polite" aria-atomic="true" style="margin:8px 0 0"></p>
        </div>
      </div>`;
    shell.querySelector('[data-rm-tt-entry-host-note]').textContent = ttSettingsEntryHostNote(status);
    const button = shell.querySelector('button');
    const feedback = shell.querySelector('[role="status"]');
    let disposed = false;
    let busy = false;
    const active = () => !disposed && isCurrent() && shell.isConnected;
    function dispose() {
        disposed = true;
        button.removeEventListener('click', open);
        shell.remove();
        if (entries.get(doc) === controller) entries.delete(doc);
    }
    function reconcile() {
        const panel = fullPanel();
        if (!panel) return false;
        dispose();
        return true;
    }
    async function open() {
        if (!active() || busy) return;
        if (reconcile()) return;
        busy = true;
        button.disabled = true;
        button.textContent = '正在加载设置…';
        shell.setAttribute('aria-busy', 'true');
        feedback.textContent = '正在加载完整设置；不会发送生成请求。';
        try {
            await loadSettings(active);
            if (!active()) return;
            const panel = fullPanel();
            if (!panel) throw new Error('RabbitMirror settings did not mount');
            // Open only the existing settings drawer. Do not dispatch a focus or
            // click into it: legacy intent listeners would initialize the API.
            const content = panel.querySelector(':scope > .inline-drawer > .inline-drawer-content');
            if (content) content.style.display = 'block';
            const icon = panel.querySelector(':scope > .inline-drawer > .inline-drawer-header .inline-drawer-icon');
            icon?.classList.remove('down', 'fa-circle-chevron-down');
            icon?.classList.add('up', 'fa-circle-chevron-up');
            reconcile();
        } catch {
            if (!active()) return;
            button.textContent = '重试打开设置与诊断';
            feedback.textContent = '未能打开完整设置，请手动重试；聊天挂载状态请查看 TT 诊断。未发送生成请求。';
        } finally {
            if (active()) {
                busy = false;
                button.disabled = false;
                shell.removeAttribute('aria-busy');
            }
        }
    }
    const controller = Object.freeze({ dispose, reconcile });
    entries.set(doc, controller);
    button.addEventListener('click', open);
    mount.append(shell);
    return controller;
}
