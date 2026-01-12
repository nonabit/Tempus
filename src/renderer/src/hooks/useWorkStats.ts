// 工时统计计算 Hook
// 为图表组件提供聚合数据

import { useMemo } from 'react'
import dayjs, { Dayjs } from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import { useTimeStore, calculateWorkHours } from '@/stores/timeStore'
import type { TimeEntry } from '@/types/timesheet'

dayjs.extend(isoWeek)

// 每日工时数据（用于图表）
export interface DailyWorkData {
  date: string // YYYY-MM-DD
  dayLabel: string // 周几或日期
  totalMinutes: number
  normalMinutes: number // 标准工时内的分钟数
  overtimeMinutes: number // 加班分钟数
  hasEntry: boolean // 是否有记录
}

// 周统计数据
export interface WeeklyStats {
  weekStart: string // 周一日期
  weekEnd: string // 周日日期
  dailyData: DailyWorkData[] // 7 天数据
  totalMinutes: number
  totalOvertimeMinutes: number
  averageMinutes: number // 日均（仅计算有记录的天数）
  workDays: number // 有记录的天数
}

// 月统计数据
export interface MonthlyStats {
  year: number
  month: number
  dailyData: DailyWorkData[] // 整月数据
  totalMinutes: number
  totalOvertimeMinutes: number
  averageMinutes: number
  workDays: number
}

// 热力图数据项
export interface HeatmapData {
  date: string
  totalMinutes: number
  level: 0 | 1 | 2 | 3 | 4 // 0=无数据, 1=<4h, 2=4-8h, 3=8-10h, 4=>10h
}

// 对比统计数据
export interface ComparisonStats {
  current: {
    totalMinutes: number
    overtimeMinutes: number
    workDays: number
  }
  previous: {
    totalMinutes: number
    overtimeMinutes: number
    workDays: number
  }
  change: {
    totalPercent: number // 正数表示增加
    overtimePercent: number
    workDaysChange: number
  }
}

// 加班统计
export interface OvertimeStatsData {
  totalMinutes: number // 总加班分钟数
  averageMinutes: number // 日均加班分钟数
  maxMinutes: number // 单日最长加班
  maxDate: string | null // 最长加班日期
  overtimeDays: number // 加班天数
}

// 周几标签
const WEEKDAY_LABELS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']

// 计算工时级别（用于热力图）
function getWorkLevel(minutes: number): 0 | 1 | 2 | 3 | 4 {
  if (minutes === 0) return 0
  if (minutes < 240) return 1 // < 4h
  if (minutes < 480) return 2 // 4-8h
  if (minutes < 600) return 3 // 8-10h
  return 4 // > 10h
}

