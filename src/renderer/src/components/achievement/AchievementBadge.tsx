// 单个勋章组件

import { motion } from 'motion/react'
import type {
  AchievementDefinition,
  AchievementProgress as AchievementProgressType
} from '@/types/achievement'
import { RARITY_CONFIG } from '@/data/achievements'
import { cn } from '@/lib/utils'
import { AchievementIcon } from './AchievementIcon'
import { AchievementProgress } from './AchievementProgress'

interface AchievementBadgeProps {
  achievement: AchievementDefinition
  progress: AchievementProgressType
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  className?: string
}

export function AchievementBadge({
  achievement,
  progress,
  size = 'md',
  onClick,
  className
}: AchievementBadgeProps) {
  const { unlocked, currentValue } = progress
  const rarityConfig = RARITY_CONFIG[achievement.rarity]

  // 尺寸配置
  const sizeConfig = {
    sm: {
      container: 'p-3',
      icon: 'w-10 h-10',
      iconSize: 'w-5 h-5',
      title: 'text-sm',
      desc: 'text-xs'
    },
    md: {
      container: 'p-4',
      icon: 'w-14 h-14',
      iconSize: 'w-7 h-7',
      title: 'text-base',
      desc: 'text-sm'
    },
    lg: {
      container: 'p-5',
      icon: 'w-20 h-20',
      iconSize: 'w-10 h-10',
      title: 'text-lg',
      desc: 'text-base'
    }
  }

  const config = sizeConfig[size]

  return (
    <motion.div
      whileHover={{ scale: unlocked ? 1.02 : 1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'rounded-xl border-2 cursor-pointer transition-shadow',
        config.container,
        unlocked
          ? cn(
              'bg-gradient-to-br dark:from-neutral-800 dark:to-neutral-900',
              rarityConfig.gradientFrom,
              rarityConfig.gradientTo,
              rarityConfig.borderColor,
              'shadow-sm hover:shadow-md'
            )
          : 'bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700 opacity-60',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* 图标 */}
        <div
          className={cn(
            'shrink-0 rounded-full flex items-center justify-center',
            config.icon,
            unlocked
              ? cn('bg-white/80 dark:bg-neutral-700', rarityConfig.borderColor, 'border')
              : 'bg-neutral-200 dark:bg-neutral-700'
          )}
        >
          <AchievementIcon
            icon={achievement.icon}
            className={cn(
              config.iconSize,
              unlocked ? rarityConfig.color : 'text-neutral-400 dark:text-neutral-500'
            )}
          />
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                'font-bold truncate',
                config.title,
                unlocked
                  ? 'text-neutral-900 dark:text-white'
                  : 'text-neutral-500 dark:text-neutral-400'
              )}
            >
              {achievement.name}
            </span>
            {unlocked && (
              <span
                className={cn(
                  'text-xs px-1.5 py-0.5 rounded font-medium',
                  rarityConfig.bgColor,
                  rarityConfig.color
                )}
              >
                {rarityConfig.name}
              </span>
            )}
          </div>

          <p
            className={cn(
              'line-clamp-2 mb-2',
              config.desc,
              unlocked
                ? 'text-neutral-600 dark:text-neutral-300'
                : 'text-neutral-400 dark:text-neutral-500'
            )}
          >
            {achievement.description}
          </p>

          {/* 进度条 - 未解锁时显示 */}
          {!unlocked && (
            <AchievementProgress
              currentValue={currentValue}
              targetValue={achievement.condition.target}
              rarity={achievement.rarity}
              showLabel={true}
            />
          )}

          {/* 解锁时间 - 已解锁时显示 */}
          {unlocked && progress.unlockedAt && (
            <div className="text-xs text-neutral-400 dark:text-neutral-500">
              解锁于 {new Date(progress.unlockedAt).toLocaleDateString('zh-CN')}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
