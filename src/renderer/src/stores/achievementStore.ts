// 成就系统状态管理

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import dayjs from 'dayjs'
import { HolidayUtil } from 'lunar-typescript'
import type { TimeEntry, UserSettings } from '@/types/timesheet'
import type {
  AchievementProgress,
  AchievementStats,
  AchievementDefinition,
  NewUnlock
} from '@/types/achievement'
import { ACHIEVEMENTS } from '@/data/achievements'
import { calculateWorkHours } from '@/stores/timeStore'

// 初始化成就进度
function initializeProgress(): Record<string, AchievementProgress> {
  const progress: Record<string, AchievementProgress> = {}
  ACHIEVEMENTS.forEach((achievement) => {
    progress[achievement.id] = {
      achievementId: achievement.id,
      currentValue: 0,
      unlocked: false,
      notified: false
    }
  })
  return progress
}

// 初始统计数据
const initialStats: AchievementStats = {
  totalWorkMinutes: 0,
  currentStreak: 0,
  longestStreak: 0,
  noOvertimeStreak: 0,
  earlyArrivalStreak: 0,
  lastEntryDate: null
}

interface AchievementState {
  // 数据
  progress: Record<string, AchievementProgress>
  stats: AchievementStats
  lastUpdated: number
  newUnlocks: NewUnlock[] // 待通知队列

  // 操作方法
  checkAchievements: (entries: TimeEntry[], settings: UserSettings) => void
  markNotified: (achievementId: string) => void
  popNewUnlock: () => NewUnlock | undefined
  getProgress: (achievementId: string) => AchievementProgress | undefined
  getUnlockedCount: () => number
  getTotalCount: () => number
  recalculateStats: (entries: TimeEntry[], settings: UserSettings) => void
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      progress: initializeProgress(),
      stats: { ...initialStats },
      lastUpdated: 0,
      newUnlocks: [],

      // 检测所有成就
      checkAchievements: (entries, settings) => {
        const state = get()

        // 先重新计算统计数据
        get().recalculateStats(entries, settings)

        const updatedStats = get().stats
        const newProgress = { ...state.progress }
        const newUnlocks: NewUnlock[] = [...state.newUnlocks]

        ACHIEVEMENTS.forEach((achievement) => {
          const current = newProgress[achievement.id]
          if (current.unlocked) return // 已解锁的跳过

          const { unlocked, currentValue } = checkSingleAchievement(
            achievement,
            entries,
            settings,
            updatedStats
          )

          // 更新进度
          newProgress[achievement.id] = {
            ...current,
            currentValue
          }

          // 检测新解锁
          if (unlocked && !current.unlocked) {
            const now = Date.now()
            newProgress[achievement.id] = {
              ...newProgress[achievement.id],
              unlocked: true,
              unlockedAt: now,
              notified: false
            }
            newUnlocks.push({
              achievementId: achievement.id,
              unlockedAt: now
            })
          }
        })

        set({
          progress: newProgress,
          newUnlocks,
          lastUpdated: Date.now()
        })
      },

      // 重新计算统计数据
      recalculateStats: (entries, settings) => {
        if (entries.length === 0) {
          set({ stats: { ...initialStats } })
          return
        }

        // 按日期排序
        const sortedEntries = [...entries].sort(
          (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf()
        )

        // 计算累计工时
        let totalWorkMinutes = 0
        sortedEntries.forEach((entry) => {
          const workInfo = calculateWorkHours(entry, settings)
          totalWorkMinutes += workInfo.totalMinutes
        })

        // 获取所有记录的日期集合
        const entryDates = new Set(sortedEntries.map((e) => e.date))

        // 计算从今天往前的连续打卡天数
        let currentStreak = 0
        let checkDate = dayjs()
        // 如果今天还没记录，从昨天开始数
        if (!entryDates.has(checkDate.format('YYYY-MM-DD'))) {
          checkDate = checkDate.subtract(1, 'day')
        }
        while (entryDates.has(checkDate.format('YYYY-MM-DD'))) {
          currentStreak++
          checkDate = checkDate.subtract(1, 'day')
        }

        // 计算历史最长连续
        let longestStreak = 0
        let tempStreak = 1
        for (let i = 1; i < sortedEntries.length; i++) {
          const prevDate = dayjs(sortedEntries[i - 1].date)
          const currDate = dayjs(sortedEntries[i].date)
          if (currDate.diff(prevDate, 'day') === 1) {
            tempStreak++
          } else {
            longestStreak = Math.max(longestStreak, tempStreak)
            tempStreak = 1
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak, currentStreak)

        // 计算连续不加班天数（从最近往前数）
        let noOvertimeStreak = 0
        for (let i = sortedEntries.length - 1; i >= 0; i--) {
          const workInfo = calculateWorkHours(sortedEntries[i], settings)
          if (!workInfo.isOvertime) {
            noOvertimeStreak++
          } else {
            break
          }
        }

        // 计算连续早到天数（从最近往前数）
        let earlyArrivalStreak = 0
        for (let i = sortedEntries.length - 1; i >= 0; i--) {
          const entry = sortedEntries[i]
          if (entry.startTime <= settings.workStartTime) {
            earlyArrivalStreak++
          } else {
            break
          }
        }

        const lastEntry = sortedEntries[sortedEntries.length - 1]

        set({
          stats: {
            totalWorkMinutes,
            currentStreak,
            longestStreak,
            noOvertimeStreak,
            earlyArrivalStreak,
            lastEntryDate: lastEntry?.date || null
          }
        })
      },

      // 标记成就已通知
      markNotified: (achievementId) => {
        set((state) => ({
          progress: {
            ...state.progress,
            [achievementId]: {
              ...state.progress[achievementId],
              notified: true
            }
          }
        }))
      },

      // 弹出下一个待通知的成就
      popNewUnlock: () => {
        const { newUnlocks } = get()
        if (newUnlocks.length === 0) return undefined

        const [first, ...rest] = newUnlocks
        set({ newUnlocks: rest })
        return first
      },

      // 获取指定成就进度
      getProgress: (achievementId) => {
        return get().progress[achievementId]
      },

      // 获取已解锁数量
      getUnlockedCount: () => {
        return Object.values(get().progress).filter((p) => p.unlocked).length
      },

      // 获取成就总数
      getTotalCount: () => {
        return ACHIEVEMENTS.length
      }
    }),
    {
      name: 'tempus-achievement-storage'
    }
  )
)

