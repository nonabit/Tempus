// 工时录入表单组件
import * as React from 'react'
import dayjs from 'dayjs'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTimeStore } from '@/stores/timeStore'
import type { TimeEntry } from '@/types/timesheet'

interface TimeEntryFormProps {
  date?: string // YYYY-MM-DD 格式，默认今天
  existingEntry?: TimeEntry // 编辑现有记录
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
}

export function TimeEntryForm({
  date,
  existingEntry,
  onSuccess,
  onCancel,
  className
}: TimeEntryFormProps) {
  const { addEntry, updateEntry, settings } = useTimeStore()

  const targetDate = date || dayjs().format('YYYY-MM-DD')
  const isEditing = !!existingEntry

  // 表单状态
  const [startTime, setStartTime] = React.useState(
    existingEntry?.startTime || settings.workStartTime
  )
  const [endTime, setEndTime] = React.useState(
    existingEntry?.endTime || settings.workEndTime
  )
  const [breakMinutes, setBreakMinutes] = React.useState(
    existingEntry?.breakMinutes || 60
  )
  const [note, setNote] = React.useState(existingEntry?.note || '')

  // 计算工时
  const calculatedHours = React.useMemo(() => {
    const start = dayjs(`${targetDate} ${startTime}`)
    const end = dayjs(`${targetDate} ${endTime}`)
    const totalMinutes = end.diff(start, 'minute') - breakMinutes
    const hours = Math.floor(totalMinutes / 60)
    const mins = totalMinutes % 60
    return { hours, mins, totalMinutes, isValid: totalMinutes > 0 }
  }, [targetDate, startTime, endTime, breakMinutes])

  // 提交表单
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!calculatedHours.isValid) {
      return
    }

    const entryData = {
      date: targetDate,
      startTime,
      endTime,
      breakMinutes,
      note: note.trim() || undefined
    }

    if (isEditing && existingEntry) {
      updateEntry(existingEntry.id, entryData)
    } else {
      addEntry(entryData)
    }

    onSuccess?.()
  }

  // 格式化日期显示
  const formattedDate = dayjs(targetDate).format('M月D日 dddd')

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      {/* 日期标题 */}
      <div className="text-center">
        <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          {formattedDate}
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {isEditing ? '编辑工时记录' : '录入工时'}
        </p>
      </div>

      {/* 上班时间 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          上班时间
        </label>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        />
      </div>

      {/* 下班时间 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          下班时间
        </label>
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
        />
      </div>

      {/* 休息时间 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          休息时间（分钟）
        </label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="180"
            step="15"
            value={breakMinutes}
            onChange={(e) => setBreakMinutes(Number(e.target.value))}
            className="flex-1"
          />
          <span className="w-16 text-right text-sm text-neutral-600 dark:text-neutral-400">
            {breakMinutes} 分钟
          </span>
        </div>
      </div>

      {/* 备注 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          备注（可选）
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="今天做了什么..."
          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-neutral-900 placeholder:text-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
        />
      </div>

      {/* 工时预览 */}
      <div
        className={cn(
          'rounded-lg p-3 text-center',
          calculatedHours.isValid
            ? 'bg-blue-50 dark:bg-blue-900/20'
            : 'bg-red-50 dark:bg-red-900/20'
        )}
      >
        {calculatedHours.isValid ? (
          <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
            今日工时：{calculatedHours.hours}h {calculatedHours.mins}m
          </p>
        ) : (
          <p className="text-sm text-red-600 dark:text-red-400">
            请检查时间设置
          </p>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            取消
          </Button>
        )}
        <Button
          type="submit"
          disabled={!calculatedHours.isValid}
          className="flex-1"
        >
          {isEditing ? '保存修改' : '保存'}
        </Button>
      </div>
    </form>
  )
}
