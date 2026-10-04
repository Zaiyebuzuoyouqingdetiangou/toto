import { GENERATION_PALETTE_INDEX } from '../data/structured/generationPaletteIndex.js?rmv=1.62.86';
import { composeGenerationPalette } from './generationPalettes.js?rmv=1.62.86';
import { preserveIndependentFaceStyles } from './independentApi/faceStyles.js?rmv=1.62.86';
import { paletteRecipeFor } from './paletteRecipes.js?rmv=1.62.86';
import { atmosphereNoteFromHtml } from './atmosphereChoice.js?rmv=1.62.86';

// The contract is deliberately confined to colour values. No stored template,
// selector, owner, executable HTML or arbitrary style is replayed by the tools.
const BY_CODE = new Map(GENERATION_PALETTE_INDEX.map(p => [p.code, p]));
const ROLE = '(?:on-accent|on-companion|on-object|highlight|companion|surface|shadow|accent|object|border|muted|ink|bg)';
const TOKEN = `--rmc-${ROLE}(?:-\\d+)?(?:-rgb)?`;
const DECL = () => new RegExp(`(${TOKEN})\\s*:\\s*([^;{}]+)`, 'g');
const VAR = () => new RegExp(`var\\(\\s*(${TOKEN})\\s*(?:,\\s*([^()]*))?\\)`, 'g');
const INLINE_ATTR = 'data-rm-color-inline';
const COLOR_ATTRS = new Set(['fill','stroke','stop-color','flood-color']);
const SVG_ATTR = 'data-rm-color-attrs';
const PAIR_ATTR = 'data-rm-color-style';
const ROOT_ATTR = 'data-rm-color-variant';
const COLOR_PROPS = new Set(['color','background','background-color','background-image','border-color',
    'border','border-top','border-right','border-bottom','border-left','outline',
    'border-top-color','border-right-color','border-bottom-color','border-left-color','outline-color',
    'box-shadow','text-shadow','fill','stroke','stop-color','flood-color','caret-color','accent-color',
    'text-decoration-color','column-rule-color']);

