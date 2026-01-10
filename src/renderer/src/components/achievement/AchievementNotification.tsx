// 成就解锁通知弹窗
// 当解锁新成就时显示庆祝动画

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useAchievementStore } from '@/stores/achievementStore'
import { ACHIEVEMENTS_MAP, RARITY_CONFIG } from '@/data/achievements'
import { cn } from '@/lib/utils'
import { AchievementIcon } from './AchievementIcon'

interface AchievementNotificationProps {
  className?: string
}

export function AchievementNotification({ className }: AchievementNotificationProps) {
  const popNewUnlock = useAchievementStore((state) => state.popNewUnlock)
  const markNotified = useAchievementStore((state) => state.markNotified)
  const newUnlocks = useAchievementStore((state) => state.newUnlocks)

  // 当前显示的成就
  const [currentUnlock, setCurrentUnlock] = useState<{
    achievementId: string
    unlockedAt: number
  } | null>(null)

  // 监听新解锁队列
  useEffect(() => {
    if (newUnlocks.length > 0 && !currentUnlock) {
      const unlock = popNewUnlock()
      if (unlock) {
        setCurrentUnlock(unlock)
      }
    }
  }, [newUnlocks, currentUnlock, popNewUnlock])

  // 自动关闭通知
  useEffect(() => {
    if (currentUnlock) {
      const timer = setTimeout(() => {
        markNotified(currentUnlock.achievementId)
        setCurrentUnlock(null)
      }, 4000) // 4秒后自动关闭

      return () => clearTimeout(timer)
    }
    return undefined
  }, [currentUnlock, markNotified])

  // 手动关闭
  const handleClose = () => {
    if (currentUnlock) {
      markNotified(currentUnlock.achievementId)
      setCurrentUnlock(null)
    }
  }

  const achievement = currentUnlock ? ACHIEVEMENTS_MAP[currentUnlock.achievementId] : null
  const rarityConfig = achievement ? RARITY_CONFIG[achievement.rarity] : null

  return (
    <AnimatePresence>
      {achievement && rarityConfig && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          transition={{
            type: 'spring',
            damping: 20,
            stiffness: 300
          }}
          className={cn(
            'fixed top-6 left-1/2 -translate-x-1/2 z-50',
            'w-80 p-4 rounded-xl shadow-2xl',
            'bg-white dark:bg-neutral-800',
            'border-2',
            rarityConfig.borderColor,
            className
          )}
          onClick={handleClose}
        >
          {/* 背景光晕效果 */}
          <motion.div
            className={cn(
              'absolute inset-0 rounded-xl opacity-30',
              rarityConfig.bgColor
            )}
            animate={{
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />

          <div className="relative flex items-center gap-4">
            {/* 勋章图标 */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                damping: 10,
                stiffness: 200,
                delay: 0.2
              }}
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center',
                'bg-gradient-to-br',
                rarityConfig.gradientFrom,
                rarityConfig.gradientTo,
                'dark:from-neutral-700 dark:to-neutral-800',
                'border-2',
                rarityConfig.borderColor
              )}
            >
              <AchievementIcon
                icon={achievement.icon}
                className={cn('w-8 h-8', rarityConfig.color)}
              />
            </motion.div>

            {/* 内容 */}
            <div className="flex-1 min-w-0">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xs font-medium text-amber-500 dark:text-amber-400 mb-1"
              >
                🎉 成就解锁！
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="font-bold text-neutral-900 dark:text-white truncate"
              >
                {achievement.name}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-neutral-500 dark:text-neutral-400 truncate"
              >
                {achievement.description}
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className={cn('text-xs mt-1 font-medium', rarityConfig.color)}
              >
                {rarityConfig.name}
              </motion.div>
            </div>
          </div>

          {/* 点击提示 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 1 }}
            className="absolute bottom-1 right-2 text-xs text-neutral-400"
          >
            点击关闭
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
