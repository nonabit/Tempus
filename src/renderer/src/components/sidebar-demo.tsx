'use client'
import { useState } from 'react'
import dayjs from 'dayjs'
import { motion } from 'motion/react'
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar'
import { IconChartBar, IconCalendar, IconSettings, IconTrophy, IconX } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { CalendarView } from '@/components/calendar-view'
import { TimeEntryForm } from '@/components/timesheet'
import { AchievementWall } from '@/components/achievement'
import { IncomeCard, FunStats } from '@/components/widgets'
import { ApiConfigForm } from '@/components/settings/ApiConfigForm'
import { StatsPage } from '@/pages/StatsPage'
import { useTimeStore, calculateWorkHours } from '@/stores/timeStore'

type ViewType = 'calendar' | 'achievement' | 'stats' | 'settings'

export default function SidebarDemo() {
  const [open, setOpen] = useState(false)
  const [activeView, setActiveView] = useState<ViewType>('calendar')
  const [date, setDate] = useState(new Date())

  // 工时相关状态
  const { getEntryByDate, settings } = useTimeStore()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // 导航链接配置
  const links = [
    {
      label: '日历',
      href: '#',
      icon: <IconCalendar className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    },
    {
      label: '成就',
      href: '#',
      icon: <IconTrophy className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    },
    {
      label: '统计',
      href: '#',
      icon: <IconChartBar className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    },
    {
      label: '设置',
      href: '#',
      icon: <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
    }
  ]

  // 处理导航点击
  const handleNavClick = (view: ViewType) => (e: React.MouseEvent) => {
    e.preventDefault()
    setActiveView(view)
  }

  // 点击日历格子（点击已选中的日期则关闭弹窗）
  const handleCellClick = (cellDate: Date) => {
    const clickedDate = dayjs(cellDate).format('YYYY-MM-DD')
    setSelectedDate(selectedDate === clickedDate ? null : clickedDate)
  }

  // 关闭详情面板
  const handleClosePanel = () => {
    setSelectedDate(null)
  }

  // 获取选中日期的记录
  const selectedEntry = selectedDate ? getEntryByDate(selectedDate) : undefined

  return (
    <div
      className={cn(
        'mx-auto flex w-full flex-1 flex-col overflow-hidden border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800',
        'h-screen'
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {/* 导航链接 */}
            <div className="mt-4 flex flex-col gap-2">
              <SidebarLink link={links[0]} onClick={handleNavClick('calendar')} />
              <SidebarLink link={links[1]} onClick={handleNavClick('achievement')} />
              <SidebarLink link={links[2]} onClick={handleNavClick('stats')} />
              <SidebarLink link={links[3]} onClick={handleNavClick('settings')} />
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      {/* 主内容区 */}
      <div className="flex flex-1 h-full overflow-hidden p-2 md:p-6 gap-4">
        {activeView === 'calendar' && (
          <>
            {/* 日历 */}
            <div className="flex-1 min-h-0 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
              <CalendarView
                className="flex-1 h-full min-h-0"
                currentDate={date}
                onDateChange={setDate}
                onCellClick={handleCellClick}
                selectedDate={selectedDate || undefined}
                renderCell={(cellDate) => {
                  const dateStr = dayjs(cellDate).format('YYYY-MM-DD')
                  const entry = getEntryByDate(dateStr)

                  // 没有记录则不显示任何内容
                  if (!entry) return null

                  // 有记录时显示工时，颜色深浅反映工时长短
                  const workInfo = calculateWorkHours(entry, settings)
                  const standardMinutes = settings.standardWorkHours * 60

                  // 根据工时长度选择颜色强度
                  // <4h: 浅色, 4-8h: 正常, 8-10h: 深色, >10h: 警示色
                  const getColorClass = () => {
                    const { totalMinutes, overtimeMinutes } = workInfo
                    if (totalMinutes < 240) {
                      // < 4小时：浅绿色
                      return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                    } else if (totalMinutes <= standardMinutes) {
                      // 4-8小时：正常绿色
                      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    } else if (overtimeMinutes <= 120) {
                      // 8-10小时：深绿色
                      return 'bg-emerald-200 text-emerald-800 dark:bg-emerald-800/40 dark:text-emerald-200'
                    } else if (overtimeMinutes <= 240) {
                      // 10-12小时：橙色警示
                      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    } else {
                      // >12小时：红色警示
                      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }
                  }

                  return (
                    <div
                      className={cn(
                        'w-full rounded p-1 text-xs text-center font-medium',
                        getColorClass()
                      )}
                    >
                      {workInfo.formattedTotal}
                    </div>
                  )
                }}
              />
            </div>

            {/* 右侧详情面板 */}
            <motion.div
              animate={{
                width: selectedDate ? 320 : 0,
                opacity: selectedDate ? 1 : 0
              }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="shrink-0 overflow-hidden"
            >
              <div className="w-80 h-full bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm p-4 relative overflow-y-auto">
                <button
                  onClick={handleClosePanel}
                  className="absolute right-3 top-3 rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700 z-10"
                >
                  <IconX className="h-4 w-4" />
                </button>
                {selectedDate && (
                  <div className="flex flex-col gap-4">
                    <TimeEntryForm
                      date={selectedDate}
                      existingEntry={selectedEntry}
                      onSuccess={handleClosePanel}
                    />
                    {/* 收入卡片 */}
                    {selectedEntry && <IncomeCard date={selectedDate} />}
                    {/* 趣味统计 */}
                    <FunStats />
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}

        {activeView === 'achievement' && (
          <div className="flex-1 min-h-0 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden">
            <AchievementWall />
          </div>
        )}

        {activeView === 'stats' && (
          <div className="flex-1 min-h-0 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-y-auto p-4">
            <StatsPage />
          </div>
        )}

        {activeView === 'settings' && (
          <div className="flex-1 min-h-0 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-y-auto">
            <ApiConfigForm />
          </div>
        )}
      </div>
    </div>
  )
}
