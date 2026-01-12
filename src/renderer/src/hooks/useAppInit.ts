// 应用初始化 Hook
// 在应用启动时从 SQLite 加载数据

import { useEffect } from 'react'
import { useTimeStore } from '@/stores/timeStore'
import { useSettingsStore } from '@/stores/settingsStore'

export function useAppInit(): boolean {
  const { isDbLoaded, loadFromDb } = useTimeStore()
  const { isLoading: isSettingsLoading, loadSettings } = useSettingsStore()

  useEffect(() => {
    // 从 SQLite 加载数据
    loadFromDb()
    loadSettings()
  }, [loadFromDb, loadSettings])

  // 返回是否已完成初始化
  return isDbLoaded && !isSettingsLoading
}
