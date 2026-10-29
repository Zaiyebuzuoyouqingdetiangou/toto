import { rmT as __rmT } from "./textTable.js?rmv=1.99.14";
export const INTERACTION_SAMPLING_RULE = __rmT("3FC36avi1nlYeC8J1abh0PRnhragIGIPD6yLTj040tCh7ID8VRiJPLgWC.Bvtso0y4mexmCqCPWMZIGtNckaGufw_GhxPSqIfAgi09jDKuGp.HV_fC2I4kgLQL4.q09ibCC8VpxL7ghm6uTUq3RabTqHv1TwWcm5zBcjXkhS2UeirjKgLh4cCYNaDPCeH10vsHBt7pYULI.FGJCdLeBJSpFC4bTSIAv.V0NN4NMfKS32.k1YNmDl4hs0wwS1M5LGfspPJ64DAken.XPKGqCMC_ZFD1gTGH.BYlmswYo.eB_my6iaUdOShPthYAYzGTffP1nd2Isuxquj83jifim.vQFF5S2lqAwf2Fv_jqxPJD2FK4l1pkPM_31v7RG8TfGyA.b5L7ncLER_sVk5PJie7VZuGqZ7Gt1kIRM8Q7zr0aK..SZTTY0YdriLeh1d0eWQJYQB.pxBA__xpZj_mmbygpb82oT4kLVEX5ZVkg2nUVGomnFwpH4QY6LdGOEf_7BzPtfwXlJ.9MSexgGLstH.Ygl94G9Tj3YSvXTHx8gXfbVzDcG_ZsExWY.lzD9jc5jexZz.utbPVcn__vjLX1qlrjS1Gd3nviUHSL9aGqxGxZ6Dxx86PZeyVVTfOUIfWljCEzxbg2478_T.L5b03Tg_.Y7pi5b0auBcmNLF9anOyvpA15MuHjSb7horIP_ZW4Mi_zndWoLJT2bK3qRFP0wYmBVtOqwa7NzTXMcpUlvQuczHtEqxc9gmk6r3Dmwu3ivtqlDEy9g6F4xOGTxw7MqYj.trgM2ZwaAW.jGAT1I4EBcarL3f0mElPUptJCn9MVmMCGXUcu5QYQ912uAaUYPXm4LHpZCToh21a6xH9Z3bbhFn3uDJsNxK3sdv1_hgQM6ox2hNR1uDZruqSAE5SHjcgrwsh7o5pOQ_3zYzF1Oj2gXSCCR0mmcRdnMqRJDw9WSPEeae6vUGniO8873yNts1SjV_njOb_PmKyBhgOOSWaG6ji4wItsroUh3fvZGvRXuFh1No7NE2gROkZ9cJBpzN.FWzjhtSWajrqPSzjVibEpCEAbGwCIIzumTIxn3VJs.rLPPSu4wnvph89B6kYUAEOTvK1_wFhalBW26xNpbbgdrdyv1GL_xwtl12PBHQjAu0n0jXya9kiukZGa.jq3TSFenkJqn9plV23.QifI2Je9QtEdeZCBS2kMW2L4QQFPawxukNNoHHKQNrzQ7U7Za9ZP_OsseCM4kjiOKJE9siSBqXB8jXiw5w2jXlipbKv_fx34BXhzHljQD0f5ChYtnnpRLplNuHpiDPtximHVl3s356oXMGXMPb3ou1_7kAppXm8C5K3.MOHeEVSPl2FcZkcksMQgFffT6Zb8kz3DD_Cg4RCMX3QmxBQeNzKKQN0LN6uGIcYpNonWZyuB1yalsHfrmvUXuD6P7A5ITeRZjyU4z5ql6pYlBpsIysGx8NWXxGqj2BW3qQuOVgNak2O2n3ii6mH27myz4.oWen94mIijO1JpRXw_3KapjE5djNuSzH.5Eu05erngJ5RWkQXIDLeTqODI66CesTQA7kEtioSCFhunEQvjSkhE3ifiZtU3N1IjRfPEtA8FSiIZikA9x9Sj_z4gi5FdNXTFIwydS3fUQU2GIBqyKbA2I_odkEx7ihlpFO8V3E977W4is4cMz0E_8P4W3hnx_zsQl.58BDxp5IoPDuDdZyxyLFFE5tOd2_b5csjmCv2VXPSGGYLhWPimaO6UdHI70UmawVgxYEpgL9hBc7zneCEaovXVXuqvmvgq2.CZ6SciAGBZ3Vr6890v4407EQe03CaFAFGj7U6I4zd0La_bO_XwuMMfpcVp5u9OEN_kVsNwb61Db9ueCtWqSX6Mi8OZ4qYpfUvQ6TwHZW9s.tApQUHGFgWr1B1nY.MC0GMYcDD0uTkqP8aWkLYIrUtsxHqnF9Mm2RxVWeJlVwSOoFDasSAjAZTYkJt6CV3AP4ojk1LHqsAbDDp1C.liJ1d5fmFE40ilQudttxrk0Z0D9NdHAfZxZC11Efc.2HG0kLqfHfK6kNyerekBVGABeNG3zkFEwuEbBQqgke");
export function repairDesignCandidateAttributeQuotes(html) {
    const text = String(html || '');
    if (!text.includes('data-rm-vs="{"'))
        return text;
    return text.replace(/data-rm-vs="(\{[^<>]*?\})"(?=[\s>\/])/g, (match, json) => {
        if (!json.includes('"'))
            return match;
        try {
            JSON.parse(json);
        }
        catch {
            return match;
        }
        return `data-rm-vs="${json.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`;
    });
}
export function designCandidatePick(value) {
    return Number.isInteger(value) && value >= 1 && value <= 3 ? value : null;
}
export function drawDesignCandidate({ slots = 3, avoid = [] } = {}) {
    if (slots === 1)
        return 1;
    const count = slots === 2 ? 2 : 3;
    const allowed = Array.from({ length: count }, (_, index) => index + 1).filter(pick => !avoid.includes(pick));
    const pool = allowed.length ? allowed : Array.from({ length: count }, (_, index) => index + 1);
    if (pool.length === 1)
        return pool[0];
    try {
        const random = new Uint32Array(1);
        const limit = Math.floor(0x100000000 / pool.length) * pool.length;
        for (let i = 0; i < 8; i++) {
            globalThis.crypto.getRandomValues(random);
            if (random[0] < limit)
                return pool[random[0] % pool.length];
        }
    }
    catch { }
    return pool[Math.floor(Math.random() * pool.length)];
}
function readSamplingRecord(root) {
    let raw;
    try {
        raw = root?.getAttribute?.('data-rm-vs')
            || root?.querySelector?.(':scope > :not(summary)[data-rm-vs], :scope > * > [data-rm-vs]')?.getAttribute?.('data-rm-vs');
    }
    catch {
        return { status: 'missing' };
    }
    if (!raw)
        return { status: 'missing' };
    const invalid = { status: 'invalid' };
    if (typeof raw !== 'string' || raw.length > 8192)
        return invalid;
    let record;
    try {
        record = JSON.parse(raw);
    }
    catch {
        return invalid;
    }
    if (!record || !Array.isArray(record.c) || ![3, 5].includes(record.c.length)
        || !Number.isInteger(record.pick) || record.pick < 1 || record.pick > record.c.length)
        return invalid;
    if (record.c.some(item => !Array.isArray(item) || item.length !== 2
        || typeof item[0] !== 'string' || !item[0].trim()
        || typeof item[1] !== 'number' || !Number.isFinite(item[1]) || item[1] < 0 || item[1] > 1)
        || !record.c.some(item => item[1] > 0))
        return invalid;
    return { status: 'recorded', record };
}
export function designSamplingChecksFromHtml(html, metadata) {
    const faces = Array.isArray(metadata?.faces) && metadata.faces.length ? metadata.faces : [metadata];
    const checks = faces.slice(0, 5).flatMap((face, faceIndex) => {
        const expectedPick = designCandidatePick(face?.designCandidatePick);
        return expectedPick ? [{ faceIndex, expectedPick, reportedPick: null, status: 'unavailable' }] : [];
    });
    if (!checks.length || typeof html !== 'string' || html.length > 500000)
        return checks;
    try {
        const doc = new DOMParser().parseFromString(repairDesignCandidateAttributeQuotes(html), 'text/html');
        const frames = [...doc.querySelectorAll('toto')].filter(node => !node.parentElement?.closest('toto'));
        for (const check of checks) {
            const matches = faces.length === 1 ? frames : frames.filter(node => node.getAttribute('data-rm-face') === String(check.faceIndex + 1));
            if (matches.length !== 1) {
                check.status = 'missing';
                continue;
            }
            const parsed = readSamplingRecord(matches[0].querySelector('details'));
            check.status = parsed.status;
            if (!parsed.record)
                continue;
            check.reportedPick = parsed.record.pick;
            check.status = parsed.record.c.length !== 3 ? 'invalid'
                : check.reportedPick === check.expectedPick ? 'matched' : 'mismatch';
        }
    }
    catch { }
    return checks;
}
export function designSamplingChecksDiagnostic(checks) {
    if (!Array.isArray(checks) || !checks.length)
        return '';
    const labels = { matched: __rmT("xHYHAc2j_cE"), mismatch: __rmT("yziXcOHJt8alfT"), missing: __rmT("1iBEO.hu"), invalid: __rmT("XYzgq62s56s"), unavailable: __rmT("BMT0kr6xbGp") };
    return [__rmT("1JjV5Uatl0gk4TzXMhOIbdHZV4UwDcsXhDl_zRvzrVChj59UkzFxcHwlWAos4Zq9SFThYWmR85BFYZNpUDLlr8_UQbTZfw6wkrlOkEPajdk"), ...checks.slice(0, 5).map(item => `${__rmT("N_wXh1PSHKG")}${Number(item.faceIndex) + 1}${__rmT("fim97ju3_9TzgPoM1Jw6HT")}${item.expectedPick}${__rmT("4bM2R_Yuv_k5k3Eq")}${item.reportedPick ?? __rmT("cGlZ.e76")} ${labels[item.status] || labels.unavailable}`),
    ].join('\n');
}
export function interactionSamplingDiagnostic(root, fallbackRoot = null) {
    let parsed = readSamplingRecord(root);
    if (parsed.status !== 'recorded' && fallbackRoot) {
        const again = readSamplingRecord(fallbackRoot);
        if (again.status === 'recorded')
            parsed = again;
    }
    if (parsed.status === 'missing')
        return __rmT("yJYcXhBNkXdP9o6CpDL8gAELSziDMx5koLWoj4SxOwSwzN1sKJTGL_30S8OcukZofWBjMelfvpa1tSCokQGYfOH7n1il8E8H3nP7wqup4Z_1Vo0ddpPOWP9fXKJQ0WINodbfECjoCEzzZh");
    const invalid = __rmT("0gbzmGVzT2BJVg2n16QreADdJnqHA.bRWbmgyZ5HI5LvxHUY77jl5WJVSjkRiqD7f5YnamPTwOqoQllf2t_Frh");
    if (!parsed.record)
        return invalid;
    const { record } = parsed;
    const lines = record.c.map(([plan, probability], index) => {
        const length = plan.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().length;
        return `  ${index + 1}. p=${probability}${__rmT("qGyUSMH6")}${length}`;
    });
    const anchors = (Array.isArray(record.f) ? record.f : []).filter(item => typeof item === 'string' && item.trim())
        .slice(0, 8).map(item => item.replace(/[\u0000-\u001f\u007f<>]/g, ' ').trim().slice(0, 12));
    const anchorLine = anchors.length ? `${__rmT("cZHraha7OPRStf")}${anchors.join(__rmT("jvk"))}` : __rmT("KLusHIEYJ.b9wZvQjuKG4p8PvDanQS2YjqkhHD9DbpPzd5TKU6tK4pHQ.rTK4SMFUuf");
    const direction = typeof record.a === 'string' ? record.a.replace(/[\u0000-\u001f\u007f<>]/g, ' ').trim().slice(0, 60) : '';
    const directionLine = direction ? `${__rmT("lIwyirop")}${direction}` : __rmT("AnwyQF1WDskG3F2gDk2Q91MzALv6dNoLXKrqqh");
    return [`${__rmT("pMe.eExCgKTOxte3qliVDCOozjB6YcgRnQE")}${record.c.length}${__rmT("4b64xAJx1hN6g3Eq")}${record.pick}${__rmT("0lubWgn9i_4DJWZX56nwPjODbRNda7SNC0F8gIf49Cv.nqTyrDIzwnKSQJBzyuo.WUE")}`, ...lines, anchorLine, directionLine].join('\n');
}