export function useWorkStats() {
  const { entries, settings } = useTimeStore()

  // 构建日期到记录的映射
  const entriesMap = useMemo(() => {
    const map = new Map<string, TimeEntry>()
    entries.forEach((entry) => {
      map.set(entry.date, entry)
    })
    return map
  }, [entries])

  // 获取某天的工时数据
  const getDailyData = (date: Dayjs, dayLabel?: string): DailyWorkData => {
    const dateStr = date.format('YYYY-MM-DD')
    const entry = entriesMap.get(dateStr)

    if (!entry) {
      return {
        date: dateStr,
        dayLabel: dayLabel || date.format('MM-DD'),
        totalMinutes: 0,
        normalMinutes: 0,
        overtimeMinutes: 0,
        hasEntry: false
      }
    }

    const workInfo = calculateWorkHours(entry, settings)
    const standardMinutes = settings.standardWorkHours * 60

    return {
      date: dateStr,
      dayLabel: dayLabel || date.format('MM-DD'),
      totalMinutes: workInfo.totalMinutes,
      normalMinutes: Math.min(workInfo.totalMinutes, standardMinutes),
      overtimeMinutes: workInfo.overtimeMinutes,
      hasEntry: true
    }
  }

  // 获取指定周的统计数据
  const getWeeklyStats = (date?: string): WeeklyStats => {
    const targetDate = date ? dayjs(date) : dayjs()
    const weekStart = targetDate.startOf('isoWeek')
    const weekEnd = targetDate.endOf('isoWeek')

    const dailyData: DailyWorkData[] = []
    let totalMinutes = 0
    let totalOvertimeMinutes = 0
    let workDays = 0

    for (let i = 0; i < 7; i++) {
      const currentDay = weekStart.add(i, 'day')
      const dayData = getDailyData(currentDay, WEEKDAY_LABELS[i])
      dailyData.push(dayData)

      totalMinutes += dayData.totalMinutes
      totalOvertimeMinutes += dayData.overtimeMinutes
      if (dayData.hasEntry) workDays++
    }

    return {
      weekStart: weekStart.format('YYYY-MM-DD'),
      weekEnd: weekEnd.format('YYYY-MM-DD'),
      dailyData,
      totalMinutes,
      totalOvertimeMinutes,
      averageMinutes: workDays > 0 ? Math.round(totalMinutes / workDays) : 0,
      workDays
    }
  }

  // 获取指定月的统计数据
  const getMonthlyStats = (year?: number, month?: number): MonthlyStats => {
    const targetDate = year && month ? dayjs(`${year}-${month}-01`) : dayjs()
    const targetYear = targetDate.year()
    const targetMonth = targetDate.month() + 1
    const monthStart = targetDate.startOf('month')
    const daysInMonth = targetDate.daysInMonth()

    const dailyData: DailyWorkData[] = []
    let totalMinutes = 0
    let totalOvertimeMinutes = 0
    let workDays = 0

    for (let i = 0; i < daysInMonth; i++) {
      const currentDay = monthStart.add(i, 'day')
      const dayData = getDailyData(currentDay, `${i + 1}日`)
      dailyData.push(dayData)

      totalMinutes += dayData.totalMinutes
      totalOvertimeMinutes += dayData.overtimeMinutes
      if (dayData.hasEntry) workDays++
    }

    return {
      year: targetYear,
      month: targetMonth,
      dailyData,
      totalMinutes,
      totalOvertimeMinutes,
      averageMinutes: workDays > 0 ? Math.round(totalMinutes / workDays) : 0,
      workDays
    }
  }

  // 获取全年热力图数据
  const getYearHeatmapData = (year?: number): HeatmapData[] => {
    const targetYear = year || dayjs().year()
    const yearStart = dayjs(`${targetYear}-01-01`)
    const yearEnd = dayjs(`${targetYear}-12-31`)
    const daysInYear = yearEnd.diff(yearStart, 'day') + 1

    const heatmapData: HeatmapData[] = []

    for (let i = 0; i < daysInYear; i++) {
      const currentDay = yearStart.add(i, 'day')
      const dateStr = currentDay.format('YYYY-MM-DD')
      const entry = entriesMap.get(dateStr)

      let totalMinutes = 0
      if (entry) {
        const workInfo = calculateWorkHours(entry, settings)
        totalMinutes = workInfo.totalMinutes
      }

      heatmapData.push({
        date: dateStr,
        totalMinutes,
        level: getWorkLevel(totalMinutes)
      })
    }

    return heatmapData
  }

  // 获取加班统计（指定时间范围）
  const getOvertimeStats = (range: 'week' | 'month'): OvertimeStatsData => {
    const stats = range === 'week' ? getWeeklyStats() : getMonthlyStats()

    let maxMinutes = 0
    let maxDate: string | null = null
    let overtimeDays = 0

    stats.dailyData.forEach((day) => {
      if (day.overtimeMinutes > 0) {
        overtimeDays++
        if (day.overtimeMinutes > maxMinutes) {
          maxMinutes = day.overtimeMinutes
          maxDate = day.date
        }
      }
    })

    return {
      totalMinutes: stats.totalOvertimeMinutes,
      averageMinutes: overtimeDays > 0 ? Math.round(stats.totalOvertimeMinutes / overtimeDays) : 0,
      maxMinutes,
      maxDate,
      overtimeDays
    }
  }

  // 获取周环比/月同比数据
  const getComparisonStats = (type: 'week' | 'month'): ComparisonStats => {
    const now = dayjs()

    if (type === 'week') {
      const currentWeek = getWeeklyStats(now.format('YYYY-MM-DD'))
      const previousWeek = getWeeklyStats(now.subtract(1, 'week').format('YYYY-MM-DD'))

      return {
        current: {
          totalMinutes: currentWeek.totalMinutes,
          overtimeMinutes: currentWeek.totalOvertimeMinutes,
          workDays: currentWeek.workDays
        },
        previous: {
          totalMinutes: previousWeek.totalMinutes,
          overtimeMinutes: previousWeek.totalOvertimeMinutes,
          workDays: previousWeek.workDays
        },
        change: {
          totalPercent:
            previousWeek.totalMinutes > 0
              ? Math.round(
                  ((currentWeek.totalMinutes - previousWeek.totalMinutes) /
                    previousWeek.totalMinutes) *
                    100
                )
              : 0,
          overtimePercent:
            previousWeek.totalOvertimeMinutes > 0
              ? Math.round(
                  ((currentWeek.totalOvertimeMinutes - previousWeek.totalOvertimeMinutes) /
                    previousWeek.totalOvertimeMinutes) *
                    100
                )
              : 0,
          workDaysChange: currentWeek.workDays - previousWeek.workDays
        }
      }
    } else {
      const currentMonth = getMonthlyStats(now.year(), now.month() + 1)
      const prevMonthDate = now.subtract(1, 'month')
      const previousMonth = getMonthlyStats(prevMonthDate.year(), prevMonthDate.month() + 1)

      return {
        current: {
          totalMinutes: currentMonth.totalMinutes,
          overtimeMinutes: currentMonth.totalOvertimeMinutes,
          workDays: currentMonth.workDays
        },
        previous: {
          totalMinutes: previousMonth.totalMinutes,
          overtimeMinutes: previousMonth.totalOvertimeMinutes,
          workDays: previousMonth.workDays
        },
        change: {
          totalPercent:
            previousMonth.totalMinutes > 0
              ? Math.round(
                  ((currentMonth.totalMinutes - previousMonth.totalMinutes) /
                    previousMonth.totalMinutes) *
                    100
                )
              : 0,
          overtimePercent:
            previousMonth.totalOvertimeMinutes > 0
              ? Math.round(
                  ((currentMonth.totalOvertimeMinutes - previousMonth.totalOvertimeMinutes) /
                    previousMonth.totalOvertimeMinutes) *
                    100
                )
              : 0,
          workDaysChange: currentMonth.workDays - previousMonth.workDays
        }
      }
    }
  }

  // 格式化分钟数为可读字符串
  const formatMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}分钟`
    if (mins === 0) return `${hours}小时`
    return `${hours}小时${mins}分钟`
  }

  return {
    getWeeklyStats,
    getMonthlyStats,
    getYearHeatmapData,
    getOvertimeStats,
    getComparisonStats,
    formatMinutes,
    settings
  }
}
