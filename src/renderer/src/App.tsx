import SidebarDemo from './components/sidebar-demo'
import { AchievementNotification } from './components/achievement'
import { useAchievementSync } from './hooks/useAchievementSync'

function App(): React.JSX.Element {
  // 启用成就同步检测
  useAchievementSync()

  return (
    <>
      <SidebarDemo />
      <AchievementNotification />
    </>
  )
}

export default App
