import cx from 'classnames'
import { useProjectContext } from '@/contexts/ProjectContext'

interface HeroBannerProps {
	projectName: string
}
 
export const HeroBanner = ({ projectName }: HeroBannerProps) => {
	const { tasks } = useProjectContext()

	const isDoneBadge = tasks.length > 0 && tasks.every(task => task.done)
	const isNotStartYetBadge = tasks.length === 0

	const renderBradgeText = () => {
		if (isNotStartYetBadge) {
			return (
				<span className='text-[10px] px-1.5 py-0.5 rounded font-semibold border bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900'>
					尚未開始
				</span>
			)
		}

		const badgeText = isDoneBadge ? '已完成' : '進行中'
		const badgeColor = isDoneBadge
			? 'bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900'
			: 'bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-900'

		return (
			<span className={cx('text-[10px] px-1.5 py-0.5 rounded font-semibold border', badgeColor)}>
				{badgeText}
			</span>
		)
	}

  return (
		<div
			className='
			rounded-xl border border-neutral-200 dark:border-neutral-800
			bg-neutral-50 dark:bg-neutral-900/40
			px-6 py-5'
		>
			<div className='flex items-start justify-between gap-4 flex-wrap'>
				<div>
					<div className='flex items-center gap-2 mb-1'>
						<h1 className='text-base font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight'>
							{projectName}
						</h1>
						{renderBradgeText()}
					</div>
					<p className='text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-sm'>
						輸入你的產品想法，將自動產出完整的 PRD、任務清單與工作流程。
					</p>
				</div>
			</div>
		</div>
	)
}
