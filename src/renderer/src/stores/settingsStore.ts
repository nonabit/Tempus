// 设置状态管理
// 管理 API 配置和其他用户设置

import { create } from 'zustand'
import type { ApiConfig } from '@/types/api'
import { DEFAULT_API_CONFIG } from '@/types/api'

interface SettingsState {
  // API 配置
  apiConfig: ApiConfig
  isLoading: boolean
  lastSyncTime: number | null

  // 操作方法
  loadSettings: () => Promise<void>
  updateApiConfig: (updates: Partial<ApiConfig>) => Promise<void>
  setLastSyncTime: (time: number) => Promise<void>
}

// 设置键名常量
const SETTINGS_KEYS = {
  API_CONFIG: 'api_config',
  LAST_SYNC_TIME: 'last_sync_time'
} as const

export const useSettingsStore = create<SettingsState>((set, get) => ({
  apiConfig: DEFAULT_API_CONFIG,
  isLoading: true,
  lastSyncTime: null,

  // 从数据库加载设置
  loadSettings: async () => {
    try {
      const apiConfigJson = await window.db.getSetting(SETTINGS_KEYS.API_CONFIG)
      const lastSyncTimeStr = await window.db.getSetting(SETTINGS_KEYS.LAST_SYNC_TIME)

      set({
        apiConfig: apiConfigJson ? JSON.parse(apiConfigJson) : DEFAULT_API_CONFIG,
        lastSyncTime: lastSyncTimeStr ? parseInt(lastSyncTimeStr, 10) : null,
        isLoading: false
      })
    } catch (error) {
      console.error('加载设置失败:', error)
      set({ isLoading: false })
    }
  },

  // 更新 API 配置
  updateApiConfig: async (updates) => {
    const newConfig = { ...get().apiConfig, ...updates }
    set({ apiConfig: newConfig })

    try {
      await window.db.setSetting(SETTINGS_KEYS.API_CONFIG, JSON.stringify(newConfig))
    } catch (error) {
      console.error('保存 API 配置失败:', error)
    }
  },

  // 设置最后同步时间
  setLastSyncTime: async (time) => {
    set({ lastSyncTime: time })

    try {
      await window.db.setSetting(SETTINGS_KEYS.LAST_SYNC_TIME, String(time))
    } catch (error) {
      console.error('保存同步时间失败:', error)
    }
  }
}))
