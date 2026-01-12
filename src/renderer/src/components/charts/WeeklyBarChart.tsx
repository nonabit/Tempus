// 周工时柱状图
import { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
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

interface WeeklyBarChartProps {
  className?: string
}

export function WeeklyBarChart({ className }: WeeklyBarChartProps) {
  const { getWeeklyStats, formatMinutes, settings } = useWorkStats()
  const [weekOffset, setWeekOffset] = useState(0)

  // 计算目标周日期
  const targetDate = useMemo(
    () => dayjs().add(weekOffset, 'week').format('YYYY-MM-DD'),
    [weekOffset]
  )

  const stats = useMemo(() => getWeeklyStats(targetDate), [getWeeklyStats, targetDate])

  // 转换为 Recharts 数据格式
  const chartData = useMemo(
    () =>
      stats.dailyData.map((day) => ({
        name: day.dayLabel,
        normal: Math.round((day.normalMinutes / 60) * 10) / 10,
        overtime: Math.round((day.overtimeMinutes / 60) * 10) / 10,
        total: Math.round((day.totalMinutes / 60) * 10) / 10,
        hasEntry: day.hasEntry
      })),
    [stats.dailyData]
  )

  // 标准工时基准线
  const standardHours = settings.standardWorkHours

  // 周导航
  const goToPrevWeek = () => setWeekOffset((prev) => prev - 1)
  const goToNextWeek = () => setWeekOffset((prev) => prev + 1)
  const goToCurrentWeek = () => setWeekOffset(0)

  // 格式化周标题
  const weekTitle = useMemo(() => {
    const start = dayjs(stats.weekStart)
    const end = dayjs(stats.weekEnd)
    if (start.month() === end.month()) {
      return `${start.format('M月D日')} - ${end.format('D日')}`
    }
    return `${start.format('M月D日')} - ${end.format('M月D日')}`
  }, [stats.weekStart, stats.weekEnd])

  // 自定义 Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="rounded-lg border border-neutral-200 bg-white p-2 shadow-lg dark:border-neutral-600 dark:bg-neutral-700">
          <p className="text-xs font-medium text-neutral-800 dark:text-neutral-100">{label}</p>
          {data.hasEntry ? (
            <>
              <p className="text-xs text-neutral-600 dark:text-neutral-300">
                总工时: {data.total}小时
              </p>
              {data.overtime > 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  加班: {data.overtime}小时
                </p>
              )}
            </>
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
      title="周工时统计"
      subtitle={`${weekTitle} · 总计 ${formatMinutes(stats.totalMinutes)}`}
      className={className}
      action={
        <div className="flex items-center gap-1">
          <button
            onClick={goToPrevWeek}
            className="rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <IconChevronLeft className="h-4 w-4 text-neutral-500" />
          </button>
          <button
            onClick={goToCurrentWeek}
            className={cn(
              'rounded px-2 py-0.5 text-xs',
              weekOffset === 0
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700'
            )}
          >
            本周
          </button>
          <button
            onClick={goToNextWeek}
            className="rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <IconChevronRight className="h-4 w-4 text-neutral-500" />
          </button>
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#737373', fontSize: 11 }}
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
          <Bar dataKey="normal" stackId="a" fill="#60a5fa" radius={[0, 0, 0, 0]} />
          <Bar dataKey="overtime" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* 图例 */}
      <div className="mt-2 flex justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-blue-400" />
          <span className="text-[10px] text-neutral-500 dark:text-neutral-400">正常工时</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-amber-500" />
          <span className="text-[10px] text-neutral-500 dark:text-neutral-400">加班</span>
        </div>
      </div>
    </ChartContainer>
  )
}
