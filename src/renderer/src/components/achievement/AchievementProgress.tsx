// 成就进度条组件

import { motion } from 'motion/react'
import type { AchievementRarity } from '@/types/achievement'
import { RARITY_CONFIG } from '@/data/achievements'
import { cn } from '@/lib/utils'

interface AchievementProgressProps {
  currentValue: number
  targetValue: number
  rarity?: AchievementRarity
  showLabel?: boolean
  className?: string
}

export function AchievementProgress({
  currentValue,
  targetValue,
  rarity = 'common',
  showLabel = true,
  className
}: AchievementProgressProps) {
  const percentage = Math.min(100, Math.round((currentValue / targetValue) * 100))
  const rarityConfig = RARITY_CONFIG[rarity]

  // 根据稀有度获取进度条颜色
  const progressColorMap: Record<AchievementRarity, string> = {
    common: 'bg-green-500',
    rare: 'bg-blue-500',
    epic: 'bg-purple-500',
    legendary: 'bg-amber-500'
  }

  return (
    <div className={cn('w-full', className)}>
      {/* 进度条 */}
      <div className="h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn('h-full rounded-full', progressColorMap[rarity])}
        />
      </div>

      {/* 标签 */}
      {showLabel && (
        <div className="flex justify-between items-center mt-1">
          <span className={cn('text-xs font-medium', rarityConfig.color)}>
            {currentValue} / {targetValue}
          </span>
          <span className="text-xs text-neutral-400 dark:text-neutral-500">{percentage}%</span>
        </div>
      )}
    </div>
  )
}
