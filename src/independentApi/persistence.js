// Split from independentApi.js — persistence.

import { presentationModeFields } from '../presentationMode.js?rmv=1.67.36';
import { independentAdvancedOptionsSignature } from '../advancedRequestOptions.js?rmv=1.67.36';
import { refreshRabbitMirrorToolsInScope } from '../outputSanitizer.js?rmv=1.67.36';
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
    faceSwipeSnapshotStored, loadFaceSwipeArchive, saveFaceSwipeArchive,
    remapFaceSwipeSlots, remapFaceSwipeArchive, faceSwipeArchiveRemapSettled,
} from '../swipeVersions.js?rmv=1.67.36';
import { RUNTIME_VERSION, byteLength, getContext, hashText } from './runtime.js?rmv=1.67.36';
import { remapMirrorImageSlots } from '../imageStore.js?rmv=1.67.36';
import {
    clearEphemeralFaceFailure,
    hasEphemeralFaceFailure,
    independentSwipeDetails,
    independentSwipeFaceIndex,
    mergeFaceDetailsIntoHtml,
    independentSwipeSlot,
    seedIndependentFaceSwipesFromIdentity,
    writeIndependentOwnerHtml,
} from './faceSwipe.js?rmv=1.67.36';
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
} from './connection.js?rmv=1.67.36';
import { stampExternalDetailsOwnership } from './request.js?rmv=1.67.36';
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
} from './geometry.js?rmv=1.67.36';
import { clearSavedIndependentOutputNotices, externalFaceDetails, resolveIndependentActionIdentity, scheduleIndependentReadyPostprocess, showMultifaceFace, showIndependentUnsavedOutput, clearIndependentHistorySaveNotice } from './mount.js?rmv=1.67.36';

const STORE_KEY = 'rabbit_mirror_independent_outputs_v1';

export const INTERACTION_STATE_MIGRATION_KEY = 'rabbit_mirror_independent_interaction_state_migration_securityfix2_v2';

export const OWNER_LOCK_STORE_KEY = 'rabbit_mirror_independent_owner_locks_v1';

const HISTORY_STORE_KEY = 'rabbit_mirror_independent_history_v1';

const CHAT_OUTPUT_METADATA_KEY = 'rabbit_mirror_independent_outputs_v2';

const CHAT_OUTPUT_METADATA_SCHEMA = 2;

export const HISTORY_PANEL_ATTR = 'data-rabbit-mirror-history-panel';

const OUTPUT_STORE_BUDGET_BYTES = 1600000;

const HISTORY_STORE_BUDGET_BYTES = 1750000;

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

function compactOutputStore(value){
 const entries=Object.entries(value&&typeof value==='object'?value:{}).filter(([,item])=>independentRecordWithinBudget(item)).sort((a,b)=>Number(b[1]?.ts||0)-Number(a[1]?.ts||0));
 const next={};
 for(const [key,item] of entries.slice(0,120)){
  // Full stacks live in their archive/chat metadata, not duplicated into the
  // bounded current-output cache on every passive reconciliation.
  const current={...item};delete current.faceSwipes;
  next[key]=current;
  if(byteLength(JSON.stringify(next))>OUTPUT_STORE_BUDGET_BYTES){ delete next[key]; warnStorageTrimmed(); }
 }
 return next;
}

