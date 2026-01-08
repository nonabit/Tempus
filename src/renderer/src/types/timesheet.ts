// 工时记录类型定义

// 单条工时记录
export interface TimeEntry {
  id: string
  date: string // YYYY-MM-DD 格式
  startTime: string // HH:mm 格式
  endTime: string // HH:mm 格式
  breakMinutes: number // 休息时间（分钟）
  note?: string // 备注
  createdAt: number // 创建时间戳
  updatedAt: number // 更新时间戳
}

// 计算后的工时信息
export interface WorkHoursInfo {
  totalMinutes: number // 总工作分钟数
  overtimeMinutes: number // 加班分钟数（超过标准工时）
  isOvertime: boolean // 是否加班
  formattedTotal: string // 格式化的总时长，如 "8h 30m"
  formattedOvertime: string // 格式化的加班时长
}

// 用户设置
export interface UserSettings {
  hourlyRate: number // 时薪（元）
  standardWorkHours: number // 标准工作时长（小时），默认 8
  workStartTime: string // 标准上班时间，如 "09:00"
  workEndTime: string // 标准下班时间，如 "18:00"
  overtimePenaltyRate: number // 加班惩罚系数，如 0.1 表示每小时递减 10%
}

// 默认设置
export const DEFAULT_SETTINGS: UserSettings = {
  hourlyRate: 100,
  standardWorkHours: 8,
  workStartTime: '09:00',
  workEndTime: '18:00',
  overtimePenaltyRate: 0.1
}
