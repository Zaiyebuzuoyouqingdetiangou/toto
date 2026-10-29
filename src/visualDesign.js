import { rmT as __rmT } from "./textTable.js?rmv=1.99.11";
export function visualDesignMode(settings) {
    return 'guided1553';
}
export function usesModelOriginalColors(settings) {
    return true;
}
export function postGenerationRecolorEnabled(settings) {
    return false;
}
export function withoutPaletteRecipe(combo) {
    if (!combo || typeof combo !== 'object')
        return combo;
    const next = { ...combo };
    delete next.paletteRecipeId;
    if (Array.isArray(combo.atmosphereMenu))
        next.atmosphereMenu = combo.atmosphereMenu.map(withoutPaletteRecipe);
    return next;
}
export const GUIDED_VISUAL_FLOOR = __rmT("gzbHmnNgbzlRHOdBRodvIHCgtDgbf7GgjMBNPkLpajRSNj9_g_Cr3W8yPIMKieGZq3jyIL6NTsjeh87Jl.iIGIYRi32zt.e5e2miYcNSLY7hlagGXXr3G1d08cP669cunuMytN1v7yFoQm9Z.y2xV6hrouapfSQaYMXRGsNhYkku8Hg5PCQGDaeeL.7KP6DzfSU7PD7twRpWtZaK4xv0mhfY9XlpILdxLS_PoVlMD3PBbqT2FvkBy4A3b73kP5MLipGu4biS");
export const COMMON_VISUAL_DRAWING = __rmT("VpUvdeJFUIFk4mcrb1NGsYJinjcgH4HPSJHOcCW0UA4E_rKrI9LxojVNvyUQnGAZ_xxDef1DR7jkovOlob8t_iBKkOvdL7yN7JD06s4yXRlylr47Lm0ixuy43UhLZz_iFT3s.vO9LmvNNCnyTciNgaA3oqkoPZvFBrzMYIKHm5L84.t3Rycht98EbP7Fs5OhP5HtgMdNM0X7s8GIfrdyi8gXboNMeR7aiW7sgTH7xsU246xZmfqwdgIWcpHLYi59wa1ghvdH7z4klSOTjvuWWutrAoyRrEofh1HR2fcWlqPh_Vla0vLXpEraJoZlngOBOl3nfEacIvvnmVo5F4_FnEeKsPn7.DmmT1CdZ9vszJMMivNsJ5SmOHmQKRl8OW5X.f4NTvspfxI6tGKw3qxkES0rWlpJ2d8DP25Wl3DDogvhgDBu51FDymhIVIOBv07Azl_Scw7RKhC_OQooq9.kMv757kvPiMvDPzKBri5WbbX3AuBgY3fdTRQL41dog4Tie6ScIzruQ1KsicOv.Oei2crkr__Lk9lBhu13QasVV2oD3T7c8HX_Nh");
