'use client'

import cx from 'classnames'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useProjectContext } from '@/contexts/ProjectContext'
import type { AISuggestion } from '@/lib/ai-schema'

const impactStyle: Record<AISuggestion['impact'], string> = {
	High: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900',
	Medium: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900',
	Low: 'text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800',
}

const categoryStyle =
	'text-[10px] font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-900 px-1.5 py-0.5 rounded'

export const SuggestionContent = () => {
	const { tasks, updateTasks, suggestions } = useProjectContext()

	const getSuggestionId = (index: number) => `ai_s_${index}`

	const handleAccept = (suggestion: AISuggestion, index: number) => {
		const suggestionId = getSuggestionId(index)

		updateTasks([
			...tasks,
			{
				id: suggestionId,
				label: suggestion.title,
				priority: suggestion.impact,
				done: false,
				readonly: true,
				suggestionId,
			},
		])
	}

	const renderAcceptButton = (suggest: AISuggestion, index: number) => {
		const isAdded = tasks.some((task) => task.suggestionId === getSuggestionId(index))

		return (
			<Button onClick={() => handleAccept(suggest, index)} disabled={isAdded} className='gap-1.5'>
				<span className='leading-none'>{isAdded ? '✓' : '↑'}</span>
				{isAdded ? '已採納' : '採納此建議'}
			</Button>
		)
	}

	const renderSuggestionItem = (suggest: AISuggestion, index: number) => {
		const isAdded = tasks.some((task) => task.suggestionId === getSuggestionId(index))
		const cardStyle = isAdded
			? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20'
			: 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:border-neutral-300 dark:hover:border-neutral-700'

		return (
			<div key={index} className={cx('rounded-xl border p-4 transition-all', cardStyle)}>
				<div className='flex items-center gap-2 mb-2 flex-wrap'>
					<span className={categoryStyle}>{suggest.category}</span>
					<Badge variant='outline' className={cx('text-[10px]', impactStyle[suggest.impact])}>
						{suggest.impact} Impact
					</Badge>

					{isAdded && (
						<span className='ml-auto flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400'>
							<span>✓</span> 已加入任務
						</span>
					)}
				</div>

				<p className='text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1'>{suggest.title}</p>
				<p className='text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed mb-3'>{suggest.description}</p>
				{suggest.actionItems?.length > 0 && (
					<div className='mb-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800 px-3 py-2.5 space-y-1.5'>
						<p className='text-[10px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-1.5'>
							執行步驟
						</p>
						{suggest.actionItems.map((step, i) => (
							<p key={i} className='text-sm text-neutral-700 dark:text-neutral-300 flex gap-2 leading-relaxed'>
								<span className='text-neutral-400 shrink-0 font-medium'>{i + 1}.</span>
								{step}
							</p>
						))}
					</div>
				)}
				<div className='flex items-center gap-2'>{renderAcceptButton(suggest, index)}</div>
			</div>
		)
	}

	return (
		<div className='space-y-3'>
			<p className='text-xs text-neutral-400 dark:text-neutral-500'>
				AI 針對你的想法提供以下{' '}
				<span className='text-neutral-700 dark:text-neutral-300 font-medium'>{suggestions.length}</span> 條加強建議
			</p>
			{suggestions.map((suggest, index) => renderSuggestionItem(suggest, index))}
		</div>
	)
}
