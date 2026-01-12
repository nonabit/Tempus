## Stores（状态管理）

Zustand 状态管理，管理应用全局状态。

**文件列表：**

- timeStore.ts - 工时数据状态管理
  - **状态**：entries（工时记录列表）、settings（用户设置）
  - **操作**：addEntry / updateEntry / deleteEntry / updateSettings
  - **查询**：getEntryByDate / getEntriesByMonth / getTodayEntry
  - **工具函数**：calculateWorkHours / calculateIncome

**核心功能：**

- 使用 persist 中间件自动持久化到 localStorage
- 支持标准工时和加班时长计算
- 实现加班惩罚机制（时薪递减）

**约定：**

- Store 使用 create 函数创建
- 持久化使用 persist 中间件
- 计算逻辑抽取为独立工具函数
