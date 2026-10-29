import { rmT as __rmT } from "../textTable.js?rmv=1.99.17";
export const EXTERNAL_WORLD_BOOK_ERROR_CODES = Object.freeze({
    CAPABILITY_UNAVAILABLE: 'WORLD_BOOK_CAPABILITY_UNAVAILABLE',
    LIST_FAILED: 'WORLD_BOOK_LIST_FAILED',
    NOT_FOUND: 'WORLD_BOOK_NOT_FOUND',
    READ_FAILED: 'WORLD_BOOK_READ_FAILED',
    SCHEMA_UNSUPPORTED: 'WORLD_BOOK_SCHEMA_UNSUPPORTED',
    ENTRIES_MISSING: 'WORLD_BOOK_ENTRIES_MISSING',
    ENTRY_CONTENT_INVALID: 'WORLD_BOOK_ENTRY_CONTENT_INVALID',
    ENTRY_STATE_CONFLICT: 'WORLD_BOOK_ENTRY_STATE_CONFLICT',
    FILE_TOO_LARGE: 'WORLD_BOOK_FILE_TOO_LARGE',
    JSON_INVALID: 'WORLD_BOOK_JSON_INVALID',
    FILE_TYPE_UNSUPPORTED: 'WORLD_BOOK_FILE_TYPE_UNSUPPORTED',
    STORAGE_UNAVAILABLE: 'WORLD_BOOK_STORAGE_UNAVAILABLE',
    STORAGE_QUOTA: 'WORLD_BOOK_STORAGE_QUOTA',
    STORAGE_WRITE_FAILED: 'WORLD_BOOK_STORAGE_WRITE_FAILED',
});
export class ExternalWorldBookError extends Error {
    constructor(code, message, details = undefined, options = undefined) {
        super(String(message || code), options);
        this.name = 'ExternalWorldBookError';
        this.code = String(code || EXTERNAL_WORLD_BOOK_ERROR_CODES.SCHEMA_UNSUPPORTED);
        if (details !== undefined)
            this.details = details;
    }
}
export function isExternalWorldBookError(error, code = '') {
    return error instanceof ExternalWorldBookError && (!code || error.code === code);
}
const BATCH_PLAN_MESSAGES = Object.freeze({
    BATCH_PLAN_INPUT_INVALID: __rmT("n0sdRbR5MQCKlteWZoCGuiWZZ2mrrk"),
    BATCH_PLAN_IDENTITY_INVALID: __rmT("o1Nd2b_jo3j__keSrssRtrvHUYRpMnS9HwyeISZGpSiCuljdYS3FCj5X"),
    BATCH_PLAN_DUPLICATE_ID: __rmT("M3mID2u3uEAzRoFjZz4fRLlCiGE.tlooS2C6qmKq"),
    BATCH_PLAN_COMBO_INVALID: __rmT("Ou6NnAlcfp9sTVZlUy1bHM5.a2lB3uazkc1R6ntk_cN.bh"),
    BATCH_PLAN_INVALID: __rmT("4ugplD0xaYMjbARJeZvd2ff7sHmZRilOFVVpW2je6Wvgiw9dq8_"),
    BATCH_PLAN_ID_INVALID: __rmT("EgDxelkHxvDTbuVsVoVY6IEI"),
    BATCH_PLAN_FACE_COUNT_INVALID: __rmT("7k4nt7O2uEq3TpOOKiLH4f08pVNST_oQW8h84bKq"),
    BATCH_PLAN_FACE_INVALID: __rmT("925yKNZQJnzN1xW0M8mZxmfBlLzAB1I6Y.LCj5Np6j7NVnhjS7eeWl6I1K08fRnj1kCWJ_vHQ4Oth3.odYKx5ywPyhVcmDPAbc0UOmA5j2j5Qo_z"),
    BATCH_PLAN_FAIRNESS_INVALID: __rmT("vovw8rdGWlk6De7eSmYC87BZ829y5EoQUFDDIbKq"),
    PURE_ORDER_FORM: __rmT("79x7lnHKW0pN6b06s6AC451dsfjcNfYgCCnpYnx7wKtYvzQX"),
    PURE_ORDER_EMPTY: __rmT("ERcgtco2h0ETPT3U5zcvERXhiH5dBzu7KnLspf"),
    BATCH_PLAN_TOO_LARGE: __rmT("mKJ0X1eIsyWErR3KbZuzFYGfGBhK8HJ_UBS_rwKq"),
    BATCH_SETTINGS_TOO_LARGE: __rmT("egkXpUOc__bSRMfAqeI6dWYu7LI.I2Reon6Xezcgdnq9mZQX"),
    BATCH_CANDIDATE_POOL_EXHAUSTED: __rmT("xrBX9o6ZgEYdpfdnvBIEHA7UbOLs7pzDTfRvXMjjIGWTWFEbvH5aCocyqawXKeo6WUE"),
    BATCH_SELECTION_INCOMPLETE: __rmT("y2jG487Hw.72aATQJGaDeka4Djy4QKrnHzN12myqLiWqszQX"),
    LOTTERY_WORLD_BOOK_EMPTY: __rmT("JlK4K9pUQRYPr9rjcEkxzwtZOqUEobEvJeONW4iNJ0BZJZP_mDO6T7TS6KHNKWrKaMX6iKfLHxcWQQbWHOSTQe6.mC6ezk.Al6pRqAw9"),
    FACE_DRAW_EMPTY: __rmT("LXPgDySrbLioqXJr7T5V7UYkzqWJ8xhNvZrr08YMXNS7lfEksZlV6yha0KMNgYT2uOjF1kbIcH0vkP968qvQARdeqi2lwP0i1mnaPKiIYWE5Z7kDBJT"),
    FACE_DRAW_REQUIRED_UNAVAILABLE: __rmT("3oEIAluf5KpH1BbX_JjXAm7d_NGuSduj4zGw3hyY26Y50eAikSwrH91yD3DyDx46x_tcThkDqkWFGIU1pduKE9pzQxAYkLsr62Zr.h0xV1qsPi_z"),
    FACE_DRAW_SELECTION_TOO_LARGE: __rmT("bLhSfO1K1fsWqC5nfbbnAXff8GBjVurZmAHYvR2mO2bWcUqpGRRbMd.B8DCag9tsq_dUQ9OHMWUiYawF4J5jsRPtCxAX7ZCBANA"),
    FACE_DRAW_POOL_EXHAUSTED: __rmT("SixZuzy6Xit3eapNcJEdlzQkgS_jeaA7lkLwIMPUi1KKMp0hkADzIfbr5JRZcTANP5Wu.1qjlxFmWAQ6dXfEhTh.7zbOwSgfz0guCuoIjMiM7HOpp03RPk1L8ik"),
    FACE_DRAW_CURSOR_UNAVAILABLE: __rmT("3dvntwTREv_cLYdFHQDC7PZiKT2MUWPTM6xajyDzftB3g7yKb7_tAT40WyooUiJHq1BbKZ_RQ5JkGb_DkJHMNcd9WAT"),
    BATCH_RESAY_FACE_MISSING: __rmT("6uYjWS0erFKjiV5GwYALR4xbcLcbbtqMqG4r7mVk3tHQtgOW.MpCiZupgCbziSkC"),
    BATCH_RESAY_RECIPE_INCOMPLETE: __rmT("YLvna545zmD.PbrbXB8Ssnh0N2EdVHe.WKLZUHPQIt6RjZDzYRcXM61uwd9RckK4WvMbE0FdY3Y"),
    BATCH_RESAY_CUSTOM_RECIPE: __rmT("WDmV88sTue_TyjClAh8h6Sxx68u6BEjtp7ioLKKp_bODlTPWvqbIDLeBSW17FdJMUbZWD4gnZ8blIJQLYZvsDqBY2BsOh0YO"),
    BATCH_RESAY_ENTRY_UNAVAILABLE: __rmT("F.cBJt.LZo6T6uuofecJJ_5Hrt_utjSZo0dqwC0E9adK.peRX734bLwclZ449e615adcO8zlhRrU4.ZjVy2JXUZWbrQUAgk8rPlbXan8TVVhtKHCeIF4BmFGI4Pku_MaNRGiAam8tB_DrVIDRIQy4a.6hABJM4iBf7Bx_T"),
    BATCH_PREVIEW_NOT_DISPATCHABLE: __rmT("ALpZSDkHcdMJT4rYqEvT.jmc.glDj5cPGBLz5XP1HM9.bh"),
    BATCH_REGISTRY_UNREADABLE: __rmT("icF4PI6AhsYg4zvqw60foQKylXV7P_y1NGmWgqb1YPD53xkvkOqPwZvUAFLt1jXVWUE"),
    BATCH_ID_CONFLICT: __rmT("rbRr1zBTPBGp9Gjk63RP1xyjxZlOFOqYFEzrFbdUgG8"),
    BATCH_REGISTRY_CAPACITY: __rmT("fEQLPo.YusyM.RoAD7LzARgPQKjRciKxI6B9wy.74Lg0DBvvyzvatrp6w6SzM5Wfn7IkuIKor_ZlYHItOwaCb0OFrQt_YUk5oYfndFL2mxnnVixipjJrdw66F8kpMAHaMCTCfjqpaeyzZh"),
    BATCH_REGISTRY_TOO_LARGE: __rmT("vo5xylims.UpruULhKAc8nY8b9uoDw9eUBS_rwKq"),
    BATCH_STORAGE_UNAVAILABLE: __rmT("LE9ya6YG0P6CEQgaTo7kvWUAa_PUFqTlPyHE6KztgG8"),
    BATCH_FAIRNESS_STATE_INVALID: __rmT("4uJNMJ2EsjEI7Pi45s4HGSt6JTvp455ABtcnf1grWLMeH5Iyq8_"),
    BATCH_FAIRNESS_PLAN_MISMATCH: __rmT("ouMA0GkHcdMQTpyziyfK9d0RGPToiHazkc1R6nwNYPi.bh"),
    BATCH_ATTEMPT_ALREADY_RECORDED: __rmT("BHAKQ4U9D.xhN.g5Vag8JhdlqTIJwQh2rsGsHY9BPtIKDaorb5JLIoVoV389uT"),
    BATCH_STORAGE_CHANGED: __rmT("RQaTrwduMvaA6mpUc6.BfDakVLkXQaeEhORwYuLjS4a.szQX"),
    BATCH_STORAGE_WRITE_FAILED: __rmT("klKdIcO5WArbMnyq.oUko34bie6rrk"),
    BATCH_STORAGE_READBACK_MISMATCH: __rmT("vo5xyrdGRyhtqrc2BbPhyah0WD2Bx_oQW8h84bKq"),
    BATCH_STORAGE_QUOTA_EXCEEDED: __rmT("heDFx35ndwbg97UtIDVexY4.pQzuur6qwngnHkg4szIuyig3Q3X7Bilx3HeuQa.2skqTGCIWY3Y"),
});
export function describeBatchPlanFailure(reasonCode) {
    const code = typeof reasonCode === 'string' && Object.hasOwn(BATCH_PLAN_MESSAGES, reasonCode)
        ? reasonCode : 'BATCH_PLAN_INVALID';
    return Object.freeze({ code, message: BATCH_PLAN_MESSAGES[code] });
}
const PREFLIGHT_MESSAGES = Object.freeze({
    MULTIFACE_PLAN_UNAVAILABLE: __rmT("P_c0UWKPm3_9l_yzFMtxelWemanNJR5wgXM7k9nLvf0gKybx__PVPqlMzsfVGz5FMEBzp4DWv.RCW1Wz7CLOp7kJG74uiy6hYOxytLaF2qnwK5f3WGT0if"),
    RABBIT_MIRROR_DISPATCH_LEASE_REJECTED: __rmT("3CrOgn8je2u4eqecBjQ1XGB942kSW7DimqBXiImLmO6xN9Jd.NPWwCmtbcIgKDTKIQfgg.AuvKCSlA.EnS7vRAVIhIqCE_lBvscehyP4K8BEMjmkMufslI92g5pEZf"),
    RABBIT_MIRROR_EXTERNAL_PREFETCH_STALE: __rmT("S.l6oh6YSTc0tSqp1sVtx8owwuSPvayI7B6r6ov7zN2tvi4.Nk564ETKj3DfnDaGN_IvWYf3JrNMYJGsZ9vi6BWrknJqEUfTANA"),
    RABBIT_MIRROR_EXTERNAL_METADATA_REBUILD_REQUIRED: __rmT("rWKPsxo.0RlBwiuRQNrEt2uNRReHMXL0WWK1ozArvDL0SPsiWNiuDvjLUlcVQycVPWJrgIwhkXWzsIjJqAk"),
    RABBIT_MIRROR_EXTERNAL_MATERIAL_MISSING: __rmT("K.4m_7TheuqrzE6CXVnKxtwJOXCFFuaB_BwL1H46Ff9iq_qT5zAjICXoV.pwC5GdMOIwAWmzi01.g_nQSxlFrh"),
    RABBIT_MIRROR_EXTERNAL_MATERIAL_INVALID: __rmT("K.4m_7TheuqrzE6CXVnuXYwaNhktFonYSpMPVkwWHKTd5u0UZIjcq9YX_hnkWbCeT.Y26dbztZp7QzBl3iAFrh"),
    WORLD_BOOK_NOT_FOUND: __rmT("8USbTTWWdKFmSzI5f9_FquhbgBdF.83e7mb4PSqR4cMSnSm6fnrjZuE3JMz88k.M7vURewitY3Y"),
    WORLD_BOOK_ENTRY_STATE_CONFLICT: __rmT("XUnxLU_vplGPj7TslIHP4vdQtdb0MjW8YO2iXC80j1bapsO17PeADg2R_S8766whKvO14XgauTYobh"),
    WORLD_BOOK_ENTRY_CONTENT_INVALID: __rmT("VGWxzh6DGRR1Dr5JRpjS_R9uWnGeG6S1ntwMFO1CHRX8cMNxkRYbBuyoYpd1z4nH6YmT25SKQb7JtlH9"),
    WORLD_BOOK_STORAGE_UNAVAILABLE: __rmT("RPBrl9FDhZpjJPmeeHg3mwfBYd0G_1I6xnj3Y2S77P6Y_s2kN3.Y9k0zzFb8dJPDX_SesY6zB4hdSIo0KD_QqQ2OsSSXFsYByadTCdTTYAy9ny_z"),
    WORLD_BOOK_STORAGE_QUOTA: __rmT("heDFx35ndwbg97UtIDVexY4.pQzuu1_8wngnHkg4szk0dFwaGSJkWFsGvGiFxXHM8ZqMw397Y3Y"),
    WORLD_BOOK_STORAGE_WRITE_FAILED: __rmT("Q_J8ic5_EF4AlWUXkMNYh9Kz.0gqBICQZZ7gWRqvJgo82VzzOLfN7c7h8oOGkbmk4zqlx.veoU0NdA18bfDGPVCpaNYcxf"),
    WORLD_BOOK_READ_FAILED: __rmT("wZ2.2pr3O0dOBTvsywgNjXQb6xdANTEF.db1DOdr34myjxRFhH7pEKbXVE19UzmP.IbQmuGP"),
});
export function describeExternalWorldBookPreflightFailure(error) {
    const candidate = typeof error?.code === 'string' ? error.code : '';
    const code = Object.hasOwn(PREFLIGHT_MESSAGES, candidate) ? candidate : 'RABBIT_MIRROR_EXTERNAL_PREFLIGHT_UNKNOWN';
    if (code === 'MULTIFACE_PLAN_UNAVAILABLE' && typeof error?.reasonCode === 'string') {
        const reason = describeBatchPlanFailure(error.reasonCode);
        const face = Number.isSafeInteger(error?.faceIndex) && error.faceIndex >= 0 && error.faceIndex < 5 ? `${__rmT("BJgCyT")}${error.faceIndex + 1}${__rmT("qGyf7aop")}` : '';
        return Object.freeze({ code, reasonCode: reason.code,
            message: `${__rmT("N_QfabBKKz6Y50Ho3RzR08U7eAAP045e3df")}${face}${reason.message}${__rmT("4bFTcylPSleaRb5D")}${reason.code}${__rmT("F6EB8RdpS0yVgEHuQon3loDIO8BDteduTJL4amKq")}` });
    }
    return Object.freeze({ code, message: PREFLIGHT_MESSAGES[code] || __rmT("IS665nyK6oAhB6.i1NYr0783AfTtFZCNXJikKwPWk9V43Q_ODcdvHU91aW_L5vFkIxN3.elseNE40Df1bvxMjaGu") });
}
