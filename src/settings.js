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
    autoRabbitMirrorInjection: true,
    mode: 'integrated',
    samplingMode: 'classic',
    rawPolicy: 'balanced',
    showCot: false,
    includeSafetyPatch: false,
    avoidRepeat: true,
    cooldownRounds: 10,
    richFormatBias: false,
    maintenanceRabbitEnabled: true,
    feedbackCatEnabled: true,

    // 随兔子镜生成配图（测试版）
    imageGenerationEnabled: false,
    imageGenerationMode: 'free',
    imageFreeSiteUrl: 'https://image.pollinations.ai/prompt/{prompt}?width={width}&height={height}',
    imageApiUrl: '',
    imageApiKey: '',
    imageModel: '',
    imageAvailableModels: [],
    imageSize: '1024x1024',

    hardStartup: true,
    hardChineseLock: true,
    userDirectivePriority: true,
    creativeExpansionMode: false,
    forceVisualScenery: false,
    memoryScanEnabled: false,
    memoryProviderIds: [],
    memoryMaxChars: 2200,
    themesMin: 1,
    themesMax: 3,
    formatsMin: 1,
    formatsMax: 2,
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
    const legacyRescueWasEnabled = !!(settings.plainTextRescueMode || settings.codeBlockRescueMode || settings.interactionRescueMode);
    for (const [key, value] of Object.entries(defaultSettings)) {
        if (settings[key] === undefined) settings[key] = value;
    }

    if (settings.mode === 'independent' || settings.mode === 'canon' || settings.mode === 'off') {
        settings.mode = settings.mode === 'off' ? 'off' : 'integrated';
    }

    if (settings.showCot === undefined && settings.showWonderland !== undefined) {
        settings.showCot = !!settings.showWonderland;
    }
    if (settings.showWonderland !== undefined) delete settings.showWonderland;
    if (settings.forceInteractiveMode !== undefined) delete settings.forceInteractiveMode;
    if (settings.uiAudit !== undefined) delete settings.uiAudit;

    settings.themesMin = Number(settings.themesMin) || defaultSettings.themesMin;
    settings.themesMax = Number(settings.themesMax) || defaultSettings.themesMax;
    settings.formatsMin = Number(settings.formatsMin) || defaultSettings.formatsMin;
    settings.formatsMax = Number(settings.formatsMax) || defaultSettings.formatsMax;
    settings.cooldownRounds = Math.max(1, Number(settings.cooldownRounds) || defaultSettings.cooldownRounds);
    if (settings.autoRabbitMirrorInjection === undefined) settings.autoRabbitMirrorInjection = settings.enabled !== false;
    if (settings.maintenanceRabbitEnabled === undefined) {
        settings.maintenanceRabbitEnabled = legacyRescueWasEnabled || defaultSettings.maintenanceRabbitEnabled;
    }
    settings.maintenanceRabbitEnabled = !!settings.maintenanceRabbitEnabled;
    settings.feedbackCatEnabled = settings.feedbackCatEnabled !== false;

    settings.imageGenerationEnabled = !!settings.imageGenerationEnabled;
    settings.imageGenerationMode = settings.imageGenerationMode === 'custom' ? 'custom' : 'free';
    settings.imageFreeSiteUrl = String(settings.imageFreeSiteUrl || defaultSettings.imageFreeSiteUrl).trim().slice(0, 1600);
    settings.imageApiUrl = String(settings.imageApiUrl || '').trim().slice(0, 1200);
    settings.imageApiKey = String(settings.imageApiKey || '').trim().slice(0, 2400);
    settings.imageModel = String(settings.imageModel || '').trim().slice(0, 240);
    if (!Array.isArray(settings.imageAvailableModels)) settings.imageAvailableModels = [];
    settings.imageAvailableModels = [...new Set(settings.imageAvailableModels.map(value => String(value || '').trim()).filter(Boolean))].slice(0, 120);
    if (!['1024x1024', '1024x1536', '1536x1024'].includes(settings.imageSize)) settings.imageSize = defaultSettings.imageSize;

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
