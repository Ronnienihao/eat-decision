# MEMORY.md

## 用户信息
- **名字**：小周
- **飞书 open_id**：ou_e023b9a2cce3849a5420c805ff7213c2
- **语言**：中文

## 核心项目：dumb-ti (恶搞人格测试)
- **目标**：面向全球 Gen-Z (尤其是欧美) 的恶搞版 16 人格测试。
- **技术栈**：Next.js + Tailwind CSS + Cloudflare Pages。
- **项目现状** (2026-04-13)：
    - 需求文档 `dumb-ti.md` v2.0 已完成且推送到 GitHub。
    - 进度表 `TASKS.md` 已建立（Phase 1 待启动）。
    - 图片资产 `public/assets/personalities/` 仅保留 16 个有效命名的 jpg，无冗余 UUID 文件。
    - 核心业务逻辑（计分引擎/分享/活动）尚待开发。
- **关键设计**：
    - 配色已定（#f9f7ef, #f4cf7a 等）。
    - 计分采用四轴八维，权重题 Q1/Q8/Q14/Q24。
- **已确立的开发原则**：
    - 采用 coding-agent 逐步开发。
    - 暂时不安装 cloudflare-toolkit，留待部署时使用最小权限 token。
    - 所有改动记录于 `TASKS.md`。

## 通勤同步规则（2026-05-20 小周制定）
- **到公司**：告诉我 → 我提醒「git pull」→ 同步最新代码
- **到家**：告诉我 → 我提醒「git pull」→ 同步最新代码
- **离开公司前**：我提醒「git push」→ 确保当天进度推到 GitHub

## 用户偏好与习惯
- **敏感度**：对项目进度和 AI 记忆力有较高期待，要求过程透明。
- **安全**：GitHub token 使用后应立即由用户 revoke。
- **飞书文档权限**：**每次**创建/使用飞书文档/表格，必须给 `ou_e023b9a2cce3849a5420c805ff7213c2` 开编辑权限（硬规则）。
- **技能管理原则**：每新增工具/插件/技能，必须及时吸收、归纳、沉淀到记忆中，遇到对应场景优先使用。

## 已安装技能库（2026-04-15）

### 编程
| Skill | 用途 | 触发场景 |
|-------|------|----------|
| coding | 记住编码风格偏好，保持代码一致性 | 写代码时 |
| agentic-coding | 验收合同+微差分，生产级交付 | 复杂功能开发 |
| vibe-coding | 描述需求让 AI 构建软件 | 新建项目/功能 |

### 记忆
| Skill | 用途 | 触发场景 |
|-------|------|----------|
| memory-manager | 压缩检测、自动快照、语义搜索 | 防止上下文丢失 |

### 部署 & 平台
| Skill | 用途 | 触发场景 |
|-------|------|----------|
| deploy-agent | Build→GitHub→Cloudflare Pages 全流程 | 部署项目时 |
| cloudflare-toolkit | DNS/域名/SSL/防火墙管理 | Cloudflare 配置 |
| web | 现代建站最佳实践 | 建站时 |
| github | gh CLI 操作 issues/PR/CI | GitHub 操作 |

### 设计
| Skill | 用途 | 触发场景 |
|-------|------|----------|
| design-system-polisher | 对标 59 个顶级品牌设计规范优化 UI | UI 审查/打磨 |

### 策划 & 产品
| Skill | 用途 | 触发场景 |
|-------|------|----------|
| product-analysis | PRD 解析/功能架构/需求漏洞识别 | 分析需求文档 |

### 其他工具
| Skill | 用途 | 触发场景 |
|-------|------|----------|
| agent-browser | 无头浏览器自动化 | 网页操作/抓取 |
| summarize | 网页/PDF/音频/YouTube 摘要 | 快速消化内容 |
| tavily-search | AI 优化网络搜索（需 API Key） | 精准搜索 |
| weather | 天气查询 | 查天气 |
| tencent-docs | 腾讯文档操作 | 腾讯文档任务 |
| tencent-cos-skill | 腾讯云 COS 存储+图片处理 | 上传/管理云文件 |
| tencentcloud-lighthouse-skill | 腾讯云轻量服务器管理 | 服务器运维 |
| find-skills | 发现和安装新技能 | 需要新能力时 |
| wechat-mini-app | 微信小程序开发：脚手架/页面/组件/API/配置/部署 | 开发微信小程序时 |

## ⛔ dumb-ti 访问规则
- **封存指令**：在小周说「重启dumb」之前，不得主动访问、编辑、或在思考中展开 dumb-ti 相关内容。

## dumb-ti 项目进展（2026-04-23 更新）
- **部署**：Cloudflare Workers（`dumb-ti.am1sima258.workers.dev`）
- **已完成**：16人格中英文完整内容、result 页 i18n、精确 Vibe 进度条、构建修复

