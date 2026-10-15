// Split from independentApi.js — persistence.

import { presentationModeFields } from '../presentationMode.js?rmv=1.68.62';
import { independentAdvancedOptionsSignature } from '../advancedRequestOptions.js?rmv=1.68.62';
import { refreshRabbitMirrorToolsInScope } from '../outputSanitizer.js?rmv=1.68.62';
import {
    FACE_SWIPE_FULL_MESSAGE,
    FACE_SWIPE_MAX,
    canAppendSwipe,
    selectSwipeIndex,
    deleteCurrentSwipe,
    restoreCurrentSwipeInitial,
    currentSwipeEntry,
    readFaceSwipe,
    mutateFaceSwipe,
    multifaceFacePagerView,
    snapshotFaceSwipes, compactSwipeState, restoreFaceSwipeSnapshot,
    faceSwipeSnapshotStored, loadFaceSwipeArchive, saveFaceSwipeArchive, faceSwipeArchiveReadState,
    remapFaceSwipeSlots, remapFaceSwipeArchive, faceSwipeArchiveRemapSettled,
} from '../swipeVersions.js?rmv=1.68.62';
import { RUNTIME_VERSION, byteLength, getContext, hashText } from './runtime.js?rmv=1.68.62';
import { remapMirrorImageSlots } from '../imageStore.js?rmv=1.68.62';
import {
    clearEphemeralFaceFailure,
    hasEphemeralFaceFailure,
    independentSwipeDetails,
    independentSwipeFaceIndex,
    mergeFaceDetailsIntoHtml,
    independentSwipeSlot,
    seedIndependentFaceSwipesFromIdentity,
    writeIndependentOwnerHtml,
} from './faceSwipe.js?rmv=1.68.62';
import {
    API_PROFILE_STORE_KEY,
    assistantMessages,
    chatKey,
    clearOwnerLockForBase,
    copyIndependentOwnerLineage,
    lockedIndependentRecordForBase,
    messageBaseSlotKey,
    normalizeBase,
    normalizeIndependentConnectionText,
    observeMessageSourceRevision,
    saveRecordForSlot,
    savedRecordMatchesObserved,
    savedIndependentRecordForOwner,
    setOwnerLockForBase,
    swipeId,
    remapOwnerLockSlots,
    hostGenerationLooksActive,
    legacyChatKey,
} from './connection.js?rmv=1.68.62';
import { stampExternalDetailsOwnership, restampExternalHostsAfterMessageDeletion } from './request.js?rmv=1.68.62';
import {
    copyIndependentReplacementReceipt,
    ensureExternalTools,
    extractReadyDetails,
    independentStoredHtmlRestorable,
    interactionStatePollutionScore,
    markExternalDetails,
    normalizeSavedInteractionRecord,
    recoverSavedRecord,
    replaceExternalMultifaceFace,
} from './geometry.js?rmv=1.68.62';
import { clearSavedIndependentOutputNotices, externalFaceDetails, resolveIndependentActionIdentity, scheduleIndependentReadyPostprocess, showMultifaceFace, showIndependentUnsavedOutput, clearIndependentHistorySaveNotice } from './mount.js?rmv=1.68.62';

const STORE_KEY = 'rabbit_mirror_independent_outputs_v1';

export const INTERACTION_STATE_MIGRATION_KEY = 'rabbit_mirror_independent_interaction_state_migration_securityfix2_v2';

export const OWNER_LOCK_STORE_KEY = 'rabbit_mirror_independent_owner_locks_v1';

const HISTORY_STORE_KEY = 'rabbit_mirror_independent_history_v1';

const CHAT_OUTPUT_METADATA_KEY = 'rabbit_mirror_independent_outputs_v2';

const CHAT_OUTPUT_METADATA_SCHEMA = 2;

export const HISTORY_PANEL_ATTR = 'data-rabbit-mirror-history-panel';

// 本机两份缓存的目标大小（成品缓存、旧版本备份）。超过目标的部分只留「还不能确认已进聊天文件」的那些，
// 上限仍是以前的大小：最坏情况和以前一样，不会更占地方。
const OUTPUT_STORE_BUDGET_BYTES = 800000;
const OUTPUT_STORE_CEILING_BYTES = 1600000;

const HISTORY_STORE_BUDGET_BYTES = 500000;
const HISTORY_STORE_CEILING_BYTES = 1750000;

export const INDEPENDENT_HTML_BUDGET_BYTES = 512 * 1024;

export const INDEPENDENT_RECORD_BUDGET_BYTES = 640 * 1024;

export const INDEPENDENT_RAW_MARKUP_BUDGET_CHARS = 768 * 1024;

export const INDEPENDENT_MAX_TAGS = 4200;

export const INDEPENDENT_MAX_APPROX_DEPTH = 72;

export const INDEPENDENT_MAX_ATTRIBUTES = 12000;

export const INDEPENDENT_MAX_CSS_CHARS = 160000;

export const INDEPENDENT_MAX_CSS_RULES = 1400;

export const INDEPENDENT_MAX_DATA_URI_CHARS = 192000;

let storageWarningShown = false;

// Current-chat recovery only. This is not durable storage and must never make
// readStore() report a successful disk write. Weak keys release unloaded chats.
const sessionChatOwners = new WeakMap();

function sessionOwners(ctx,create=false){
 const chat=ctx?.chat;
 if(!Array.isArray(chat)) return null;
 const key=chatKey(ctx);
 let entry=sessionChatOwners.get(chat);
 if(entry?.key!==key){
  if(!create) return null;
  entry={key,owners:{}}; sessionChatOwners.set(chat,entry);
 }
 return entry.owners;
}

export function independentRecordWithinBudget(value){
 if(!value?.html) return false;
 const html=String(value.html||''); const initial=String(value.initialHtml||'');
 return byteLength(html)<=INDEPENDENT_HTML_BUDGET_BYTES
  && byteLength(initial)<=INDEPENDENT_HTML_BUDGET_BYTES
  && byteLength(html)+byteLength(initial)<=INDEPENDENT_RECORD_BUDGET_BYTES;
}

function warnStorageTrimmed(){
 if(storageWarningShown) return;
 storageWarningShown=true;
 console.warn('[RabbitMirror] 本地存储发生容量不足或拒写；当前成品是否保存成功须以读回结果为准。');
}

export function readStore(){ try { const v=JSON.parse(localStorage.getItem(STORE_KEY)||'{}'); return v&&typeof v==='object'?v:{}; } catch { return {}; } }

// 缓存条目的位置：chat:楼层:swipe:正文指纹（chat 里可能带冒号，从右边拆）。
function parseSlotKey(slot){
 const match=/^(.+):(\d+):(\d+):([0-9a-z]+)$/.exec(String(slot||''));
 return match?{chat:match[1],index:Number(match[2]),swipe:Number(match[3]),sourceHash:match[4]}:null;
}

// 聊天数据里这一层（楼层:swipe）记的成品，不看当前 swipe 号，直接按键读；聊天文件里和本会话里的都看，取新的。
function rawOwnerForKey(ctx,index,swipe){
 const key=chatOwnerKey(index,swipe); if(!key) return null;
 const raw=chatMetadataObject(ctx)?.[CHAT_OUTPUT_METADATA_KEY]?.owners?.[key];
 const session=sessionOwners(ctx)?.[key];
 if(raw?.deleted===true || session?.deleted===true) return {deleted:true};
 const newest=session && (!raw || Number(session.ts||0)>=Number(raw.ts||0))?session:raw;
 return newest&&typeof newest==='object'?newest:null;
}

// 一条本机缓存能不能确认「聊天数据里已经有它」：
//   covered     ——当前聊天这一层的成品和它一样（或同一段正文已有更新的成品），或这一层已被删除：删掉本机这份不会丢东西；
//   unconfirmed ——当前聊天，但聊天数据里没有它（可能还没来得及存，或聊天没加载完）：不能删；
//   foreign     ——别的聊天，这里看不到它的聊天数据：只给每个聊天最新的那一条留着，更早的那些聊天早已保存过。
function cacheCoverage(ctx,slot,record){
 const parsed=parseSlotKey(slot);
 if(!parsed || !Array.isArray(ctx?.chat)) return 'foreign';
 let mine=false;
 try{ mine=parsed.chat===chatKey(ctx) || parsed.chat===legacyChatKey(ctx); }catch{ mine=false; }
 if(!mine) return 'foreign';
 const owner=rawOwnerForKey(ctx,parsed.index,parsed.swipe);
 if(!owner) return 'unconfirmed';
 if(owner.deleted) return 'covered';
 if(String(owner.html||'')===String(record?.html||'')) return 'covered';
 if(String(owner.sourceHash||'')===String(record?.sourceHash||parsed.sourceHash) && Number(owner.ts||0)>=Number(record?.ts||0)) return 'covered';
 return 'unconfirmed';
}

// 每个聊天最新的那条缓存（别的聊天只有这一条可能还没进聊天文件）。
function newestPerChat(items){
 const newest=new Map();
 for(const {key,ts} of items){
  const chat=parseSlotKey(key)?.chat||key;
  const current=newest.get(chat);
  if(!current || ts>current.ts) newest.set(chat,{key,ts});
 }
 return newest;
}

