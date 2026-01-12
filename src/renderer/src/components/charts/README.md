# charts 组件目录

可视化图表组件，用于展示工时统计数据。基于 Recharts 构建。

## 文件列表

| 文件                   | 说明                                   |
| ---------------------- | -------------------------------------- |
| `index.ts`             | 组件导出入口                           |
| `ChartContainer.tsx`   | 图表容器组件（统一样式、标题、操作区） |
| `WeeklyBarChart.tsx`   | 周工时柱状图（堆叠显示正常工时+加班）  |
| `MonthlyLineChart.tsx` | 月度工时趋势折线图                     |
| `WorkHeatmap.tsx`      | 年度工时热力图（类似 GitHub 贡献图）   |
| `OvertimeStats.tsx`    | 加班统计卡片（周/月切换）              |

## 依赖

- `recharts` - 图表库
- `@tabler/icons-react` - 图标
- `@/hooks/useWorkStats` - 数据聚合 Hook
- `@/lib/utils` - cn() 工具函数

## 使用示例

```tsx
import { WeeklyBarChart, MonthlyLineChart, WorkHeatmap, OvertimeStats } from '@/components/charts'

// 在页面中使用
<WeeklyBarChart />
<MonthlyLineChart />
<WorkHeatmap />
<OvertimeStats />
```

## 颜色约定

- 正常工时（≤8h）：蓝色/绿色系
- 加班（>8h）：橙色/琥珀色系
- 严重加班（>10h）：红色系
- 基准线：蓝色虚线
