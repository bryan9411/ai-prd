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
import { useProjectStore } from '@/store/useProjectStore'
import { EmptyHint } from '@/components/EmptyHint'

type TabId = 'prd' | 'tasks' | 'workflow' | 'phases' | 'suggestion'

type Tab = {
	id: TabId
	label: string
	icon: LucideIcon
}

interface EmptyStateProps {
	currentTab: Tab
	error: string | null
	onDismiss: () => void
}

const tabs: Tab[] = [
	{ id: 'prd', label: '需求文件', icon: FileText },
	{ id: 'tasks', label: '任務', icon: CheckSquare },
	{ id: 'workflow', label: '工作流程', icon: RefreshCw },
	{ id: 'phases', label: '分階段計畫', icon: GitBranch },
	{ id: 'suggestion', label: 'AI 建議', icon: Lightbulb },
]

const EmptyState = ({ currentTab, error, onDismiss }: EmptyStateProps) => {
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
		<EmptyHint
			icon={currentTab.icon}
			title='尚未產出任何內容'
			description='輸入你的產品想法，將自動產出完整的 PRD、任務清單與工作流程。'
		/>
	)
}

export const TabPanel = () => {
	const [activeTab, setActiveTab] = useState<TabId>('prd')

	const submitted = useProjectStore((state) => state.submitted)
	const generateError = useProjectStore((state) => state.generateError)
	const clearGenerateError = useProjectStore((state) => state.clearGenerateError)

	const currentTab = tabs.find((tab) => tab.id === activeTab)!

	const renderTabs = () =>
		tabs.map((tab) => {
			const Icon = tab.icon
			const isActive = activeTab === tab.id
			const activeTabStyle = isActive
				? 'text-[#0A8E9C] dark:text-[#2DD4E4] font-semibold border-b-[2px] border-[#0DAABA]'
				: 'text-stone-400 dark:text-neutral-500 hover:text-stone-700 dark:hover:text-neutral-300 border-b-[2px] border-transparent'

			return (
				<button
					key={tab.id}
					onClick={() => setActiveTab(tab.id)}
					className={cx('flex items-center gap-1.5 px-3 h-11.5 text-sm transition-all', activeTabStyle)}
				>
					<Icon className='w-3.5 h-3.5 opacity-70' />
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
		<div className='rounded-xl bg-white dark:bg-[#1C1B18] border border-stone-200 dark:border-[#2A2825] shadow-sm'>
			<div className='flex items-center border-b border-stone-200 dark:border-[#252220] px-2'>
				<div className='flex items-stretch'>{renderTabs()}</div>
				<div className='flex items-center gap-2 ml-auto'>
					<VersionDropdown />
					<SaveButton />
				</div>
			</div>
			<div className='p-5'>{renderTabContent()}</div>
		</div>
	)
}
