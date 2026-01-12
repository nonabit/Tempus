import { ElectronAPI } from '@electron-toolkit/preload'

// 数据库 API 类型定义
export interface TimeEntryRow {
  id: string
  date: string
  start_time: string
  end_time: string
  break_minutes: number
  note: string | null
  created_at: number
  updated_at: number
}

export interface AchievementProgressRow {
  achievement_id: string
  current_value: number
  unlocked: number
  unlocked_at: number | null
  notified: number
}

export interface AchievementStatsRow {
  total_work_minutes: number
  current_streak: number
  longest_streak: number
  no_overtime_streak: number
  early_arrival_streak: number
  last_entry_date: string | null
}

export interface PunchRecordRow {
  punch_time: number
  punch_type: string
  remark: string | null
  synced_at: number
}

export interface DatabaseAPI {
  // 工时记录
  getAllTimeEntries: () => Promise<TimeEntryRow[]>
  getTimeEntryByDate: (date: string) => Promise<TimeEntryRow | undefined>
  getTimeEntriesByMonth: (yearMonth: string) => Promise<TimeEntryRow[]>
  upsertTimeEntry: (entry: TimeEntryRow) => Promise<void>
  deleteTimeEntry: (id: string) => Promise<void>
  importTimeEntries: (entries: TimeEntryRow[]) => Promise<number>

  // 设置
  getSetting: (key: string) => Promise<string | undefined>
  setSetting: (key: string, value: string) => Promise<void>
  getAllSettings: () => Promise<Record<string, string>>

  // 成就进度
  getAllAchievementProgress: () => Promise<AchievementProgressRow[]>
  saveAchievementProgress: (progress: AchievementProgressRow) => Promise<void>

  // 成就统计
  getAchievementStats: () => Promise<AchievementStatsRow | undefined>
  saveAchievementStats: (stats: AchievementStatsRow) => Promise<void>

  // 打卡记录
  getPunchRecordsByDateRange: (startTime: number, endTime: number) => Promise<PunchRecordRow[]>
  savePunchRecords: (records: PunchRecordRow[]) => Promise<number>
  clearPunchRecords: () => Promise<void>

  // 数据导入/导出
  exportAllData: () => Promise<string>
  importAllData: (jsonString: string) => Promise<{ success: boolean; message: string }>
}

declare global {
  interface Window {
    electron: ElectronAPI
    db: DatabaseAPI
  }
}
