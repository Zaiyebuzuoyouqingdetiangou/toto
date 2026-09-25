import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const source=Object.fromEntries(['earlyBody','mount','connection'].map(name=>[name,readFileSync(new URL(`../src/independentApi/${name}.js`,import.meta.url),'utf8')]));
function install(context,file,name,optional=false){
 const match=source[file].match(new RegExp(`^(?:export )?function ${name}\\([^\\r\\n]*}\\r?$`,'m'))
  ||source[file].match(new RegExp(`^(?:export )?function ${name}\\([^]*?^}\\r?$`,'m'));
 if(optional&&!match)return;
 assert.ok(match,name);vm.runInContext(match[0].replace(/^export /,''),context);
}
function harness(){
 let now=10000,id=0,dispatched=0,weak=false,strong=false,dom=false,chatId='chat',epoch=1;
 const timers=new Map(),polls=new Map(),stops=[],requests=[],ownerSymbol=Symbol('owner');
 const msg={mes:'finished body',swipe_id:0};const ctx={chat:[{is_user:true,mes:'question'},msg]};
 const owner={chat:chatId,chatRef:ctx.chat,type:'normal',phase:0,startedAt:9000,startChatLength:1,startTailIndex:0,startTailRole:'user',phaseBaselineIndex:-1,phaseBaselineToken:'',terminalSeen:true,terminalReason:'GENERATION_ENDED',terminalAt:now,toolCapable:false,tentativeRender:{index:1,token:'0:finished body',phase:0,at:now,chat:ctx.chat,message:msg,swipe:0,proof:'exact-render'},settleTimer:0,settleStartedAt:0};
 const cutover={activeHostGeneration:owner,authorized:new Map()};const cutovers=new Map([[chatId,cutover]]);
 const identity=index=>{const message=ctx.chat[index];return message&&!message.is_user?{ctx,msg:message,baseSlot:`${chatId}:${index}:${message.swipe_id}`,slot:`${chatId}:${index}:${message.swipe_id}:${message.mes}`,sourceHash:message.mes,revision:1}:null;};
 const sandbox={console,Set,Map,Date:{now:()=>now},setTimeout(fn,delay){const key=++id;timers.set(key,{fn,at:now+delay});return key;},clearTimeout:key=>timers.delete(key),
  getContext:()=>ctx,getSettings:()=>({independentGenerationTiming:'auto'}),chatKey:()=>chatId,currentRuntime:()=>true,runtimeMode:()=> 'independent',automaticIndependentTiming:()=>true,
  automaticGenerationCutovers:cutovers,ensureAutomaticGenerationCutover:()=>cutover,INDEPENDENT_INTENT_OWNER:ownerSymbol,
  hostModule:{event_types:{GENERATION_ENDED:'GENERATION_ENDED'},get is_send_press(){return strong;}},document:{querySelector:()=>dom?{}:null},
  automaticCutoverVersionToken:m=>`${m.swipe_id}:${m.mes}`,swipeId:m=>m.swipe_id,isRabbitMirrorEligibleAssistantMessage:m=>!!m&&!m.is_user,
  lastAssistantMessage:c=>{for(let i=c.chat.length-1;i>=0;i--)if(!c.chat[i].is_user)return {i,m:c.chat[i]};return null;},
  automaticHostGenerationMayUseTools:()=>false,automaticHostToolResultTail:()=>false,
  INDEPENDENT_GENERATION_INTENT_TYPES:new Set(['normal','continue','swipe','regenerate']),INDEPENDENT_GENERATION_STOPS_KEY:'stops',INDEPENDENT_GENERATION_INTENTS_KEY:'intents',
  FINAL_RENDER_POLL_INTERVAL_MS:120,FINAL_RENDER_SOURCE_STABLE_WAIT_MS:520,SOURCE_STABLE_WAIT_MS:1400,HOST_FINAL_PROOF_WAIT_MS:12000,ACTIVE_GENERATION_WAIT_MS:600000,GENERATION_PLACEHOLDER_POLL_INTERVAL_MS:760,
  OWNER_REATTACH_WAIT_MS:60000,FINAL_RENDER_CONFIRMATION_TTL_MS:5000,WEAK_GENERATION_FLAG_GRACE_MS:30000,WEAK_GENERATION_SOURCE_STABLE_WAIT_MS:4500,
  stopAutomaticHostGenerationSettlement:(_ctx,_owner,reason)=>{stops.push(reason||'host-completion-timeout');cutover.activeHostGeneration=null;},
  writeHostGenerationInProgress(){},writeHostGenerationHintStartedAt(){},clearGenerationPlaceholderPoll(){},finishGlobalWorldInfoCapture(){},claimDeferredIndependentGenerationIntent:()=>false,
  quickAuthorizationOwners:new WeakMap(),quickIntentOwners:new WeakMap(),quickStartOwners:new WeakSet(),boundIndependentIntentOwner:()=>null,
  operationEpochForBase:()=>epoch,advanceOperationEpochForBase:()=>++epoch,messageBaseSlotKey:(c,i,m)=>`${chatId}:${i}:${m.swipe_id}`,
  ensureGenerationPlaceholderForIndex(){},queueMessageSync(){},currentGenerationIdentity:identity,
  hasGenerationWorkFor:i=>polls.has(`${chatId}:${i}`),generationPolls:polls,
  hasExistingFollowRabbitMirror:()=>false,exactIndependentReadyForIdentity:()=>null,automaticFailureStopFor:()=>null,
  automaticFailureStops:new Map(),automaticDispatchAlreadyConsumed:()=>dispatched>0,activeIndependentFlightForBase:()=>null,
  cancelSupersededFlightsForBase(){},cancelFlightsForSlot(){},revokeIndependentRecordContinuity(){},generateFor(index,message){dispatched++;requests.push({index,message,body:message.mes});},
  renderGenerationGateTimeout:(_i,reason)=>stops.push(reason),
  hostGenerationActivity:()=>({strong:strong||dom,weak,active:strong||dom||weak}),
 };
 Object.defineProperty(ctx,'isGenerating',{get:()=>weak});
 const context=vm.createContext(sandbox);
 for(const [file,names]of Object.entries({earlyBody:['clearAutomaticHostGenerationSettlement','automaticHostGenerationPhaseBaseline','beginAutomaticHostGeneration','unlockAutomaticGenerationCutover','automaticHostGenerationRenderMatches','automaticHostRenderProof','refreshAutomaticHostGenerationEvidence','automaticHostGenerationSettlementCandidate','settleAutomaticHostGeneration','suppressesAutomaticGeneration','activateAuthorizedAutomaticGeneration','finalizeAutomaticHostGeneration','scheduleAutomaticHostGenerationSettlement'],mount:['automaticAuthorizationLineage','stampAutomaticAuthorizationEpoch','generationPollKey','generationWaitPollDelay','confirmFinalRenderedGeneration','refreshUnpaidAutomaticAuthorization','scheduleMessageGeneration'],connection:['externalHostGenerationActivity']}))for(const name of names)install(context,file,name);
 for(const name of ['automaticHostSettlementActivity','preserveCompletedAutomaticHostGeneration'])install(context,'earlyBody',name,true);
 return {ctx,msg,owner,cutover,context,stops,polls,requests,dispatches:()=>dispatched,
  weak(value){weak=value;},strong(value){strong=value;},dom(value){dom=value;},start(){context.scheduleAutomaticHostGenerationSettlement();},
  newStart(type='normal'){return context.beginAutomaticHostGeneration(ctx,type,false,false);},
  changeChat(){chatId='other';},
  advance(ms){const end=now+ms;let count=0;while(timers.size){const [key,timer]=[...timers].sort((a,b)=>a[1].at-b[1].at)[0];if(timer.at>end)break;assert.ok(++count<10000);timers.delete(key);now=timer.at;timer.fn();}now=end;},
 };
}

