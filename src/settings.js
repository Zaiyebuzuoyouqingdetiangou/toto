import { extension_settings } from '../../../../extensions.js';
import { saveSettingsDebounced } from '../../../../../script.js';

export const MODULE_NAME = 'rabbit_hole_theater';

export const defaultSettings = Object.freeze({
    enabled: true,

    // 一体化模式：不再把 Independent / Canon 拆成用户可选项。
    // 插件内部会根据本轮抽到的主题/展现形式自动判断：
    // - 抽到 canon 相关条目时，允许正文衍生；
    // - 否则按独立兔子洞执行。
    mode: 'integrated',

    // 默认不每轮塞完整大库，避免 token 爆炸；完整原文仍保存在 data/raw/。
    // 这个选项不再暴露在 UI 里，除非你自己改代码。
    rawPolicy: 'balanced',

    // 原规则是“每轮自动生成”，所以这些保持默认打开。
    showCot: false,
    // 安全补丁不再默认启用；用户原预设/主提示自行处理边界。
    includeSafetyPatch: false,
    avoidRepeat: true,

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
        extension_settings[MODULE_NAME] = structuredClone(defaultSettings);
    }
    const settings = extension_settings[MODULE_NAME];
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

    settings.themesMin = Number(settings.themesMin) || defaultSettings.themesMin;
    settings.themesMax = Number(settings.themesMax) || defaultSettings.themesMax;
    settings.formatsMin = Number(settings.formatsMin) || defaultSettings.formatsMin;
    settings.formatsMax = Number(settings.formatsMax) || defaultSettings.formatsMax;
    settings.depth = Number(settings.depth) || 0;
    return settings;
}

export function updateSettings(patch) {
    Object.assign(getSettings(), patch);
    saveSettingsDebounced();
}

export function resetSettings() {
    extension_settings[MODULE_NAME] = structuredClone(defaultSettings);
    saveSettingsDebounced();
}
