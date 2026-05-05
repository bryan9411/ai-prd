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
		<header
			className='
			flex items-center justify-between
			px-6 h-14 shrink-0
			bg-white dark:bg-neutral-950
			border-b border-neutral-200 dark:border-neutral-800
		'
		>
			{/* 麵包屑 */}
			<div className='flex items-center gap-1.5 text-sm'>
				<span className='text-neutral-400 dark:text-neutral-500'>專案列表</span>
				<span className='text-neutral-300 dark:text-neutral-700'>/</span>
				<span className='text-neutral-800 dark:text-neutral-200 font-medium'>{projectName}</span>
			</div>

			<div className='flex items-center gap-2'>
				{/* 黑暗模式切換 */}
				<button
					onClick={onToggleDark}
					aria-label='Toggle dark mode'
					className='
						w-8 h-8 rounded-md flex items-center justify-center
						text-neutral-500 dark:text-neutral-400
						hover:bg-neutral-100 dark:hover:bg-neutral-900
						border border-neutral-200 dark:border-neutral-800
						transition-colors text-sm'
				>
					{maybeRenderDarkIcon()}
				</button>
			</div>
		</header>
	)
}
