// 成就同步 Hook
// 监听工时数据变化，自动触发成就检测

import { useEffect, useRef } from 'react'
import { useTimeStore } from '@/stores/timeStore'
import { useAchievementStore } from '@/stores/achievementStore'

/**
 * 成就同步 Hook
 * 在应用启动和工时数据变化时自动检测成就
 */
export function useAchievementSync() {
  const entries = useTimeStore((state) => state.entries)
  const settings = useTimeStore((state) => state.settings)
  const checkAchievements = useAchievementStore((state) => state.checkAchievements)

  // 使用 ref 记录上次检测的数据快照，避免重复检测
  const lastEntriesLength = useRef<number>(-1)

  useEffect(() => {
    // 数据长度变化或首次加载时触发检测
    if (lastEntriesLength.current !== entries.length) {
      lastEntriesLength.current = entries.length
      checkAchievements(entries, settings)
    }
  }, [entries, settings, checkAchievements])
}
