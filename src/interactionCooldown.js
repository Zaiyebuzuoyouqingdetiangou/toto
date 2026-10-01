import { recentDiversityRecords } from './compositionFingerprint.js?rmv=1.62.53';
// Keep the 1.5.53 family definitions. Recent use now enters default strong diversity, never output gates.
export const INTERACTION_FAMILY_LABELS = Object.freeze({
    tabbed_radio_family: '并列标签／多按钮切页',
    multi_control_panel_family: '多控件状态面板',
    checkbox_reveal_family: '单入口显隐揭示',
    multi_checkbox_family: '多点勾选／清单揭示',
    inner_details_family: '内部折叠分层',
    flip_card_family: '翻面／双面切换',
});

export function recentInteractionCooldowns(recentFamilies) {
    const recent = recentDiversityRecords(recentFamilies, 5)
        .map(item => Number(item?.confidence ?? 1) >= 0.6 ? item : null);
    const counts = new Map();
    for (const item of recent) {
        if (Object.hasOwn(INTERACTION_FAMILY_LABELS, item?.id)) counts.set(item.id, (counts.get(item.id) || 0) + 1);
    }
    return Object.keys(INTERACTION_FAMILY_LABELS).filter(id => counts.has(id))
        .map(id => ({ id, label: INTERACTION_FAMILY_LABELS[id], count: counts.get(id) }));
}