function compactOutputStore(value){
 const entries=Object.entries(value&&typeof value==='object'?value:{}).filter(([,item])=>independentRecordWithinBudget(item)).sort((a,b)=>Number(b[1]?.ts||0)-Number(a[1]?.ts||0));
 const next={};
 let ctx=null; try{ ctx=getContext(); }catch{ ctx=null; }
 const kept=entries.slice(0,120);
 const newest=newestPerChat(kept.map(([key,item])=>({key,ts:Number(item?.ts||0)})));
 // 累计每条自己的字节数，不在循环里反复把整个对象序列化（原来是 120 次 × 1.6MB，手机上会卡）。
 let used=2;
 for(const [key,item] of kept){
  // Full stacks live in their archive/chat metadata, not duplicated into the
  // bounded current-output cache on every passive reconciliation.
  const current={...item};delete current.faceSwipes;
  const cost=byteLength(JSON.stringify(key))+byteLength(JSON.stringify(current))+2;
  if(used+cost>OUTPUT_STORE_BUDGET_BYTES){
   // 超出目标：只留还不能确认已进聊天文件的（当前聊天里没对上的、别的聊天最新的一条），且不超过上限。
   const coverage=cacheCoverage(ctx,key,item);
   const protect=coverage==='unconfirmed' || (coverage==='foreign' && newest.get(parseSlotKey(key)?.chat||key)?.key===key);
   if(!protect) continue;
   if(used+cost>OUTPUT_STORE_CEILING_BYTES){ warnStorageTrimmed(); continue; }
  }
  next[key]=current; used+=cost;
 }
 return next;
}

// 别处写不进去（比如记一笔抽签账）要腾地方时用：只删已经确认进了聊天数据的本机缓存，
// 别的聊天每个留最新一条，当前聊天里还没对上的一条都不删。保留 keep 条可删的里最新的那些。
function compactCoveredOutputsForQuota(keep=40){
 let ctx=null; try{ ctx=getContext(); }catch{ ctx=null; }
 let parsed;
 try{ parsed=JSON.parse(localStorage.getItem(STORE_KEY)||'{}'); }catch{ return false; }
 if(!parsed || typeof parsed!=='object' || Array.isArray(parsed)) return false;
 const entries=Object.entries(parsed).sort((a,b)=>Number(b[1]?.ts||0)-Number(a[1]?.ts||0));
 const newest=newestPerChat(entries.map(([key,item])=>({key,ts:Number(item?.ts||0)})));
 const next={}; let spare=0; let removed=0;
 for(const [key,item] of entries){
  const coverage=cacheCoverage(ctx,key,item);
  const protect=coverage==='unconfirmed' || (coverage==='foreign' && newest.get(parseSlotKey(key)?.chat||key)?.key===key);
  if(protect){ next[key]=item; continue; }
  if(spare<Math.max(0,Number(keep)||0)){ next[key]=item; spare+=1; continue; }
  removed+=1;
 }
 if(!removed) return false;
 try{ localStorage.setItem(STORE_KEY,JSON.stringify(next)); return true; }catch{ return false; }
}
// storage.js 不能直接引用这里（会绕成循环引用），经全局挂一个入口给它用。
globalThis.__rabbitMirrorCompactCoveredOutputsForQuota=compactCoveredOutputsForQuota;

// 本机存储满了、当前成品写不进去时，先从兔子镜自己的「旧版本备份」里腾地方：最旧的先删，每轮删四分之一，
// 删一轮试写一次，写进去就停。旧版本备份只是本机多存的一份，聊天记录里的成品和版本存档都不动。
function freeHistoryRoomFor(serialized){
 let history;
 try{ history=readHistoryStore(); }catch{ return false; }
 const flattened=[];
 for(const [slot,entries] of Object.entries(history.slots||{})) for(const entry of (Array.isArray(entries)?entries:[])) flattened.push({slot,entry});
 if(!flattened.length) return false;
 flattened.sort((a,b)=>Number(b.entry?.ts||0)-Number(a.entry?.ts||0));
 while(flattened.length){
  flattened.splice(Math.max(0,flattened.length-Math.ceil(flattened.length/4)));
  const retry=emptyHistoryStore();
  for(const {slot,entry} of flattened) (retry.slots[slot]||(retry.slots[slot]=[])).push(entry);
  for(const list of Object.values(retry.slots)) list.sort((a,b)=>Number(a?.ts||0)-Number(b?.ts||0));
  try{
   if(flattened.length) localStorage.setItem(HISTORY_STORE_KEY,JSON.stringify(retry));
   else localStorage.removeItem(HISTORY_STORE_KEY);
  }catch{ continue; }
  try{ localStorage.setItem(STORE_KEY,serialized); warnStorageTrimmed(); return true; }catch{}
 }
 return false;
}

export function writeStore(v){
 const compacted=compactOutputStore(v);
 try { localStorage.setItem(STORE_KEY, JSON.stringify(compacted)); try{ clearSavedIndependentOutputNotices(); }catch{} return true; }
 catch {
  if(freeHistoryRoomFor(JSON.stringify(compacted))){ try{ clearSavedIndependentOutputNotices(); }catch{} return true; }
  const entries=Object.entries(compacted).sort((a,b)=>Number(b[1]?.ts||0)-Number(a[1]?.ts||0));
  while(entries.length>1){ entries.pop(); try{ localStorage.setItem(STORE_KEY,JSON.stringify(Object.fromEntries(entries))); try{ clearSavedIndependentOutputNotices(); }catch{} warnStorageTrimmed(); return true; }catch{} }
  warnStorageTrimmed(); return false;
 }
}

function emptyHistoryStore(){ return {version:1,slots:{}}; }

export function readHistoryStore(){
 try{
  const parsed=JSON.parse(localStorage.getItem(HISTORY_STORE_KEY)||'null');
  if(parsed&&typeof parsed==='object'&&parsed.slots&&typeof parsed.slots==='object') return parsed;
 }catch{}
 return emptyHistoryStore();
}

// 旧版本备份超出目标时：成品缓存或聊天数据里已经有同样内容的，删掉不丢东西；每一层最新的那份、而且哪里都没有的，留到上限；
// 更早的版本只是用来回退的，超出目标就不留。
function compactHistoryStore(value){
 const normalized=value&&typeof value==='object'?value:emptyHistoryStore();
 const flattened=[];
 for(const [slot,entries] of Object.entries(normalized.slots||{})){
  for(const entry of (Array.isArray(entries)?entries:[]).slice(-10)) if(independentRecordWithinBudget(entry)) flattened.push({slot,entry});
 }
 flattened.sort((a,b)=>Number(b.entry?.ts||0)-Number(a.entry?.ts||0));
 const next=emptyHistoryStore();
 let ctx=null; try{ ctx=getContext(); }catch{ ctx=null; }
 let outputs=null;
 const outputHtmlFor=slot=>{ if(!outputs){ try{ outputs=readStore(); }catch{ outputs={}; } } return String(outputs?.[slot]?.html||''); };
 const newestForSlot=new Map();
 for(const {slot,entry} of flattened) if(!newestForSlot.has(slot)) newestForSlot.set(slot,entry);
 let used=byteLength(JSON.stringify(next));
 for(const {slot,entry} of flattened.slice(0,70)){
  const list=next.slots[slot]||(next.slots[slot]=[]);
  if(list.length>=10) continue;
  const cost=byteLength(JSON.stringify(entry))+(list.length?1:byteLength(JSON.stringify(slot))+4);
  if(used+cost>HISTORY_STORE_BUDGET_BYTES){
   const covered=outputHtmlFor(slot)===String(entry.html||'') || cacheCoverage(ctx,slot,entry)==='covered';
   const protect=!covered && newestForSlot.get(slot)===entry;
   if(!protect || used+cost>HISTORY_STORE_CEILING_BYTES){ if(!list.length) delete next.slots[slot]; if(protect) warnStorageTrimmed(); continue; }
  }
  list.push(entry); used+=cost;
 }
 for(const list of Object.values(next.slots)) list.sort((a,b)=>Number(a?.ts||0)-Number(b?.ts||0));
 return next;
}

function writeHistoryStore(value){
 const compacted=compactHistoryStore(value);
 try{ localStorage.setItem(HISTORY_STORE_KEY,JSON.stringify(compacted)); return true; }
 catch{
  const flattened=[];
  for(const [slot,entries] of Object.entries(compacted.slots||{})) for(const entry of entries) flattened.push({slot,entry});
  flattened.sort((a,b)=>Number(b.entry?.ts||0)-Number(a.entry?.ts||0));
  while(flattened.length>1){
   flattened.pop(); const retry=emptyHistoryStore();
   for(const {slot,entry} of flattened) (retry.slots[slot]||(retry.slots[slot]=[])).push(entry);
   try{ localStorage.setItem(HISTORY_STORE_KEY,JSON.stringify(retry)); warnStorageTrimmed(); return true; }catch{}
  }
  warnStorageTrimmed(); return false;
 }
}

