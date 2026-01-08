## Services（服务层）

数据持久化和外部服务交互。

**文件列表：**
- storage.ts - 本地存储服务
  - `saveTimeEntries()` / `loadTimeEntries()` - 工时记录存取
  - `saveSettings()` / `loadSettings()` - 用户设置存取
  - `exportData()` / `importData()` - 数据导入导出
  - `clearAllData()` - 清除所有数据

**约定：**
- 使用 localStorage 进行数据持久化
- 错误处理使用 try-catch 并打印日志
- 存储键名使用 `tempus_` 前缀

**注意：**
- 当前 Zustand persist 中间件已接管主要存储逻辑
- 此服务保留用于高级功能（导入导出等）
