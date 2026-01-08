## Preload（预加载脚本）

Electron 预加载脚本，作为主进程与渲染进程之间的安全桥接。

**文件列表：**
- index.ts - 预加载脚本入口，暴露安全的 API 到渲染进程
- index.d.ts - TypeScript 类型声明

**职责：**
- 通过 contextBridge 安全暴露 Electron API
- 定义渲染进程可用的 API 接口
- 保持上下文隔离的安全性

**约定：**
- 只暴露必要的 API，遵循最小权限原则
- 所有暴露的 API 需要在 index.d.ts 中声明类型
