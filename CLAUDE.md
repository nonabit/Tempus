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
│   ├── index.ts        # 主进程入口，IPC 处理器
│   └── database.ts     # SQLite 数据库服务
├── preload/            # Electron 预加载脚本（IPC 通信桥接）
│   ├── index.ts        # 暴露数据库 API 给渲染进程
│   └── index.d.ts      # 类型声明
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
    │   ├── settings/     # 设置相关组件
    │   │   └── ApiConfigForm.tsx   # API 配置表单
    │   ├── calendar-view.tsx   # 日历视图核心组件
    │   └── sidebar-demo.tsx    # 主界面布局
    ├── stores/           # Zustand 状态管理
    │   ├── timeStore.ts        # 工时数据状态（含 SQLite 同步）
    │   ├── achievementStore.ts # 成就系统状态
    │   └── settingsStore.ts    # 用户设置状态（API 配置等）
    ├── services/
    │   ├── storage.ts    # 本地存储服务（旧，将废弃）
    │   └── companyApi.ts # 公司 API 同步服务
    ├── hooks/
    │   ├── useAchievementSync.ts  # 成就同步 Hook
    │   └── useAppInit.ts          # 应用初始化 Hook
    ├── data/
    │   └── achievements.ts  # 成就定义数据
    ├── types/            # TypeScript 类型定义
    │   ├── timesheet.ts
    │   ├── achievement.ts
    │   └── api.ts        # API 相关类型
    └── lib/
        └── utils.ts      # cn() 工具函数
```

### 核心技术点

- **农历支持**: 使用 `lunar-typescript` 库，提供农历日期、节气、法定节假日（休/班）显示
- **日期处理**: 使用 `dayjs` 配合中文本地化
- **动画**: 使用 `motion/react` 实现侧边栏动画效果
- **样式**: Tailwind CSS 4 + CVA (class-variance-authority) 管理组件变体
- **状态管理**: 使用 `zustand` 管理工时和成就系统状态
- **本地存储**: 使用 `better-sqlite3` 进行 SQLite 持久化（主进程），通过 IPC 与渲染进程通信
- **API 同步**: 支持从公司 REST API 同步打卡记录

### 路径别名

- `@/*` 和 `@renderer/*` → `src/renderer/src/`

## 代码规范

- 交流和注释必须使用中文
- 文档存放在 `docs/` 目录下
- Prettier 配置: 单引号、无分号、100 字符宽度

## AI 导航约定（必须遵守）

本项目使用文件夹级别的 README.md 索引系统：

**当你新增/删除/重命名源文件时，必须同时更新：**
1. 该文件所在目录的 `README.md`（如果存在）
2. 如果涉及顶级目录结构变化，更新本文件的目录结构部分

**示例：**
- 新增 `src/renderer/src/components/ui/Modal.tsx` → 更新 `src/renderer/src/components/ui/README.md`
- 删除某个组件 → 从对应目录的 README.md 中移除该条目
- 新增依赖库 → 更新本文件的「核心技术点」部分
