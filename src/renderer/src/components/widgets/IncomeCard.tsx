// 收入卡片组件 - 带水位线动画效果
import dayjs from 'dayjs'
import { motion, AnimatePresence } from 'motion/react'
import { IconCoin, IconClock, IconTrendingDown } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { useTimeStore, calculateWorkHours, calculateIncome } from '@/stores/timeStore'

interface IncomeCardProps {
  date?: string // YYYY-MM-DD 格式，默认今天
  className?: string
}

export function IncomeCard({ date, className }: IncomeCardProps) {
  const { getEntryByDate, settings } = useTimeStore()

  const targetDate = date || dayjs().format('YYYY-MM-DD')
  const entry = getEntryByDate(targetDate)
  const isToday = targetDate === dayjs().format('YYYY-MM-DD')

  // 没有记录时不显示
  if (!entry) return null

  // 使用实际记录的工时计算
  const workInfo = calculateWorkHours(entry, settings)
  const incomeInfo = calculateIncome(entry, settings)

  // 计算水位线高度（基于标准工时的百分比，最高 100%）
  const standardMinutes = settings.standardWorkHours * 60
  const waterLevel = Math.min(100, (workInfo.totalMinutes / standardMinutes) * 100)

  // 水位线颜色
  const waterColor =
    incomeInfo.status === 'normal'
      ? 'from-emerald-400 to-emerald-500'
      : incomeInfo.status === 'decreasing'
        ? 'from-amber-400 to-amber-500'
        : 'from-red-400 to-red-500'

  // 格式化工时显示
  const hours = Math.floor(workInfo.totalMinutes / 60)
  const minutes = workInfo.totalMinutes % 60

  // 判断是否正在工作中（仅今天有效）
  const now = dayjs()
  const startTime = dayjs(`${entry.date} ${entry.startTime}`)
  const endTime = dayjs(`${entry.date} ${entry.endTime}`)
  const isWorking = isToday && now.isAfter(startTime) && now.isBefore(endTime)

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800',
        className
      )}
    >
      {/* 水位线动画背景 */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className={cn('absolute bottom-0 left-0 right-0 bg-gradient-to-t', waterColor)}
          initial={{ height: 0 }}
          animate={{ height: `${waterLevel}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ opacity: 0.15 }}
        />
        {/* 波浪效果 */}
        {waterLevel > 0 && (
          <motion.div
            className={cn('absolute left-0 right-0 h-2 bg-gradient-to-t', waterColor)}
            style={{
              bottom: `${waterLevel}%`,
              opacity: 0.3,
              borderRadius: '100% 100% 0 0'
            }}
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>

      {/* 内容 */}
      <div className="relative z-10 p-4">
        {/* 标题 */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconCoin className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              {isToday ? '今日' : '当日'}收入
            </span>
          </div>
          {isWorking && (
            <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              工作中
            </span>
          )}
        </div>

        {/* 收入金额 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={incomeInfo.income}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={cn(
              'mb-3 text-3xl font-bold tracking-tight',
              incomeInfo.status === 'normal' && 'text-emerald-600 dark:text-emerald-400',
              incomeInfo.status === 'decreasing' && 'text-amber-600 dark:text-amber-400',
              incomeInfo.status === 'loss' && 'text-red-600 dark:text-red-400'
            )}
          >
            ¥{incomeInfo.income.toFixed(0)}
          </motion.div>
        </AnimatePresence>

        {/* 工时和时薪信息 */}
        <div className="grid grid-cols-2 gap-2">
          {/* 已工作时长 */}
          <div className="flex items-center gap-2 rounded-lg bg-neutral-100/80 px-2 py-1.5 dark:bg-neutral-700/50">
            <IconClock className="h-3.5 w-3.5 text-neutral-500" />
            <div>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">工时</p>
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                {hours}h {minutes}m
              </p>
            </div>
          </div>

          {/* 当前时薪 */}
          <div className="flex items-center gap-2 rounded-lg bg-neutral-100/80 px-2 py-1.5 dark:bg-neutral-700/50">
            {incomeInfo.status === 'decreasing' || incomeInfo.status === 'loss' ? (
              <IconTrendingDown className="h-3.5 w-3.5 text-amber-500" />
            ) : (
              <IconCoin className="h-3.5 w-3.5 text-neutral-500" />
            )}
            <div>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">时薪</p>
              <p
                className={cn(
                  'text-sm font-semibold',
                  incomeInfo.status === 'normal' && 'text-neutral-800 dark:text-neutral-200',
                  incomeInfo.status === 'decreasing' && 'text-amber-600 dark:text-amber-400',
                  incomeInfo.status === 'loss' && 'text-red-600 dark:text-red-400'
                )}
              >
                ¥{incomeInfo.hourlyRate}
              </p>
            </div>
          </div>
        </div>

        {/* 加班提示 */}
        {workInfo.isOvertime && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 rounded-lg bg-amber-50 px-2 py-1.5 dark:bg-amber-900/20"
          >
            <p className="text-[10px] text-amber-600 dark:text-amber-400">
              已加班 {workInfo.formattedOvertime}，时薪递减中
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