### 题目最新状态（v3.0，2026-04-23 定稿）
- **题目文档**：飞书 https://qcna86tffrc1.feishu.cn/docx/VPjsdk4MFoNuwtxuRkbceEYZnmr（已更新为 v3.0）
- **题目数量**：28 题（每轴 7 题）
- **四轴定义**（重要！与旧版不同）：
  - E轴：Hustle（拼命）vs Rot（摆烂）
  - S轴：Glow（显眼包）vs Fade（隐形人）
  - M轴：Delu（加滤镜）vs Raw（生吃现实）
  - V轴：Main（主角）vs Side（配角）
- **计分系统（新版）**：
  - 权重题（Q1/Q6/Q8/Q12/Q15/Q20/Q24/Q27）：A=+2.0, B=+0.8, C=-0.8, D=-2.0
  - 普通题：A=+1.5, B=+0.5, C=-0.5, D=-1.5
  - 每轴满分 ±11.5，永不平局
- **代码文件**：`workspace/dumb-ti/lib/quiz-data.ts` 已按 v3.0 重写完毕
- **v3.0 主要变动**：
  - Q6 替换：原"打翻水"→ 新"待办清单10件事"
  - 原 v2.0 Q25"朋友圈角色"删除（与Q10重叠），新增Q26"派对自我介绍"
  - 中英文全面重写为脱口秀毒舌风格
  - 计分彻底重构，A/B/C/D 四档分值各不相同

### 待处理（代码层面）
- B1. scoring.ts 需同步更新计分逻辑（适配新的 4 档分值）
- B2. 首页无中文
- B3. 分享按钮无功能
- F1. 更多测试页缺失
- F2. OG Meta 未配置
- F3. PayPal 支付（待小周提供 Client ID）
- **下一步**：推 GitHub，在线测试效果

## 项目：吃饭极限二选一（微信小程序）
- **飞书 Wiki**：https://qcna86tffrc1.feishu.cn/wiki/T3iWwHW9gi4wFBk0R2Cc6RRinOc
- **Bitable app_token**：DFq7brjyaaes0gsYLYAcNrh8nSe
- **真实 table_id**：tblLDcSAzcNbsibs（表名「数据表」；URL 里的 ldx0XdVGL3Whn2U0 是错误的，不能用）
- **obj_type**：bitable（多维表格）

### 核心产品逻辑（2026-05-04 确认定稿）

**完整游戏流程：两大阶段**

#### 阶段一：偏好筛选（5 轮）
- **Q01**：核心大类，二选一：中国菜 / 异国料理
- **Q02&03**：属性偏好，从7组对立属性随机抽2组，每组二选一
  - 7组：重口浓郁/清淡原味、管饱正餐/解馋轻食、肉食主义/多点蔬菜、30¥内/30¥以上、无视卡路里/控卡党、热菜/冷餐、15分钟吃完/慢慢品味
- **Q04**：地域盲盒，三选一（从对应池随机掉3个）
  - 池A（中国菜）：广东菜、川湘菜、北方硬菜、江浙本帮、云贵酸辣
  - 池B（异国料理）：日式料理、韩式料理、美式快餐、经典西餐、东南亚菜
- **Q05**：烹饪方式，三选一（全池随机掉3个）：爆炒/清蒸/慢炖/红烧/砂锅/凉拌/酥炸/煎烤/烘焙/生食/熬煮/冷餐

#### 阶段二：菜品擂台 PK（7 轮）
- 画面顶部常驻显示5个筛选标签
- 系统根据5个标签从数据库筛选候选菜品
- 淘汰赛擂台制：上一轮获胜菜直接晋级迎战下一个挑战者，共7轮
- 第7轮最终存活的菜 = 今日口粮 🏆

**数据库结构（193 条菜品）：**
- `菜名`（主键）、`第一阶段：核心大类`、`第二阶段：属性随机池`、`第三阶段：地域盲盒`、`第四阶段：烹饪方式`、`推荐语`

**PRD文档：** `/root/.openclaw/workspace/eat-decision/PRD-v0.1.md`

### 微信小程序官方文档摘要（2026-05-12 学习）

### 注册与主体
- 个人主体：18岁以上国内实名微信用户可注册，**暂不支持微信认证、微信支付**
- AppID 在「设置 - 开发设置」获取
- 个人主体最多绑定 15 个开发成员 / 15 个体验成员

### 发布流程
1. 开发者工具上传代码 → 管理员后台提交审核 → 审核通过 → 手动点击发布
2. 审核前需配置「功能页面」类目（≤5组）
3. 参考《平台常见拒绝情形》规避风险

### 备案（重要！）
- **国内上架必须备案**，流程：填写信息 → 平台初审(1-2工作日) → 工信部短信核验(12381，24h内完成) → 通管局审核(1-20工作日) → 备案成功
- 个人备案只需身份证
- 备案号会自动展示在小程序详情页，无需手动悬挂

