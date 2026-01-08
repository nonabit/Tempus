## Types（类型定义）

TypeScript 类型声明。

**文件列表：**
- timesheet.ts - 工时相关类型
  - `TimeEntry` - 单条工时记录（日期、上下班时间、休息时间、备注）
  - `WorkHoursInfo` - 计算后的工时信息（总时长、加班时长）
  - `UserSettings` - 用户设置（时薪、标准工时、惩罚系数）
  - `DEFAULT_SETTINGS` - 默认设置常量

**约定：**
- 接口使用 PascalCase 命名
- 常量使用 UPPER_SNAKE_CASE 命名
- 按业务领域组织类型文件