test('ended rendered body generates once despite a leftover weak host flag',()=>{
 const h=harness();h.weak(true);h.start();h.advance(2500);
 assert.equal(h.dispatches(),1);assert.equal(h.stops.length,0);h.advance(2000);assert.equal(h.dispatches(),1);
});
test('strong host activity still blocks a terminal-backed render',()=>{
 for(const flag of ['strong','dom']){const h=harness();h[flag](true);h.start();h.advance(2000);assert.equal(h.dispatches(),0);
 h[flag](false);h.advance(2500);assert.equal(h.dispatches(),1);}
});
test('weak flags cannot turn missing terminal proof or tool-intermediate output into completion',()=>{
 for(const alter of [h=>{h.owner.terminalSeen=false;},h=>{h.owner.intermediateRender={index:1};h.owner.tentativeRender=null;},h=>{h.owner.auxiliaryTerminalPending=true;},h=>{h.owner.terminalReason='GENERATION_STOPPED';},h=>{h.ctx.streamingProcessor={messageId:1,isFinished:true,toolCalls:[{}]};},h=>{h.ctx.streamingProcessor={messageId:1,isStopped:true};}]){
  const h=harness();alter(h);h.weak(true);h.start();h.advance(2500);assert.equal(h.dispatches(),0);
 }
});
test('tool-recursive normal start keeps its phase ownership and cannot hand off an intermediate reply',()=>{
 const h=harness();h.start();h.advance(100);
 assert.equal(h.context.beginAutomaticHostGeneration(h.ctx,'normal',true,false),'nested');
 assert.equal(h.cutover.activeHostGeneration,h.owner);assert.equal(h.owner.phase,1);
 h.advance(2500);assert.equal(h.dispatches(),0);assert.equal(h.polls.size,0);
});
test('next normal start keeps the previous completed owners remaining stability window',()=>{
 const h=harness();h.start();h.advance(100);h.ctx.chat.push({is_user:true,mes:'next question'});
 assert.equal(h.newStart(),'new');assert.equal(h.polls.size,1);
 h.advance(419);assert.equal(h.dispatches(),0);h.advance(2000);assert.equal(h.dispatches(),1);
 h.advance(2000);assert.equal(h.dispatches(),1);
});
test('next normal start transfers the old proof but waits while the new host generation is active',()=>{
 const h=harness();h.start();h.advance(100);h.ctx.chat.push({is_user:true,mes:'next question'});h.strong(true);h.newStart();
 h.advance(2000);assert.equal(h.dispatches(),0);assert.equal(h.polls.size,1);
 h.ctx.chat.push({mes:'second reply',swipe_id:0});
 h.strong(false);h.advance(2500);assert.equal(h.dispatches(),1);
 assert.equal(h.requests[0].index,1);assert.equal(h.requests[0].message,h.msg);assert.equal(h.requests[0].body,'finished body');
});
test('old body postprocessing waits for the next lifecycle to finish before refreshing its own authorization',()=>{
 const h=harness();h.start();h.advance(100);h.ctx.chat.push({is_user:true,mes:'next question'});h.strong(true);h.newStart();
 h.msg.mes+=' postprocessed';h.ctx.chat.push({mes:'second reply',swipe_id:0});h.advance(2000);
 assert.equal(h.dispatches(),0);assert.equal(h.polls.size,1);
 h.strong(false);h.advance(1000);assert.equal(h.dispatches(),0,'active newer lifecycle retains ownership');
 h.cutover.activeHostGeneration=null;h.advance(3000);
 assert.equal(h.dispatches(),1);assert.equal(h.requests[0].index,1);assert.equal(h.requests[0].message,h.msg);
 assert.equal(h.requests[0].body,'finished body postprocessed');
});
test('new swipe, regenerate or continue cannot inherit prior completion',()=>{
 for(const type of ['swipe','regenerate','continue']){const h=harness();h.start();h.advance(100);h.newStart(type);h.advance(2500);assert.equal(h.dispatches(),0);assert.equal(h.polls.size,0);}
});
test('changed chat, message identity, swipe, body or intermediate phase cannot transfer an old owner',()=>{
 for(const alter of [h=>h.changeChat(),h=>{h.ctx.chat[1]={...h.msg};},h=>{h.msg.swipe_id++;},h=>{h.msg.mes+=' changed';},h=>{h.owner.intermediateRender={index:1};},h=>{h.owner.auxiliaryTerminalPending=true;},h=>{h.owner.terminalSeen=false;},h=>{h.ctx.streamingProcessor={messageId:1,isFinished:true,toolCalls:[{}]};}]){
  const h=harness();h.start();h.advance(100);alter(h);h.newStart();h.advance(2500);assert.equal(h.dispatches(),0);assert.equal(h.polls.size,0);
 }
});
test('a preserved owner is still cancelled by a later source replacement before dispatch',()=>{
 const h=harness();h.start();h.advance(100);h.newStart();h.ctx.chat[1]={mes:'replacement',swipe_id:1};h.advance(2500);assert.equal(h.dispatches(),0);assert.equal(h.polls.size,0);
});