export function writeStore(v){
 const compacted=compactOutputStore(v);
 try { localStorage.setItem(STORE_KEY, JSON.stringify(compacted)); try{ clearSavedIndependentOutputNotices(); }catch{} return true; }
 catch {
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

function compactHistoryStore(value){
 const normalized=value&&typeof value==='object'?value:emptyHistoryStore();
 const flattened=[];
 for(const [slot,entries] of Object.entries(normalized.slots||{})){
  for(const entry of (Array.isArray(entries)?entries:[]).slice(-10)) if(independentRecordWithinBudget(entry)) flattened.push({slot,entry});
 }
 flattened.sort((a,b)=>Number(b.entry?.ts||0)-Number(a.entry?.ts||0));
 const next=emptyHistoryStore();
 for(const {slot,entry} of flattened.slice(0,70)){
  const list=next.slots[slot]||(next.slots[slot]=[]);
  if(list.length>=10) continue;
  list.push(entry);
  if(byteLength(JSON.stringify(next))>HISTORY_STORE_BUDGET_BYTES){ list.pop(); if(!list.length) delete next.slots[slot]; warnStorageTrimmed(); }
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
  if(raw.deleted===true){ next.owners[key]={deleted:true,ts:Number(raw.ts||0),runtime:String(raw.runtime||RUNTIME_VERSION)}; continue; }
  const record=compactChatPersistedRecord(raw); if(record) next.owners[key]=record;
 }
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
 // ordinary, user-owned chat save may persist this metadata naturally; RabbitMirror
 // itself does not initiate a chat save.
 return true;
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
  return {deleted:true,ts:Number(removed.ts||0),runtime:String(removed.runtime||RUNTIME_VERSION)};
 }
 const newest=session && (!raw || Number(session.ts||0)>Number(raw.ts||0)
  || (Number(session.ts||0)===Number(raw.ts||0)
   && Number(session.ownerLineage?.observedAt||0)>=Number(raw.ownerLineage?.observedAt||0)))?session:raw;
 return newest&&typeof newest==='object'?compactChatPersistedRecord(newest):null;
}

const historyHydrations=new WeakMap();
function historyLoadsFor(ctx){
 if(!Array.isArray(ctx?.chat)) return new Map();
 let loads=historyHydrations.get(ctx.chat);
 if(!loads){loads=new Map();historyHydrations.set(ctx.chat,loads);}
 return loads;
}

export function independentHistoryLoaded(ctx,index,msg){
 return !globalThis.indexedDB || historyLoadsFor(ctx).get(messageBaseSlotKey(ctx,index,msg))?.done===true;
}

export function restoreIndependentHistory(ctx,index,msg){
 const base=messageBaseSlotKey(ctx,index,msg), loads=historyLoadsFor(ctx);
 if(loads.has(base)) return loads.get(base).promise;
 const entry={done:false,promise:null}; loads.set(base,entry);
 const observed=observeMessageSourceRevision(ctx,index,msg);
 entry.promise=faceSwipeArchiveRemapSettled().then(()=>loadFaceSwipeArchive(base)).then(row=>{
  // Never apply a late database read to a different body, Swipe or chat.
  const live=getContext();
  if(live.chat!==ctx.chat || live.chat?.[index]!==msg || messageBaseSlotKey(live,index,msg)!==base
   || observeMessageSourceRevision(live,index,msg).sourceHash!==observed.sourceHash) return;
  const current=persistedOwnerForMessage(ctx,index,msg);
  if(current?.deleted) return;
  if(row?.record?.deleted){
   if(!current || Number(row.record.ts)>=Number(current.ts)) writePersistedOwner(ctx,index,msg,row.record);
   return;
  }
  if(current?.faceSwipes && savedRecordMatchesObserved(current,observed)) restoreFaceSwipeSnapshot(base,current.faceSwipes);
  if(!row?.record?.html || !savedRecordMatchesObserved(row.record,observed)) return;
  restoreFaceSwipeSnapshot(base,row.states);
  const stored=savedIndependentRecordForOwner(ctx,index,msg,readStore(),observed);
  if(!stored || Number(row.record.ts)>=Number(stored.ts)){
   const restored=compactChatPersistedRecord({...row.record,faceSwipes:snapshotFaceSwipes(base)});
   if(!restored) return;
   writePersistedOwner(ctx,index,msg,restored);
   const store=readStore();saveRecordForSlot(store,observed.slot,restored);writeStore(store);
  }
 }).catch(()=>{}).finally(()=>{entry.done=true;});
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
 if(value?.deleted===true) next={deleted:true,ts:Number(value.ts||Date.now()),runtime:RUNTIME_VERSION};
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
  if(result.changed){ bumpEpoch(); console.info(`[RabbitMirror] 删除${options.kind==='swipe'?' swipe':'楼层'}后已把兔子镜对到新楼层号。`); }
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
