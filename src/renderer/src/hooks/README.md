## hooks 目录

自定义 React Hooks，封装可复用的状态逻辑。

**文件列表：**

- useAppInit.ts - 应用初始化 Hook（从 SQLite 加载数据）
- useAchievementSync.ts - 成就同步 Hook（监听工时变化，触发成就检测）
- useWorkStats.ts - 工时统计计算 Hook（为图表组件提供聚合数据）

**约定：**

- Hook 命名以 `use` 开头
- 返回值应有明确的类型定义
