// 成就图标组件
// 根据图标名称渲染对应的 Tabler 图标

import {
  IconTrophy,
  IconMedal,
  IconCrown,
  IconFlame,
  IconDiamond,
  IconSun,
  IconMoonStars,
  IconSwords,
  IconGift,
  IconBolt,
  IconRocket,
  IconCalendarCheck,
  IconShieldCheck,
  IconSunrise,
  IconStar
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'

// 图标映射表
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  trophy: IconTrophy,
  medal: IconMedal,
  crown: IconCrown,
  flame: IconFlame,
  fire: IconFlame,
  diamond: IconDiamond,
  sun: IconSun,
  sunrise: IconSunrise,
  'moon-stars': IconMoonStars,
  swords: IconSwords,
  gift: IconGift,
  bolt: IconBolt,
  rocket: IconRocket,
  'calendar-check': IconCalendarCheck,
  'clock-check': IconCalendarCheck,
  'shield-check': IconShieldCheck,
  star: IconStar
}

interface AchievementIconProps {
  icon: string
  className?: string
}

export function AchievementIcon({ icon, className }: AchievementIconProps) {
  const IconComponent = ICON_MAP[icon] || IconStar

  return <IconComponent className={cn('w-6 h-6', className)} />
}
