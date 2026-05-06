'use client'

import cx from 'classnames'
import { useState } from 'react'
import { PrdContent } from '@/components/workspace/TabPanel/PrdContent'
import { TasksContent } from '@/components/workspace/TabPanel/TasksContent'
import { WorkflowContent } from '@/components/workspace/TabPanel/WorkflowContent'
import { PromptContent } from '@/components/workspace/TabPanel/PromptContent'
import { SuggestionContent } from '@/components/workspace/TabPanel/SuggestionContent'
import {
	FileText,
	CheckSquare,
	RefreshCw,
	Terminal,
	Lightbulb,
	LucideIcon,
	Save,
	Check,
	ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProjectContext } from '@/contexts/ProjectContext'

type TabId = 'prd' | 'tasks' | 'workflow' | 'prompt' | 'suggestion'

type Tab = {
	id: TabId
	label: string
	icon: LucideIcon
}

const tabs: Tab[] = [
	{ id: 'prd', label: '需求文件', icon: FileText },
	{ id: 'tasks', label: '任務', icon: CheckSquare },
	{ id: 'workflow', label: '工作流程', icon: RefreshCw },
	{ id: 'prompt', label: '提示詞', icon: Terminal },
	{ id: 'suggestion', label: 'AI 建議', icon: Lightbulb },
]

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

export const TabPanel = () => {
	const { submitted, idea, isDirty, versions, activeVersionId, isSaveSuccess, saveVersion, loadVersion } =
		useProjectContext()

	const [activeTab, setActiveTab] = useState<TabId>('prd')
	const [versionMenuOpen, setVersionMenuOpen] = useState(false)

	const currentTab = tabs.find((t) => t.id === activeTab)!

	const handleSave = () => {
		saveVersion()
	}

	const handleLoadVersion = (versionId: string) => {
		if (isDirty) {
			const confirmed = window.confirm('你有尚未儲存的變更，確定要切換版本並放棄這些變更嗎？')
			if (!confirmed) return
		}
		loadVersion(versionId)
		setVersionMenuOpen(false)
	}

	const activeVersion = versions.find((v) => v.id === activeVersionId)

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

	const maybeRenderVersionDropdown = () => {
		if (!submitted || versions.length === 0) return null

		return (
			<div className='relative'>
				<button
					onClick={() => setVersionMenuOpen((prev) => !prev)}
					className='flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all
						text-neutral-500 dark:text-neutral-400
						hover:bg-neutral-100 dark:hover:bg-neutral-900
						border border-neutral-200 dark:border-neutral-800'
				>
					<span>{activeVersion?.label ?? '版本'}</span>
					<ChevronDown className='w-3 h-3 opacity-70' />
				</button>

				{versionMenuOpen && (
					<>
						<div className='fixed inset-0 z-10' onClick={() => setVersionMenuOpen(false)} />
						<div
							className='absolute right-0 top-full mt-1 z-20 min-w-35
							bg-white dark:bg-neutral-900
							border border-neutral-200 dark:border-neutral-800
							rounded-lg shadow-lg py-1 overflow-hidden'
						>
							{versions.map((v) => (
								<button
									key={v.id}
									onClick={() => handleLoadVersion(v.id)}
									className={cx(
										'w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between gap-2',
										v.id === activeVersionId
											? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-medium'
											: 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800',
									)}
								>
									<span>{v.label}</span>
									<span className='text-neutral-400 dark:text-neutral-600'>
										{new Date(v.timestamp).toLocaleDateString('zh-TW', {
											month: 'numeric',
											day: 'numeric',
											hour: '2-digit',
											minute: '2-digit',
										})}
									</span>
								</button>
							))}
						</div>
					</>
				)}
			</div>
		)
	}

	const maybeRenderSaveButton = () => {
		if (!submitted) return null

		const canSave = isDirty && !isSaveSuccess

		return (
			<Button
				size='sm'
				variant={isSaveSuccess ? 'ghost' : isDirty ? 'default' : 'outline'}
				onClick={handleSave}
				disabled={!canSave}
				className={cx(
					'h-7 text-xs gap-1.5 transition-all',
					isSaveSuccess
						? 'text-emerald-600 dark:text-emerald-400 pointer-events-none'
						: !isDirty
							? 'text-neutral-400 dark:text-neutral-600'
							: '',
				)}
			>
				{isSaveSuccess ? (
					<>
						<Check className='w-3 h-3' />
						<span>已儲存</span>
					</>
				) : (
					<>
						<Save className='w-3 h-3' />
						<span>儲存</span>
						{isDirty && <span className='w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0' />}
					</>
				)}
			</Button>
		)
	}

	const maybeRenderTabContent = () => {
		if (!submitted) {
			return <EmptyState currentTab={currentTab} />
		}

		return (
			<>
				{activeTab === 'prd' && <PrdContent idea={idea} />}
				{activeTab === 'tasks' && <TasksContent />}
				{activeTab === 'workflow' && <WorkflowContent />}
				{activeTab === 'prompt' && <PromptContent idea={idea} />}
				{activeTab === 'suggestion' && <SuggestionContent idea={idea} />}
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
					{maybeRenderVersionDropdown()}
					{maybeRenderSaveButton()}
				</div>
			</div>

			<div className='rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-5 shadow-sm flex-1'>
				{maybeRenderTabContent()}
			</div>
		</div>
	)
}
