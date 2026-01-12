// 月工时趋势折线图
import { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import dayjs from 'dayjs'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { ChartContainer } from './ChartContainer'
import { useWorkStats } from '@/hooks/useWorkStats'
import { cn } from '@/lib/utils'

interface MonthlyLineChartProps {
  className?: string
}

export function MonthlyLineChart({ className }: MonthlyLineChartProps) {
  const { getMonthlyStats, formatMinutes, settings } = useWorkStats()
  const [monthOffset, setMonthOffset] = useState(0)

  // 计算目标月
  const targetDate = useMemo(() => dayjs().add(monthOffset, 'month'), [monthOffset])

  const stats = useMemo(
    () => getMonthlyStats(targetDate.year(), targetDate.month() + 1),
    [getMonthlyStats, targetDate]
  )

  // 转换为 Recharts 数据格式
  const chartData = useMemo(
    () =>
      stats.dailyData.map((day) => ({
        name: day.date.slice(-2), // 只取日期
        hours: day.hasEntry ? Math.round((day.totalMinutes / 60) * 10) / 10 : null,
        hasEntry: day.hasEntry
      })),
    [stats.dailyData]
  )

  // 标准工时基准线
  const standardHours = settings.standardWorkHours

  // 月导航
  const goToPrevMonth = () => setMonthOffset((prev) => prev - 1)
  const goToNextMonth = () => setMonthOffset((prev) => prev + 1)
  const goToCurrentMonth = () => setMonthOffset(0)

  // 格式化月标题
  const monthTitle = targetDate.format('YYYY年M月')

  // 自定义 Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const fullDate = `${targetDate.format('YYYY-MM')}-${label.padStart(2, '0')}`
      return (
        <div className="rounded-lg border border-neutral-200 bg-white p-2 shadow-lg dark:border-neutral-600 dark:bg-neutral-700">
          <p className="text-xs font-medium text-neutral-800 dark:text-neutral-100">
            {dayjs(fullDate).format('M月D日')}
          </p>
          {data.hasEntry ? (
            <p className="text-xs text-neutral-600 dark:text-neutral-300">工时: {data.hours}小时</p>
          ) : (
            <p className="text-xs text-neutral-400">无记录</p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <ChartContainer
      title="月度工时趋势"
      subtitle={`${monthTitle} · 总计 ${formatMinutes(stats.totalMinutes)} · ${stats.workDays}个工作日`}
      className={className}
      action={
        <div className="flex items-center gap-1">
          <button
            onClick={goToPrevMonth}
            className="rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <IconChevronLeft className="h-4 w-4 text-neutral-500" />
          </button>
          <button
            onClick={goToCurrentMonth}
            className={cn(
              'rounded px-2 py-0.5 text-xs',
              monthOffset === 0
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700'
            )}
          >
            本月
          </button>
          <button
            onClick={goToNextMonth}
            className="rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <IconChevronRight className="h-4 w-4 text-neutral-500" />
          </button>
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#737373', fontSize: 10 }}
            interval={4} // 每隔 5 天显示一个刻度
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#737373', fontSize: 11 }}
            domain={[0, 'dataMax + 2']}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={standardHours}
            stroke="#3b82f6"
            strokeDasharray="4 4"
            strokeWidth={1.5}
            label={{
              value: `${standardHours}h`,
              position: 'right',
              fill: '#3b82f6',
              fontSize: 10
            }}
          />
          <Line
            type="monotone"
            dataKey="hours"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 3 }}
            activeDot={{ r: 5, fill: '#10b981' }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* 统计摘要 */}
      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-700">
        <div className="text-center">
          <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
            {stats.workDays}
          </p>
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400">工作天数</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
            {Math.round((stats.averageMinutes / 60) * 10) / 10}h
          </p>
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400">日均工时</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">
            {Math.round((stats.totalOvertimeMinutes / 60) * 10) / 10}h
          </p>
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400">总加班</p>
        </div>
      </div>
    </ChartContainer>
  )
}
