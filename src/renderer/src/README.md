## Renderer（渲染进程）

React 前端应用，负责用户界面渲染和交互。

**目录结构：**

- components/ - UI 组件库（基础组件、业务组件）
- stores/ - Zustand 状态管理
- services/ - 服务层（数据存储、API 调用）
- hooks/ - 自定义 React Hooks
- pages/ - 页面级组件
- types/ - TypeScript 类型定义
- lib/ - 工具函数
- data/ - 静态数据定义

**入口文件：**

- main.tsx - 应用入口，挂载 React 根组件
- App.tsx - 根组件，渲染主布局
- env.d.ts - 环境变量类型声明

**约定：**

- 使用路径别名 `@/*` 导入模块
- 样式使用 Tailwind CSS utilities
- 组件使用 TypeScript 编写
