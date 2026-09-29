// Preferences for the next generation only. Never reject, remove or retry a
// completed work. Preserve empty history positions so unknown mechanisms age
// out old observations just like recognized ones.
export const INTERACTION_FAMILY_LABELS = Object.freeze({
    tabbed_radio_family: '同构入口（横排标签／竖排条目）',
    multi_control_panel_family: '多控件状态面板',
    checkbox_reveal_family: '单入口显隐揭示',
    multi_checkbox_family: '多点勾选／清单揭示',
    inner_details_family: '内部折叠分层',
    flip_card_family: '翻面／双面切换',
});

export function recentInteractionCooldowns(recentFamilies) {
    const recent = (Array.isArray(recentFamilies) ? recentFamilies : []).slice(-5);
    const known = item => item && Object.hasOwn(INTERACTION_FAMILY_LABELS, item.id)
        && Number(item.confidence ?? 1) >= 0.75 ? item.id : '';
    const ids = recent.map(known);
    const counts = new Map();
    ids.forEach(id => { if (id) counts.set(id, (counts.get(id) || 0) + 1); });
    const lastTwo = ids.slice(-2);
    const repeatedLast = lastTwo.length === 2 && lastTwo[0] && lastTwo[0] === lastTwo[1] ? lastTwo[1] : '';
    return Object.keys(INTERACTION_FAMILY_LABELS).filter(id => {
        // One tabbed work briefly cools its skeleton, not the sampled medium.
        if (id === 'tabbed_radio_family') return ids.slice(-3).includes(id);
        return (counts.get(id) || 0) >= (id === 'multi_control_panel_family' ? 2 : 3) || repeatedLast === id;
    }).slice(0, 2).map(id => ({ id, label: INTERACTION_FAMILY_LABELS[id], count: counts.get(id) || 0 }));
}
