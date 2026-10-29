import { rmT as __rmT } from "./textTable.js?rmv=1.99.13";
const text = value => typeof value === 'string' ? value.trim() : '';
const normalized = value => value.normalize('NFKC').toLocaleLowerCase();
const cancelled = () => Object.assign(new Error(__rmT("CgQohontu9y3pwUNiBPpUT")), { code: 'ABORTED' });
function catalogEntries(catalog = {}) {
    const entries = new Map();
    const counters = { theme: 0, format: 0 };
    for (const kind of ['theme', 'format']) {
        for (const category of catalog[kind] || []) {
            for (const item of category.items || []) {
                if (item.blocked || !text(item.id) || !text(item.title) || entries.has(item.id))
                    continue;
                counters[kind] += 1;
                entries.set(item.id, { id: item.id, title: item.title, kind, short: `${kind === 'theme' ? 't' : 'f'}${counters[kind]}` });
            }
        }
    }
    return [...entries.values()];
}
const DRAFT_CATALOG_CHAR_BUDGET = 24000;
function draftCatalogRows(name, entries) {
    const chars = new Set([...normalized(text(name))].filter(char => /[\p{L}\p{N}]/u.test(char)));
    const score = entry => [...new Set(normalized(entry.title))].filter(char => chars.has(char)).length;
    const ranked = entries.map((entry, index) => ({ entry, index, score: score(entry) }))
        .sort((a, b) => b.score - a.score || a.index - b.index);
    const rows = [];
    let used = 0;
    for (const { entry } of ranked) {
        const row = [entry.short, entry.title.slice(0, 40)];
        const cost = JSON.stringify(row).length + 1;
        if (used + cost > DRAFT_CATALOG_CHAR_BUDGET)
            break;
        rows.push(row);
        used += cost;
    }
    const order = new Map(entries.map((entry, index) => [entry.short, index]));
    return rows.sort((a, b) => order.get(a[0]) - order.get(b[0]));
}
export function buildAtlasDraftPrompt(name, catalog) {
    if (!text(name))
        throw new Error(__rmT("Nc8jShPMnz1BeIJKri9_vxEI"));
    if (catalog?.warnings?.length)
        throw new Error(__rmT("HOHcwWeo1RLu7EM.kZgdBbVpLzqL7C8VWxYvdoRq3xpRdh.0nyICJ84g8oUSEinT6wdJMuGP"));
    const entries = catalogEntries(catalog);
    if (!entries.length)
        throw new Error(__rmT("X.sPRBlSkaU2Oencna4wvCNRu_N4eojhGGMhOm.MDT9zG.QtTK0RDEdt9nXuXFPkjoQY3h"));
    return {
        systemPrompt: __rmT("l6jFBdOqb17ZsPWnzgL0GivYVWFU9p_gqpf.69bMRwLBnK5uvJi3CfRqOz1JctMOfjkhHxy8wE4Bv4B8_.cRJkqM4oJ6NmaJ4ot.CUwSlvhYf3ZBpBGRJt_u2fp_x8YPsuqmculDvflK39o30DhPT0exOCJLCvCCvSQzackuGTH5TLpcAV71lFHzp5avKDs1x3m8DP3cFRLqQ8CuE3bjySUQ95GXW2tfwSjfgQlDVyBW79IVdpwWBrDnb1l.EKGpu3T28qqV1kXnB4c48AwvWlojNS5BPKxrJ4jTu3YC8jguMNCSfSp0D7lvpIwbsS0zk9xQ4_8qRgd9ertTockKYoD97vfgBrdDnI5wVJdPM_0o2j.Fy0yEJVadm6l8KgAL6Ly_vU.lHBDY4.hCwA8.ecgIXsh5v4criag21N22kS4vk3vgka5NlKeau9OdZZ7xCtkSB6f26yGj.HVfXu2y8TRToOaNe8ZK3DjTnM4lqPMD4xHBrk2HQ5hOKuFsDPtW5CjA8F2jYBhRmRjJIQIyJsUSKw7iMEIdz_eqihoykSaXboPIMT9OLlUqBoVk.grWa3qYfsxXaBSQn2AXOVhSqLdFyU0mMF1vhuDl_59DssFoju0PTqpt2K9McqeTS9kRbDlaRYr5_4c9vT.aboDrrxh9UwQ9utQQpvETbb_C.2bp6t56AxTEoipGHQ0Nhtq6DDrfSVNFKF.WY31cdx8OyZhVjeW0YEXFrSaePhaJw9mtnlHZa8xavu1y4CnFvytsp.EZ7k0aXro3wbDSSRWdOrKKST9drYcHUimiHfginypsLvAN725mMgWyCAL9Ib0pqlrnDAiGgRgdgJg2tJUM2X.UpprUZZ2x.vwmIfjjY3jEhDFic.Cggf2ssCzT.1USPTz7tLUjhZf3WLdpq7ePEgszrKGzR87NHdnCyx15eiwZ3SNimGQz.fkjub8E5DEzufNoD3wvg7XXT0uJCWYsMo65uZdSGYPXbEG7fIOkXhcq0JpHk.ImPM05KG02wHxdhlEWQLFH8WnHXbdbOFnjrJ8SH.O4NlfhjQB.6xUqojyhR8Rg6KJUQXgPyPW2S510VvnHZxE.E2hlfmSKza1OmgHas3I.PYeJOts866NbPUwynPTPEVLM63fm.Gb.lW.kKSEfpVgtSjxlcvbNjDgyEO08MZAwL8JJicbfjkDpLw4Oz1Te_vJEz2FHvewtlBceqKK0YlH6i.K_eKLaVKFUVtdwYO3wAxFF_zbwWJJsfFHW0LcN1nGOXZ2JjHtTFsjh28TSJtcjNQuZ4DBVC6MQgsRIYt.wyVcNdEQX6tV7SUDn12NPJ3_2AonK.qk6xbqa888NaLhyQqDwmLR7tzKVpkKcyKnxhghUD5jBhQ6eOEAWOcpuw3GcNwjFIMhIyHPK8oNWhwUNu6ECksjSGKmx4B5OhQcTE6pBN2Je6lbTYtLpENSzOvA4uN_tc8qzBMnOGu5OLT"),
        prompt: JSON.stringify({ atlasName: text(name), entries: draftCatalogRows(name, entries) }),
    };
}
export function parseAtlasDraftResponse(value, catalog) {
    let source = text(value);
    const fenced = source.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    if (fenced)
        source = fenced[1];
    let result;
    try {
        result = JSON.parse(source);
    }
    catch {
        throw new Error(__rmT("E7ENyES5s3O9N_OZ9DP3eduTIK5fvnVaDQ1WM3EKi_HrGH_ODcUAAOSxCravBiMbYxZPO3APe9EpiCppx5JFLdGu"));
    }
    if (!result || typeof result !== 'object' || !Array.isArray(result.relatedIds) || !Array.isArray(result.slots)) {
        throw new Error(__rmT("V8Z_AMKKDlQict8AVFrDeka49bHJRpIERxePNgruFbdOaSQX"));
    }
    const all = catalogEntries(catalog);
    const entries = new Map([...all.map(item => [item.short, item]), ...all.map(item => [item.id, item])]);
    if (!result.relatedIds.length || !result.slots.length)
        throw new Error(__rmT("j1uA5ndaRRsZCTKWMFJ5DjH7gjLpS1IgPdRxVWh2iNkKPO_msJtTCu1vWXeeX5Na1AMn1Q6ah_2PxcSxqAk"));
    if (result.relatedIds.some(id => typeof id !== 'string' || !entries.has(id)))
        throw new Error(__rmT("1ugqdJ0DotU240ezfsUfpVPTf0eZ0Pm_ahTzLTqtttnh_nPck5RYhj5X"));
    const validLabel = value => typeof value === 'string' && !!value.trim() && !/[|\r\n\0]/.test(value);
    const seen = new Set();
    const slots = result.slots.map(slot => {
        if (!slot || !validLabel(slot.label) || !Array.isArray(slot.keywords) || slot.keywords.some(word => !validLabel(word))) {
            throw new Error(__rmT("0WVLO0jQCqVMnykrwYac4TMnNggMLidG68k5fTvuUWyszoe7B9wI3KHRtHUy7zkC"));
        }
        const label = slot.label.trim(), key = normalized(label);
        if (seen.has(key))
            throw new Error(`${__rmT("mwuam5HJi6eAsh")}${label}${__rmT("ZQj5xXpKpt3UYxFfq4TN0RIw_1TlWN6N29E")}`);
        seen.add(key);
        const words = new Map([label, ...slot.keywords.map(word => word.trim())].map(word => [normalized(word), word]));
        words.set(key, label);
        return { label, keywords: [...words.values()] };
    });
    return { slots, relatedEntries: [...new Set(result.relatedIds.map(id => entries.get(id)))] };
}
async function currentCatalog() {
    const [{ getSettings }, { loadFaceDrawCatalog }] = await Promise.all([
        import('./settings.js?rmv=1.99.13'),
        import('./faceDrawCatalog.js?rmv=1.99.13'),
    ]);
    return loadFaceDrawCatalog(getSettings());
}
export function createFavoriteAtlasDraftGenerator({ readCatalog = currentCatalog, getApi = () => globalThis.RabbitMirrorAPI } = {}) {
    let active = null;
    const generate = async (name) => {
        if (active)
            throw new Error(__rmT("MmpvTQnKlMgUj04m5To5v29wNVbpt8jsby986aSKgG8"));
        if (!text(name))
            throw new Error(__rmT("Nc8jShPMnz1BeIJKri9_vxEI"));
        const owner = { cancelled: false, requesting: false, api: null };
        active = owner;
        try {
            const catalog = await readCatalog();
            if (owner.cancelled)
                throw cancelled();
            const prompts = buildAtlasDraftPrompt(name, catalog);
            const api = getApi();
            if (typeof api?.generate !== 'function')
                throw new Error(__rmT("hdgt0P2VY.NtJ5x20d5fYUjuEqpLarjakTA.XFA8SRE49rviOGDw5zPw2TdEAXkXMxI14XgauTYobh"));
            if (api.getStatus?.().busy)
                throw new Error(__rmT("W7CVFL0gg2DXlk42s78wefyGobYB_o1wqagGjygv0EFlYlMJLYwV126eaXxR.F1vYt1qmFGP"));
            owner.api = api;
            owner.requesting = true;
            const result = await api.generate({ ...prompts, includeMemory: false, manualRetry: false });
            owner.requesting = false;
            if (owner.cancelled)
                throw cancelled();
            return parseAtlasDraftResponse(result?.text, catalog);
        }
        finally {
            owner.requesting = false;
            if (active === owner)
                active = null;
        }
    };
    generate.cancel = () => {
        if (!active || active.cancelled)
            return false;
        active.cancelled = true;
        if (active.requesting) {
            try {
                active.api?.stop?.();
            }
            catch { }
        }
        return true;
    };
    return generate;
}
