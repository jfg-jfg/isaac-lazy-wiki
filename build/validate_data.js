// 数据完整性校验：data.js 内部一致性 + PRESETS 引用 + icons 覆盖
// 用法: node build/validate_data.js
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
let fail = 0;
const bad = m => { console.log('FAIL ' + m); fail++; };
const ok = m => console.log('PASS ' + m);

// ---- data.js ----
global.window = {};
new Function(fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8'))();
const D = window.ISAAC_DATA;

// 对象：类型合法、每类型 ID 唯一、zh/py/ab 非空
const VALID_T = ['c', 't', 'k', 'p'];
const seen = {};
let objBad = 0;
for (const [t, id, zh, en, py, ab] of D.objects) {
  if (!VALID_T.includes(t)) { bad(`非法类型 ${t}${id}`); objBad++; continue; }
  const key = t + id;
  if (seen[key]) { bad(`重复条目 ${key}`); objBad++; }
  seen[key] = true;
  if (!zh || !en || !py || !ab) { bad(`${key} 字段缺失`); objBad++; }
  if (py && ab && !py.startsWith(ab[0])) { /* 首字母应来自全拼首字，抽查 */ }
}
objBad === 0 && ok(`objects ${D.objects.length} 条，类型/唯一性/字段完整`);

// 拼音首字母抽查：ab 应等于 py 每个音节首字母（无分隔符时近似：ab 首字符 == py 首字符）
let abBad = 0;
for (const [t, id, , , py, ab] of D.objects) {
  if (py && ab && py[0] !== ab[0]) { abBad++; if (abBad <= 3) bad(`${t}${id} 全拼/首字母不一致: ${py} vs ${ab}`); }
}
abBad === 0 && ok('全拼与首字母首字符全部一致');

// 成就：ID 连续 1..N，名字非空
const achIds = D.achievements.map(r => r[0]);
const contig = achIds.every((v, i) => v === i + 1);
contig ? ok(`achievements ${achIds.length} 条，ID 连续 1..${achIds.length}`)
  : bad('成就 ID 不连续');
D.achievements.some(r => !r[1]) && bad('存在空成就名');

// ---- PRESETS（从 app.js 提取）----
const app = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
const itemRe = /\[\s*'([ctkp])'\s*,\s*(\d+)\s*\]/g;
// 只在 PRESETS 数组区域内匹配（截取 var PRESETS = [ 到 ]; ）
const presetStart = app.indexOf('var PRESETS = [');
const presetEnd = app.indexOf('];', presetStart);
const presetSrc = app.slice(presetStart, presetEnd);
const refs = [...presetSrc.matchAll(itemRe)].map(m => [m[1], +m[2]]);
let refBad = 0;
for (const [t, id] of refs) {
  if (!seen[t + id]) { bad(`PRESETS 引用不存在的对象 ${t}${id}`); refBad++; }
  if (t === 'c' && !fs.existsSync(path.join(ROOT, 'icons', id + '.png'))) {
    bad(`PRESETS 引用 ${t}${id} 但 icons/${id}.png 缺失`); refBad++;
  }
}
refBad === 0 && ok(`PRESETS 引用 ${refs.length} 个对象，全部存在且有图标`);

// ---- icons 目录：无多余文件 ----
const icons = fs.readdirSync(path.join(ROOT, 'icons')).filter(f => f.endsWith('.png'));
const needed = new Set(refs.filter(r => r[0] === 'c').map(r => r[1] + '.png'));
const extra = icons.filter(f => !needed.has(f));
extra.length ? bad('icons 多余文件: ' + extra.join(',')) : ok(`icons ${icons.length} 个，全部被引用`);

console.log(fail ? `\n${fail} 项失败` : '\n全部通过');
process.exit(fail ? 1 : 0);
