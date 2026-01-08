'use client'
import { useState } from 'react'
import dayjs from 'dayjs'
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar'
import {
  IconChartBar,
  IconCalendar,
  IconSettings,
  IconTrophy,
  IconX
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { CalendarView } from '@/components/calendar-view'
import { TimeEntryForm } from '@/components/timesheet'
import { useTimeStore, calculateWorkHours } from '@/stores/timeStore'

export default function SidebarDemo() {
  const links = [
    {
      label: '日历',
      href: '#',
      icon: (
        <IconCalendar className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      )
    },
    {
      label: '成就',
      href: '#',
      icon: (
        <IconTrophy className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      )
    },
    {
      label: '统计',
      href: '#',
      icon: (
        <IconChartBar className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      )
    },
    {
      label: '设置',
      href: '#',
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      )
    }
  ]

  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(new Date())

  // 工时相关状态
  const { getEntryByDate, settings } = useTimeStore()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // 点击日历格子
  const handleCellClick = (cellDate: Date) => {
    setSelectedDate(dayjs(cellDate).format('YYYY-MM-DD'))
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
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>

      {/* 主内容区：日历 + 详情面板 */}
      <div className="flex flex-1 h-full overflow-hidden p-2 md:p-6 gap-4">
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

              // 有记录时显示工时
              const workInfo = calculateWorkHours(entry, settings)
              return (
                <div
                  className={cn(
                    'w-full rounded p-1 text-xs text-center',
                    workInfo.isOvertime
                      ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
                      : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                  )}
                >
                  {workInfo.formattedTotal}
                </div>
              )
            }}
          />
        </div>

        {/* 右侧详情面板 - 点击日期后显示 */}
        {selectedDate && (
          <div className="w-80 shrink-0 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-hidden p-4 relative">
            <button
              onClick={handleClosePanel}
              className="absolute right-3 top-3 rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-700"
            >
              <IconX className="h-4 w-4" />
            </button>
            <TimeEntryForm
              date={selectedDate}
              existingEntry={selectedEntry}
              onSuccess={handleClosePanel}
            />
          </div>
        )}
      </div>
    </div>
  )
}
