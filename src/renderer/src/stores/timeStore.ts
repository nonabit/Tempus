// 工时数据状态管理
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import dayjs from 'dayjs'
import type { TimeEntry, UserSettings, WorkHoursInfo } from '@/types/timesheet'
import { DEFAULT_SETTINGS } from '@/types/timesheet'
import type { TimeEntryRow } from '../../../preload/index.d'

// 生成唯一 ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// TimeEntry 转换为数据库行格式
function toDbRow(entry: TimeEntry): TimeEntryRow {
  return {
    id: entry.id,
    date: entry.date,
    start_time: entry.startTime,
    end_time: entry.endTime,
    break_minutes: entry.breakMinutes,
    note: entry.note || null,
    created_at: entry.createdAt,
    updated_at: entry.updatedAt
  }
}

// 数据库行格式转换为 TimeEntry
function fromDbRow(row: TimeEntryRow): TimeEntry {
  return {
    id: row.id,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    breakMinutes: row.break_minutes,
    note: row.note || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

// 计算工时信息
export function calculateWorkHours(
  entry: TimeEntry,
  settings: UserSettings
): WorkHoursInfo {
  const start = dayjs(`${entry.date} ${entry.startTime}`)
  const end = dayjs(`${entry.date} ${entry.endTime}`)

  // 总工作分钟数 = 结束时间 - 开始时间 - 休息时间
  const totalMinutes = end.diff(start, 'minute') - entry.breakMinutes

  // 标准工时（分钟）
  const standardMinutes = settings.standardWorkHours * 60

  // 加班分钟数
  const overtimeMinutes = Math.max(0, totalMinutes - standardMinutes)

  // 格式化时长
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  return {
    totalMinutes,
    overtimeMinutes,
    isOvertime: overtimeMinutes > 0,
    formattedTotal: formatDuration(totalMinutes),
    formattedOvertime: formatDuration(overtimeMinutes)
  }
}

// 计算收入（含加班惩罚机制）
export function calculateIncome(
  entry: TimeEntry,
  settings: UserSettings
): { income: number; hourlyRate: number; status: 'normal' | 'decreasing' | 'loss' } {
  const { totalMinutes, overtimeMinutes } = calculateWorkHours(entry, settings)
  const standardMinutes = settings.standardWorkHours * 60

  // 标准工时内的收入
  const normalMinutes = Math.min(totalMinutes, standardMinutes)
  const normalIncome = (normalMinutes / 60) * settings.hourlyRate

  // 加班部分收入（递减时薪）
  let overtimeIncome = 0
  if (overtimeMinutes > 0) {
    const overtimeHours = overtimeMinutes / 60
    // 每小时时薪递减
    for (let h = 0; h < overtimeHours; h++) {
      const penaltyFactor = 1 - settings.overtimePenaltyRate * (h + 1)
      const effectiveRate = settings.hourlyRate * Math.max(0, penaltyFactor)
      // 处理不足一小时的部分
      const hoursThisBlock = Math.min(1, overtimeHours - h)
      overtimeIncome += effectiveRate * hoursThisBlock
    }
  }

  const totalIncome = normalIncome + overtimeIncome

  // 判断状态
  let status: 'normal' | 'decreasing' | 'loss' = 'normal'
  if (overtimeMinutes > 0) {
    const lastHourPenalty = 1 - settings.overtimePenaltyRate * Math.ceil(overtimeMinutes / 60)
    if (lastHourPenalty <= 0) {
      status = 'loss'
    } else {
      status = 'decreasing'
    }
  }

  // 当前有效时薪
  let currentHourlyRate = settings.hourlyRate
  if (overtimeMinutes > 0) {
    const overtimeHours = Math.ceil(overtimeMinutes / 60)
    currentHourlyRate = settings.hourlyRate * Math.max(0, 1 - settings.overtimePenaltyRate * overtimeHours)
  }

  return {
    income: Math.round(totalIncome * 100) / 100,
    hourlyRate: Math.round(currentHourlyRate * 100) / 100,
    status
  }
}

interface TimeState {
  // 数据
  entries: TimeEntry[]
  settings: UserSettings
  isDbLoaded: boolean

  // 操作
  addEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateEntry: (id: string, updates: Partial<TimeEntry>) => void
  deleteEntry: (id: string) => void

  // 设置
  updateSettings: (updates: Partial<UserSettings>) => void

  // 查询
  getEntryByDate: (date: string) => TimeEntry | undefined
  getEntriesByMonth: (year: number, month: number) => TimeEntry[]
  getTodayEntry: () => TimeEntry | undefined

  // SQLite 同步
  loadFromDb: () => Promise<void>
  syncToDb: () => Promise<void>
}

export const useTimeStore = create<TimeState>()(
  persist(
    (set, get) => ({
      entries: [],
      settings: DEFAULT_SETTINGS,
      isDbLoaded: false,

      addEntry: (entryData) => {
        const now = Date.now()
        const newEntry: TimeEntry = {
          ...entryData,
          id: generateId(),
          createdAt: now,
          updatedAt: now
        }
        set((state) => ({
          entries: [...state.entries, newEntry]
        }))
        // 同步到 SQLite
        window.db?.upsertTimeEntry(toDbRow(newEntry)).catch(console.error)
      },

      updateEntry: (id, updates) => {
        set((state) => {
          const updatedEntries = state.entries.map((entry) =>
            entry.id === id ? { ...entry, ...updates, updatedAt: Date.now() } : entry
          )
          // 同步到 SQLite
          const updatedEntry = updatedEntries.find((e) => e.id === id)
          if (updatedEntry) {
            window.db?.upsertTimeEntry(toDbRow(updatedEntry)).catch(console.error)
          }
          return { entries: updatedEntries }
        })
      },

      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id)
        }))
        // 从 SQLite 删除
        window.db?.deleteTimeEntry(id).catch(console.error)
      },

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates }
        }))
      },

      getEntryByDate: (date) => {
        return get().entries.find((entry) => entry.date === date)
      },

      getEntriesByMonth: (year, month) => {
        const prefix = `${year}-${String(month).padStart(2, '0')}`
        return get().entries.filter((entry) => entry.date.startsWith(prefix))
      },

      getTodayEntry: () => {
        const today = dayjs().format('YYYY-MM-DD')
        return get().entries.find((entry) => entry.date === today)
      },

      // 从 SQLite 加载数据
      loadFromDb: async () => {
        try {
          const rows = await window.db.getAllTimeEntries()
          if (rows.length > 0) {
            const entries = rows.map(fromDbRow)
            set({ entries, isDbLoaded: true })
          } else {
            // 如果 SQLite 为空但 localStorage 有数据，同步到 SQLite
            const state = get()
            if (state.entries.length > 0) {
              await window.db.importTimeEntries(state.entries.map(toDbRow))
            }
            set({ isDbLoaded: true })
          }
        } catch (error) {
          console.error('从数据库加载失败:', error)
          set({ isDbLoaded: true })
        }
      },

      // 同步所有数据到 SQLite
      syncToDb: async () => {
        try {
          const entries = get().entries
          await window.db.importTimeEntries(entries.map(toDbRow))
        } catch (error) {
          console.error('同步到数据库失败:', error)
        }
      }
    }),
    {
      name: 'tempus-time-storage'
    }
  )
)
