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
		<header className='flex items-center justify-between px-6 h-14 shrink-0 bg-background border-b border-stone-200/80 dark:border-[#252220]'>
			{/* 麵包屑 */}
			<div className='flex items-center gap-1.5 text-sm'>
				<span className='text-stone-400 dark:text-neutral-600'>專案列表</span>
				<span className='text-stone-300 dark:text-neutral-700'>/</span>
				<span className='text-stone-800 dark:text-neutral-200 font-semibold'>{projectName}</span>
			</div>

			<div className='flex items-center gap-2'>
				{/* 黑暗模式切換 */}
				<button
					onClick={onToggleDark}
					aria-label='切換黑暗模式'
					className='
						w-8 h-8 rounded-md flex items-center justify-center
						text-stone-500 dark:text-neutral-400
						hover:bg-stone-200/60 dark:hover:bg-[#252220]
						border border-stone-200 dark:border-[#2A2825]
						transition-colors text-sm'
				>
					{maybeRenderDarkIcon()}
				</button>
			</div>
		</header>
	)
}
