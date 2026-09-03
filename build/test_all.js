// 全功能回归测试：搜索 / 清单 / 预设 / 浮动广告 / 速查
// 运行前: cd build && npm i puppeteer-core
const puppeteer = require('puppeteer-core');
const path = require('path');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ROOT = path.resolve(__dirname, '..');
const URL = 'file:///' + path.join(ROOT, 'index.html').replace(/\\/g, '/');

let pass = 0, fail = 0;
function check(name, ok, detail) {
  console.log((ok ? 'PASS' : 'FAIL') + ' ' + name + (ok ? '' : ' :: ' + detail));
  ok ? pass++ : fail++;
}

(async () => {
  const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  // Edge headless 强制 prefers-reduced-motion，stub 掉以测试漂移逻辑
  await page.evaluateOnNewDocument(() => {
    const orig = window.matchMedia.bind(window);
    window.matchMedia = q => (q.includes('prefers-reduced-motion') ? { matches: false } : orig(q));
  });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(URL);
  await page.evaluate(() => localStorage.clear());
  await sleep(500);

  // ===== 搜索 =====
  await page.type('#q', '豆奶');
  await sleep(300);
  const row1 = await page.evaluate(() => {
    const r = document.querySelector('.row');
    return r ? { zh: r.querySelector('.zh').textContent, cmd: r.querySelector('.cmd').textContent } : null;
  });
  check('搜索中文→豆奶/giveitem c330', row1 && row1.zh === '豆奶' && row1.cmd === 'giveitem c330', JSON.stringify(row1));

  // 拼音首字母
  await page.evaluate(() => { document.getElementById('q').value = ''; });
  await page.type('#q', 'dn');
  await sleep(300);
  const firstZh = await page.$eval('.row .zh', el => el.textContent);
  check('拼音首字母 dn→豆奶第一', firstZh === '豆奶', firstZh);

  // 数字 ID（成就）：道具 c637 存在且优先排前，成就行在其后
  await page.evaluate(() => { document.getElementById('q').value = ''; });
  await page.type('#q', '637');
  await sleep(300);
  const achRows = await page.evaluate(() =>
    [...document.querySelectorAll('.row')].filter(r => r.querySelector('.badge').classList.contains('a'))
      .map(r => ({ cmd: r.querySelector('.cmd').textContent, hasAdd: !!r.querySelector('.add-btn') })));
  const ach637 = achRows.find(r => r.cmd === 'achievement 637');
  check('成就 ID 637→achievement 637', !!ach637, JSON.stringify(achRows));
  check('成就行无加入清单按钮', !!ach637 && !ach637.hasAdd, JSON.stringify(ach637));

  // ===== 清单 =====
  await page.evaluate(() => { document.getElementById('q').value = ''; document.querySelector('.tab').click(); });
  await page.type('#q', '豆奶');
  await sleep(300);
  await page.click('.row .add-btn');
  await page.click('.row .add-btn');
  const cart1 = await page.evaluate(() => JSON.parse(localStorage.getItem('isaacCart')));
  check('加两次→数量2', JSON.stringify(cart1) === JSON.stringify([{ t: 'c', id: 330, n: 2 }]), JSON.stringify(cart1));

  // 一键复制
  const copied = await page.evaluate(() => new Promise(res => {
    const orig = navigator.clipboard.writeText.bind(navigator.clipboard);
    navigator.clipboard.writeText = t => { window.__c = t; orig(t); return Promise.resolve(); };
    document.getElementById('cartCopy').click();
    setTimeout(() => res(window.__c), 100);
  }));
  check('清单复制带 repeat', copied === 'giveitem c330\nrepeat 1', JSON.stringify(copied));

  // in-cart 高亮同步：清空后 ＋ 应回复原样
  await page.evaluate(() => document.getElementById('cartClear').click());
  await sleep(150);
  const stillInCart = await page.evaluate(() => !!document.querySelector('.row .add-btn.in-cart'));
  check('清空清单后高亮同步消失', !stillInCart, '');

  // ===== 组合预设 =====
  await page.evaluate(() => { document.getElementById('q').value = ''; });
  await page.evaluate(() => { [...document.querySelectorAll('.tab')].find(t => t.textContent === '组合预设').click(); });
  await sleep(300);
  const total = await page.$$eval('.preset-card', els => els.length);
  check('预设卡片总数 51', total === 51, total);
  const seriesHeads = await page.$$eval('#results h2', els => els.map(e => e.textContent));
  check('四个系列标题齐全', seriesHeads.length === 4, seriesHeads.join('|'));

  // 特别篇存在 + 一键抄作业（4道具组合）
  const cop2 = await page.evaluate(() => new Promise(res => {
    const card = [...document.querySelectorAll('.preset-card')].find(c => c.querySelector('.pc-title').textContent === '突眼吐根三圣颂土星');
    if (!card) { res(null); return; }
    const orig = navigator.clipboard.writeText.bind(navigator.clipboard);
    navigator.clipboard.writeText = t => { window.__c2 = t; orig(t); return Promise.resolve(); };
    card.querySelector('.btn.cta').click();
    setTimeout(() => res(window.__c2), 100);
  }));
  check('特别篇一键抄作业(4行命令)', cop2 === 'giveitem c261\ngiveitem c149\ngiveitem c533\ngiveitem c595', JSON.stringify(cop2));

  // 搜索预设
  await page.evaluate(() => { document.getElementById('q').value = ''; });
  await page.type('#q', '三圣颂');
  await sleep(300);
  const matched = await page.$$eval('.preset-card', els => els.length);
  check('搜索"三圣颂"匹配预设', matched >= 5, matched);

  // ===== 首页广告（搜索栏下方静态卡片）=====
  await page.evaluate(() => { document.getElementById('q').value = ''; document.querySelector('.tab').click(); });
  await sleep(300);
  const adsInfo = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.ad-row .ad')];
    return {
      count: cards.length,
      series: cards.map(c => c.className.replace('ad ', '')),
      iconCounts: cards.map(c => c.querySelectorAll('.ad-cover img').length),
      iconOk: [...document.querySelectorAll('.ad-cover img')].every(i => i.complete && i.naturalWidth > 0),
    };
  });
  check('4 张广告卡', adsInfo.count === 4, JSON.stringify(adsInfo.series));
  // 封面 = 各系列第一期完整道具：strong 博士吐根2 / trash 吐跟星球突眼3 / weak 突眼小星球2 / fun 悬浮玄秘魔眼2
  check('封面道具数 2/3/2/2', JSON.stringify(adsInfo.iconCounts) === JSON.stringify([2, 3, 2, 2]), JSON.stringify(adsInfo.iconCounts));
  check('广告图标全部加载', adsInfo.iconOk, '');

  // 点击广告 → 跳转组合预设并筛选
  await page.click('.ad-row .ad.trash');
  await sleep(300);
  const jump = await page.evaluate(() => ({
    tab: document.querySelector('.tab.on').textContent,
    chip: document.querySelector('.filter-chip') ? document.querySelector('.filter-chip').textContent : null,
    cards: document.querySelectorAll('.preset-card').length,
  }));
  check('点贵物广告→跳转+筛选10张', jump.tab === '组合预设' && /贵物/.test(jump.chip || '') && jump.cards === 10, JSON.stringify(jump));

  // ===== 命令速查 =====
  await page.evaluate(() => { [...document.querySelectorAll('.tab')].find(t => t.textContent === '命令速查').click(); });
  await sleep(200);
  const refSections = await page.$$eval('#ref h2', els => els.length);
  check('速查5个分区', refSections === 5, refSections);

  // ===== data 缺失保护（独立页面无 data.js 场景）=====
  const bad = await browser.newPage();
  await bad.setContent('<div id="results"></div><div id="ref"></div><div id="tabs"></div><input id="q"><button id="clearBtn"></button><select id="qty"></select><div id="cartBar"><div id="cartItems"></div></div><div id="toast"></div>');
  await bad.addScriptTag({ path: path.join(ROOT, 'app.js') }).catch(() => {});
  const guard = await bad.evaluate(() => document.getElementById('results').textContent.includes('data.js 加载失败'));
  check('data.js 缺失时有提示', guard, '');

  console.log('\n结果: ' + pass + ' 通过, ' + fail + ' 失败; JS错误: ' + (errors.length ? errors.join('; ') : '无'));
  await browser.close();
  process.exit(fail ? 1 : 0);
})();
