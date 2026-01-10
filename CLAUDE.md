# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Tempus 是一个工时记录桌面应用，基于 Electron + React + TypeScript + Tailwind CSS 构建。

## 常用开发命令

```bash
# 启动开发服务器
pnpm dev

# 类型检查
pnpm typecheck

# 构建应用
pnpm build

# 代码格式化
pnpm format

# 代码检查
pnpm lint

# 打包为各平台安装包
pnpm build:mac
pnpm build:win
pnpm build:linux
```

## 代码架构

### 目录结构

```
src/
├── main/               # Electron 主进程代码
├── preload/            # Electron 预加载脚本（IPC 通信桥接）
└── renderer/src/       # React 渲染进程（前端 UI）
    ├── components/
    │   ├── ui/         # 基础 UI 组件（Button、Sidebar）
    │   ├── achievement/  # 成就系统组件
    │   │   ├── AchievementWall.tsx      # 勋章墙展示
    │   │   ├── AchievementBadge.tsx     # 勋章卡片
    │   │   ├── AchievementDetail.tsx    # 勋章详情弹窗
    │   │   ├── AchievementIcon.tsx      # 勋章图标
    │   │   ├── AchievementProgress.tsx  # 进度条组件
    │   │   └── AchievementNotification.tsx  # 解锁通知弹窗
    │   ├── timesheet/    # 工时记录组件
    │   │   ├── TimeEntryForm.tsx   # 工时录入表单
    │   │   └── DailyTimeCard.tsx   # 当日工时卡片
    │   ├── widgets/      # 趣味小组件
    │   │   ├── IncomeCard.tsx      # 实时收入卡片（水位线动画）
    │   │   └── FunStats.tsx        # 趣味统计卡片
    │   ├── calendar-view.tsx   # 日历视图核心组件
    │   └── sidebar-demo.tsx    # 主界面布局
    ├── stores/           # Zustand 状态管理
    │   ├── timeStore.ts        # 工时数据状态
    │   └── achievementStore.ts # 成就系统状态
    ├── services/
    │   └── storage.ts    # 本地存储服务
    ├── hooks/
    │   └── useAchievementSync.ts  # 成就同步 Hook
    ├── data/
    │   └── achievements.ts  # 成就定义数据
    ├── types/            # TypeScript 类型定义
    │   ├── timesheet.ts
    │   └── achievement.ts
    └── lib/
        └── utils.ts      # cn() 工具函数
```

### 核心技术点

- **农历支持**: 使用 `lunar-typescript` 库，提供农历日期、节气、法定节假日（休/班）显示
- **日期处理**: 使用 `dayjs` 配合中文本地化
- **动画**: 使用 `motion/react` 实现侧边栏动画效果
- **样式**: Tailwind CSS 4 + CVA (class-variance-authority) 管理组件变体
- **状态管理**: 使用 `zustand` 管理工时和成就系统状态
- **本地存储**: 使用 localStorage 持久化数据

### 路径别名

- `@/*` 和 `@renderer/*` → `src/renderer/src/`

## 代码规范

- 交流和注释必须使用中文
- 文档存放在 `docs/` 目录下
- Prettier 配置: 单引号、无分号、100 字符宽度
