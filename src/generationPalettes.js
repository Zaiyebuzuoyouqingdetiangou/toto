import { rmT as __rmT } from "./textTable.js?rmv=2.5.0";
import { paletteRecipeFor } from './paletteRecipes.js?rmv=2.5.0';
import { COLOR_FAMILIES } from '../data/structured/generationPaletteIndex.js?rmv=2.5.0';
import { COLOR_SCALES } from '../data/structured/generationColorScales.js?rmv=2.5.0';
const BY_ID = new Map(COLOR_FAMILIES.map(item => [item.id, item]));
function luminance(hex) {
    const [r, g, b] = hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255)
        .map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return .2126 * r + .7152 * g + .0722 * b;
}
function readableInk(backgrounds, candidates) {
    const contrasts = candidates.map(ink => ({ ink, ratio: Math.min(...backgrounds.map(background => {
            const a = luminance(ink), b = luminance(background);
            return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
        })) }));
    return (contrasts.find(item => item.ratio >= 4.5) || contrasts.sort((a, b) => b.ratio - a.ratio)[0]).ink;
}
export function composeGenerationPalette(familyId, companionId, brightness = 'light', surfaceId = familyId) {
    const family = BY_ID.get(familyId), companion = BY_ID.get(companionId), surfaceFamily = BY_ID.get(surfaceId);
    if (!family || !companion || !surfaceFamily)
        return null;
    const mode = brightness === 'dark' ? 'dark' : 'light';
    const scale = COLOR_SCALES[familyId][mode], support = COLOR_SCALES[companionId][mode], surface = COLOR_SCALES[surfaceId][mode];
    const background = mode === 'light' ? scale[2] : scale[3];
    const readingSurfaces = mode === 'light' ? [surface[1], surface[3], surface[4]] : [surface[1], surface[2], surface[3]];
    const text = readableInk([readingSurfaces[0], background], [surface[11], '#111111', '#FFFFFF']);
    const muted = readableInk([readingSurfaces[0]], [surface[10], text]);
    const roles = Object.freeze({ background, surface: readingSurfaces[0], hover: readingSurfaces[1], selected: readingSurfaces[2],
        text, muted, border: surface[6], accent: scale[8], accentHover: scale[9],
        objectSurface: scale[5], onObject: readableInk([scale[5]], [scale[11], '#111111', '#FFFFFF']),
        objectHover: scale[6], onObjectHover: readableInk([scale[6]], [scale[11], '#111111', '#FFFFFF']),
        onAccent: readableInk([scale[8]], ['#FFFFFF', '#111111', '#000000']),
        onAccentHover: readableInk([scale[9]], ['#FFFFFF', '#111111', '#000000']),
        companion: support[8], onCompanion: readableInk([support[8]], ['#FFFFFF', '#111111', '#000000']),
    });
    return Object.freeze({ id: `radix-${familyId}-${surfaceId}-${companionId}-${mode}`, family: familyId,
        surfaceFamily: surfaceId, companionFamily: companionId, brightness: mode,
        title: `${family.title}·${surfaceFamily.title}${__rmT("aB35yT")}${companion.title}${__rmT("KNdaif")}`, mood: family.mood,
        roles, scale, colors: Object.freeze([roles.background, roles.surface, text, roles.accent, roles.companion]), });
}
export function selectGenerationPalettes(faceContexts) {
    const selected = new Map();
    for (const face of faceContexts || []) {
        if (face.textPresentation || face.combo?.pureOrder)
            continue;
        for (const candidate of face.atmosphereFaces || [face]) {
            const index = paletteRecipeFor(candidate.combo);
            if (!index || selected.has(index.id))
                continue;
            const detail = composeGenerationPalette(index.family, index.companionFamily, index.brightness, index.surfaceFamily);
            if (detail)
                selected.set(index.id, Object.freeze({ ...detail, code: index.code }));
        }
    }
    return [...selected.values()];
}
export function buildGenerationPaletteRule(palettes, faceContexts) {
    if (!palettes?.length)
        return '';
    const available = new Set(palettes.map(item => item.id));
    const assignments = (faceContexts || []).flatMap((face, i) => face.textPresentation || face.combo?.pureOrder ? []
        : (face.atmosphereFaces || [face]).flatMap((candidate, k) => {
            const p = paletteRecipeFor(candidate.combo);
            return p && available.has(p.id) ? [`${__rmT("BJgCyT")}${i + 1}${__rmT("2RddPk")}${face.atmosphereFaces ? `${__rmT("70njpz0SHKG")}${k + 1}` : ''}${__rmT("7ys")}${p.code}`] : [];
        })).join(__rmT("7os"));
    if (!assignments)
        return '';
    const numbers = (faceContexts || []).flatMap((face, index) => !face.textPresentation && !face.combo?.pureOrder
        && (face.atmosphereFaces || [face]).some(candidate => available.has(paletteRecipeFor(candidate.combo)?.id)) ? [index + 1] : []);
    const sceneFaces = (faceContexts || []).flatMap((face, index) => !face.textPresentation && !face.combo?.pureOrder
        && (face.atmosphereFaces || [face]).some(candidate => candidate.visualSceneryMode) ? [index + 1] : []);
    const sceneNote = sceneFaces.length ? `${__rmT("NyshhrqzwcKpX2hd9GwdHT")}${sceneFaces.join(__rmT("jvk"))}${__rmT("25aP0S65aPlU0xhyj7LUNsKDDOt.MGPYf9O2DOAdxsQkhwNOktyxn3pEuLwsqwt2g5JSRRfxO6qM1R7dVSDqBP9j2dfFyDthw_vjO2ujPN9eU1Z8mPGgL0YFpIX9cUQer6A")}` : '';
    return `${__rmT("z.QLlQ4wbUPfOWpnIghM46bOgJOW.Dr1.2YY.VZC4g8")}${numbers.join(__rmT("jvk"))}${__rmT("kbjDJ4JVyW15oPcZZ3c8hswJsHXGJusDhefXCk1mBQwAsCnZc6_")}${assignments}${__rmT("2I6uoR1dVhpjHhh7Y_q77MCpwIb7R69oH9ZwJZCLWnKdTkWimG5bmsWchMlFBi4xYfDMPM2yzkBqBV6TnvndL4keodZzV.hOxe46ABp7TUCRdJpDmWtgyy8U9w3tKbeSUGC2rUXILngMsk706J44b_.2wp71Z7eP6LdmWgp.wT71_aFBm7lb1XPPA2m8kcMa0TtTFwB8v_TyUmLeot7A.wV0INstoBPBu0e_rB7yxr7h8TEcLBehGNsxYjrSxgrZNriWDCNpfkp3nuk2yjNUyAClxKZ8vxsqmA2wAeZ1lXIUTxYnHScHcuqFfS5JV41u3xibeREK0fbUFEYmksvKStSQGDP18Lb6YGVadoHnVqs.p6NVfRxCTntS_Hs.89hP0XctTy8Sy_kYi19g25xLCiceziD4OlsqgDQzA8tMTRralzEjhwknD6.C4VDUFNKp45YEupS1.PTCwgQGsiKzJuls3KB4Njr3Cu2tlf6ygGpoc8FCR3Ftp3JXh8Zx5DUW1MNGpACJN7IEc1ogG7GbupU6STCJSyxJ0ceNLFsqxc9QO0vZc2PVVXsqhR4hXt4ZKH2fCa7mpZ8Km6zNKXtFPaEHo1D7dhVOuFm55Rk1Fy7Xos1giTtGA84sUfPEmotwnsmjSRLfD7PmnmUKgc252wQf")}${palettes.map(item => { const p = item.roles; return `${item.code}${__rmT("YSk")}${item.title}${__rmT("Yvk")}${item.brightness === 'dark' ? __rmT("w2n1.T") : __rmT("z2n1.T")}·${item.mood}${__rmT("7ys")}${p.background}${__rmT("Yos")}${p.surface}${__rmT("Yos")}${p.text}${__rmT("Yos")}${p.muted}${__rmT("Yos")}${p.objectSurface}+${p.onObject}${__rmT("Yos")}${p.accent}+${p.onAccent}${__rmT("Yos")}${p.companion}+${p.onCompanion}`; }).join('\n')}${sceneNote}`;
}
export function buildPostGenerationColorRule(palettes, faceContexts) {
    if (!palettes?.length)
        return '';
    const available = new Set(palettes.map(item => item.id));
    const assignments = (faceContexts || []).flatMap((face, i) => face.textPresentation || face.combo?.pureOrder ? []
        : (face.atmosphereFaces || [face]).flatMap((candidate, k) => {
            const p = paletteRecipeFor(candidate.combo);
            return p && available.has(p.id) ? [`${__rmT("BJgCyT")}${i + 1}${__rmT("2RddPk")}${face.atmosphereFaces ? `${__rmT("iDHkVnHJf2OBTh")}${k + 1}` : ''}${__rmT("svalfBbXN6h5wRxPNRKH4cndcfjuNZYgcAZdl5bpj22VPTQy")}${p.code}"`] : [];
        }));
    if (!assignments.length)
        return '';
    return `${__rmT("7jMFyqBwT3fUn4_r5g0AOTLSRaRWX.e6_ys824LQ8hWq.eekdRkum036T.2_jYwQRARyk5qz6hJZiCwD79zTcyYgUqT")}${assignments.join(__rmT("7os"))}${__rmT("jC0yVrbVv4BlLbEwmpbDArf.7GSP25hSWY1AEVyv78o10KN5rlDmcP5ms65_Qv9yYAlD.y9C0Ka0FkO.7G39tt3RxjmKALHSxsA7hy0AMr0nP1NdeOiM7HmPXQ8VbbBy_6Y2A_PCEbYuq2ZonRwJN_v0r6m2HUccJwmSR5mAiY56i5JRb_O9a9EkbyXp0OsjyEXNh5yC.SmLOqv7jLpnYr06GBAugnP8nmTZf5yMoV3Bt6XediLoEc5IW5KUPFz0vnuegvN93Q4UYwnI1N.bh3vEFDXw8fHBIDuUY0G5N2vsc5ozToSEjf.S3km1Z335yFPVFxovE9Jb1tE8UnBGtJuEIYyXDzGe2XMnkBAr.zRzkK7R64GSTBgofccqn0G4ez_e_3kNVp1ZuCb7jRaBm1cREEAnhSQxIYf_k6MGNKoWd.j4HZ03llfjkOeeaxWhfzKfUykWnIixWCRDoSL3NGgqcovvra2EF19_hVZHpwW2lrJk7eGYH4f2T_gmx6KYr41rWhf5cnOJcTJVTYJSHpPEm3xxF3db.OfsORAs52aV_0LvQ6A0ivH17G69z_Hwj.uVfn_Or.0DJdURA5VI4LAti1gIeKNx3cwzRa647pwKiy38SVumrNtI6ib6CiVJX3Ptjg2MUZ7BVPAsYQJpb1S0YVOMhkxFCsl3x5SWYEuXfQlPMgIWY1xeVu6EB0H7hjB5F181ojtNhXm0FH1osEZGkjshoWQ5cuFxZjtmne5CLFK6dC5PmAg9hwLJj6viZZZfWcA9dBYuZ93JgMyf6ZKig6OoFfc60BY9MzzyrE8F1vGk4zXd.2YH77HsQGkP5Sm3YiwbKbfTsJ0w3bFaAHzbwGtskx0tpdzh_LsfAJQHQRRNaJ488ZvjmcT6kXDblEkA.L_3CJcHE1p8w9sBUXapDpEy05RL_jNCgAn9Kt9oqrrvVpoHI0nJ0BGKcNmOnhenWkfO9yNmPhveH8p9h7eodKHaiOrHSuvHDBvgUI5.XfC.g7N8u7rKgI_dhecT5UqUQ2hQY7FiLg6h8DpijR4nl0yaVPBhq8QrmTqbiyowiejZxq4k3giPlzLEWR5oBahrfle.816EUaEvTHXGpGqwQFSn3b23x_ViV53byzDMvmaVRrJaBdvHyznW.zpbRzhV.5Qk3l.ozKNV_Dl5Hkf4guPs6oVam0c2t8TYTIjrejKmy3wCChMaUzWPO1FHGTjjc8SW1YQhRXjJKYYrBPQHd.YYgtMZaXn2qO1FADOvrO9FihDlcV0TgwZ8wh8YKaAxO36G_SMhd2TuXqRWTRC12i43TR3mhW6R43mWaI0ZY_KFYxrrHKluIRaFXebUTO4MV3DslVIBnRfHrPrsWGafkF2jrpa85QRCZ5RLiDIrtAiYvUM4II7KTcWuwk")}`;
}
