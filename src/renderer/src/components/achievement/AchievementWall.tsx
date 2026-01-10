// 勋章墙组件 - 成就展示主页面

import { useState } from 'react'
import { motion } from 'motion/react'
import { useAchievementStore } from '@/stores/achievementStore'
import { ACHIEVEMENTS_BY_CATEGORY, CATEGORY_CONFIG } from '@/data/achievements'
import type { AchievementCategory } from '@/types/achievement'
import { cn } from '@/lib/utils'
import { AchievementBadge } from './AchievementBadge'
import { AchievementDetail } from './AchievementDetail'
import { AchievementIcon } from './AchievementIcon'

type FilterType = 'all' | 'unlocked' | 'locked'

interface AchievementWallProps {
  className?: string
}

export function AchievementWall({ className }: AchievementWallProps) {
  const progress = useAchievementStore((state) => state.progress)
  const getUnlockedCount = useAchievementStore((state) => state.getUnlockedCount)
  const getTotalCount = useAchievementStore((state) => state.getTotalCount)

  // 筛选状态
  const [filter, setFilter] = useState<FilterType>('all')
  // 详情弹窗
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null)

  const unlockedCount = getUnlockedCount()
  const totalCount = getTotalCount()

  // 筛选按钮配置
  const filterButtons: { type: FilterType; label: string }[] = [
    { type: 'all', label: '全部' },
    { type: 'unlocked', label: '已解锁' },
    { type: 'locked', label: '未解锁' }
  ]

  // 按类别渲染成就列表
  const renderCategory = (category: AchievementCategory) => {
    const achievements = ACHIEVEMENTS_BY_CATEGORY[category]
    const config = CATEGORY_CONFIG[category]

    // 根据筛选条件过滤
    const filteredAchievements = achievements.filter((a) => {
      const p = progress[a.id]
      if (filter === 'unlocked') return p?.unlocked
      if (filter === 'locked') return !p?.unlocked
      return true
    })

    if (filteredAchievements.length === 0) return null

    // 计算该类别的解锁数
    const categoryUnlocked = achievements.filter((a) => progress[a.id]?.unlocked).length

    return (
      <div key={category} className="mb-8">
        {/* 类别标题 */}
        <div className="flex items-center gap-2 mb-4">
          <AchievementIcon icon={config.icon} className="w-5 h-5 text-neutral-500" />
          <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-200">
            {config.name}
          </h3>
          <span className="text-sm text-neutral-400 dark:text-neutral-500">
            ({categoryUnlocked}/{achievements.length})
          </span>
        </div>

        {/* 成就网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAchievements
            .sort((a, b) => a.order - b.order)
            .map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <AchievementBadge
                  achievement={achievement}
                  progress={progress[achievement.id]}
                  onClick={() => setSelectedAchievement(achievement.id)}
                />
              </motion.div>
            ))}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('h-full flex flex-col', className)}>
      {/* 头部：统计和筛选 */}
      <div className="shrink-0 p-4 border-b border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">成就勋章</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              已解锁 {unlockedCount} / {totalCount} 个成就
            </p>
          </div>

          {/* 进度圆环 */}
          <div className="relative w-16 h-16">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              {/* 背景圆环 */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                className="stroke-neutral-200 dark:stroke-neutral-700"
                strokeWidth="3"
              />
              {/* 进度圆环 */}
              <motion.circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                className="stroke-amber-500"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ strokeDasharray: '0 100' }}
                animate={{
                  strokeDasharray: `${(unlockedCount / totalCount) * 100} 100`
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                {Math.round((unlockedCount / totalCount) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* 筛选按钮 */}
        <div className="flex gap-2">
          {filterButtons.map((btn) => (
            <button
              key={btn.type}
              onClick={() => setFilter(btn.type)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-lg transition-colors',
                filter === btn.type
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
              )}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* 成就列表 */}
      <div className="flex-1 overflow-y-auto p-4">
        {renderCategory('milestone')}
        {renderCategory('habit')}
        {renderCategory('special')}

        {/* 空状态 */}
        {filter !== 'all' &&
          Object.values(ACHIEVEMENTS_BY_CATEGORY)
            .flat()
            .filter((a) => {
              const p = progress[a.id]
              if (filter === 'unlocked') return p?.unlocked
              if (filter === 'locked') return !p?.unlocked
              return true
            }).length === 0 && (
            <div className="text-center py-12 text-neutral-400">
              {filter === 'unlocked' ? '还没有解锁任何成就' : '所有成就都已解锁！'}
            </div>
          )}
      </div>

      {/* 详情弹窗 */}
      <AchievementDetail
        achievementId={selectedAchievement}
        open={!!selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />
    </div>
  )
}
