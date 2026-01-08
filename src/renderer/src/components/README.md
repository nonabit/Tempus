## Components（组件库）

React UI 组件，包含基础 UI 组件和业务组件。

**页面/布局组件：**
- sidebar-demo.tsx - 主界面布局，包含侧边栏和日历视图
- calendar-view.tsx - 日历视图组件，支持农历、节气、节假日显示

**业务组件：**
- timesheet/ - 工时相关组件（表单、卡片）
- Versions.tsx - 版本信息展示

**基础组件：**
- ui/ - 通用 UI 组件（Button、Sidebar 等）

**约定：**
- 页面级组件使用 kebab-case 命名（如 sidebar-demo.tsx）
- 通用组件放在 ui/ 目录
- 业务组件按功能模块分组（如 timesheet/）