// 单个成就检测逻辑
function checkSingleAchievement(
  achievement: AchievementDefinition,
  entries: TimeEntry[],
  settings: UserSettings,
  stats: AchievementStats
): { unlocked: boolean; currentValue: number } {
  const { condition } = achievement

  switch (condition.type) {
    case 'first_entry':
      return {
        unlocked: entries.length >= 1,
        currentValue: entries.length > 0 ? 1 : 0
      }

    case 'total_hours': {
      const totalHours = stats.totalWorkMinutes / 60
      return {
        unlocked: totalHours >= condition.target,
        currentValue: Math.floor(totalHours)
      }
    }

    case 'consecutive_days':
      return {
        unlocked: stats.currentStreak >= condition.target,
        currentValue: stats.currentStreak
      }

    case 'monthly_full': {
      // 检查上个月是否满勤
      const lastMonth = dayjs().subtract(1, 'month')
      const workDaysInMonth = getWorkDaysInMonth(lastMonth.year(), lastMonth.month() + 1)
      const entriesLastMonth = entries.filter((e) => e.date.startsWith(lastMonth.format('YYYY-MM')))
      const isFull = entriesLastMonth.length >= workDaysInMonth
      return {
        unlocked: isFull,
        currentValue: entriesLastMonth.length
      }
    }

    case 'no_overtime_days':
      return {
        unlocked: stats.noOvertimeStreak >= condition.target,
        currentValue: stats.noOvertimeStreak
      }

    case 'early_arrival_days':
      return {
        unlocked: stats.earlyArrivalStreak >= condition.target,
        currentValue: stats.earlyArrivalStreak
      }

    case 'late_night_work': {
      const hasLateNight = entries.some((e) => e.endTime >= (condition.checkTime || '22:00'))
      return {
        unlocked: hasLateNight,
        currentValue: hasLateNight ? 1 : 0
      }
    }

    case 'weekend_work': {
      const hasWeekend = entries.some((e) => {
        const dayOfWeek = dayjs(e.date).day()
        return dayOfWeek === 0 || dayOfWeek === 6
      })
      return {
        unlocked: hasWeekend,
        currentValue: hasWeekend ? 1 : 0
      }
    }

    case 'holiday_work': {
      const hasHoliday = entries.some((e) => {
        const [year, month, day] = e.date.split('-').map(Number)
        const holiday = HolidayUtil.getHoliday(year, month, day)
        return holiday && !holiday.isWork()
      })
      return {
        unlocked: hasHoliday,
        currentValue: hasHoliday ? 1 : 0
      }
    }

    case 'extreme_hours': {
      const hasExtreme = entries.some((e) => {
        const workInfo = calculateWorkHours(e, settings)
        return workInfo.totalMinutes >= condition.target * 60
      })
      return {
        unlocked: hasExtreme,
        currentValue: hasExtreme ? 1 : 0
      }
    }

    default:
      return { unlocked: false, currentValue: 0 }
  }
}

// 辅助函数：获取指定月份的工作日数量
function getWorkDaysInMonth(year: number, month: number): number {
  const daysInMonth = dayjs(`${year}-${month}`).daysInMonth()
  let workDays = 0

  for (let day = 1; day <= daysInMonth; day++) {
    const date = dayjs(`${year}-${month}-${day}`)
    const dayOfWeek = date.day()

    // 检查是否为法定节假日
    const holiday = HolidayUtil.getHoliday(year, month, day)

    if (holiday) {
      // 有节假日信息时，isWork() 为 true 表示调休上班
      if (holiday.isWork()) {
        workDays++
      }
    } else {
      // 无节假日信息时，周一到周五为工作日
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        workDays++
      }
    }
  }

  return workDays
}
