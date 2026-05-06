'use client'

import cx from 'classnames'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useProjectContext } from '@/contexts/ProjectContext'

interface Suggestion {
	id: string
	category: string
	title: string
	description: string
	impact: 'High' | 'Medium' | 'Low'
}

interface SuggestionContentProps {
	idea: string
}

const generateSuggestions = (idea: string): Suggestion[] => [
	{
		id: 's1',
		category: '核心功能',
		title: '加入社群挑戰機制',
		description: `在「${idea}」中加入好友挑戰、排行榜功能，可大幅提升用戶黏著度與口碑傳播，參考 Duolingo 的每日連續挑戰設計。`,
		impact: 'High',
	},
	{
		id: 's2',
		category: '變現策略',
		title: '訂閱制 + 單次付費雙軌並行',
		description: '免費版提供基礎訓練記錄，Pro 版解鎖 AI 課表生成與詳細數據分析，建議月費 $9.9 / 年費 $79，可提升 LTV。',
		impact: 'High',
	},
	{
		id: 's3',
		category: 'UX 設計',
		title: '加入 Onboarding 健身目標設定',
		description: '首次使用時引導用戶設定目標（增肌／減脂／維持），AI 根據目標個人化初始課表，降低初期流失率。',
		impact: 'Medium',
	},
	{
		id: 's4',
		category: '技術架構',
		title: '離線模式支援',
		description: '健身房常有網路不穩定的情況，建議實作 PWA 離線緩存，讓用戶在無網路狀態下也能記錄訓練，同步時再上傳。',
		impact: 'Medium',
	},
	{
		id: 's5',
		category: '成長策略',
		title: '與健身器材品牌合作',
		description: '整合藍牙穿戴裝置（Garmin、Apple Watch）自動帶入運動數據，可作為差異化賣點並開拓 B2B 通路。',
		impact: 'Low',
	},
]

const impactStyle: Record<Suggestion['impact'], string> = {
	High: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900',
	Medium: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900',
	Low: 'text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800',
}

const categoryStyle =
	'text-[10px] font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-900 px-1.5 py-0.5 rounded'

export const SuggestionContent = ({ idea }: SuggestionContentProps) => {
	const { tasks, updateTasks } = useProjectContext()

	const suggestions = generateSuggestions(idea)

	const handleAccept = (suggestion: Suggestion) => {
		updateTasks([
			...tasks,
			{
				id: `suggestion-${suggestion.id}`,
				label: suggestion.title,
				priority: 'Medium',
				done: false,
				readonly: true,
				suggestionId: suggestion.id,
			},
		])
	}

	const renderAcceptButton = (suggest: Suggestion) => {
		const isAdded = tasks.some((task) => task.suggestionId === suggest.id)

		return (
			<Button onClick={() => handleAccept(suggest)} disabled={isAdded} className='gap-1.5'>
				<span className='leading-none'>{isAdded ? '✓' : '↑'}</span>
				{isAdded ? '已採納' : '採納此建議'}
			</Button>
		)
	}

	const renderActions = (suggest: Suggestion) => {
		return <div className='flex items-center gap-2'>{renderAcceptButton(suggest)}</div>
	}

	const renderSuggestionItem = (suggest: Suggestion) => {
		const isAdded = tasks.some((task) => task.suggestionId === suggest.id)
		const cardStyle = isAdded
			? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20'
			: 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 hover:border-neutral-300 dark:hover:border-neutral-700'

		return (
			<div key={suggest.id} className={cx('rounded-xl border p-4 transition-all', cardStyle)}>
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
				{renderActions(suggest)}
			</div>
		)
	}

	return (
		<div className='space-y-3'>
			<p className='text-xs text-neutral-400 dark:text-neutral-500'>
				AI 針對你的想法提供以下{' '}
				<span className='text-neutral-700 dark:text-neutral-300 font-medium'>{suggestions.length}</span> 條加強建議
			</p>
			{suggestions.map((suggest) => renderSuggestionItem(suggest))}
		</div>
	)
}
