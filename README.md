# ⚔️ OW Team Balancer — Web

> 基于守望先锋段位系统的位置感知自动分队工具 · Web 版

基于 [ow-team-balancer](https://github.com/alphaqwqwq/ow-team-balancer)（Python/CustomTkinter 桌面端）的算法逻辑，重构为纯前端 Web 应用。

## 功能

- **玩家管理**：按 T/DPS/Support 三位置设置段位权重（1-8，对应青铜→英杰），支持位置锁定
- **CSV 导入/导出**：兼容 Excel，方便共享段位数据库
- **三种分队模式**：
  - ⚖️ **权重模式（推荐）**：位置感知贪心算法，T 位权重 × 1.5，自动按角色填充分配
  - 🎲 **随机模式**：纯洗牌随机分配，适合娱乐局
- **分队配置**：4v4 / 5v5 / 6v6 可选，搜索/筛选/排序，参战人员勾选，支持分队前临时覆盖锁定位置
- **结果展示**：双队 VS 对比如擂台格式，按角色分组显示，评分差距一目了然，权重显示开关

## 快速开始

### 本地开发

`ash
npm install
npm run dev
`

浏览器打开 http://localhost:5174

### 构建

`ash
npm run build
`

产物在 dist/ 目录，可直接部署到 Vercel / Cloudflare Pages 等静态托管平台。

### Vercel 一键部署

在 Vercel 导入此仓库，Framework 选 Vite，Root Directory 留空，其余默认，点 Deploy 即可。

## 数据存储

所有玩家数据保存在浏览器 localStorage 中，不经过任何服务器，隐私安全。

## 技术栈

| 层 | 技术 |
|---|---|
| 框架 | React 18 + TypeScript + Vite 6 |
| 算法 | 位置感知贪心分配（T 位 1.5 倍权重） |
| 数据 | localStorage |
| 部署 | Vercel / CF Pages（纯静态） |

## License

MIT
