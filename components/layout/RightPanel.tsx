'use client'

import cx from 'classnames'
import { Download, LucideIcon } from 'lucide-react'
import { useProjectContext } from '@/contexts/ProjectContext'
import { Progress } from '@/components/ui/progress'

type Action = {
	label: string
	icon: LucideIcon
	danger?: boolean
}

const moreActions: Action[] = [{ label: '文件匯出', icon: Download, danger: false }]

const formatLastUpdated = (timestamp: number): string => {
	const now = Date.now()
	const diff = now - timestamp
	const minute = 60 * 1000
	const hour = 60 * minute
	const day = 24 * hour
	const d = new Date(timestamp)

	if (diff < minute) return '剛剛'
	if (diff < hour) return `${Math.floor(diff / minute)} 分鐘前`
	if (diff < day) return `${Math.floor(diff / hour)} 小時前`
	if (diff < 2 * day) return '昨天'

	return `${d.getMonth() + 1}/${d.getDate()}`
}

export const RightPanel = () => {
	const { tasks, versions } = useProjectContext()

	const totalTasks = tasks.length
	const completedTasks = tasks.filter((t) => t.done).length
	const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
	const lastUpdated = versions[0]?.timestamp ? formatLastUpdated(versions[0].timestamp) : '—'

	const renderMoreActions = () => {
		return moreActions.map((action) => {
			const Icon = action.icon
			const actionColor = action.danger
				? 'text-red-500 border-red-100 dark:border-red-950 hover:bg-red-50 dark:hover:bg-red-950/40'
				: 'text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900 hover:text-neutral-900 dark:hover:text-neutral-100'

			return (
				<button
					key={action.label}
					onClick={() => console.log(`執行 ${action.label}`)}
					className={cx(
						'w-full mb-4 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-colors text-left',
						actionColor,
					)}
				>
					<Icon className='w-3.5 h-3.5 opacity-70 text-[11px]' />
					{action.label}
				</button>
			)
		})
	}

	return (
		<aside
			className='
			w-56 shrink-0 flex flex-col
			border-l border-neutral-200 dark:border-neutral-800
			bg-white dark:bg-neutral-950
			px-4 py-5 gap-6 overflow-y-auto'
		>
			{/* ── 專案狀態 ── */}
			<div>
				<p className='text-[10px] font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3'>
					狀態
				</p>
				<div className='space-y-3'>
					{/* 進度條 */}
					<div>
						<div className='flex justify-between mb-1.5'>
							<span className='text-[11px] text-neutral-500 dark:text-neutral-400'>完成進度</span>
							<span className='text-[11px] font-medium text-neutral-700 dark:text-neutral-300'>
								{totalTasks > 0 ? `${progress}%` : '—'}
							</span>
						</div>
						<Progress value={progress} />
					</div>
					{/* 任務統計 */}
					<div className='flex justify-between items-center'>
						<span className='text-[11px] text-neutral-500 dark:text-neutral-400'>已完成任務</span>
						<span className='text-[11px] font-medium text-neutral-700 dark:text-neutral-300'>
							{totalTasks > 0 ? `${completedTasks} / ${totalTasks}` : '—'}
						</span>
					</div>
					<div className='flex justify-between items-center'>
						<span className='text-[11px] text-neutral-500 dark:text-neutral-400'>更新時間</span>
						<span className='text-[11px] font-medium text-neutral-700 dark:text-neutral-300'>{lastUpdated}</span>
					</div>
				</div>
			</div>

			<div className='border-t border-neutral-100 dark:border-neutral-800' />

			{/* ── 快速操作 ── */}
			<div>
				<p className='text-[10px] font-medium uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3'>
					快速操作
				</p>
				<div className='space-y-1.5'>{renderMoreActions()}</div>
			</div>
		</aside>
	)
}
