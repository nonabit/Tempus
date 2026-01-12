## Lib（工具库）

纯工具函数，无副作用。

**文件列表：**

- utils.ts - 通用工具函数
  - `cn()` - 合并 Tailwind CSS 类名（clsx + tailwind-merge）

**约定：**

- 所有函数必须是纯函数（无副作用）
- 函数需要类型声明
- 通用工具放在 utils.ts，特定领域工具可创建独立文件
