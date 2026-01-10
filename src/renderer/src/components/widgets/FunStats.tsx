// 趣味统计卡片组件
import { useMemo } from 'react'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import { motion } from 'motion/react'
import { IconMoon, IconFlame, IconSunrise, IconTrophy } from '@tabler/icons-react'
import { cn } from '@/lib/utils'
import { useTimeStore, calculateWorkHours } from '@/stores/timeStore'

dayjs.extend(isoWeek)

interface FunStatsProps {
  className?: string
}

interface StatItem {
  icon: React.ReactNode
  label: string
  value: string
  subtext?: string
  color: string
}

export function FunStats({ className }: FunStatsProps) {
  const { entries, settings } = useTimeStore()

  const stats = useMemo(() => {
    const now = dayjs()
    const result: StatItem[] = []

    // 本周记录
    const weekStart = now.startOf('isoWeek')
    const weekEntries = entries.filter((e) => {
      const d = dayjs(e.date)
      return d.isAfter(weekStart.subtract(1, 'day')) && d.isBefore(now.add(1, 'day'))
    })

    // 本月记录
    const monthStart = now.startOf('month')
    const monthEntries = entries.filter((e) => {
      const d = dayjs(e.date)
      return d.isAfter(monthStart.subtract(1, 'day')) && d.isBefore(now.add(1, 'day'))
    })

    // 1. 本周最晚下班日
    if (weekEntries.length > 0) {
      const latestEntry = weekEntries.reduce((latest, entry) =>
        entry.endTime > latest.endTime ? entry : latest
      )
      result.push({
        icon: <IconMoon className="h-4 w-4" />,
        label: '本周最晚下班',
        value: latestEntry.endTime,
        subtext: dayjs(latestEntry.date).format('M月D日 ddd'),
        color: 'text-indigo-500'
      })
    }

    // 2. 本月加班王
    if (monthEntries.length > 0) {
      let maxOvertime = 0
      let maxOvertimeEntry = monthEntries[0]
      for (const entry of monthEntries) {
        const workInfo = calculateWorkHours(entry, settings)
        if (workInfo.overtimeMinutes > maxOvertime) {
          maxOvertime = workInfo.overtimeMinutes
          maxOvertimeEntry = entry
        }
      }
      if (maxOvertime > 0) {
        const hours = Math.floor(maxOvertime / 60)
        const mins = maxOvertime % 60
        result.push({
          icon: <IconFlame className="h-4 w-4" />,
          label: '本月加班王',
          value: hours > 0 ? `${hours}h ${mins}m` : `${mins}m`,
          subtext: dayjs(maxOvertimeEntry.date).format('M月D日'),
          color: 'text-orange-500'
        })
      }
    }

    // 3. 连续早起天数（9点前到岗）
    let earlyStreak = 0
    const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date))
    for (const entry of sortedEntries) {
      if (entry.startTime <= settings.workStartTime) {
        earlyStreak++
      } else {
        break
      }
    }
    if (earlyStreak > 0) {
      result.push({
        icon: <IconSunrise className="h-4 w-4" />,
        label: '连续早起',
        value: `${earlyStreak} 天`,
        subtext: `${settings.workStartTime} 前到岗`,
        color: 'text-amber-500'
      })
    }

    // 4. 今日超越百分比
    const todayEntry = entries.find((e) => e.date === now.format('YYYY-MM-DD'))
    if (todayEntry && entries.length > 1) {
      const todayWork = calculateWorkHours(todayEntry, settings).totalMinutes
      const otherEntries = entries.filter((e) => e.date !== now.format('YYYY-MM-DD'))
      const beatCount = otherEntries.filter(
        (e) => calculateWorkHours(e, settings).totalMinutes < todayWork
      ).length
      const percentage = Math.round((beatCount / otherEntries.length) * 100)
      result.push({
        icon: <IconTrophy className="h-4 w-4" />,
        label: '今日表现',
        value: `超越 ${percentage}%`,
        subtext: '的历史记录',
        color: 'text-emerald-500'
      })
    }

    return result
  }, [entries, settings])

  if (stats.length === 0) {
    return null
  }

  return (
    <div className={cn('grid grid-cols-2 gap-2', className)}>
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800"
        >
          <div className={cn('mb-1 flex items-center gap-1.5', stat.color)}>
            {stat.icon}
            <span className="text-[10px] font-medium">{stat.label}</span>
          </div>
          <p className="text-lg font-bold text-neutral-800 dark:text-neutral-100">{stat.value}</p>
          {stat.subtext && (
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400">{stat.subtext}</p>
          )}
        </motion.div>
      ))}
    </div>
  )
}
