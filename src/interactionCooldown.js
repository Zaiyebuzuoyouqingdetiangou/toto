import { rmT as __rmT } from "./textTable.js?rmv=1.99.19";
import { recentDiversityRecords } from './compositionFingerprint.js?rmv=1.99.19';
export const INTERACTION_FAMILY_LABELS = Object.freeze({
    tabbed_radio_family: __rmT("MlvxSsOT12y235kF8nBbY3wEzh_"),
    multi_control_panel_family: __rmT("bnncb5L27IEe6hvE_3Y"),
    checkbox_reveal_family: __rmT("l08qnZzr5kXprDRBRlE"),
    multi_checkbox_family: __rmT("OG5d9FmTqykHmLRIfiaIAZRD"),
    inner_details_family: __rmT("9JKZ5KBEKsLflN7P"),
    flip_card_family: __rmT("WIDTSsT9t0HarLUH2Rp"),
});
export function recentInteractionCooldowns(recentFamilies) {
    const recent = recentDiversityRecords(recentFamilies, 5)
        .map(item => Number(item?.confidence ?? 1) >= 0.6 ? item : null);
    const counts = new Map();
    for (const item of recent) {
        if (Object.hasOwn(INTERACTION_FAMILY_LABELS, item?.id))
            counts.set(item.id, (counts.get(item.id) || 0) + 1);
    }
    return Object.keys(INTERACTION_FAMILY_LABELS).filter(id => counts.has(id))
        .map(id => ({ id, label: INTERACTION_FAMILY_LABELS[id], count: counts.get(id) }));
}
