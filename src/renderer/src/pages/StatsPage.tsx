// 统计页面 - 整合所有图表组件
import { WeeklyBarChart, MonthlyLineChart, WorkHeatmap, OvertimeStats } from '@/components/charts'

export function StatsPage() {
  return (
    <div className="space-y-4">
      {/* 页面标题 */}
      <div className="mb-2">
        <h1 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">统计分析</h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          可视化工时数据，发现工作规律
        </p>
      </div>

      {/* 第一行：周统计 + 加班统计 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <WeeklyBarChart />
        <OvertimeStats />
      </div>

      {/* 第二行：月度趋势 */}
      <MonthlyLineChart />

      {/* 第三行：年度热力图 */}
      <WorkHeatmap />
    </div>
  )
}
