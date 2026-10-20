// CUA-accessible browser harness. It serves real candidate modules and styles;
// only missing host services and an update checker are replaced at this boundary.
import http from 'node:http';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>每面抽取 · 真实模块本地验证</title>
<link rel="stylesheet" href="/style.css"><link rel="stylesheet" href="/settings-ui.css">
<style>body{font:16px/1.6 system-ui;background:#eee;color:#334;margin:12px}button{min-height:44px}input,select,textarea{font:inherit}.text_pole{background:white;color:#334;border:1px solid #bbb}#host{transform:translateX(0);width:240px;height:180px;overflow:hidden}#host>span{display:block}#status{white-space:pre-wrap;overflow-wrap:anywhere}</style>
<h1>每面抽取 · 本地验证</h1><button id="open">打开每面设置</button><button id="tt">切换 TT 宿主样式</button><button id="inspect">显示已保存设置</button><div id="extensionsMenu"></div><div id="host"><span>受限宿主容器：240 × 180，overflow:hidden</span></div><pre id="status" role="status">加载中</pre>
<script type="module">
import {buildRabbitMirrorSettingsDialogHtml} from '/src/ui/settingsTemplate.js';
import {mountSettingsAppearance} from '/src/settingsAppearance.js';
import {renderFaceDrawSettings} from '/src/faceDrawUi.js';
import {getSettings,updateSettings} from '/src/settings.js';
import {normalizePresentationModes} from '/src/presentationMode.js';
window.SillyTavern={getContext:()=>({chatId:'local-face-draw',chat:[]})};
const status=document.querySelector('#status');
document.querySelector('#host').insertAdjacentHTML('beforeend',buildRabbitMirrorSettingsDialogHtml());
const root=document.querySelector('#rabbit_mirror_theater_settings');
const catalog={theme:[{id:'builtin:D',title:'世界观 / 侧写',source:'builtin',items:[{id:'D.1',title:'童话世界'},{id:'D.2',title:'校园世界'},{id:'D.3',title:'森林冒险'}]},{id:'builtin:C',title:'日常生活',source:'builtin',items:[{id:'C.1',title:'雨后散步'},{id:'C.2',title:'灯下谈心'}]},{id:'external:sample',title:'外置世界书（离线示例）',source:'external',items:[{id:'ext:sample:theme:1',title:'星海的相逢'}]}],format:[{id:'builtin:2',title:'纸本与实物',source:'builtin',items:[{id:'2.1',title:'信件'},{id:'2.2',title:'相册'}]}],text:[{id:'external:stories',title:'故事库（离线示例）',source:'external',items:[{id:'ext:stories:text:1',title:'归来以后'}]}],warnings:[]};
function render(){
 const s=getSettings(),modes=normalizePresentationModes(s.rabbitMirrorPresentationModes);
 for(let i=0;i<5;i++){const row=root.querySelector('[data-rh-presentation-row="'+i+'"]');row.style.display=i<s.rabbitMirrorFaceCount?'flex':'none';row.hidden=i>=s.rabbitMirrorFaceCount;root.querySelector('#rh_face_mode_'+i).value=modes[i];}
 root.querySelector('#rh_multiface_enabled').checked=s.rabbitMirrorFaceCount>1;
 root.querySelector('#rh_multiface_count_row').style.display=s.rabbitMirrorFaceCount>1?'':'none';
 root.querySelector('#rh_multiface_count_row').hidden=s.rabbitMirrorFaceCount<=1;
 root.querySelector('#rh_multiface_count').value=String(Math.max(2,s.rabbitMirrorFaceCount));
 renderFaceDrawSettings(root.querySelector('#rh_face_presentation_modes'),s,{getSettings,updateSettings,loadCatalog:async()=>catalog});
}
if(!localStorage.getItem('feature-host-settings'))updateSettings({rabbitMirrorFaceCount:2});
mountSettingsAppearance(root);render();
root.addEventListener('change',e=>{if(e.target.id==='rh_multiface_enabled'){updateSettings({rabbitMirrorFaceCount:e.target.checked?2:1});render();}if(e.target.id==='rh_multiface_count'){updateSettings({rabbitMirrorFaceCount:Number(e.target.value)});render();}if(e.target.id.startsWith('rh_face_mode_')){const i=Number(e.target.id.slice(-1)),modes=normalizePresentationModes(getSettings().rabbitMirrorPresentationModes);modes[i]=e.target.value;updateSettings({rabbitMirrorPresentationModes:modes});render();}});
document.querySelector('#open').onclick=()=>{root.__rabbitMirrorWorkbench.open();root.__rabbitMirrorWorkbench.navigate('faces');};
document.querySelector('#tt').onclick=()=>{root.dataset.rmHost=root.dataset.rmHost==='tauritavern'?'sillytavern':'tauritavern';status.textContent='样式标记：'+root.dataset.rmHost;};
document.querySelector('#inspect').onclick=()=>{const s=getSettings();status.textContent=JSON.stringify({modes:s.rabbitMirrorPresentationModes,rules:s.rabbitMirrorFaceDrawRules,presets:s.rabbitMirrorFaceDrawPresets},null,2);};
status.textContent='真实设置页面、每面编辑模块及样式已加载。目录为离线示例；保存只写本页 localhost。';
</script></html>`;
const server = http.createServer(async (req, res) => {
    try {
        const url = new URL(req.url, 'http://127.0.0.1');
        if (url.pathname === '/') { res.setHeader('Content-Type', 'text/html;charset=utf-8'); res.end(html); return; }
        const overrides = {
            '/extensions.js': 'export const extension_settings=JSON.parse(localStorage.getItem("feature-host-settings")||"{}");',
            '/script.js': 'import {extension_settings} from "/extensions.js";export const saveSettingsDebounced=()=>localStorage.setItem("feature-host-settings",JSON.stringify(extension_settings));export const getRequestHeaders=()=>({});',
            '/src/mirrorUpdateMenu.js': 'export const mountSettingsUpdateChrome=()=>{};export const refreshRabbitMirrorUpdateOnOpen=()=>{};',
        };
        if (overrides[url.pathname]) { res.setHeader('Content-Type', 'text/javascript;charset=utf-8');res.end(overrides[url.pathname]);return; }
        const file = path.resolve(project, '.' + decodeURIComponent(url.pathname));
        if (!file.startsWith(project + path.sep)) { res.writeHead(403);res.end();return; }
        res.setHeader('Content-Type', file.endsWith('.css') ? 'text/css' : 'text/javascript;charset=utf-8');
        res.end(await readFile(file));
    } catch (error) { res.writeHead(404); res.end('Not found'); }
});
server.listen(Number(process.argv[2]) || 0,'127.0.0.1',()=>console.log('http://127.0.0.1:'+server.address().port+'/'));
