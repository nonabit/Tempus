// 节气提醒全屏卡片
// 在节气当天 App 启动时显示

import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'
import type { SolarTermData } from '@/data/solarTerms'

interface SolarTermCardProps {
  data: SolarTermData
  onDismiss: () => void
}

export function SolarTermCard({ data, onDismiss }: SolarTermCardProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        onClick={onDismiss}
        className={cn(
          'fixed inset-0 z-[100] cursor-pointer',
          'flex flex-col items-center justify-center',
          'bg-gradient-to-br',
          data.gradient
        )}
      >
        {/* 节气名称 */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-7xl font-bold text-white/90 mb-8 tracking-widest"
          style={{ textShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
        >
          {data.name}
        </motion.h1>

        {/* 传统诗词 */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-2xl text-white/80 mb-6 font-light"
        >
          「{data.poem}」
        </motion.p>

        {/* 现代解读 */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-lg text-white/70 max-w-md text-center leading-relaxed"
        >
          {data.interpretation}
        </motion.p>

        {/* 点击提示 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-12 text-white/50 text-sm"
        >
          点击任意处进入
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
