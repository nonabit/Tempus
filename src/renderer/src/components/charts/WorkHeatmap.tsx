// 工时热力图组件 - 类似 GitHub 贡献图
import { useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { ChartContainer } from './ChartContainer'
import { useWorkStats, HeatmapData } from '@/hooks/useWorkStats'
import { cn } from '@/lib/utils'

interface WorkHeatmapProps {
  className?: string
}

// 热力图颜色等级 - 东方美学配色
const LEVEL_COLORS = [
  'bg-yuebai dark:bg-neutral-700', // 0: 无数据
  'bg-chenwu dark:bg-emerald-900', // 1: <4h
  'bg-zhuqing/30 dark:bg-emerald-700', // 2: 4-6h
  'bg-zhuqing/60 dark:bg-emerald-500', // 3: 6-8h
  'bg-zhuqing dark:bg-emerald-400', // 4: 8-10h
  'bg-qiuxiang dark:bg-amber-600' // 5: >10h（加班严重）
]

const MONTH_LABELS = [
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月'
]

const WEEKDAY_LABELS = ['一', '三', '五']

export function WorkHeatmap({ className }: WorkHeatmapProps) {
  const { getYearHeatmapData, formatMinutes } = useWorkStats()
  const [yearOffset, setYearOffset] = useState(0)

  const targetYear = useMemo(() => dayjs().year() + yearOffset, [yearOffset])
  const heatmapData = useMemo(
    () => getYearHeatmapData(targetYear),
    [getYearHeatmapData, targetYear]
  )

  // 将数据按周组织（每行是一周，共 53 列 x 7 行）
  const weeks = useMemo(() => {
    const yearStart = dayjs(`${targetYear}-01-01`)
    const startDayOfWeek = yearStart.day() || 7 // 转换为周一=1的格式

    // 创建周数组
    const weeksArray: (HeatmapData | null)[][] = []
    let currentWeek: (HeatmapData | null)[] = []

    // 填充年初前的空白
    for (let i = 1; i < startDayOfWeek; i++) {
      currentWeek.push(null)
    }

    // 填充数据
    heatmapData.forEach((data) => {
      currentWeek.push(data)
      if (currentWeek.length === 7) {
        weeksArray.push(currentWeek)
        currentWeek = []
      }
    })

    // 填充年末剩余
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null)
      }
      weeksArray.push(currentWeek)
    }

    return weeksArray
  }, [heatmapData, targetYear])

  // 计算年度统计
  const yearStats = useMemo(() => {
    let totalMinutes = 0
    let workDays = 0
    let maxMinutes = 0

    heatmapData.forEach((data) => {
      if (data.totalMinutes > 0) {
        totalMinutes += data.totalMinutes
        workDays++
        if (data.totalMinutes > maxMinutes) {
          maxMinutes = data.totalMinutes
        }
      }
    })

    return { totalMinutes, workDays, maxMinutes }
  }, [heatmapData])

  // 年导航
  const goToPrevYear = () => setYearOffset((prev) => prev - 1)
  const goToNextYear = () => setYearOffset((prev) => prev + 1)
  const goToCurrentYear = () => setYearOffset(0)

  // 计算月份标签位置
  const monthPositions = useMemo(() => {
    const positions: { month: number; weekIndex: number }[] = []
    let currentMonth = -1

    weeks.forEach((week, weekIndex) => {
      week.forEach((day) => {
        if (day) {
          const month = parseInt(day.date.slice(5, 7)) - 1
          if (month !== currentMonth) {
            positions.push({ month, weekIndex })
            currentMonth = month
          }
        }
      })
    })

    return positions
  }, [weeks])

  return (
    <ChartContainer
      title="年度工时热力图"
      subtitle={`${targetYear}年 · ${yearStats.workDays}个工作日 · 总计 ${formatMinutes(yearStats.totalMinutes)}`}
      className={className}
      action={
        <div className="flex items-center gap-1">
          <button
            onClick={goToPrevYear}
            className="rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <IconChevronLeft className="h-4 w-4 text-neutral-500" />
          </button>
          <button
            onClick={goToCurrentYear}
            className={cn(
              'rounded px-2 py-0.5 text-xs',
              yearOffset === 0
                ? 'bg-zhuqing/20 text-zhuqing dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-songyan hover:bg-chenwu dark:hover:bg-neutral-700'
            )}
          >
            今年
          </button>
          <button
            onClick={goToNextYear}
            className="rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <IconChevronRight className="h-4 w-4 text-neutral-500" />
          </button>
        </div>
      }
    >
      <div className="overflow-x-auto">
        {/* 月份标签 */}
        <div className="mb-1 flex pl-6">
          {monthPositions.map(({ month, weekIndex }) => (
            <span
              key={`${month}-${weekIndex}`}
              className="text-[10px] text-songyan"
              style={{
                marginLeft:
                  weekIndex === 0
                    ? 0
                    : `${(weekIndex - (monthPositions.find((p) => p.month === month - 1)?.weekIndex || 0) - 1) * 12}px`,
                minWidth: '24px'
              }}
            >
              {MONTH_LABELS[month]}
            </span>
          ))}
        </div>

        <div className="flex">
          {/* 周几标签 */}
          <div className="mr-1 flex flex-col justify-around py-[2px]">
            {WEEKDAY_LABELS.map((label) => (
              <span key={label} className="text-[10px] text-songyan leading-[10px]">
                {label}
              </span>
            ))}
          </div>

          {/* 热力图格子 */}
          <div className="flex gap-[2px]">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[2px]">
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={cn(
                      'h-[10px] w-[10px] rounded-[2px] transition-colors',
                      day ? LEVEL_COLORS[day.level] : 'bg-transparent'
                    )}
                    title={
                      day
                        ? `${day.date}: ${day.totalMinutes > 0 ? formatMinutes(day.totalMinutes) : '无记录'}`
                        : ''
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 图例 */}
      <div className="mt-3 flex items-center justify-end gap-1">
        <span className="text-[10px] text-songyan">少</span>
        {LEVEL_COLORS.slice(0, 6).map((color, i) => (
          <div key={i} className={cn('h-[10px] w-[10px] rounded-[2px]', color)} />
        ))}
        <span className="text-[10px] text-songyan">多</span>
      </div>
    </ChartContainer>
  )
}
