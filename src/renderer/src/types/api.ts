// API 相关类型定义

// 打卡记录（从 API 返回）
export interface PunchRecord {
  punchTime: number // 秒级时间戳(+8时区)
  punchType: string // "上班"/"下班" 等
  remark: string // 备注
}

// API 配置
export interface ApiConfig {
  // 基础配置
  enabled: boolean // 是否启用 API 同步
  baseUrl: string // API 基础地址

  // 认证配置
  authType: 'none' | 'bearer' | 'cookie' | 'custom'
  token?: string // Bearer Token
  cookie?: string // Cookie 字符串
  customHeaders?: Record<string, string> // 自定义请求头

  // 请求配置
  method: 'GET' | 'POST'
  requestBodyTemplate?: string // 请求体模板（支持占位符）

  // 响应解析配置
  responsePath: string // JSON 路径，如 "data.records"
  useJavaScript: boolean // 是否使用 JavaScript 脚本解析
  responseScript?: string // JavaScript 解析脚本

  // 字段映射
  fieldMappings: {
    punchTime: string // 打卡时间字段路径
    punchType: string // 打卡类型字段路径
    remark: string // 备注字段路径
  }

  // 时间戳处理
  timestampFormat: 'seconds' | 'milliseconds' | 'datetime' // 时间戳格式

  // 同步设置
  defaultBreakMinutes: number // 默认休息时间（分钟）
}

// 默认 API 配置
export const DEFAULT_API_CONFIG: ApiConfig = {
  enabled: false,
  baseUrl: '',
  authType: 'bearer',
  method: 'POST',
  responsePath: 'data',
  useJavaScript: false,
  fieldMappings: {
    punchTime: 'punchTime',
    punchType: 'punchType',
    remark: 'remark'
  },
  timestampFormat: 'seconds',
  defaultBreakMinutes: 60
}

// 同步结果
export interface SyncResult {
  success: boolean
  message: string
  recordsCount?: number
  entriesCreated?: number
}

// 占位符数据（用于请求模板）
export interface PlaceholderData {
  YEAR: string // 如 "2026"
  MONTH: string // 如 "1"
  DAYSTART: string // 如 "2026-01-01"
  DAYEND: string // 如 "2026-01-31"
  TIMESTART: string // 如 "2026-01-01 00:00:00"
  TIMEEND: string // 如 "2026-01-31 23:59:59"
  TOKEN?: string
  USERID?: string
}