function rgb(value) {
    let text = String(value || '').trim();
    const hex = /^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.exec(text);
    if (hex) {
        text = hex[1]; if (text.length < 5) text = [...text].map(c => c+c).join('');
        return [0,2,4].map(i => parseInt(text.slice(i,i+2),16));
    }
    const channels = /^(?:rgba?\(\s*)?(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})(?:\s*[,/]\s*(?:0?\.\d+|1|0))?\s*\)?$/.exec(text);
    return channels && channels.slice(1,4).every(n => +n <= 255) ? channels.slice(1,4).map(Number) : null;
}
const hex = values => '#'+values.map(v => Math.round(Math.min(255,Math.max(0,v))).toString(16).padStart(2,'0')).join('');
function luminance(color) {
    const c = rgb(color).map(v => v/255).map(v => v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
    return c[0]*.2126+c[1]*.7152+c[2]*.0722;
}
export function roleColorContrast(a,b) {
    const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
function readable(candidate, backgrounds) {
    return [candidate,'#000000','#ffffff'].find(c => backgrounds.every(b => roleColorContrast(c,b)>=4.5)) || candidate;
}
export function mappedRoleColors(code) {
    const index=BY_CODE.get(code);if(!index)return null;
    const palette=composeGenerationPalette(index.family,index.companionFamily,index.brightness,index.surfaceFamily);
    const p=palette.roles, backgrounds=[p.background,p.surface];
    return {bg:p.background,surface:p.surface,ink:readable(p.text,backgrounds),muted:readable(p.muted,backgrounds),
        accent:p.accent,'on-accent':readable(p.onAccent,[p.accent]),companion:p.companion,
        'on-companion':readable(p.onCompanion,[p.companion]),object:p.objectSurface,
        'on-object':readable(p.onObject,[p.objectSurface]),border:p.border,
        highlight:palette.scale[index.brightness==='dark'?10:0],shadow:hex(rgb(p.background).map(v=>v*.28))};
}
function tokenRole(name) {return name.replace(/^--rmc-/,'').replace(/-rgb$/,'').replace(/-\d+$/,'');}
function mappedValue(name, raw, defaults, roles) {
    const role=tokenRole(name), target=roles[role], source=rgb(raw);if(!target||!source)return raw;
    let values=rgb(target);
    // Optional numbered shades retain their light/dark separation relative to
    // the author's base token. Alpha and gradient positions are never changed.
    const base=defaults.get('--rmc-'+role) || defaults.get('--rmc-'+role+'-rgb');
    if (/-\d+(?:-rgb)?$/.test(name) && rgb(base)) {
        const a=source.reduce((s,n)=>s+n,0)/3,b=rgb(base).reduce((s,n)=>s+n,0)/3;
        const delta=a-b;
        values=values.map(v=>delta>0?v+(255-v)*delta/Math.max(1,255-b):v*(1+delta/Math.max(1,b)));
    }
    if(name.endsWith('-rgb'))return values.map(Math.round).join(',');
    const alphaHex=/^#(?:[\da-f]{6})([\da-f]{2})$/i.exec(raw)?.[1]
        || (/^#[\da-f]{3}([\da-f])$/i.exec(raw)?.[1]||'').repeat(2);
    const alpha=/^rgba\([^)]*[,/]\s*([\d.]+)\s*\)$/i.exec(raw)?.[1];
    return alpha ? `rgba(${values.map(Math.round).join(',')},${alpha})` : hex(values)+alphaHex;
}
function replaceTokens(css, defaults, roles=null) {
    return String(css).replace(VAR(),(full,name,fallback)=>{
        const raw=defaults.get(name)||fallback?.trim();
        return rgb(raw) ? roles?mappedValue(name,raw,defaults,roles):raw : full;
    }).replace(DECL(),(full,name,raw)=>roles&&rgb(raw.trim())?`${name}:${mappedValue(name,raw.trim(),defaults,roles)}`:full);
}
function ownNodes(face,selector) {return [...(face.matches?.(selector)?[face]:[]),...face.querySelectorAll(selector)].filter(n=>n.closest(`[${ROOT_ATTR}]`)===face);}
function safeColorDeclaration(property,value) {
    if(!COLOR_PROPS.has(property)||typeof value!=='string')return false;
    // Only colour/gradient/shadow grammar. CSS escapes, resource references and
    // custom-property indirection cannot enter the runtime replay path.
    if(/[;{}<>\\@]|url\s*\(|var\s*\(|expression\s*\(/i.test(value))return false;
    const functions=[...value.matchAll(/([\w-]+)\s*\(/g)].map(m=>m[1].toLowerCase());
    return functions.every(name=>/^(?:rgb|rgba|hsl|hsla|linear-gradient|radial-gradient|conic-gradient|repeating-linear-gradient|repeating-radial-gradient|repeating-conic-gradient)$/.test(name));
}
function readInline(node) {
    try {const rows=JSON.parse(node.getAttribute(INLINE_ATTR)||'null');return Array.isArray(rows)?rows.filter(r=>
        Array.isArray(r)&&r.length===4&&safeColorDeclaration(r[0],r[1])&&safeColorDeclaration(r[0],r[2])&&['','important'].includes(r[3])):[];}catch{return [];}
}
function readAttributes(node){
    try {const rows=JSON.parse(node.getAttribute(SVG_ATTR)||'null');return Array.isArray(rows)?rows.filter(r=>
        Array.isArray(r)&&r.length===3&&COLOR_ATTRS.has(r[0])&&safeColorDeclaration(r[0],r[1])&&safeColorDeclaration(r[0],r[2])):[];}catch{return [];}
}
function writeColorProperty(node,property,value,priority){
    node.style.removeProperty(property);
    node.style.setProperty(property,value,priority);
}
export function roleColorFaces(root) {
    const all=root?.querySelectorAll?[...(root.matches?.(`[${ROOT_ATTR}]`)?[root]:[]),...root.querySelectorAll(`[${ROOT_ATTR}]`)]:[];
    return all.filter(face=>BY_CODE.has(face.getAttribute('data-rm-palette'))&&(
        (ownNodes(face,`style[${PAIR_ATTR}="original"]`).length&&ownNodes(face,`style[${PAIR_ATTR}="mapped"]`).length)
        ||ownNodes(face,`[${INLINE_ATTR}]`).some(n=>readInline(n).length)||ownNodes(face,`[${SVG_ATTR}]`).some(n=>readAttributes(n).length)));
}
export function setRoleColorVariant(root, mode) {
    if(!['original','mapped'].includes(mode))return false;
    let changed=false;
    for(const face of roleColorFaces(root)){
        for(const style of ownNodes(face,`style[${PAIR_ATTR}]`)){
            const kind=style.getAttribute(PAIR_ATTR);if(!['original','mapped'].includes(kind))continue;
            style.setAttribute('media',kind===mode?(style.getAttribute('data-rm-color-media')||'all'):'not all');
        }
        for(const node of ownNodes(face,`[${INLINE_ATTR}]`))for(const [property,a,b,priority] of readInline(node))writeColorProperty(node,property,mode==='original'?a:b,priority);
        for(const node of ownNodes(face,`[${SVG_ATTR}]`))for(const [name,a,b] of readAttributes(node))node.setAttribute(name,mode==='original'?a:b);
        face.setAttribute(ROOT_ATTR,mode);changed=true;
    }
    return changed;
}

// Called only within an existing mirror boundary, before the normal CSS scope
// and security sanitizer. Unsupported/ambiguous input is left intact, never
// refused, regenerated or interpreted as a successful recolour.
export function compileRoleColorVariants(html, { enabled=true, document:doc=globalThis.document, acceptTemplate=null }={}) {
    const source=String(html||'');
    if(!enabled||!doc?.createElement||!source.includes('--rmc-')||!source.includes('data-rm-palette'))return source;
    try {
        const template=doc.createElement('template');template.innerHTML=source;
        const faces=[...template.content.querySelectorAll('details[data-rm-palette]')].filter(n=>!n.parentElement?.closest('details'));
        let changed=false;
        for(const face of faces){
            if(face.hasAttribute(ROOT_ATTR))continue;
            const roles=mappedRoleColors(face.getAttribute('data-rm-palette'));if(!roles)continue;
            preserveIndependentFaceStyles(face);
            const styles=[...face.querySelectorAll('style')];
            const defaults=new Map();let ambiguous=false;
            const painted=[...face.querySelectorAll('[fill],[stroke],[stop-color],[flood-color]')];
            const sources=[...styles.map(s=>s.textContent),...([face,...face.querySelectorAll('[style]')].map(n=>n.getAttribute('style')||'')),
                ...painted.flatMap(n=>[...COLOR_ATTRS].map(a=>n.getAttribute(a)||''))];
            for(const css of sources)for(const m of css.matchAll(DECL())){
                const value=m[2].trim().replace(/\s*!important\s*$/,'');if(!rgb(value))continue;
                if(defaults.has(m[1])&&defaults.get(m[1])!==value)ambiguous=true;
                defaults.set(m[1],value);
            }
            for(const css of sources)for(const m of css.matchAll(VAR()))if(!rgb(defaults.get(m[1])||m[2]?.trim()))ambiguous=true;
            if(ambiguous||!defaults.size||!sources.some(s=>VAR().test(s)))continue;
            face.setAttribute(ROOT_ATTR,'mapped');
            for(const style of styles){
                const css=style.textContent;
                const a=replaceTokens(css,defaults),b=replaceTokens(css,defaults,roles);
                if(a===b){style.textContent=a;continue;}
                const mapped=style.cloneNode(false),media=style.getAttribute('media')||'all';
                mapped.removeAttribute('id');
                style.textContent=a;style.setAttribute(PAIR_ATTR,'original');style.setAttribute('data-rm-color-media',media);style.setAttribute('media','not all');
                mapped.textContent=b;mapped.setAttribute(PAIR_ATTR,'mapped');mapped.setAttribute('data-rm-color-media',media);mapped.setAttribute('media',media);style.after(mapped);
            }
            for(const node of [face,...face.querySelectorAll('[style]')]){
                const rows=[];
                const declared=String(node.getAttribute('style')||'');
                // Retain declaration order, including fixed colour longhands
                // following a variable shorthand. Geometry declarations stay put.
                for(const m of declared.matchAll(/(?:^|;)\s*([a-z-]+)\s*:\s*([^;]*)/gi)){
                    const property=m[1].toLowerCase();if(!COLOR_PROPS.has(property))continue;
                    const value=m[2].trim().replace(/\s*!important\s*$/i,''),priority=/!important\s*$/i.test(m[2])?'important':'';
                    const a=replaceTokens(value,defaults),b=replaceTokens(value,defaults,roles);
                    if(safeColorDeclaration(property,a)&&safeColorDeclaration(property,b))rows.push([property,a,b,priority]);
                }
                if(rows.some(([,a,b])=>a!==b)){
                    for(const [property,,b,priority] of rows)writeColorProperty(node,property,b,priority);
                    node.setAttribute(INLINE_ATTR,JSON.stringify(rows));
                }
            }
            for(const node of painted){
                const rows=[];
                for(const attr of COLOR_ATTRS){
                    const value=node.getAttribute(attr);if(!value||!VAR().test(value))continue;
                    const a=replaceTokens(value,defaults),b=replaceTokens(value,defaults,roles);
                    if(safeColorDeclaration(attr,a)&&safeColorDeclaration(attr,b)){rows.push([attr,a,b]);node.setAttribute(attr,b);}
                }
                if(rows.length)node.setAttribute(SVG_ATTR,JSON.stringify(rows));
            }
            changed=true;
        }
        // Keeping an original must not make a formerly valid source exceed the
        // sanitizer's existing limits. Skip the optional variant, not the face.
        if(changed&&acceptTemplate&&!acceptTemplate(template))return source;
        return changed?template.innerHTML:source;
    } catch {return source;}
}

export function activeRoleColorHtml(html) {
    // A dormant original stylesheet is not the rendered palette or a second
    // animation. Keep every other stylesheet, including unrelated media rules.
    return String(html||'').replace(/<style\b([^>]*)>[\s\S]*?<\/style>/gi,(full,attrs)=>
        /\bdata-rm-color-style=["'](?:original|mapped)["']/.test(attrs)&&/\smedia=["']not all["']/.test(attrs)?'':full)
        .replace(/\sdata-rm-color-(?:inline|attrs)=("[^"]*"|'[^']*')/gi,'');
}
export function originalRoleColorHtml(html, doc=globalThis.document) {
    if(!doc?.createElement)return String(html||'');
    const template=doc.createElement('template');template.innerHTML=String(html||'');
    const faces=roleColorFaces(template.content);setRoleColorVariant(template.content,'original');
    for(const face of faces){
        for(const style of ownNodes(face,`style[${PAIR_ATTR}]`)){
            if(style.getAttribute(PAIR_ATTR)==='mapped')style.remove();
            else {style.removeAttribute(PAIR_ATTR);style.removeAttribute('data-rm-color-media');}
        }
        for(const node of ownNodes(face,`[${INLINE_ATTR}]`))node.removeAttribute(INLINE_ATTR);
        for(const node of ownNodes(face,`[${SVG_ATTR}]`))node.removeAttribute(SVG_ATTR);
        face.removeAttribute(ROOT_ATTR);
    }
    return template.innerHTML;
}
export function roleColorEvidence(html, doc=globalThis.document) {
    if(!doc?.createElement||!String(html).includes(ROOT_ATTR))return null;
    try {
        const template=doc.createElement('template');template.innerHTML=String(html);
        const faces=roleColorFaces(template.content);if(!faces.length)return null;
        const info=faces.map(face=>({code:face.getAttribute('data-rm-palette'),mode:face.getAttribute(ROOT_ATTR)}));
        setRoleColorVariant(template.content,'original');
        return {faces:info,originalHtml:activeRoleColorHtml(template.innerHTML),
            boundary:'已净化的原配色副本与当前换色 HTML；不代表实际浏览器对比度或宿主 DOM 验收。'};
    }catch{return null;}
}

// Resolve the palette from the frozen face/ticket, not a code improvised in the
// reply. Unknown ticket choices keep the original; they never trigger a redraw.
export function bindRolePaletteCode(html, metadata, note=null, doc=globalThis.document) {
    const source=String(html||'');
    if(!metadata||!doc?.createElement||!source.includes('--rmc-'))return source;
    const menu=metadata.atmosphereMenu;
    let selected=metadata;
    if(Array.isArray(menu)&&menu.length>1){
        const index=note?.choice ?? atmosphereNoteFromHtml(source,menu).choice ?? metadata.atmosphereChoice;
        selected=Number.isInteger(index)?menu[index]:null;
    }
    const recipe=metadata.presentationMode==='text'||metadata.requestedPresentationMode==='longtext'||metadata.pureOrder
        ?null:paletteRecipeFor(selected);
    const template=doc.createElement('template');template.innerHTML=source;
    for(const face of template.content.querySelectorAll('details')){
        if(face.parentElement?.closest('details')||face.hasAttribute(ROOT_ATTR))continue;
        if(recipe)face.setAttribute('data-rm-palette',recipe.code);
        else face.removeAttribute('data-rm-palette');
    }
    return template.innerHTML;
}

function rgba(value){
    if(value==='transparent')return [0,0,0,0];
    const parts=rgb(value);if(!parts)return null;
    const text=String(value),a=/^rgba\([^)]*[,/]\s*([\d.]+)\s*\)$/i.exec(text)?.[1];
    const h=/^#(?:[\da-f]{6})([\da-f]{2})$/i.exec(text)?.[1];
    return [...parts,a==null?(h?parseInt(h,16)/255:1):Number(a)];
}
const blend=(top,bottom)=>top.slice(0,3).map((n,i)=>n*top[3]+bottom[i]*(1-top[3]));

// A bounded, user-invoked observation of the currently visible state. No
// screenshots, animation/interaction changes, retries or blanket text repaint.
// Complex image/gradient/filtered/overlapping backgrounds remain unverified.
export function inspectRoleColorReadability(root, view=root?.ownerDocument?.defaultView) {
    const report={checked:0,lowContrast:0,unverified:0,hidden:0,minRatio:null};
    if(!root?.isConnected||!view?.getComputedStyle)return report;
    const cache=new Map(),style=node=>{if(!cache.has(node))cache.set(node,view.getComputedStyle(node));return cache.get(node);};
    for(const face of roleColorFaces(root))for(const node of face.querySelectorAll('*')){
        if(node.closest('summary,style,script,[data-rabbit-mirror-tool-entry-host]')||!Array.from(node.childNodes).some(n=>n.nodeType===3&&n.textContent.trim()))continue;
        let cursor=node,hidden=false,uncertain=false,base=null;
        const layers=[];
        while(cursor?.nodeType===1){
            const cs=style(cursor);
            if(cs.display==='none'||cs.visibility==='hidden'||Number(cs.opacity||1)===0){hidden=true;break;}
            if(cursor.tagName==='DETAILS'&&!cursor.open){hidden=true;break;}
            if(Number(cs.opacity||1)<1||!['','none','normal'].includes(cs.mixBlendMode||'')||!['','none'].includes(cs.filter||'')
                ||!['','none'].includes(cs.backdropFilter||''))uncertain=true;
            // Positioned content may sit over a sibling rather than its parent.
            if(['absolute','fixed'].includes(cs.position))uncertain=true;
            if(!base){
                if(!['','none'].includes(cs.backgroundImage||''))uncertain=true;
                const color=rgba(cs.backgroundColor||'transparent');
                if(!color)uncertain=true;
                else {layers.push(color);if(color[3]===1)base=color.slice(0,3);}
            }
            cursor=cursor.parentElement;
        }
        if(hidden){report.hidden++;continue;}
        const ink=rgba(style(node).color);
        if(uncertain||!base||!ink){report.unverified++;continue;}
        for(let i=layers.length-2;i>=0;i--)base=blend(layers[i],base);
        const ratio=roleColorContrast(hex(blend(ink,base)),hex(base));
        report.checked++;if(ratio<4.5)report.lowContrast++;
        report.minRatio=report.minRatio==null?ratio:Math.min(report.minRatio,ratio);
    }
    return report;
}
