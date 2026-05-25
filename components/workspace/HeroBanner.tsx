import cx from 'classnames'
import { useProjectStore } from '@/store/useProjectStore'

interface HeroBannerProps {
	projectName: string
}

export const HeroBanner = ({ projectName }: HeroBannerProps) => {
	const tasks = useProjectStore((state) => state.tasks)

	const isDoneBadge = tasks.length > 0 && tasks.every((task) => task.done)
	const isNotStartYetBadge = tasks.length === 0

	const renderBradgeText = () => {
		if (isNotStartYetBadge) {
			return (
				<span className='inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400'>
					<span className='w-1.5 h-1.5 rounded-full bg-current inline-block' />
					尚未開始
				</span>
			)
		}

		const badgeText = isDoneBadge ? '已完成' : '進行中'
		const badgeColor = isDoneBadge
			? 'bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400'
			: 'bg-[#E4F7F9] dark:bg-[#0DAABA]/15 text-[#0A8E9C] dark:text-[#2DD4E4]'

		return (
			<span
				className={cx('inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold', badgeColor)}
			>
				<span className='w-1.5 h-1.5 rounded-full bg-current inline-block' />
				{badgeText}
			</span>
		)
	}

	return (
		<div className='py-1'>
			<div className='flex items-start justify-between gap-4 flex-wrap'>
				<div>
					<div className='flex items-center gap-2 mb-2'>{renderBradgeText()}</div>
					<h1 className='text-2xl font-bold text-stone-900 dark:text-neutral-100 tracking-tight mb-2'>{projectName}</h1>
					<p className='text-sm text-stone-500 dark:text-neutral-400 leading-relaxed max-w-sm'>
						輸入你的產品想法，將自動產出完整的 PRD、任務清單與工作流程。
					</p>
				</div>
			</div>
		</div>
	)
}