export function normalizeHistoryEntry(value){
 if(!independentRecordWithinBudget(value)) return null;
 const html=String(value.html||'');
 return {
  id:String(value.id||hashText(html)), html, initialHtml:String(value.initialHtml||''), sourceHash:String(value.sourceHash||''),
  bodyHash:String(value.bodyHash||''), displayHash:String(value.displayHash||''), reasoningHash:String(value.reasoningHash||''),
  ts:Number(value.ts||Date.now()), model:String(value.model||''), runtime:String(value.runtime||RUNTIME_VERSION),
  apiRequest:value.apiRequest&&typeof value.apiRequest==='object'?{...value.apiRequest}:null,
  executionLockChars:Number(value.executionLockChars||0),
  paletteFingerprint:value.paletteFingerprint&&typeof value.paletteFingerprint==='object'?{...value.paletteFingerprint}:null,
  textReplacementReceipt:copyIndependentReplacementReceipt(value.textReplacementReceipt),
  textReplacementReceipts:Array.isArray(value.textReplacementReceipts)?value.textReplacementReceipts.slice(0,5).map(copyIndependentReplacementReceipt):null,
  initialTextReplacementReceipt:copyIndependentReplacementReceipt(value.initialTextReplacementReceipt),
  ownerLineage:copyIndependentOwnerLineage(value.ownerLineage),
 };
}

export function appendHistoryEntry(slot,value){
 const entry=normalizeHistoryEntry(value); if(!slot||!entry) return null;
 const store=readHistoryStore(); const list=Array.isArray(store.slots[slot])?store.slots[slot]:[];
 const deduped=list.filter(item=>String(item?.id||'')!==entry.id);
 deduped.push(entry); store.slots[slot]=deduped.slice(-10);
 const flattened=[];
 for(const [key,entries] of Object.entries(store.slots)) for(const item of entries) flattened.push({key,item});
 flattened.sort((a,b)=>Number(b.item?.ts||0)-Number(a.item?.ts||0));
 const allowed=new Set(flattened.slice(0,70).map(({key,item})=>`${key}\u0000${item?.id||''}`));
 for(const [key,entries] of Object.entries(store.slots)){
  store.slots[key]=entries.filter(item=>allowed.has(`${key}\u0000${item?.id||''}`));
  if(!store.slots[key].length) delete store.slots[key];
 }
 writeHistoryStore(store); return entry;
}

export function historyEntriesForSlot(slot){
 const list=readHistoryStore().slots?.[slot];
 return (Array.isArray(list)?list:[]).map(normalizeHistoryEntry).filter(Boolean).sort((a,b)=>Number(b.ts||0)-Number(a.ts||0));
}

function remountIndependentFaceFromHtml(identity,html,faceIndex){
 const host=identity?.host;
 if(!host?.isConnected) return false;
 // 换版本、重说完成都会整面换掉：记一下次数，正在进行的维修发现次数变了就停下，不会修到另一版上去。
 host.dataset.rmFaceRemountEpoch=String((Number(host.dataset.rmFaceRemountEpoch)||0)+1);
 const faces=externalFaceDetails(host);
 if(faces.length>1){
  if(!replaceExternalMultifaceFace(host,identity.key,'independent',html,faceIndex,true)) return false;
 }else{
  const replacement=extractReadyDetails(html,true);
  const current=host.querySelector?.(':scope > details');
  if(!replacement||!current) return false;
  const wasOpen=current.hasAttribute('open');
  markExternalDetails(replacement,identity.key,'independent');
  if(wasOpen) replacement.setAttribute('open',''); else replacement.removeAttribute('open');
  current.replaceWith(replacement);
  host.__rabbitMirrorIndependentSource=html;
  host.dataset.rmState='ready';
 }
 stampExternalDetailsOwnership(host);
 ensureExternalTools(host);
 scheduleIndependentReadyPostprocess(host,identity.key,html);
 try{ refreshRabbitMirrorToolsInScope(host); }catch{}
 return true;
}

function commitIndependentFaceVersion(identity,mutator){
 if(!identity) return {ok:false,reason:'missing'};
 const faceIndex=independentSwipeFaceIndex(identity);
 const slot=independentSwipeSlot(identity);
 const previous=readFaceSwipe(slot,faceIndex);
 const result=mutator(previous);
 if(!result?.ok) return result;
 const entry=currentSwipeEntry(result.state);
 const existing=savedIndependentRecordForOwner(identity.ctx,identity.index,identity.msg,readStore());
 const merged=mergeFaceDetailsIntoHtml(existing?.html||identity.host?.__rabbitMirrorIndependentSource||entry.html,faceIndex,entry.html);
 if(!merged || !independentRecordWithinBudget({...existing,html:merged})) return {ok:false,reason:'persist',state:previous};
 // A valid existing version is a local display action, not a disk transaction.
 // Do not advance the pager before a successful mount; a refused write must
 // not prevent that mount or leave the DOM showing a different version.
 if(!remountIndependentFaceFromHtml(identity,merged,faceIndex)) return {ok:false,reason:'mount',state:previous};
 const committed=mutateFaceSwipe(slot,faceIndex,()=>result);
 writeIndependentOwnerHtml(identity,merged);
 try{ refreshRabbitMirrorToolsInScope(identity.host); }catch{}
 return committed;
}

export function independentFaceSwipeView(root,owner={}){
 const identity=resolveIndependentActionIdentity(root,owner);
 if(!identity || identity.host?.dataset?.rmState==='error') return null;
 const faces=externalFaceDetails(identity.host);
 if(faces.length>1){
  const currentIndex=showMultifaceFace(identity.host,identity.host.dataset.rmFaceView);
  return multifaceFacePagerView(faces.length,currentIndex,hasEphemeralFaceFailure(faces[currentIndex]));
 }
 seedIndependentFaceSwipesFromIdentity(identity);
 const details=independentSwipeDetails(identity);
 const overlay=hasEphemeralFaceFailure(details);
 const state=readFaceSwipe(independentSwipeSlot(identity),independentSwipeFaceIndex(identity));
 if(!state.versions.length && !overlay) return null;
 const count=state.versions.length;
 const currentIndex=state.currentIndex;
 const full=count>=FACE_SWIPE_MAX;
 return {
  count, currentIndex, overlay,
  label:`${currentIndex+1}/${count||1}`,
  canPrev: overlay || currentIndex>0,
  canNext: currentIndex<count-1,
  canDelete: count>1 && !overlay,
  canResay: overlay || !full,
  full,
 };
}

export function canIndependentFaceResay(root,owner={}){
 const identity=resolveIndependentActionIdentity(root,owner,{allowPassiveErrorRetry:true,allowEditedSource:true});
 if(!identity) return {ok:false,reason:'missing'};
 seedIndependentFaceSwipesFromIdentity(identity);
 if(hasEphemeralFaceFailure(independentSwipeDetails(identity))) return {ok:true,retry:true};
 const state=readFaceSwipe(independentSwipeSlot(identity),independentSwipeFaceIndex(identity));
 if(!canAppendSwipe(state)) return {ok:false,reason:'full',message:FACE_SWIPE_FULL_MESSAGE};
 return {ok:true};
}

export function applyIndependentFaceSwipe(root,index,owner={}){
 const identity=resolveIndependentActionIdentity(root,owner);
 if(!identity) return false;
 const faces=externalFaceDetails(identity.host);
 if(faces.length>1){
  const current=Number(identity.host.dataset.rmFaceView)||0;
  const details=faces[showMultifaceFace(identity.host,index)];
  if(hasEphemeralFaceFailure(details) && Number(index)===current) clearEphemeralFaceFailure(details);
  try{ refreshRabbitMirrorToolsInScope(identity.host); }catch{}
  return true;
 }
 seedIndependentFaceSwipesFromIdentity(identity);
 const details=independentSwipeDetails(identity);
 if(hasEphemeralFaceFailure(details) && Number(index)===readFaceSwipe(independentSwipeSlot(identity),independentSwipeFaceIndex(identity)).currentIndex){
  clearEphemeralFaceFailure(details);
  const existing=savedIndependentRecordForOwner(identity.ctx,identity.index,identity.msg,readStore());
  if(existing?.html) remountIndependentFaceFromHtml(identity,existing.html,independentSwipeFaceIndex(identity));
  return true;
 }
 const result=commitIndependentFaceVersion(identity,state=>selectSwipeIndex(state,index));
 return !!result?.ok;
}

export function deleteIndependentFaceSwipe(root,owner={}){
 const identity=resolveIndependentActionIdentity(root,owner);
 if(!identity) return false;
 seedIndependentFaceSwipesFromIdentity(identity);
 const result=commitIndependentFaceVersion(identity,deleteCurrentSwipe);
 if(!result?.ok){
  if(result?.reason==='last') globalThis.toastr?.info?.('只剩一版，不能删空。');
  return false;
 }
 globalThis.toastr?.success?.(`已删除这一版，当前 ${result.state.currentIndex+1}/${result.state.versions.length}`);
 return true;
}

