// 生成 data.js：合并 objects.js（道具/饰品/卡牌/药丸）与 achievements.txt（成就）
// 用法: node build/make_data.js（任意目录均可）
const fs = require('fs');
const path = require('path');

const HERE = __dirname;
const sandbox = {};
new Function('window', fs.readFileSync(path.join(HERE, 'objects.js'), 'utf8'))(sandbox);
const rows = sandbox.IsaacObjectRows;

const achText = fs.readFileSync(path.join(HERE, 'achievements.txt'), 'utf8');
const achievements = [];
achText.split(/\r?\n/).forEach((line, i) => {
  const name = line.trim();
  if (name) achievements.push([i + 1, name]);
});

const out = `// 自动生成，请勿手改。来源：
// 对象数据: https://github.com/boyl/isaac-chinese-console (desktop/objects.js)
// 成就英文名: https://github.com/Higeners/isaacunlocker (src/Achievements.txt)
// 行 N = 成就 ID N。对象行格式: [前缀, ID, 中文名, 英文名, 全拼, 首字母]
window.ISAAC_DATA = {
  objects: ${JSON.stringify(rows)},
  achievements: ${JSON.stringify(achievements)}
};
`;
fs.writeFileSync(path.join(HERE, '..', 'data.js'), out);
console.log('objects:', rows.length, 'achievements:', achievements.length);
