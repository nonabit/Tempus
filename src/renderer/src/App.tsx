import { useState, useEffect } from 'react'
import { Solar } from 'lunar-typescript'
import SidebarDemo from './components/sidebar-demo'
import { AchievementNotification } from './components/achievement'
import { SolarTermCard } from './components/solarterm'
import { useAchievementSync } from './hooks/useAchievementSync'
import { useAppInit } from './hooks/useAppInit'
import { SOLAR_TERMS, SOLAR_TERM_SHOWN_PREFIX } from './data/solarTerms'

function App(): React.JSX.Element {
  // 应用初始化（从 SQLite 加载数据）
  const isReady = useAppInit()

  // 启用成就同步检测
  useAchievementSync()

  // 节气卡片状态
  const [solarTermToShow, setSolarTermToShow] = useState<string | null>(null)

  // 检测今日节气
  useEffect(() => {
    const today = new Date()
    const solar = Solar.fromYmd(today.getFullYear(), today.getMonth() + 1, today.getDate())
    const jieQi = solar.getLunar().getJieQi()

    if (jieQi && SOLAR_TERMS[jieQi]) {
      const shownKey = `${SOLAR_TERM_SHOWN_PREFIX}_${today.getFullYear()}_${jieQi}`
      if (!localStorage.getItem(shownKey)) {
        setSolarTermToShow(jieQi)
      }
    }
  }, [])

  // 关闭节气卡片
  const handleDismissSolarTerm = () => {
    if (solarTermToShow) {
      const today = new Date()
      const shownKey = `${SOLAR_TERM_SHOWN_PREFIX}_${today.getFullYear()}_${solarTermToShow}`
      localStorage.setItem(shownKey, 'true')
      setSolarTermToShow(null)
    }
  }

  if (!isReady) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-neutral-900">
        <div className="text-neutral-400">加载中...</div>
      </div>
    )
  }

  return (
    <>
      <SidebarDemo />
      <AchievementNotification />
      {solarTermToShow && SOLAR_TERMS[solarTermToShow] && (
        <SolarTermCard data={SOLAR_TERMS[solarTermToShow]} onDismiss={handleDismissSolarTerm} />
      )}
    </>
  )
}

export default App