export function restoreIndependentFaceSwipeInitial(root){
 const identity=resolveIndependentActionIdentity(root);
 if(!identity) return false;
 seedIndependentFaceSwipesFromIdentity(identity);
 const result=commitIndependentFaceVersion(identity,restoreCurrentSwipeInitial);
 if(!result?.ok) return false;
 globalThis.toastr?.success?.('已恢复到这一版刚生成时的画面和交互。');
 return true;
}

export function hasIndependentSwipeInitial(root){
 const identity=resolveIndependentActionIdentity(root);
 if(!identity) return false;
 seedIndependentFaceSwipesFromIdentity(identity);
 return !!currentSwipeEntry(readFaceSwipe(independentSwipeSlot(identity),independentSwipeFaceIndex(identity)))?.initialHtml;
}

function emptyChatOutputMetadata(){ return {version:CHAT_OUTPUT_METADATA_SCHEMA,owners:{}}; }
const MOVED_OWNER_LIMIT=40;

function chatMetadataObject(ctx=getContext()){
 const value=ctx?.chatMetadata || globalThis.chat_metadata;
 return value&&typeof value==='object'?value:null;
}

function compactExternalSourceNote(metadata){
 const externalSources=[...new Set((Array.isArray(metadata?.externalSources)?metadata.externalSources:[]).filter(name=>typeof name==='string').slice(0,24).map(name=>name.replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,200)).filter(Boolean))];
 return metadata?.hasExternalReferences===true||externalSources.length?{hasExternalReferences:true,externalSources}:{};
}

function compactDirectiveCounts(metadata){
 return Object.fromEntries(['customThemeCount','customFormatCount','customRequestCount'].filter(key=>Number(metadata?.[key])>0)
  .map(key=>[key,Math.min(1000,Math.max(1,Math.floor(Number(metadata[key]))))]));
}

function compactChatPersistedRecord(value){
 if(!independentRecordWithinBudget(value)) return null;
 const record=normalizeHistoryEntry(value); if(!record?.html) return null;
 const initialHtml=String(value.initialHtml||record.initialHtml||'');
 const diagnostic=value?.apiRequest&&typeof value.apiRequest==='object'?value.apiRequest:null;
 const faces=Array.isArray(diagnostic?.faces)&&diagnostic.faces.length>=2&&diagnostic.faces.length<=5
  ? diagnostic.faces.map((face,faceIndex)=>({faceIndex, samplingMode:String(face?.samplingMode||''), themeIds:Array.isArray(face?.themeIds)?face.themeIds.map(String).slice(0,12):[], formatIds:Array.isArray(face?.formatIds)?face.formatIds.map(String).slice(0,12):[], themeLabels:Array.isArray(face?.themeLabels)?face.themeLabels.map(String).slice(0,12):[], formatLabels:Array.isArray(face?.formatLabels)?face.formatLabels.map(String).slice(0,12):[], forcedVisualScenery:face?.forcedVisualScenery===true,...compactExternalSourceNote(face),...presentationModeFields(face),...compactDirectiveCounts(face)}))
  : null;
 return {
  ...(value.faceSwipes ? {faceSwipes:Object.fromEntries(Object.entries(value.faceSwipes).filter(([key])=>/^[0-4]$/.test(key)).map(([key,state])=>[key,compactSwipeState(state)]))}:{}),
  html:String(record.html||''), initialHtml:initialHtml && initialHtml!==String(record.html||'') ? initialHtml : '', sourceHash:String(record.sourceHash||''), bodyHash:String(record.bodyHash||''),
  displayHash:String(record.displayHash||''), reasoningHash:String(record.reasoningHash||''), ts:Number(record.ts||Date.now()),
  model:String(record.model||''), runtime:String(record.runtime||RUNTIME_VERSION), executionLockChars:Number(record.executionLockChars||0),
  paletteFingerprint:record.paletteFingerprint&&typeof record.paletteFingerprint==='object'?{...record.paletteFingerprint}:null,
  repairedByMaintenance:!!value?.repairedByMaintenance,
  textReplacementReceipt:record.textReplacementReceipt,
  textReplacementReceipts:record.textReplacementReceipts,
  initialTextReplacementReceipt:record.initialTextReplacementReceipt,
  ownerLineage:record.ownerLineage,
  ...(faces?{apiRequest:{faceCount:faces.length,faces,...compactExternalSourceNote(diagnostic),
   ...(diagnostic.partial===true?{partial:true,failedFaces:(Array.isArray(diagnostic.failedFaces)?diagnostic.failedFaces:[])
    .filter(face=>Number.isInteger(face?.faceIndex)&&face.faceIndex>=0&&face.faceIndex<faces.length)
    .slice(0,5).map(face=>({faceIndex:face.faceIndex,status:'failed',code:String(face.code||'incomplete-face').replace(/[^a-z0-9-]/gi,'').slice(0,80)}))}:{}),
  }}:diagnostic?.hasExternalReferences||diagnostic?.presentationMode||Array.isArray(diagnostic?.formatIds)||diagnostic?.visualSceneryCombination===true?{apiRequest:{...compactExternalSourceNote(diagnostic),...presentationModeFields(diagnostic),...compactDirectiveCounts(diagnostic),
   ...(Array.isArray(diagnostic?.themeIds)&&Array.isArray(diagnostic?.formatIds)?{
    samplingMode:String(diagnostic.samplingMode||''),
    themeIds:Array.isArray(diagnostic.themeIds)?diagnostic.themeIds.map(String).slice(0,12):[],
    formatIds:Array.isArray(diagnostic.formatIds)?diagnostic.formatIds.map(String).slice(0,12):[],
    themeLabels:Array.isArray(diagnostic.themeLabels)?diagnostic.themeLabels.map(String).slice(0,12):[],
    formatLabels:Array.isArray(diagnostic.formatLabels)?diagnostic.formatLabels.map(String).slice(0,12):[],
    forcedVisualScenery:diagnostic.forcedVisualScenery===true,
   }:{}),
  }}:{}),
 };
}

function normalizeChatOutputMetadata(value){
 const next=emptyChatOutputMetadata();
 const owners=value&&typeof value==='object'&&value.owners&&typeof value.owners==='object'?value.owners:{};
 for(const [key,raw] of Object.entries(owners)){
  if(!/^\d+:\d+$/.test(String(key||'')) || !raw || typeof raw!=='object') continue;
  if(raw.deleted===true){ next.owners[key]={deleted:true,ts:Number(raw.ts||0),runtime:String(raw.runtime||RUNTIME_VERSION),sourceHash:String(raw.sourceHash||'')}; continue; }
  const record=compactChatPersistedRecord(raw); if(record) next.owners[key]=record;
 }
 // 找回旧兔子镜时，被挪走楼层的那份（原本错占着别的楼层号）按正文指纹另存在这里，等它自己那层来找回。
 const moved=value&&typeof value==='object'&&value.moved&&typeof value.moved==='object'?value.moved:{};
 const keep=Object.entries(moved).filter(([hash,raw])=>/^[0-9a-z]{1,64}$/i.test(hash)&&raw&&typeof raw==='object'&&raw.deleted!==true)
  .map(([hash,raw])=>[hash,compactChatPersistedRecord(raw)]).filter(([,record])=>record?.html)
  .sort((a,b)=>Number(b[1].ts||0)-Number(a[1].ts||0)).slice(0,MOVED_OWNER_LIMIT);
 if(keep.length) next.moved=Object.fromEntries(keep);
 // 删楼层后对号的次数：聊天文件和本机各记一份，对不上时说明本机缓存的楼层号已过时（见 checkOwnerRemapEpoch）。
 const epoch=Math.floor(Number(value?.remapEpoch)||0);
 if(epoch>0) next.remapEpoch=epoch;
 return next;
}

function readChatOutputMetadata(ctx=getContext()){
 const metadata=chatMetadataObject(ctx); if(!metadata) return emptyChatOutputMetadata();
 return normalizeChatOutputMetadata(metadata[CHAT_OUTPUT_METADATA_KEY]);
}

function saveChatOutputMetadata(ctx=getContext()){
 const metadata=chatMetadataObject(ctx);
 if(!metadata) return false;
 // CRITICAL CHAT-SAFETY BOUNDARY:
 // SillyTavern's context.saveMetadata() delegates to saveChatConditional(), which
 // serializes the entire currently loaded chat. RabbitMirror must never trigger
 // that whole-chat write merely to persist its own auxiliary metadata: during a
 // slow/failed chat load the in-memory chat can be temporarily empty or partial,
 // and forcing a save at that moment could overwrite a complete server chat.
 //
 // The chatMetadata object is live and has already been updated by the caller.
 // RabbitMirror also keeps an immediate localStorage fallback. The host's next
 // ordinary, user-owned chat save may persist this metadata naturally. The only
 // exception is requestSafeChatSave(): after a new mirror is produced it asks the
 // host's debounced metadata save, and only once the same, fully loaded chat is
 // idle (no host generation, same chat array/metadata/key, target message intact).
 return true;
}

