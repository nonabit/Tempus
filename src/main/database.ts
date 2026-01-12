// 数据库服务 - SQLite 数据持久化
// 在主进程中运行，通过 IPC 与渲染进程通信

import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

// 数据库文件路径
const getDbPath = (): string => {
  const userDataPath = app.getPath('userData')
  const dbDir = join(userDataPath, 'data')

  // 确保目录存在
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true })
  }

  return join(dbDir, 'tempus.db')
}

let db: Database.Database | null = null

// 初始化数据库
export function initDatabase(): void {
  if (db) return

  const dbPath = getDbPath()
  db = new Database(dbPath)

  // 启用 WAL 模式提升性能
  db.pragma('journal_mode = WAL')

  // 创建表结构
  createTables()
}

// 创建表结构
function createTables(): void {
  if (!db) return

  // 工时记录表
  db.exec(`
    CREATE TABLE IF NOT EXISTS time_entries (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      break_minutes INTEGER NOT NULL DEFAULT 60,
      note TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_time_entries_date ON time_entries(date);
  `)

  // 成就进度表
  db.exec(`
    CREATE TABLE IF NOT EXISTS achievement_progress (
      achievement_id TEXT PRIMARY KEY,
      current_value INTEGER NOT NULL DEFAULT 0,
      unlocked INTEGER NOT NULL DEFAULT 0,
      unlocked_at INTEGER,
      notified INTEGER NOT NULL DEFAULT 0
    );
  `)

  // 成就统计表
  db.exec(`
    CREATE TABLE IF NOT EXISTS achievement_stats (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      total_work_minutes INTEGER NOT NULL DEFAULT 0,
      current_streak INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0,
      no_overtime_streak INTEGER NOT NULL DEFAULT 0,
      early_arrival_streak INTEGER NOT NULL DEFAULT 0,
      last_entry_date TEXT
    );
    INSERT OR IGNORE INTO achievement_stats (id) VALUES (1);
  `)

  // 用户设置表
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)

  // 打卡记录缓存表（从 API 同步的原始数据）
  db.exec(`
    CREATE TABLE IF NOT EXISTS punch_records (
      punch_time INTEGER NOT NULL,
      punch_type TEXT NOT NULL,
      remark TEXT,
      synced_at INTEGER NOT NULL,
      PRIMARY KEY (punch_time, punch_type)
    );
    CREATE INDEX IF NOT EXISTS idx_punch_records_time ON punch_records(punch_time);
  `)
}

// 关闭数据库
export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}

// ==================== 工时记录操作 ====================

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

// 获取所有工时记录
export function getAllTimeEntries(): TimeEntryRow[] {
  if (!db) return []
  return db.prepare('SELECT * FROM time_entries ORDER BY date DESC').all() as TimeEntryRow[]
}

// 根据日期获取工时记录
export function getTimeEntryByDate(date: string): TimeEntryRow | undefined {
  if (!db) return undefined
  return db.prepare('SELECT * FROM time_entries WHERE date = ?').get(date) as TimeEntryRow | undefined
}

// 根据月份获取工时记录
export function getTimeEntriesByMonth(yearMonth: string): TimeEntryRow[] {
  if (!db) return []
  return db
    .prepare('SELECT * FROM time_entries WHERE date LIKE ? ORDER BY date')
    .all(`${yearMonth}%`) as TimeEntryRow[]
}

// 添加或更新工时记录
export function upsertTimeEntry(entry: TimeEntryRow): void {
  if (!db) return

  const stmt = db.prepare(`
    INSERT INTO time_entries (id, date, start_time, end_time, break_minutes, note, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET
      start_time = excluded.start_time,
      end_time = excluded.end_time,
      break_minutes = excluded.break_minutes,
      note = excluded.note,
      updated_at = excluded.updated_at
  `)

  stmt.run(
    entry.id,
    entry.date,
    entry.start_time,
    entry.end_time,
    entry.break_minutes,
    entry.note,
    entry.created_at,
    entry.updated_at
  )
}

// 删除工时记录
export function deleteTimeEntry(id: string): void {
  if (!db) return
  db.prepare('DELETE FROM time_entries WHERE id = ?').run(id)
}

// 批量导入工时记录
export function importTimeEntries(entries: TimeEntryRow[]): number {
  if (!db) return 0

  const stmt = db.prepare(`
    INSERT INTO time_entries (id, date, start_time, end_time, break_minutes, note, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET
      start_time = excluded.start_time,
      end_time = excluded.end_time,
      break_minutes = excluded.break_minutes,
      note = excluded.note,
      updated_at = excluded.updated_at
  `)

  const insertMany = db.transaction((entries: TimeEntryRow[]) => {
    for (const entry of entries) {
      stmt.run(
        entry.id,
        entry.date,
        entry.start_time,
        entry.end_time,
        entry.break_minutes,
        entry.note,
        entry.created_at,
        entry.updated_at
      )
    }
  })

  insertMany(entries)
  return entries.length
}

