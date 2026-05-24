'use client'

import { BarChart2 } from 'lucide-react'
import { useProjectContext } from '@/contexts/ProjectContext'
import { Progress } from '@/components/ui/progress'
import { formatRelativeTime } from '@/lib/dayjs'
import { EmptyHint } from '@/components/EmptyHint'
import { ProjectVersion } from '@/types/project'

export const RightPanel = () => {
	const { submitted, tasks, versions, pinnedVersionId } = useProjectContext()

	const totalTasks = tasks.length
	const completedTasks = tasks.filter((t) => t.done).length
	const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
	const lastUpdated = versions.length > 0 ? formatRelativeTime(versions[versions.length - 1].timestamp) : '—'

	const renderVersionsHistoryReverse = (versions: ProjectVersion[]) => {
		return [...versions].reverse().map((version) => {
			const isPinned = version.id === pinnedVersionId

			return (
				<div
					key={version.id}
					className='flex items-center justify-between py-1.5 border-b border-stone-200/70 dark:border-[#2A2825] last:border-b-0'
				>
					<div className='flex items-center gap-1.5'>
						<span className='text-[12px] font-medium text-stone-700 dark:text-neutral-300'>{version.label}</span>
						{isPinned && (
							<span className='text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#E4F7F9] dark:bg-[#0DAABA]/15 text-[#0A8E9C] dark:text-[#2DD4E4]'>
								釘選
							</span>
						)}
					</div>
					<span className='text-[11px] text-stone-400 dark:text-neutral-600 shrink-0'>
						{formatRelativeTime(version.timestamp)}
					</span>
				</div>
			)
		})
	}

	const maybeRenderProjectStatus = () => {
		if (!submitted) {
			return (
				<EmptyHint
					icon={BarChart2}
					title='尚未產出任何內容'
					description='輸入想法並送出後，將自動產出任務與進度統計。'
				/>
			)
		}

		return (
			<div className='space-y-4'>
				<div>
					<div className='flex items-baseline gap-1.5 mb-1'>
						<span className='text-3xl font-bold text-[#0DAABA] dark:text-[#14C4D5] leading-none'>
							{totalTasks > 0 ? progress : '—'}
						</span>
						{totalTasks > 0 && <span className='text-sm font-medium text-stone-400 dark:text-neutral-500'>%</span>}
					</div>
					<p className='text-[10px] text-stone-400 dark:text-neutral-600 mb-2'>完成進度</p>
					<Progress value={progress} />
				</div>

				<div className='flex justify-between items-center'>
					<span className='text-[11px] text-stone-500 dark:text-neutral-500'>已完成任務</span>
					<span className='text-[11px] font-semibold text-stone-700 dark:text-neutral-300'>
						{totalTasks > 0 ? `${completedTasks} / ${totalTasks}` : '—'}
					</span>
				</div>
				<div className='flex justify-between items-center'>
					<span className='text-[11px] text-stone-500 dark:text-neutral-500'>更新時間</span>
					<span className='text-[11px] font-semibold text-stone-700 dark:text-neutral-300'>{lastUpdated}</span>
				</div>
			</div>
		)
	}

	const maybeRenderVersionHistory = () => {
		if (!submitted || versions.length === 0) return null

		return (
			<>
				<div className='border-t border-stone-200 dark:border-[#2A2825]' />
				<div>
					<p className='text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-neutral-600 mb-2'>
						版本記錄
					</p>
					<div>{renderVersionsHistoryReverse(versions)}</div>
					<p className='text-[11px] text-stone-400 dark:text-neutral-600 mt-2 leading-relaxed'>
						切換與釘選請使用上方工具列的版本選單。
					</p>
				</div>
			</>
		)
	}

	return (
		<aside className='w-56 shrink-0 flex flex-col border-l border-stone-200 dark:border-[#2A2825] bg-[#EDECEA] dark:bg-[#0D0D0C] px-4 py-5 gap-6 overflow-y-auto'>
			<div>
				<p className='text-[10px] font-bold uppercase tracking-widest text-stone-400 dark:text-neutral-600 mb-3'>
					狀態
				</p>
				{maybeRenderProjectStatus()}
			</div>

			{maybeRenderVersionHistory()}

			<div className='border-t border-stone-200 dark:border-[#2A2825]' />
		</aside>
	)
}
