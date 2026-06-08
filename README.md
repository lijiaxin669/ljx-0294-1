# 🏮 年夜饭座位编排器

一款专为中国家庭设计的可视化年夜饭座位规划工具，解决传统纸笔规划效率低、冲突难发现的痛点。

## ✨ 核心功能

- **🪑 多规格圆桌**：支持 8/10/12 人三种规格圆桌，可自由摆放
- **👥 宾客管理**：侧边栏宾客卡片，包含姓名、辈分标签、忌口备注
- **🎯 智能拖拽**：流畅的拖拽落座体验，100 人规模无卡顿
- **⚠️ 冲突检测**：实时检测座位冲突，红色高亮阻止违规落座
- **↩️ 撤销重做**：Ctrl+Z 撤销，Ctrl+Y 重做，操作无忧
- **🖼️ 一键导出**：高清 PNG 座位图，方便家族群分享
- **💾 自动保存**：localStorage 持久化，刷新不丢失
- **🔍 画布缩放**：Alt+拖拽平移，Ctrl+滚轮缩放

## 🛠️ 技术栈

- **前端**：React 18 + TypeScript 5 + Vite 5
- **状态管理**：Zustand 4 (支持 persist 持久化)
- **样式**：TailwindCSS 3 + CSS Variables
- **图标**：Lucide React
- **导出**：html2canvas
- **容器化**：Docker + Docker Compose

## 🚀 快速开始

### 方式一：Docker Compose（推荐）

```bash
# 启动开发环境
docker-compose up dev

# 启动预览环境（生产构建）
docker-compose up preview

# 停止服务
docker-compose down
```

访问地址：
- 开发环境：http://localhost:5173
- 预览环境：http://localhost:8080

### 方式二：本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 类型检查
npm run check
```

## 📋 冲突规则配置

### 规则类型

| 规则类型 | 枚举值 | 说明 | 参数 |
|---------|--------|------|------|
| ❌ 不可同桌 | `NOT_SAME_TABLE` | 两位宾客不能坐在同一桌 | 无需参数 |
| ↔️ 必须隔桌 | `MIN_TABLES_DISTANCE` | 两位宾客必须间隔至少 N 桌 | `value`: 间隔桌数 |
| 👥 必须相邻 | `MUST_ADJACENT` | 两位宾客必须相邻而坐（同一桌） | 无需参数 |

### 规则数据格式

```json
{
  "id": "规则唯一ID",
  "type": "NOT_SAME_TABLE | MIN_TABLES_DISTANCE | MUST_ADJACENT",
  "guestAId": "宾客A的ID",
  "guestBId": "宾客B的ID",
  "value": 1,
  "description": "规则说明（可选）"
}
```

### 配置示例

#### 1. 前任情侣不可同桌
```json
{
  "type": "NOT_SAME_TABLE",
  "guestAId": "guest-zhang-weiguo",
  "guestBId": "guest-zhang-meiling",
  "description": "张卫国与张美玲为前任情侣，不可同桌"
}
```

#### 2. 婆媳必须间隔至少 2 桌
```json
{
  "type": "MIN_TABLES_DISTANCE",
  "guestAId": "guest-mother-in-law",
  "guestBId": "guest-daughter-in-law",
  "value": 2,
  "description": "婆媳关系紧张，必须间隔2桌以上"
}
```

#### 3. 宝妈必须挨着孩子
```json
{
  "type": "MUST_ADJACENT",
  "guestAId": "guest-mother",
  "guestBId": "guest-baby",
  "description": "宝妈需要随时照顾孩子"
}
```

## ✅ 验收用例

### 用例 1：正常编排流程

**场景**：张阿姨家腊月廿八团圆饭，20 人规模，2 桌 10 人桌

**前置条件**：
- 系统已加载 20 位宾客数据
- 画布上已放置「主桌」和「二桌」两张 10 人桌
- 已配置冲突规则：
  - 张爷爷 ↔ 张奶奶：必须相邻
  - 陈阿姨 ↔ 小宝：必须相邻

**操作步骤**：
1. 从侧边栏拖拽「张爷爷」到主桌 0 号座位
2. 拖拽「张奶奶」到主桌 1 号座位（与张爷爷相邻）
3. 依次将其他长辈拖拽到主桌
4. 将平辈和晚辈拖拽到二桌
5. 确保陈阿姨和小宝座位相邻

**预期结果**：
- ✅ 所有宾客成功落座，无冲突提示
- ✅ 张爷爷与张奶奶相邻而坐
- ✅ 陈阿姨与小宝相邻而坐
- ✅ 主桌和二桌各 10 人，无空座
- ✅ Ctrl+Z 可撤销上一步操作
- ✅ 点击「导出PNG」可下载高清座位图

---

### 用例 2：故意冲突场景 - 前任同桌

**场景**：测试「不可同桌」规则的触发

**前置条件**：
- 已配置规则：「张卫国 ↔ 张美玲：不可同桌（前任情侣）」
- 张美玲已落座在主桌
- 画布上有主桌和二桌两张桌子

**操作步骤**：
1. 从侧边栏拖拽「张卫国」卡片
2. 将其拖放到主桌的任意空座位上

**预期结果**：
- ✅ 拖放到主桌时，座位边框变为红色并闪烁
- ✅ 显示冲突提示：「❌ 张卫国 与 张美玲 不可同桌」
- ✅ 张卫国无法落座到主桌
- ✅ 张卫国卡片回到侧边栏
- ✅ 将张卫国拖到二桌则可以成功落座

---

### 用例 3：故意冲突场景 - 必须相邻

**场景**：测试「必须相邻」规则的触发

**前置条件**：
- 已配置规则：「陈阿姨 ↔ 小宝：必须相邻」
- 小宝已落座在主桌 5 号座位
- 主桌座位编号：0-1-2-3-4-5-6-7-8-9（环形排列）

**操作步骤**：
1. 从侧边栏拖拽「陈阿姨」卡片
2. 尝试放到主桌 0 号座位（与 5 号座位距离最远）

**预期结果**：
- ✅ 拖放到 0 号座位时，座位边框变为红色并闪烁
- ✅ 显示冲突提示：「❌ 陈阿姨 与 小宝 必须相邻而坐」
- ✅ 陈阿姨无法落座到 0 号座位
- ✅ 尝试放到 4 号或 6 号座位（与 5 号相邻），可以成功落座

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + Z` | 撤销上一步操作 |
| `Ctrl + Y` / `Ctrl + Shift + Z` | 重做撤销的操作 |
| `Alt + 拖拽` / `鼠标中键拖拽` | 平移画布 |
| `Ctrl + 滚轮` | 缩放画布 |
| `Esc` | 取消选择 |

