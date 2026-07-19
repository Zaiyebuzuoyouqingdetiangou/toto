import { extension_settings } from '../../../../extensions.js';
import { saveSettingsDebounced } from '../../../../../script.js';

export const MODULE_NAME = 'rabbit_mirror_theater';

function cloneDefaultSettings() {
    return typeof structuredClone === 'function'
        ? structuredClone(defaultSettings)
        : JSON.parse(JSON.stringify(defaultSettings));
}

export const defaultSettings = Object.freeze({
    enabled: true,
    // 强变量：开启后每轮生成前强制注入兔子镜规则。
    autoRabbitMirrorInjection: true,

    // 一体化模式：不再把 Independent / Canon 拆成用户可选项。
    // 插件内部会根据本轮抽到的主题/展现形式自动判断：
    // - 抽到 canon 相关条目时，允许正文衍生；
    // - 否则按独立兔子镜执行。
    mode: 'integrated',

    // 抽取模式：classic=主题元素+展现形式；format_only=仅展现形式。
    samplingMode: 'classic',

    // 默认不每轮塞完整大库，避免 token 爆炸；完整原文仍保存在 data/raw/。
    // 这个选项不再暴露在 UI 里，除非你自己改代码。
    rawPolicy: 'balanced',

    // 原规则是“每轮自动生成”，所以这些保持默认打开。
    showCot: false,
    // 安全补丁不再默认启用；用户原预设/主提示自行处理边界。
    includeSafetyPatch: false,
    avoidRepeat: true,
    // 冷却扩大到 10 轮：避免同一主题、展现形式或近似视觉观感在短时间内反复出现。
    cooldownRounds: 10,
    // 0.32.43：所有展现形式等权进入随机池，不再对“富版式”候选做三倍加权。
    richFormatBias: false,
    // 小小维修兔：统一承接原代码块、纯文字与智能交互急救入口。
    // 默认只在每条兔子镜标题后安装待巡逻按钮，不自动检查或修改。
    maintenanceRabbitEnabled: true,
    // 强制启动增强：将小剧场作为本轮输出格式的一部分，而不是可选附加项。
    hardStartup: true,
    // 语言锁定增强：所有可见 UI 文案也必须为简体中文，禁止英文承担主要界面标签。
    hardChineseLock: true,
    // 勾选后，最后一条用户消息里的“兔子镜：xxx / 兔子镜主题：xxx / 兔子镜格式：xxx”等会优先生效。
    userDirectivePriority: true,

    // 发散孵化模式（测试版）：开启后把抽取结果作为灵感基底，允许在核心气味内扩展库外媒介和细节。
    creativeExpansionMode: false,

    // 勾选后，每轮强制把 10.2.2 Visual Scenery 纳入本轮展现形式。
    forceVisualScenery: false,

    // 共同回忆资料来源（测试版）：只在抽中 I.1 时读取已勾选且拥有公开读取接口的额外资料来源。
    memoryScanEnabled: false,
    memoryProviderIds: [],
    memoryMaxChars: 2200,

    // 原规则要求 1-3 个主题、1-2 个展现形式，作为固定协议，不再拆成 UI 设置。
    themesMin: 1,
    themesMax: 3,
    formatsMin: 1,
    formatsMax: 2,

    // 注入位置固定为 system / depth 0，减少用户误改导致失效。
    depth: 0,
    role: 'system',

    skipQuiet: true,
    skipImpersonate: true,
    debug: false,
});

export function getSettings() {
    if (!extension_settings[MODULE_NAME] || typeof extension_settings[MODULE_NAME] !== 'object') {
        extension_settings[MODULE_NAME] = cloneDefaultSettings();
    }
    const settings = extension_settings[MODULE_NAME];
    // 0.33.9：在补默认值前读取一次旧键，只用于升级迁移；迁移后立即删除。
    const legacyRescueWasEnabled = !!(settings.plainTextRescueMode || settings.codeBlockRescueMode || settings.interactionRescueMode);
    for (const [key, value] of Object.entries(defaultSettings)) {
        if (settings[key] === undefined) {
            settings[key] = value;
        }
    }

    // 旧版用户设置迁移：如果之前选过 independent / canon，也统一归并为 integrated。
    if (settings.mode === 'independent' || settings.mode === 'canon' || settings.mode === 'off') {
        settings.mode = settings.mode === 'off' ? 'off' : 'integrated';
    }


    // 旧版 showWonderland 迁移为 showCot，并删除旧字段以免 UI 混乱。
    if (settings.showCot === undefined && settings.showWonderland !== undefined) {
        settings.showCot = !!settings.showWonderland;
    }
    if (settings.showWonderland !== undefined) {
        delete settings.showWonderland;
    }

    // 0.32.26：移除无效的强制交互开关与重复 UI 自查设置；核心交互规则仍作为常驻质量规则。
    if (settings.forceInteractiveMode !== undefined) delete settings.forceInteractiveMode;
    if (settings.uiAudit !== undefined) delete settings.uiAudit;

    settings.themesMin = Number(settings.themesMin) || defaultSettings.themesMin;
    settings.themesMax = Number(settings.themesMax) || defaultSettings.themesMax;
    settings.formatsMin = Number(settings.formatsMin) || defaultSettings.formatsMin;
    settings.formatsMax = Number(settings.formatsMax) || defaultSettings.formatsMax;
    settings.cooldownRounds = Math.max(1, Number(settings.cooldownRounds) || defaultSettings.cooldownRounds);
    if (settings.autoRabbitMirrorInjection === undefined) settings.autoRabbitMirrorInjection = settings.enabled !== false;
    // 0.33.9：旧急救开关只负责一次性迁移；运行时不再保留旧设置或旧全局调度。
    if (settings.maintenanceRabbitEnabled === undefined) {
        settings.maintenanceRabbitEnabled = legacyRescueWasEnabled || defaultSettings.maintenanceRabbitEnabled;
    }
    settings.maintenanceRabbitEnabled = !!settings.maintenanceRabbitEnabled;
    delete settings.plainTextRescueMode;
    delete settings.codeBlockRescueMode;
    delete settings.interactionRescueMode;
    if (!['classic', 'format_only'].includes(settings.samplingMode)) settings.samplingMode = defaultSettings.samplingMode;
    if (!Array.isArray(settings.memoryProviderIds)) settings.memoryProviderIds = [];
    settings.memoryProviderIds = settings.memoryProviderIds.map(value => {
        const id = String(value || '');
        return id === 'baibai-book' ? 'global:STBaiBaiBook' : id;
    });
    settings.memoryProviderIds = [...new Set(settings.memoryProviderIds.filter(Boolean))].slice(0, 12);
    settings.memoryScanEnabled = !!settings.memoryScanEnabled;
    settings.memoryMaxChars = Math.max(600, Math.min(6000, Number(settings.memoryMaxChars) || defaultSettings.memoryMaxChars));
    // 0.32.43：旧用户设置也统一关闭富版式三倍加权，确保完整池等权参与随机。
    settings.richFormatBias = false;
    settings.depth = Number(settings.depth) || 0;
    return settings;
}

export function updateSettings(patch) {
    Object.assign(getSettings(), patch);
    saveSettingsDebounced();
}

export function resetSettings() {
    extension_settings[MODULE_NAME] = cloneDefaultSettings();
    saveSettingsDebounced();
}
