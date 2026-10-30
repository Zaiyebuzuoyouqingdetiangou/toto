import { rmT as __rmT } from "./textTable.js?rmv=2.1.5";
import { clearLastCombo } from './storage.js?rmv=2.1.5';
import { slimMirrorImagesForQuota, resetMirrorImageSlimFlag, clearAllMirrorImagePrompts, measureAllMirrorImagePromptCleanup, dropMirrorImageCopiesSavedInChat } from './imageStore.js?rmv=2.1.5';
import { compactFaceSwipeStoreForQuota, faceSwipeCleanupStats, prepareFaceSwipeArchiveCleanup } from './swipeVersions.js?rmv=2.1.5';
const storage = () => { try {
    return globalThis.localStorage || null;
}
catch {
    return null;
} };
function keys() {
    const store = storage();
    const out = [];
    if (!store)
        return out;
    try {
        for (let index = 0; index < store.length; index += 1) {
            const key = store.key(index);
            if (key != null)
                out.push(String(key));
        }
    }
    catch { }
    return out;
}
function sizeOf(predicate) {
    const store = storage();
    let bytes = 0;
    for (const key of keys())
        if (predicate(key)) {
            try {
                bytes += (key.length + String(store.getItem(key) || '').length) * 2;
            }
            catch { }
        }
    return bytes;
}
function removeWhere(predicate) {
    const store = storage();
    for (const key of keys())
        if (predicate(key)) {
            try {
                store.removeItem(key);
            }
            catch { }
        }
}
const exact = (...names) => key => names.includes(key);
const LEGACY = key => /^rabbit_mirror_theater:(?:last_combo|pending_combo):v\d+$/.test(key) && !/:v11$/.test(key);
const COVERED = exact('rabbit_mirror_independent_outputs_v1', 'rabbit_mirror_independent_history_v1', 'rabbit_mirror_face_swipes_v1');
const HISTORY = key => /^rabbit_mirror_theater:(?:last_combo|pending_combo):v11$/.test(key)
    || ['rabbit_mirror_theater:generation_attempts:v1',
        'rabbit_mirror_theater:directive_pick_cache:v1', 'rabbit_mirror_theater:format_eligible_misses:v1'].includes(key);
