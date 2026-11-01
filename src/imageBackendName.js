import { rmT as __rmT } from "./textTable.js?rmv=2.9.1";
export const IMAGE_BACKENDS = ['baibai', 'chatu8', 'iphonie'];
export function normalizeImageBackend(value) { return IMAGE_BACKENDS.includes(value) ? value : 'baibai'; }
export function imageBackendName(value) { return value === 'chatu8' ? __rmT("OyY9PHpS") : value === 'iphonie' ? __rmT("s3XFEC__") : __rmT("lo7wSMYV"); }
