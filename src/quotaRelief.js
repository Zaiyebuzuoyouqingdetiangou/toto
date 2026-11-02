const relievers = new Map();
export function registerQuotaReliever(name, run) {
    if (typeof run === 'function')
        relievers.set(String(name), run);
}
export function hasQuotaReliever(name) { return relievers.has(String(name)); }
export function runQuotaReliever(name, ...args) {
    const run = relievers.get(String(name));
    if (typeof run !== 'function')
        return false;
    try {
        return run(...args);
    }
    catch {
        return false;
    }
}
