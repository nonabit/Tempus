import SidebarDemo from './components/sidebar-demo'
import { AchievementNotification } from './components/achievement'
import { useAchievementSync } from './hooks/useAchievementSync'
import { useAppInit } from './hooks/useAppInit'

function App(): React.JSX.Element {
  // 应用初始化（从 SQLite 加载数据）
  const isReady = useAppInit()

  // 启用成就同步检测
  useAchievementSync()

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
    </>
  )
}

export default App
