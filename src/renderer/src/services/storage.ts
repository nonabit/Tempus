// 本地存储服务
// 使用 localStorage 进行数据持久化

const STORAGE_KEYS = {
  TIME_ENTRIES: 'tempus_time_entries',
  SETTINGS: 'tempus_settings'
} as const

// 保存工时记录
export function saveTimeEntries(entries: unknown[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TIME_ENTRIES, JSON.stringify(entries))
  } catch (error) {
    console.error('保存工时记录失败:', error)
  }
}

// 读取工时记录
export function loadTimeEntries<T>(): T[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TIME_ENTRIES)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('读取工时记录失败:', error)
    return []
  }
}

// 保存用户设置
export function saveSettings(settings: unknown): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
  } catch (error) {
    console.error('保存设置失败:', error)
  }
}

// 读取用户设置
export function loadSettings<T>(defaultSettings: T): T {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings
  } catch (error) {
    console.error('读取设置失败:', error)
    return defaultSettings
  }
}

// 清除所有数据
export function clearAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.TIME_ENTRIES)
    localStorage.removeItem(STORAGE_KEYS.SETTINGS)
  } catch (error) {
    console.error('清除数据失败:', error)
  }
}

// 导出数据为 JSON
export function exportData(): string {
  const data = {
    timeEntries: loadTimeEntries(),
    settings: loadSettings({}),
    exportedAt: new Date().toISOString()
  }
  return JSON.stringify(data, null, 2)
}

// 从 JSON 导入数据
export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString)
    if (data.timeEntries) {
      saveTimeEntries(data.timeEntries)
    }
    if (data.settings) {
      saveSettings(data.settings)
    }
    return true
  } catch (error) {
    console.error('导入数据失败:', error)
    return false
  }
}
