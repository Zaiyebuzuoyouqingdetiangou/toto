// 清理兔子镜在本机（浏览器存储）里的东西。
// 默认只清「另有可靠副本」或「只是缓存」的：已存进聊天的镜面缓存和旧版本、待修样本、诊断记录、旧版本遗留键、插图旧版本里的长提示词。
// 只在本机、清了就没有的（避重与抽签历史、本轮抽签记录、用量统计）要自己勾选。
// 收藏夹、设置、外观、母本库、世界书、API 配置一律不碰。
import { clearLastCombo } from './storage.js?rmv=1.82.5';
import { slimMirrorImagesForQuota, resetMirrorImageSlimFlag } from './imageStore.js?rmv=1.82.5';
import { compactFaceSwipeStoreForQuota } from './swipeVersions.js?rmv=1.82.5';

const storage = () => { try { return globalThis.localStorage || null; } catch { return null; } };

function keys() {
    const store = storage();
    const out = [];
    if (!store) return out;
    try { for (let index = 0; index < store.length; index += 1) { const key = store.key(index); if (key != null) out.push(String(key)); } } catch { /* 读不到就当空 */ }
    return out;
}

function sizeOf(predicate) {
    const store = storage();
    let bytes = 0;
    for (const key of keys()) if (predicate(key)) { try { bytes += (key.length + String(store.getItem(key) || '').length) * 2; } catch { /* 跳过 */ } }
    return bytes;
}

function removeWhere(predicate) {
    const store = storage();
    for (const key of keys()) if (predicate(key)) { try { store.removeItem(key); } catch { /* 跳过 */ } }
}

const exact = (...names) => key => names.includes(key);
// 正在用的预约表（pending_batch:v1、pending_batch_registry:v2/v3）不算遗留。
const LEGACY = key => /^rabbit_mirror_theater:(?:last_combo|pending_combo):v\d+$/.test(key) && !/:v11$/.test(key);
const COVERED = exact('rabbit_mirror_independent_outputs_v1', 'rabbit_mirror_independent_history_v1', 'rabbit_mirror_face_swipes_v1');
const HISTORY = key => /^rabbit_mirror_theater:(?:last_combo|pending_combo):v11$/.test(key)
    || ['rabbit_mirror_theater:generation_attempts:v1',
        'rabbit_mirror_theater:directive_pick_cache:v1', 'rabbit_mirror_theater:format_eligible_misses:v1'].includes(key);

