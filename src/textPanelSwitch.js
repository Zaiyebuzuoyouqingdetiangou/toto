// Read-only evidence for the text-panel cooldown. Unknown CSS and device
// controls are not evidence of repeated prose, regardless of their appearance.
const CONTROL = 'input, label, button, summary, select, option, a';
const MEDIA = 'svg, canvas, img, picture, video, audio, iframe, object, embed';
const CHROME = '[data-rabbit-mirror-tool-entry-host], [data-rm-tool-storage]';
const VISIBILITY = /(?:^|;)\s*(?:display|visibility|opacity|(?:max-)?height)\s*:/i;
const HIDDEN = /(?:^|;)\s*(?:display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0(?:\.0+)?|(?:max-)?height\s*:\s*0(?:px|rem|em|%)?)\s*(?:!important\s*)?(?:;|$)/i;
const STATE = /:checked\b|:target\b|\[open\]/i;

function query(root, selector) {
    try { return [...root.querySelectorAll(selector)]; } catch { return null; }
}

function selectors(text) {
    // Complex functional selectors need their own proof; do not flatten their
    // commas or guess a target. Returning unknown never rejects a work.
    if (/[()]/.test(text.replace(/:not\(\s*:checked\s*\)/g, ''))) return null;
    return text.split(',').map(value => value.trim()).filter(Boolean);
}