### 设计规范（WeUI 风格）
- **字体**：跟随系统，常用字号 22/17/15/14/12pt
- **设计稿基准宽度**：375px（固定布局）或 390px（响应式）
- 可交互区域最小物理尺寸 7-9mm
- Tab 导航：2-5 个，建议不超过 4 个
- 右上角官方菜单区域需预留（不可自定义内容，只能选深/浅配色）
- 加载反馈：优先局部加载，谨慎使用全局模态加载
- 表单出错需明确标注出错字段
- WeUI 控件库：https://weui.io

### 技术框架要点
- 语言：WXML + WXSS + JS（或 TypeScript）
- 官方组件库文档：component/
- API 文档：api/
- 云开发：wxcloudservice

## 当前状态（2026-05-19 深夜更新）
- ✅ 小程序骨架代码完整搭建（28个文件，1872行），Git push 在 `workspace/eat-decision/miniapp/`
- ✅ 游戏逻辑全部实现（5轮筛选 + 7轮擂台PK + 动态跳题 + 催促系统）
- ✅ AppID 已配置：`wx06356d564d0219b5`
- ✅ 后端部署到腾讯云（Express + 飞书 Bitable），端口3000
- ✅ 飞书菜品数据同步（447道）
- ✅ **防火墙已开放**：腾讯云安全组添加入站规则 TCP 3000
- ✅ **API 已验证可用**：
  - `GET /api/health` → `{status:"ok", dishCount:447}`
  - `GET /api/dishes` → 返回全部447道菜
  - `GET /api/dishes?q01=中国菜&q02=重口浓郁` → 筛选正常
- 🔄 **小程序接入后端进行中**：
  - `app.js` 里 `apiBase` 改为 `http://43.128.123.207:3000`（已修复）
  - `utils/api.js` 里 `BASE_URL` 已改为对应地址
  - `filterDishes` 已从 POST 改为 GET 兼容后端
- ❌ **Cloudflare Tunnel 临时方案放弃**：URL 不稳定，每次重启会变
- 🎯 **最终方案确定**：购买域名（.cyou 后缀），配置 Nginx + Let's Encrypt SSL

### GitHub 多电脑协作（已配置）
- 家里 Mac：SSH Key 已添加，clone 成功
- 公司 Mac：明天需要重新配置 SSH Key

### 腾讯云服务器 SSH
- 公网 IP：`43.128.123.207`
- SSH 密钥：`~/.ssh/eatdecision.pem`
- 实例：lhins-eu5xkwa5（新加坡地域）
- 用户名：ubuntu
- 后端部署目录：`~/eat-decision-backend/`（server.js）
- 后端地址：`http://43.128.123.207:3000`（端口3000）
- 飞书应用凭证：cli_a93efe07e3f8dbcd
- 菜品数据：447道（从飞书 Bitable 实时同步）

### 后端 API（腾讯云轻量服务器）
- `GET /api/health` - 健康检查，返回 `{status:"ok", dishCount:447}`
- `GET /api/dishes` - 返回 `{total:447, dishes:[...]}`（完整列表）
- `GET /api/dishes?q01=中国菜&q02=重口浓郁&q05=爆炒` - 按筛选条件查询

### 小程序 API 配置（当前状态）
- `miniapp/app.js`：`apiBase = 'http://43.128.123.207:3000'`（需改为 HTTPS 域名）
- `miniapp/utils/api.js`：`BASE_URL` 对应修改
- 读取路径：`res.data.dishes`（后端返回 `{total, dishes}` 结构）

### 域名购买（进行中，未完成）
- 目标域名：`eattoday.org`（$7.50/年）
- Cloudflare Registrar 不支持 .cyou 后缀
- 尝试购买时 Visa 信用卡识别失败
- **待解决**：更换支付方式或换注册商（Namecheap 支持 .cyou 且支持支付宝）

### 待办（明天）
- [x] SSH 密钥连接成功
- [x] Node.js 环境安装
- [x] 后端部署到腾讯云（Express + 飞书 Bitable）
- [x] 飞书菜品数据同步（447条）
- [x] 腾讯云防火墙开放3000端口
- [x] 小程序 API 地址修复（3001→3000）
- [ ] 解决域名购买支付问题（Visa 卡失败）
  - 方案A：Namecheap 购买 eattoday.org（支持支付宝）
  - 方案B：换一张支持外币支付的卡
- [ ] 公司 Mac 配置 GitHub SSH Key
- [ ] 服务器配置 Nginx + Let's Encrypt SSL
- [ ] 小程序 API URL 改为 HTTPS 域名

## ⛔ eat-decision 项目暂停规则
- 小周说「重启eat」之前，不得主动访问、编辑、或在思考中展开 eat-decision 相关内容。
