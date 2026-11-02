import { rmT as __rmT, rmR as __rmR } from "./textTable.js?rmv=2.15.1";
function string(value) { return typeof value === 'string' ? value : ''; }
function sourceJson(value) {
    return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(__rmR("nSk", "g"), '\\u3010');
}
const isMyriad = person => string(person?.source) === __rmT("w3zxhM8V");
function relevantCharacters(input, faceText) {
    faceText = `${faceText}\n${string(input.focus)}\n${(Array.isArray(input.sceneCharacters) ? input.sceneCharacters : []).map(person => string(person?.name)).join('\n')}`;
    const people = (Array.isArray(input.publicCharacters) ? input.publicCharacters : []).filter(person => !isMyriad(person));
    const names = people.map(person => string(person?.name));
    const owners = [input.character, input.persona].map(person => typeof person === 'string' ? person : string(person?.name));
    return people.filter((person, index) => {
        const name = names[index];
        return name.trim() && names.indexOf(name) === names.lastIndexOf(name)
            && (owners.includes(name) || faceText.includes(name));
    }).map(person => ({ name: person.name, tag: string(person.tag), nl: string(person.nl) }));
}
function myriadCast(input, faceText, libraryNames) {
    faceText = `${faceText}\n${string(input.focus)}\n${(Array.isArray(input.sceneCharacters) ? input.sceneCharacters : []).map(person => string(person?.name)).join('\n')}`;
    const people = [
        ...(Array.isArray(input.myriadCharacters) ? input.myriadCharacters : []),
        ...(Array.isArray(input.publicCharacters) ? input.publicCharacters.filter(isMyriad) : []),
    ].map(person => ({ name: string(person?.name).trim(), nl: string(person?.nl).trim() })).filter(person => person.name && person.nl);
    const names = people.map(person => person.name);
    return people.filter(person => names.indexOf(person.name) === names.lastIndexOf(person.name)
        && !libraryNames.has(person.name) && faceText.includes(person.name)).slice(0, 8);
}
function drawnCast(input, faceText) {
    const text = `${faceText}\n${string(input.focus)}\n${(Array.isArray(input.sceneCharacters) ? input.sceneCharacters : []).map(person => string(person?.name)).join('\n')}`;
    return (Array.isArray(input.drawnCharacters) ? input.drawnCharacters : [])
        .map(person => ({ name: string(person?.name).trim(), looks: string(person?.looks).trim().slice(0, 300) }))
        .filter(person => person.name && person.looks && text.includes(person.name)).slice(0, 8);
}
export function buildImagePlanningPrompt(input = {}) {
    const faceText = string(input.faceText);
    if (!faceText.trim())
        throw new TypeError(__rmT("tkZ0XDz2Ei40THUGs_x9ybA8V20K5YMxrH3ccmKq"));
    const floor = Number.isSafeInteger(input.floor) && input.floor >= 0 ? input.floor : 0;
    const promptFormat = input.promptFormat === 'nai45-tags' ? 'nai45-tags' : 'nai5-natural';
    const tagsOnly = promptFormat === 'nai45-tags';
    const compositionMode = input.compositionMode === 'auto' ? 'auto' : 'scene';
    const presentationMode = ['html', 'text', 'longtext'].includes(input.presentationMode) ? input.presentationMode : 'html';
    const formats = (Array.isArray(input.formats) ? input.formats : [])
        .map(format => ({ title: string(format?.title), summary: string(format?.summary) }))
        .filter(format => format.title.trim() || format.summary.trim());
    const frameCaption = string(input.frameCaption).replace(/\s+/g, ' ').trim().slice(0, 300);
    const otherScenes = (Array.isArray(input.otherScenes) ? input.otherScenes : [])
        .map(item => string(item).replace(/\s+/g, ' ').trim().slice(0, 240)).filter(Boolean).slice(-4);
    const publicCharacters = relevantCharacters(input, faceText);
    const myriad = myriadCast(input, faceText, new Set(publicCharacters.map(person => person.name)));
    const materials = {
        source: __rmT("hVvypYk128orJsSsdI32FmD747lcSmSs2.opg1g1vJGlh1ynPJA.n449jiY"),
        title: string(input.title), faceText,
        character: input.character ?? null, persona: input.persona ?? null,
        publicCharacters,
        ...(myriad.length ? { myriadCast: myriad } : {}),
        ...(string(input.focus).trim() ? { focus: string(input.focus).trim() } : {}),
        ...(Array.isArray(input.sceneCharacters) && input.sceneCharacters.length ? { sceneCharacters: input.sceneCharacters.map(person => ({ name: string(person?.name), text: string(person?.text) })) } : {}),
        ...(string(input.worldBookCast).trim() ? { worldBookCast: string(input.worldBookCast).trim() } : {}),
        ...(drawnCast(input, faceText).length ? { drawnCast: drawnCast(input, faceText) } : {}),
        promptFormat,
        compositionMode, presentationMode, formats,
        ...(frameCaption ? { frameCaption } : {}),
        ...(otherScenes.length ? { otherScenes } : {}),
    };
    const compositionRule = compositionMode === 'scene'
        ? __rmT("YWn4jLKAUzZFen1zn11TU_9N0e93POvegBHAS_sgaaghFixbhffXBUngxrepJ1pNSUodHjd1dPsA9pwMfs8zQIX_Tjos8ounvMSSPErpUGGWYmEJde9ErdMBx9WI5khxKdnT6WDM7jzPjv5O458C9dGOfOsCSCaQeGQPlERtRsITnCZZRsfPwFJZM5xY97tC0mjQug8rWQ21MiNu9eHFPtWIABgj2K7hULi0OftDO5wLcXe4JE5MUpVcmLR4zv2W4EnX1ViR54Xlk8zAwRSHiXidDNpBKxv5bwNU8mVyoRW79gMbhL3t1GxU") : `${__rmT("llsGkrHfbe2CK5dULyCn3IM6M7ZUVVAG124B6ikAkp7vPdWDb51b7AqaWjN9M57VjxJZzM683txlymJOqxeMokaWwY0W2dHjCK2mtNfp680PJQqpABfOTMG_NqTjZSQ9tvkLr7hIYzDy4vty9mJOsW.6DYyF.fN_30pMquB7RkOlWIDKPwG9vbd3HrW9Kqg60Xy2d9D9smA")}${presentationMode === 'longtext'
        ? __rmT("O1g0v7RVuzDkCbv1Mbt2FiHYk7nB4i6EsQ1YXac7pRFMWnfeqUF0Yc3nReLeoYApQe_il75pNCqw_IkoFz3f5O0RNXhoQKLtXP062UGupoKUwsWlxkICAC3UvxjdX5yzX2L1PkYXeiZ_0sxaLYd_oH0e_b.fHYI3SyMv5xsM8l6QWN8545wr9imO") : formats.length
        ? __rmT("Vf2v.s8IWwTq2qAHbynYEa.nMfKyG9.F3mh9C6UaoAlwYtuQw3XJyJW7VR4wrvr.nPXnFbh4GolruYENFBiB6PaTbqeRUYJ.EEt8ME65N.7YBI6aijeQFEnM47qcq_NOEuzvy8zRQfLCuocWi7LUqIRCFpVXhlYitdzyMWqbDOOqaW0pwfCVkhDQf8Ng2rOOMXc3DnYrS6ogMcZw5Aa1YDt2CktHUJz3kr9UdJyZNi9dqk4EKPwT3FaXMAeH0ZC5r.QZmELyslIRy5AYsC.Eq7K8ocsKju8vlxEHwPhAz4BRVbNaqmg2t.dcaSCQDRfEXRkF6ammK_JXJbrxAeU.0Wyj6WeIyhNnlR_tomujMaxmplg9xZR18qjx9sK.3.mrYRgElRokWc1Mr1sGc9E_t2fFH3IStKgkcM0n7NUlClUUd7m0iRsPWjWFobkwKO2eBsX5YZpNfrE.OLUvrico.zR7mQh6I9PRZyS34HdiezqW3vrBDtBcWfli_ka2FFWtvgvSfX4SS3oTXHjwdvsEH8_ORFMx8Wk70vtE9siS2Rw_OuZwaYGMj.Zok2F5ILsKMpEw0nEojkbZFY86QsxKArCzHB5HPVOoeJM79ia_i18K1hMbZ1xffMo_foINtFVnn76408jtmR9IHwOmkK7eqjBqMvKYQAs3QQothDV1rr_7eDRE5Cw7Xd_3BlVahw81APODD2ymyYjBL3ZC6qpN4BL9Bu3E25Dy_CCj25H4L5xvg.R3JN.5_7JguWq318RWMYKr70VwPuaQTDB2mRM1hNqHrRDO9G6rkbr2UVSeqcYeLpJVC8DhzDqnI6JW3y_HigFsRNZ.iz2tjqH6BEs") : __rmT("1v61yWfL6DYt7P7wnZzsN4gNhWv1N6x2oipIqfEux.g1gFniA95sXCsogK0OMsizj.URdtkB0U28neo_LRp0jMTYsZVpiBVAAoivBWjRJcaAsgALJK1h95CWUmpiPbziZ8gUU6z8Ah4UJkaR7BlNnMgYoddxlyzQeX7ZF2YTrBebLfxgZ_h3YrSFZhqBDLgTiiZtof")}${__rmT("zmWbCcmIVQ7GzUjJbxrxtUCkjsq0MFKQTr66Jh6HBJpFr8VvIDSSbf99bQPqNz3nxKXp_7AYC5OylXkKMd8ekwvJU4d54hfiGmI6Qghs8AZO0RzPbRWkgh0Kg_Bz7ZbMb_g6BfF4sVj0Zolq9havX3S_cf2y69ybBoLWLZR2sFuIBnXNMKyhwxzdSir.PCzA.le_dbmKD7e7U7grzsYT6T")}`;
    const systemPrompt = `${__rmT("3oOs1tYgy6G27em3CtM9pwealtU06FkZb3DHc1S74yp")}${compositionMode === 'auto' ? __rmT("EGsgNT") : __rmT("WPGM2f")}${__rmT("NpemXAmqc1LsS2nzBKxXLQjG.x66LYL59zN5gpnk7EtLzh5atLwk0kbrewWZY758tzM47aCgaQTt.oFHYuJMohZY4nUqx30tbIE2YSuoDEKU6JEvL.yDw8SoQmJruLqPFaBUzyIgHh1lUvLfyWjqfnS1mQ4VpWSy8gePvnDr1KR2A5ckYNqdSxaTqtYFCPkB6DhPoFsVMCieL453iieafjExcLIXwUzzerwwTSoC9HbV1NYPL1XEZvQIBsQ1tndmLWnXvpOFVd2dwr82orVjf1xCEYxGTZn259dx1uJYsw_")}${compositionRule}${string(input.focus).trim() ? __rmT("gwIAMlIIdrh1P.F7deArnVZrkhBcYq_Ixi92X6FLUdkWq9u.FfGPR8eG273YIYMcq.pcCZYfIJ_J9ocxFbRd._IjlaGoRqIjhbCRb51tGgsxpLqgakEVqtAQCIvxvUDZyIL.lF94ShRKpmOP568BI5NtprZ9wTEXmHiFEkTz0flSH6aFJ.qk8y30jl_rvRur5YoFumKz7czuFFs94E69iHV.QijgBFT62hoOp3G9SAxuDvJ4UofCFmeeOMEZxrC8RVnQyShnnwFhUwtCWqMTWIh.ehH9kEpm24p.vw77J9W5k2TGbj_W.Q1VaC9XX_dps9XDd8jzN321SqaRGqoYo_0jlOk0KaS_EUGxoOQE_XCumt9G_LLolbGV1pSXkmigGxXaHrCx7oGzHguvTIXT1hKfJn08wx5iFDri9x1fAPufuoE8yHTHU8P.yzcAW8UmzJlXmRKX45h4D7uXAIoGeltBrSHMVohrRgJYvdlSbZtIlYMXn9mehtAXQs_A3SDEvhjFcffVA4xoEHGevgSfQohddkF0QbvAQ252f0DuvYfYbJYJM1RffWmICfDYDh6gCY8wvcAJRIQYmKLTj7qDMq.JljJZVGNoooL4qiTfDDNkrAa9dCoGgugQUjoHMyn4rVF_c_TM_VRFHts5WZgZ58r7954Ad5blw5D2w6HvDEovzreYyXFng8ZNjhb.EXV1W0i0UujAX7p") : ''}${__rmT("UihPS57HWMfZ3dEMnDTPFaG6EJB96gEh8RLcPgWt1ClCmg_CGZV2H6nGQy68DVHo6OHTmxW7xLZuX.3nJ5YrluboUO3XomBlQ3byVm9ZENNHcfq8GtrNVJXTbjlHlGoRIdfn34YS0iG2jFxGhFqJkbI3cG3veMC7fTNJPgF_4NpfSjAKo6JYGogvD5hbxHi6TzkyXpnh2HXEr_GS054vUudx6v94idhi4kkmYK5HhEzMR9JhexuJKppzpRR2oW3epNKSwQ3VtzAEIqGdfZzD58hhvG80D9fB4HgbFI2nVsQ4PqEyjfuviyB_4lJlfAHLOhQyCLh8ywZ4YejHErQtzdS.mCHyLplRLASZlIOjuzWce_FvNiANc.yDMVGqT_rVxjYY04frpBnLVfzsq7jpW9xJjsdBTn4g86ZAO3EtWbvW9MRm61OO.WruU8F07Wlx3GAdFa09jMUmvRpYGz8USWybUn._ySBgwKO4TBTh0N12AutBr.JdVC6MQUMcRHoZgs9v5KCAbnwfKlusiCBvyq6ssFSKhp8qNdc5Z7Ukn8nH5o_tKduB0wrDGk.Dhxj0Ax4KBdD9JuFFBK0EY3yNP_hVj5dGIHt4_dD7o83f.YgOLkJ18jidEXoJ83BfWI4wnsU5tkX_uv8tUE8fbdH7dwCe0HOMX5Yf9rDClFj.7hAV5Uz7CcWO5ew85ip2hglxDpQFjsS914hbMjXsmFD0V9EWugphHGVPhrpRTqQViPzhaoLQfEzc9_xcywLplzdWe8k937I_rCpFjM7al0ljaR8U1c1LkbxCxI33kTlJTIRU5TrwdJ9P5gjo9vjCiDVxtzUYhjRQkxr.Nh4Hh47Irphq7nAnjnY1VfNmveA8uTEIQyO7WVSXlNha76gExuKiRYKmCOYL5ul9THGF")}${frameCaption ? __rmT("7qY0zjZOWf40sDuTJNho.PESKsr0WgJJUX6.yKtEhrYmoyGTRNhA_2aAidXvI7p3AayOsI6OcbYjsDU1o3NBopur9r8KMv5kQYWlfuDDWb09hiXiszOzpoSEW3aaRJw4NbYp9CYa8rD2UtnGFtqSFOVEGlmY8ksUFCrFiQ0ZyD310tSMOKjpA09sSjaNP5dYtzE9D6SwrgJHTVj4qTBpo2jjCRKBX2ibytR5nHwpCYB39T") : ''}${otherScenes.length ? __rmT("iBiMCOlQJeZoLCTuPKRRHa_4qTAMS1WteSYKsJvw..qeGV1EEH_Edb2f3di2seNo5u9uD6tWv8culZlG5QnBYjzOv2vfH24F33TclYzMRD1BBh65Y83po_mEMTt_.cWJdjpFBn3cAWXHYySXeMpZTxWk_CNnixi5ia9UFW3Ri6jYEmsEcFwcmq08jFH344zzmcwGMkZteUftYj5Xci5819fdrLl") : ''}${__rmT("P1CATDhaHjJWMMv9gPOoWo2BDDV68SgPp2jP2O_H2pP4p2QGYDoth72ALV.cAi5qiTLzjbIJ0QyoIrmrOby4gxDnQb3DfrDIokr6fbZK6yYXO5l2gYkLynL9bvggU_ed9QZDaf2WTwwR6Bvxvtx9NLfUaK_Yhh3Uf0SRZn2dAkVidSrl_kNHmb8vmsudyYSUgztLL7TjHoTqEbzNldtXqrQ7mqjH8HSv2ci91sxqj_TqsNEXvdZwvHD0oZyhjo4U.ZhmOcTeQBocpXZPjvls543jT41aIMwLnWpmFlsAgLkih42Ds8_l7Mmsn0CqpzekpBafalU4esRsFK24jXF2yXJgLQD0QFYRdMbzlFl.VY_ldxTD0caOtiiwooFkHcGuIR3mbAGlU.DFVuvX4mltpnBR5Ax9yaEXQ2SrpHaACUAv9Am6ILqfMZbjiSILFxrBRU2rhzBLKNqoFUHRqNwtqaE35ZgvLh5Pmuxm_NFZ25n7ZX3taNy8uvH9DPt4W1KfH0YQ8LDVznSuxWEU6fUYDH8MXhtX4g_pLMvM_iJZ745pZK67fiQbieAfQB2WwOCVBgnrWQIqY_da96y5kM6MStnobfhFh_b0SXtKQTFidriB4zjrfBWHVCXaO.alwYdsJygG.GUkE_5_89scXR5jIpJrUNHD0qSgrkJq_kdGniiZbQ3S6jJ6pTkuRHJt8MAV_Lx4s4TTXjiZPUZg2dkfTnH2qkSBNciAa7xJF2h9YJsMCJVNcf_z7TACjvgEuiBXfR9Fzn6GJJUZtUw0sqre6Nx3Mrw71cVaiLzlpDgVATHYApPBhoITQ3DFTTvOodJtuOSF.X2IyTWcEk.0QBkqtzB1kIJ_JslDEIRIZeX8ZrTxRnieRjAr1MmhnsRjwcwA65X5J7VzkK7S42scgowe2LN60JbXo4QjKeHMPmp9JvWV3Fq30UDlvgnmKxcB83Um6m1Woy2V2WchrchH2LvnFZTeyomN53UrYqgVCip5cUvttEi.cM3ZHwWV6L_mZzoyr_GbLHps9vTmOz3ZNfkVEGydQG7FLQdTTtj2BuuuRkvm7TRDoiRYRNxQ6INVKiMyvC.QVbL23xm91iXxOOTM4_bIfG9NmYa7PVtAy33iEJAiycOuy8rX9qb8weNWRiI5ggb4faB6mtuZLM13psSh7ClscsqgDZb93XB3f_MpizqUy0wOjXwsIWGM2TWXoDRcWSW_8AMGEzSTdFq2kYzDs.wBs0ZYD0dNz6M4cyk.UODJl71MiCffNL3xSvSzqRBQH7_MkBj5zY18dRfmMCykkSba8CLWduZ7kOLxJC6XcHdcTwwDFZ6E4BFTU0xZNzrx5ao6.cXF1.09PPKb0MbwpBE.QbG36oQVXFpnnuZO2gvTdcOt7IOe7fXY7_o1esfF2UbZDnniYzun8oqAiOo.ST9TjVi3FJFPBlZkOXdOgZDaVnLE54YMJsw8ebEj1G4rynw5bgr1Kj1zdXArioLOrqxp_GVFQBll67ZHqsP_FCD95Yb1izW5XlKq2LKKA1mInybThTswEMENZPCg2DrufjlNhk5S_qR6IBiVQA_g6FhSCVTlRZSRuia7hnwKv8e52P2i2rg7TgZqTwG1IZZpxWGJ6Q11qLmUF3myPNBiKuFeUMF2ummuMlIEZNWhBTbsWkbDVOSsh3gW7qlk_OajEBYBjgmJrWJNjbUhCchaszSF_5yHruxa4lr9.fDtPT7rsyF7HwfUt_dbULrBxflpgcIALxcZIl2jIUL7kTRpujnTO_Awm__sR7TopDv.DW0tyqg742yBn5Ler8ODSnvQQ3divIiYwMi_Bt_FpcFS.6ywfS.06wqKiZ0Kqv1vxHP114rRCVjZcvsEKvsMFVOzW7j_zohvPNe.s8qGCgH7kXr1rLWDJJrI9M0QG8_lcN1NAezpU5fSynfZHLbCNmsg7u4KHIS1zpBrxnXpP69zL.Ywc2DJGpuul_hgu1L6sLfIF1pBKMz4XTIzc4rt8UuZ2fQRh5jCxWo926OKm3zFYK4kq1ip0SYC9zQhwqGO5zV5TcDCJ0X1YPfuA0aBRHKVFETOoEdzteXcHE_SRy0cwdnJpaHXSqbZjJDez2guC.6D1NsfRfAauhKcZ6MLrYwmQRCWL3NEhVuTqGc9vaFHvAQJR7JHRK6B3KPyfcpHp4zhvZpn_cRcINe8UXvOTTcr7n1YuJtdlWi6usqQYoIjkmOB7Pjtm5GrLxSSmiZuCrDsfSpldAWAEKU5Ih9PvIj6Z8YuHk.V_Ednf_sCwyeMIYcHtOsgLsqYCAXWznFoOYSI4WZKTt40cpkP5s3L9L5o5SEIYGctLr.QcmwK8lmhyOw9bEb6ShPrYeg4MZXv3fABlB00vTLeHE2XdTbHxbaAruzuVOXwe7SP8_NjqGNGvi_ncP2Jv7sjT35fVDYTfFpQeGCHvPyDJwlfyH8WEbNZmN71NqojW26YB0BXg2_ez8yZlHkWGH5lPuYBOOuSdBU7DBDAOyfv_pgpGAu9vnTGW_w3chvNSKwVBwVQ4GpkVYArYfIalaUZMsePGr02fOnGAb8lvBBtPtDe_DV7.QOWE9RTvidTwIkluQ6iSxo298G5UtPhvC7Y1n5JzS77QpYa..ypCP.NOD.A9j51k0qJHBDvQWlNQB_rVjlGCvpiUGatXlaFlYL506U.1yWbY.HbC9T8tZEZNGLI1fDCKbHBpXPb1xTfp9D6ijH4yDfbs5PRvyyx4urLdx4Om_If5GBg.0G5vna6lCmIMfDofq.0CPZH5tmFdI9FT1FDb7X.JIL9GtbMcWH9J0G3u_3bwiPjUY9uJ8PnLlIY2Ke51mdPCQ8G8Onwc_pBn0wlzbuy6EG7tEhgNXFVkkTjv0OMFJFDmNKcYYy.OH8.9RCOcU24pGCoADFII8qebP3yENWgumLy0zDg8mS79cy.Bewd3m59pSkX3An5w8HdRSNAttQ_FHtTaWMiEe69kFu3E_2ZRx7av.bPZtNlKUsfTgAUrFt1sbjfa6My7MivWi2sJsniCFQnBiJzzmfYi1wYNuyA0zj7Ll4KVu7l4Ia4OzA22RBgzb9fzceNK9y7oxlPZ58oS5cW4aTjm2rGv1bBGqwFg2V9swD4WVAkZfSQ8dilILoSlj305rHv0mY8DOOZGWfBo1K4M7DNVwRT6_8m2SmOwvUcap0YNM7KgeHyXWMh0FOBGAuRYMTflfCw14sqaQvYC3Oh3lTsDNt7jS_dMcw1PFcPNYopI4YmFHUAB7gj6DNVAiYG.WzUxMeIcU3cZVi.9jDwOFRdpOnrsOUmQD0HaNUQavaBg4RKlFEtw2CPXDdg5oYt5UL.HNMRhToXIxFM9l8wgkmMV5A_fAUnqrGIia6LTAraSdpFrk")}${tagsOnly
        ? __rmT("cgF4BEVXK6Ii3mC2zD9Fc4P1eRSXkf_iB5Jda1ouR5OmpyCk_KlCWzs6z4cWdelDIBvHY7q6CS2eH20kyToDRhWCOJMsIoY_0wEzc3E8W6WBna0L_tAAI5IftjwuU6._.t.If9VLuTRgqX9rZcvnPmaxKJpi_mRjj.rXv6F_5T7CWwTpHq5pMeqASCBB8tcOMGLtqHCOlXfeHkLD9goaB9jSxQNYk.cEToTcbbeOYVULYuU9qM5MdQfYpdxvZ.8l.pOmcZyiLI_0rCvr.O3JCluTm4QKofPU0zxQduIZV5i.rLkUB_F_Mn7j8PIADC6WU2Lcnuk34V8") : __rmT("yZHS5i5_zoj36qz3gJSKAZZoFq.miqsKZytYxQpuFb6OiXNkehhpThi8WJGH1OM2iJLeAJ3f6TPNXXG2DJJKJKmGQ1TIrJERUMGj31RwTbcBAP6Jf1jPBJTYImDH3jipTUqRq9Z23iCAU_pQjjSwrze.bHAo4xXvTBLndT.QBFcZ9N2entxsK5VtcXWwfg_gaxSmJtI.Kn4TzW7eeXLHQ8Q9AhYhvAkenN7oZ5AdLlU3nwc83iF1rpGeM2f8NftxrvrZOiTt7WELWFim8jVW2te5sLo7sGthL1WzV7TGXE_")}${__rmT("M21nm3j.Ba_.F9s1WiE1bo6BEN74z_CmvfFTBFkfoCRrArN5s_otCHLHB0W6l77s8k7w5oVeWJepDLz_ZmBUXvpWoCgO6AsK7KzlHvMwjSiqoHbE0PMmnFCXtbZVBxmoFNa1Su.pkHu3I_GKMVzTh5jZZaZva81lXqyycjIn.NvZmnCh27NwW70kpH5UbpK0EiNb1UOqFfAelQ.cV9F35VSakWIm4awSevtsGC6k7cQPSzt9qgTh9uW3ap6JHlC2EgP3UscX8Gmwbx0vXiDdzSvq_IcFqLgPP0KM35f3E2sjB3A7eOALuK9xNh_")}${tagsOnly ? '' : __rmT("pEWZwIrjnpeXz7T7Av4nYOt30xk")}${__rmT("ryM5Our9MFawedv.P0ln1J1X1LUfc9wEwF6Nc.xw7P_D8XdIr9vBME6Js4ldLmS2JrVzENz.j3d0RPTm")}${tagsOnly ? __rmT("CaAt.81eL32F_R1u8bzcHT") : __rmT("wrzWj8B0nMoaI3QyZulaJk")}${__rmT("RyCLe.0r_whfp0KL8VSRBFc5Yxn7qmtFN2Bwe.IGA6f6iEFAW0p_m4HP.d2MGm0TNsakGgymoGH6lb_KQUw.oO2v7137LE0UUxFth5mMpaE2sEFe37J8uxbUcgyJi88uPyOM18aBrHMsMag9m8Efo6kj7C7_ZupaDeM.2DoMoRy77HeAcz1.gd00yQHz0RYp2yt39wZxRu3MY6RZXpcoMoZ1jBInsC79vlbkdhmpOqLgjADrNX5qDZk4q9XYeitAQZ5g29VSa73MACJ1OjFOj6TK2rzWACKL19f")}${tagsOnly ? '' : __rmT("XgMRYOlhFh9sLjIad5gEvodX")}"}],"promptFormat":"${promptFormat}${__rmT("2fyB7zymfp5LRAuSbM3DoE1sivrkeN4i0PSOjISzpBLS6lvc6Gix3mUhcGebDg4px92ojXVktLRk9BHiEdfvTRoe8hjjGiCVf8F8x1RFI6UhNvQCSUVP_0hAJCpRAkgXSlPXaZ7_ffh1rqPenThi7FPsIqB02YYp6XhAz169qHyVW40ODu69KC1wWHddF9Go_C3sYEslGs5BUibg8De9E960_UVDGj2_UdyOX2sk18BOV8o4R2LWFKznvd.qb3mG_8Hifh")}`;
    const userPrompt = `${__rmT("d5eBWSF2FqYdXbk1EM5eL6DRUZntUpBP")}${floor} ASSISTANT]\n${sourceJson(materials)}${__rmT("SkadRxXq5YEx.0EnpfPNxFv.qd_TfjccfyYZx3dRy.41xsyh9TTfaeg_dxl4vw6UUqFbfTwcsPfbA9GQRYRdkkPKVAvaNrubofOvUD7CQ7AYgF_ltwwPASbzQfP38Yw6B_P6SCRtyBNoAYLf4gyn266i.aEJlhBZhzHNZw8lU2A8pUIYK_yZw9f75iKbaFlKH0cfle48zLbtJS_L_pVar0BoxpojTU.1efvlES5HQ3pjaBLyqZORNtIzLLu8rLy8CtK6M5BmxauBxQV3toPjzJWxNZVLDcV8YM._gFOqeFCZqk")}`;
    return { systemPrompt, userPrompt };
}
function extractBalancedJsonObjects(text) {
    const results = [];
    let depth = 0;
    let start = -1;
    let inString = false;
    let escaped = false;
    for (let i = 0; i < text.length; i += 1) {
        const ch = text[i];
        if (inString) {
            if (escaped) {
                escaped = false;
            }
            else if (ch === '\\') {
                escaped = true;
            }
            else if (ch === '"') {
                inString = false;
            }
            continue;
        }
        if (ch === '"') {
            inString = true;
            continue;
        }
        if (ch === '{') {
            if (depth === 0)
                start = i;
            depth += 1;
        }
        else if (ch === '}') {
            if (depth > 0) {
                depth -= 1;
                if (depth === 0 && start >= 0) {
                    results.push(text.slice(start, i + 1));
                    start = -1;
                }
            }
        }
    }
    return results;
}
function recoverPlanAfterReasoning(text, limit = 400) {
    const found = [];
    let checked = 0;
    for (let start = text.indexOf('{'); start !== -1 && checked < limit; start = text.indexOf('{', start + 1)) {
        checked += 1;
        let depth = 0, inString = false, escaped = false;
        for (let i = start; i < text.length; i += 1) {
            const ch = text[i];
            if (inString) {
                if (escaped)
                    escaped = false;
                else if (ch === '\\')
                    escaped = true;
                else if (ch === '"')
                    inString = false;
                continue;
            }
            if (ch === '"')
                inString = true;
            else if (ch === '{')
                depth += 1;
            else if (ch === '}' && --depth === 0) {
                try {
                    const value = JSON.parse(text.slice(start, i + 1));
                    if (value && typeof value === 'object' && !Array.isArray(value)
                        && typeof value.prompt === 'string' && value.prompt.trim())
                        found.push(value);
                }
                catch { }
                break;
            }
        }
    }
    return found.length ? found[found.length - 1] : null;
}
function textAfterReasoning(text) {
    const close = /<\/(?:think|thinking|reasoning|analysis)\s*>/gi;
    let last = -1;
    for (let match = close.exec(text); match; match = close.exec(text))
        last = match.index + match[0].length;
    return last >= 0 ? text.slice(last).trim() : text;
}
function parseImagePlanCandidates(text) {
    const trimmed = text.trim();
    const answer = textAfterReasoning(trimmed);
    if (answer && answer !== trimmed) {
        try {
            return parseImagePlanCandidates(answer);
        }
        catch { }
    }
    const candidates = [trimmed];
    for (const match of trimmed.matchAll(/```(?:json)?[ \t]*\r?\n([\s\S]*?)\n?[ \t]*```/gi)) {
        candidates.push(match[1]);
    }
    const balanced = extractBalancedJsonObjects(trimmed);
    for (let i = balanced.length - 1; i >= 0; i -= 1)
        candidates.push(balanced[i]);
    const seen = new Set();
    for (const candidate of candidates) {
        const clean = candidate.trim();
        if (!clean || seen.has(clean))
            continue;
        seen.add(clean);
        try {
            return JSON.parse(clean);
        }
        catch { }
    }
    const recovered = recoverPlanAfterReasoning(trimmed);
    if (recovered)
        return recovered;
    throw new TypeError(__rmT("8_g5NZYUu2t0pJ2CT9azmwwJRk_H.KLGcfIu30i_4JSprj4lfvTjtL9bRo9pChpZJMpMxAqN7tMqDSBl3iAFrh"));
}
export function parseImagePlan(text, { promptFormat: requestedFormat = '' } = {}) {
    let value = text;
    if (typeof text === 'string') {
        value = parseImagePlanCandidates(text);
    }
    if (!value || typeof value !== 'object' || Array.isArray(value))
        throw new TypeError(__rmT("A9oJcdJuk.Sj88P5R2CpfeyGOfjvN7GgmYZ_latpToauDvQX"));
    const field = item => Array.isArray(item) ? item.map(part => string(part).trim()).filter(Boolean).join(', ') : string(item).trim();
    const prompt = field(value.prompt) || field(value.flatPrompt);
    if (!prompt)
        throw new TypeError(__rmT("E1IHei3iEQYcqm1gTUuDuiYgwdAD1xs2"));
    const rawCharacters = value.characters == null ? []
        : Array.isArray(value.characters) ? value.characters
            : typeof value.characters === 'object' ? Object.entries(value.characters).map(([name, item]) => (item && typeof item === 'object' && !Array.isArray(item) ? { name, ...item } : { name, tag: item })) : null;
    if (!Array.isArray(rawCharacters))
        throw new TypeError(__rmT("mSpCA0ev_awSMNyqevkJnH10LJqrrk"));
    const tagsFormat = (requestedFormat || value.promptFormat) === 'nai45-tags';
    const parsedCharacters = rawCharacters.map(person => {
        const name = string(person?.name).trim();
        const tag = field(person?.tag);
        const nl = field(person?.nl);
        if (!name || !(tag || (!tagsFormat && nl)))
            return null;
        return { name, tag, nl };
    }).filter(Boolean);
    return {
        prompt, nl: field(value.nl),
        flatPrompt: field(value.flatPrompt) || (parsedCharacters.length ? '' : prompt),
        characters: parsedCharacters,
        promptFormat: value.promptFormat === 'nai45-tags' ? 'nai45-tags' : 'nai5-natural',
    };
}
