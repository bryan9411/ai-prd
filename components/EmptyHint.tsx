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
		<div className={cx('flex flex-col items-center justify-center gap-3 animate-in fade-in zoom-in-75 slide-in-from-bottom-2 duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]', compact ? 'py-8 px-3' : 'py-16')}>
			<div className='w-10 h-10 rounded-xl bg-gradient-to-tr from-primary/5 to-primary/15 border border-primary/20 shadow-sm shadow-primary/10 flex items-center justify-center shrink-0'>
				<Icon className='w-4 h-4 text-primary/70' />
			</div>
			<div className='flex flex-col items-center gap-1'>
				<p
					className={cx(
						'font-medium text-foreground text-center tracking-tight',
						compact ? 'text-xs' : 'text-sm',
					)}
				>
					{title}
				</p>
				{description && (
					<p
						className={cx(
							'text-muted-foreground text-center leading-relaxed',
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
