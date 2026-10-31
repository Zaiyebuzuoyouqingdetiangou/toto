import { rmT as __rmT } from "./textTable.js?rmv=2.4.0";
const setting = (id, name, description, target, page = '') => ({ id, name, description, target, page });
const mirror = (id, name, description, path) => ({ id, name, description, mirror: path });
export const QUICK_START_GROUPS = [
    { name: __rmT("9kIuFxUJh9riCf"), items: [
            setting('mode', __rmT("eP6y8imsSDY"), __rmT("RqHtO6quQTpWp3bgkt7CpLn_J018Cqr9UmyhICaGdNYloZnNTfC3UW5X"), '#rh_generation_follow'),
            setting('display', __rmT("3MqCXomsSDY"), __rmT("6cwx.PCt_RNyfjDpcmxTlINvCjbXx_2tJVGJmOCFwj.0Ln6smeQS1cgQT7FbcS0GDkx14MGam.lobh"), '#rh_independent_display_row'),
            setting('multiface', __rmT("PZTPpCRe2FhCeT"), __rmT("Uq3ZCtBJA_wTQuosa6.TCo.UOI9xaj34k7LNJ247I5hq3T_5WLA_GPos69YL6cOgWUE"), '#rh_multiface_enabled', 'generation'),
            setting('classic', __rmT("Yo5oSysBnlSASysiwfCI.P6O_lk"), __rmT("Lp_g9S4PWtORDIeKUJUiw7cAM3Jxa3zNQzvhcs0jIQOSo1py9NAPBie8uGhUIvSIWUE"), '#rh_sampling_mode', 'generation'),
            setting('reference', __rmT("3ZuJIuQeOHSqYT"), __rmT("_947CGfXvzqA8k1_P2.HQMWp27GDz4WTQ.cHxnRDR18kpkk1p_Yr7f"), '#rh_raw_policy', 'generation'),
            setting('creative', __rmT("mJquy0Eek_LqzoUG"), __rmT("HRHFFzzE2ZaVl4CA4lcaFcbaVNUUm1y_L60patKq"), '#rh_creative_expansion', 'generation'),
            setting('directive', __rmT("IBiRtYC.sKSygJFd"), __rmT("n2NZYVfv2dyPMNJ20yjChs5Kf2anjzQele5MKgG3FVN.bh"), '#rh_user_directive', 'generation'),
            setting('worldlock', __rmT("R6l8Gf6K3Gd2twvE71W1lh"), __rmT("uUau1To55fM_o_65M1Rpj9JlG4XZouvT73il3FV163TqxKHKI4bVI4cNell9uT"), '#rh_worldview_lock', 'generation'),
            setting('cooldown', __rmT("2Xw.4Sc2fVycYT"), __rmT("miWcnTMyAu4.48TGmUgJuxRIz5tVnrjN5AirZrDJkp1EmPIXaUIVbauPG6KGslvvv5IRpkoqLAA1SxlsLbhJ0wfi6Plcxf"), '#rh_strong_diversity_status', 'generation'),
        ] },
    { name: __rmT("Mq35cCkkt3SxkmIC"), items: [
            setting('scenery', __rmT("ONv6tqfuotzqzoUG"), __rmT("229KF4_IdVk22Pftf4zo5MdL3yaNbWqbKsmKT0noAEe2l8jHoYGotRx4qakZU0djOUKxTbk3mPpqlFVgMnxNKasE.WlGE0YO"), '#rh_visual_scenery_mode_scenery', 'generation'),
            setting('dark', __rmT("yAW341b5SDY"), __rmT("bVKFRg.wz0c3C4tjVtbA198hBfToaLaDMXKg2RdDtb9pn6se6vg4jMrJbCEEZnT7PgYPScEtZSL1EfpEr6isS_xiYa0ss3YktupDAZvxLVao.k"), '#rh_visual_tone_mode', 'generation'),
            setting('visual', __rmT("I6kkpB01qOmulF.i"), __rmT("HL3G1YbURxUq9CxNj6riR0kyQ9.Db0c.c.MkzSPyQ7E0d5g_mkcPfDh_bNmf5McYL7XbEduOY3Y"), '#rh_visual_extra_prompt', 'visual'),
            setting('visualrules', __rmT("RaMZJG01qOKZMwKU"), __rmT("0W2EUsm.meUIITL37h9n97IOFJg8o_O1Rr6RXilJkPr.bh"), '#rh_visual_prompt', 'visual'),
        ] },
    { name: __rmT("ntMbcOUJoA6OHT"), items: [
            setting('layers', __rmT("ECkDAxnVK6s"), __rmT("IudiVjZnXmZvRcvRtIfIGo84y33QuQZ4xTw2bQue8mYN1uXzyoNmpSyXhyC9uT"), '#rh_independent_context_layers', 'worldinfo'),
            setting('tags', __rmT("nHYKyCCdNoc76kQu"), __rmT("PQzdWqwE1jy3f3BBR_f2I4HoNJ0FfKdYs1jABTHGiGTtegTaPwHBgJxduGoiNSkC"), '#rh_independent_tag_filter_open', 'worldinfo'),
            setting('earlybody', __rmT("OiIrz.ySWlIZT0Ifvb3ezZEU09PT5sD8_QjV1tZ8"), __rmT("Whjbk4u6DRnSqrSGdPbLOcLtEUyI5VofyvX21E0pDjU34GA0hP3C1RBLycobLn40Yp1w4LyMEnZw6irMenaxpLR5EhEFjar_qvlU6WSWL1jcT6NtRbJ2VRNpc_xrqBwr9j6PMlQu1FT"), '#rh_early_body_enabled', 'worldinfo'),
            setting('persona', __rmT("mSpCAi.bN7QmBhtGjPOLJDMrs.yUJk"), __rmT("i9PnCfbsGLAFsCxwIweB_d8_marynMV3bWwqTBYbtrr.bh"), '#rh_independent_include_character_summary', 'worldinfo'),
            setting('worldinfo', __rmT("R4DbnhyMvffzTzQyNtT"), __rmT("1l7rx3niaG.IS0mIF.Ymg9vl8R8UXG4vWmwaFq.bgG8"), '#rh_independent_read_global_world_info', 'worldinfo'),
            setting('memory', __rmT("6slRUqXnHu_pFSJb3h8Kjmwo3dk"), __rmT("TLeQcEm6RlN9RV0x.dQ4fTy3MZNFGr.W4_VGiy9fXiTBQOXs7BZ0IzmR8EUjYgZ6MeYaEkXKs3PhmlH9"), '#rh_memory_scan_enabled', 'memory'),
            setting('memorybook', __rmT(".OtD7qRoR4BzTzQyNtT"), __rmT("OGyvL6F.0SajiPkxXuhrgZpC6CWFS.AMwyfezvpAp2AfmQClJaEuIen9Jafg7V2OYl9N_uye4XKOXP8hvro7cZC33iBNEb_DVTJpiSUI7ua1dn9RR_v6_8gL8ik"), '#rh_memory_worldbook_enabled', 'memory'),
            setting('followtags', __rmT("wLD17pqD3GdJrlMSpduKqh"), __rmT("5JRBL0G5ImAiG0sqD5tsQqJM0pWv8T17lHY7MjEZzdGBYbZaH.qf7xZfFdVH.gP1Azhl5o0Geikobh"), '#rh_follow_tag_isolation', 'worldinfo'),
        ] },
    { name: __rmT("XzYAqIUJiJBwdf"), items: [
            setting('behavior', __rmT("vwiS7P4T"), __rmT("YFT6R9gN_2PcRTqMN6pV2XPSh1dqvCby_oiQxR5f23E3ClVzoAQPp2jLqRGLYVyX7bdcXdittD92pbtNID2VAGqLw9DibBLKaFTIMe.lNIQB3koWhf8NmdVYf8_aH5xr6t8elzRCJcW9cok1pad4xfg02Fjvt17WPSp"), '#rh_behavior_rule_text', 'worldinfo'),
            setting('draw', __rmT("kuWYAtlENoAdMgRG"), __rmT("6bIRccXXT_XRYykBTstlF2seKOhyop2rPWyqBkAJPA31SEcYKEAoSuMWQwCfKg33JOzIqWo.lrhMCS8uSImmYFf4v2Acxf"), '#rh_token_meter'),
            setting('favorites', __rmT("bM87I7WQXGl"), __rmT("opHOMjmv0Yx6xbKV1zXaFHTW8z9mnNiFBOJng1g1yGyULU7GSJgIZWGTzBG"), '#rh_favorite_summary'),
            setting('theater-favorites', __rmT("oNm9IIg2DbRuF.Ki"), __rmT("DAxaqfchJo0.7y35LuboiucpsTluLjR691XbQHozO1V1iVmBY2.PYgnxSEpiebxjkjKGgrjpVmpBJ0r5qAk"), '#rh_theater_favorite_summary'),
            setting('blacklist', __rmT("zO_qmENNlH_.Cf"), __rmT("eupRNOjQICy8fSTe.9a5kz3fSFk7qtrE7qlb_Se_V.OAzKHCqNAjZSVqNQCINzkC"), '#rh_blacklist_enabled'),
            setting('replacement', __rmT("FOZbUsa23fx4cuV32Rp"), __rmT("OpMQQrWVQUsYtXFeX0H.DbB2k3arnZUjJy2DS1RaMGQ3.Rr45qZ27h_pzBG"), '#rh_banned_words', 'replacement'),
        ] },
    { name: __rmT("VeMsV6tpsDE"), items: [
            mirror('snapshot', __rmT("H8BQLf"), __rmT("i4wAKeOwv7.WxELO.xxQ9qU.5OLnL2Ld06Uct2UKgG6iHt_k5fz3Ny6Kz0gD6.YP9mb.aiHDl1L8x1sWr23LY7.Zadx2_qBFwnceIRE7m1G1NhnVu2uKD1kxYyOdZnZXoc6YVfzJxC5rg0zzarkeRxp_1y0sCbcEgptuLP191SO7p7gYf1LBNsMOKu4dT2se8mmHMRW2O9eNHieJnVMhKtpooVYYmjoOUb5sIiNcqgNCifr4xQI4MAozm8A"), __rmT("ZnDCx3GLUpkvcozvRDhN1yzTiz.dFXv1NFfY.Qyk83T")),
            mirror('cat', __rmT("YB2jfCP7KjkQkCBwtKAmA4Qz"), __rmT("PYGBO2qulOEfpcy.LT3HqpauVnaq0UzN_PcSZIgJtEky_B1nlyde215X"), __rmT("vZlJxBornW9qXC2GwHCVJlWU561wLT")),
            mirror('resay', __rmT("hYhTEk"), __rmT("tk2O9pYxJDp1R9xmOVdZ63TnHoKukJ6pggL0rKfIEM3eWrHvOQqM1X84nqXUE4.Sb9K7LoDE8OxHM3XCQUa_mR.kXzKPWnCmmGm6IBc7K5iKJnB0fQ6dV3Q1Khu2WRfhiEa7YoaUdMInIsvtFgZjiBSQmPsz.vQEJfVUL5nFzyW5l1Rw"), __rmT("E1Da_XPBdJWUroTYpJJ9XmW45gqg9jON3hFZhOiYNM.2xf")),
            mirror('swipe', __rmT("UH.bUZWfKjkQkCBw1tIEmVV4"), __rmT("Igfm6pEr2hl0b0x3_czgdttTe3AD4VvmvEPTxXNiHRPwMOjPuWoDDVrUpPmK8PL2Gdxgel82qdXBpnUjc47.6OGVP6eHi5YO"), __rmT("Gz6ZQz_ovSTgyX.Un_RoiyczvUtK.ePYLlD")),
            mirror('repair', __rmT("zwA_WvC9"), __rmT("fQbOAgIg5vT.x0.sphO3fOn5zfQPQqljC2sV5QyqrVChjschaIdHF8nV5ShHxo4WCQlOYCW0CSiB_xKL4ueiu2PxhoayLDwjvLlMXfJI79s"), __rmT("vZlJxBornW9qXC2GwHCVJIj8_Hvfof")),
            mirror('copyhtml', __rmT("CBxHSYqV.X_rkS8wf68OEUYx"), __rmT("CtZIH3gxMFf6q8cLAefsCqx2xvsee6Am7piWMI4YFGfKS0ei8_qbYM9K_y5yabMXgfnQyBv.njjZi5sOJX6NC.YMnu_cxf"), __rmT("J6Z.a3BZEbO0udpYtwktwAkrsFVXiVYDaQS6Kf04y5xFGGApOVB.VIQZtw.xE2PoBSdqPvV2LOG")),
            mirror('inspect', __rmT("xMc2kG8dr.O8gRKZ"), __rmT("c_X0Rn0cYpcTfw2UXOcWauEoio39TumB.y_CcPdggG8"), __rmT("x16aJCw.MxTCRimfS5eZEHbtqdkq7HIiCeVVUHfuvynG0gISFRD")),
            mirror('resetinteraction', __rmT("c7epqz3LDHr5dT"), __rmT("GXZpoPvKWT6bD7XbTU8jolbmHUvpyDj2VgwyaaOIs0CYK3jL4Kh6imYM0GDnY08g7Hgq_PIAyeOr8qWzCGZapV0fphGgFYzwbYo0ZTwh8i7_9e_LhBk0if"), __rmT("E1JrUplcF4TePXTY3wcC.p0tdXvVzTAQRr6RXhwriaOCVT")),
            setting('reroll', __rmT("Sr8hhJp5L32m_RmuMwz9HT"), __rmT("fe.0X6fgA9LPw90EuAefnp2BpPMoKVOTFtFrseyZfIOSZR1SrXYEdjcSQ32MelpV5VgObTdRIKPYlPxMwiPKCKvEwwdx4GvfL3K2hGzwJ1yo.k"), '#rh_automatic_reroll_enabled'),
            setting('reroll-count', __rmT("xSWXkSSkN7Q3BhWGfgOQJlrrw2SAnf"), __rmT("xV.5HyEkymYKAMqU.E8tsxlPSGaJQOikWSR6mJuqAcWWdeF7tyg94kxkqFvLg13DWUE"), '#rh_independent_automatic_reroll'),
            setting('reroll-idle', __rmT("OTSQCaLgqv3aF2xzb._"), __rmT("yMJLqhdVyXizTRb.Gr4jQfM.oVMoPVpCnPika8Y7vSWk2XRCA0iZcRqP2jn8ylpNlGZ3ss1tyZ.23goRZQ0SI4Gd0YcBC9hFw0SG_blQ79s"), '#rh_independent_automatic_reroll_idle'),
            setting('patrol', __rmT("xSWXkdxJDYtytMNkQpo6_aA_i6tRcT"), __rmT("x2K7b9HNHTKmMNSX8B08Q2mpN3y04bEzAl9o6xLIXaH9pfboazkr7f"), '#rh_maintenance_auto_safe', 'repair'),
        ] },
    { name: __rmT("XifWXOUJv6q_Gk"), items: [
            setting('connection', __rmT("NbPEFOUJ19W5Uf"), __rmT("3evZXxF8BK1bu_lzvj_VlJIs59yQe3Xrw.N9b7FBqbOlVb.GC4LBILrm0RE9uT"), '#rh_independent_import_current'),
            setting('output', __rmT("tlWh4RxyogcP.qgAlKVE5daTNi2pt86PPi8Z5mx1isY"), __rmT("qGQVbPJY4BEsdBh3D1QY81.hl8HsROv3msRMP9qcZvzTeNDbAnAchaSd0EatlFG0bOaGAlrwSHhdKX6E7LWsmP7gu9hCalP.W.YLRf"), '#rh_independent_max_request_chars'),
            setting('regex', __rmT("g2zYvhtbooWcztKU"), __rmT("BbqKqXtWXAANNcXWSONpOQ_eIHbiiuqKXH5IHFScn5Mj4586clbSr_dtTvKO6qWwtiKY3h"), '.rabbit-mirror-tools .rh_regex_configure'),
            setting('estimate', __rmT("5RY.aTMSi1ILkODwR6F_mBFJ"), __rmT("xQJOvR6xSj467YidYvvl9wt7N7iHdgAherZHPk62hC64nT.Xq8_"), '#rh_token_meter'),
            mirror('chain', __rmT("oIOzb9ip4tq6kMZTGK_"), __rmT("TBYZpkOPOv4Lv9qXophHfuvIPWJW1VUHwkGdnNagxSDjDSQX"), __rmT("x16aJCw.MxTCRimfS5eZEHbtqdkq7HIiu1oA9_bByGsJnFZd_RD")),
            setting('hostdiag', __rmT("C9LIpLCiMOu_Mp.Z"), __rmT("U1C.OfglNsg__JcUTROvtIWcZO3SUGqYah5XZD1FYnLnGLjRaz8R9q5X"), '#rh_external_diag_start'),
            setting('clear', __rmT("EO.ts7UJjNRcdT"), __rmT("CL.B9fnwK5VRDtyo_FsYG182.3gW3ta8VzprxE0GIHM20RPNV7aiGERY_Wzb83yDWUE"), '#rh_clear_last'),
            mirror('update', __rmT("SNye6NgmR6s"), __rmT("FuTWqh4YCyt710Ao4nM4.4PFIw2HFA3RGaT0z7nfGLQ54xmv1ghOJ46Vec4MP_5KsQSmBzqbjA9UYEvSI220tva.GH3fC34HZkFdARsQdaR882WlvKg3n2mFP4Hv9mjDXq8FesMAmSFYw4z2Jfi6zUFL"), __rmT("x16aJCw.51fi0Xmf6L9_mZ24SnVFFyYKLTDaMGXQI1yiPMHg23D")),
        ] },
];
export const QUICK_START_STEPS = {
    independent: [
        ['inject', __rmT("AMv55Mntws7X48Rd"), __rmT("jbBelRAOR6hZSh1zr1ovAy98NwvXF7qYZ3zsa7omgG8")],
        ['independent-mode', __rmT("QrFntNDsqyvqzoUG"), __rmT("z.QLlrf2k8_vcozvRDSk4PXYSRP85iv1igeC.41bgG8")],
        ['connection', __rmT("JwTsBxcNeTGNTpK7OoY"), __rmT("IGpd467wdZpI86TFxVzO247qvq9AUOuVj7ouYoiLYXFOmSQX")],
        ['layers', __rmT("CqjYDgjVT_jYtFuZ"), __rmT("V0l2gB.mYvyPb8KGOnmOwmNqOp7BLrLg.Rdspf")],
        ['tags', __rmT("CqjYDDWIsmS7zFOl"), __rmT("bELQlNEhWP.afqm3VIKXvgrmkbdqT9mEb.k5qkNCgG8")],
        ['independent-display', __rmT("QrFntjkGgoswIiUG"), __rmT("sDP8djefT8G4jm2cvqPBn5EskYLQv7s2")],
    ],
    follow: [
        ['inject', __rmT("AMv55Mntws7X48Rd"), __rmT("jbBelRAOR6hZSh1zr1ovAy98NwvXF7qYZ3zsa7omgG8")],
        ['mode', __rmT("UTQtixze6V61ca_vvVjTxBvXRHs"), __rmT("m1JFN921vWgnqFxtqONSPI4JiMDafbRbLc_llSnO.US.bh")],
        ['regex', __rmT("g2zYvhtbooWcztKU"), __rmT("rBzdW24uh3m_AgOb4sfjGnlFSxgY0kAm.rfKUTWxWmi1blgdcnJJCj5X")],
        ['follow-display', __rmT("QrFntjkGgoswIiUG"), __rmT("nst7RoFbs1_0WjzJyiVgeK0uzMWrrk")],
    ],
};
export function mountRabbitMirrorQuickStart({ root, openAdvanced, closeAdvanced }) {
    const doc = root.ownerDocument;
    const win = doc.defaultView;
    const guide = root.querySelector('#rh_quick_start');
    const body = guide.querySelector('.rabbit-mirror-quick-start-body');
    const entries = new Map(QUICK_START_GROUPS.flatMap(group => group.items).map(item => [item.id, item]));
    [setting('inject', __rmT("l5Tz7FKkrySsqDujNXl"), '', '#rh_enabled'),
        setting('independent-mode', __rmT("1NzhH84fE9v._t1ucwztHT"), '', '#rh_generation_independent'),
        setting('independent-display', __rmT("0Hc49pqD3Gd5VG9htFjQXk"), '', '#rh_independent_display_row'),
        setting('follow-display', __rmT("wLD17pqD3Gd5VG9htFjQXk"), '', '#rh_follow_display_row')].forEach(item => entries.set(item.id, item));
    const create = (tag, className, text) => {
        const node = doc.createElement(tag);
        if (className)
            node.className = className;
        if (text)
            node.textContent = text;
        return node;
    };
    const button = (className, text) => { const node = create('button', className, text); node.type = 'button'; return node; };
    const backBar = create('div', 'rabbit-mirror-guide-return');
    const back = button('rabbit-mirror-guide-link', __rmT("sEMGAPh.H8kKVbi6hutnXk"));
    const status = create('span', 'rabbit-mirror-guide-caption');
    status.setAttribute('role', 'status');
    backBar.append(back, status);
    const live = create('p', 'rabbit-mirror-guide-caption');
    live.setAttribute('role', 'status');
    live.hidden = true;
    const tabs = create('div', 'rabbit-mirror-guide-tabs');
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', __rmT("UTQtiAM7uUFwkM8LKvzOHaj2_lk"));
    const panels = new Map();
    const tabButtons = new Map();
    function row(id, title, description, index) {
        const node = button('rabbit-mirror-guide-link rabbit-mirror-guide-item');
        node.dataset.rhGuideRoute = id;
        if (index !== undefined)
            node.append(create('span', 'rabbit-mirror-guide-number', String(index + 1)));
        const text = create('span', 'rabbit-mirror-guide-copy');
        text.append(create('span', 'rabbit-mirror-guide-name', title), create('span', 'rabbit-mirror-guide-caption', description));
        const arrow = create('span', 'rabbit-mirror-guide-arrow', '›');
        arrow.setAttribute('aria-hidden', 'true');
        node.append(text, arrow);
        return node;
    }
    body.replaceChildren(tabs);
    for (const mode of ['follow', 'independent']) {
        const tab = button('rabbit-mirror-guide-tab', mode === 'follow' ? __rmT("wLD17kmQmPy._t1ucwztHT") : __rmT("TBxxQLFyeH2rBMsq"));
        tab.id = `rh_guide_tab_${mode}`;
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-controls', `rh_guide_panel_${mode}`);
        const panel = create('div');
        panel.id = `rh_guide_panel_${mode}`;
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', tab.id);
        panel.append(create('p', 'rabbit-mirror-guide-lead', mode === 'follow'
            ? __rmT("KVgAWGqexmNhr3VT6QUEHqKUxXuA_ISRwoptA2P9I5S03q6rMgrPBGAEUmwlBd6oWUE") : __rmT("jo9DFECU5oBVySLR_b8ntTqQMVi2vppiRqz_W5nCAoC2VI5HJyi7rvDrbKFQJ_VPPQ13GlKHs7AnAzbyyq9U3VMaMKE1eBuU5AFVKAw9")));
        const list = create('ol', 'rabbit-mirror-guide-steps');
        QUICK_START_STEPS[mode].forEach(([id, title, description], index) => { const li = create('li'); li.append(row(id, title, description, index)); list.append(li); });
        panel.append(list, create('p', 'rabbit-mirror-guide-caption', mode === 'follow'
            ? __rmT("Hpyrtd9U4KH_MtaYo2fsYNScHQL8QvOEkSVNjSvCZXYjmzQX") : __rmT("gEMf6EeODRZmOjbBs4_nPQDJD0BodhPQmWZ7hMqvKVeQqZ5OSMkbQOELyVyyWdr_9jEdJ7XCQ0y181zZJwlex0bjhNtESsKvblODpemt.zmutkL5ssurUQwf_MWDYCXGB2.ZzKQ31FT")));
        tabs.append(tab);
        body.append(panel);
        panels.set(mode, panel);
        tabButtons.set(mode, tab);
        tab.addEventListener('click', () => selectTab(mode));
        tab.addEventListener('keydown', event => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key))
                return;
            event.preventDefault();
            const selected = event.key === 'Home' ? 'follow' : event.key === 'End' ? 'independent' : mode === 'follow' ? 'independent' : 'follow';
            selectTab(selected);
            tabButtons.get(selected).focus();
        });
    }
    function selectTab(mode) {
        for (const [name, panel] of panels) {
            panel.hidden = name !== mode;
            tabButtons.get(name).setAttribute('aria-selected', String(name === mode));
        }
    }
    selectTab(root.querySelector('#rh_generation_independent')?.checked ? 'independent' : 'follow');
    const catalogue = create('details', 'rabbit-mirror-guide-catalogue');
    catalogue.id = 'rh_guide_catalogue';
    catalogue.append(create('summary', '', __rmT("vbFJlqlaN5d3QXQPKeEGqYCASAg777gDuXT")));
    for (const group of QUICK_START_GROUPS) {
        const details = create('details', 'rabbit-mirror-guide-group');
        details.append(create('summary', '', group.name));
        group.items.forEach(item => details.append(row(item.id, item.name, item.description)));
        catalogue.append(details);
    }
    body.append(catalogue, live);
    let origin = null;
    let highlights = [];
    let timer = 0;
    let frame = 0;
    let disposed = false;
    function clearHighlight() { if (timer)
        win.clearTimeout(timer); timer = 0; highlights.forEach(node => node.classList.remove('rabbit-mirror-guide-highlight')); highlights = []; }
    function capture(trigger) {
        const scroll = [];
        let node = trigger.parentElement;
        while (node) {
            if (node.scrollHeight > node.clientHeight || node.scrollWidth > node.clientWidth)
                scroll.push([node, node.scrollTop, node.scrollLeft]);
            node = node.parentElement;
        }
        origin = { trigger, scroll, x: win.scrollX, y: win.scrollY,
            details: [...root.querySelectorAll('details')].map(node => [node, node.open]) };
    }
    const showMessage = text => { live.hidden = false; live.textContent = text; };
    function navigate(event) {
        const trigger = event.target.closest('[data-rh-guide-route]');
        if (!trigger || !body.contains(trigger))
            return;
        const item = entries.get(trigger.dataset.rhGuideRoute);
        if (!item)
            return;
        clearHighlight();
        backBar.remove();
        live.hidden = true;
        capture(trigger);
        if (item.mirror) {
            showMessage(`${item.name}${__rmT("7ys")}${item.mirror}${__rmT("5ksrxaPnOEJxbdORHY1rqnjxAgHaHwVXMZd2ia_RVHVBSmj_n.bR7PCAp6fADe.4jxmWHLJlY3Y")}`);
            live.prepend(backBar);
            status.textContent = __rmT("_LwBvJEnBlb5lheC");
            back.focus({ preventScroll: true });
            live.scrollIntoView({ block: 'nearest', behavior: 'instant' });
            return;
        }
        let selector = item.target;
        if (item.id === 'display')
            selector = root.querySelector('#rh_generation_independent')?.checked ? '#rh_independent_display_row' : '#rh_follow_display_row';
        if (item.id === 'theater-favorites')
            root.__rabbitMirrorWorkbench?.navigate?.('theaterFavorites');
        const scope = item.page ? doc.getElementById('rh_advanced_modal') : root;
        const target = scope?.querySelector(selector);
        if (!target) {
            showMessage(__rmT("USIk.l9BmKZIeZaeiv6C_TBTobevZ9Y5gLrP2_R4WzJXN_YjKWRIJAmwsi.DP6kweyydXHGP"));
            return;
        }
        if (item.page)
            openAdvanced(item.page);
        else
            closeAdvanced();
        let ancestor = target;
        while (ancestor && ancestor !== scope) {
            if (ancestor.tagName === 'DETAILS')
                ancestor.open = true;
            ancestor = ancestor.parentElement;
        }
        const hiddenMode = !target.getClientRects().length;
        let anchor = target.closest('label') || target;
        if (hiddenMode)
            anchor = root.querySelector(selector === '#rh_follow_display_row' ? '#rh_generation_follow' : '#rh_generation_independent')?.closest('label') || target;
        if (item.page)
            doc.getElementById('rh_advanced_modal_header').append(backBar);
        else if (anchor.tagName === 'DETAILS')
            anchor.querySelector('summary').after(backBar);
        else
            anchor.before(backBar);
        status.textContent = hiddenMode ? __rmT("bDF4CDdD8jArlkWcQeYS2SG3U12CmOQA") : `${__rmT("iFupaxwLWZY")}${item.name}`;
        back.focus({ preventScroll: true });
        if (frame)
            win.cancelAnimationFrame(frame);
        frame = win.requestAnimationFrame(() => {
            frame = win.requestAnimationFrame(() => {
                frame = 0;
                if (disposed || !target.isConnected)
                    return;
                const destination = !hiddenMode && target.matches('select,textarea,button,input:not([type="checkbox"]):not([type="radio"])')
                    ? target : anchor.tagName === 'DETAILS' ? anchor.querySelector('summary') || anchor : anchor;
                destination.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
                destination.classList.add('rabbit-mirror-guide-highlight');
                highlights = [destination];
                timer = win.setTimeout(clearHighlight, 1600);
            });
        });
    }
    function restore() {
        if (!origin)
            return;
        if (frame)
            win.cancelAnimationFrame(frame);
        frame = 0;
        clearHighlight();
        closeAdvanced();
        backBar.remove();
        live.hidden = true;
        const saved = origin;
        origin = null;
        saved.details.forEach(([node, open]) => { if (node.isConnected)
            node.open = open; });
        guide.open = true;
        frame = win.requestAnimationFrame(() => {
            frame = 0;
            if (disposed || !saved.trigger.isConnected)
                return;
            saved.trigger.focus({ preventScroll: true });
            saved.scroll.forEach(([node, top, left]) => { if (node.isConnected) {
                node.scrollTop = top;
                node.scrollLeft = left;
            } });
            win.scrollTo({ left: saved.x, top: saved.y, behavior: 'instant' });
        });
    }
    back.addEventListener('click', restore);
    body.addEventListener('click', navigate);
    return () => {
        disposed = true;
        if (frame)
            win.cancelAnimationFrame(frame);
        clearHighlight();
        body.removeEventListener('click', navigate);
        back.removeEventListener('click', restore);
        backBar.remove();
        origin = null;
    };
}
