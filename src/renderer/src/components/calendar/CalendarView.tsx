'use client'

import * as React from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { motion, AnimatePresence } from 'motion/react'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Solar, HolidayUtil } from 'lunar-typescript'
import todaySealImg from '@/assets/today-seal.png'

interface CalendarViewProps {
  /**
   * The current date focused in the calendar (determines the month displayed)
   */
  currentDate?: Date
  /**
   * Callback when the current date changes (e.g. navigation)
   */
  onDateChange?: (date: Date) => void
  /**
   * 当前选中的日期（YYYY-MM-DD 格式）
   */
  selectedDate?: string
  /**
   * 点击日历格子时的回调
   */
  onCellClick?: (date: Date) => void
  /**
   * Custom renderer for the cell content.
   * Useful for displaying work hours or other data.
   */
  renderCell?: (date: Date) => React.ReactNode
  /**
   * Custom props for the cell container.
   * Useful for applying background styles (e.g. ink wash effect).
   */
  getCellProps?: (date: Date) => React.HTMLAttributes<HTMLDivElement>
  className?: string
}

export function CalendarView({
  currentDate = new Date(),
  onDateChange,
  selectedDate,
  onCellClick,
  renderCell,
  getCellProps,
  className
}: CalendarViewProps) {
  // Use internal state if not controlled, but generally expect controlled usage for date
  const [internalDate, setInternalDate] = React.useState(dayjs(currentDate))
  // 农历月份别名显示状态
  const [lunarMonthLabel, setLunarMonthLabel] = React.useState<string | null>(null)
  // 用于触发墨迹渐显动画的 key
  const [animationKey, setAnimationKey] = React.useState(0)

  React.useEffect(() => {
    setInternalDate(dayjs(currentDate).locale('zh-cn'))
  }, [currentDate])

  // 获取农历月份别名
  const getLunarMonthLabel = (date: dayjs.Dayjs) => {
    const solar = Solar.fromYmd(date.year(), date.month() + 1, 15)
    return solar.getLunar().getMonthInChinese() + '月'
  }

  const handlePrevMonth = () => {
    const newDate = internalDate.subtract(1, 'month')
    setInternalDate(newDate)
    setAnimationKey((k) => k + 1)
    // 显示农历月份别名
    setLunarMonthLabel(getLunarMonthLabel(newDate))
    setTimeout(() => setLunarMonthLabel(null), 800)
    onDateChange?.(newDate.toDate())
  }

  const handleNextMonth = () => {
    const newDate = internalDate.add(1, 'month')
    setInternalDate(newDate)
    setAnimationKey((k) => k + 1)
    // 显示农历月份别名
    setLunarMonthLabel(getLunarMonthLabel(newDate))
    setTimeout(() => setLunarMonthLabel(null), 800)
    onDateChange?.(newDate.toDate())
  }

  // Generate 42 grid items
  // 1. Get start of month
  const startOfMonth = internalDate.startOf('month')
  // 2. Get start of week for that start of month (Strictly Sunday start)
  // We explicitly calculate Sunday by subtracting the day index (0=Sun, 1=Mon...)
  const startOfGrid = startOfMonth.subtract(startOfMonth.day(), 'day')

  const days = React.useMemo(() => {
    const grid: dayjs.Dayjs[] = []
    let current = startOfGrid
    // 42 cells: 6 rows * 7 columns
    for (let i = 0; i < 42; i++) {
      grid.push(current)
      current = current.add(1, 'day')
    }
    return grid
  }, [startOfGrid])

  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

  return (
    <div className={cn('flex flex-col gap-4 p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between relative">
        <h2 className="text-xl font-semibold text-ink font-serif-title">
          {internalDate.format('YYYY年 M月')}
        </h2>
        {/* 农历月份别名 */}
        <AnimatePresence>
          {lunarMonthLabel && (
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute left-1/2 -translate-x-1/2 text-lg text-willow font-medium font-serif-title"
            >
              {lunarMonthLabel}
            </motion.span>
          )}
        </AnimatePresence>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevMonth}
            className="h-8 w-8 rounded-md border-indigo/20 hover:bg-willow/10"
            aria-label="Previous month"
          >
            <IconChevronLeft className="h-4 w-4 text-ink" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            className="h-8 w-8 rounded-md border-indigo/20 hover:bg-willow/10"
            aria-label="Next month"
          >
            <IconChevronRight className="h-4 w-4 text-ink" />
          </Button>
        </div>
      </div>

      {/* Grid - No borders (Borderless Design) */}
      <div className="flex-1 grid grid-cols-7 grid-rows-[auto_repeat(6,1fr)] rounded-lg overflow-hidden min-h-0">
        {/* Weekday headers */}
        {weekDays.map((day) => (
          <div
            key={day}
            className="bg-paper py-2 text-center text-base font-semibold text-indigo font-serif-title"
          >
            {day}
          </div>
        ))}

        {/* Days */}
        {days.map((dayItem, index) => {
          const isCurrentMonth = dayItem.month() === internalDate.month()
          const isToday = dayItem.isSame(dayjs(), 'day')
          const dateObj = dayItem.toDate()
          const dayOfWeek = dayItem.day()
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
          const isSelected = selectedDate === dayItem.format('YYYY-MM-DD')
          // 墨迹渐显动画延迟（按行计算）
          const rowIndex = Math.floor(index / 7)
          const animDelay = rowIndex * 0.03

          // Get custom props from parent
          const customProps = getCellProps?.(dateObj) || {}
          const { className: customClassName, ...restCustomProps } = customProps

          // Lunar / Solar / Holiday Calc
          const solar = Solar.fromYmd(
            dateObj.getFullYear(),
            dateObj.getMonth() + 1,
            dateObj.getDate()
          )
          const lunar = solar.getLunar()
          const holiday = HolidayUtil.getHoliday(
            dateObj.getFullYear(),
            dateObj.getMonth() + 1,
            dateObj.getDate()
          )

          // 阴历日期始终显示
          let lunarText = lunar.getDayInChinese()
          let lunarTextColor = 'text-indigo/60'

          // 初一显示月份
          if (lunar.getDay() === 1) {
            lunarText = lunar.getMonthInChinese() + '月'
            lunarTextColor = 'text-cinnabar'
          }

          const jieQi = lunar.getJieQi()

          // Last Saturday Logic
          const isSaturday = dayOfWeek === 6
          const isLastSaturday = isSaturday && dayItem.add(7, 'day').month() !== dayItem.month()

          return (
            <motion.div
              key={`${animationKey}-${dayItem.toString()}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: animDelay, duration: 0.3 }}
              onClick={() => onCellClick?.(dateObj)}
              {...(restCustomProps as any)}
              className={cn(
                'group relative p-2 transition-all duration-300 flex flex-col min-h-0 cursor-pointer overflow-hidden',
                // Default rounded shape for cells to look organic if custom bg is applied
                'rounded-xl m-0.5',
                !isCurrentMonth && 'opacity-40',
                // isToday && !isSelected && 'bg-willow/10', // Moved to Seal logic below
                isSelected && 'ring-2 ring-inset ring-indigo bg-paper shadow-sm z-10',
                customClassName
              )}
            >
              {/* 日期区域：阳历 + 阴历 */}
              <div className="flex-none relative z-10">
                {/* 阳历日期 + 休/班标签 + 节假日名称/月末周六 */}
                <div className="flex items-center gap-1 mb-2">
                  <span
                    className={cn(
                      'flex h-8 w-8 items-center justify-center text-xl font-medium font-serif-num transition-all',
                      isCurrentMonth
                        ? isWeekend
                          ? 'text-cinnabar/80'
                          : 'text-ink'
                        : 'text-indigo/40'
                    )}
                  >
                    {dayItem.date()}
                  </span>
                  {holiday && (
                    <span
                      className={cn(
                        'text-[10px] px-1 rounded leading-none py-0.5',
                        holiday.isWork()
                          ? 'bg-indigo/20 text-ink' // 班
                          : 'bg-cinnabar text-paper' // 休
                      )}
                    >
                      {holiday.isWork() ? '班' : '休'}
                    </span>
                  )}
                  {holiday && (
                    <span className="text-[11px] font-medium leading-none font-serif-title text-cinnabar">
                      {holiday.getName()}
                    </span>
                  )}
                  {isLastSaturday && !holiday && (
                    <span className="text-[11px] font-medium leading-none font-serif-title text-cinnabar font-bold">
                      月末周六
                    </span>
                  )}
                </div>
                {/* 阴历日期 + 节气 */}
                <div className="flex items-center gap-1 mt-3">
                  <span className={cn('text-[11px] font-medium leading-none font-serif-title', lunarTextColor)}>
                    {lunarText}
                  </span>
                  {jieQi && (
                    <span className="text-[11px] font-medium leading-none font-serif-title text-willow">
                      {jieQi}
                    </span>
                  )}
                </div>
              </div>

              {/* Custom Card Slot */}
              <div className="flex-1 min-h-0 overflow-y-auto mt-3 relative z-10 no-scrollbar">
                {renderCell ? renderCell(dateObj) : null}
              </div>

              {/* 今日印章贴图 */}
              {isToday && (
                <img
                  src={todaySealImg}
                  alt="今"
                  className="absolute bottom-1 right-1 w-9 h-9 object-contain pointer-events-none select-none"
                  style={{
                    transform: 'rotate(8deg)',
                    filter: 'drop-shadow(1px 1px 1px rgba(0,0,0,0.15))'
                  }}
                />
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
