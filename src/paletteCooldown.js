import { rmT as __rmT, rmR as __rmR } from "./textTable.js?rmv=2.5.2";
import { getRecentPaletteCooldown, getActivePaletteCooldown } from './storage.js?rmv=2.5.2';
const SAFE_PALETTE_LABEL_RE = __rmR("KOLHjhl0D2owKymhvfvRF.8VQ_HR2VY3jwnqAK78H8LY5hRh8rFuRlOZcIHlZ6evADRkkQd5G30g0x7PaAdO6FJG.wnJ3YcoO8Oqf3cU5vva5Q_fGmKz82PEvkwiW.dqL2zS3jQd4geCMRC8s7RmRJE9VgYnHRTgxmmIClPAy2ozL8DcWaz7mlW7", "");
function nearNeutralMain(fingerprint) {
    const hex = Array.isArray(fingerprint?.mainColors) ? fingerprint.mainColors[0] : '';
    if (typeof hex !== 'string' || !/^#[0-9a-f]{6}$/i.test(hex))
        return false;
    const [r, g, b] = hex.slice(1).match(/../g).map(value => parseInt(value, 16));
    return Math.max(r, g, b) - Math.min(r, g, b) < 16;
}
function recentPaletteLabels(skipHueFamilies = new Set()) {
    return [...new Set(getRecentPaletteCooldown(3).filter(item => !skipHueFamilies.has(item?.fingerprint?.hueFamily) && !nearNeutralMain(item?.fingerprint)).map(item => String(item?.label || '').trim())
            .filter(label => label && label.length <= 24 && SAFE_PALETTE_LABEL_RE.test(label)))];
}
function ordinaryDarkCooldown(settings) {
    if (settings?.darkVisualMode === true || settings?.visualToneMode === 'soft')
        return null;
    const cooldown = getActivePaletteCooldown(3);
    return cooldown.active ? cooldown : null;
}
export function buildPaletteCooldownExecutionLock(settings, { skipHueFamilies = [] } = {}) {
    const labels = recentPaletteLabels(new Set(Array.isArray(skipHueFamilies) ? skipHueFamilies : []));
    const cooldown = ordinaryDarkCooldown(settings);
    const palette = labels.length ? `${__rmT("uwHL8U9enYVAsh")}${labels.join(__rmT("jvk"))}${__rmT("l6pcqg06ezuyWUV.fl8m4dkuH1W1YD2TzVaAbNYvP5mWl_6gQSn.1ffloh7GJRUsvpGdWzyeW41krhTWTvWvQTQQPFjRIdITNDWhQn.B")}` +
        (settings?.darkVisualMode === true ? __rmT("sSAugQ7s14idMWfMuYmQWWYu9pEvzT3pwzQA2LX0C5OFchh6") : settings?.visualToneMode === 'soft' ? __rmT("OLcvwCRlQ9jdzSW01klAUJliEh8") : cooldown ? '' : __rmT("o7zr.twp3Q0BDcvPI8WiAh")) : '';
    return [palette, cooldown ? `${__rmT("fEFlTl767Cqo4x79dXU7o80Yxu5CJk")}${cooldown.remaining}${__rmT("XPbm_29KegfEsv6M3pW7X3trkvAOTP0xFQbF48nxu3LmpwPRR5UsAl7UkiGDz0f1p4TF65W.8XF.swtZM5_vcf")}` : ''].filter(Boolean).join(__rmT("7os"));
}
export function buildPaletteCooldownRule(settings) {
    const cooldown = ordinaryDarkCooldown(settings);
    return cooldown ? `${__rmT("FLl7YYQ0G9PX5uDeNWgzBveB6YN_a5AP")}${cooldown.remaining}${__rmT("mG9eDvtzk3jO.tZhsjovRHJ5prPyheQrJY142wUZzrIoQbauX.4ixpddLq31n_PXrk1pk8LO5j.I9HY6yFghKd.1P9CmBQs76PHhzQZU44Mk8qZKfJ_1zaRIt4zeK5ug2kSOvT")}` : '';
}
