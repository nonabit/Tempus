// 成就详情弹窗

import { motion, AnimatePresence } from 'motion/react'
import { IconX } from '@tabler/icons-react'
import { useAchievementStore } from '@/stores/achievementStore'
import { ACHIEVEMENTS_MAP, RARITY_CONFIG } from '@/data/achievements'
import { cn } from '@/lib/utils'
import { AchievementIcon } from './AchievementIcon'
import { AchievementProgress } from './AchievementProgress'

interface AchievementDetailProps {
  achievementId: string | null
  open: boolean
  onClose: () => void
}

export function AchievementDetail({ achievementId, open, onClose }: AchievementDetailProps) {
  const progress = useAchievementStore((state) =>
    achievementId ? state.progress[achievementId] : null
  )

  if (!achievementId || !progress) return null

  const achievement = ACHIEVEMENTS_MAP[achievementId]
  if (!achievement) return null

  const rarityConfig = RARITY_CONFIG[achievement.rarity]
  const { unlocked, currentValue, unlockedAt } = progress

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/10 backdrop-blur-sm z-40"
          />

          {/* 弹窗内容 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className={cn(
                'relative w-full max-w-md p-6 rounded-2xl pointer-events-auto',
                'bg-paper',
                'border-2 shadow-2xl',
                unlocked ? rarityConfig.borderColor : 'border-indigo/20'
              )}
            >
              {/* 关闭按钮 */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-indigo/40 hover:bg-willow/10 hover:text-ink transition-colors"
              >
                <IconX className="w-5 h-5" />
              </button>

              {/* 勋章图标 */}
              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.1 }}
                  className={cn(
                    'w-24 h-24 rounded-full flex items-center justify-center',
                    'border-4',
                    unlocked
                      ? cn(
                        'bg-gradient-to-br',
                        rarityConfig.gradientFrom,
                        rarityConfig.gradientTo,
                        rarityConfig.borderColor
                      )
                      : 'bg-indigo/5 border-indigo/10'
                  )}
                >
                  <AchievementIcon
                    icon={achievement.icon}
                    className={cn(
                      'w-12 h-12',
                      unlocked ? rarityConfig.color : 'text-indigo/20'
                    )}
                  />
                </motion.div>
              </div>

              {/* 成就信息 */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-ink mb-2 font-serif-title">
                  {achievement.name}
                </h3>
                <p className="text-indigo/80 mb-3 font-serif-title">
                  {achievement.description}
                </p>
                <span
                  className={cn(
                    'inline-block px-3 py-1 rounded-full text-sm font-medium font-serif-title',
                    rarityConfig.bgColor,
                    rarityConfig.color
                  )}
                >
                  {rarityConfig.name}
                </span>
              </div>

              {/* 进度或解锁时间 */}
              {unlocked ? (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cinnabar/10 text-cinnabar">
                    <span className="text-lg">✓</span>
                    <span className="font-medium font-serif-title">已解锁</span>
                  </div>
                  {unlockedAt && (
                    <p className="mt-2 text-sm text-indigo/50 font-serif-num">
                      解锁时间: {new Date(unlockedAt).toLocaleString('zh-CN')}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <div className="text-center text-sm text-indigo/60 mb-2 font-serif-title">
                    当前进度
                  </div>
                  <AchievementProgress
                    currentValue={currentValue}
                    targetValue={achievement.condition.target}
                    rarity={achievement.rarity}
                    showLabel={true}
                  />
                  <div className="text-center mt-3 text-sm text-indigo/50 font-serif-num">
                    还差 {achievement.condition.target - currentValue}{' '}
                    {getConditionUnit(achievement.condition.type)}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// 获取条件单位文本
function getConditionUnit(type: string): string {
  switch (type) {
    case 'total_hours':
      return '小时'
    case 'consecutive_days':
    case 'no_overtime_days':
    case 'early_arrival_days':
      return '天'
    default:
      return ''
  }
}
