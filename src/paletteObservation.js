// Pure observed-colour classification shared by source scanning and compact
// history. No DOM, palette lottery, stored state or generated colour is read.

export function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

export function luminanceFromRgb(r, g, b) {
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function rgbToHsl(r, g, b) {
    const rr = clamp(Number(r), 0, 255) / 255;
    const gg = clamp(Number(g), 0, 255) / 255;
    const bb = clamp(Number(b), 0, 255) / 255;
    const max = Math.max(rr, gg, bb);
    const min = Math.min(rr, gg, bb);
    const delta = max - min;
    let h = 0;
    if (delta) {
        if (max === rr) h = 60 * (((gg - bb) / delta) % 6);
        else if (max === gg) h = 60 * (((bb - rr) / delta) + 2);
        else h = 60 * (((rr - gg) / delta) + 4);
    }
    if (h < 0) h += 360;
    const l = (max + min) / 2;
    const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    return { h, s, l };
}

export function hueFamilyOf(hue) {
    const h = ((Number(hue) % 360) + 360) % 360;
    if (h < 15 || h >= 345) return 'red';
    if (h < 45) return 'orange';
    if (h < 70) return 'yellow';
    if (h < 165) return 'green';
    if (h < 200) return 'cyan';
    if (h < 250) return 'blue';
    if (h < 290) return 'purple';
    return 'pink';
}

export function classifyPaletteSamples(samples, source = 'raw', mainBackgroundFound = false) {
    const usable = (samples || []).filter(sample => sample?.color && Number(sample.weight) > 0);
    if (!usable.length) return null;
    let totalWeight = 0;
    let luminanceSum = 0;
    let saturationSum = 0;
    let chromaSum = 0;
    let darkWeight = 0;
    let lightWeight = 0;
    let chromaticWeight = 0;
    let warmWeight = 0;
    let coolWeight = 0;
    const hueWeights = new Map();

    for (const sample of usable) {
        const color = sample.color;
        const alpha = clamp(Number(color.a ?? 1), 0, 1);
        const weight = Number(sample.weight) * Math.max(0.12, alpha);
        if (!Number.isFinite(weight) || weight <= 0) continue;
        const lum = luminanceFromRgb(color.r, color.g, color.b);
        const hsl = rgbToHsl(color.r, color.g, color.b);
        totalWeight += weight;
        luminanceSum += lum * weight;
        saturationSum += hsl.s * weight;
        // HSL saturation alone makes near-white cream look highly saturated.
        const channelSpread = Math.max(color.r, color.g, color.b) - Math.min(color.r, color.g, color.b);
        chromaSum += channelSpread / 255 * weight;
        if (lum < 105) darkWeight += weight;
        if (lum > 185) lightWeight += weight;
        // Muted coloured surfaces retain their hue even when HSL saturation is
        // low. Ignore 1–2 channel steps near white/black instead of amplifying
        // numerical tint into a full family.
        if (channelSpread >= 6 || (channelSpread >= 3 && hsl.s >= 0.12)) {
            const chroma = weight * Math.max(0.25, hsl.s);
            const family = hueFamilyOf(hsl.h);
            chromaticWeight += chroma;
            hueWeights.set(family, (hueWeights.get(family) || 0) + chroma);
            if (['red', 'orange', 'yellow', 'pink'].includes(family)) warmWeight += chroma;
            else if (['green', 'cyan', 'blue', 'purple'].includes(family)) coolWeight += chroma;
        }
    }
    if (!totalWeight) return null;

    const averageLuminance = luminanceSum / totalWeight;
    const darkAreaRatio = darkWeight / totalWeight;
    const lightAreaRatio = lightWeight / totalWeight;
    const averageSaturation = saturationSum / totalWeight;
    const brightness = darkAreaRatio >= 0.55 || averageLuminance < 102
        ? 'dark'
        : (lightAreaRatio >= 0.55 || averageLuminance > 184 ? 'light' : 'mid');

    let hueFamily = 'neutral';
    if (chromaticWeight >= totalWeight * 0.12 && hueWeights.size) {
        hueFamily = [...hueWeights.entries()].sort((a, b) => b[1] - a[1])[0][0];
    }
    const saturation = averageSaturation < 0.26 ? 'low' : (averageSaturation < 0.56 ? 'medium' : 'high');
    const temperature = warmWeight > coolWeight * 1.2
        ? 'warm'
        : (coolWeight > warmWeight * 1.2 ? 'cool' : 'neutral');
    const baseConfidence = source === 'rendered' ? 0.58 : 0.38;
    const confidence = clamp(baseConfidence + Math.min(0.22, usable.length * 0.025) + (mainBackgroundFound ? 0.14 : 0), 0, 0.96);

    return {
        brightness,
        hueFamily,
        saturation,
        temperature,
        darkAreaRatio: Number(darkAreaRatio.toFixed(2)),
        lightAreaRatio: Number(lightAreaRatio.toFixed(2)),
        averageLuminance: Math.round(averageLuminance),
        averageChroma: Number((chromaSum / totalWeight).toFixed(3)),
        confidence: Number(confidence.toFixed(2)),
        source,
    };
}