// ==================== 设置操作 ====================

// 获取设置
export function getSetting(key: string): string | undefined {
  if (!db) return undefined
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined
  return row?.value
}

// 保存设置
export function setSetting(key: string, value: string): void {
  if (!db) return
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value)
}

// 获取所有设置
export function getAllSettings(): Record<string, string> {
  if (!db) return {}
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[]
  return Object.fromEntries(rows.map((r) => [r.key, r.value]))
}

// ==================== 成就进度操作 ====================

export interface AchievementProgressRow {
  achievement_id: string
  current_value: number
  unlocked: number
  unlocked_at: number | null
  notified: number
}

// 获取所有成就进度
export function getAllAchievementProgress(): AchievementProgressRow[] {
  if (!db) return []
  return db.prepare('SELECT * FROM achievement_progress').all() as AchievementProgressRow[]
}

// 保存成就进度
export function saveAchievementProgress(progress: AchievementProgressRow): void {
  if (!db) return
  db.prepare(`
    INSERT OR REPLACE INTO achievement_progress
    (achievement_id, current_value, unlocked, unlocked_at, notified)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    progress.achievement_id,
    progress.current_value,
    progress.unlocked,
    progress.unlocked_at,
    progress.notified
  )
}

// ==================== 成就统计操作 ====================

export interface AchievementStatsRow {
  total_work_minutes: number
  current_streak: number
  longest_streak: number
  no_overtime_streak: number
  early_arrival_streak: number
  last_entry_date: string | null
}

// 获取成就统计
export function getAchievementStats(): AchievementStatsRow | undefined {
  if (!db) return undefined
  return db.prepare('SELECT * FROM achievement_stats WHERE id = 1').get() as AchievementStatsRow | undefined
}

// 保存成就统计
export function saveAchievementStats(stats: AchievementStatsRow): void {
  if (!db) return
  db.prepare(`
    UPDATE achievement_stats SET
      total_work_minutes = ?,
      current_streak = ?,
      longest_streak = ?,
      no_overtime_streak = ?,
      early_arrival_streak = ?,
      last_entry_date = ?
    WHERE id = 1
  `).run(
    stats.total_work_minutes,
    stats.current_streak,
    stats.longest_streak,
    stats.no_overtime_streak,
    stats.early_arrival_streak,
    stats.last_entry_date
  )
}

// ==================== 打卡记录操作 ====================

export interface PunchRecordRow {
  punch_time: number
  punch_type: string
  remark: string | null
  synced_at: number
}

// 获取指定日期范围的打卡记录
export function getPunchRecordsByDateRange(startTime: number, endTime: number): PunchRecordRow[] {
  if (!db) return []
  return db
    .prepare('SELECT * FROM punch_records WHERE punch_time >= ? AND punch_time <= ? ORDER BY punch_time')
    .all(startTime, endTime) as PunchRecordRow[]
}

// 批量保存打卡记录
export function savePunchRecords(records: PunchRecordRow[]): number {
  if (!db || records.length === 0) return 0

  const stmt = db.prepare(`
    INSERT OR REPLACE INTO punch_records (punch_time, punch_type, remark, synced_at)
    VALUES (?, ?, ?, ?)
  `)

  const insertMany = db.transaction((records: PunchRecordRow[]) => {
    for (const record of records) {
      stmt.run(record.punch_time, record.punch_type, record.remark, record.synced_at)
    }
  })

  insertMany(records)
  return records.length
}

// 清空打卡记录
export function clearPunchRecords(): void {
  if (!db) return
  db.prepare('DELETE FROM punch_records').run()
}

// ==================== 数据导出/导入 ====================

// 导出所有数据
export function exportAllData(): string {
  const data = {
    timeEntries: getAllTimeEntries(),
    settings: getAllSettings(),
    achievementProgress: getAllAchievementProgress(),
    achievementStats: getAchievementStats(),
    exportedAt: new Date().toISOString()
  }
  return JSON.stringify(data, null, 2)
}

// 导入数据
export function importAllData(jsonString: string): { success: boolean; message: string } {
  try {
    const data = JSON.parse(jsonString)

    if (data.timeEntries && Array.isArray(data.timeEntries)) {
      importTimeEntries(data.timeEntries)
    }

    if (data.settings && typeof data.settings === 'object') {
      for (const [key, value] of Object.entries(data.settings)) {
        setSetting(key, value as string)
      }
    }

    return { success: true, message: '数据导入成功' }
  } catch (error) {
    return { success: false, message: `数据导入失败: ${error}` }
  }
}
