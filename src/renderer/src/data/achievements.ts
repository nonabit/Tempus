// 成就定义数据

import type { AchievementDefinition, AchievementRarity } from '@/types/achievement'

// 所有成就定义
export const ACHIEVEMENTS: AchievementDefinition[] = [
  // ============ 里程碑勋章 ============
  {
    id: 'milestone_first_entry',
    name: '新手上路',
    description: '完成第一次工时记录，开启你的时间管理之旅',
    category: 'milestone',
    rarity: 'common',
    condition: { type: 'first_entry', target: 1 },
    icon: 'rocket',
    order: 1
  },
  {
    id: 'milestone_100_hours',
    name: '百小时俱乐部',
    description: '累计记录 100 小时工时',
    category: 'milestone',
    rarity: 'rare',
    condition: { type: 'total_hours', target: 100 },
    icon: 'medal',
    order: 2
  },
  {
    id: 'milestone_500_hours',
    name: '五百小时大师',
    description: '累计记录 500 小时工时',
    category: 'milestone',
    rarity: 'epic',
    condition: { type: 'total_hours', target: 500 },
    icon: 'crown',
    order: 3
  },
  {
    id: 'milestone_1000_hours',
    name: '千小时传奇',
    description: '累计记录 1000 小时工时，真正的时间管理大师',
    category: 'milestone',
    rarity: 'legendary',
    condition: { type: 'total_hours', target: 1000 },
    icon: 'trophy',
    order: 4
  },
  {
    id: 'milestone_monthly_full',
    name: '月度满勤',
    description: '在一个月内每个工作日都有工时记录',
    category: 'milestone',
    rarity: 'rare',
    condition: { type: 'monthly_full', target: 1 },
    icon: 'calendar-check',
    order: 5
  },

  // ============ 习惯养成勋章 ============
  {
    id: 'habit_streak_7',
    name: '一周坚持',
    description: '连续 7 天记录工时',
    category: 'habit',
    rarity: 'common',
    condition: { type: 'consecutive_days', target: 7 },
    icon: 'flame',
    order: 10
  },
  {
    id: 'habit_streak_30',
    name: '月度坚持者',
    description: '连续 30 天记录工时',
    category: 'habit',
    rarity: 'rare',
    condition: { type: 'consecutive_days', target: 30 },
    icon: 'fire',
    order: 11
  },
  {
    id: 'habit_streak_100',
    name: '百日传奇',
    description: '连续 100 天记录工时，习惯已成自然',
    category: 'habit',
    rarity: 'legendary',
    condition: { type: 'consecutive_days', target: 100 },
    icon: 'diamond',
    order: 12
  },
  {
    id: 'habit_no_overtime_7',
    name: '准时下班达人',
    description: '连续 7 天准时下班，工作生活平衡大师',
    category: 'habit',
    rarity: 'rare',
    condition: { type: 'no_overtime_days', target: 7 },
    icon: 'clock-check',
    order: 13
  },
  {
    id: 'habit_no_overtime_30',
    name: '准点侠',
    description: '连续 30 天准时下班',
    category: 'habit',
    rarity: 'epic',
    condition: { type: 'no_overtime_days', target: 30 },
    icon: 'shield-check',
    order: 14
  },
  {
    id: 'habit_early_bird_7',
    name: '早起鸟',
    description: '连续 7 天在 9:00 前开始工作',
    category: 'habit',
    rarity: 'rare',
    condition: { type: 'early_arrival_days', target: 7, checkTime: '09:00' },
    icon: 'sun',
    order: 15
  },
  {
    id: 'habit_early_bird_30',
    name: '晨光守护者',
    description: '连续 30 天在 9:00 前开始工作',
    category: 'habit',
    rarity: 'epic',
    condition: { type: 'early_arrival_days', target: 30, checkTime: '09:00' },
    icon: 'sunrise',
    order: 16
  },

  // ============ 特殊成就勋章 ============
  {
    id: 'special_night_owl',
    name: '深夜战士',
    description: '22:00 之后仍在工作',
    category: 'special',
    rarity: 'rare',
    condition: { type: 'late_night_work', target: 1, checkTime: '22:00' },
    icon: 'moon-stars',
    order: 20
  },
  {
    id: 'special_weekend_warrior',
    name: '周末勇士',
    description: '在周末加班工作',
    category: 'special',
    rarity: 'rare',
    condition: { type: 'weekend_work', target: 1 },
    icon: 'swords',
    order: 21
  },
  {
    id: 'special_holiday_hero',
    name: '节日坚守',
    description: '在法定节假日加班工作',
    category: 'special',
    rarity: 'epic',
    condition: { type: 'holiday_work', target: 1 },
    icon: 'gift',
    order: 22
  },
  {
    id: 'special_extreme_12h',
    name: '极限挑战',
    description: '单日工时超过 12 小时',
    category: 'special',
    rarity: 'epic',
    condition: { type: 'extreme_hours', target: 12 },
    icon: 'bolt',
    order: 23
  }
]

// 按 ID 索引的成就定义映射
export const ACHIEVEMENTS_MAP: Record<string, AchievementDefinition> = ACHIEVEMENTS.reduce(
  (acc, achievement) => {
    acc[achievement.id] = achievement
    return acc
  },
  {} as Record<string, AchievementDefinition>
)

// 按类别分组
export const ACHIEVEMENTS_BY_CATEGORY = {
  milestone: ACHIEVEMENTS.filter((a) => a.category === 'milestone'),
  habit: ACHIEVEMENTS.filter((a) => a.category === 'habit'),
  special: ACHIEVEMENTS.filter((a) => a.category === 'special')
}

// 类别配置
export const CATEGORY_CONFIG = {
  milestone: { name: '里程碑', icon: 'trophy' },
  habit: { name: '习惯养成', icon: 'flame' },
  special: { name: '特殊成就', icon: 'star' }
}

// 稀有度配置（颜色和显示名称）- 东方美学配色
export const RARITY_CONFIG: Record<
  AchievementRarity,
  {
    name: string
    color: string
    bgColor: string
    borderColor: string
    gradientFrom: string
    gradientTo: string
  }
> = {
  common: {
    name: '普通',
    color: 'text-willow',
    bgColor: 'bg-willow/10',
    borderColor: 'border-willow/30',
    gradientFrom: 'from-willow/10',
    gradientTo: 'to-paper'
  },
  rare: {
    name: '稀有',
    color: 'text-indigo',
    bgColor: 'bg-indigo/10',
    borderColor: 'border-indigo/30',
    gradientFrom: 'from-indigo/10',
    gradientTo: 'to-paper'
  },
  epic: {
    name: '史诗',
    color: 'text-cinnabar',
    bgColor: 'bg-cinnabar/10',
    borderColor: 'border-cinnabar/30',
    gradientFrom: 'from-cinnabar/10',
    gradientTo: 'to-paper'
  },
  legendary: {
    name: '传说',
    color: 'text-ink',
    bgColor: 'bg-ink/5',
    borderColor: 'border-ink/20',
    gradientFrom: 'from-ink/10',
    gradientTo: 'to-paper'
  }
}
