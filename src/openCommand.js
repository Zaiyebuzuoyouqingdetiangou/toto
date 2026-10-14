// 备用入口：在聊天输入框打 /兔子镜（或 /rabbitmirror）回车，打开兔子镜设置。
// 魔法棒入口被别的插件藏掉时也能进来。只注册命令，不做别的事。
const NAME = '兔子镜';
const ALIASES = ['rabbitmirror'];
let registered = null;

export function registerRabbitMirrorOpenCommand(open) {
    const context = globalThis.SillyTavern?.getContext?.();
    const parser = context?.SlashCommandParser;
    const SlashCommand = context?.SlashCommand;
    if (!parser?.addCommandObject || typeof SlashCommand?.fromProps !== 'function') return false;
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
    parser.addCommandObject(command);
    // 酒馆同名命令后注册的覆盖先注册的；没登记上就如实返回 false，提示里就不教用户打它。
    if (parser.commands && parser.commands[NAME] !== command) return false;
    registered = { parser, command };
    return true;
}

export function unregisterRabbitMirrorOpenCommand() {
    const current = registered;
    registered = null;
    if (!current?.parser?.commands) return;
    for (const name of [NAME, ...ALIASES]) {
        try { if (current.parser.commands[name] === current.command) delete current.parser.commands[name]; } catch {}
    }
}
