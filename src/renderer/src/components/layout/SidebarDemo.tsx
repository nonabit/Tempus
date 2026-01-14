'use client'
import { useState } from 'react'
import dayjs from 'dayjs'
import { motion } from 'motion/react'
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar'
import { IconChartBar, IconCalendar, IconSettings, IconTrophy, IconX } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { CalendarView } from '@/components/calendar'
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
      icon: <IconCalendar className="h-5 w-5 shrink-0 text-ink/70" />
    },
    {
      label: '成就',
      href: '#',
      icon: <IconTrophy className="h-5 w-5 shrink-0 text-ink/70" />
    },
    {
      label: '统计',
      href: '#',
      icon: <IconChartBar className="h-5 w-5 shrink-0 text-ink/70" />
    },
    {
      label: '设置',
      href: '#',
      icon: <IconSettings className="h-5 w-5 shrink-0 text-ink/70" />
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
        'mx-auto flex w-full flex-1 flex-col overflow-hidden border border-indigo/20 bg-paper md:flex-row',
        'h-screen'
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 bg-paper">
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
      <div className="flex flex-1 h-full w-full overflow-hidden">
        {activeView === 'calendar' && (
          <>
            {/* 日历 */}
            <div className="flex-1 min-h-0 bg-paper paper-texture shadow-sm overflow-hidden">
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
                  // 轻松/少工时：柳染 (Willow)
                  // 正常工时：黛蓝 (Indigo)
                  // 加班/高强度：朱砂红 (Cinnabar)
                  const getColorClass = () => {
                    const { totalMinutes, overtimeMinutes } = workInfo

                    if (totalMinutes < standardMinutes - 60) {
                      // 少于标准工时（例如少于1小时以上）：轻松
                      return 'bg-willow/10 text-willow'
                    } else if (overtimeMinutes <= 30) {
                      // 标准工时左右（考虑到一点误差）：正常
                      return 'bg-indigo/10 text-indigo'
                    } else {
                      // 加班：高强度
                      return 'bg-cinnabar/10 text-cinnabar'
                    }
                  }

                  return (
                    <div
                      className={cn(
                        'w-full rounded p-1 text-xs text-center font-medium font-serif-num',
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
              <div className="w-80 h-full bg-paper p-4 relative overflow-y-auto">
                <button
                  onClick={handleClosePanel}
                  className="absolute right-3 top-3 rounded-lg p-1 text-indigo hover:bg-willow/20 hover:text-ink z-10"
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
          <div className="flex-1 min-h-0 bg-paper overflow-hidden">
            <AchievementWall />
          </div>
        )}

        {activeView === 'stats' && (
          <div className="flex-1 min-h-0 bg-paper overflow-y-auto p-4">
            <StatsPage />
          </div>
        )}

        {activeView === 'settings' && (
          <div className="flex-1 min-h-0 bg-paper overflow-y-auto">
            <ApiConfigForm />
          </div>
        )}
      </div>
    </div>
  )
}
