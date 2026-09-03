// 网络备用推送：github.com 被污染但 api.github.com 可达时，
// 用 Git Data API 一次性把本地提交树推上远端（远端生成等价 commit）。
// 用法: node build/push_api.js
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REPO = 'jfg-jfg/isaac-lazy-wiki';

function gh(endpoint, method, payload) {
  const args = ['api', '-X', method, endpoint];
  if (payload) {
    const tmp = path.join(__dirname, '_payload.json');
    fs.writeFileSync(tmp, JSON.stringify(payload));
    args.push('--input', tmp);
  }
  args.push('--jq', '.');
  const out = execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  return JSON.parse(out || 'null');
}

// 0. 空仓库时 Git blobs API 会 409，先用 Contents API 放个 .gitignore 初始化
try {
  const init = fs.readFileSync(path.join(ROOT, '.gitignore'));
  gh(`repos/${REPO}/contents/.gitignore`, 'PUT', {
    message: 'init',
    content: init.toString('base64'),
  });
  console.log('仓库已初始化');
} catch (e) { /* 已有内容，忽略 */ }

// 1. 收集文件并创建 blobs
const files = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' })
  .split(/\r?\n/).filter(Boolean);
console.log('文件数:', files.length);

const tree = [];
for (const f of files) {
  const buf = fs.readFileSync(path.join(ROOT, f));
  const blob = gh(`repos/${REPO}/git/blobs`, 'POST', {
    content: buf.toString('base64'),
    encoding: 'base64',
  });
  tree.push({ path: f, mode: '100644', type: 'blob', sha: blob.sha });
  process.stdout.write('.');
}
console.log('\nblobs 完成');

// 2. 读取本地 HEAD commit message，远端重建等价提交
const msg = execFileSync('git', ['log', '-1', '--pretty=%B'], { cwd: ROOT, encoding: 'utf8' }).trim();
const localSha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();

// 3. tree -> commit -> ref
const t = gh(`repos/${REPO}/git/trees`, 'POST', { tree, message: '' });
const c = gh(`repos/${REPO}/git/commits`, 'POST', {
  tree: t.sha,
  message: msg + '\n\n(local commit ' + localSha + ', uploaded via API)',
  parents: [],
});
try {
  gh(`repos/${REPO}/git/refs/heads/main`, 'PATCH', { sha: c.sha, force: true });
} catch (e) {
  gh(`repos/${REPO}/git/refs`, 'POST', { ref: 'refs/heads/main', sha: c.sha });
}
console.log('远端 commit:', c.sha);
console.log('https://github.com/' + REPO);
