'use client'

import { Sun, Moon } from 'lucide-react'

interface TopbarProps {
	projectName: string
	isDark: boolean
	onToggleDark: () => void
}

export const Topbar = ({ projectName, isDark, onToggleDark }: TopbarProps) => {
	const maybeRenderDarkIcon = () => {
		if (isDark) {
			return <Sun className='w-4 h-4' />
		}

		return <Moon className='w-4 h-4' />
	}

	return (
		<header className='flex items-center justify-between px-6 h-14 shrink-0 bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-10 transition-all'>
			{/* 麵包屑 */}
			<div className='flex items-center gap-1.5 text-sm'>
				<span className='text-muted-foreground'>專案列表</span>
				<span className='text-muted-foreground/50'>/</span>
				<span className='text-foreground font-semibold'>{projectName}</span>
			</div>

			<div className='flex items-center gap-2'>
				{/* 黑暗模式切換 */}
				<button
					onClick={onToggleDark}
					aria-label='切換黑暗模式'
					className='
						w-8 h-8 rounded-md flex items-center justify-center
						text-muted-foreground
						hover:bg-accent hover:text-accent-foreground
						border border-border
						transition-all shadow-sm active:scale-95 text-sm'
				>
					{maybeRenderDarkIcon()}
				</button>
			</div>
		</header>
	)
}
