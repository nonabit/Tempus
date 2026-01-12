// 加班统计卡片组件
import { useMemo, useState } from 'react'
import { IconClock, IconTrendingUp, IconTrendingDown, IconMinus } from '@tabler/icons-react'
import { ChartContainer } from './ChartContainer'
import { useWorkStats } from '@/hooks/useWorkStats'
import { cn } from '@/lib/utils'
import dayjs from 'dayjs'

interface OvertimeStatsProps {
  className?: string
}

type RangeType = 'week' | 'month'

export function OvertimeStats({ className }: OvertimeStatsProps) {
  const { getOvertimeStats, getComparisonStats } = useWorkStats()
  const [range, setRange] = useState<RangeType>('week')

  const overtimeData = useMemo(() => getOvertimeStats(range), [getOvertimeStats, range])
  const comparisonData = useMemo(() => getComparisonStats(range), [getComparisonStats, range])

  // 趋势图标
  const TrendIcon = ({ value }: { value: number }) => {
    if (value > 0) return <IconTrendingUp className="h-3 w-3 text-red-500" />
    if (value < 0) return <IconTrendingDown className="h-3 w-3 text-green-500" />
    return <IconMinus className="h-3 w-3 text-neutral-400" />
  }

  // 趋势颜色和文字
  const getTrendStyle = (value: number, isOvertime = false) => {
    if (value === 0) return { color: 'text-neutral-400', text: '持平' }
    // 对于加班，减少是好的（绿色），增加是坏的（红色）
    if (isOvertime) {
      return value > 0
        ? { color: 'text-red-500', text: `+${value}%` }
        : { color: 'text-green-500', text: `${value}%` }
    }
    // 对于总工时，增加是中性的
    return value > 0
      ? { color: 'text-blue-500', text: `+${value}%` }
      : { color: 'text-amber-500', text: `${value}%` }
  }

  const overtimeTrend = getTrendStyle(comparisonData.change.overtimePercent, true)

  return (
    <ChartContainer
      title="加班统计"
      subtitle={range === 'week' ? '本周数据' : '本月数据'}
      className={className}
      action={
        <div className="flex rounded-lg bg-neutral-100 p-0.5 dark:bg-neutral-700">
          <button
            onClick={() => setRange('week')}
            className={cn(
              'rounded-md px-2 py-0.5 text-xs transition-colors',
              range === 'week'
                ? 'bg-white text-neutral-800 shadow-sm dark:bg-neutral-600 dark:text-neutral-100'
                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            )}
          >
            周
          </button>
          <button
            onClick={() => setRange('month')}
            className={cn(
              'rounded-md px-2 py-0.5 text-xs transition-colors',
              range === 'month'
                ? 'bg-white text-neutral-800 shadow-sm dark:bg-neutral-600 dark:text-neutral-100'
                : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            )}
          >
            月
          </button>
        </div>
      }
    >
      {/* 主要数据 */}
      <div className="mb-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">
          {Math.round((overtimeData.totalMinutes / 60) * 10) / 10}h
        </span>
        <div className="flex items-center gap-1">
          <TrendIcon value={comparisonData.change.overtimePercent} />
          <span className={cn('text-xs', overtimeTrend.color)}>
            {overtimeTrend.text} vs 上{range === 'week' ? '周' : '月'}
          </span>
        </div>
      </div>

      {/* 详细统计 */}
      <div className="grid grid-cols-3 gap-3">
        {/* 加班天数 */}
        <div className="rounded-lg bg-neutral-50 p-2 dark:bg-neutral-700/50">
          <div className="mb-1 flex items-center gap-1">
            <IconClock className="h-3 w-3 text-neutral-400" />
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">加班天数</span>
          </div>
          <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
            {overtimeData.overtimeDays}天
          </p>
        </div>

        {/* 日均加班 */}
        <div className="rounded-lg bg-neutral-50 p-2 dark:bg-neutral-700/50">
          <div className="mb-1 flex items-center gap-1">
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">日均加班</span>
          </div>
          <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
            {overtimeData.averageMinutes > 0
              ? `${Math.round((overtimeData.averageMinutes / 60) * 10) / 10}h`
              : '-'}
          </p>
        </div>

        {/* 最长加班 */}
        <div className="rounded-lg bg-neutral-50 p-2 dark:bg-neutral-700/50">
          <div className="mb-1 flex items-center gap-1">
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">最长单日</span>
          </div>
          <p className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
            {overtimeData.maxMinutes > 0
              ? `${Math.round((overtimeData.maxMinutes / 60) * 10) / 10}h`
              : '-'}
          </p>
          {overtimeData.maxDate && (
            <p className="text-[10px] text-neutral-400">
              {dayjs(overtimeData.maxDate).format('M/D')}
            </p>
          )}
        </div>
      </div>

      {/* 对比提示 */}
      {overtimeData.totalMinutes === 0 && (
        <div className="mt-3 rounded-lg bg-green-50 px-3 py-2 dark:bg-green-900/20">
          <p className="text-xs text-green-600 dark:text-green-400">
            🎉 {range === 'week' ? '本周' : '本月'}没有加班记录，继续保持！
          </p>
        </div>
      )}
    </ChartContainer>
  )
}