export const STORAGE_CLEANUP_CATEGORIES = Object.freeze([
    {
        id: 'covered', safe: true, label: '已存进聊天的镜面缓存和旧版本',
        note: '只删已经确认另有副本（聊天文件或浏览器版本存档）的那些，每个位置最新那份留着；还没确认的不动。别的聊天的多数要打开那个聊天再点一次。下次重说时多版本切换会再占回一点。',
        measure: () => sizeOf(COVERED),
        // 说清这里面能清的有多少、多少属于别的聊天：别的聊天的要打开那个聊天才能确认已存好。
        detail: () => {
            let stats = null;
            try { stats = globalThis.__rabbitMirrorCoveredStorageStats?.(); } catch { stats = null; }
            if (!stats) return '';
            const parts = [`这个聊天能清约 ${formatCleanupBytes(stats.freeable)}`];
            // 三个存档各占多少，方便看大头在哪。
            const each = [['镜面缓存', 'rabbit_mirror_independent_outputs_v1'], ['历史备份', 'rabbit_mirror_independent_history_v1'], ['多版本切换', 'rabbit_mirror_face_swipes_v1']]
                .map(([label, key]) => `${label} ${formatCleanupBytes(sizeOf(exact(key)))}`).join('、');
            parts.push(`其中${each}`);
            if (stats.otherChats) parts.push(`${stats.otherChatCount} 个别的聊天约 ${formatCleanupBytes(stats.otherChats)}（打开那个聊天再点）`);
            if (stats.unconfirmed) parts.push(`还没确认存进聊天的约 ${formatCleanupBytes(stats.unconfirmed)}（不清）`);
            return parts.join('；');
        },
        run: () => {
            try { globalThis.__rabbitMirrorCompactCoveredOutputsForQuota?.(0); } catch { /* 跳过 */ }
            try { globalThis.__rabbitMirrorTrimHistoryForQuota?.(); } catch { /* 跳过 */ }
            try { compactFaceSwipeStoreForQuota([1]); } catch { /* 跳过 */ }
        },
    },
    {
        id: 'image-prompts', safe: true, label: '插图旧版本里的长提示词',
        note: '每张图的地址、时间都留着，图一张不删；只是翻回旧版本重画时要重新准备提示词。',
        measure: () => sizeOf(key => key.startsWith('rabbitMirror:image:v1:images:')),
        // 只存在本机的整张图（data: 开头，没有文件地址）不能瘦，说清占了多少。
        detail: () => {
            const store = storage();
            let dataOnly = 0, prompts = 0, count = 0, current = 0;
            for (const key of keys()) {
                if (!key.startsWith('rabbitMirror:image:v1:images:')) continue;
                let raw = ''; try { raw = String(store.getItem(key) || ''); } catch { continue; }
                const images = raw.match(/"data:image\/[^"]*"/g) || [];
                dataOnly += images.reduce((sum, text) => sum + text.length * 2, 0);
                let value = null; try { value = JSON.parse(raw); } catch { value = null; }
                count += 1;
                current += JSON.stringify(value?.current?.promptMetadata || {}).length * 2 + String(value?.current?.prompt || '').length * 2;
                for (const entry of Array.isArray(value?.history) ? value.history : []) if (!entry?.slimmed) prompts += JSON.stringify(entry?.promptMetadata || {}).length * 2 + String(entry?.prompt || '').length * 2;
            }
            return `能瘦掉的旧提示词约 ${formatCleanupBytes(prompts)}${dataOnly ? `；只存在本机的整张图约 ${formatCleanupBytes(dataOnly)}（图本身，不清）` : ''}；共 ${count} 份插图存档，其中当前那张的提示词约 ${formatCleanupBytes(current)}`;
        },
        run: () => { try { resetMirrorImageSlimFlag(); slimMirrorImagesForQuota(); } catch { /* 跳过 */ } },
    },
    {
        id: 'samples', safe: true, label: '待修样本箱',
        note: '维修兔攒给作者看的样本，不影响使用。',
        measure: () => sizeOf(exact('rabbit_mirror_repair_samples:v1')),
        run: () => {
            removeWhere(exact('rabbit_mirror_repair_samples:v1'));
            // 和样本箱自己的「清空」一样通知一下，导出按钮上的面数跟着归零。
            try { globalThis.dispatchEvent?.(new CustomEvent('rabbitmirror:repair-samples', { detail: { count: 0 } })); } catch { /* 跳过 */ }
        },
    },
    {
        id: 'diagnostics', safe: true, label: '最近一次请求的诊断记录',
        note: '下次生成会重新记。',
        measure: () => sizeOf(exact('rabbit_mirror_independent_api_last_request_v2')),
        run: () => removeWhere(exact('rabbit_mirror_independent_api_last_request_v2')),
    },
    {
        id: 'legacy', safe: true, label: '旧版本留下的记录',
        note: '以前版本用过、现在已经不读的键。',
        measure: () => sizeOf(LEGACY),
        run: () => removeWhere(LEGACY),
    },
    {
        id: 'prompt-meter', safe: true, label: '最近一次 Prompt 估算',
        note: '下次生成会重新算。',
        measure: () => sizeOf(key => key.startsWith('rabbit_mirror_theater:token_meter')),
        run: () => removeWhere(key => key.startsWith('rabbit_mirror_theater:token_meter')),
    },
    {
        id: 'history', safe: false, label: '避重与抽签历史、冷却记录',
        note: '只在本机。清掉后别的聊天的避重记录就没了；当前聊天里保存的兔子镜还会被扫进近期记录。正在生成时不要清。',
        measure: () => sizeOf(HISTORY),
        run: () => { try { clearLastCombo(); } catch { removeWhere(HISTORY); } },
    },
    {
        id: 'recipes', safe: false, label: '「本轮抽签」记录',
        note: '只在本机。副 API 生成的面还能从聊天存档里读出抽签；跟随正文的面清掉后会显示「没有留下当时抽中的」。',
        measure: () => sizeOf(exact('rabbit_mirror_theater:selection_recipes:v1')),
        run: () => removeWhere(exact('rabbit_mirror_theater:selection_recipes:v1')),
    },
    {
        id: 'follow-partial', safe: false, label: '跟随正文多面的补回结果',
        note: '只在本机。跟随正文多面里先出好的面、重试补回的面存在这里；清掉后这些面会显示回原来缺面或失败的样子。',
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

/** 当前各类占用（字节）。 */
export function measureStorageCleanup() {
    return STORAGE_CLEANUP_CATEGORIES.map(category => {
        let detail = '';
        try { detail = typeof category.detail === 'function' ? category.detail() : ''; } catch { detail = ''; }
        return { id: category.id, label: category.label, note: category.note, safe: category.safe, bytes: category.measure(), detail };
    });
}

/** 清理选中的几类；返回腾出的字节数（按兔子镜全部本机占用前后相减）。 */
export function runStorageCleanup(ids = []) {
    const chosen = new Set(Array.isArray(ids) ? ids : []);
    const before = rabbitMirrorLocalBytes();
    for (const category of STORAGE_CLEANUP_CATEGORIES) if (chosen.has(category.id)) category.run();
    const after = rabbitMirrorLocalBytes();
    return { before, after, freed: Math.max(0, before - after) };
}