// 新成品写进聊天数据以后，请酒馆「稍后存一次」（saveMetadataDebounced，心迹回廊用的也是它），
// 让聊天文件尽早拿到这一版，不用等你下次发消息。安全条件（任一不满足就不请求，照旧等酒馆自己保存）：
//   - 酒馆不在生成正文；生成中就每隔几秒再看一次，最多等两分钟；
//   - 还是写入时那条聊天：同一份聊天数组、同一份聊天信息、聊天标识不变；
//   - 聊天加载完整：有消息，条数不比写入时少，写入的那一层还在原位。
// 几秒内的多次请求合成一次。
const SAFE_SAVE_DELAY_MS=2500;
const SAFE_SAVE_RETRY_MS=4000;
const SAFE_SAVE_GIVE_UP_MS=120000;
let safeSaveTimer=null;
let safeSaveRequest=null;
export function requestSafeChatSave(ctx,index,msg){
 if(typeof ctx?.saveMetadataDebounced!=='function' || !Array.isArray(ctx?.chat) || !ctx.chat.length) return false;
 const metadata=chatMetadataObject(ctx);
 if(!metadata || ctx.chat[Number(index)]!==msg) return false;
 const request={chat:ctx.chat,metadata,key:chatKey(ctx),length:ctx.chat.length,index:Number(index),msg,since:Date.now()};
 // 换了聊天以后，上一条聊天的请求作废；同一条聊天的多次请求只留最新一次。
 safeSaveRequest=request;
 if(safeSaveTimer) clearTimeout(safeSaveTimer);
 safeSaveTimer=setTimeout(runSafeChatSave,SAFE_SAVE_DELAY_MS);
 return true;
}
function runSafeChatSave(){
 safeSaveTimer=null;
 const request=safeSaveRequest; if(!request) return;
 let live=null;
 try{ live=getContext(); }catch{ live=null; }
 const sameChat=!!live && live.chat===request.chat && chatMetadataObject(live)===request.metadata && chatKey(live)===request.key;
 const loaded=sameChat && live.chat.length>=request.length && live.chat[request.index]===request.msg;
 if(!sameChat || !loaded){ safeSaveRequest=null; return; }
 let generating=true;
 try{ generating=hostGenerationLooksActive(); }catch{ generating=true; }
 if(generating){
  if(Date.now()-request.since<SAFE_SAVE_GIVE_UP_MS) safeSaveTimer=setTimeout(runSafeChatSave,SAFE_SAVE_RETRY_MS);
  else safeSaveRequest=null;
  return;
 }
 safeSaveRequest=null;
 try{ live.saveMetadataDebounced(); }catch(error){ console.debug('[RabbitMirror] 稍后保存聊天的请求没有发出：',error); }
}

function chatOwnerKey(index,swipe=0){
 const i=Number(index), s=Number(swipe);
 return Number.isInteger(i)&&i>=0&&Number.isInteger(s)&&s>=0?`${i}:${s}`:'';
}

function parseChatOwnerKey(value=''){
 const match=String(value||'').match(/^(\d+):(\d+)$/); if(!match) return null;
 return {index:Number(match[1]),swipe:Number(match[2])};
}

export function persistedOwnerForMessage(ctx,index,msg){
 const key=chatOwnerKey(index,swipeId(msg)); if(!key) return null;
 const metadata=chatMetadataObject(ctx); const raw=metadata?.[CHAT_OUTPUT_METADATA_KEY]?.owners?.[key];
 const session=sessionOwners(ctx)?.[key];
 // Explicit removal wins, including when its localStorage write was refused.
 if(raw?.deleted===true || session?.deleted===true){
  const removed=raw?.deleted===true?raw:session;
  return {deleted:true,ts:Number(removed.ts||0),runtime:String(removed.runtime||RUNTIME_VERSION),sourceHash:String(removed.sourceHash||'')};
 }
 const newest=session && (!raw || Number(session.ts||0)>Number(raw.ts||0)
  || (Number(session.ts||0)===Number(raw.ts||0)
   && Number(session.ownerLineage?.observedAt||0)>=Number(raw.ownerLineage?.observedAt||0)))?session:raw;
 return newest&&typeof newest==='object'?compactChatPersistedRecord(newest):null;
}

// 找回时挪出来的兔子镜：[{hash, record}]。只读。
export function chatMovedOwners(ctx){
 const moved=readChatOutputMetadata(ctx)?.moved||{};
 return Object.entries(moved).map(([hash,record])=>({hash,record})).filter(entry=>entry.record?.html);
}

// 另存一份挪出来的兔子镜（按它自己的正文指纹）。聊天文件不可用时返回 false，调用方不要继续覆盖。
export function saveMovedOwner(ctx,record){
 const metadata=chatMetadataObject(ctx); if(!metadata) return false;
 const hash=String(record?.sourceHash||record?.bodyHash||'').trim();
 const compact=compactChatPersistedRecord(record);
 if(!/^[0-9a-z]{1,64}$/i.test(hash) || !compact?.html) return false;
 let state=metadata[CHAT_OUTPUT_METADATA_KEY];
 if(!state||typeof state!=='object'||!state.owners||typeof state.owners!=='object') state=emptyChatOutputMetadata();
 const moved={...(state.moved&&typeof state.moved==='object'?state.moved:{}),[hash]:compact};
 state.moved=Object.fromEntries(Object.entries(moved).sort((a,b)=>Number(b[1]?.ts||0)-Number(a[1]?.ts||0)).slice(0,MOVED_OWNER_LIMIT));
 if(!state.moved[hash]) return false;
 state.version=CHAT_OUTPUT_METADATA_SCHEMA; metadata[CHAT_OUTPUT_METADATA_KEY]=state; saveChatOutputMetadata(ctx);
 return true;
}

// 挪出来的那份被它自己那层找回以后，这里的副本去掉（它已经记在那一层名下）。
export function dropMovedOwner(ctx,hash){
 const metadata=chatMetadataObject(ctx); const state=metadata?.[CHAT_OUTPUT_METADATA_KEY];
 if(!state?.moved?.[hash]) return false;
 delete state.moved[hash]; saveChatOutputMetadata(ctx); return true;
}

// 聊天文件（和本次会话）里记着的每一层兔子镜：{index, swipe, record}。删过的不列。只读。
export function chatPersistedOwnerEntries(ctx){
 const keys=new Set([
  ...Object.keys(chatMetadataObject(ctx)?.[CHAT_OUTPUT_METADATA_KEY]?.owners||{}),
  ...Object.keys(sessionOwners(ctx)||{}),
 ]);
 const entries=[];
 for(const key of keys){
  const parsed=parseChatOwnerKey(key); if(!parsed) continue;
  const record=persistedOwnerForMessage(ctx,parsed.index,{swipe_id:parsed.swipe});
  if(record && !record.deleted && record.html) entries.push({...parsed,record});
 }
 return entries;
}

// 这个聊天里最早留下兔子镜痕迹的楼层：消息上的归属标记、聊天里存的兔子镜（含删过的）、本机存档里这个聊天的记录。
// 没有任何痕迹时返回 -1。缺外壳卡只挂在这层之后：从没生成过兔子镜的聊天（换了新角色卡）不给每条回复挂卡。
export function earliestMirrorEvidenceFloor(ctx,store=null){
 const chat=Array.isArray(ctx?.chat)?ctx.chat:null; if(!chat) return -1;
 let first=Infinity;
 const note=value=>{ const i=Number(value); if(Number.isInteger(i)&&i>=0&&i<first) first=i; };
 for(let i=0;i<chat.length&&i<first;i+=1){
  const msg=chat[i];
  const extras=[msg?.extra,...(Array.isArray(msg?.swipe_info)?msg.swipe_info.map(info=>info?.extra):[])];
  if(extras.some(extra=>extra&&typeof extra==='object'&&extra.rabbitMirrorOwnerLineage)) note(i);
 }
 const owners=chatMetadataObject(ctx)?.[CHAT_OUTPUT_METADATA_KEY]?.owners;
 for(const key of Object.keys(owners&&typeof owners==='object'?owners:{})) note(parseChatOwnerKey(key)?.index);
 for(const key of Object.keys(sessionOwners(ctx)||{})) note(parseChatOwnerKey(key)?.index);
 const prefix=`${chatKey(ctx)}:`;
 for(const slot of Object.keys(store&&typeof store==='object'?store:{})) if(slot.startsWith(prefix)) note(String(slot.slice(prefix.length)).split(':')[0]);
 return first===Infinity?-1:first;
}

// 这一层自己生成过兔子镜的痕迹：消息上的归属标记、聊天里存的这层（未删除）、本机存档里这层的记录。
export function floorMirrorEvidence(ctx,index,msg,store=null){
 if(!msg) return false;
 const extras=[msg.extra,...(Array.isArray(msg.swipe_info)?msg.swipe_info.map(info=>info?.extra):[])];
 if(extras.some(extra=>extra&&typeof extra==='object'&&extra.rabbitMirrorOwnerLineage&&extra.rabbitMirrorOwnerLineage.revoked!==true)) return true;
 const persisted=persistedOwnerForMessage(ctx,index,msg);
 if(persisted?.deleted) return false;
 if(persisted?.html) return true;
 const prefix=`${chatKey(ctx)}:${Number(index)}:${swipeId(msg)}:`;
 return Object.keys(store&&typeof store==='object'?store:{}).some(slot=>slot.startsWith(prefix));
}

