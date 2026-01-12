import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// 数据库 API 类型定义
interface TimeEntryRow {
  id: string
  date: string
  start_time: string
  end_time: string
  break_minutes: number
  note: string | null
  created_at: number
  updated_at: number
}

interface AchievementProgressRow {
  achievement_id: string
  current_value: number
  unlocked: number
  unlocked_at: number | null
  notified: number
}

interface AchievementStatsRow {
  total_work_minutes: number
  current_streak: number
  longest_streak: number
  no_overtime_streak: number
  early_arrival_streak: number
  last_entry_date: string | null
}

interface PunchRecordRow {
  punch_time: number
  punch_type: string
  remark: string | null
  synced_at: number
}

// 数据库 API
const db = {
  // 工时记录
  getAllTimeEntries: (): Promise<TimeEntryRow[]> => ipcRenderer.invoke('db:getAllTimeEntries'),
  getTimeEntryByDate: (date: string): Promise<TimeEntryRow | undefined> =>
    ipcRenderer.invoke('db:getTimeEntryByDate', date),
  getTimeEntriesByMonth: (yearMonth: string): Promise<TimeEntryRow[]> =>
    ipcRenderer.invoke('db:getTimeEntriesByMonth', yearMonth),
  upsertTimeEntry: (entry: TimeEntryRow): Promise<void> =>
    ipcRenderer.invoke('db:upsertTimeEntry', entry),
  deleteTimeEntry: (id: string): Promise<void> => ipcRenderer.invoke('db:deleteTimeEntry', id),
  importTimeEntries: (entries: TimeEntryRow[]): Promise<number> =>
    ipcRenderer.invoke('db:importTimeEntries', entries),

  // 设置
  getSetting: (key: string): Promise<string | undefined> =>
    ipcRenderer.invoke('db:getSetting', key),
  setSetting: (key: string, value: string): Promise<void> =>
    ipcRenderer.invoke('db:setSetting', key, value),
  getAllSettings: (): Promise<Record<string, string>> => ipcRenderer.invoke('db:getAllSettings'),

  // 成就进度
  getAllAchievementProgress: (): Promise<AchievementProgressRow[]> =>
    ipcRenderer.invoke('db:getAllAchievementProgress'),
  saveAchievementProgress: (progress: AchievementProgressRow): Promise<void> =>
    ipcRenderer.invoke('db:saveAchievementProgress', progress),

  // 成就统计
  getAchievementStats: (): Promise<AchievementStatsRow | undefined> =>
    ipcRenderer.invoke('db:getAchievementStats'),
  saveAchievementStats: (stats: AchievementStatsRow): Promise<void> =>
    ipcRenderer.invoke('db:saveAchievementStats', stats),

  // 打卡记录
  getPunchRecordsByDateRange: (startTime: number, endTime: number): Promise<PunchRecordRow[]> =>
    ipcRenderer.invoke('db:getPunchRecordsByDateRange', startTime, endTime),
  savePunchRecords: (records: PunchRecordRow[]): Promise<number> =>
    ipcRenderer.invoke('db:savePunchRecords', records),
  clearPunchRecords: (): Promise<void> => ipcRenderer.invoke('db:clearPunchRecords'),

  // 数据导入/导出
  exportAllData: (): Promise<string> => ipcRenderer.invoke('db:exportAllData'),
  importAllData: (jsonString: string): Promise<{ success: boolean; message: string }> =>
    ipcRenderer.invoke('db:importAllData', jsonString)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('db', db)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.db = db
}
