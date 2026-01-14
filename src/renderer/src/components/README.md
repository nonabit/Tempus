## Components（组件库）

React UI 组件，包含基础 UI 组件和业务组件。

**页面/布局组件：**

- layout/ - 主界面布局组件（SidebarDemo）
- calendar/ - 日历视图组件，支持农历、节气、节假日显示

**业务组件：**

- timesheet/ - 工时相关组件（表单、卡片）
- achievement/ - 成就系统组件（勋章墙、通知弹窗）
- solarterm/ - 节气提醒组件（全屏节气卡片）
- widgets/ - 趣味小组件（收入卡片、统计卡片）
- charts/ - 可视化图表组件（柱状图、折线图、热力图）
- settings/ - 设置相关组件（API 配置表单）

**基础组件：**

- ui/ - 通用 UI 组件（Button、Sidebar 等）

**约定：**

- 所有组件按功能模块分组放在子目录中
- 通用组件放在 ui/ 目录
- 业务组件按功能模块分组（如 timesheet/）