const historyHydrations=new WeakMap();
function historyLoadsFor(ctx){
 if(!Array.isArray(ctx?.chat)) return new Map();
 let loads=historyHydrations.get(ctx.chat);
 if(!loads){loads=new Map();historyHydrations.set(ctx.chat,loads);}
 return loads;
}

export function independentHistoryLoaded(ctx,index,msg){
 const state=independentHistoryReadState(ctx,index,msg);
 return state==='ready'||state==='error';
}

export function independentHistoryReadState(ctx,index,msg){
 if(!globalThis.indexedDB) return 'ready';
 return historyLoadsFor(ctx).get(messageBaseSlotKey(ctx,index,msg))?.state||'idle';
}

export function restoreIndependentHistory(ctx,index,msg,{retry=false}={}){
 const base=messageBaseSlotKey(ctx,index,msg), loads=historyLoadsFor(ctx);
 const previous=loads.get(base);
 if(previous&&(!previous.done||!retry)) return previous.promise;
 const entry={done:false,state:'loading',promise:null}; loads.set(base,entry);
 const observed=observeMessageSourceRevision(ctx,index,msg);
 entry.promise=faceSwipeArchiveRemapSettled().then(()=>loadFaceSwipeArchive(base,{retry})).then(row=>{
  entry.state=faceSwipeArchiveReadState(base)==='error'?'error':'ready';
  if(loads.get(base)!==entry) return;
  // Never apply a late database read to a different body, Swipe or chat.
  const live=getContext();
  if(live.chat!==ctx.chat || live.chat?.[index]!==msg || messageBaseSlotKey(live,index,msg)!==base
   || observeMessageSourceRevision(live,index,msg).sourceHash!==observed.sourceHash) return;
  const current=persistedOwnerForMessage(ctx,index,msg);
  if(current?.deleted) return;
  if(row?.record?.deleted){
   // 墓碑没记正文指纹、或指纹和当前正文不一致时，不往聊天文件里写：这一行可能是楼层搬家没成功时留下的、属于别的消息。
   const tombHash=String(row.record.sourceHash||'');
   if(tombHash && (tombHash===observed.sourceHash || tombHash===observed.bodyHash)
    && (!current || Number(row.record.ts)>=Number(current.ts))) writePersistedOwner(ctx,index,msg,row.record);
   return;
  }
  if(current?.faceSwipes && savedRecordMatchesObserved(current,observed)) restoreFaceSwipeSnapshot(base,current.faceSwipes);
  if(!row?.record?.html || !savedRecordMatchesObserved(row.record,observed)) return;
  const stored=savedIndependentRecordForOwner(ctx,index,msg,readStore(),observed);
  const archiveTime=Number(row.record.ts||0), storedTime=Number(stored?.ts||0);
  if(!stored || archiveTime>storedTime || (archiveTime===storedTime
   && Number(row.record.ownerLineage?.observedAt||0)>=Number(stored.ownerLineage?.observedAt||0))){
   restoreFaceSwipeSnapshot(base,row.states);
   const restored=compactChatPersistedRecord({...row.record,faceSwipes:snapshotFaceSwipes(base)});
   if(!restored) return;
   writePersistedOwner(ctx,index,msg,restored);
   const store=readStore();saveRecordForSlot(store,observed.slot,restored);writeStore(store);
  }
 }).catch(()=>{entry.state='error';}).finally(()=>{entry.done=true;});
 return entry.promise;
}

export function writePersistedOwner(ctx,index,msg,value,{overwrite=true}={}){
 const metadata=chatMetadataObject(ctx); const ownerKey=chatOwnerKey(index,swipeId(msg));
 if(!ownerKey) return false;
 const session=sessionOwners(ctx,true);
 let state=metadata?.[CHAT_OUTPUT_METADATA_KEY];
 if(!state||typeof state!=='object'||!state.owners||typeof state.owners!=='object') state=emptyChatOutputMetadata();
 const existing=session?.[ownerKey]||state.owners?.[ownerKey];
 if(!overwrite && existing) return false;
 let next=null;
 if(value?.deleted===true) next={deleted:true,ts:Number(value.ts||Date.now()),runtime:RUNTIME_VERSION,sourceHash:String(value.sourceHash||existing?.sourceHash||existing?.bodyHash||'')};
 else {
  const base=messageBaseSlotKey(ctx,index,msg);
  if(value.faceSwipes || existing?.faceSwipes) restoreFaceSwipeSnapshot(base,value.faceSwipes||existing.faceSwipes);
  next=compactChatPersistedRecord({...value,faceSwipes:snapshotFaceSwipes(base)});
 }
 if(!next) return false;
 if(session) session[ownerKey]=next;
 const base=messageBaseSlotKey(ctx,index,msg);
 const savedSlot=chatPersistenceSlot(ctx,index,swipeId(msg),next);
 void saveFaceSwipeArchive(base,next).then(({saved,row})=>{
  // Only a completed, read-back archive transaction can dismiss a current-work
  // warning when the separate localStorage cache refused the same record.
  if(saved) clearSavedIndependentOutputNotices({...readStore(),[savedSlot]:row.record});
  if(saved || faceSwipeSnapshotStored(base,row.states)) clearIndependentHistorySaveNotice(savedSlot,row.states);
  else if(Object.values(row.states).some(state=>state.versions?.length>1)) showIndependentUnsavedOutput(next,savedSlot,{history:row.states,historySlot:base});
 }).catch(()=>{});
 if(!metadata) return !!session;
 if(state.owners?.[ownerKey] && JSON.stringify(state.owners[ownerKey])===JSON.stringify(next)) return false;
 state.version=CHAT_OUTPUT_METADATA_SCHEMA; state.owners[ownerKey]=next; metadata[CHAT_OUTPUT_METADATA_KEY]=state; saveChatOutputMetadata(ctx); return true;
}

export function chatPersistenceSlot(ctx,index,swipe,record){
 const sourceHash=String(record?.sourceHash||record?.bodyHash||'').trim();
 return sourceHash?`${chatKey(ctx)}:${Number(index)}:${Number(swipe)}:${sourceHash}`:'';
}

function mergeChatOutputsIntoLocalStore(ctx,store){
 const state=readChatOutputMetadata(ctx); const metadata=chatMetadataObject(ctx);
 let storeChanged=false; let metadataChanged=false;
 for(const [ownerKey,raw] of Object.entries(state.owners||{})){
  const owner=parseChatOwnerKey(ownerKey); if(!owner) continue;
  const base=`${chatKey(ctx)}:${owner.index}:${owner.swipe}`;
  if(raw?.deleted===true){ clearOwnerLockForBase(base); continue; }
  let record=compactChatPersistedRecord(raw); if(!record?.html || !independentStoredHtmlRestorable(record.html)) continue;
  const slot=chatPersistenceSlot(ctx,owner.index,owner.swipe,record); if(!slot) continue;
  if(!record.initialHtml && interactionStatePollutionScore(record.html)>0) record=normalizeSavedInteractionRecord(record,slot);
  const existing=store?.[slot];
  const existingReady=existing?.html && independentStoredHtmlRestorable(existing.html) ? compactChatPersistedRecord(existing) : null;
  const localIsNewer=!!existingReady && (Number(existingReady.ts||0)>Number(record.ts||0)
   || (Number(existingReady.ts||0)===Number(record.ts||0)
    && Number(existingReady.ownerLineage?.observedAt||0)>Number(record.ownerLineage?.observedAt||0)));
  if(localIsNewer){
   // A maintenance repair is first committed to the live/local snapshot. If an
   // older chatMetadata copy is observed before the queued server save finishes,
   // keep the newer local HTML authoritative and immediately heal metadata.
   if(String(existingReady.html||'')!==String(record.html||'') || JSON.stringify(existingReady.ownerLineage)!==JSON.stringify(record.ownerLineage)){
    state.owners[ownerKey]=existingReady; metadataChanged=true;
   }
  }else if(!existingReady || String(existingReady.html||'')!==String(record.html||'') || JSON.stringify(existingReady.ownerLineage)!==JSON.stringify(record.ownerLineage)){
   saveRecordForSlot(store,slot,record,{dropLegacy:false}); storeChanged=true;
  }
  setOwnerLockForBase(base,slot,String((localIsNewer?existingReady:record)?.sourceHash||(localIsNewer?existingReady:record)?.bodyHash||''));
 }
 if(metadataChanged && metadata){ metadata[CHAT_OUTPUT_METADATA_KEY]=state; saveChatOutputMetadata(ctx); }
 return {storeChanged,metadataChanged};
}

