## UI（基础组件）

通用 UI 组件库，提供可复用的基础组件。

**文件列表：**

- button.tsx - 按钮组件，支持 variant（default/destructive/outline/secondary/ghost/link）和 size（default/sm/lg/icon）变体
- sidebar.tsx - 侧边栏组件，支持展开/收起动画和响应式布局

**约定：**

- 所有组件接受 className 用于样式扩展
- 使用 CVA (class-variance-authority) 管理组件变体
- 使用 forwardRef 处理 ref 转发
- 组件命名使用 PascalCase，文件命名使用 kebab-case
