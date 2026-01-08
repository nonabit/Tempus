// 当日工时卡片组件
import dayjs from 'dayjs'
import { IconClock, IconEdit, IconTrash, IconPlus } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTimeStore, calculateWorkHours, calculateIncome } from '@/stores/timeStore'
import type { TimeEntry } from '@/types/timesheet'

interface DailyTimeCardProps {
  date?: string // YYYY-MM-DD 格式，默认今天
  onEdit?: (entry: TimeEntry) => void
  onAdd?: (date: string) => void
  className?: string
}

export function DailyTimeCard({
  date,
  onEdit,
  onAdd,
  className
}: DailyTimeCardProps) {
  const { getEntryByDate, deleteEntry, settings } = useTimeStore()

  const targetDate = date || dayjs().format('YYYY-MM-DD')
  const entry = getEntryByDate(targetDate)
  const isToday = targetDate === dayjs().format('YYYY-MM-DD')

  // 计算工时和收入
  const workInfo = entry ? calculateWorkHours(entry, settings) : null
  const incomeInfo = entry ? calculateIncome(entry, settings) : null

  // 格式化日期
  const formattedDate = dayjs(targetDate).format('M月D日')
  const weekday = dayjs(targetDate).format('dddd')

  // 没有记录时的空状态
  if (!entry) {
    return (
      <div
        className={cn(
          'rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50',
          className
        )}
      >
        <div className="flex flex-col items-center gap-3 py-4">
          <IconClock className="h-10 w-10 text-neutral-300 dark:text-neutral-600" />
          <div className="text-center">
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {isToday ? '今天' : formattedDate} 暂无工时记录
            </p>
          </div>
          {onAdd && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAdd(targetDate)}
              className="mt-2"
            >
              <IconPlus className="mr-1 h-4 w-4" />
              添加记录
            </Button>
          )}
        </div>
      </div>
    )
  }

  // 有记录时的展示
  return (
    <div
      className={cn(
        'rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-800',
        className
      )}
    >
      {/* 顶部：日期和操作 */}
      <div className="mb-3 flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {isToday ? '今天' : formattedDate}
          </span>
          <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
            {weekday}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(entry)}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-300"
            >
              <IconEdit className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => deleteEntry(entry.id)}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
          >
            <IconTrash className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 时间信息 */}
      <div className="mb-3 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-neutral-500 dark:text-neutral-400">上班</span>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {entry.startTime}
          </span>
        </div>
        <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
        <div className="flex items-center gap-1.5">
          <span className="text-neutral-500 dark:text-neutral-400">下班</span>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {entry.endTime}
          </span>
        </div>
      </div>

      {/* 工时统计 */}
      {workInfo && (
        <div className="grid grid-cols-2 gap-3">
          {/* 工时 */}
          <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
            <p className="text-xs text-blue-600 dark:text-blue-400">工时</p>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {workInfo.formattedTotal}
            </p>
            {workInfo.isOvertime && (
              <p className="text-xs text-orange-500">
                +{workInfo.formattedOvertime} 加班
              </p>
            )}
          </div>

          {/* 收入 */}
          {incomeInfo && (
            <div
              className={cn(
                'rounded-lg p-3',
                incomeInfo.status === 'normal' && 'bg-green-50 dark:bg-green-900/20',
                incomeInfo.status === 'decreasing' && 'bg-yellow-50 dark:bg-yellow-900/20',
                incomeInfo.status === 'loss' && 'bg-red-50 dark:bg-red-900/20'
              )}
            >
              <p
                className={cn(
                  'text-xs',
                  incomeInfo.status === 'normal' && 'text-green-600 dark:text-green-400',
                  incomeInfo.status === 'decreasing' && 'text-yellow-600 dark:text-yellow-400',
                  incomeInfo.status === 'loss' && 'text-red-600 dark:text-red-400'
                )}
              >
                收入
              </p>
              <p
                className={cn(
                  'text-lg font-bold',
                  incomeInfo.status === 'normal' && 'text-green-700 dark:text-green-300',
                  incomeInfo.status === 'decreasing' && 'text-yellow-700 dark:text-yellow-300',
                  incomeInfo.status === 'loss' && 'text-red-700 dark:text-red-300'
                )}
              >
                ¥{incomeInfo.income}
              </p>
              <p
                className={cn(
                  'text-xs',
                  incomeInfo.status === 'normal' && 'text-green-500',
                  incomeInfo.status === 'decreasing' && 'text-yellow-500',
                  incomeInfo.status === 'loss' && 'text-red-500'
                )}
              >
                {incomeInfo.status === 'normal' && `时薪 ¥${incomeInfo.hourlyRate}`}
                {incomeInfo.status === 'decreasing' && `时薪递减中`}
                {incomeInfo.status === 'loss' && '已亏损'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 备注 */}
      {entry.note && (
        <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
          📝 {entry.note}
        </p>
      )}
    </div>
  )
}