function migrateLegacyLocalOutputsToChatMetadata(ctx,store){
 const metadata=chatMetadataObject(ctx); if(!metadata) return {metadataChanged:false,storeChanged:false};
 const state=readChatOutputMetadata(ctx); let metadataChanged=false; let storeChanged=false;
 for(const {m,i} of assistantMessages(ctx)){
  const ownerKey=chatOwnerKey(i,swipeId(m)); if(!ownerKey || Object.prototype.hasOwnProperty.call(state.owners,ownerKey)) continue;
  const observed=observeMessageSourceRevision(ctx,i,m);
  const base=messageBaseSlotKey(ctx,i,m);
  const locked=lockedIndependentRecordForBase(base,store);
  let record=locked?.record||null;
  if(!record?.html){
   const recovered=recoverSavedRecord(store,observed.slot,observed);
   if(recovered.storeChanged) storeChanged=true;
   record=recovered.saved||null;
  }
  const compact=compactChatPersistedRecord(record);
  if(!compact?.html || !independentStoredHtmlRestorable(compact.html)) continue;
  state.owners[ownerKey]=compact; metadataChanged=true;
 }
 if(metadataChanged){ metadata[CHAT_OUTPUT_METADATA_KEY]=state; saveChatOutputMetadata(ctx); }
 return {metadataChanged,storeChanged};
}

export function synchronizeIndependentChatPersistence(ctx,store){
 const imported=mergeChatOutputsIntoLocalStore(ctx,store);
 const migrated=migrateLegacyLocalOutputsToChatMetadata(ctx,store);
 return {
  storeChanged:!!(imported.storeChanged||migrated.storeChanged),
  metadataChanged:!!(imported.metadataChanged||migrated.metadataChanged),
 };
}

function independentContextChatMetadata(ctx){
 const source=ctx?.chatMetadata || globalThis.chat_metadata || null;
 if(!source || typeof source!=='object') return source;
 const copy={...source}; delete copy[CHAT_OUTPUT_METADATA_KEY]; return copy;
}

export function migrateLegacyDeletedRecords(){
 const store=readStore(); let changed=false;
 for(const [key,value] of Object.entries(store)){
  if(!value?.deleted) continue;
  if(value?.html){
   const next={...value};
   delete next.deleted;
   store[key]=next;
  }else delete store[key];
  changed=true;
 }
 if(changed) writeStore(store);
}

export function readApiProfileStore(){ try { const v=JSON.parse(localStorage.getItem(API_PROFILE_STORE_KEY)||'{}'); return v&&typeof v==='object'?v:{}; } catch { return {}; } }

export function writeApiProfileStore(v){ try { localStorage.setItem(API_PROFILE_STORE_KEY,JSON.stringify(v)); } catch {} }

export function apiProfileKey(st){ const connectionId=normalizeIndependentConnectionText(st?.independentConnectionProfileId,160); const transport=connectionId?`st:${connectionId}`:normalizeBase(st?.independentApiBaseUrl||''); const advanced=st?.independentAdvancedEnabled===true?independentAdvancedOptionsSignature(st):''; return `${transport}|${String(st?.independentApiModel||'')}${advanced?`|advanced:${advanced}`:''}`; }

export function normalizedConfiguredTemperature(st){ const value=Number(st?.independentApiTemperature); return Number.isFinite(value)?Math.max(0,Math.min(2,value)):0.8; }

// ---------------------------------------------------------------------------
// 删楼层／删 swipe 之后，把兔子镜的楼层号跟着改过来。
// 聊天文件里的兔子镜按“楼层号:swipe 号”存。删掉中间楼层后后面的楼层整体前移，
// 记录却还挂在旧楼层号上：前移的楼层找不到自己的兔子镜，被删楼层的记录也一直留在文件里。
// 这里按“是哪一条消息”来对号，而不是按正文：删除前记下每个楼层是哪条消息，删除后看每条消息现在在第几层。
// 被删消息的兔子镜移除；留下的跟着消息搬到新楼层号，版本栈、存档、历史、归属锁一起搬。
// 记不清删除前的顺序时（例如中间插入过没有通知的消息），这次什么也不改。
// 收藏夹、插图记录、图片文件都不在这里处理。

const chatOrderSnapshots=new WeakMap();

// 记下当前聊天每个楼层是哪条消息。只要楼层有增减或换聊天就该调用；很便宜。
export function rememberChatMessageOrder(ctx=getContext()){
 const chat=Array.isArray(ctx?.chat)?ctx.chat:null;
 if(!chat) return;
 chatOrderSnapshots.set(chat,{key:chatKey(ctx),refs:chat.slice()});
}

function messageDeletionMapper(ctx){
 const chat=ctx.chat; const snapshot=chatOrderSnapshots.get(chat);
 if(!snapshot||snapshot.key!==chatKey(ctx)) return null;
 // 聊天被清空（例如酒馆重新加载聊天的中途）时不算删除，绝不据此清掉整段记录。
 if(!chat.length) return null;
 const now=new Map(chat.map((msg,index)=>[msg,index]));
 // 酒馆的每种删除都只删掉连续的一段（中间一段或末尾）。被删的楼层不连续，多半不是正常删除，这次不改。
 const removedAt=snapshot.refs.map((ref,index)=>now.has(ref)?-1:index).filter(index=>index>=0);
 if(removedAt.length&&removedAt[removedAt.length-1]-removedAt[0]+1!==removedAt.length) return null;
 // 留下的旧消息必须保持原来的先后顺序；没见过的消息只能出现在末尾（删除前刚收到、还没记下的）。
 let last=-1;
 for(const ref of snapshot.refs){
  if(!now.has(ref)) continue;
  const index=now.get(ref);
  if(index<=last) return null;
  last=index;
 }
 const known=new Set(snapshot.refs);
 let unknownSeen=false;
 for(const msg of chat){ if(!known.has(msg)) unknownSeen=true; else if(unknownSeen) return null; }
 // 末尾有没记下的新消息、同时前面又删了消息时，新消息的楼层号也前移了，但它原来在第几层记不清，这次不改。
 if(unknownSeen&&snapshot.refs.some(ref=>!now.has(ref))) return null;
 const oldLength=snapshot.refs.length;
 return (index,swipe)=>{
  if(index>=oldLength) return `${index}:${swipe}`;
  const next=now.get(snapshot.refs[index]);
  return next===undefined?null:`${next}:${swipe}`;
 };
}

function swipeDeletionMapper(ctx,messageId,deletedSwipe){
 const msg=ctx.chat?.[messageId];
 if(!msg||!Number.isInteger(messageId)||!Number.isInteger(deletedSwipe)||deletedSwipe<0) return null;
 return (index,swipe)=>index!==messageId?`${index}:${swipe}`
  :swipe===deletedSwipe?null:swipe>deletedSwipe?`${index}:${swipe-1}`:`${index}:${swipe}`;
}

function retargetOwnerRecord(raw,targetKey){
 if(!raw||typeof raw!=='object'||raw.deleted===true) return raw;
 const [index,swipe]=String(targetKey).split(':').map(Number);
 const lineage=copyIndependentOwnerLineage(raw.ownerLineage);
 return lineage?{...raw,ownerLineage:{...lineage,mesid:index,swipe}}:raw;
}

// 返回新的 owners 对象；有任何冲突返回 null（宁可不改）。
function remapOwnerMap(owners,mapper){
 const next={}; let changed=false;
 const kept=[]; const moved=[];
 for(const [ownerKey,raw] of Object.entries(owners||{})){
  const match=/^(\d+):(\d+)$/.exec(ownerKey);
  if(!match){ kept.push([ownerKey,raw]); continue; }
  const target=mapper(Number(match[1]),Number(match[2]));
  if(target===ownerKey){ kept.push([ownerKey,raw]); continue; }
  changed=true;
  if(target) moved.push([target,retargetOwnerRecord(raw,target)]);
 }
 for(const [ownerKey,raw] of kept) next[ownerKey]=raw;
 for(const [ownerKey,raw] of moved){ if(Object.prototype.hasOwnProperty.call(next,ownerKey)) return null; next[ownerKey]=raw; }
 return {next,changed};
}

function remapSlotKeyedObject(object,mapSlot,retarget=value=>value){
 const next={}; const moved=[]; let changed=false;
 for(const [slot,value] of Object.entries(object||{})){
  const target=mapSlot(slot);
  if(target===slot){ if(!Object.prototype.hasOwnProperty.call(next,slot)) next[slot]=value; continue; }
  changed=true;
  if(target) moved.push([target,retarget(value,target)]);
 }
 for(const [slot,value] of moved) next[slot]=value;
 return {next,changed};
}

