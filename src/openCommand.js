import { rmT as __rmT } from "./textTable.js?rmv=2.0.0";
const NAME = __rmT("9.JSSv1i");
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
    if (typeof parser?.addCommandObject === 'function')
        return parser;
    if (typeof parser?.constructor?.addCommandObject === 'function')
        return parser.constructor;
    return null;
}
function isOurCommand(command) {
    return command?.[MARK] === true;
}
function makeCommand(SlashCommand, open) {
    const command = SlashCommand.fromProps({
        name: NAME,
        aliases: ALIASES,
        helpString: __rmT("GZCUiWaNgoCPHZX1lvmaYBMFltYAB0Ofxqpfb0xU.3ZXN3yduAA_1b16Ux.VOlAeTtqSvFGP"),
        returns: __rmT("QrG"),
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
        if (item.parser === parser || (map && item.parser?.commands === map))
            item.command = command;
    }
    if (!registrations.some(item => item.parser === parser))
        registrations.push({ parser, command });
}
function publish(parser, command) {
    const map = parser?.commands;
    if (!map || map[NAME] === command)
        return !map || map[NAME] === command;
    if (map[NAME] && !isOurCommand(map[NAME]))
        return false;
    map[NAME] = command;
    for (const alias of ALIASES) {
        if (!map[alias] || isOurCommand(map[alias]))
            map[alias] = command;
    }
    return map[NAME] === command;
}
export function registerCommandOnParser(parser, SlashCommand, open) {
    const target = commandClassOf(parser);
    if (!target || typeof SlashCommand?.fromProps !== 'function' || typeof open !== 'function')
        return false;
    const existing = target.commands?.[NAME] || parser?.commands?.[NAME];
    if (existing && !isOurCommand(existing))
        return false;
    const command = makeCommand(SlashCommand, open);
    const takenAliases = ALIASES.filter(alias => { const held = target.commands?.[alias]; return held && !isOurCommand(held); })
        .map(alias => [alias, target.commands[alias]]);
    try {
        target.addCommandObject(command);
    }
    catch (error) {
        console.warn(__rmT("WtD6m1d1XI28J_V0nnwpu5bDVXu8DF4JLT.VpopZ.BTNI2x.iaKBgDUsdJzWiSON"), error);
        return false;
    }
    for (const [alias, held] of takenAliases) {
        try {
            target.commands[alias] = held;
        }
        catch { }
    }
    if (!publish(target, command) || !publish(parser, command))
        return false;
    remember(target, command);
    if (parser !== target)
        remember(parser, command);
    return true;
}
export function registerRabbitMirrorOpenCommand(open) {
    const context = globalThis.SillyTavern?.getContext?.();
    return registerCommandOnParser(context?.SlashCommandParser, context?.SlashCommand, open);
}
function contextSlashCommand() {
    return globalThis.SillyTavern?.getContext?.()?.SlashCommand;
}
export async function ensureRabbitMirrorOpenCommand(open) {
    const token = generation;
    let ok = registerRabbitMirrorOpenCommand(open);
    if (typeof document === 'undefined' || token !== generation)
        return token === generation && ok;
    try {
        const [parserMod, commandMod, slashMod] = await Promise.all([
            import(PARSER_URL),
            import(COMMAND_URL),
            import(SLASH_URL),
        ]);
        if (token !== generation)
            return false;
        const SlashCommand = commandMod?.SlashCommand || contextSlashCommand();
        const parsers = [parserMod?.SlashCommandParser, slashMod?.parser, slashMod?.parser?.constructor];
        for (const parser of parsers) {
            if (registerCommandOnParser(parser, SlashCommand, open))
                ok = true;
        }
    }
    catch (error) {
        console.warn(__rmT("Zq3IjumLG89pl.YqLtxik1wStVX3EcxrGlv50WFEu7WtSbPULSxjgNy5Sc7rHfly_tG_Ss0DUMZ.7dbtrRRFuhIm"), error);
    }
    if (ok && token === generation)
        console.info(__rmT("8IJZNwWOYG6TRqZRrIfVGN_4EV5.RmwCuDZ_QN_Q09dO1TFfgmyaZ6JDbt9Bqk"));
    return token === generation && ok;
}
function clearRetries() {
    for (const timer of retryTimers)
        clearTimeout(timer);
    retryTimers = [];
    const listener = readyListener;
    readyListener = null;
    if (!listener)
        return;
    try {
        const context = globalThis.SillyTavern?.getContext?.();
        const source = context?.eventSource;
        const type = context?.eventTypes?.APP_READY;
        source?.removeListener?.(type, listener);
        source?.off?.(type, listener);
    }
    catch { }
}
export function watchRabbitMirrorOpenCommand(open, isActive = () => true, onAvailable = () => { }) {
    const token = generation;
    const attempt = () => {
        if (token !== generation || !isActive())
            return;
        const syncOk = registerRabbitMirrorOpenCommand(open);
        try {
            onAvailable(syncOk);
        }
        catch { }
        void ensureRabbitMirrorOpenCommand(open).then(ok => {
            if (token !== generation || !isActive())
                return;
            try {
                onAvailable(ok || syncOk);
            }
            catch { }
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
    }
    catch { }
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
        if (!map)
            continue;
        for (const name of [NAME, ...ALIASES]) {
            try {
                if (map[name] === command)
                    delete map[name];
            }
            catch { }
        }
    }
}
