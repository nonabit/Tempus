// 公司 API 服务 - 从远程 API 同步打卡记录

import dayjs from 'dayjs'
import type { PunchRecord, ApiConfig, PlaceholderData, SyncResult } from '@/types/api'
import type { TimeEntry } from '@/types/timesheet'

// 生成占位符数据
export function generatePlaceholders(year: number, month: number): PlaceholderData {
  const startDate = dayjs(`${year}-${month}-01`)
  const endDate = startDate.endOf('month')

  return {
    YEAR: String(year),
    MONTH: String(month),
    DAYSTART: startDate.format('YYYY-MM-DD'),
    DAYEND: endDate.format('YYYY-MM-DD'),
    TIMESTART: startDate.format('YYYY-MM-DD HH:mm:ss'),
    TIMEEND: endDate.format('YYYY-MM-DD 23:59:59')
  }
}

// 替换模板中的占位符
function replacePlaceholders(template: string, data: PlaceholderData): string {
  let result = template
  for (const [key, value] of Object.entries(data)) {
    if (value) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value)
    }
  }
  return result
}

// 根据路径获取嵌套对象的值
function getValueByPath(obj: unknown, path: string): unknown {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

// 解析时间戳为秒级
function parseTimestamp(value: unknown, format: ApiConfig['timestampFormat']): number {
  if (typeof value === 'number') {
    return format === 'milliseconds' ? Math.floor(value / 1000) : value
  }
  if (typeof value === 'string') {
    // 尝试解析日期字符串
    const parsed = dayjs(value)
    if (parsed.isValid()) {
      return parsed.unix()
    }
    // 尝试解析数字字符串
    const num = parseInt(value, 10)
    if (!isNaN(num)) {
      return format === 'milliseconds' ? Math.floor(num / 1000) : num
    }
  }
  return 0
}

// 从 API 获取打卡记录
export async function fetchPunchRecords(
  config: ApiConfig,
  year: number,
  month: number
): Promise<{ success: boolean; data?: PunchRecord[]; error?: string }> {
  if (!config.enabled || !config.baseUrl) {
    return { success: false, error: 'API 未启用或未配置' }
  }

  const placeholders = generatePlaceholders(year, month)
  if (config.token) {
    placeholders.TOKEN = config.token
  }

  try {
    // 构建请求头
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }

    if (config.authType === 'bearer' && config.token) {
      headers['Authorization'] = `Bearer ${config.token}`
    } else if (config.authType === 'cookie' && config.cookie) {
      headers['Cookie'] = config.cookie
    } else if (config.authType === 'custom' && config.customHeaders) {
      Object.assign(headers, config.customHeaders)
    }

    // 构建请求选项
    const fetchOptions: RequestInit = {
      method: config.method,
      headers
    }

    // POST 请求添加请求体
    if (config.method === 'POST' && config.requestBodyTemplate) {
      fetchOptions.body = replacePlaceholders(config.requestBodyTemplate, placeholders)
    }

    // 发送请求
    const response = await fetch(config.baseUrl, fetchOptions)

    if (!response.ok) {
      return { success: false, error: `HTTP 错误: ${response.status}` }
    }

    const responseText = await response.text()

    // 解析响应
    let records: PunchRecord[]

    if (config.useJavaScript && config.responseScript) {
      // 使用 JavaScript 脚本解析
      try {
        // 创建一个安全的执行环境
        const fn = new Function('text', config.responseScript)
        const result = fn(responseText)
        records = JSON.parse(result)
      } catch (scriptError) {
        return { success: false, error: `脚本执行错误: ${scriptError}` }
      }
    } else {
      // 使用 JSON 路径解析
      const jsonData = JSON.parse(responseText)
      const rawRecords = getValueByPath(jsonData, config.responsePath) as unknown[]

      if (!Array.isArray(rawRecords)) {
        return { success: false, error: `响应路径 "${config.responsePath}" 不是数组` }
      }

      // 字段映射
      records = rawRecords.map((item) => {
        const record = item as Record<string, unknown>
        return {
          punchTime: parseTimestamp(
            getValueByPath(record, config.fieldMappings.punchTime),
            config.timestampFormat
          ),
          punchType: String(getValueByPath(record, config.fieldMappings.punchType) || ''),
          remark: String(getValueByPath(record, config.fieldMappings.remark) || '')
        }
      })
    }

    return { success: true, data: records }
  } catch (error) {
    return { success: false, error: `请求失败: ${error}` }
  }
}

// 将打卡记录转换为工时记录
export function convertPunchRecordsToTimeEntries(
  records: PunchRecord[],
  defaultBreakMinutes: number
): TimeEntry[] {
  // 按日期分组
  const groupedByDate: Record<string, PunchRecord[]> = {}

  for (const record of records) {
    const date = dayjs.unix(record.punchTime).format('YYYY-MM-DD')
    if (!groupedByDate[date]) {
      groupedByDate[date] = []
    }
    groupedByDate[date].push(record)
  }

  // 转换为工时记录
  const entries: TimeEntry[] = []

  for (const [date, dayRecords] of Object.entries(groupedByDate)) {
    // 按时间排序
    dayRecords.sort((a, b) => a.punchTime - b.punchTime)

    // 找到第一个"上班"打卡和最后一个"下班"打卡
    const checkInRecord = dayRecords.find(
      (r) => r.punchType.includes('上班') || r.punchType.toLowerCase().includes('checkin')
    )
    const checkOutRecords = dayRecords.filter(
      (r) => r.punchType.includes('下班') || r.punchType.toLowerCase().includes('checkout')
    )
    const checkOutRecord = checkOutRecords[checkOutRecords.length - 1]

    // 如果没有明确的上班/下班类型，使用第一条和最后一条
    const firstRecord = checkInRecord || dayRecords[0]
    const lastRecord = checkOutRecord || dayRecords[dayRecords.length - 1]

    if (firstRecord && lastRecord) {
      const startTime = dayjs.unix(firstRecord.punchTime).format('HH:mm')
      const endTime = dayjs.unix(lastRecord.punchTime).format('HH:mm')

      entries.push({
        id: `sync-${date}`,
        date,
        startTime,
        endTime,
        breakMinutes: defaultBreakMinutes,
        note: `从 API 同步 (${dayRecords.length} 条打卡记录)`,
        createdAt: Date.now(),
        updatedAt: Date.now()
      })
    }
  }

  return entries
}

// 同步指定月份的工时数据
export async function syncMonthData(
  config: ApiConfig,
  year: number,
  month: number,
  saveEntry: (entry: TimeEntry) => void
): Promise<SyncResult> {
  // 获取打卡记录
  const fetchResult = await fetchPunchRecords(config, year, month)

  if (!fetchResult.success || !fetchResult.data) {
    return {
      success: false,
      message: fetchResult.error || '获取数据失败'
    }
  }

  // 转换为工时记录
  const entries = convertPunchRecordsToTimeEntries(fetchResult.data, config.defaultBreakMinutes)

  // 保存到数据库
  for (const entry of entries) {
    saveEntry(entry)
  }

  return {
    success: true,
    message: `同步成功`,
    recordsCount: fetchResult.data.length,
    entriesCreated: entries.length
  }
}
