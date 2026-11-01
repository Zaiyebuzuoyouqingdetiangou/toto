import { rmT as __rmT, rmR as __rmR } from "./textTable.js?rmv=2.13.0";
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
    const systemPrompt = `${__rmT("3oOs1tYgy6G27em3CtM9pwealtU06FkZb3DHc1S74yp")}${compositionMode === 'auto' ? __rmT("EGsgNT") : __rmT("WPGM2f")}${__rmT("NpemXAmqc1LsS2nzBKxXLQjG.x66LYL59zN5gpnk7EtLzh5atLwk0kbrewWZY758tzM47aCgaQTt.oFHYuJMohZY4nUqx30tbIE2YSuoDEKU6JEvL.yDw8SoQmJruLqPFaBUzyIgHh1lUvLfyWjqfnS1mQ4VpWSy8gePvnDr1KR2A5ckYNqdSxaTqtYFCPkB6DhPoFsVMCieL453iieafjExcLIXwUzzerwwTSoC9HbV1NYPL1XEZvQIBsQ1tndmLWnXvpOFVd2dwr82orVjf1xCEYxGTZn259dx1uJYsw_")}${compositionRule}${string(input.focus).trim() ? __rmT("gwIAMlIIdrh1P.F7deArnVZrkhBcYq_Ixi92X6FLUdkWq9u.FfGPR8eG273YIYMcq.pcCZYfIJ_J9ocxFbRd._IjlaGoRqIjhbCRb51tGgsxpLqgakEVqtAQCIvxvUDZyIL.lF94ShRKpmOP568BI5NtprZ9wTEXmHiFEkTz0flSH6aFJ.qk8y30jl_rvRur5YoFumKz7czuFFs94E69iHV.QijgBFT62hoOp3G9SAxuDvJ4UofCFmeeOMEZxrC8RVnQyShnnwFhUwtCWqMTWIh.ehH9kEpm24p.vw77J9W5k2TGbj_W.Q1VaC9XX_dps9XDd8jzN321SqaRGqoYo_0jlOk0KaS_EUGxoOQE_XCumt9G_LLolbGV1pSXkmigGxXaHrCx7oGzHguvTIXT1hKfJn08wx5iFDri9x1fAPufuoE8yHTHU8P.yzcAW8UmzJlXmRKX45h4D7uXAIoGeltBrSHMVohrRgJYvdlSbZtIlYMXn9mehtAXQs_A3SDEvhjFcffVA4xoEHGevgSfQohddkF0QbvAQ252f0DuvYfYbJYJM1RffWmICfDYDh6gCY8wvcAJRIQYmKLTj7qDMq.JljJZVGNoooL4qiTfDDNkrAa9dCoGgugQUjoHMyn4rVF_c_TM_VRFHts5WZgZ58r7954Ad5blw5D2w6HvDEovzreYyXFng8ZNjhb.EXV1W0i0UujAX7p") : ''}${__rmT("UihPS57HWMfZ3dEMnDTPFaG6EJB96gEh8RLcPgWt1ClCmg_CGZV2H6nGQy68DVHo6OHTmxW7xLZuX.3nJ5YrluboUO3XomBlQ3byVm9ZENNHcfq8GtrNVJXTbjlHlGoRIdfn34YS0iG2jFxGhFqJkbI3cG3veMC7fTNJPgF_4NpfSjAKo6JYGogvD5hbxHi6TzkyXpnh2HXEr_GS054vUudx6v94idhi4kkmYK5HhEzMR9JhexuJKppzpRR2oW3epNKSwQ3VtzAEIqGdfZzD58hhvG80D9fB4HgbFI2nVsQ4PqEyjfuviyB_4lJlfAHLOhQyCLh8ywZ4YejHErQtzdS.mCHyLplRLASZlIOjuzWce_FvNiANc.yDMVGqT_rVxjYY04frpBnLVfzsq7jpW9xJjsdBTn4g86ZAO3EtWbvW9MRm61OO.WruU8F07Wlx3GAdFa09jMUmvRpYGz8USWybUn._ySBgwKO4TBTh0N12AutBr.JdVC6MQUMcRHoZgs9v5KCAbnwfKlusiCBvyq6ssFSKhp8qNdc5Z7Ukn8nH5o_tKduB0wrDGk.Dhxj0Ax4KBdD9JuFFBK0EY3yNP_hVj5dGIHt4_dD7o83f.YgOLkJ18jidEXoJ83BfWI4wnsU5tkX_uv8tUE8fbdH7dwCe0HOMX5Yf9rDClFj.7hAV5Uz7CcWO5ew85ip2hglxDpQFjsS914hbMjXsmFD0V9EWugphHGVPhrpRTqQViPzhaoLQfEzc9_xcywLplzdWe8k937I_rCpFjM7al0ljaR8U1c1LkbxCxI33kTlJTIRU5TrwdJ9P5gjo9vjCiDVxtzUYhjRQkxr.Nh4Hh47Irphq7nAnjnY1VfNmveA8uTEIQyO7WVSXlNha76gExuKiRYKmCOYL5ul9THGF")}${frameCaption ? __rmT("7qY0zjZOWf40sDuTJNho.PESKsr0WgJJUX6.yKtEhrYmoyGTRNhA_2aAidXvI7p3AayOsI6OcbYjsDU1o3NBopur9r8KMv5kQYWlfuDDWb09hiXiszOzpoSEW3aaRJw4NbYp9CYa8rD2UtnGFtqSFOVEGlmY8ksUFCrFiQ0ZyD310tSMOKjpA09sSjaNP5dYtzE9D6SwrgJHTVj4qTBpo2jjCRKBX2ibytR5nHwpCYB39T") : ''}${otherScenes.length ? __rmT("iBiMCOlQJeZoLCTuPKRRHa_4qTAMS1WteSYKsJvw..qeGV1EEH_Edb2f3di2seNo5u9uD6tWv8culZlG5QnBYjzOv2vfH24F33TclYzMRD1BBh65Y83po_mEMTt_.cWJdjpFBn3cAWXHYySXeMpZTxWk_CNnixi5ia9UFW3Ri6jYEmsEcFwcmq08jFH344zzmcwGMkZteUftYj5Xci5819fdrLl") : ''}${__rmT("2fKzK4OKKX6j8NVFbE.0JMLoXYwZYeKMTxOyN.3LP2pwORfLvQwy00xLmTM9I8sPxMU62gYdcWhkKL3B14sQKLWzBuCsxG0Jfa8_J_yHFJCjpgxS_auUhotXalWmAKZPD3_VfUzjh0XBVZj_G.4uK4B1khBGGhJaLne336_sAfq6rP.nd3JW3fGVXu5Zas6vKlMvNozQ5Z1OBeXb5tk2m5VRNrflwuUesdfTfJCPH9zDOJ0X6cpnkpJ3QbMNA91r7LO3d41d2XnemCUWwbBruKLuZ46JlyCC9f_2I4wqgmmjtOK.ItWFPb9BZU.DwxQp7LJRLODWfnwDkivKAF.FOVVrInRpvovLAN.PG2wPjCXvF8QhDj69Nv.lcWCQHq1izVruJ9GObpddRv_iKSIqZ4jm3EIcmoegZ59BBGUrIXppu6GMc2u5jGlP3ce4.Kw_IUI.N.xF_LFYTWISivrg_62Heb.9RcrCjcrRHMdr64LsTZTwDsHlSHuw1iEpmnMtuqjq23Rfmg0rF2w9K3IT_oOxfwgdcn6lJBwlurkmQhZ1jGLBOhvaXb957nrMmPlZ1uiOPvv3bwMfpu2errxfwcy122rrXC3OHEk5HLgoxrccUSNaWzwI6us7NjA6sGk9kNUZx5gX2Zo1wqYTeQKnUokH3do9pBgtoXPya5Ml_UaDCInluSHDffB5KHqDZPkuTSOJM0oyBwpT3P2wWfVpmZyHbg0wmuqnL9t7h13_eSDWr.qoVs0g40OykbzvMRzaZB5WraIlLJiO50wRSZitdiI8HygXwvOT6Gkryn3M2UUur5WqRChFI_5xOc0VfMkc8aL_.aUxuImbYXECO9Q.xNZcKEmL4AaOhE1lau0e51RKlTCIrUtxcY6cAO0eWp0MX3hzRYorAgSFRLc5Jnwo6ixxZF3AUdmCYxpmZfV0lSRcqgefKCVrim13x2gJxC.E.3X3CgrhkvA5ComUGddsHEb98ysUJxlXRYXeUpOYBYrqZMhLZWxD8q1jV0wYtYFduy9YsJiFA32EWYduxkEnMZ6LJcYX.3pZW0G0Ue8Nj6oaM28X0vL7ml7yrDiXZmjE2q1eOQaie_BtT9JqQD0Bn561BTZrrVPPoOw4MAhf4Gj6SE6SdLhjIzpmAoDtfKCErT714cbUGfZVXAx9FWiD7PYO33RVkYq5ArLjdz0PQRO1JblGSK4JPaYDNWQhKveuCHXJD.uam9ie.pH2Tsw5tdcyqq3FHOeIPRk9BJMWIgiGXNL8QDPPaFKITl_jfwurvV.905k_hEguHlPdcCsZB8LrthtHXrszHjTis1Le7MuakCnowzt.hg2xY46VVOACuPIJeOZVESS.oLLGSs6SAG56Q01SBQmI.hUcoXOEzxX6NEHB2RKpAskpGJSr4BAYfPpGFH3KHl6zVGUtOMtvlJC7xXngPJ_ljJWlxNGVeO4gfCruDb5OlkcXM0mImAdTKW98NJgr.kYpgtg1NVUYddgEMeavmG52_kocku4hGrmLb1De3KQ81mP5fU6II42iqaVbZHRJ3SpoeViuor1ZcC9dakEid0hWWwHH_UAWG8KOEMBXsmEXuOsUGpK4ROqqNC6_rscXc.rMLymBghmwt5_ATFb1QhAHFcD2wBMxZ1YyFirDqWUVH8tSi2XyOG1B0aefER_XUMUNqoudxZOHvKk8H6Vr_rF679z_SnshFgsw0Jrf1kHChciUktGHv.X2Vm8hLfSm2y85f0icLoYJfwar3bf6PWYYxcM.fSHPWuy6l2COkke2fnzcS1OeZwBbIUMyCYa.QkxLtH4pVdjOcsjmsheH.zoZWgh8JtIWFg7Y4VJ39Tn4Fbh4h3Gx2VdDDtcFznpowBEDBSuQ71UPyJ6dOhWJKS0S1AoDSKztJbx0DpqaGr_gBLlqIcnNB9bDtesQCgXyUpwprK2vHp10pIsCc.6oNkMED4k9iNMJaPRTI9p7tPrr4JDhQtPsfamN_AMfnFUbj5kQ2rR08Fiba55tin_vk7yu87GECspcMVsl1YBDNuoDlSEvbigIIRpR4wucSTf4Br8vxP0FwVtgRcXWe_eeBQY6LI9hZgOK2xlVHUq9jx3eR8snl7vqDNcnfPRocdB6_i8ArKq5d8tkvqENZr1RvetCjdaojoDuHPeM2kIK0NhXeexMN7ncpj4Q1QwkJOS.Fz3poapk5jvdDd4LFFpzJdQOkixNDRvmiT65UfVT_eU28r3d8h9e111UNsCMYiBrjABR6UWvlqVuNVmuiu8SDYHJAYi8RrAlZ.J8H7635tvi1ENVKZze4aBax7xFZJqlBR8kWueA9QporzRIrvqMUAXMmv4caL9fGe.nPBhhyhOPi1Tq84rBbHKyYrVHzImC3lhv.JMEMOVJEyMd7C0wai8CnuC25oLRJS_Ygy_snKayjYeP7ucTOg08LcjWxsch_eOn6khs52VbNxShT5sfY.0_UHsdSxGx3.Bhxzm_fKznIdNKF6CA9_cmmWKByT4yHnzk4FOiikI4RGnQIMFFpXK783D6wY2nIFOjsaIbAmXa_AePcRvc1Z7kxCjNHFL14OBb1BUazjlG3P1GanfeLyA9lQnR3mqt8By8.S0GSTxR_Rr.wpwWn4N2pwBPvyNxyRve_z6JfsMXCpFnotqOggg272WSSAeJef.ay3jDln6zp4bu90eVmlao5Ovc_lpHI3xBo51tI_KQ6J.4H4FjafFNf4lg9HZQB9sZ83fFNetA85PzsCVOToONDfxsvPbLKnrihRHhWySu_imtS4sjkY3Nx5DtModRHuHdAqh3yZi8g8SZ0CcgLSLtMhpVpsHE.QQ1bFW1ryLwlmJoqvDnVZlV")}${tagsOnly
        ? __rmT("cgF4BEVXK6Ii3mC2zD9Fc4P1eRSXkf_iB5Jda1ouR5OmpyCk_KlCWzs6z4cWdelDIBvHY7q6CS2eH20kyToDRhWCOJMsIoY_0wEzc3E8W6WBna0L_tAAI5IftjwuU6._.t.If9VLuTRgqX9rZcvnPmaxKJpi_mRjj.rXv6F_5T7CWwTpHq5pMeqASCBB8tcOMGLtqHCOlXfeHkLD9goaB9jSxQNYk.cEToTcbbeOYVULYuU9qM5MdQfYpdxvZ.8l.pOmcZyiLI_0rCvr.O3JCluTm4QKofPU0zxQduIZV5i.rLkUB_F_Mn7j8PIADC6WU2Lcnuk34V8") : __rmT("yZHS5i5_zoj36qz3gJSKAZZoFq.miqsKZytYxQpuFb6OiXNkehhpThi8WJGH1OM2iJLeAJ3f6TPNXXG2DJJKJKmGQ1TIrJERUMGj31RwTbcBAP6Jf1jPBJTYImDH3jipTUqRq9Z23iCAU_pQjjSwrze.bHAo4xXvTBLndT.QBFcZ9N2entxsK5VtcXWwfg_gaxSmJtI.Kn4TzW7eeXLHQ8Q9AhYhvAkenN7oZ5AdLlU3nwc83iF1rpGeM2f8NftxrvrZOiTt7WELWFim8jVW2te5sLo7sGthL1WzV7TGXE_")}${__rmT("M21nm3j.Ba_.F9s1WiE1bo6BEN74z_CmvfFTBFkfoCRrArN5s_otCHLHB0W6l77s8k7w5oVeWJepDLz_ZmBUXvpWoCgO6AsK7KzlHvMwjSiqoHbE0PMmnFCXtbZVBxmoFNa1Su.pkHu3I_GKMVzTh5jZZaZva81lXqyycjIn.NvZmnCh27NwW70kpH5UbpK0EiNb1UOqFfAelQ.cV9F35VSakWIm4awSevtsGC6k7cQPSzt9qgTh9uW3ap6JHlC2EgP3UscX8Gmwbx0vXiDdzSvq_IcFqLgPP0KM35f3E2sjB3A7eOALuK9xNh_")}${tagsOnly ? '' : __rmT("pEWZwIrjnpeXz7T7Av4nYOt30xk")}${__rmT("ryM5Our9MFawedv.P0ln1J1X1LUfc9wEwF6Nc.xw7P_D8XdIr9vBME6Js4ldLmS2JrVzENz.j3d0RPTm")}${tagsOnly ? __rmT("CaAt.81eL32F_R1u8bzcHT") : __rmT("wrzWj8B0nMoaI3QyZulaJk")}${__rmT("3DTZ9GMLA5V53rDzRVq5zTbIg1i5PVl9lvoj4adCEq9sCBPsQzAU0d2_zR_92CO_6m4IIbw7em4I0O.Y4IOPDhpbz.IVq2f_.WZ4dSyrQ0FikC28ixbCB4jcsABXchDwq7PyCjs9lqTAZQvkHR0roLN.KO10cKUUzMKfkS8FfWY5RSiRmU3f3r6KMB0ItMSsIJNDVZqEQtJp8ZmFaAvsyihk")}${tagsOnly ? '' : __rmT("XgMRYOlhFh9sLjIad5gEvodX")}"}],"promptFormat":"${promptFormat}${__rmT("2fyB7zymfp5LRAuSbM3DoE1sivrkeN4i0PSOjISzpBLS6lvc6Gix3mUhcGebDg4px92ojXVktLRk9BHiEdfvTRoe8hjjGiCVf8F8x1RFI6UhNvQCSUVP_0hAJCpRAkgXSlPXaZ7_ffh1rqPenThi7FPsIqB02YYp6XhAz169qHyVW40ODu69KC1wWHddF9Go_C3sYEslGs5BUibg8De9E960_UVDGj2_UdyOX2sk18BOV8o4R2LWFKznvd.qb3mG_8Hifh")}`;
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
