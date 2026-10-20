// Local CUA fixture: production catalog, editor, public API and IndexedDB;
// only the provider transport is simulated. No provider network calls.
import http from 'node:http';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const page = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>图鉴草稿 · 本地验证</title>
<style>body{margin:20px;font:16px/1.6 system-ui;background:#f3f5ef;color:#254330}button,select{font:inherit;min-height:44px;padding:8px 12px;margin:4px}pre{white-space:pre-wrap;overflow-wrap:anywhere}h1{font-size:22px}.fixture-tools{display:flex;flex-wrap:wrap;gap:8px;border-block:1px dashed currentColor;padding:8px 0;margin-bottom:12px}.fixture-tools button{font-size:12px}</style>
<h1>图鉴草稿 · 本地验证</h1><p>真实编辑器、条目目录与本地存储；模型回答由本页模拟，不连接真实 API。</p><button id="open">打开收藏夹</button><button id="nested">从受限宿主弹层打开</button><pre id="result" role="status">正在加载…</pre>
<script type="module">
import { getSettings } from '/src/settings.js';
import { createRabbitMirrorPublicAPI } from '/src/publicApiCore.js';
import * as favorites from '/src/theaterFavorites.js';
import * as atlases from '/src/favoriteAtlases.js';
let mode='success',requests=0,stops=0,leaseCalls=0,pending=null;
const result=document.getElementById('result');
function report(){const text='模拟请求 '+requests+' 次 · 停止 '+stops+' 次 · 当前模式 '+mode+(pending?' · 请求等待中':'');result.textContent=text;document.querySelectorAll('[data-fixture-count]').forEach(node=>node.textContent=text)}
const handle=createRabbitMirrorPublicAPI({isActive:()=>true,getSettings,complete:async(settings,system,prompt,options)=>{
  if(!options.dispatchLease.consume())throw Error('重复请求');requests++;leaseCalls++;
  if(options.dispatchLease.consume())throw Error('租约被重复使用');
  const input=JSON.parse(prompt),source=input.entries.find(item=>/西方神秘学|塔罗/.test(item.title));
  if(!source)throw Error('测试目录没有找到神秘学条目');
  const content=JSON.stringify({relatedIds:[source.id],slots:[{label:'愚者',keywords:['The Fool','0号愚者牌']},{label:'魔术师',keywords:['The Magician']},{label:'女祭司',keywords:['The High Priestess']}]});
  report();
  if(mode==='failure')throw Error('模拟连接失败');
  if(mode==='invalid')return {response:{ok:true},result:{text:'{"slots":['}};
  if(mode==='pending')await new Promise(resolve=>{pending=resolve;report()});
  return {response:{ok:true},result:{text:content}};
}});
window.RabbitMirrorAPI={...handle.api,stop(){stops++;const value=handle.api.stop();report();return value}};
function controls(panel){
 const tools=document.createElement('div');tools.className='fixture-tools';
 for(const [key,label] of [['success','模拟成功'],['failure','模拟失败'],['invalid','模拟不完整草稿'],['pending','保持请求等待']]){
  const button=document.createElement('button');button.textContent=label;button.addEventListener('click',()=>{mode=key;report()});tools.append(button);
 }
 const finish=document.createElement('button');finish.textContent='返回等待中的结果';finish.addEventListener('click',()=>{const complete=pending;pending=null;complete?.();report()});tools.append(finish);
 const status=document.createElement('p');status.dataset.fixtureCount='true';status.setAttribute('role','status');
 const inspect=document.createElement('button');inspect.textContent='显示已保存图鉴';inspect.addEventListener('click',async()=>{let output=panel.querySelector('[data-fixture-definitions]');if(!output){output=document.createElement('pre');output.dataset.fixtureDefinitions='true';panel.append(output)}output.textContent=JSON.stringify(await atlases.listFavoriteAtlases(),null,2)});tools.append(inspect);
 panel.prepend(tools,status);report();
}
async function open(){await favorites.openTheaterFavoriteLibrary(async(stage,record)=>{stage.innerHTML=record.html});controls(document.querySelector('[data-rm-favorite-atlases]'))}
await favorites.saveTheaterFavorite({id:'draft-fixture-fool',title:'愚者',html:'<details><summary>愚者</summary><article><h2>愚者</h2><p>这是保留的原始收藏正文，不会重新生成。</p></article></details>'});
await favorites.saveTheaterFavorite({id:'draft-fixture-magician',title:'魔术师',html:'<details><summary>魔术师</summary><article><h2>魔术师</h2><p>第二面原始收藏。</p></article></details>'});
document.getElementById('open').addEventListener('click',()=>open().catch(error=>result.textContent=error.message));
document.getElementById('nested').addEventListener('click',async()=>{const host=document.createElement('dialog');host.id='rabbit_mirror_theater_settings';host.style.cssText='width:240px;max-height:180px;overflow:hidden;transform:translateZ(0)';host.textContent='受限宿主设置弹层';document.body.append(host);host.showModal();await open()});
window.fixture={atlases,favorites,get counts(){return {requests,stops,leaseCalls}},open};report();
</script></html>`;

const server = http.createServer(async (req, res) => {
    try {
        const url = new URL(req.url, 'http://localhost');
        res.setHeader('Cache-Control', 'no-store');
        if (url.pathname === '/') { res.setHeader('Content-Type', 'text/html;charset=utf-8'); res.end(page); return; }
        res.setHeader('Content-Type', 'text/javascript;charset=utf-8');
        if (url.pathname === '/extensions.js') { res.end('export const extension_settings={rabbit_mirror_theater:{enabled:false,generationMode:"follow",independentConnectionProfileId:"fixture",independentMaxRequestChars:2000000}}'); return; }
        if (url.pathname === '/script.js') { res.end('export const saveSettingsDebounced=()=>{}'); return; }
        if (url.pathname === '/src/runtimeAnimationState.js') { res.end('export const restoreRuntimeAnimationClone=(_,clone)=>clone;'); return; }
        const target = path.resolve(root, '.' + decodeURIComponent(url.pathname));
        if (!target.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
        res.end(await readFile(target));
    } catch { res.writeHead(404).end(); }
});
server.listen(Number(process.argv[2]) || 0, '127.0.0.1', () => console.log('Atlas draft CUA harness: http://127.0.0.1:' + server.address().port));