## 📁 项目结构

```
src/
├── components/          # UI 组件
│   ├── Canvas/          # 画布组件
│   ├── GuestCard/       # 宾客卡片
│   ├── GuestSidebar/    # 宾客侧边栏
│   ├── RoundTable/      # 圆桌组件
│   ├── RuleModal/       # 规则配置弹窗
│   ├── SeatSlot/        # 座位槽位
│   └── Toolbar/         # 顶部工具栏
├── engine/
│   └── ConflictDetectionEngine.ts  # 冲突检测引擎
├── hooks/               # 自定义 Hooks
│   ├── useCanvasPan.ts  # 画布平移缩放
│   ├── useDragDrop.ts   # 拖拽逻辑
│   └── useKeyboardShortcuts.ts  # 快捷键
├── store/
│   └── useSeatingStore.ts  # Zustand 状态管理
├── types/               # TypeScript 类型定义
├── utils/               # 工具函数
│   ├── colors.ts        # 颜色和坐标计算
│   ├── exportPNG.ts     # PNG 导出
│   └── idGenerator.ts   # ID 生成器
├── data/
│   └── mockData.ts      # 示例数据
├── pages/
│   └── Home.tsx         # 主页
├── App.tsx
├── main.tsx
└── index.css            # 全局样式和主题
```

## 🔧 核心实现细节

### 拖拽性能优化

- 使用 CSS `transform: translate3d()` 启用 GPU 加速
- 拖拽元素添加 `will-change: transform` 属性
- 宾客卡片使用 `React.memo` 避免不必要重渲染
- 画布使用 `contain: strict` 隔离重绘范围
- 100 人规模测试：拖拽帧率稳定 60fps

### 冲突检测引擎

- 规则驱动设计，易于扩展新规则类型
- 实时检测，拖拽时即可预览冲突
- 支持桌间距离计算（基于像素坐标转换为桌数单位）
- 环形座位相邻检测（考虑环形排列特性）

### 操作历史

- 最多保存 50 步历史记录
- JSON 深拷贝保证状态快照完整性
- Zustand persist 中间件自动持久化到 localStorage

## 🧪 测试命令

```bash
# 类型检查
npm run check

# ESLint 检查
npm run lint

# 构建生产版本
npm run build
```

## 📝 License

MIT
