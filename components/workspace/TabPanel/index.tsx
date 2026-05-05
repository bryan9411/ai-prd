'use client'

import cx from 'classnames'
import { useState } from 'react'
import { PrdContent } from '@/components/workspace/TabPanel/PrdContent'
import { TasksContent } from '@/components/workspace/TabPanel/TasksContent'
import { WorkflowContent } from '@/components/workspace/TabPanel/WorkflowContent'
import { PromptContent } from '@/components/workspace/TabPanel/PromptContent'
import { SuggestionContent } from '@/components/workspace/TabPanel/SuggestionContent'
import { FileText, CheckSquare, RefreshCw, Terminal, Lightbulb, LucideIcon } from 'lucide-react'

type TabId = 'prd' | 'tasks' | 'workflow' | 'prompt' | 'suggestion'

type Tab = {
	id: TabId
	label: string
	icon: LucideIcon
}

interface TabPanelProps {
	submitted: boolean
	idea: string
}

const EmptyState = ({ currentTab }: { currentTab: Tab }) => {
	const TabIcon = currentTab.icon

	return (
		<div className='flex flex-col items-center justify-center py-16 gap-3'>
			<TabIcon className='w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-lg text-neutral-400' />
			<p className='text-sm text-neutral-400 dark:text-neutral-500 text-center max-w-xs leading-relaxed'>
				輸入你的產品想法，將自動產出完整的 PRD、任務清單與工作流程。
			</p>
		</div>
	)
}

const tabs: Tab[] = [
	{ id: 'prd', label: '需求文件', icon: FileText },
	{ id: 'tasks', label: '任務', icon: CheckSquare },
	{ id: 'workflow', label: '工作流程', icon: RefreshCw },
	{ id: 'prompt', label: '提示詞', icon: Terminal },
	{ id: 'suggestion', label: 'AI 建議', icon: Lightbulb },
]

export const TabPanel = ({ submitted, idea }: TabPanelProps) => {
	const [activeTab, setActiveTab] = useState<TabId>('prd')

	// 採納 AI 建議後，用 enrichedIdea 覆蓋原始 idea 重新渲染各分頁內容
	const [enrichedIdea, setEnrichedIdea] = useState<string | null>(null)
	// 採納建議後顯示重新生成的提示
	const [regenerated, setRegenerated] = useState(false)

	const currentTab = tabs.find((current) => current.id === activeTab)!
	const activeIdea = enrichedIdea ?? idea

	const handleAcceptSuggestion = (newIdea: string) => {
		setEnrichedIdea(newIdea)
		setRegenerated(true)
		setActiveTab('prd')
	}

	const renderTabs = () => {
		return tabs.map((tab) => {
			const Icon = tab.icon
			const activeTabStyle =
				activeTab === tab.id
					? 'bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 shadow-sm border border-neutral-200 dark:border-neutral-800'
					: 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'

			return (
				<button
					key={tab.id}
					onClick={() => setActiveTab(tab.id)}
					className={cx(
						'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all',
						activeTabStyle,
					)}
				>
					<Icon className='w-3.5 h-3.5 ext-xs opacity-80' />
					<span>{tab.label}</span>
				</button>
			)
		})
	}

	const maybeRenderTabContent = () => {
		if (!submitted) {
			return <EmptyState currentTab={currentTab} />
		}

		return (
			<>
				{activeTab === 'prd' && <PrdContent idea={activeIdea} />}
				{activeTab === 'tasks' && <TasksContent />}
				{activeTab === 'workflow' && <WorkflowContent />}
				{activeTab === 'prompt' && <PromptContent idea={activeIdea} />}
				{activeTab === 'suggestion' && <SuggestionContent idea={idea} onAccept={handleAcceptSuggestion} />}
			</>
		)
	}

	return (
		<div className='flex flex-col gap-3 flex-1'>
			<div className='flex gap-1 p-1 rounded-lg bg-neutral-100 dark:bg-neutral-900 w-fit border border-neutral-200 dark:border-neutral-800'>
				{renderTabs()}
			</div>

			{regenerated && (
				<div className='flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-400'>
					<span className='w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0' />
					<span>已根據 AI 建議重新產生所有文件</span>
					<span className='ml-1 text-emerald-500/70 italic truncate'>{enrichedIdea}</span>
				</div>
			)}

			<div className='rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm flex-1'>
				{maybeRenderTabContent()}
			</div>
		</div>
	)
}