// options: {kind:'message'} 或 {kind:'swipe', messageId, swipeId}。
// 返回 {changed, settled}：settled 是本地存档改完的 Promise，重新挂载要等它。
export function reconcileIndependentChatOwners(ctx=getContext(),options={}){
 const result={changed:false,settled:Promise.resolve()};
 try{
  const chat=Array.isArray(ctx?.chat)?ctx.chat:null;
  if(!chat) return result;
  const mapper=options.kind==='swipe'
   ?swipeDeletionMapper(ctx,Number(options.messageId),Number(options.swipeId))
   :messageDeletionMapper(ctx);
  if(!mapper){ rememberChatMessageOrder(ctx); return result; }
  const key=chatKey(ctx);
  const mapSlot=slot=>{
   const text=String(slot||'');
   if(!text.startsWith(`${key}:`)) return text;
   const match=/^(\d+):(\d+)(:[^:]*)?$/.exec(text.slice(key.length+1));
   if(!match) return text;
   const target=mapper(Number(match[1]),Number(match[2]));
   return target===null?null:`${key}:${target}${match[3]||''}`;
  };
  // 先把聊天文件里的记录（和本次会话里的副本）算好，有冲突就整体放弃。
  const metadata=chatMetadataObject(ctx);
  const state=metadata?.[CHAT_OUTPUT_METADATA_KEY];
  const ownersPlan=state&&typeof state==='object'&&state.owners&&typeof state.owners==='object'?remapOwnerMap(state.owners,mapper):{next:null,changed:false};
  const session=sessionOwners(ctx);
  const sessionPlan=session?remapOwnerMap(session,mapper):{next:null,changed:false};
  if(ownersPlan===null||sessionPlan===null){
   console.warn('[RabbitMirror] 删除后对号发现冲突，这次不改任何记录。');
   rememberChatMessageOrder(ctx);
   return result;
  }
  if(ownersPlan.changed){ state.owners=ownersPlan.next; result.changed=true; }
  // 只要动了楼层号（聊天文件或本机缓存任何一处），就把对号次数加一，聊天文件和本机同时记下。
  const bumpEpoch=()=>{
   if(!state||typeof state!=='object') return;
   state.remapEpoch=Math.floor(Number(state.remapEpoch)||0)+1;
   metadata[CHAT_OUTPUT_METADATA_KEY]=state; saveChatOutputMetadata(ctx);
   writeLocalRemapEpoch(key,state.remapEpoch);
  };
  if(sessionPlan.changed){ for(const ownerKey of Object.keys(session)) delete session[ownerKey]; Object.assign(session,sessionPlan.next); result.changed=true; }
  // 浏览器本地的几份缓存各改一次；任何一份失败都不影响聊天文件里已经改好的记录（显示时还会按正文核对）。
  // 本地缓存里的记录也带着楼层号（归属信息），搬家时一并改掉。
  const ownerKeyOfSlot=slot=>{ const match=/:(\d+):(\d+)(?::[^:]*)?$/.exec(String(slot||'')); return match?`${match[1]}:${match[2]}`:''; };
  const retargetValue=(value,slot)=>{ const ownerKey=ownerKeyOfSlot(slot); return ownerKey?retargetOwnerRecord(value,ownerKey):value; };
  const retargetList=(list,slot)=>Array.isArray(list)?list.map(entry=>retargetValue(entry,slot)):list;
  try{ const plan=remapSlotKeyedObject(readStore(),mapSlot,retargetValue); if(plan.changed){ writeStore(plan.next); result.changed=true; } }catch(error){ console.warn('[RabbitMirror] 输出缓存对号失败：',error); }
  try{ const history=readHistoryStore(); const plan=remapSlotKeyedObject(history.slots,mapSlot,retargetList); if(plan.changed){ writeHistoryStore({...history,slots:plan.next}); result.changed=true; } }catch(error){ console.warn('[RabbitMirror] 历史记录对号失败：',error); }
  try{ if(remapOwnerLockSlots(mapSlot)) result.changed=true; }catch(error){ console.warn('[RabbitMirror] 归属锁对号失败：',error); }
  try{ if(remapFaceSwipeSlots(mapSlot)) result.changed=true; }catch(error){ console.warn('[RabbitMirror] 版本栈对号失败：',error); }
  // 插图（内置生图与手动生图）也按楼层号存在本机，跟着一起搬；被删楼层的图留着不删。
  // 插图只存在本机，不计入聊天文件的对号次数。
  try{ remapMirrorImageSlots(key,mapper); }catch(error){ console.warn('[RabbitMirror] 插图对号失败：',error); }
  if(options.kind==='swipe'){
   // 归属标记里的 swipe 号也跟着改。
   const msg=chat[Number(options.messageId)];
   // msg.extra 可能就是 swipe_info 里某一项的同一个对象，去重后每个标记只改一次。
   const extras=new Set([msg?.extra,...(Array.isArray(msg?.swipe_info)?msg.swipe_info.map(info=>info?.extra):[])].filter(Boolean));
   for(const extra of extras){
    const marker=extra?.rabbitMirrorOwnerLineage;
    if(!marker||marker.revoked===true||!Number.isInteger(marker.swipe)) continue;
    const target=mapper(Number(options.messageId),marker.swipe);
    if(target) marker.swipe=Number(target.split(':')[1]);
   }
  }
  historyLoadsFor(ctx).clear();
  result.settled=remapFaceSwipeArchive(key,mapSlot,(record,slot)=>{
   const match=/:(\d+):(\d+)$/.exec(String(slot||''));
   return match?retargetOwnerRecord(record,`${match[1]}:${match[2]}`):record;
  }).catch(error=>{ console.warn('[RabbitMirror] 版本存档对号失败：',error); });
  if(options.kind!=='swipe'){
   // 页面上已经挂着的外壳也跟着改号（只改页面，不发请求）。
   // 只动页面上的外壳，不算改了记录，不增加对号次数。
   try{ result.hostsRestamped=restampExternalHostsAfterMessageDeletion(mapSlot); }catch(error){ console.warn('[RabbitMirror] 外壳对号失败：',error); }
  }
  if(result.changed){
   bumpEpoch();
   // 对号后的楼层号要尽快进聊天文件：酒馆删楼层时可能先存了聊天、后发删除事件，那份文件里还是旧楼层号；
   // 等到下次打开聊天，对号次数对不上，本机这份按新楼层号放的版本反而会被当成旧的清掉。
   // 走同一个安全存盘（聊天加载完、没在生成、还是同一个聊天才存，否则稍后再试）。
   try{ const last=ctx.chat.length-1; if(last>=0) requestSafeChatSave(ctx,last,ctx.chat[last]); }catch{}
   console.info(`[RabbitMirror] 删除${options.kind==='swipe'?' swipe':'楼层'}后已把兔子镜对到新楼层号。`); }
 }catch(error){
  console.warn('[RabbitMirror] 删除后对号失败：',error);
 }finally{
  rememberChatMessageOrder(ctx);
 }
 return result;
}

const OWNER_REMAP_EPOCH_KEY='rabbit_mirror_owner_remap_epoch_v1';
function readLocalRemapEpochs(){ try{ const value=JSON.parse(localStorage.getItem(OWNER_REMAP_EPOCH_KEY)||'{}'); return value&&typeof value==='object'?value:{}; }catch{ return {}; } }
function writeLocalRemapEpoch(key,epoch){
 try{ const all=readLocalRemapEpochs(); all[key]=Math.floor(Number(epoch)||0); localStorage.setItem(OWNER_REMAP_EPOCH_KEY,JSON.stringify(all)); }catch{}
}

// 打开聊天时调用。聊天文件里记的对号次数和本机不同，说明本机的版本栈、存档、归属锁还按旧楼层号放着：
// 可能是本机删了楼层但酒馆没来得及保存，也可能是在别的设备上删过楼层。这时清掉本机这几份按楼层号存的缓存，
// 版本以聊天文件里的为准（聊天文件里每面兔子镜都带着自己的版本）。两边相同（包括从没对过号）时什么也不做。
export function checkOwnerRemapEpoch(ctx=getContext()){
 try{
  const metadata=chatMetadataObject(ctx);
  if(!metadata||!Array.isArray(ctx?.chat)) return false;
  const key=chatKey(ctx);
  const fileEpoch=Math.floor(Number(metadata[CHAT_OUTPUT_METADATA_KEY]?.remapEpoch)||0);
  const localEpoch=Math.floor(Number(readLocalRemapEpochs()[key])||0);
  if(fileEpoch===localEpoch) return false;
  // 两个方向都要清：聊天文件比本机新 = 别的设备删过楼层；本机比聊天文件新 = 本机删了楼层但酒馆没保存，
  // 文件里楼层还是删之前的样子，本机按删后楼层号放的缓存反而对不上（元数据和聊天是一起存的，不会只存一半）。
  const prefix=`${key}:`;
  const dropChat=slot=>String(slot||'').startsWith(prefix)&&/^\d+:\d+(?::[^:]*)?$/.test(String(slot).slice(prefix.length))?null:slot;
  try{ remapFaceSwipeSlots(dropChat); }catch{}
  try{ remapOwnerLockSlots(dropChat); }catch{}
  void remapFaceSwipeArchive(key,dropChat).catch(()=>{});
  historyLoadsFor(ctx).clear();
  writeLocalRemapEpoch(key,fileEpoch);
  console.info('[RabbitMirror] 这个聊天在别处删过楼层（或上次删除没来得及保存），已改用聊天文件里的兔子镜版本。');
  return true;
 }catch(error){
  console.warn('[RabbitMirror] 对号次数检查失败：',error);
  return false;
 }
}
