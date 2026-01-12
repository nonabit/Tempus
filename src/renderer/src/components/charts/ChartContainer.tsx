// 图表容器组件 - 统一样式和布局
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ChartContainerProps {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
  action?: ReactNode // 右上角操作区域（如时间切换按钮）
}

export function ChartContainer({
  title,
  subtitle,
  children,
  className,
  action
}: ChartContainerProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800',
        className
      )}
    >
      {/* 标题栏 */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{title}</h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{subtitle}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>

      {/* 图表内容 */}
      <div className="w-full">{children}</div>
    </div>
  )
}
