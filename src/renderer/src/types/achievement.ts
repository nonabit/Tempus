// 成就系统类型定义

// 成就类型枚举
export type AchievementCategory =
  | 'milestone' // 里程碑勋章
  | 'habit' // 习惯养成勋章
  | 'special' // 特殊成就勋章

// 成就稀有度
export type AchievementRarity =
  | 'common' // 普通 - 绿色
  | 'rare' // 稀有 - 蓝色
  | 'epic' // 史诗 - 紫色
  | 'legendary' // 传说 - 金色

// 成就条件类型
export type AchievementConditionType =
  | 'total_hours' // 累计工时（小时）
  | 'consecutive_days' // 连续打卡天数
  | 'first_entry' // 首次记录
  | 'monthly_full' // 月度满勤
  | 'no_overtime_days' // 连续不加班天数
  | 'early_arrival_days' // 连续早到天数
  | 'late_night_work' // 深夜工作
  | 'weekend_work' // 周末加班
  | 'holiday_work' // 节假日加班
  | 'extreme_hours' // 极限工时（单日超12小时）

// 成就条件
export interface AchievementCondition {
  type: AchievementConditionType
  target: number // 目标值（如：100 小时、7 天）
  checkTime?: string // 特定检查时间（如 "09:00" 用于早到判定）
}

// 成就定义（静态数据）
export interface AchievementDefinition {
  id: string // 唯一标识，如 "milestone_100_hours"
  name: string // 成就名称
  description: string // 成就描述
  category: AchievementCategory
  rarity: AchievementRarity
  condition: AchievementCondition
  icon: string // 图标名称
  order: number // 排序权重
}

// 成就进度（用户数据）
export interface AchievementProgress {
  achievementId: string
  currentValue: number // 当前进度值
  unlocked: boolean // 是否已解锁
  unlockedAt?: number // 解锁时间戳
  notified: boolean // 是否已通知用户
}

// 用户成就统计数据
export interface AchievementStats {
  totalWorkMinutes: number // 累计工作分钟数
  currentStreak: number // 当前连续打卡天数
  longestStreak: number // 最长连续打卡天数
  noOvertimeStreak: number // 连续不加班天数
  earlyArrivalStreak: number // 连续早到天数
  lastEntryDate: string | null // 最后一次记录日期
}

// 用户成就状态
export interface UserAchievementState {
  progress: Record<string, AchievementProgress>
  stats: AchievementStats
  lastUpdated: number
}

// 新解锁的成就（用于通知弹窗）
export interface NewUnlock {
  achievementId: string
  unlockedAt: number
}
