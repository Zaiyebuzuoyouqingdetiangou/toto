// Keep author CSS with the face whenever a prepared fragment is serialized as
// details.outerHTML. This moves existing inert nodes; it does not sanitize CSS,
// generate styles, read the live host, or change class/ID/scope identifiers.
export function preserveIndependentFaceStyles(details) {
 if(!details?.querySelectorAll || details.isConnected) return details;
 const wrapper=details.closest('toto');
 const boundary=wrapper || details.getRootNode();
 // Callers parse detached templates. Never collect styles from a live document.
 if(!boundary?.querySelectorAll || boundary.nodeType===9) return details;
 const styles=[...boundary.querySelectorAll('style')].filter(style=>
  !style.closest('details') && style.closest('toto')===wrapper);
 const before=[]; const after=[];
 for(const style of styles){
  // DOCUMENT_POSITION_FOLLOWING: details occurs after this stylesheet.
  (style.compareDocumentPosition(details)&4 ? before : after).push(style);
 }
 const summary=details.querySelector(':scope > summary');
 const reference=summary ? summary.nextSibling : details.firstChild;
 for(const style of before){
  if(reference) details.insertBefore(style,reference);
  else details.append(style);
 }
 for(const style of after) details.append(style);
 return details;
}
