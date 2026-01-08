## Main（主进程）

Electron 主进程代码，负责应用生命周期管理和原生系统交互。

**文件列表：**
- index.ts - 应用入口，创建主窗口和处理 IPC 通信

**职责：**
- 创建和管理 BrowserWindow
- 处理应用生命周期事件（ready、activate、window-all-closed）
- 注册 IPC 通信处理器
- 设置开发环境 HMR 支持

**约定：**
- 所有主进程逻辑放在此目录
- IPC 处理器使用 `ipcMain.on()` 或 `ipcMain.handle()` 注册
