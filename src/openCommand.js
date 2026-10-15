// 备用入口：在聊天输入框打 /兔子镜（或 /rabbitmirror）回车，打开兔子镜设置。
// 魔法棒入口被别的插件藏掉时也能进来。只注册命令，不做别的事。
//
// 鸡尾酒+会把 /script.js 指到另一份模块，并且把扩展激活推迟到主界面之后。
// 聊天输入实际解析用的 SlashCommandParser，和 getContext() 拿到的那份，可能不是同一个模块。
// 只登记在 getContext() 上时，输入框会报 Unknown command: "/兔子镜"，设置打不开。
const NAME = '兔子镜';
const ALIASES = ['rabbitmirror'];
const MARK = Symbol.for('rabbit-mirror-open-command');
const PARSER_URL = '/scripts/slash-commands/SlashCommandParser.js';
const COMMAND_URL = '/scripts/slash-commands/SlashCommand.js';
const SLASH_URL = '/scripts/slash-commands.js';
const RETRY_DELAYS = [1000, 3000, 8000];

let generation = 0;
let retryTimers = [];
let readyListener = null;
let registrations = [];

function commandClassOf(parser) {
    if (typeof parser?.addCommandObject === 'function') return parser;
    if (typeof parser?.constructor?.addCommandObject === 'function') return parser.constructor;
    return null;
}

function isOurCommand(command) {
    return command?.[MARK] === true;
}

function makeCommand(SlashCommand, open) {
    const command = SlashCommand.fromProps({
        name: NAME,
        aliases: ALIASES,
        helpString: '打开兔子镜小剧场的设置。魔法棒里找不到兔子镜时用这个。',
        returns: '空',
        callback: () => {
            void open();
            return '';
        },
    });
    command[MARK] = true;
    return command;
}

function remember(parser, command) {
    const map = parser?.commands;
    for (const item of registrations) {
        if (item.parser === parser || (map && item.parser?.commands === map)) item.command = command;
    }
    if (!registrations.some(item => item.parser === parser)) registrations.push({ parser, command });
}

function publish(parser, command) {
    const map = parser?.commands;
    if (!map || map[NAME] === command) return !map || map[NAME] === command;
    // 名字被别的插件占着就不动，避免把别人的命令盖掉。
    if (map[NAME] && !isOurCommand(map[NAME])) return false;
    map[NAME] = command;
    for (const alias of ALIASES) {
        if (!map[alias] || isOurCommand(map[alias])) map[alias] = command;
    }
    return map[NAME] === command;
}

// 登记到某一份解析器上。同名命令若不是我们自己的，返回 false，调用方就不会教用户去打它。
export function registerCommandOnParser(parser, SlashCommand, open) {
    const target = commandClassOf(parser);
    if (!target || typeof SlashCommand?.fromProps !== 'function' || typeof open !== 'function') return false;
    // 酒馆的 addCommandObject 会直接覆盖同名命令，所以要在登记之前看：名字被别的插件占着就不登记。
    const existing = target.commands?.[NAME] || parser?.commands?.[NAME];
    if (existing && !isOurCommand(existing)) return false;
    const command = makeCommand(SlashCommand, open);
    // 别名同理：被别的插件占着的别名，登记后改回去。
    const takenAliases = ALIASES.filter(alias => { const held = target.commands?.[alias]; return held && !isOurCommand(held); })
        .map(alias => [alias, target.commands[alias]]);
    try { target.addCommandObject(command); }
    catch (error) {
        console.warn('[RabbitMirror] /兔子镜 没登记上', error);
        return false;
    }
    for (const [alias, held] of takenAliases) { try { target.commands[alias] = held; } catch { /* ignore */ } }
    if (!publish(target, command) || !publish(parser, command)) return false;
    remember(target, command);
    if (parser !== target) remember(parser, command);
    return true;
}

export function registerRabbitMirrorOpenCommand(open) {
    const context = globalThis.SillyTavern?.getContext?.();
    return registerCommandOnParser(context?.SlashCommandParser, context?.SlashCommand, open);
}

function contextSlashCommand() {
    return globalThis.SillyTavern?.getContext?.()?.SlashCommand;
}

// 聊天输入走 /scripts/slash-commands.js 里的那份解析器。再向它登记一次。
export async function ensureRabbitMirrorOpenCommand(open) {
    const token = generation;
    let ok = registerRabbitMirrorOpenCommand(open);
    // 卸载发生在补登记的导入完成之前时，不能把刚卸掉的命令又登记回去。
    if (typeof document === 'undefined' || token !== generation) return token === generation && ok;
    try {
        const [parserMod, commandMod, slashMod] = await Promise.all([
            import(PARSER_URL),
            import(COMMAND_URL),
            import(SLASH_URL),
        ]);
        if (token !== generation) return false;
        const SlashCommand = commandMod?.SlashCommand || contextSlashCommand();
        const parsers = [parserMod?.SlashCommandParser, slashMod?.parser, slashMod?.parser?.constructor];
        for (const parser of parsers) {
            if (registerCommandOnParser(parser, SlashCommand, open)) ok = true;
        }
    } catch (error) {
        console.warn('[RabbitMirror] 补登记 /兔子镜 时没拿到酒馆解析器', error);
    }
    if (ok && token === generation) console.info('[RabbitMirror] /兔子镜 已登记');
    return token === generation && ok;
}

function clearRetries() {
    for (const timer of retryTimers) clearTimeout(timer);
    retryTimers = [];
    const listener = readyListener;
    readyListener = null;
    if (!listener) return;
    try {
        const context = globalThis.SillyTavern?.getContext?.();
        const source = context?.eventSource;
        const type = context?.eventTypes?.APP_READY;
        source?.removeListener?.(type, listener);
        source?.off?.(type, listener);
    } catch {}
}

// 鸡尾酒+可能在扩展脚本之后才把执行用的解析器换上来，所以启动后还要再试几次。
export function watchRabbitMirrorOpenCommand(open, isActive = () => true, onAvailable = () => {}) {
    const token = generation;
    const attempt = () => {
        if (token !== generation || !isActive()) return;
        const syncOk = registerRabbitMirrorOpenCommand(open);
        try { onAvailable(syncOk); } catch {}
        void ensureRabbitMirrorOpenCommand(open).then(ok => {
            if (token !== generation || !isActive()) return;
            try { onAvailable(ok || syncOk); } catch {}
        });
    };
    attempt();
    try {
        const context = globalThis.SillyTavern?.getContext?.();
        const type = context?.eventTypes?.APP_READY;
        if (type && typeof context?.eventSource?.on === 'function') {
            readyListener = () => attempt();
            context.eventSource.on(type, readyListener);
        }
    } catch {}
    for (const delay of RETRY_DELAYS) {
        retryTimers.push(setTimeout(attempt, delay));
    }
}

export function unregisterRabbitMirrorOpenCommand() {
    generation += 1;
    clearRetries();
    const current = registrations;
    registrations = [];
    for (const { parser, command } of current) {
        const map = parser?.commands;
        if (!map) continue;
        for (const name of [NAME, ...ALIASES]) {
            // 只删自己登记的那一个对象：另一份兔子镜（新装的、热更新的）登记的不动。
            try { if (map[name] === command) delete map[name]; } catch {}
        }
    }
}
