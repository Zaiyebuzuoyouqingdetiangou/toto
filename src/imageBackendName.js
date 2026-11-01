import { rmT as __rmT } from "./textTable.js?rmv=2.12.1";
export const IMAGE_BACKENDS = ['baibai', 'chatu8', 'iphonie'];
export function normalizeImageBackend(value) { return IMAGE_BACKENDS.includes(value) ? value : 'baibai'; }
export function imageBackendName(value) { return value === 'chatu8' ? __rmT("OyY9PHpS") : value === 'iphonie' ? __rmT("KFgLaN_B4l0MSpRh0eLXdub_7bh") : __rmT("lo7wSMYV"); }
