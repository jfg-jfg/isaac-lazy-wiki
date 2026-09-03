# 我懒得查wiki

以撒的结合 · 控制台命令生成器。双击 `index.html` 即可使用（纯本地，无需联网、无需安装任何东西）。

仓库：<https://github.com/jfg-jfg/isaac-lazy-wiki>

> **数据版权说明**：本项目自身代码按 MIT 发布（见 [LICENSE](LICENSE)）；
> `data.js` 的中文名/拼音表、成就名与 `icons/` 图标整理自上述无许可证的第三方仓库与游戏素材，
> 版权归各自所有者，本项目仅作个人查表用途的非商业再分发，收到权利人请求会移除。

## 功能

- **搜索即得命令**：输入中文名（豆奶）、英文名（soy milk）、全拼（dounai）、首字母（dn）或 ID（330），
  点击结果即复制 `giveitem c330` 这样的完整命令，直接粘贴进游戏控制台。
- **覆盖 1056 个对象**：721 道具、188 饰品、97 卡牌/符文、50 药丸（Repentance/Repentance+）。
- **637 个成就**：按英文名或 ID 搜索，生成 `achievement N`（`achievement *` 一键全解锁见速查表）。
- **自定义清单**：搜索结果右侧点 ＋ 加入清单，底部清单栏可调数量（1–99），
  「一键复制全部」生成多行命令（数量自动带 `repeat N-1`），整段粘贴进游戏控制台逐条执行。
  清单保存在浏览器本地，关页面不丢。
- **组合预设**：收录 B 站 UP 主「我是谁压实度」四个系列共 51 期——《以撒最强组合大赏》19 期、
  《以撒贵物组合大赏》10 期（含 4 个特别篇）、《以撒最垃圾道具组合大赏》12 期、《以撒趣味组合大赏》10 期。
  首页搜索栏下方为 4 张广告风入口卡片（封面展示各系列第一期的完整道具组合，全部图标错落叠放），
  点击进入对应系列；「组合预设」标签页为广告横幅列表，道具图标错落叠放（点击图标复制单个命令）；
  每个组合可一键复制全部命令或加入清单；附视频原档链接。
- **命令速查**：stage 楼层传送全表（含 a/b/c/d 变体）、goto 房间传送、restart 全角色表（0–40，含赤化）、
  debug/combo/macro 等常用命令，均可点击复制。
- **给多个**：右上角选数量，道具命令自动带 `repeat N-1`。
- URL 支持 `?q=关键词&tab=标签` 直接带参打开。

## 游戏内如何开控制台

Repentance：编辑存档目录（`文档\My Games\Binding of Isaac Repentance`）下的 `options.ini`，
把 `EnableDebugConsole=1`，进局后按 `~` 键打开。

## 数据来源与更新

| 文件 | 说明 |
| --- | --- |
| `index.html` | 页面结构与样式（双击打开） |
| `app.js` | 应用逻辑（搜索/清单/预设/浮动广告，与 index.html 同目录） |
| `data.js` | 自动生成的数据文件（1056 对象 + 637 成就） |
| `icons/` | 预设卡片与广告位的道具图标（来自 isaacunlocker，48 个） |
| `build/` | 数据源与生成脚本（`node build/make_data.js` 重新生成 data.js） |
| `build/test_all.js` | 全功能回归测试（19 项，见下） |

- 对象中文名/拼音：[boyl/isaac-chinese-console](https://github.com/boyl/isaac-chinese-console)
- 成就英文名：[Higeners/isaacunlocker](https://github.com/Higeners/isaacunlocker)
- 命令文档：[Debug Console - Isaac Wiki](https://bindingofisaacrebirth.fandom.com/wiki/Console)
- 组合预设：B 站 UP 主 [我是谁压实度](https://space.bilibili.com/28860267) 的《以撒最强组合大赏》《以撒贵物组合大赏》
  《以撒最垃圾道具组合大赏》（[合集](https://space.bilibili.com/28860267/lists/1891203?type=season)）《以撒趣味组合大赏》系列
  （仅最强系列第 9 期未找到原档；特别篇道具组合从视频封面与弹幕比对确认）
- 道具图标：[Higeners/isaacunlocker](https://github.com/Higeners/isaacunlocker) images/items

## 开发

```sh
node --check app.js          # 语法检查
node build/validate_data.js  # 数据完整性校验（data.js/预设引用/icons 覆盖）
node build/make_data.js      # 重新生成 data.js
cd build && npm i puppeteer-core && node test_all.js   # 全功能回归（19 项）
```

`build/push_api.js`：`github.com` 被网络污染时的备用推送（走 Git Data API 构造单 commit）。
网络正常时直接 `git push`；本地与远端历史分叉后用 `git push --force origin main` 对齐。

测试覆盖：中/拼音/ID 搜索、清单增删调量与复制、预设过滤与一键抄作业、
浮动广告（渲染/漂移/轮播/关闭/重开/跳转）、命令速查、data.js 缺失保护。

仅作个人查表用途，与 Nicalis / Edmund McMillen 无关联。
