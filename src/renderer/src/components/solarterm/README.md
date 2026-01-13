## Solarterm（节气提醒）

节气提醒功能组件，在农历节气当天 App 启动时显示全屏节气卡片。

**组件：**

- SolarTermCard.tsx - 全屏节气卡片，展示节气名称、诗词、现代解读
- index.ts - 导出入口

**功能特点：**

- 渐变色背景（每个节气对应不同配色）
- 淡入动画效果
- 点击任意处关闭
- localStorage 记录已显示的节气，避免重复

**数据来源：**

- 节气数据定义在 `src/renderer/src/data/solarTerms.ts`
- 使用 `lunar-typescript` 库检测当日节气
