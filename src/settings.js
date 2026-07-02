import { extension_settings } from '../../../../extensions.js';
import { saveSettingsDebounced } from '../../../../../script.js';

export const MODULE_NAME = 'rabbit_hole_theater';

export const defaultSettings = Object.freeze({
    enabled: true,
    mode: 'independent', // independent / canon / off
    rawPolicy: 'balanced', // balanced / full / minimal
    showWonderland: true,
    includeSafetyPatch: true,
    avoidRepeat: true,
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
        extension_settings[MODULE_NAME] = structuredClone(defaultSettings);
    }
    const settings = extension_settings[MODULE_NAME];
    for (const [key, value] of Object.entries(defaultSettings)) {
        if (settings[key] === undefined) {
            settings[key] = value;
        }
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
