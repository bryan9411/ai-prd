import cx from 'classnames'
import type { LucideIcon } from 'lucide-react'

interface EmptyHintProps {
	icon: LucideIcon
	title: string
	description?: string
	compact?: boolean
}

export const EmptyHint = ({ icon: Icon, title, description, compact = false }: EmptyHintProps) => {
	return (
		<div className={cx('flex flex-col items-center justify-center gap-3', compact ? 'py-8 px-3' : 'py-16')}>
			<div className='w-10 h-10 rounded-xl bg-stone-100 dark:bg-[#1C1B18] border border-stone-200 dark:border-[#2A2825] flex items-center justify-center shrink-0'>
				<Icon className='w-4 h-4 text-stone-400 dark:text-neutral-500' />
			</div>
			<div className='flex flex-col items-center gap-1'>
				<p
					className={cx(
						'font-medium text-stone-600 dark:text-neutral-400 text-center',
						compact ? 'text-xs' : 'text-sm',
					)}
				>
					{title}
				</p>
				{description && (
					<p
						className={cx(
							'text-stone-400 dark:text-neutral-500 text-center leading-relaxed',
							compact ? 'text-[11px] max-w-40' : 'text-sm max-w-xs',
						)}
					>
						{description}
					</p>
				)}
			</div>
		</div>
	)
}