export const STORAGE_CLEANUP_CATEGORIES = Object.freeze([
    {
        id: 'covered', safe: true, label: __rmT(".mhF4xp9pEscyBMNxSn1OiehvUtK.u0KftT"),
        note: __rmT("TsB3HLDQ5N.C0..a_t6GcUZAX8jRaKmtbX3mCvlWHv9crelcI_xBv_kmfL2.5Ip.n6cSL87bYr.6IufPu4xqnfQXdSIuBukHbmEudDl8RA9hCNMRslVuvDFZD9eSYwavhkUy2TitJ0S4fxVrP7U9_jsNwFtwtDu6eezfHocv6I0pChWa0mKNAB4R17E"),
        measure: () => sizeOf(COVERED),
        detail: () => {
            let stats = null;
            try {
                stats = globalThis.__rabbitMirrorCoveredStorageStats?.();
            }
            catch {
                stats = null;
            }
            const swipe = faceSwipeCleanupStats();
            stats ||= { freeable: 0, unconfirmed: 0 };
            const parts = [`${__rmT("Unksur3o4XC78lOVgPD")}${formatCleanupBytes(stats.freeable + swipe.freeable)}${__rmT("Vc5qDBcE3ldPNeyU3TNnevNcC1Uy_bX4c4rqqh")}`];
            const each = [[__rmT("VeMsVAjdq8p"), 'rabbit_mirror_independent_outputs_v1'], [__rmT("5FhEAc1koHf"), 'rabbit_mirror_independent_history_v1'], [__rmT("PZTIK5.0yQpNGf"), 'rabbit_mirror_face_swipes_v1']]
                .map(([label, key]) => `${label} ${formatCleanupBytes(sizeOf(exact(key)))}`).join(__rmT("jvk"));
            parts.push(`${__rmT("yG0H3f")}${each}`);
            if (stats.otherChats)
                parts.push(`${stats.otherChatCount}${__rmT("fiXSWpbTmN41sQdkDD6dHT")}${formatCleanupBytes(stats.otherChats)}${__rmT("UdqcisK1TVSXxd4hTfTsUrjy3dk")}`);
            if (stats.unconfirmed + swipe.unconfirmed)
                parts.push(`${__rmT("IEs8JprNf1L0y7JRfXGQnajTy9qCJk")}${formatCleanupBytes(stats.unconfirmed + swipe.unconfirmed)}${__rmT("Qfrqp2G8EwLalomD")}`);
            return parts.join(__rmT("7os"));
        },
        run: () => {
            try {
                globalThis.__rabbitMirrorCompactCoveredOutputsForQuota?.(0);
            }
            catch { }
            try {
                globalThis.__rabbitMirrorTrimHistoryForQuota?.();
            }
            catch { }
            try {
                compactFaceSwipeStoreForQuota([0]);
            }
            catch { }
        },
    },
    {
        id: 'image-prompts', safe: true, label: __rmT("OFGCeMjYMViKMNRrPiZgvmw6sF86norBAWSmRiwqWpRSxf"),
        note: __rmT("GbRPywUmEOpEKqz5fmVMx5_sZm4nrHn.Ne_R3uP4nEpo3mXs85nls1nHae9B5WFH5muPj9I0NjlqfI.EdB3pNlwQVjRhXSMi25KAoGu0diSxnhxtZB5uz0.fwdiUswl7k1tWt61bq1kLx0bkMvnIpQmcBRzO4xVyYF73ObbP9BmXgPhwcKoSKQoj_gQWcE5j1PVTMOwUHq1B6lgq14h8xKoRxmFx2RXdrZ5rjxzzsdB"),
        measure: () => sizeOf(key => key.startsWith('rabbitMirror:image:v1:images:')),
        detail: () => {
            const store = storage();
            let dataOnly = 0, prompts = 0, count = 0, current = 0;
            for (const key of keys()) {
                if (!key.startsWith('rabbitMirror:image:v1:images:'))
                    continue;
                let raw = '';
                try {
                    raw = String(store.getItem(key) || '');
                }
                catch {
                    continue;
                }
                const images = raw.match(/"data:image\/[^"]*"/g) || [];
                dataOnly += images.reduce((sum, text) => sum + text.length * 2, 0);
                let value = null;
                try {
                    value = JSON.parse(raw);
                }
                catch {
                    value = null;
                }
                count += 1;
                current += JSON.stringify(value?.current?.promptMetadata || {}).length * 2 + String(value?.current?.prompt || '').length * 2;
                for (const entry of Array.isArray(value?.history) ? value.history : [])
                    if (!entry?.slimmed)
                        prompts += JSON.stringify(entry?.promptMetadata || {}).length * 2 + String(entry?.prompt || '').length * 2;
            }
            let saved = 0;
            try {
                saved = dropMirrorImageCopiesSavedInChat({ dryRun: true, urgent: true });
            }
            catch {
                saved = 0;
            }
            return `${saved ? `${__rmT("I9NjYaES6Leg18NY9KGRWiPfZ21Bez7iAWSws7b5kpZtnh")}${formatCleanupBytes(saved)}${__rmT("QfVyJoE.RsZbWtqD")}` : ''}${__rmT("BxJkPAu6F6F56bG4ASxsnWPkjFs")}${formatCleanupBytes(prompts)}${dataOnly ? `${__rmT("CtPOC0.ZOND0xKPTLejze7YqoCQ0M0AP")}${formatCleanupBytes(dataOnly)}${__rmT("NOIaOp4VAUSI06ajhF6tLk")}` : ''}${__rmT("Fjv4hec6")}${count}${__rmT("kbejsbEuRYPinJv8_6nJPy6fPnmGR7tXLcAhwjm9mdDGZbOnm2_")}${formatCleanupBytes(current)}`;
        },
        run: () => {
            try {
                dropMirrorImageCopiesSavedInChat({ urgent: true });
            }
            catch { }
            try {
                resetMirrorImageSlimFlag();
                slimMirrorImagesForQuota();
            }
            catch { }
        },
    },
    {
        id: 'all-image-prompts', safe: false, label: __rmT("y_IsR2YwFp0k.G5VxywVyVH92V_B8QmB.y3sxUZ8QYp"),
        note: __rmT("fsvY1RiwkmCsSwiFj3gpGFmVanVGWiWbZAGVUqtVcrRicT0WqeBTtCcqUUMeoj.nlLH11k1OIh2GAu6xcfNBv63suDcCZHL_1TxmrafT2Y4qNz7fksUdkx3ICsx1ka0xWQ2LXjrH1FT"),
        measure: () => measureAllMirrorImagePromptCleanup(),
        run: () => clearAllMirrorImagePrompts(),
    },
    {
        id: 'samples', safe: true, label: __rmT("lS9WvSIEpMnQif"),
        note: __rmT("1NTr4PJw43agT9AC1cstotafCdaY4CjAwT902DMf7mWfaSQX"),
        measure: () => sizeOf(exact('rabbit_mirror_repair_samples:v1')),
        run: () => {
            removeWhere(exact('rabbit_mirror_repair_samples:v1'));
            try {
                globalThis.dispatchEvent?.(new CustomEvent('rabbitmirror:repair-samples', { detail: { count: 0 } }));
            }
            catch { }
        },
    },
    {
        id: 'diagnostics', safe: true, label: __rmT("glX1qXebN1WBMZZp9l6wGA50gVS73T"),
        note: __rmT("UF.XE16jx7DsnNiXHKw_y7EI"),
        measure: () => sizeOf(exact('rabbit_mirror_independent_api_last_request_v2')),
        run: () => removeWhere(exact('rabbit_mirror_independent_api_last_request_v2')),
    },
    {
        id: 'legacy', safe: true, label: __rmT("OBPkGp4VDJyrt0ZwRWinXk"),
        note: __rmT("syCgkQYlDgsMGgY_V2OtlPXaUwjsvE1Qk0MTTUuJgG8"),
        measure: () => sizeOf(LEGACY),
        run: () => removeWhere(LEGACY),
    },
    {
        id: 'prompt-meter', safe: true, label: __rmT("1sf0TD.LGso7QE8A.Ltpt6gi9kELVGbBOxBHLh"),
        note: __rmT("UF.XE16jx7DsnNiXHKw6v7EI"),
        measure: () => sizeOf(key => key.startsWith('rabbit_mirror_theater:token_meter')),
        run: () => removeWhere(key => key.startsWith('rabbit_mirror_theater:token_meter')),
    },
    {
        id: 'history', safe: false, label: __rmT("KQjrYrc1pQ3xaa2pgqzqkDDFsp3c1AOA"),
        note: __rmT("HJXV2PotwecbpyBjPI.GRfUUxT0XU3PRie.ITJYz2aNgaMChgJL46HCp7RPksawsoxSg0Cpj3cZLf4qfginHHXgSmtAull5oD9LQooHLpkYdPbNJ0OpZjVYZREz8QFk9I17ESVAc"),
        measure: () => sizeOf(HISTORY),
        run: () => { try {
            clearLastCombo();
        }
        catch {
            removeWhere(HISTORY);
        } },
    },
    {
        id: 'recipes', safe: false, label: __rmT("2.XC.fD.xgn5z6qHRWinXk"),
        note: __rmT("qbIP9dEcUMtH3VBVSUW962YnTiKDkDox1RbBNBnypHtVo3xoIuqggHuBS41cmGsEYU4ffb2jZOuxUOaX2QtjlOoarba.gufEhMZEkH1lVaexFF65xVFWJK.iyhJrD2nUtySQu8NSrjohsrXWM2n674rgr9hQ.cVEAFwyL62QRosShqRw"),
        measure: () => sizeOf(exact('rabbit_mirror_theater:selection_recipes:v1')),
        run: () => removeWhere(exact('rabbit_mirror_theater:selection_recipes:v1')),
    },
    {
        id: 'follow-partial', safe: false, label: __rmT("svjuxGuM5W_cyT7m9lFkG4mfnMcBnT"),
        note: __rmT("9lDTtcu4f5kvyqP.RO7KyPmKHZ7bgNLlGrxn70_9AZbh8QooBUvHwc7_1FDXtBe8QwrBc815ZhiKHknWJkLXJRQUw8EO_V3b969ODe_Owi0gHvzAtY.Wj5PwSIalO10djbl.O6UVHqTX8USVLgfMKn0q3Nm2LAs0"),
        measure: () => sizeOf(exact('rabbit_mirror_follow_partial_results_v1')),
        run: () => removeWhere(exact('rabbit_mirror_follow_partial_results_v1')),
    },
]);
const RABBIT_KEY = key => /^rabbit_?mirror/i.test(key);
export function rabbitMirrorLocalBytes() { return sizeOf(RABBIT_KEY); }
export function formatCleanupBytes(bytes) {
    const value = Math.max(0, Number(bytes) || 0);
    return value >= 1024 * 1024 ? `${(value / 1024 / 1024).toFixed(1)}MB` : `${Math.round(value / 1024)}KB`;
}
export function measureStorageCleanup() {
    return STORAGE_CLEANUP_CATEGORIES.map(category => {
        let detail = '';
        try {
            detail = typeof category.detail === 'function' ? category.detail() : '';
        }
        catch {
            detail = '';
        }
        return { id: category.id, label: category.label, note: category.note, safe: category.safe, bytes: category.measure(), detail };
    });
}
export function runStorageCleanup(ids = []) {
    const chosen = new Set(Array.isArray(ids) ? ids : []);
    const before = rabbitMirrorLocalBytes();
    let failed = 0;
    for (const category of STORAGE_CLEANUP_CATEGORIES)
        if (chosen.has(category.id)) {
            try {
                failed += Number(category.run()?.failed || 0);
            }
            catch {
                failed += 1;
            }
        }
    const after = rabbitMirrorLocalBytes();
    return { before, after, freed: Math.max(0, before - after), failed };
}
export async function prepareStorageCleanup(ids = []) {
    if (!Array.isArray(ids) || !ids.includes('covered'))
        return { checked: 0, available: true };
    try {
        await import('./independentApi/persistence.js?rmv=2.1.5');
    }
    catch { }
    const slots = new Set();
    const add = key => { const match = /^(.+:\d+:\d+):[0-9a-z]+$/.exec(key); if (match)
        slots.add(match[1]); };
    try {
        for (const key of Object.keys(JSON.parse(storage()?.getItem('rabbit_mirror_independent_outputs_v1') || '{}')))
            add(key);
    }
    catch { }
    try {
        for (const key of Object.keys(JSON.parse(storage()?.getItem('rabbit_mirror_independent_history_v1') || '{}')?.slots || {}))
            add(key);
    }
    catch { }
    return prepareFaceSwipeArchiveCleanup([...slots]);
}
