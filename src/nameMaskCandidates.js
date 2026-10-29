import { rmT as __rmT, rmR as __rmR } from "./textTable.js?rmv=1.99.14";
const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
export function nameMaskCardKey(ctx) {
    const group = clean(ctx?.groupId ?? ctx?.group_id);
    if (group)
        return `group:${group}`;
    const character = ctx?.characters?.[ctx?.characterId];
    const avatar = clean(character?.avatar);
    return avatar ? `card:${avatar}` : '';
}
export function nameMaskCardLabel(ctx) {
    const group = clean(ctx?.groupId ?? ctx?.group_id);
    if (group) {
        const found = (Array.isArray(ctx?.groups) ? ctx.groups : []).find(item => String(item?.id) === group);
        return `${__rmT("Lwv8Yrop")}${clean(found?.name) || group}`;
    }
    const character = ctx?.characters?.[ctx?.characterId];
    return clean(character?.name || ctx?.name2) || '';
}
export function nameLikeParts(value) {
    let textValue = clean(value);
    if (!textValue || /^\/.*\/[a-z]*$/i.test(textValue))
        return [];
    if (__rmR("xuJCM_6Wb4ocSIeh5Wj.x2JXDHs", "").test(textValue))
        return [];
    textValue = textValue.replace(__rmR("Pp.XFnW6D2DElzhCb1qTIh4mhCFYgL3hiy9FpPYRN1L_z8tGjiIOnQXhTgMXAoHf71g0O2T2", "g"), '');
    const afterColon = textValue.split(__rmR("pEwChpxda.G", "")).pop();
    return afterColon.split(__rmR("AkejTYTQGhGyClvjA35JlrdjwxnoNAkP", "")).map(clean)
        .map(part => part.replace(__rmR("Pp.XFnW6D2DElzhCb1qTIh4mhCFYgL3hiy9FpPYRN1L_z8tGjiIOnQXhTgMXAoHf71g0O2T2", "g"), ''))
        .filter(part => part.length >= 2 && part.length <= (/[\u3400-\u9fff]/.test(part) ? 8 : 24) && !__rmR("19Ysuia2SYuDPRlRsqw4qf_AGz1Rsi9tluE", "").test(part) && !/^\d+$/.test(part));
}
function entriesOf(book) {
    const entries = book?.entries;
    if (Array.isArray(entries))
        return entries;
    return entries && typeof entries === 'object' ? Object.values(entries) : [];
}
async function fetchWorldBook(ctx, name) {
    if (!name)
        return null;
    let getHeaders = ctx?.getRequestHeaders;
    if (typeof getHeaders !== 'function')
        return null;
    const headers = new Headers(await getHeaders.call(ctx));
    headers.set('Content-Type', 'application/json');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
        const response = await fetch('/api/worldinfo/get', { method: 'POST', credentials: 'same-origin', headers, body: JSON.stringify({ name }), signal: controller.signal });
        return response.ok ? await response.json() : null;
    }
    finally {
        clearTimeout(timer);
    }
}
const FIELD_WORDS = new Set((__rmT("8Ctws7y8MCtE9YbjgN7UlaCOhkOdlLCofsh69xWWLqX5V2pRkXRbSvXbA7opkZ.0xaXG6iNCcbLiWSbB1Q6ol7SvLUPO99AUHgPI1KgNYnFEIgD.BxjRlKT4ljlH.6rYpKueFo2iJcl0cghuIi5WHdnoggg9MOeoj1jgYoUJ1PV7UFixGeKztGCPOG7fPbIFlYkuZcDvrDHviclJMu678BKxrVIk6apDRaf7Y0fBtTD.5mM_ANFosVyuCTtUlCj5__dVIVDR15W68VhACezEF44LQTX.n9baftxc0pJTvlrnF_rhC5q_G6S6AwPcXP4Or57u56Jjj3fs7r3n1tcWUNXeFTraLHkQD_H1J7VSpXHLHViW8kH1dcqSLQYa03zNlVUll7tPnR0cuKNdGhrRFB5DyHvDsjaygTFYXD3RvW7S2vpfA12DUmvxNYvUIPJPv65E1Yctjq939ATjLCL3PulxQVsaX8P6tWsJvNOXgFNBiYSrWxEXMDS8Lai4rOp4hzyJ2hRngOrHkzlKzUGU7Cb0nxStBOkQnx8qg4JzF.AD5tbWQFURsJHvomaxlx29ryFcZ3Ih8f.5D_PeUcQHCZhK.X3pX4qH4RS8Iggp8tuL3MUyPMoe2DDRQ1Mk.qUDSTWbtfv0KLBS1h2tr5o71_IIVmGZWQIbz7iBVzJPL6h_OCGihbdO2mziznbp4LWmCLCi9T4nVzlxQ1hifdVGV6BVr7DpqW3EjDyGmsGLRxI2OUz6sGoAM79Aa1iZBZej_xEQy2Qcj8b3lPnQIL.4K3shVavLbDQO2Q8UGGcOWcd1qGHtQGmDzU.SM9zZ6Rq66ttknhap4SqOCXsGSvcYQklJkC_fJ.RlUCmsk7paXm2SsZFM0Ud3BCiFf2ObgqWAD8hUElN1SJWnUM8fyfMh7vVwiZG27dtOpDpooZ2Se9uV6hy92rqJOXW60V1BxLnJkl_VA4lOiyHedDSZw63tzbSaLs2_8WCS1QYX6HCZ.r7un0BodklLshVLYxpcmDa7Ar7hqLLonXq_F.A9E6I6_b0rlXY42PVQD_3a4RWrC0wfs.nbmajpSi.PZoO4qzDeY36XAjKSwiwPtmNc.S3Qzyf07HdTzTRWds6oMaUOHm53v8nD1js")).split(' '));
const FIELD_LIST = [...FIELD_WORDS];
const fieldLike = name => FIELD_WORDS.has(name) || (name.length >= 4 && FIELD_LIST.some(word => name.endsWith(word) || name.startsWith(word)));
const HAN = '[\\u4e00-\\u9fa5][\\u4e00-\\u9fa5·]{1,5}';
const NAME_FIELD = __rmR("7spJBjEWQrG0CPMh3UHu0YCmrMqjRbdbByR81KXag2DLTJjxkeTGZB6ZANKa8FBbo2U5iHALp.eaAWmQUbmDqWlugUW_Q2IYu_2rHAKsd_Nv.q_H2PUH7fXEzlOCAOy1Z4lUVc0LYK3wnrVDlEdRiNaidnoBvpFGX5Y._L0Ib7k3rBaoni7HdS_oZ.mgB9wmOluSmVH9VhR4hukaWW5pN.XAnT9DbsZ.IlFW1ngomyRu62YUk2cK6w1fXw55dnF0", "gi");
const PEOPLE_FIELD = __rmR("PJYcLgjlI4Iuonb.vHAaitPKFZfogbrlmrTA9ZjXO163v5dpAEa6BRMyF3TVtN9meh6LaTtoyVseHZwd1GL_tAzG2fId0KkFNRKXeA5i5dSmmPkU6v3pyQNuvegE8OMb6NLTFlb3HhlI3njWLyA5oDZI_Ebakrfn", "gi");
const ALIAS_IN_PAREN = __rmR("_heej_W5ey_I732vAbprWLH01uhhh1Tnk3OTGEQttdz8qJx5vitSKF2pml22uTJLU1Bzr3u3UQHDupI24kvHzfuFgTdN_eIPMc4LbRRYogx0QRzKtjJaEQBAc3fF4D.ixsar9ZFe8ewMc8rxgDt.oEp92c4M22AXH5kbt3.Fb4hrp__RY45B4xuDYwvEWMBldcB", "g");
const HEADING_NAME = new RegExp(`^\\s*#{1,6}\\s*(${HAN})\\s*$`, 'gm');
const BRACKET_NAME = new RegExp(`${__rmT("zOrn8irjD850ftpAZHBajdMQ_YRiMji90bthRUSG89YpJHZGPjTWKV2y")}${HAN}${__rmT(".3Y4axJSmqIKkW_bZ68xECfx")}`, 'gm');
const LINE_NAME = new RegExp(`${__rmT(".KJ5f2PX2gOEwR.P7.sH4cwrphjUNLlgMYnokAqAu221PTOy")}${HAN}${__rmT("nrKX7gwBlZj3iJK9kp1dwe6y.ukYKFPu5wqFYtmSpEeHvPUIel9uAYiuVXrjoOWhgz6SHdX89DOSjK56hi9AHclFTl30Ek9K.v0odsYp5JZRpS7vrSLlr4OFvm4Kx7xzWwc3VexIj18nVBWkFNNVE.4_9ZiumvfsxipKOe1nko6AuwhUYRejJT")}`, 'gm');
const PLACE_SUFFIX = __rmR("uB1IcQBlIoW9zhex30PzRdl_Ng6cGof91634.Tb1sXR0rxthz8RoV9TkWIhnySMlWATIU_NpyO9ar9hOWoR5JwfSXclDyTRCYDSX9LqN", "");
const NON_PERSON_ENTRY = __rmR("vAmnjgtDvoGf44paA895EyGixsYxD.3LFEXA9XRo7sdamEFBoEY9wQh13Pch1ewB4HVvk.KpaCgKwEsE3nNWTCtosM1PmGVjgCLum35TLXclf05N6rDbm0gzkmh7e3A73XnlNsfMevph5rHz3Nj.upTvAm9O2jCHpVeTX1ZUFfFO17rBwZs_zYmaZLdoxYeOnEboj41DRP4QZiQO7FaxzuxXlGZYtN3pRcctL_Lh_twxXoTNr1RrGitQr5ZGyOWoNPXe8B1QUc0CjyAfTXMnMDTeIxW5M6tRlmhtqnNwVrOOU2SYyRAUhxIIHIJtZaN9EXsaIpHnQJQolUZZiBkGiabIOSM4hQooh5xY7mx1WlVSZf", "");
export function placeLike(name) {
    const text = clean(name);
    return /[\u3400-\u9fff]$/.test(text) && PLACE_SUFFIX.test(text);
}
export function namesFromText(value) {
    const text = String(value ?? '').slice(0, 200000).replace(/\*{1,3}|_{2,3}/g, '');
    const out = [];
    for (const match of text.matchAll(NAME_FIELD))
        out.push(...nameLikeParts(match[1].replace(__rmR("trcN8XwePaCM0Cf6JPD", ""), '')));
    for (const match of text.matchAll(PEOPLE_FIELD))
        out.push(...nameLikeParts(match[1].replace(__rmR("7JtMEJlBqM59QEkA5Hvzt8gishEFV98WWUW0Df", "g"), '')));
    for (const match of text.matchAll(ALIAS_IN_PAREN))
        out.push(match[1]);
    for (const pattern of [HEADING_NAME, BRACKET_NAME, LINE_NAME])
        for (const match of text.matchAll(pattern))
            out.push(match[1]);
    return out.filter(name => name.length >= 2 && name.length <= 8 && !fieldLike(name));
}
export async function findNameMaskCandidates(ctx, { exclude = [], fetchBook = fetchWorldBook, extraBooks = [], limit = 150 } = {}) {
    const found = new Map();
    const nonPerson = new Set();
    const skip = new Set((exclude || []).map(clean).filter(Boolean));
    const addName = (name, from) => { if (name && !skip.has(name) && !found.has(name))
        found.set(name, from); };
    const add = (value, from, notPerson = false) => { for (const name of nameLikeParts(value)) {
        const fresh = !found.has(name);
        addName(name, from);
        if (notPerson && fresh && found.has(name))
            nonPerson.add(name);
    } };
    const addFromText = (value, from) => { for (const name of namesFromText(value))
        addName(name, from); };
    add(ctx?.name1, 'user');
    const character = ctx?.characters?.[ctx?.characterId];
    add(character?.name || ctx?.name2, __rmT("gk9kYOTG"));
    const group = (Array.isArray(ctx?.groups) ? ctx.groups : []).find(item => String(item?.id) === clean(ctx?.groupId ?? ctx?.group_id));
    for (const member of Array.isArray(group?.members) ? group.members : []) {
        const card = (Array.isArray(ctx?.characters) ? ctx.characters : []).find(item => item?.avatar === member);
        add(card?.name, __rmT("62ZYkp26q88"));
    }
    for (const msg of Array.isArray(ctx?.chat) ? ctx.chat : [])
        if (!msg?.is_system)
            add(msg?.name, __rmT("kAwqaZndSG8"));
    const data = character?.data || character || {};
    for (const field of ['description', 'personality', 'scenario', 'first_mes', 'mes_example'])
        addFromText(data?.[field] ?? character?.[field], __rmT("ubT6IqujhY0Sdf"));
    const names = [];
    const embedded = character?.data?.character_book ?? character?.character_book;
    const linked = clean(character?.data?.extensions?.world);
    for (const name of [linked, clean(ctx?.chatMetadata?.world_info), ...(Array.isArray(extraBooks) ? extraBooks.map(clean) : [])])
        if (name && !names.includes(name))
            names.push(name);
    const settled = await Promise.allSettled(names.slice(0, 20).map(name => fetchBook(ctx, name)));
    const books = settled.filter(item => item.status === 'fulfilled' && item.value).map(item => item.value);
    if (!linked && embedded)
        books.unshift(embedded);
    let budget = 3000000;
    for (const book of books) {
        for (const entry of entriesOf(book)) {
            if (entry?.disable === true || entry?.enabled === false)
                continue;
            const title = clean(entry?.comment || entry?.name || entry?.title);
            const notPerson = NON_PERSON_ENTRY.test(title);
            add(title, __rmT("GnEVs1VJyJwhLh"), notPerson);
            for (const key of [...(Array.isArray(entry?.key) ? entry.key : []), ...(Array.isArray(entry?.keys) ? entry.keys : [])])
                add(key, __rmT("y64aJShkulo8KSis"), notPerson);
            const content = String(entry?.content || '');
            if (budget > 0) {
                addFromText(content.slice(0, budget), __rmT("GnEVs1VJiHgIdf"));
                budget -= content.length;
            }
        }
    }
    const chatText = (Array.isArray(ctx?.chat) ? ctx.chat : []).filter(msg => !msg?.is_system).map(msg => String(msg?.mes || '')).join('\n').slice(-400000);
    const count = name => { let n = 0; for (let at = chatText.indexOf(name); at >= 0 && n < 999; at = chatText.indexOf(name, at + name.length))
        n += 1; return n; };
    const fixed = new Set(['user', __rmT("gk9kYOTG"), __rmT("62ZYkp26q88"), __rmT("kAwqaZndSG8")]);
    return [...found].slice(0, 600).map(([name, from], order) => ({ name, from, mentions: count(name), order,
        place: !fixed.has(from) && (nonPerson.has(name) || placeLike(name)) }))
        .sort((a, b) => (fixed.has(b.from) - fixed.has(a.from)) || (a.place - b.place) || (b.mentions - a.mentions) || (a.order - b.order))
        .slice(0, limit).map(({ name, from, mentions, place }) => ({ name, from, mentions, place }));
}
