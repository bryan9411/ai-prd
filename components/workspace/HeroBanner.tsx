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
				<span className='inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-destructive/10 text-destructive'>
					<span className='w-1.5 h-1.5 rounded-full bg-current inline-block' />
					尚未開始
				</span>
			)
		}

		const badgeText = isDoneBadge ? '已完成' : '進行中'
		const badgeColor = isDoneBadge
			? 'bg-green-500/10 text-green-600 dark:text-green-400'
			: 'bg-primary/10 text-primary'

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
		<div className='py-1 animate-in fade-in slide-in-from-top-2 duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]'>
			<div className='flex items-start justify-between gap-4 flex-wrap'>
				<div>
					<div className='flex items-center gap-2 mb-2'>{renderBradgeText()}</div>
					<h1 className='text-2xl font-bold text-foreground tracking-tighter mb-2'>{projectName}</h1>
					<p className='text-sm text-muted-foreground leading-relaxed max-w-sm'>
						輸入你的產品想法，將自動產出完整的 PRD、任務清單與工作流程。
					</p>
				</div>
			</div>
		</div>
	)
}
