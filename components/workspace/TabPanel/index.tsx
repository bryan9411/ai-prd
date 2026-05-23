'use client'

import cx from 'classnames'
import { useState } from 'react'
import { PrdContent } from '@/components/workspace/TabPanel/PrdContent'
import { TasksContent } from '@/components/workspace/TabPanel/TasksContent'
import { WorkflowContent } from '@/components/workspace/TabPanel/WorkflowContent'
import { PhasesContent } from '@/components/workspace/TabPanel/PhasesContent'
import { SuggestionContent } from '@/components/workspace/TabPanel/SuggestionContent'
import { VersionDropdown } from '@/components/workspace/TabPanel/VersionDropdown'
import { SaveButton } from '@/components/workspace/TabPanel/SaveButton'
import { FileText, CheckSquare, RefreshCw, GitBranch, Lightbulb, type LucideIcon } from 'lucide-react'
import { useProjectContext } from '@/contexts/ProjectContext'

type TabId = 'prd' | 'tasks' | 'workflow' | 'phases' | 'suggestion'

type Tab = {
	id: TabId
	label: string
	icon: LucideIcon
}

const tabs: Tab[] = [
	{ id: 'prd', label: '需求文件', icon: FileText },
	{ id: 'tasks', label: '任務', icon: CheckSquare },
	{ id: 'workflow', label: '工作流程', icon: RefreshCw },
	{ id: 'phases', label: '分階段計畫', icon: GitBranch },
	{ id: 'suggestion', label: 'AI 建議', icon: Lightbulb },
]

const EmptyState = ({ currentTab, error, onDismiss }: { currentTab: Tab; error: string | null; onDismiss: () => void }) => {
	const TabIcon = currentTab.icon

	if (error) {
		return (
			<div className='flex flex-col items-center justify-center py-16 gap-3'>
				<div className='flex items-start gap-2.5 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400 max-w-sm w-full'>
					<span className='shrink-0 mt-0.5'>⚠</span>
					<span className='flex-1 leading-relaxed'>{error}</span>
					<button
						onClick={onDismiss}
						className='shrink-0 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors'
					>
						✕
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className='flex flex-col items-center justify-center py-16 gap-3'>
			<TabIcon className='w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-lg text-neutral-400' />
			<p className='text-sm text-neutral-400 dark:text-neutral-500 text-center max-w-xs leading-relaxed'>
				輸入你的產品想法，將自動產出完整的 PRD、任務清單與工作流程。
			</p>
		</div>
	)
}

export const TabPanel = () => {
	const [activeTab, setActiveTab] = useState<TabId>('prd')

	const { submitted, generateError, clearGenerateError } = useProjectContext()

	const currentTab = tabs.find((t) => t.id === activeTab)!

	const renderTabs = () =>
		tabs.map((tab) => {
			const Icon = tab.icon
			const isActive = activeTab === tab.id
			const activeTabStyle = isActive
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
					<Icon className='w-3.5 h-3.5 opacity-80' />
					<span>{tab.label}</span>
				</button>
			)
		})

	const renderTabContent = () => {
		if (!submitted) return <EmptyState currentTab={currentTab} error={generateError} onDismiss={clearGenerateError} />

		return (
			<>
				{activeTab === 'prd' && <PrdContent />}
				{activeTab === 'tasks' && <TasksContent />}
				{activeTab === 'workflow' && <WorkflowContent />}
				{activeTab === 'phases' && <PhasesContent />}
				{activeTab === 'suggestion' && <SuggestionContent />}
			</>
		)
	}

	return (
		<div className='flex flex-col gap-3 flex-1'>
			<div className='flex items-center gap-2 flex-wrap'>
				<div className='flex gap-1 p-1 rounded-lg bg-neutral-100 dark:bg-neutral-900 w-fit border border-neutral-200 dark:border-neutral-800'>
					{renderTabs()}
				</div>

				<div className='flex items-center gap-2 ml-auto'>
					<VersionDropdown />
					<SaveButton />
				</div>
			</div>

			<div className='rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm flex-1'>
				{renderTabContent()}
			</div>
		</div>
	)
}

