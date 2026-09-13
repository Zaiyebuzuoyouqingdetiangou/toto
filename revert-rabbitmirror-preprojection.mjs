import fs from 'node:fs';
import path from 'node:path';
const target = path.resolve(process.cwd(), 'src/scripts/extensions.js');
const backup = `${target}.rabbitmirror-223be954.bak`;
if (!fs.existsSync(backup)) throw new Error(`未找到备份 ${backup}`);
fs.copyFileSync(backup, target);
console.log('已恢复应用补丁前的 extensions.js。');