function rulesFor(root) {
    const css = query(root, 'style').map(node => node.textContent || '').join('\n')
        .replace(/\/\*[\s\S]*?\*\//g, '');
    return [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(match => ({
        selector: match[1].trim(), declarations: match[2].trim(),
    }));
}

function nodePath(node, root) {
    const parts = [];
    while (node && node !== root) {
        const parent = node.parentElement;
        if (!parent) return '';
        parts.unshift(`:nth-child(${[...parent.children].indexOf(node) + 1})`);
        node = parent;
    }
    return node === root && parts.length ? `:scope > ${parts.join(' > ')}` : '';
}

function plainTextPanel(node, rules) {
    if (!node || !/^(?:DIV|SECTION|ARTICLE|ASIDE|LI|P|BLOCKQUOTE|PRE|DL|UL|OL|DETAILS)$/.test(node.tagName)) return false;
    if (node.matches(MEDIA) || node.querySelector(MEDIA)) return false;
    // A device can contain captions and controls; those are not a prose body.
    if (node.querySelector('input, button, select, textarea, [popovertarget], [commandfor]')) return false;
    const copy = node.cloneNode(true);
    copy.querySelectorAll(`${CONTROL}, style, script, [aria-hidden="true"]`).forEach(child => child.remove());
    const text = String(copy.textContent || '').trim();
    if (!text || (!copy.querySelector('p, blockquote, pre, dl') && text.length < 40)) return false;
    // CSS-only scenery also counts as visual content. A caption does not turn
    // an animated object, mask, or spatial drawing into a prose panel.
    for (const part of [node, ...node.querySelectorAll('*')]) {
        if (part.matches(CONTROL) || part.closest(CHROME)) continue;
        const authored = [part.getAttribute('style') || ''];
        for (const rule of rules) {
            if (STATE.test(rule.selector)) continue;
            try { if (part.matches(rule.selector)) authored.push(rule.declarations); } catch { /* unknown, not positive evidence */ }
        }
        const style = authored.join(';');
        if (/\b(?:animation(?:-name)?|clip-path|mask(?:-image)?)\s*:/i.test(style)) return false;
        if (/\bbackground(?:-image)?\s*:[^;]*url\s*\(/i.test(style)) return false;
        if (!String(part.textContent || '').trim() && /position\s*:\s*absolute|(?:radial|conic)-gradient\s*\(/i.test(style)) return false;
    }
    return true;
}

function startsHidden(node, rules) {
    const values = [node.getAttribute('style') || ''];
    if (node.hasAttribute('hidden')) values.push('display:none');
    for (const rule of rules) {
        if (STATE.test(rule.selector)) continue;
        try { if (node.matches(rule.selector) && VISIBILITY.test(rule.declarations)) values.push(rule.declarations); } catch { return false; }
    }
    const visibility = values.filter(value => VISIBILITY.test(value));
    return visibility.length > 0 && visibility.every(value => HIDDEN.test(value));
}

/** A positive result proves repeated prose targets, not just similar triggers. */
export function inspectTextPanelSwitch(root) {
    if (!root?.querySelectorAll) return null;
    const rules = rulesFor(root);
    const routes = new Map();
    const panelCache = new Map();
    const isPanel = node => {
        if (!panelCache.has(node)) panelCache.set(node, plainTextPanel(node, rules));
        return panelCache.get(node);
    };
    const add = (control, panel) => {
        if (!routes.has(control)) routes.set(control, new Set());
        routes.get(control).add(panel);
    };
    // A native disclosure supplies its own show/hide mechanism. Only siblings
    // with actual prose bodies qualify; nested scene objects do not.
    const disclosures = query(root, 'details') || [];
    const outer = root.tagName === 'DETAILS' ? root : disclosures[0];
    const groups = new Map();
    for (const node of disclosures) {
        if (node === outer || node.closest(CHROME) || !isPanel(node)) continue;
        const summary = [...node.children].find(child => child.tagName === 'SUMMARY');
        if (!summary) continue;
        const peers = groups.get(node.parentElement) || [];
        peers.push([summary, node]); groups.set(node.parentElement, peers);
    }
    for (const peers of groups.values()) {
        const exclusive = peers.length >= 2 && peers[0][1].getAttribute('name')
            && peers.every(([, panel]) => panel.getAttribute('name') === peers[0][1].getAttribute('name'));
        if (peers.length >= 3 || exclusive) peers.forEach(([control, panel]) => add(control, panel));
    }

    for (const rule of rules) {
        if (!STATE.test(rule.selector)) continue;
        const list = selectors(rule.selector);
        if (!list) return null;
        for (const authored of list) {
            const inverted = authored.replace(/:not\(\s*:checked\s*\)/g, ':checked');
            const match = inverted.match(STATE);
            if (!match) continue;
            const suffix = inverted.slice(match.index + match[0].length);
            if (STATE.test(suffix) || /::/.test(suffix)) return null;
            const ownerSelector = inverted.slice(0, match.index).trim();
            const owners = query(root, ownerSelector);
            if (!owners) return null;
            for (const owner of owners) {
                if (owner.closest(CHROME)) continue;
                let control = owner;
                if (match[0] === ':target') {
                    control = (query(root, 'a[href^="#"]') || []).find(a => a.getAttribute('href') === `#${owner.id}`);
                } else if (match[0] === '[open]') {
                    control = [...owner.children].find(child => child.tagName === 'SUMMARY');
                } else if (!owner.matches('input[type="radio"], input[type="checkbox"]')) continue;
                if (!control) continue;
                const targets = suffix.trim() ? query(root, `${nodePath(owner, root)}${suffix}`) : [owner];
                if (!targets) return null;
                for (const target of targets) {
                    if (target.closest(CHROME) || target.matches(CONTROL) || target.closest('label, button, summary')) continue;
                    // A switch which also changes a picture/object/state is a
                    // device interaction, even when it has a prose transcript.
                    if (!isPanel(target)) return null;
                    if (/\bbackground(?:-image)?\s*:[^;]*url\s*\(/i.test(rule.declarations)) return null;
                    if (VISIBILITY.test(rule.declarations) && (HIDDEN.test(rule.declarations) || startsHidden(target, rules))) add(control, target);
                }
            }
        }
    }
    const panels = [...new Set([...routes.values()].flatMap(value => [...value]))];
    const independentPanels = panels.filter(panel => !panels.some(other => other !== panel && other.contains(panel)));
    const controls = [...routes].filter(([, targets]) => independentPanels.some(panel => targets.has(panel)));
    if (independentPanels.length < 2 || controls.length < 2) return null;
    return { controlCount: controls.length, panelCount: independentPanels.length, textPanelSwitch: true };
}
