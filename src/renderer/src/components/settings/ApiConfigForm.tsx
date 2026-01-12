// API 配置表单组件

import { useState } from 'react'
import { IconRefresh, IconCheck, IconX, IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import { useSettingsStore } from '@/stores/settingsStore'
import { syncMonthData } from '@/services/companyApi'
import { useTimeStore } from '@/stores/timeStore'
import dayjs from 'dayjs'
import type { ApiConfig } from '@/types/api'

export function ApiConfigForm(): React.ReactElement {
  const { apiConfig, updateApiConfig, lastSyncTime, setLastSyncTime, isLoading } =
    useSettingsStore()
  const { addEntry } = useTimeStore()

  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // 处理同步
  const handleSync = async (): Promise<void> => {
    if (!apiConfig.enabled || !apiConfig.baseUrl) {
      setSyncResult({ success: false, message: 'API 未启用或未配置' })
      return
    }

    setIsSyncing(true)
    setSyncResult(null)

    try {
      const now = dayjs()
      const result = await syncMonthData(apiConfig, now.year(), now.month() + 1, (entry) => {
        addEntry(entry)
      })

      setSyncResult(result)
      if (result.success) {
        await setLastSyncTime(Date.now())
      }
    } catch (error) {
      setSyncResult({ success: false, message: `同步失败: ${error}` })
    } finally {
      setIsSyncing(false)
    }
  }

  // 更新配置
  const handleConfigChange = (key: keyof ApiConfig, value: unknown): void => {
    updateApiConfig({ [key]: value })
  }

  if (isLoading) {
    return <div className="p-4 text-neutral-400">加载中...</div>
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">API 同步设置</h2>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm text-neutral-400">
            {apiConfig.enabled ? '已启用' : '已禁用'}
          </span>
          <input
            type="checkbox"
            checked={apiConfig.enabled}
            onChange={(e) => handleConfigChange('enabled', e.target.checked)}
            className="w-4 h-4 rounded bg-neutral-700 border-neutral-600 text-blue-500 focus:ring-blue-500"
          />
        </label>
      </div>

      {/* 基础配置 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">API 地址</label>
          <input
            type="text"
            value={apiConfig.baseUrl}
            onChange={(e) => handleConfigChange('baseUrl', e.target.value)}
            placeholder="https://api.company.com/punch/list"
            className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">认证方式</label>
            <select
              value={apiConfig.authType}
              onChange={(e) => handleConfigChange('authType', e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">无认证</option>
              <option value="bearer">Bearer Token</option>
              <option value="cookie">Cookie</option>
              <option value="custom">自定义请求头</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">请求方式</label>
            <select
              value={apiConfig.method}
              onChange={(e) => handleConfigChange('method', e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
            </select>
          </div>
        </div>

        {apiConfig.authType === 'bearer' && (
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Token</label>
            <input
              type="password"
              value={apiConfig.token || ''}
              onChange={(e) => handleConfigChange('token', e.target.value)}
              placeholder="输入 Bearer Token"
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {apiConfig.authType === 'cookie' && (
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Cookie</label>
            <textarea
              value={apiConfig.cookie || ''}
              onChange={(e) => handleConfigChange('cookie', e.target.value)}
              placeholder="key1=value1; key2=value2"
              rows={2}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* 高级配置 */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 text-sm text-neutral-400 hover:text-white"
        >
          {showAdvanced ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
          高级配置
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 pl-4 border-l-2 border-neutral-700">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                请求体模板 (POST)
              </label>
              <textarea
                value={apiConfig.requestBodyTemplate || ''}
                onChange={(e) => handleConfigChange('requestBodyTemplate', e.target.value)}
                placeholder='{"start":"{DAYSTART}","end":"{DAYEND}"}'
                rows={3}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white font-mono text-sm placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-neutral-500">
                支持占位符: {'{YEAR}'}, {'{MONTH}'}, {'{DAYSTART}'}, {'{DAYEND}'}, {'{TOKEN}'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                响应数据路径
              </label>
              <input
                type="text"
                value={apiConfig.responsePath}
                onChange={(e) => handleConfigChange('responsePath', e.target.value)}
                placeholder="data.records"
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  时间戳格式
                </label>
                <select
                  value={apiConfig.timestampFormat}
                  onChange={(e) => handleConfigChange('timestampFormat', e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="seconds">秒级时间戳</option>
                  <option value="milliseconds">毫秒时间戳</option>
                  <option value="datetime">日期时间字符串</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                  默认休息时间 (分钟)
                </label>
                <input
                  type="number"
                  value={apiConfig.defaultBreakMinutes}
                  onChange={(e) =>
                    handleConfigChange('defaultBreakMinutes', parseInt(e.target.value) || 60)
                  }
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-300">字段映射</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  value={apiConfig.fieldMappings.punchTime}
                  onChange={(e) =>
                    handleConfigChange('fieldMappings', {
                      ...apiConfig.fieldMappings,
                      punchTime: e.target.value
                    })
                  }
                  placeholder="打卡时间字段"
                  className="px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={apiConfig.fieldMappings.punchType}
                  onChange={(e) =>
                    handleConfigChange('fieldMappings', {
                      ...apiConfig.fieldMappings,
                      punchType: e.target.value
                    })
                  }
                  placeholder="打卡类型字段"
                  className="px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={apiConfig.fieldMappings.remark}
                  onChange={(e) =>
                    handleConfigChange('fieldMappings', {
                      ...apiConfig.fieldMappings,
                      remark: e.target.value
                    })
                  }
                  placeholder="备注字段"
                  className="px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 同步按钮和状态 */}
      <div className="pt-4 border-t border-neutral-700">
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-400">
            {lastSyncTime && (
              <span>上次同步: {dayjs(lastSyncTime).format('YYYY-MM-DD HH:mm')}</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleSync}
            disabled={isSyncing || !apiConfig.enabled || !apiConfig.baseUrl}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-md transition-colors"
          >
            <IconRefresh size={18} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? '同步中...' : '立即同步'}
          </button>
        </div>

        {syncResult && (
          <div
            className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-md ${
              syncResult.success ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
            }`}
          >
            {syncResult.success ? <IconCheck size={18} /> : <IconX size={18} />}
            <span className="text-sm">{syncResult.message}</span>
          </div>
        )}
      </div>
    </div>
  )
}
