'use client'

import { BarChart2 } from 'lucide-react'
import { useProjectStore } from '@/store/useProjectStore'
import { Progress } from '@/components/ui/progress'
import { formatRelativeTime } from '@/lib/dayjs'
import { EmptyHint } from '@/components/EmptyHint'
import { ProjectVersion } from '@/types/project'

export const RightPanel = () => {
	const submitted = useProjectStore((state) => state.submitted)
	const tasks = useProjectStore((state) => state.tasks)
	const versions = useProjectStore((state) => state.versions)
	const pinnedVersionId = useProjectStore((state) => state.pinnedVersionId)

	const totalTasks = tasks.length
	const completedTasks = tasks.filter((t) => t.done).length
	const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
	const lastUpdated = versions.length > 0 ? formatRelativeTime(versions[versions.length - 1].timestamp) : '—'

	const renderVersionsHistoryReverse = (versions: ProjectVersion[]) => {
		return [...versions].reverse().map((version, index) => {
			const isPinned = version.id === pinnedVersionId

			return (
				<div
					key={version.id}
					className='flex items-center justify-between py-1.5 border-b border-border last:border-b-0 animate-in fade-in slide-in-from-right-4 duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]'
					style={{ animationDelay: `${index * 40}ms`, animationFillMode: 'both' }}
				>
					<div className='flex items-center gap-1.5'>
						<span className='text-[12px] font-medium text-foreground'>{version.label}</span>
						{isPinned && (
							<span className='text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary/10 text-primary'>
								釘選
							</span>
						)}
					</div>
					<span className='text-[11px] text-muted-foreground shrink-0'>
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
			<div className='space-y-4 animate-in fade-in zoom-in-95 duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]'>
				<div>
					<div className='flex items-baseline gap-1.5 mb-1'>
						<span className='text-4xl font-bold text-primary leading-none tracking-tighter'>
							{totalTasks > 0 ? progress : '—'}
						</span>
						{totalTasks > 0 && <span className='text-sm font-medium text-muted-foreground/80'>%</span>}
					</div>
					<p className='text-[10px] text-muted-foreground mb-2'>完成進度</p>
					<Progress value={progress} />
				</div>

				<div className='flex justify-between items-center'>
					<span className='text-[11px] text-muted-foreground'>已完成任務</span>
					<span className='text-[11px] font-semibold text-foreground'>
						{totalTasks > 0 ? `${completedTasks} / ${totalTasks}` : '—'}
					</span>
				</div>
				<div className='flex justify-between items-center'>
					<span className='text-[11px] text-muted-foreground'>更新時間</span>
					<span className='text-[11px] font-semibold text-foreground'>{lastUpdated}</span>
				</div>
			</div>
		)
	}

	const maybeRenderVersionHistory = () => {
		if (!submitted || versions.length === 0) return null

		return (
			<>
				<div className='border-t border-border' />
				<div>
					<p className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2'>
						版本記錄
					</p>
					<div>{renderVersionsHistoryReverse(versions)}</div>
					<p className='text-[11px] text-muted-foreground mt-2 leading-relaxed'>
						切換與釘選請使用上方工具列的版本選單。
					</p>
				</div>
			</>
		)
	}

	return (
		<aside className='w-56 shrink-0 flex flex-col border-l border-sidebar-border bg-sidebar px-4 py-5 gap-6 overflow-y-auto animate-in fade-in slide-in-from-right-2 duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]'>
			<div>
				<p className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3'>
					狀態
				</p>
				{maybeRenderProjectStatus()}
			</div>

			{maybeRenderVersionHistory()}

			<div className='border-t border-border' />
		</aside>
	)
}
