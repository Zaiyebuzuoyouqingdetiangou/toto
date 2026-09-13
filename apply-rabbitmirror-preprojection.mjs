import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const target = path.resolve(process.cwd(), 'src/scripts/extensions.js');
const backup = `${target}.rabbitmirror-223be954.bak`;
if (!fs.existsSync(target)) throw new Error(`未找到 ${target}；请在 TauriTavern 源码根目录运行。`);

const source = fs.readFileSync(target, 'utf8');
const already = source.includes("participantId: 'rabbitmirror/message-runtime'")
    && source.includes("manifest?.generate_interceptor === 'rabbitMirrorGenerateInterceptor'");
if (already) {
    console.log('RabbitMirror preprojection 修复已经存在，无需重复应用。');
    process.exit(0);
}

const oldBlock = `/**
 * Activates the one known renderer required by bounded ChatSurface before any
 * chat is materialized. Capability verification remains a separate host step.
 */
export async function activateRequiredChatSurfaceExtensions() {
    const enabled = getEnabledChatSurfaceRendererCapabilities();
    if (enabled.length > 1) {
        throw new Error(
            'Bounded ChatSurface cannot start while JS-Slash-Runner and LittleWhiteBox are both enabled',
        );
    }
    if (enabled.length === 0) {
        return Object.freeze([]);
    }

    const requiredNames = new Set(enabled.map(capability => capability.internalName));
    await activateExtensions({
        parallelism: 1,
        includeExtension: name => requiredNames.has(name),
        resetErrors: false,
    });

    return Object.freeze(enabled.map(({ extensionName, participantId }) => Object.freeze({
        extensionName,
        participantId,
    })));
}`;

const newBlock = `/**
 * Activates known renderers and RabbitMirror's registration entry before any
 * chat is materialized. Capability verification remains a separate host step.
 */
export async function activateRequiredChatSurfaceExtensions() {
    const enabled = getEnabledChatSurfaceRendererCapabilities();
    if (enabled.length > 1) {
        throw new Error(
            'Bounded ChatSurface cannot start while JS-Slash-Runner and LittleWhiteBox are both enabled',
        );
    }

    // RabbitMirror decorates messages; it must not claim the exclusive code
    // renderer slot. Match its registration entry, not a user-renamable folder.
    const decorators = Object.entries(manifests)
        .filter(([name, manifest]) => isDeferredThirdPartyExtension(name)
            && !extension_settings.disabledExtensions.includes(name)
            && manifest?.generate_interceptor === 'rabbitMirrorGenerateInterceptor'
            && typeof manifest.js === 'string'
            && manifest.js.split(/[?#]/)[0] === 'tt-entry.js')
        .map(([internalName]) => ({
            extensionName: 'RabbitMirror',
            participantId: 'rabbitmirror/message-runtime',
            internalName,
        }));
    if (decorators.length > 1) {
        throw new Error('Bounded ChatSurface cannot start while multiple RabbitMirror installations are enabled');
    }

    const required = [...enabled, ...decorators];
    if (required.length === 0) {
        return Object.freeze([]);
    }

    const requiredNames = new Set(required.map(capability => capability.internalName));
    await activateExtensions({
        parallelism: 1,
        includeExtension: name => requiredNames.has(name),
        resetErrors: false,
    });

    return Object.freeze(required.map(({ extensionName, participantId }) => Object.freeze({
        extensionName,
        participantId,
    })));
}`;

const hits = source.split(oldBlock).length - 1;
if (hits !== 1) {
    throw new Error(`安全停止：预期原始函数块出现 1 次，实际 ${hits} 次。当前 TT 源码可能不是 223be954afa7 基线，请不要强行覆盖。`);
}
if (!fs.existsSync(backup)) fs.copyFileSync(target, backup);
const next = source.replace(oldBlock, newBlock);
fs.writeFileSync(target, next, 'utf8');
const sha = crypto.createHash('sha256').update(next).digest('hex');
console.log('已应用 RabbitMirror TT preprojection 修复。');
console.log(`备份：${backup}`);
console.log(`patched extensions.js SHA-256: ${sha}`);
