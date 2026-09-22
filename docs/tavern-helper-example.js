// Copy these helpers into a TavernHelper script. No request runs on import.
export async function getRabbitMirrorAPI(timeoutMs = 5000) {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
        let frame = window;
        for (let depth = 0; depth < 8; depth++) {
            try {
                const api = frame.RabbitMirrorAPI;
                if (api?.version?.startsWith('1.') && api.getStatus()) return api;
                if (frame.parent === frame) break;
                frame = frame.parent;
            } catch { break; }
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    throw new Error('未找到兔子镜脚本接口：确认已安装接口版并刷新，且脚本与酒馆同源。');
}

// Bind this to an explicit user button. This call may incur provider fees.
export async function generateFromMySettings(prompt) {
    const api = await getRabbitMirrorAPI();
    return (await api.generate({ prompt, includeMemory: true })).text;
}

// This reads selected memory only; it sends no model request.
export async function readMyMemory() {
    return (await getRabbitMirrorAPI()).memory.read();
}

export async function stopMyRequest() {
    return (await getRabbitMirrorAPI()).stop();
}
