import { rmT as __rmT } from "./textTable.js?rmv=2.1.8";
import { closeTheaterFavoriteLibrary, closeTheaterFavoriteViewer } from './theaterFavorites.js?rmv=2.1.8';
import { UI_THEMES, APPEARANCE_STORAGE_KEY, paletteKeys, normalizeAppearance, applyAppearanceTheme } from './appearanceTheme.js?rmv=2.1.8';
import { mountUserSkinControls } from './userSkin.js?rmv=2.1.8';
export { UI_THEMES, APPEARANCE_STORAGE_KEY, normalizeAppearance, applyAppearanceTheme } from './appearanceTheme.js?rmv=2.1.8';
const colorLabels = [__rmT("hVdPjf"), __rmT("JQSusEt1Keh"), __rmT("g6Q4jh"), __rmT("5p7qA.1sADp"), __rmT("3Foaif"), __rmT("oTx2hhmF"), __rmT("KeNzYT")];
const mounts = new WeakMap();
globalThis.__rabbitMirrorApplyAppearanceTheme = applyAppearanceTheme;
const iconPaths = {
    palette: '<circle cx="12" cy="12" r="8"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/><path d="M8 15h8"/>',
    sliders: '<path d="M6 4v16M12 4v16M18 4v16M3 8h6M9 16h6M15 10h6"/>',
    book: '<path d="M4 4h7v16H4zM13 4h7v16h-7z"/>',
    memory: '<path d="M5 5h14v14H5zM8 2v3M16 2v3M8 19v3M16 19v3M2 8h3M19 8h3M2 16h3M19 16h3"/>',
    repair: '<path d="m4 20 9-9M13 4a5 5 0 0 0 7 7l-4-1-2-2z"/>',
};
function icon(name) {
    return `<span class="rh-ui-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${iconPaths[name] || iconPaths.sliders}</svg></span>`;
}
function element(doc, tag, className, text = '') {
    const node = doc.createElement(tag);
    node.className = className;
    if (text)
        node.textContent = text;
    return node;
}
export function destroySettingsAppearance(root) {
    mounts.get(root)?.();
}
export function mountSettingsAppearance(root, { onNavigate = () => { } } = {}) {
    if (!root || mounts.has(root))
        return;
    const doc = root.ownerDocument;
    const drawer = root.querySelector(':scope > .inline-drawer > .inline-drawer-content');
    if (!drawer)
        return;
    const listeners = [];
    const listen = (node, event, fn, options) => { node.addEventListener(event, fn, options); listeners.push(() => node.removeEventListener(event, fn, options)); };
    const get = id => doc.getElementById(id);
    const make = (tag, cls, text = '') => element(doc, tag, cls, text);
    const html = (tag, cls, text) => { const n = make(tag, cls); n.innerHTML = text; return n; };
    const button = (text, fn, cls = '') => { const n = make('button', cls, text); n.type = 'button'; listen(n, 'click', fn); return n; };
    root.dataset.rhWorkbench = 'ui3';
    root.hidden = true;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', __rmT("9.JSSv1i"));
    const vault = make('div', 'rh-ui-source');
    vault.hidden = true;
    vault.append(...root.children);
    root.append(vault);
    const window = make('div', 'rh-ui-window');
    const head = html('header', 'rh-ui-head', __rmT("mdX7XiQ5wl9aYnTafkLFtJfmqbTkqNiwyH61hNCBtSTzH6kM632D55y8atmoofHgao7rgmO7_page9nmCHbdqB3poH3L5gKj.5goewPix4cCwolQLm4qmyUtCcdvqmZWRwtFGkwy3E_2.gRee4l8.5idecEa2kByhFgprQwxX1FKdFIjweTw.QEs60y.xvuX7Ke7BIMTea15FfzEuzxtPZhdYQ6MG4qCJ0beU0xDjdr8ZonCvqsDYsG6gV2kGmc7vXBX.qZX2yFIbS1YjyF2dReHU8_WrqyGESP5b_PVt.O.tbvOEtU406SkycjD7fCoHa01AF2FQcrUVO8iPkIjRhpZSOoaMEVmUtwXHKRr2XcZ1ZjzRLa4.XrxzkdF5fhSZLlKFugtXqaer782Xb1QbTWav1kZGTrCX_rcw8lMXAYBQQ_e2xbgeVzsp5QwDBLw7HQd6LqZWuqTdxA6ysgx0Ij1wFZHsDWo3Jeq7iWdVWTUj_zTzbsKpa8tmhV2_VOr7KXck43iKAJgfds_0GhLKZyyxfQQIYSrRTU7CQfS5W3lqYnawvkQ9OABQmVhkFZvhaSlAvpdWroSrVyBwMSBcFpjsxHF.6C.5D2JgSbenGh2sYHC1jp8bemxRMRQfg7RWjP5nf380y0oA0LipeepHE_mebf9GseQU4ZoHCM__6F_kP4wJCwFR_mf3QJAdWAK_9ReQ4unRz_9PkeUsJipPLSGrjJRysIDL4wxFf47JWeqoHhgKKEr2.dSoYjN.gU7VCY4sVMU0K7iPYgOMRZR90TVFW.LHHe6Abg35fCeQB9lYWJ0YVTJS6oqtuVkRIfrUmWSPTu.Vn5PCDcs0f46KyWAOl.gDiQZiVw0bgnRjvAVeow8MZaDZn_JppTd2wFu7R9z58dx7iXv6cDjkoO9BubL2ns.kuKf7y74yFzhh1.iUqNpJuYBgbobwAlk6wb4PiC"));
    const close = button('×', () => setOpen(false), 'rh-ui-close');
    close.setAttribute('aria-label', __rmT("xzZCppRe2FhCeT"));
    head.append(close);
    const versionRow = make('div', 'rh-ui-version-row');
    const subtitle = head.querySelector('small');
    subtitle.replaceWith(versionRow);
    versionRow.append(subtitle);
    void import('./mirrorUpdateMenu.js?rmv=2.1.8').then(mod => {
        if (versionRow.isConnected)
            mod.mountSettingsUpdateChrome(versionRow);
    }).catch(error => console.warn(__rmT("UnX0nRLVcQzumShYaRVSwKc82KFBM7GDygWrKZLNEXY6ii06tl6OBPDATF6KabUlMIrQGzxWLNE"), error));
    const searchbar = make('div', 'rh-ui-searchbar');
    const back = button(__rmT("_ywXhDDLLBT"), () => goBack(), 'rh-ui-back');
    back.id = 'rh_ui_back';
    const search = make('input', 'rh-ui-search');
    search.type = 'search';
    search.placeholder = __rmT("L_p_JqlaN5UUYaFY5MZVOki0hx11WgwNz.Y");
    search.setAttribute('aria-label', __rmT("oTUTBuopG0QDrmVHs5D"));
    searchbar.append(back, search);
    const tabs = make('nav', 'rh-ui-tabs');
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', __rmT("l5Tz7FKkvZoeIxi02zY"));
    const main = make('main', 'rh-ui-main');
    main.id = 'rh_ui_content';
    window.append(head, searchbar, tabs, main);
    root.append(window);
    const tabNames = { settings: __rmT("sUJ97k"), play: __rmT("FNG7eT"), tools: __rmT("9BZ5Nh") };
    const definitions = {
        settings: ['settings', __rmT("sUJ97k"), __rmT("jbutT.lo7QBRGrgxr13vpQ7.plAaD0_lKm.8T7HDgG8")],
        play: ['play', __rmT("FNG7eT"), __rmT("Hq1Zi62hERamcKGp3tjLQTnK30kmVCbDJ9SeeTwAqw30b36dChUPiW5X")],
        tools: ['tools', __rmT("9BZ5Nh"), __rmT("Y03ak4tPUp4CE1FEd3dEDFoXu4XvtY0xD4GAXhV1gG8")],
        mode: ['settings', __rmT("NfANY.vh8h.kq5FhYS_"), __rmT("vADXVCbuVHOZICadUJ2LDAlyjfBoCmoPwXrngz41zQXIWFc7FWD2BQk4zBG")],
        display: ['settings', __rmT("l5Tz7FKk5ksiKAK7koA"), __rmT("QnSmlPVkrYU5KXJop.8bY_4EC85rrk")],
        connection: ['settings', __rmT("iF1_h55FQYRnmxLMHFHRsk"), __rmT("xqiu_TSjpEUgjnp5OvTHpUkUY2_Kn6SVsxNVWk4r56dKjUoZBUwNdSYzzBG")],
        manual: ['settings', __rmT("xqKgkSYL0E_5kkeC"), __rmT("igcISLnLDAaMJo30ZnwEu54DQyu4DKmJPjaK_SQI9.EykXArDN13izuoTPv_uSkC")],
        parameters: ['settings', __rmT("eP6y8HnJK6s"), __rmT("52yVJ3wjUHzMmOpYF3ptw5kyRgzl.qf8t.5SUTjKJ0brZOjzJkgHn5DqO1ImqoeM2TBpj6UmY3Y")],
        reroll: ['settings', __rmT("Sr8hhJp5L32m_RmuMwz9HT"), __rmT("NhqRzmmduy0mHMHeVGRIUXZ1HRF1828jIAbc_B1O0TbjUlAgLSTFgNbSChsMlJKNM_a3FqN9KmNacsVLShwI3rGu")],
        request: ['settings', __rmT("wCz_6QnJK6s"), __rmT("hvara7sh32ybtHjATWrAvcH0ImAGbmle3UwQoTQP6h2XyRyOOqukJkys8zAIA5CWuEQY3h")],
        read: ['settings', __rmT("F4NKnvN2l4Gj49Fc7wT"), __rmT("3Jt5HA5LvCqrwl_xrnwDuT6DgyB9DXzmyLWi3lq.33XPrOoKlNdZogRoHciyezkC")],
        chat: ['settings', __rmT("6MaFqTnytEmczrVZ"), __rmT("2gJU9pt38sgswLSP4HavohaHOK8d_WL2KfBTHt9D2E_xphc7BoJDssTEKwwpI9ujWUE")],
        tags: ['settings', __rmT("qWRKApC.0_a7zFOl"), __rmT("ZH3UqpG7n1dxb6rP_6fiW9_DsvFLIXTOfYxddJTQfrchCX3aq8_")],
        books: ['settings', __rmT("rzQMN3L2wOxvTz9aUK_"), __rmT("v9.ISYwBcAnf9BpMVe5WMJveHBCxnWis2BNI3lq.UsJ4xexnLHSib5FoPMRxbvkC")],
        memories: ['settings', __rmT("0N5b40sbrsQDRZIG"), __rmT("kNDppjWVxPm_zK3E8vLsD7s2Y23hoozJP7l2H2hruFlhjkQdzj6r7GtOzBG")],
        early: ['settings', __rmT("qXaMkjcKdmvxoee.94rgtF6iSkEPVGbB9zvifT"), __rmT("_NNLVN2pZcU6x7l4flo3XXs6tStioaZVwXr7OqRaNHc6HD.OEWxYn.5AzBG")],
        image: ['settings', __rmT("VeMsVAWEoBT"), __rmT("WhidZ6WOByqjMkN.Um0wyEFk9ANhFBMHB8EM6_2aACP0c0D61Si0pzWtQXTlAfdoc.tTfnaIRY9w2VqYRAgo87h6w5dU_5C8ANA")],
        appearance: ['settings', __rmT("04w717UJJu9MZT"), __rmT("FnOlgf6dFArnfr4ZRYz3m5.DY_NN3an8OGl8hNQP.lazGSSJX.2k1SyAPTHRaCm4NSHY3h")],
        faces: ['play', __rmT("9kuZY9VzmkU_TzuwwEp"), __rmT("Ld0fKZkpsn5xx4MMlWL8gORRl86trp.XU4njKCLJgWkubDhvJovOOGdzx10VSzTpGsN4eytojDtdH3G_W97fPp7cqQYGhbtakpsuVLy31Fzo.k")],
        draw: ['play', __rmT("CPYjUj4IqyzXd0uDdXGy67ui"), __rmT("81hJD.tl2NszpaNXQniOMtBWYTBgfooIGqx1jV4w4umuEKRjeUFdZGsXzBG")],
        library: ['play', __rmT("WPn.hatX1GZqQMNjvGLhMf"), __rmT("HXO1kTTX1VkVUSmkqjZ_ArFdImq_nmrvXH5EPmxADJP7ps9j2E3vIfZ3nfCus.qVq3VY3h")],
        favorites: ['play', __rmT("vafYOA6QmNIFVGS1bJVack"), __rmT("XPdo21SyjxURsPayK6RoQjM9bqjEQ4PxZ_bQX.HKqG_mAmWL2S_r7f")],
        theaterFavorites: ['play', __rmT("wgd4HeP1.UlQIiZDc9iNlh"), __rmT("x2X4Btol6SUT4Ti2A6APQqvX3yhhtOUGr5InmiR52Yo2R9bQnIGr7f")],
        blacklist: ['play', __rmT("2MV6E.1kZB7WQzijkMVmmk"), __rmT("2XWlDYSbTRk6DYr_V.a646q8ggaocO.uCHJuqmKq")],
        look: ['play', __rmT("uypdobShCt8NTt39aK8"), __rmT("1eW.g6vjbmoOq14SaHVlfjYuJVZxzCd_lsaqiTNeXij6gvQX")],
        visualText: ['play', __rmT("IvJObpQ_lS3_TVey2zY"), __rmT("OGSBBhue65YQtZJ1HuueQvK_N1LXQtPpP7x3xq.iLUxu4f6QjKAr7f")],
        drawing: ['play', __rmT("RD3oicwciOBGngF7Dov95Qi5"), __rmT("nlBXTLq.UiurXy4vaIeNhhVUNPrzEtbT29E")],
        writing: ['play', __rmT("7XvHONOJLumxkrsx_fn.SUAqtbl"), __rmT("X1Gxsoq5ACF_7yoUsfjGPQtVGwjJRuIiyhgAvXNQFIwM.AFtq8_")],
        references: ['play', __rmT("jlrULncVN9sfmhHhGVjUxurXlFs"), __rmT("HpJAXV9vlT8LffwYPHcr6aHRYIgd7ZaYrW.R__.sT56yklNnjkzvIuM40lD9uT")],
        visualRules: ['play', __rmT("RaMZJG01qOKZMwKU"), __rmT("ky5JrlJG4tZrlw3wa_I3VVkUFpKJsCMxLAmeqwKq")],
        replacement: ['play', __rmT("FOZbUsa23fx4cuV32Rp"), __rmT("vMNiFSsyWAqdnQRVCIOK3pn69niHdrAODW_6dyYQ6YJr93UDq8_")],
        mirror: ['tools', __rmT("_LwBvgfbXflyXaIF"), __rmT("pXDdzaGVGUdge85mnazG6uxQJdhiofPuIBsuCsLTnEgxphaxGXHoJko2q094sFPFjyxY3h")],
        usage: ['tools', __rmT("UMQYPgh.KIi2BVuKCbzEmVVm"), __rmT("r1caqYQbBbB0sfzNa9KS5_V8P3FgaADGqzAALyVKwwpN82RQtPGnoQMLjKtybvaNoAGaJ_nQus1xDUaFqAk")],
        regex: ['tools', __rmT("Y5h2kfQAVB3RKN.FDo1Ao508w2UtbT"), __rmT("p2QXa.bilbj2mhkYmRVdwF78k9EMS8R.7CN5hRTe2kCaPw2IBKdIo9pqK8cH8yQMVohVUH3bY3Y")],
        diagnosis: ['tools', __rmT("jgaMwR6F608GngShE.azQ8rH"), __rmT("y8FoW9uHrJfyCkjTcU7siFhRDjNtTIs2")],
        cleanup: ['tools', __rmT("EO.ts7UJjNRcdT"), __rmT("PWiZDYqy7gamtaKDJRQEgM3T4O_Cnkzvv.Jo8spzS2tGO23CqpH_nShxzBG")],
        help: ['tools', __rmT("nHZDWpqQIHdUIoZDc9iNlh"), __rmT("sAyiphJMgmizeNnGBAwpKbIUXzLXjui6rW.l3VUbCbim5W3Z_5U3p0XNgmC9uT")],
    };
    const panels = new Map();
    for (const [key, [tab, title, desc]] of Object.entries(definitions)) {
        const panel = make('section', 'rh-ui-page');
        panel.dataset.rhPage = key;
        panel.hidden = true;
        const heading = make('div', 'rh-ui-heading');
        heading.append(make('h2', '', title), make('p', '', desc));
        panel.append(heading);
        const body = make('div', 'rh-ui-page-body');
        panel.append(body);
        main.append(panel);
        panels.set(key, { panel, body, tab });
    }
    const body = key => panels.get(key).body;
    const move = (node, key) => {
        if (typeof node === 'string')
            node = get(node);
        if (!node)
            return null;
        body(key).append(node);
        if (node.matches('details')) {
            node.open = true;
            node.classList.add('rh-ui-unfolded');
        }
        if (node.matches('.rh-advanced-page'))
            node.style.display = 'block';
        return node;
    };
    const row = (where, key, title, desc, glyph = 'sliders') => {
        const n = button('', () => navigate(key), 'rh-ui-entry');
        n.dataset.rhRoute = key;
        n.innerHTML = `${icon(glyph)}<span><strong>${title || definitions[key][1]}</strong><small>${desc || definitions[key][2]}</small></span><b aria-hidden="true">›</b>`;
        body(where).append(n);
        return n;
    };
    const note = (where, text) => { const n = make('p', 'rh-ui-note', text); body(where).append(n); return n; };
    const withNote = (id, key) => {
        const control = get(id), label = control?.closest('label');
        if (!label)
            return;
        const after = label.nextElementSibling;
        move(label, key);
        if (after?.matches('.rabbit-mirror-subnote'))
            move(after, key);
    };
    const enable = get('rh_enabled').closest('.rabbit-mirror-primary-toggle');
    move(enable, 'settings');
    enable.classList.add('rh-ui-start');
    get('rh_advanced_open').hidden = true;
    enable.querySelector('b').textContent = __rmT("6jWzYCj6u9y3pPXV8Ngssk");
    enable.querySelector('small').textContent = __rmT("jQ9Qjd5TaAdj61ex03vrIQlDsLTX_5Qs7dvYsdwtX9X.bh");
    const modeSummary = html('div', 'rh-ui-mode-summary', __rmT("yocKrdJhmDJH8dRnBBx1sQF85afFxopyeT7eJ6i72hxizDOjNajxwkppqXiNGmPU.s0GsK8GeH3x0d78Fu3MWXAyHMy8GsAumkpVnlnjdXFirQBQ_dVIrmAcYhw5ICQYTZZJDMF8AGqghEA8VcGxjiTJUUiAYZaj_deEwfxSBuuDFPtgf2ZwTSRxJjH25fWnLc57IYzh2VHpqx2IzXm3d56Usl5BVss13ke3CNuf9iFBeQump5xs45Rt"));
    const change = button(__rmT("wNqWFjNuwbG"), () => navigate('mode'), 'rh-ui-text-link');
    change.dataset.rhRoute = 'mode';
    modeSummary.append(change);
    enable.append(modeSummary);
    const connectionNudge = row('settings', 'connection', __rmT("WZ9byiY4avh1A8RbKewoqnCAvv1xA.2VFsT"), __rmT("jrC5Bms.BesgaicXz3ZrIDb766c1_jr_kcAEAYn20CX.bh"), 'memory');
    const displayRow = row('settings', 'display', __rmT("l5Tz7FKk5ksiKAK7koA"));
    row('settings', 'reroll', __rmT("Sr8hhJp5L32m_RmuMwz9HT"), __rmT("zvD5bxz4awGTJxgmlKTIRxKVxQudvIvRZV2Z0HqTp6SDFeWO4fWnIXlJ1I0AHuLoN_kj_AzjRYG_uy4D4JTU6h0Pf5Gtouw6ANA"));
    row('settings', 'image', __rmT("VeMsVAWEoBT"), __rmT("SeLOJzowh93DTN088kEXemISaQq.yhyPRoaPoNEK3LWZkys6L0Pj82w6.3EzxLqktk_E1a3dcqBRbzrVdr6ov_QiTWEJw6wvXhPMSAxaO2xyb_DFBJT"), 'palette');
    move('rh_image_settings', 'image');
    row('settings', 'appearance', __rmT("04w717UJJu9MZT"), __rmT("W76ZwINjZB2a1cY12zl.jN8sbNs"), 'palette');
    row('settings', 'read', __rmT("F4NKnvN2l4Gj49Fc7wT"), __rmT("NqL4FCG7n1dqQxcu4_W8_VP6mcz5JbT21YTGWK6Bvps6UQOvq8_"), 'memory');
    for (const [key, title, desc, glyph] of [
        ['faces', __rmT("9kuZY9VzmkU_TzuwwEp"), __rmT("sAtQXw9XtKrovQ4_qAjZXEFR853UuWZc3It4V2KjS35endsgBpNUZa4eu7E9uT")],
        ['draw', __rmT("CPYjUj4IqyzXd0uDdXGy67ui")], ['look', __rmT("uypdobShCt8NTt39aK8"), null, 'palette'],
        ['library', __rmT("WPn.hatX1GZqQMNjvGLhMf"), null, 'book'], ['theaterFavorites', __rmT("wgd4HeP1.UlQIiZDc9iNlh")], ['favorites', __rmT("vafYOA6QmNIFVGS1bJVack")], ['blacklist', __rmT("2MV6E.1kZB7WQzijkMVmmk")]
    ])
        row('play', key, title, desc, glyph);
    for (const key of ['help', 'mirror', 'usage', 'diagnosis', 'regex', 'cleanup'])
        row('tools', key);
    const choice = (input, title, description, extra = '') => {
        const old = input.closest('label');
        const label = make('label', 'rh-ui-choice');
        label.append(input);
        const text = make('span', '');
        text.append(make('strong', '', title), make('small', '', description));
        if (extra)
            text.append(make('em', '', extra));
        label.append(text);
        old.replaceWith(label);
        return label;
    };
    move(choice(get('rh_generation_follow'), __rmT("wLD17kmQmPy._t1ucwztHT"), __rmT("M1u20CEIiwMnJNLv6gwCOeFI239da7LNYIwys9b7xcuUnDfk2BUOUSV8aNb6lIaQWUE"), __rmT("Cu.bnykPlvlTLviXo_VRaQQd")), 'mode');
    move(choice(get('rh_generation_independent'), __rmT("rzQMNNv1AdUe008676D"), __rmT("fH8.aC8gsAQGf_JQ_6nGPQtVGwe4RJBq0DWdHMm16Ujp9ReMq8_"), __rmT("Vn41a8h.8JPlL.bTr1bU40zwoKaigRPoaRXm8cz98vs")), 'mode');
    const timingRow = move('rh_independent_generation_timing_row', 'mode');
    const nextConnection = row('mode', 'connection', __rmT("8lBcrDC4dCNTAPO_Of44ZrzChdm6WR2VFsT"), __rmT("JJrlEdbDEdtDiz6MvaNkkR9XiadwfgQ27qfY6HF_33XPrhNqV9_n3gVI7PjABSkC"));
    row('mode', 'early', __rmT("orY0UhISJHz4Xm4cC1ra2m8xda1eKhgY"), __rmT("XLEyRrkI91_x_Cyg2vdX5_lQbXUnk0AmRHtJ.l5Sfq6S9SILq8_"));
    row('mode', 'regex', __rmT("jwH4wEQLEHier18xik6.YgmeuEA"), __rmT("JddjYl21dJWUr7yuTwZI.75fdGbhGLKUdFmRXiP1HM9.bh"));
    const outer = __rmT("zQCgNA5LvCqrwD8KlVxUVeow8uk_oHrcaUlY6wypXybUqQHWl27u7WK1FGjiiZkC"), inner = __rmT("tGzMq3sbqYjBNQ9l7nJTkCmV6hJPlcYhmUtGUO2EvAfkHeeNq8_");
    {
        const dup = get('rh_follow_regex_helper');
        if (dup)
            dup.hidden = true;
    }
    const followDisplay = move('rh_follow_display_row', 'display'), indDisplay = move('rh_independent_display_row', 'display');
    for (const input of followDisplay.querySelectorAll('input'))
        choice(input, input.value === 'inline' ? __rmT("pFiZzzAUCty3geKZ") : __rmT("jFJTmTtVwNl"), input.value === 'inline' ? __rmT("p9qBp5Kxb.XlMwTvVSkcY87dPWJDy6IfQOHL7YvBjXnzXzQX") : outer);
    for (const input of indDisplay.querySelectorAll('input'))
        choice(input, input.value === 'external' ? __rmT("jFJTmTtVwNl") : __rmT("sWlcvZAUCtlnl9H9"), input.value === 'external' ? outer : inner);
    for (const node of [followDisplay, indDisplay]) {
        node.removeAttribute('style');
        node.className = 'rh-ui-display-options';
    }
    const anchorBlock = move('rh_independent_anchor_block', 'display');
    if (anchorBlock) {
        const anchorRow = get('rh_independent_anchor_row');
        const anchorText = { auto: [__rmT("xqsZ4YNxwmjr8ymD"), __rmT("1LTKYSo4zBYbHElRpKG.AHMZZQj2O5vHcw9c.r28Wiyh.1ihZf9hSGnZMwjIyGDKA.Q_TJduSgeUzdZgUM0bFX9O6Y6htNBI37ALRf")], body: [__rmT("WQwYOVm14wKVNoVJkKJRq.Lh"), __rmT("kNSJLWAqneXqqpQPURky0f0vLGkI_AXoGrwQlXD201Z.bh")], outside: [__rmT("jD98hI01rgpV13XFCJdClk"), __rmT("aqcE.Y1BEmiFotC.w5moD1zJLeA46WBMsyYaMjXF.ZnNDT0l.3am7qZf0arEXWt0vhYpVppBiqpobh")] };
        for (const input of anchorRow.querySelectorAll('input'))
            choice(input, ...anchorText[input.value]);
        anchorRow.removeAttribute('style');
        anchorRow.className = 'rh-ui-display-options';
        const title = anchorBlock.querySelector('[data-rh-anchor-title]');
        if (title) {
            title.className = 'rh-ui-field-title';
            title.style.cssText = 'font-weight:700;font-size:15px;margin:22px 0 12px;';
            title.textContent = __rmT("aGYmU.Vbqv1QmfJtz2oegKx28tTgtOjuzhF2jWHpCkS4fcy1UcfRSh");
        }
        anchorBlock.querySelector('[data-rh-anchor-note]')?.remove();
    }
    move('rh_face_pager_settings', 'display');
    move('rh_independent_manual_legacy', 'manual');
    move('rh_automatic_reroll_block', 'reroll');
    move(get('rh_independent_temperature').closest('.rh-independent-generation-params') || get('rh_independent_temperature').closest('.flex-container'), 'parameters');
    move('rh_independent_request_advanced', 'request');
    get('rh_independent_advanced_open').closest('.rabbit-mirror-independent-advanced-row').hidden = true;
    const apiFields = get('rh_independent_api_fields');
    apiFields.firstElementChild.hidden = true;
    move('rh_independent_api_section', 'connection');
    row('connection', 'manual', __rmT("SrFF0TbM8D_GpcyJ.9orsk"), __rmT(".mhqlYC13oHuXMxNLfKuOEvh3pZiW3mN29E"));
    row('connection', 'parameters', __rmT("gWgyyUp6Im7YlQuZ"));
    row('parameters', 'request', __rmT("wCz_6QnJK6s"));
    row('read', 'chat');
    row('read', 'tags');
    row('read', 'books');
    row('read', 'memories');
    move('rh_early_body_options', 'early');
    move('rh_behavior_rules', 'writing');
    move(get('rh_independent_context_layers').closest('label').parentElement, 'chat');
    move(get('rh_independent_include_character_summary').closest('label').parentElement, 'chat');
    move(get('rh_independent_tag_filter_open').parentElement.parentElement, 'tags');
    move('rh_advanced_page_worldinfo', 'books');
    move('rh_advanced_page_memory', 'memories');
    withNote('rh_multiface_enabled', 'faces');
    move('rh_multiface_count_row', 'faces');
    move('rh_multiface_help', 'faces');
    move('rh_multiface_dispatch_row', 'faces');
    move('rh_face_presentation_modes', 'faces');
    move('rh_visual_scenery_modes', 'drawing');
    move('rh_visual_scenery_mode_help', 'drawing');
    move('rh_visual_tone_row', 'drawing');
    move('rh_advanced_page_generation', 'draw');
    for (const key of ['visualText', 'drawing', 'writing', 'references', 'visualRules', 'replacement'])
        row('look', key);
    move('rh_appearance_reference', 'references');
    move(get('rh_visual_prompt').closest('details'), 'visualRules');
    move('rh_advanced_page_visual', 'visualText');
    const visualSaveProxy = button(__rmT("fuG1hIbsr58.nruO3ZU5xcVY"), () => get('rh_visual_prompt_save').click(), 'menu_button');
    body('visualRules').append(visualSaveProxy);
    move('rh_advanced_page_replacement', 'replacement');
    move('rh_advanced_page_external', 'library');
    move(get('rh_blacklist_enabled').closest('label').parentElement, 'blacklist');
    move(get('rh_favorite_summary').parentElement, 'favorites');
    move(get('rh_theater_favorite_section')?.querySelector('.rabbit-mirror-section-content'), 'theaterFavorites');
    move('rh_missing_shell_panel', 'mirror');
    move('rh_advanced_page_repair', 'mirror');
    note('mirror', __rmT("9h71AXJF2C6_g7f_LvCRQ2LPBkkSCySPiuH_cyy6zfHUPvG6RM54i2wR16zAD3oKk1mRUUt6HiGvglLyDJ7gKJNhlQtcDbgQhR3qFj3gMmLtu8DsFYcnbT8sL2X4xLVv5Mft7TTduoC5LAayiyhnFkSZq8LVcAhVP_95YmqZp2TrMjCqlN3srT"));
    move('rh_generation_evidence', 'diagnosis');
    move('rh_manual_entry_diag', 'diagnosis');
    move('rh_token_meter', 'usage');
    move(get('rh_copy_regex').closest('.rabbit-mirror-regex-helper'), 'regex');
    move(get('rh_clear_last').parentElement, 'cleanup');
    move(get('rh_storage_cleanup_block'), 'cleanup');
    move(get('rh_external_diag_status').parentElement, 'diagnosis');
    const steps = [[__rmT("uNX55cp6ImfwIiUG"), __rmT("iBItV0cfb96hHWS72WGDd.VDfEe6mcc7P3jNOKiUUTge8yrnXveY8Aybe4.YF1drl94Rg2Y0SggCeH_qVAu_BmxrQgzC_Z53OrlDUjlQ382vsM_3R8ECQKROR5hEZf"), 'mode', __rmT("QrFntep6ImfwIiUG")], [__rmT("UYLainj5OZ.MUcOQg_3RaIui"), `${__rmT("8KmmW28qNg16rN4_r.ceyIwt1TdyAHndtaYj7dtVoZhd59mZj0WoASSBFiZ1CQC0NTlciY1lTkIJgR1Ceflqcf")}${outer}${__rmT("wLD17kmQmPlDDbvpWMgHTf")}${inner}`, 'display', __rmT("UYLainj5OZ.MUcOQg_3RaIui")], [__rmT("flZLS8LBZHrB3mE5MIwfGUnnpts"), __rmT("ImSfW2cSKAYDmD2Nze3lvwqxr5k58DJDOUsFDWoE107Mki0v5zAoJP3ESspXCvBgI0f8cS0NOhHgD2wrmmlFrh")]];
    steps.forEach(([title, desc, target, label], i) => { const step = html('section', 'rh-ui-guide-step', `<span>${i + 1}</span><div><h3>${title}</h3><p>${desc}</p></div>`); if (i === 2)
        step.querySelector('p').dataset.rhTimingGuide = 'true'; if (target) {
        const link = button(label + ' ›', () => navigate(target), 'rh-ui-text-link');
        link.dataset.rhRoute = target;
        step.lastElementChild.append(link);
    } body('help').append(step); });
    note('help', __rmT("QetK.dsIORX0clBDAUTTDNzcrvgqi5hMrnhSTYAmNPVEi5l5B69Nl4tImz8eDeTd74qRg_GMx3sobh"));
    let state;
    try {
        state = normalizeAppearance(JSON.parse(globalThis.localStorage.getItem(APPEARANCE_STORAGE_KEY) || 'null'));
    }
    catch {
        state = normalizeAppearance(null);
    }
    const appearance = html('div', 'rh-ui-appearance', `${__rmT("eYeEOKDgo4O4RfhVffqt6MiLDDe2FnoL68tUbWo4wQFvKAfr5hKB3tRpWi4akL.vCCYNWc0qHrllJkUacDQE2TMgzxGJYZEWGEU2UILdXbL7zjMGrosqKPdHcHiosm30.oIz3BV3jADKZdlXMyMSHDStARIyl_KFHKDZXIPWwjHNkFapgd3h.8TgmuaNGThuGeoYlVco6PxZNpQ0mn9Edoh4CVxxwMHND4R6UA0y4NxvO6bZM.u6ymWjbe.8cB4SLkMhqw6RgdAJoXz_mUZWc.P6nyotfSghC0Vsy2AFEST0R4OkzWrSvf")}${UI_THEMES.map(t => `<option value="${t.id}">${t.label}</option>`).join('')}${__rmT("dA1swa9p8iwqUedbdAp9GTra1tNuJdCF7u3.gWrag6JtR8Mzi3d9a8lQkxolnza49OtA3t.58IsAXTHxpm2t.U6i5EtCtnKgqQSSV4bqMnbmz5QLeElO7.o8n9sIAipP1xOItTvC7Dy_2f75gpJvVH06NiqoiPsW5TNxff5WJQdti4jK7g6wOX7hh2uy6FoXRJeDk7PZPiQqhQ.DYSwbpueu2uDHRedggs5Mo6N0PBgnfbikDxpFvOfV9NsTWB6Zv.3FoMd.XcBBccFgqqplB43yfvHhFEL3JjUJMf1DwPWiD7zfbyUSp5Dc6O8bWsCCFVogX0kJQAPMi741lL0Rh1YX")}${paletteKeys.map((key, i) => `<label>${colorLabels[i]}<input type="color" data-rh-color="${key}" aria-label="${colorLabels[i]}"><span data-rh-color-value="${key}"></span></label>`).join('')}</div><div class="rh-ui-save-status" role="status" aria-live="polite"></div>`);
    body('appearance').append(appearance);
    mountUserSkinControls(body('appearance'), { listen });
    const themeSelect = get('rh_ui_theme'), status = appearance.querySelector('.rh-ui-save-status');
    const modalIds = ['rh_advanced_modal', 'rh_world_info_prompt_modal', 'rh_independent_tag_filter_modal'];
    function applyTheme(save = false) {
        const preset = UI_THEMES.find(t => t.id === state.mode);
        for (const target of [root, ...modalIds.map(get).filter(Boolean)])
            applyAppearanceTheme(target, state);
        themeSelect.value = state.mode;
        get('rh_ui_custom').hidden = state.mode !== 'custom';
        appearance.querySelector('[data-rh-theme-label]').textContent = preset?.label || (state.mode === 'host' ? __rmT("sWlcv75bCfX.gjMw") : __rmT("jbnnqUFJ_UDJfk"));
        for (const input of appearance.querySelectorAll('[data-rh-color]')) {
            input.value = state.custom[input.dataset.rhColor];
            appearance.querySelector(`[data-rh-color-value="${input.dataset.rhColor}"]`).textContent = input.value;
        }
        if (save) {
            try {
                globalThis.localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(state));
                status.textContent = __rmT("Sl.CY4cVwGblAxGv048tn.wWbNs");
            }
            catch {
                status.textContent = __rmT("N21ZcMj5nxfxzFW5sCut8FLxVhJ4j3vc8bCVe0Ehtyxrnm75Cgzy69jtp7AdLXUHhjETHxoguv7IpEH9");
            }
        }
    }
    listen(themeSelect, 'change', () => { state.mode = themeSelect.value; applyTheme(true); });
    listen(appearance, 'input', e => { const key = e.target.dataset.rhColor; if (paletteKeys.includes(key)) {
        state.custom[key] = e.target.value;
        applyTheme(true);
    } });
    const walker = doc.createTreeWalker(root, globalThis.NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
        const n = walker.currentNode;
        if (n.parentElement?.closest('textarea,script,style'))
            continue;
        n.textContent = n.textContent.replaceAll(__rmT("TBxxQLFyeH2rBMsq"), __rmT("az3HOeBp2slxTh")).replaceAll(__rmT("wLD174mKRDZ._t1ucwztHT"), __rmT("wLD17kmQmPy._t1ucwztHT")).replaceAll(__rmT("KLf3Dep6Im7YlQuZ"), __rmT("wCz_6QnJK6s")).replaceAll(__rmT("sg1SIQ2YEyOYlQuZ"), __rmT("sg1SIgWVebHYlQuZ")).replaceAll(__rmT("QOUePdop"), '').replaceAll(__rmT("NOIfZlw_3ZUSDMNdVqmtLk"), __rmT("w89dchV6PCxxtf")).replaceAll(__rmT("lBaD0f0QGYT94PUQmahTTh"), __rmT("bHvMkzGUBh6AKIIZ"));
    }
    let active = 'settings', history = [], originFocus = null;
    const searchResults = make('section', 'rh-ui-search-results');
    searchResults.hidden = true;
    main.append(searchResults);
    function sync() {
        const follow = get('rh_generation_follow').checked;
        const timing = get('rh_independent_generation_timing').value;
        const timingTitle = { auto: __rmT("GAHaACWEU6h"), manual: __rmT("k9UaACWEU6h"), off: __rmT("t8hHPh") }[timing];
        get('rh_enabled').closest('.rabbit-mirror-primary-row').hidden = !follow;
        timingRow.hidden = follow;
        modeSummary.querySelector('[data-rh-source-label]').textContent = follow ? __rmT("wLD17kmQmPy._t1ucwztHT") : `${__rmT("83ayPJIJfs0eS1HhGeL7xLiXjFs")}${timingTitle}`;
        modeSummary.querySelector('[data-rh-source-description]').textContent = follow ? __rmT("jP9zvdtM8Cjebyo1e588SXgA3noHdgAhoFYUfCWNACD6nb.yq8_") : timing === 'manual' ? __rmT("0MRjdSgX1AdVjghIgagWrIShN7U4LQXVC1w0fRAvObUoRwpL9HStHaHsTPv_uSkC") : timing === 'off' ? __rmT("iGaUpXiTklczq9YMZG7BdWYuecOUQOVfRxePNDMJFbdOaSQX") : __rmT("1lnuk3fuvVpgOFhZwRGDv.LRIy3XQNg8b_leqwyDgG8");
        body('help').querySelector('[data-rh-timing-guide]').textContent = follow ? __rmT("ImSfW2cSKAYDmD2Nze3lvwqxr5k58DJDOUsFDWoE107Mki0v5zAoJP3ESspXCvBgI0f8cS0NOhHgD2wrmmlFrh") : timing === 'manual' ? __rmT("5Sp0467LMRt95b7dQ8EnYHoKYZPmAZYbwgyGFUx_BRMfPo_grYbmZ1iFvaAYuzmxtXKr.W1zD9b0Km80M50ADLGu") : timing === 'off' ? __rmT("IFJahNDpT6CrY3b.hnmc3x1sX_isWVmWDr1AKGMl8ElO6WJMESJYPf1vOV2iJdp3weHPK9TrzYYT05.W_AP1Im4BC3zL2CbfRd9yIRRP79s") : __rmT("rN7uPUD1EAXLcWCTyjjGkRNUzGBDpMi2oeIpOlOxI3K1lTNqnMSsHnVzmJl1YvkC");
        connectionNudge.hidden = follow;
        nextConnection.hidden = follow;
        const rerollOn = get('rh_automatic_reroll_enabled').checked === true;
        const rerollFields = get('rh_automatic_reroll_fields');
        if (rerollFields)
            rerollFields.hidden = !rerollOn;
        connectionNudge.querySelector('strong').textContent = get('rh_independent_model').value ? __rmT("NbPEFOUJ19W5Uf") : __rmT("WZ9byiY4avh1A8RbKewoqnCAvv1xA.2VFsT");
        followDisplay.hidden = !follow;
        indDisplay.hidden = follow;
        const selected = (follow ? followDisplay : indDisplay).querySelector('input:checked')?.value;
        displayRow.querySelector('small').textContent = selected === 'inline' ? __rmT("LN1kV.S2RXsxcqBypurKNWYuoG081HzpAvlluYM3tZk4QzQX") : selected === 'external_then_inline' ? __rmT("iy43S9zX3fv7qvQdVpA") + inner : __rmT("GZTWXCQBI2HStf") + outer;
        const count = get('rh_multiface_enabled').checked ? get('rh_multiface_count').value : 1;
        body('play').querySelector('[data-rh-route="faces"] small').textContent = `${__rmT("cxFMZTvXWyBgXqFugPD")}${count}${__rmT("3bd8U0H3Rcv3cs30B.Q1hHWtkPbOnMIBeU1wKv1RxJa.bh")}`;
        for (const label of root.querySelectorAll('.rh-ui-choice'))
            label.classList.toggle('selected', label.querySelector('input').checked);
    }
    function paint(focus = false) {
        const searching = !!search.value.trim();
        for (const [key, { panel }] of panels)
            panel.hidden = searching || key !== active;
        searchResults.hidden = !searching;
        if (searching) {
            searchResults.replaceChildren(make('h2', '', __rmT("PJvh8EWgoUG")));
            const q = search.value.trim().toLowerCase();
            for (const [key, [tab, title, desc]] of Object.entries(definitions)) {
                if (key in tabNames)
                    continue;
                if (!(title + ' ' + desc + ' ' + body(key).textContent).toLowerCase().includes(q))
                    continue;
                const result = make('button', 'rh-ui-entry');
                result.type = 'button';
                result.dataset.rhSearchResult = key;
                result.append(make('span', '', title), make('small', '', tabNames[tab] + ' ›'));
                searchResults.append(result);
            }
            if (searchResults.children.length === 1)
                searchResults.append(make('p', '', __rmT("aj19QVe9Ffe1wIVvi1mJXRD0akjKGDWpz9fln9.iwDW0gpDPuZ0NtSN2r9T9uT")));
        }
        for (const tab of tabs.children) {
            const selected = tab.dataset.rhTab === definitions[active][0];
            tab.setAttribute('aria-selected', String(selected));
            tab.tabIndex = selected ? 0 : -1;
        }
        back.hidden = history.length === 0 && !searching;
        if (active === 'theaterFavorites' || active === 'favorites' || active === 'blacklist')
            onNavigate('preferences');
        if (active === 'books')
            onNavigate('books');
        if (active === 'connection')
            onNavigate('connection');
        if (active === 'library')
            onNavigate('library');
        if (active === 'early')
            onNavigate('early');
        sync();
        main.scrollTop = 0;
        if (focus && !back.hidden)
            back.focus({ preventScroll: true });
    }
    function navigate(key, remember = true) {
        if (!panels.has(key))
            return;
        if (remember)
            history.push({ key: active, query: search.value });
        active = key;
        search.value = '';
        paint();
    }
    function goBack() { const prev = history.pop(); if (prev) {
        active = prev.key;
        search.value = prev.query;
    }
    else {
        active = definitions[active][0];
        search.value = '';
    } paint(true); }
    const view = doc.defaultView;
    let viewportCleanup = null;
    function syncViewport() {
        if (root.hidden)
            return;
        const viewport = view?.visualViewport;
        const width = viewport?.width || view?.innerWidth;
        const height = viewport?.height || view?.innerHeight;
        if (!(width > 0 && height > 0))
            return;
        for (const [key, value] of Object.entries({ width, height, left: viewport?.offsetLeft || 0, top: viewport?.offsetTop || 0 })) {
            const name = '--rh-viewport-' + key, next = value + 'px';
            if (root.style.getPropertyValue(name) !== next)
                root.style.setProperty(name, next);
        }
    }
    function trackViewport() {
        viewportCleanup?.();
        const viewport = view?.visualViewport;
        viewport?.addEventListener('resize', syncViewport);
        viewport?.addEventListener('scroll', syncViewport);
        view?.addEventListener('resize', syncViewport);
        viewportCleanup = () => {
            viewport?.removeEventListener('resize', syncViewport);
            viewport?.removeEventListener('scroll', syncViewport);
            view?.removeEventListener('resize', syncViewport);
            viewportCleanup = null;
        };
        syncViewport();
    }
    function setOpen(open) {
        if (open) {
            originFocus = doc.activeElement;
            root.hidden = false;
            for (const id of ['rh_world_info_prompt_modal', 'rh_independent_tag_filter_modal']) {
                const modal = get(id);
                if (modal && modal.tagName !== 'DIALOG' && !root.contains(modal))
                    root.append(modal);
            }
            if (typeof root.showModal === 'function') {
                if (!root.open)
                    root.showModal();
            }
            else
                root.setAttribute('open', '');
            trackViewport();
            applyTheme();
            paint();
            close.focus({ preventScroll: true });
            void import('./mirrorUpdateMenu.js?rmv=2.1.8').then(mod => mod.refreshRabbitMirrorUpdateOnOpen()).catch(error => console.warn(__rmT("kgRTYhcxXS2m4ONWwxNuOg_eeQb7JQvzO3QRKgCUb5oykH.tFb26g8apR3SqFnm2mRwdDT"), error));
        }
        else {
            closeTheaterFavoriteViewer();
            closeTheaterFavoriteLibrary();
            viewportCleanup?.();
            if (root.open && typeof root.close === 'function')
                root.close();
            else
                root.removeAttribute('open');
            root.hidden = true;
            originFocus?.focus?.({ preventScroll: true });
        }
    }
    listen(root, 'cancel', event => {
        if (event.target !== root)
            return;
        event.preventDefault();
        if (doc.querySelector('[data-rm-theater-favorite-viewer],[data-rm-theater-favorite-library],[data-rm-update-sheet]'))
            return;
        setOpen(false);
    });
    for (const [key, name] of Object.entries(tabNames)) {
        const tab = button(name, () => { history = []; navigate(key, false); });
        tab.dataset.rhTab = key;
        tab.setAttribute('role', 'tab');
        tabs.append(tab);
    }
    listen(tabs, 'keydown', e => { if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key))
        return; const items = [...tabs.children], i = items.indexOf(e.target); if (i < 0)
        return; e.preventDefault(); const j = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (i + (e.key === 'ArrowLeft' ? -1 : 1) + items.length) % items.length; items[j].click(); items[j].focus(); });
    listen(search, 'input', () => paint());
    listen(searchResults, 'click', e => { const result = e.target.closest('[data-rh-search-result]'); if (result)
        navigate(result.dataset.rhSearchResult); });
    listen(root, 'change', () => sync());
    listen(root, 'click', e => {
        if (e.target !== root)
            return;
        if (doc.querySelector('[data-rm-theater-favorite-viewer],[data-rm-theater-favorite-library],[data-rm-update-sheet]'))
            return;
        setOpen(false);
    });
    listen(root, 'keydown', e => {
        if (e.target.closest?.('dialog') !== root)
            return;
        if (e.key === 'Escape') {
            if (doc.querySelector('[data-rm-theater-favorite-viewer],[data-rm-theater-favorite-library],[data-rm-update-sheet]')) {
                e.preventDefault();
                return;
            }
            e.preventDefault();
            setOpen(false);
        }
        if (e.key !== 'Tab')
            return;
        const items = [...window.querySelectorAll('button,input,select,textarea,a[href],[tabindex="0"]')].filter(n => !n.disabled && n.getClientRects().length);
        const first = items[0], last = items.at(-1);
        if (e.shiftKey && doc.activeElement === first) {
            e.preventDefault();
            last?.focus();
        }
        else if (!e.shiftKey && doc.activeElement === last) {
            e.preventDefault();
            first?.focus();
        }
    });
    const menu = get('extensionsMenu');
    get('rabbit_mirror_wand_bootstrap')?.remove();
    const entry = make('div', 'list-group-item flex-container flexGap5');
    entry.setAttribute('role', 'button');
    entry.tabIndex = 0;
    entry.id = 'rabbit_mirror_wand_entry';
    entry.style.cssText = 'background:transparent;background-color:transparent;color:inherit;border:0;box-shadow:none;appearance:none;-webkit-appearance:none;';
    entry.innerHTML = __rmT("zBSlOMuUvbmutoD8JQCJrPTw9R3XZTldwcwi6C0x1cjw0RDa_NJMNwlabv1nR100d7jf0QzgMoQdKBbgNZs4dYAQMlfU3t9T2IKrbUG7wAh56QAE1W819Ji4.DSBhWs7vsRK_EvZbeb3jZAdOC_6A5qYqg9rvEXvUNt6XbzYEk0qB5K28OdX51uvhYF3ReUeinktV9.vjqgIrWaarulHreMZ7mxbet2SGuR5hhlOLv8rvjV5d43zfcCChwhuc9dNMPpGon7g5uXMt5moEy3zlRfQYig6BmPMao7Ncuma71KEvzXoRQmtEkWGEsO4RQOJy.wB52pv2R75JSQ_w_MoKKli0DuRzpvbzvNGazOC8zErZwutA2NjrGGNA7u68CcU5l_8yUrYFfgxSsAepPYLtTNx051v1vU4TIHrffH4zUVGiy9r.QyQvNNRouTU2iGoPfFlblV6WVZhG9mVHOhxDUpozb2zXV27l5rbDV_ieXiQytDxP0jEIVZw57H_jrcESWF4Teod63Y1mPUguTxYekYZFGcJRtwiwm8tE47eULFZtORvfLt7qX70NBk_fYqx1_7C3lpBziU_eKFVOTuiZKVP.sKICSvSTduvjVKRqzabrHjZcmyuPAwzgEiek0Yu.NllK4of8_1fshevgb6DCk.G9oa7PkcZ2aJEpmbu8II4TOGr4jsJLyhYiMjPKfHZoskum2Is52gMvDEAAEQHRWcPgeUDJD3081jTL8Yo8f9ecKuSvuVp9GTr8hHRQz_REZDnId6CDKpGFeIxeGVVvRoBhkas7E2GON3IIksw1pzBCbOt4cah9gnAoViIoUWlvFxnsec7_1s1hye6zyVCrt.L9VUesxci_bDZyuzbTf93BEbaxCKlPczk4Tvk2h");
    entry.setAttribute('aria-haspopup', 'dialog');
    entry.setAttribute('aria-controls', root.id);
    listen(entry, 'keydown', event => { if (event.key !== 'Enter' && event.key !== ' ')
        return; event.preventDefault(); if (!event.repeat)
        entry.click(); });
    listen(entry, 'click', () => setOpen(true));
    menu?.append(entry);
    const requiredControls = [...root.querySelectorAll('input[id],select[id],textarea[id]')].map(n => n.id);
    root.__rabbitMirrorWorkbench = { open: () => setOpen(true), navigate, hasEntry: () => entry.isConnected,
        isComplete: () => requiredControls.every(id => root.querySelectorAll('#' + id).length === 1) };
    applyTheme();
    paint();
    const cleanup = () => { closeTheaterFavoriteViewer(); closeTheaterFavoriteLibrary(); viewportCleanup?.(); if (root.open && typeof root.close === 'function')
        root.close(); listeners.splice(0).forEach(fn => fn()); entry.remove(); delete root.__rabbitMirrorWorkbench; mounts.delete(root); };
    mounts.set(root, cleanup);
}
