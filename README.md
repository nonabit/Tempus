# Tempus

工时记录桌面应用 - 基于 Electron + React + TypeScript + Tailwind CSS 构建。

## AI 导航约定

本项目使用文件夹级索引帮助 AI 工具维护全局架构意识：

- 每个主要文件夹包含 README.md 描述其角色和文件列表
- 源文件顶部包含：`// 📁 文件夹结构变更，请更新 ./README.md`
- 当添加/删除/重命名文件时，请更新对应文件夹的 README.md

## 技术栈

- Electron 33 + React 18.3 + TypeScript 5.6
- 构建工具：electron-vite 2.4
- 状态管理：Zustand 5.0
- 样式：Tailwind CSS 4.0 + class-variance-authority
- 日期处理：dayjs
- 农历支持：lunar-typescript
- 动画：motion/react

## 架构概览

```
src/
├── main/           # Electron 主进程代码
├── preload/        # Electron 预加载脚本（IPC 通信桥接）
└── renderer/src/   # React 渲染进程（前端 UI）
    ├── components/ # UI 组件库
    ├── stores/     # Zustand 状态管理
    ├── services/   # 服务层（存储、API）
    ├── types/      # TypeScript 类型定义
    └── lib/        # 工具函数
```

## 关键设计决策

- **农历显示**：使用 `lunar-typescript` 实现农历日期、节气、法定节假日显示
- **工时计算**：支持标准工时、加班时长、休息时间的自动计算
- **加班惩罚机制**：加班时薪递减，鼓励工作生活平衡
- **数据持久化**：使用 Zustand persist 中间件 + localStorage
- **路径别名**：`@/*` 和 `@renderer/*` → `src/renderer/src/`

## 推荐 IDE 配置

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## 开发命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 类型检查
pnpm typecheck

# 代码格式化
pnpm format

# 代码检查
pnpm lint

# 构建应用
pnpm build

# 打包为各平台安装包
pnpm build:mac    # macOS
pnpm build:win    # Windows
pnpm build:linux  # Linux
```
