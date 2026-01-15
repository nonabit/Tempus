import { cn } from '@/lib/utils'

interface MeanderButtonProps {
  direction: 'left' | 'right'
  onClick?: () => void
  className?: string
  'aria-label'?: string
}

/**
 * 回纹边框按钮 - 东方美学风格的导航按钮
 * 使用 SVG 绘制传统回纹边框，hover 时从黛蓝变为朱砂红
 */
export function MeanderButton({
  direction,
  onClick,
  className,
  'aria-label': ariaLabel
}: MeanderButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        'h-8 w-8 text-indigo hover:text-cinnabar transition-colors duration-300 cursor-pointer',
        className
      )}
    >
      <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
        {/* 简化回纹边框 - 四角对称的回字形装饰 */}
        {/* 左上角 */}
        <path d="M2 10V2h8M4 8V4h4" stroke="currentColor" strokeWidth="1.5" />
        {/* 右上角 */}
        <path d="M30 10V2h-8M28 8V4h-4" stroke="currentColor" strokeWidth="1.5" />
        {/* 左下角 */}
        <path d="M2 22v8h8M4 24v4h4" stroke="currentColor" strokeWidth="1.5" />
        {/* 右下角 */}
        <path d="M30 22v8h-8M28 24v4h-4" stroke="currentColor" strokeWidth="1.5" />

        {/* 箭头 */}
        {direction === 'left' ? (
          <path
            d="M18 12l-4 4 4 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M14 12l4 4-4 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  )
}
