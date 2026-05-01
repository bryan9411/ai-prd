'use client'

import { useState } from 'react'
import { PrdContent } from '@/app/components/TabPanel/PrdContent'
import { TasksContent } from '@/app/components/TabPanel/TasksContent'
import { WorkflowContent } from '@/app/components/TabPanel/WorkflowContent'
import { PromptContent } from '@/app/components/TabPanel/PromptContent'

interface TabPanelProps {
	submitted: boolean
	idea: string
}

const EmptyState = ({ tabIcon }: { tabIcon: string }) => {
	return (
		<div className='flex flex-col items-center justify-center py-16 gap-3'>
			<div className='w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-lg text-neutral-400'>
				{tabIcon}
			</div>
			<p className='text-sm text-neutral-400 dark:text-neutral-500 text-center max-w-xs leading-relaxed'>
				輸入你的產品想法，將自動產出完整的 PRD、任務清單與工作流程。
			</p>
		</div>
	)
}

const tabs = [
	{ id: 'prd', label: '需求文件', icon: '▤' },
	{ id: 'tasks', label: '任務', icon: '✓' },
	{ id: 'workflow', label: '工作流程', icon: '⟳' },
	{ id: 'prompt', label: '提示詞', icon: '⌥' },
]

export const TabPanel = ({ submitted, idea }: TabPanelProps) => {
	const [activeTab, setActiveTab] = useState('prd')

	const currentTab = tabs.find((current) => current.id === activeTab)!

	return (
		<div className='flex flex-col gap-3 flex-1'>
			{/* Tab 列 */}
			<div className='flex gap-1 p-1 rounded-lg bg-neutral-100 dark:bg-neutral-900 w-fit border border-neutral-200 dark:border-neutral-800'>
				{tabs.map((tab) => (
					<button
						key={tab.id}
						onClick={() => setActiveTab(tab.id)}
						className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all
              ${
								activeTab === tab.id
									? 'bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 shadow-sm border border-neutral-200 dark:border-neutral-800'
									: 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
							}
            `}
					>
						<span className='text-xs opacity-80'>{tab.icon}</span>
						<span>{tab.label}</span>
					</button>
				))}
			</div>

			<div className='rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm flex-1'>
				{!submitted ? (
					<EmptyState tabIcon={currentTab.icon} />
				) : (
					<>
						{activeTab === 'prd' && <PrdContent idea={idea} />}
						{activeTab === 'tasks' && <TasksContent />}
						{activeTab === 'workflow' && <WorkflowContent />}
						{activeTab === 'prompt' && <PromptContent idea={idea} />}
					</>
				)}
			</div>
		</div>
	)
}
