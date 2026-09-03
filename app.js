// 我懒得查wiki —— 应用逻辑（依赖同目录 data.js）
(function () {
  'use strict';

  // ---------- 数据缺失保护 ----------
  if (!window.ISAAC_DATA || !Array.isArray(window.ISAAC_DATA.objects)) {
    document.getElementById('results').innerHTML =
      '<div class="hint">data.js 加载失败 —— 请确认 data.js 与 index.html 在同一目录</div>';
    return;
  }

  // ---------- 静态速查数据 ----------
  var STAGES = [
    ['stage 1', '地下室 I', 'Basement（1a 地窖 Cellar，1b 燃烧地下室，1c 洪流 Downpour，1d 污水 Dross）'],
    ['stage 2', '地下室 II', '同上第二层（2a/2b/2c/2d）'],
    ['stage 3', '洞穴 I', 'Caves（3a 地下墓穴 Catacombs，3b 洪泛洞穴，3c 矿场 Mines，3d 灰坑 Ashpit）'],
    ['stage 4', '洞穴 II', '同上第二层（4a/4b/4c/4d）'],
    ['stage 5', '深度 I', 'Depths（5a 死灵之域 Necropolis，5b 阴湿深度，5c 陵墓 Mausoleum，5d 地狱边境 Gehenna）'],
    ['stage 6', '深度 II', '同上第二层（6a/6b/6c/6d）'],
    ['stage 7', '子宫 I', 'Womb（7a 子宫 Utero，7b 疤痕子宫，7c 尸体 Corpse）'],
    ['stage 8', '子宫 II', '同上第二层（8a/8b/8c）'],
    ['stage 9', '??? 蓝色子宫', 'Blue Womb，打 Hush 的楼层'],
    ['stage 10', '希洛 Sheol', '10a 大教堂 Cathedral'],
    ['stage 11', '黑暗房间 Dark Room', '11a 宝箱层 The Chest'],
    ['stage 12', '虚空', 'The Void'],
    ['stage 13', '家 Home', '最终章，打 The Beast（也可用 macro beast 一键传送+发装备）'],
  ];

  var ROOMS = [
    ['goto d.10', '当前层第 10 号普通房间', 'd.编号 = 普通房间布局变体'],
    ['goto s.error.21', 'Debug 房间', 's.类型.编号 = 特殊房间'],
    ['goto s.boss.5000', '超级撒但房间', 'Mega Satan'],
    ['goto 6 6 0', '按坐标传送', 'X Y 维度（0 当前层 / 1 亚位面 / 2 黑市…）'],
    ['forceroom s.boss.1010', '强制某房间出现', '配合 reseed 使用，房间权重变为 1000'],
  ];

  var ACHIEVEMENT_CMDS = [
    ['achievement 300', '解锁指定 ID 的成就', '⚠️ 不可撤销，且会同步解锁 Steam 成就；击败 Mom 之前无效'],
    ['achievement *', '解锁全部成就', '⚠️ 不可撤销！新存档需先不开控制台打掉一次 Mom'],
  ];

  var CHARACTERS = [
    ['restart 0', '以撒 Isaac'], ['restart 1', '抹大拉 Magdalene'], ['restart 2', '该隐 Cain'],
    ['restart 3', '犹大 Judas'], ['restart 4', '蓝宝宝 ???'], ['restart 5', '夏娃 Eve'],
    ['restart 6', '参孙 Samson'], ['restart 7', '阿撒兹勒 Azazel'], ['restart 8', '拉撒路 Lazarus'],
    ['restart 9', '伊甸 Eden'], ['restart 10', '迷失者 The Lost'], ['restart 11', '复活的拉撒路'],
    ['restart 12', '黑犹大 Dark Judas'], ['restart 13', '莉莉丝 Lilith'], ['restart 14', '店长 Keeper'],
    ['restart 15', '亚玻伦 Apollyon'], ['restart 16', '遗忘者+灵魂'], ['restart 17', '灵魂+遗忘者（以灵魂开局）'],
    ['restart 18', '贝丝妮 Bethany'], ['restart 19', '雅各和以扫'], ['restart 20', '以扫（单独）'],
    ['restart 21', '赤化以撒'], ['restart 22', '赤化抹大拉'], ['restart 23', '赤化该隐'],
    ['restart 24', '赤化犹大'], ['restart 25', '赤化蓝宝宝'], ['restart 26', '赤化夏娃'],
    ['restart 27', '赤化参孙'], ['restart 28', '赤化阿撒兹勒'], ['restart 29', '赤化拉撒路'],
    ['restart 30', '赤化伊甸'], ['restart 31', '赤化迷失者'], ['restart 32', '赤化莉莉丝'],
    ['restart 33', '赤化店长'], ['restart 34', '赤化亚玻伦'], ['restart 35', '赤化遗忘者'],
    ['restart 36', '赤化贝丝妮'], ['restart 37', '赤化雅各'], ['restart 38', '死亡的赤化拉撒路'],
    ['restart 39', '赤化雅各（幽灵态）'], ['restart 40', '赤化灵魂'],
  ];

  var COMMANDS = [
    ['giveitem c5', '道具/饰品/卡牌/药丸', '别名 g。前缀：c 道具、t 饰品、k 卡牌、p 药丸；也可直接写英文名，如 g soy milk'],
    ['remove c5', '移除道具', '别名 r。remove * 移除身上所有道具和饰品（各一份）'],
    ['giveitem2 c105', '给副角色', '别名 g2，如给以扫'],
    ['remove2 c1', '移除副角色道具', '别名 r2'],
    ['restart', '重开本局', 'restart 角色ID = 指定角色重开（见角色表）'],
    ['seed GGGG GGGG', '指定种子重开', '种子可含空格'],
    ['challenge 20', '挑战模式', 'challenge 0 = 普通开局；无效 ID 会崩溃'],
    ['combo 0.69', '随机给一池道具', '格式 池ID.数量：0 宝箱房 1 Boss房 2 商店 3 恶魔房 4 天使房 5 图书馆 6 密室 24 天象馆'],
    ['repeat 99', '重复上一条命令', '上限 10000 次'],
    ['debug 3', '无敌'], ['debug 4', '伤害 +40'], ['debug 8', '主动无限充能'],
    ['debug 9', '幸运 +50'], ['debug 10', '速杀（敌人持续掉血）'], ['debug 5', '显示房间信息'], ['debug 12', '显示持有道具'],
    ['macro hush', '一键打 Hush 布景', '传送+发道具；其他：mom、momh、bigchest、beast、ms（超级撒但）、mss、qk'],
    ['spawn 10.1', '生成实体', '格式 类型.变体.子类型.精英；spawn 20 = 一只苍蝇'],
    ['reseed', '重新生成本层布局', ''], ['restock', '商店补货', ''],
    ['rewind', '回到上一房间', '类似发光沙漏'], ['clearseeds', '清除彩蛋效果', ''],
    ['listcollectibles', '列出持有道具', ''], ['time', '显示本局时长', ''],
    ['lua print("hi")', '执行一行 Lua', '别名 l，调试用'],
    ['giveitem *', '彩蛋', '会回复 "What are you trying to do?" 并且什么都不给'],
  ];

  var REF_SECTIONS = [
    { id: 'give', title: '▸ 常用命令', rows: COMMANDS },
    { id: 'stage', title: '▸ 楼层传送 stage', rows: STAGES },
    { id: 'goto', title: '▸ 房间传送 goto', rows: ROOMS },
    { id: 'ach', title: '▸ 成就 / 解锁', rows: ACHIEVEMENT_CMDS },
    { id: 'char', title: '▸ 角色重开 restart', rows: CHARACTERS },
  ];

  // ---------- 建索引 ----------
  var objects = window.ISAAC_DATA.objects.map(function (r) {
    return { t: r[0], id: r[1], zh: r[2], en: r[3], py: r[4], ab: r[5], enl: r[3].toLowerCase() };
  });
  var achievements = window.ISAAC_DATA.achievements.map(function (r) {
    return { t: 'a', id: r[0], zh: '', en: r[1], enl: r[1].toLowerCase(), py: '', ab: '' };
  });

  var ALL = objects.concat(achievements);
  var OBJ_MAP = {};
  objects.forEach(function (o) { OBJ_MAP[o.t + o.id] = o; });

  var refRows = [];
  REF_SECTIONS.forEach(function (sec) {
    sec.rows.forEach(function (r) {
      refRows.push({ cmd: r[0], zh: r[1], desc: r[2] || '', zhkw: (r[0] + ' ' + r[1] + ' ' + (r[2] || '')).toLowerCase() });
    });
  });

  // ---------- 预设组合 ----------
  // 来自 B 站 UP 主「我是谁压实度」的四个系列视频
  // items: [类型, ID]；bv 为对应视频原档（能找到 BV 号的已附上）
  var PRESETS = [
    // ===== 最强组合大赏 =====
    { s: 'strong', ep: 1, name: '博士吐根', sub: '旧日支配者', items: [['c', 52], ['c', 149]], bv: 'BV14vNReKEtX' },
    { s: 'strong', ep: 2, name: '吐根三圣颂', sub: '曾经的垃圾，现在的王者', items: [['c', 149], ['c', 533]], bv: 'BV19VNzeNENi' },
    { s: 'strong', ep: 3, name: '硫磺火妈刀', sub: '捅穿游戏的最强之矛', items: [['c', 118], ['c', 114]] },
    { s: 'strong', ep: 4, name: '肺史诗婴儿', sub: '上百倍伤害的数值怪物', items: [['c', 229], ['c', 168]] },
    { s: 'strong', ep: 5, name: '彼列眼食泪', sub: '无穷无尽的至高上限', items: [['c', 462], ['c', 532]] },
    { s: 'strong', ep: 6, name: '科技X突眼', sub: '攻击范围巨大的清图大师', items: [['c', 395], ['c', 261]] },
    { s: 'strong', ep: 7, name: '巨人独眼英灵剑', sub: '互相弥补短板的暴力打手', items: [['c', 169], ['c', 579]], bv: 'BV122A5eUEA8' },
    { s: 'strong', ep: 8, name: '科技二食泪', sub: '吹爆核弹泡泡', items: [['c', 152], ['c', 532]] },
    { s: 'strong', ep: 10, name: '科技肺', sub: '闪电霰弹枪', items: [['c', 395], ['c', 229]], bv: 'BV1zSAheDEW2' },
    { s: 'strong', ep: 11, name: '突眼三圣颂', sub: '妈刀机关枪', items: [['c', 261], ['c', 533]], bv: 'BV1RvAzeAEN8' },
    { s: 'strong', ep: 12, name: '血泪硫磺火', sub: '恐怖无比的定点击破', items: [['c', 531], ['c', 118]], bv: 'BV1RrAnejEVi' },
    { s: 'strong', ep: 13, name: '妈眼科技二', sub: '逐步变强的主角式组合', items: [['c', 55], ['c', 152]], bv: 'BV1bAPFe1EwZ' },
    { s: 'strong', ep: 14, name: '科技0毛霉菌', sub: '连锁死亡闪电', items: [['c', 524], ['c', 553]], bv: 'BV1V1PKe3Evr' },
    { s: 'strong', ep: 15, name: '史诗硫磺火', sub: '炸裂激光', items: [['c', 168], ['c', 118]], bv: 'BV1eQAmesECx' },
    { s: 'strong', ep: 16, name: '天秤镜子', sub: '数值翻天覆地的面板巨人', items: [['c', 304], ['c', 5]], bv: 'BV1iLPxeYEWv' },
    { s: 'strong', ep: 17, name: '海王巧克力', sub: '力速双A的奇迹组合', items: [['c', 308], ['c', 69]], bv: 'BV1FtPLeyEnt' },
    { s: 'strong', ep: 18, name: '食泪三圣颂', sub: '左脚踩右脚的数值直升机', items: [['c', 532], ['c', 533]] },
    { s: 'strong', ep: 99, name: '妈刀剖腹产', sub: '最终章 · 史上最强的输出', items: [['c', 114], ['c', 678]] },
    { s: 'strong', ep: 100, name: '牵引光束寄生虫', sub: '番外篇 · 集束子弹', items: [['c', 397], ['c', 104]], bv: 'BV1jawdejEur' },
    // ===== 贵物组合大赏（合集: space.bilibili.com/28860267/lists/1891203）=====
    { s: 'trash', ep: 1, name: '吐跟星球突眼', sub: '险些一层没出去', items: [['c', 149], ['c', 233], ['c', 261]], bv: 'BV1vK421x7jS' },
    { s: 'trash', ep: 2, name: '悬浮巫师帽杏仁奶', sub: '键盘搓出火星子', items: [['c', 329], ['c', 358], ['c', 561]], bv: 'BV1fu4m1K7wc' },
    { s: 'trash', ep: 3, name: '镜子博士牵引', sub: '自杀之王3.0！', items: [['c', 5], ['c', 52], ['c', 397]], bv: 'BV1JK421i7xw' },
    { s: 'trash', ep: 4, name: '妈刀吐跟科技', sub: '烈火刀刀爆', items: [['c', 114], ['c', 149], ['c', 68]], bv: 'BV1hx4y127Rh' },
    { s: 'trash', ep: 5, name: '镜子导弹博士', sub: '很难活过两分钟的组合', items: [['c', 5], ['c', 583], ['c', 52]], bv: 'BV1mp42127zs' },
    { s: 'trash', ep: 6, name: '博士泪弹血泪', sub: '一发子弹就能让整个房间无处可避', items: [['c', 52], ['c', 220], ['c', 531]], bv: 'BV1cp42127M2' },
    { s: 'trash', ep: 101, name: '博士火箭血泪镜子', sub: '死亡组合 · 新时代躲避球游戏', items: [['c', 52], ['c', 583], ['c', 531], ['c', 5]], bv: 'BV1FZ421K7ex' },
    { s: 'trash', ep: 102, name: '突眼吐根三圣颂土星', sub: '特别篇 · 最逆天垃圾组合，险些无法通关', items: [['c', 261], ['c', 149], ['c', 533], ['c', 595]], bv: 'BV1Xj42197zJ' },
    { s: 'trash', ep: 103, name: '准星海王星巧克力奶', sub: '特别篇 · 最难以置信的垃圾组合，一个房间都出不去', items: [['c', 394], ['c', 597], ['c', 69]], bv: 'BV1Cm421J7eK' },
    { s: 'trash', ep: 104, name: '悬浮巫师帽血泪', sub: '特别篇 · 史上命中率最低的组合', items: [['c', 329], ['c', 358], ['c', 531]], bv: 'BV17z421o7Kt' },
    // ===== 最垃圾道具组合大赏 =====
    { s: 'weak', ep: 1, name: '突眼小星球', sub: '名副其实的"近战"组合', items: [['c', 261], ['c', 233]], bv: 'BV1ca4y1S7EC' },
    { s: 'weak', ep: 2, name: '突眼吐根', sub: '近战打自己，远程打不动', items: [['c', 261], ['c', 149]], bv: 'BV1394y1J7pw' },
    { s: 'weak', ep: 3, name: '准星巫师帽', sub: '瞄准了打不中，瞄不准也打不中', items: [['c', 394], ['c', 358]], bv: 'BV1Zu4y1L7wW' },
    { s: 'weak', ep: 4, name: '博士镜子', sub: '远超吐根镜子的逆天组合', items: [['c', 52], ['c', 5]], bv: 'BV1AN411M7Yt' },
    { s: 'weak', ep: 5, name: '博士星球', sub: '堪称最糟糕的道具组合', items: [['c', 52], ['c', 233]], bv: 'BV1cC4y127mf' },
    { s: 'weak', ep: 6, name: '洛基角吐根', sub: '几乎无法无伤的沙雕组合', items: [['c', 87], ['c', 149]], bv: 'BV1x94y1J7CX' },
    { s: 'weak', ep: 7, name: '豆浆史诗', sub: '固定攻速但超低攻击你喜欢吗', items: [['c', 330], ['c', 168]], bv: 'BV1Ku4y1A7eW' },
    { s: 'weak', ep: 8, name: '星球肺', sub: '坑人上限最高的组合之一', items: [['c', 233], ['c', 229]], bv: 'BV1mw411n7fN' },
    { s: 'weak', ep: 9, name: '吐根泪盾', sub: '挡住一下就会爆炸', items: [['c', 149], ['c', 243]], bv: 'BV1Na4y1f7gL' },
    { s: 'weak', ep: 10, name: '镜子科技X', sub: '愚蠢但能玩的组合', items: [['c', 5], ['c', 395]], bv: 'BV1a34y1F7XD' },
    { s: 'weak', ep: 11, name: '四眼萌肺', sub: '双道具攻速最慢的折磨组合', items: [['c', 245], ['c', 229]], bv: 'BV1Ha4y1f7Wp' },
    { s: 'weak', ep: 12, name: '寄生虫吐根', sub: '满屏幕爆炸的艺术', items: [['c', 104], ['c', 149]], bv: 'BV1Wc411Q7QU' },
    // ===== 趣味组合大赏 =====
    { s: 'fun', ep: 1, name: '悬浮玄秘魔眼', sub: '协同复击', items: [['c', 329], ['c', 572]], bv: 'BV1DoQXYKEM6' },
    { s: 'fun', ep: 2, name: '妈刀小星球', sub: '剑气纵横千里', items: [['c', 114], ['c', 233]] },
    { s: 'fun', ep: 3, name: '科技大宝剑', sub: '光剑！', items: [['c', 68], ['c', 579]] },
    { s: 'fun', ep: 4, name: '天王星笔记', sub: '越战越强', items: [['c', 596], ['c', 530]], bv: 'BV1Z8XnYtEjx' },
    { s: 'fun', ep: 5, name: '巧克力硫磺火', sub: '超粗激光', items: [['c', 69], ['c', 118]] },
    { s: 'fun', ep: 6, name: '白羊座肚肚软糖', sub: '冲刺！冲刺！！', items: [['c', 300], ['c', 690]] },
    { s: 'fun', ep: 7, name: '血泪扁石', sub: 'Q弹小核弹', items: [['c', 531], ['c', 540]], bv: 'BV1DGobY2EJw' },
    { s: 'fun', ep: 8, name: '神性三圣颂', sub: '豪华版追踪导弹？', items: [['c', 331], ['c', 533]] },
    { s: 'fun', ep: 9, name: '魂瓶鬼椒', sub: '爆炸性喷射蓝焰', items: [['c', 640], ['c', 495]] },
    { s: 'fun', ep: 10, name: '博士火箭', sub: '导弹出击', items: [['c', 52], ['c', 583]] },
  ];
  var SERIES_NAME = { strong: '最强', weak: '最垃圾', fun: '趣味', trash: '贵物' };
  var SERIES_TITLE = {
    strong: '最强组合大赏', trash: '贵物组合大赏', weak: '最垃圾道具组合大赏', fun: '趣味组合大赏',
  };
  // ep 语义：99 最终章 / 100 番外篇 / >=101 特别篇 / 其余 = 第 N 期
  function epLabelOf(p) {
    if (p.ep === 99) return '最终章';
    if (p.ep === 100) return '番外篇';
    if (p.ep >= 101) return '特别篇';
    return '第' + p.ep + '期';
  }

  var presetFilter = null;

  // ---------- DOM 引用 ----------
  var $q = document.getElementById('q'), $res = document.getElementById('results'),
      $ref = document.getElementById('ref'), $tabs = document.getElementById('tabs'),
      $qty = document.getElementById('qty'), $clear = document.getElementById('clearBtn'),
      $toast = document.getElementById('toast');

  var TABS = [
    { k: 'all', label: '全部' }, { k: 'c', label: '道具' }, { k: 't', label: '饰品' },
    { k: 'k', label: '卡牌/符文' }, { k: 'p', label: '药丸' }, { k: 'a', label: '成就' },
    { k: 'preset', label: '组合预设' }, { k: 'ref', label: '命令速查' },
  ];
  var tab = 'all';

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  // div 元素补上键盘可达性（Enter/空格 触发 click）
  function clickable(el) {
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
    });
    return el;
  }

  function switchTab(k) {
    tab = k;
    if (k === 'preset') presetFilter = null;
    document.querySelectorAll('.tab').forEach(function (x, i) { x.classList.toggle('on', TABS[i].k === k); });
    render();
  }

  TABS.forEach(function (t) {
    var el = document.createElement('div');
    el.className = 'tab' + (t.k === 'all' ? ' on' : '');
    el.textContent = t.label;
    clickable(el);
    el.onclick = function () { switchTab(t.k); };
    $tabs.appendChild(el);
  });

  function openPresetSeries(k) {
    tab = 'preset';
    presetFilter = k;
    document.querySelectorAll('.tab').forEach(function (x, i) { x.classList.toggle('on', TABS[i].k === 'preset'); });
    render();
    window.scrollTo(0, 0);
  }

  // ---------- 搜索 ----------
  function scoreObject(o, q) {
    var s = -1;
    function set(v) { s = s === -1 ? v : Math.min(s, v); }
    if (o.zh) {
      if (o.zh.startsWith(q)) set(o.zh === q ? 0 : 1);
      else if (o.zh.indexOf(q) !== -1) set(2);
    }
    if (o.enl.startsWith(q)) set(3);
    else if (o.enl.indexOf(q) !== -1) set(5);
    if (o.py) {
      if (o.py.startsWith(q)) set(2);
      else if (o.py.indexOf(q) !== -1) set(4);
    }
    if (o.ab) {
      if (o.ab.startsWith(q)) set(2);
      else if (o.ab.indexOf(q) !== -1) set(4);
    }
    return s;
  }

  function search(q) {
    var out = [];
    if (/^\d+$/.test(q)) {
      var n = parseInt(q, 10);
      ALL.forEach(function (o) {
        if (o.id === n) out.push({ o: o, s: 0 });
        else if (String(o.id).indexOf(q) === 0) out.push({ o: o, s: 7 });
      });
      // 同 ID 多类型（如 1 同时是道具/卡牌）时道具优先
      out.sort(function (a, b) { return a.s - b.s || (a.o.t === 'c' ? -1 : 1) - (b.o.t === 'c' ? -1 : 1); });
      return out;
    }
    ALL.forEach(function (o) {
      var s = scoreObject(o, q);
      if (s !== -1) out.push({ o: o, s: s });
    });
    out.sort(function (a, b) { return a.s - b.s || a.o.id - b.o.id; });
    return out;
  }

  function searchRef(q) {
    return refRows.filter(function (r) { return r.zhkw.indexOf(q) !== -1; });
  }

  // ---------- 命令生成 ----------
  function commandFor(o) {
    if (o.t === 'a') return 'achievement ' + o.id;
    var base = 'giveitem ' + o.t + o.id;
    var n = parseInt($qty.value, 10);
    // 道具可叠加，其余类型给多个无意义（饰品/卡牌会替换）
    if (o.t === 'c' && n > 1) return base + '\nrepeat ' + (n - 1);
    return base;
  }

  // ---------- 复制 ----------
  var toastTimer = null;
  function toast(msg) {
    $toast.textContent = msg;
    $toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { $toast.classList.remove('show'); }, 1600);
  }
  function toastCopied(text) {
    toast('已复制: ' + text.replace(/\n/g, ' ⏎ '));
  }
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toastCopied(text); },
        function () { fallbackCopy(text); });
    } else fallbackCopy(text);
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); toastCopied(text); }
    catch (e) { toast('复制失败，请手动复制'); }
    document.body.removeChild(ta);
  }

  // ---------- 自定义清单 ----------
  var cart = [];
  try { cart = JSON.parse(localStorage.getItem('isaacCart') || '[]') || []; } catch (e) { cart = []; }
  var $cartBar = document.getElementById('cartBar'), $cartItems = document.getElementById('cartItems');

  function saveCart() {
    try { localStorage.setItem('isaacCart', JSON.stringify(cart)); } catch (e) { /* 隐私模式忽略 */ }
  }
  function inCart(t, id) {
    return cart.some(function (e) { return e.t === t && e.id === id; });
  }
  function addToCart(t, id, silent) {
    var e = cart.find(function (x) { return x.t === t && x.id === id; });
    if (e) e.n++;
    else cart.push({ t: t, id: id, n: 1 });
    saveCart(); renderCart();
    if (!silent) {
      var o = OBJ_MAP[t + id];
      toast('已加入清单: ' + (o ? (o.zh || o.en) : t + id));
    }
  }
  function cartN(i, d) {
    cart[i].n = Math.min(99, Math.max(1, cart[i].n + d));
    saveCart(); renderCart();
  }
  function cartRemove(i) {
    cart.splice(i, 1);
    saveCart(); renderCart();
  }
  function cartCommands() {
    var lines = [];
    cart.forEach(function (e) {
      lines.push('giveitem ' + e.t + e.id);
      if (e.n > 1) lines.push('repeat ' + (e.n - 1));
    });
    return lines.join('\n');
  }
  // 同步搜索结果里 ＋ 按钮的"已在清单"高亮（增删/清空后保持一致）
  function syncAddButtons() {
    document.querySelectorAll('.add-btn').forEach(function (btn) {
      btn.classList.toggle('in-cart', inCart(btn.dataset.t, +btn.dataset.id));
    });
  }
  function renderCart() {
    syncAddButtons();
    if (!cart.length) { $cartBar.classList.remove('show'); return; }
    $cartBar.classList.add('show');
    $cartItems.innerHTML = '';
    cart.forEach(function (e, i) {
      var o = OBJ_MAP[e.t + e.id];
      var chip = document.createElement('span');
      chip.className = 'cart-chip';
      chip.innerHTML =
        '<span class="badge ' + e.t + '">' + e.t + '·' + e.id + '</span>' +
        esc(o ? (o.zh || o.en) : '') +
        ' <button data-a="dec" title="减">−</button><span class="n">' + e.n + '</span><button data-a="inc" title="加">＋</button>' +
        '<button data-a="del" title="移除">✕</button>';
      chip.querySelector('[data-a=dec]').onclick = function () { cartN(i, -1); };
      chip.querySelector('[data-a=inc]').onclick = function () { cartN(i, 1); };
      chip.querySelector('[data-a=del]').onclick = function () { cartRemove(i); };
      $cartItems.appendChild(chip);
    });
  }
  document.getElementById('cartCopy').onclick = function () {
    if (cart.length) copyText(cartCommands());
  };
  document.getElementById('cartClear').onclick = function () {
    cart = []; saveCart(); renderCart();
  };

  // ---------- 渲染 ----------
  var LIMIT = 80;

  function renderRow(o) {
    var el = document.createElement('div');
    el.className = 'row';
    var zhName = o.zh || o.en;
    var enName = o.zh ? o.en : '';
    el.innerHTML =
      '<div class="badge ' + o.t + '">' + o.t + '·' + o.id + '</div>' +
      '<div class="names"><div class="zh">' + esc(zhName) + '</div>' +
      (enName ? '<div class="en">' + esc(enName) + '</div>' : '') + '</div>' +
      '<div class="cmd">' + esc(commandFor(o)) + '</div>';
    el.title = '点击复制';
    clickable(el);
    el.onclick = function () { copyText(commandFor(o)); };
    if (o.t !== 'a') {
      var add = document.createElement('button');
      add.className = 'add-btn' + (inCart(o.t, o.id) ? ' in-cart' : '');
      add.dataset.t = o.t;
      add.dataset.id = o.id;
      add.textContent = '＋';
      add.title = '加入清单';
      add.onclick = function (e) {
        e.stopPropagation();
        addToCart(o.t, o.id);
      };
      el.appendChild(add);
    }
    return el;
  }

  function renderRefTable(rows) {
    var html = '';
    rows.forEach(function (r) {
      html += '<tr><td class="cmd-cell" data-cmd="' + esc(r.cmd) + '">' + esc(r.cmd) + '</td>' +
        '<td class="desc"><span class="zhname">' + esc(r.zh) + '</span>' +
        (r.desc ? '<br>' + esc(r.desc) : '') + '</td></tr>';
    });
    return '<table>' + html + '</table>';
  }

  function renderRef(onlyQuery, q) {
    var html = '';
    REF_SECTIONS.forEach(function (sec) {
      var rows = sec.rows.map(function (r) { return { cmd: r[0], zh: r[1], desc: r[2] || '' }; });
      var filtered = onlyQuery ? rows.filter(function (r) {
        var kw = (r.cmd + ' ' + r.zh + ' ' + r.desc).toLowerCase();
        return kw.indexOf(q) !== -1;
      }) : rows;
      if (filtered.length) html += '<h2>' + sec.title + ' (' + filtered.length + ')</h2>' + renderRefTable(filtered);
    });
    $ref.innerHTML = html;
    $ref.querySelectorAll('.cmd-cell').forEach(function (cell) {
      cell.onclick = function () { copyText(cell.getAttribute('data-cmd')); };
    });
  }

  function render() {
    var q = $q.value.trim().toLowerCase();
    $clear.style.display = q ? 'block' : 'none';
    $res.innerHTML = '';
    $ref.innerHTML = '';

    if (!q) {
      if (tab === 'ref') { renderRef(false); return; }
      if (tab === 'preset') { renderPresets(''); return; }
      $res.appendChild(renderAds());
      var hint = document.createElement('div');
      hint.className = 'hint';
      hint.innerHTML = '搜点什么吧 —— 支持中文（小胖）、英文（soy milk）、全拼（mianbao）、首字母（mbj）、ID（182）<br>组合预设点上方广告 · 搜索结果右侧 ＋ 可加入清单批量复制';
      $res.appendChild(hint);
      if (tab === 'all') renderRef(false);
      return;
    }

    if (tab === 'ref') { renderRef(true, q); return; }
    if (tab === 'preset') { renderPresets(q); return; }

    var hits = search(q);
    if (tab !== 'all') hits = hits.filter(function (h) { return h.o.t === tab; });
    var presetHits = (tab === 'all') ? filterPresets(q) : [];

    if (!hits.length && !presetHits.length) {
      var refHits = searchRef(q);
      if (refHits.length) {
        renderRef(true, q);
      } else {
        $res.innerHTML = '<div class="hint">没有找到 "' + esc($q.value) + '"<br>试试更短的关键词，或切到「命令速查」标签</div>';
      }
      return;
    }

    hits.slice(0, LIMIT).forEach(function (h) { $res.appendChild(renderRow(h.o)); });
    if (hits.length > LIMIT) {
      var m = document.createElement('div');
      m.className = 'more';
      m.textContent = '仅显示前 ' + LIMIT + ' 条，共 ' + hits.length + ' 条，请输入更精确的关键词';
      $res.appendChild(m);
    }
    if (presetHits.length) {
      var ph = document.createElement('h2');
      ph.textContent = '▸ 匹配的组合预设 (' + presetHits.length + ')';
      $res.appendChild(ph);
      presetHits.slice(0, 5).forEach(function (p) { $res.appendChild(renderPresetCard(p)); });
    }
  }

  // ---------- 组合预设 ----------
  function presetCommands(p) {
    return p.items.map(function (it) { return 'giveitem ' + it[0] + it[1]; }).join('\n');
  }
  function renderPresetCard(p) {
    var el = document.createElement('div');
    el.className = 'preset-card ' + p.s;

    // 封面：道具图标错落叠放（点击复制单个）
    var cover = document.createElement('div');
    cover.className = 'pc-cover';
    p.items.forEach(function (it) {
      var o = OBJ_MAP[it[0] + it[1]];
      var img = document.createElement('img');
      img.src = 'icons/' + it[1] + '.png';
      img.alt = o ? (o.zh || o.en) : '';
      img.title = (o ? (o.zh || o.en) + ' (' + it[0] + it[1] + ')' : it[0] + it[1]) + ' — 点击复制单个';
      img.loading = 'lazy';
      img.onclick = function (e) { e.stopPropagation(); copyText('giveitem ' + it[0] + it[1]); };
      cover.appendChild(img);
    });
    el.appendChild(cover);

    var names = p.items.map(function (it) {
      var o = OBJ_MAP[it[0] + it[1]];
      return o ? (o.zh || o.en) : it[0] + it[1];
    }).join(' + ');
    var body = document.createElement('div');
    body.className = 'pc-body';
    body.innerHTML =
      '<div class="pc-head"><span class="tag-pill">' + SERIES_NAME[p.s] + '·' + epLabelOf(p) + '</span>' +
      '<span class="pc-title">' + esc(p.name) + '</span></div>' +
      '<div class="pc-sub">' + esc(p.sub) + '</div>' +
      '<div class="pc-items">' + esc(names) + '</div>';

    var actions = document.createElement('div');
    actions.className = 'preset-actions';
    var bCopy = document.createElement('button');
    bCopy.className = 'btn cta';
    bCopy.textContent = '一键抄作业';
    bCopy.onclick = function () { copyText(presetCommands(p)); };
    var bAdd = document.createElement('button');
    bAdd.className = 'btn ghost';
    bAdd.textContent = '加入清单';
    bAdd.onclick = function () {
      p.items.forEach(function (it) { addToCart(it[0], it[1], true); });
      toast('已加入清单: ' + p.name);
    };
    actions.appendChild(bCopy);
    actions.appendChild(bAdd);
    if (p.bv) {
      var src = document.createElement('a');
      src.className = 'btn-src';
      src.href = 'https://www.bilibili.com/video/' + p.bv + '/';
      src.target = '_blank';
      src.rel = 'noopener';
      src.textContent = '▶ 原档';
      actions.appendChild(src);
    }
    body.appendChild(actions);
    el.appendChild(body);
    return el;
  }
  function filterPresets(q) {
    if (!q) return PRESETS;
    return PRESETS.filter(function (p) {
      var hay = p.name + ' ' + p.sub;
      p.items.forEach(function (it) {
        var o = OBJ_MAP[it[0] + it[1]];
        if (o) hay += ' ' + o.zh + ' ' + o.en + ' ' + (o.py || '') + ' ' + (o.ab || '');
      });
      return hay.toLowerCase().indexOf(q) !== -1;
    });
  }
  function renderPresets(q) {
    var list = filterPresets(q);
    if (presetFilter) {
      list = list.filter(function (p) { return p.s === presetFilter; });
      var chip = document.createElement('span');
      chip.className = 'filter-chip';
      chip.textContent = '系列：' + SERIES_NAME[presetFilter] + ' 组合 ✕';
      chip.title = '点击取消筛选';
      clickable(chip);
      chip.onclick = function () { presetFilter = null; render(); };
      $res.appendChild(chip);
    }
    Object.keys(SERIES_TITLE).forEach(function (s) {
      var rows = list.filter(function (p) { return p.s === s; });
      if (!rows.length) return;
      var h = document.createElement('h2');
      h.textContent = '▸ ' + SERIES_TITLE[s] + '（我是谁压实度）';
      $res.appendChild(h);
      rows.forEach(function (p) { $res.appendChild(renderPresetCard(p)); });
    });
    if (!list.length) {
      var empty = document.createElement('div');
      empty.className = 'hint';
      empty.textContent = '没有匹配的组合预设';
      $res.appendChild(empty);
    } else if (!q) {
      var note = document.createElement('div');
      note.className = 'more';
      note.textContent = '组合来自 B 站 UP 主「我是谁压实度」的四个系列视频（最垃圾/贵物系列合集: space.bilibili.com/28860267/lists/1891203）；最强系列第 9 期暂未找到原档，未收录';
      $res.appendChild(note);
    }
  }

  // ---------- 首页广告（排在搜索栏下方，封面=各系列第一期的完整道具组合）----------
  var AD_ORDER = ['strong', 'trash', 'weak', 'fun'];
  var ADS = AD_ORDER.map(function (s) {
    // 第 1 期（ep 最小的常规期数）作为系列封面
    var first = PRESETS.filter(function (p) { return p.s === s && p.ep < 99; })
      .sort(function (a, b) { return a.ep - b.ep; })[0];
    return { s: s, preset: first };
  });
  function renderAds() {
    var row = document.createElement('div');
    row.className = 'ad-row';
    ADS.forEach(function (a) {
      var el = document.createElement('div');
      el.className = 'ad ' + a.s;
      var icons = a.preset.items.map(function (it) {
        return '<img src="icons/' + it[1] + '.png" alt="">';
      }).join('');
      el.innerHTML =
        '<span class="ad-tag">组合大赏系列</span>' +
        '<div class="ad-cover">' + icons + '</div>' +
        '<div class="ad-body">' +
        '<div class="ad-title">' + SERIES_TITLE[a.s] + '</div>' +
        '<div class="ad-sub">' + a.preset.items.length + ' 道具 · ' + esc(a.preset.name) + ' · ' + esc(a.preset.sub) + '</div>' +
        '<span class="ad-cta">点开抄作业 →</span>' +
        '</div>';
      clickable(el);
      el.onclick = function () { openPresetSeries(a.s); };
      row.appendChild(el);
    });
    return row;
  }

  // ---------- 输入事件 ----------
  var debounce = null;
  $q.addEventListener('input', function () {
    clearTimeout(debounce);
    debounce = setTimeout(render, 60);
  });
  $q.addEventListener('keydown', function (e) {
    // Enter 复制第一条搜索结果（仅当首元素是结果行时）
    if (e.key === 'Enter' && $res.firstElementChild && $res.firstElementChild.classList.contains('row')) {
      $res.firstElementChild.click();
    }
  });
  $clear.onclick = function () { $q.value = ''; render(); $q.focus(); };
  $qty.onchange = render;

  // 支持 ?q=关键词&tab=标签 直接带参打开
  try {
    var m = new URLSearchParams(location.search);
    var qv = m.get('q');
    if (qv) $q.value = qv;
    var tv = m.get('tab');
    if (tv && TABS.some(function (t) { return t.k === tv; })) switchTab(tv);
  } catch (e) { /* file:// 下无参数，忽略 */ }

  render();
  renderCart();
})();
