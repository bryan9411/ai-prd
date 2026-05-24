'use client'

import cx from 'classnames'
import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { LayoutDashboard, Settings, X, Plus, LucideIcon } from 'lucide-react'
import { useConfirm } from '@/hooks/useConfirm'
import { useSettings } from '@/hooks/useSettings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SettingsDialog } from '@/components/SettingsDialog'
import type { ProjectMeta } from '@/types/project'

type NavItem = {
	icon: LucideIcon
	label: string
	onClick?: () => void
}

interface SidebarProps {
	projects: ProjectMeta[]
	activeProject: string
	onProjectChange: (id: string) => void
	onAddProject: (name: string) => void
	onDeleteProject: (id: string) => void
}

export const Sidebar = ({ projects, activeProject, onProjectChange, onAddProject, onDeleteProject }: SidebarProps) => {
	const [isSettingsOpen, setIsSettingsOpen] = useState(false)
	const [isAdding, setIsAdding] = useState(false)
	const [newName, setNewName] = useState('')

	const { confirm, ConfirmModal } = useConfirm()
	const { apiKey, saveApiKey, clearApiKey } = useSettings()

	const navItems: NavItem[] = [
		{ icon: LayoutDashboard, label: '總覽' },
		{ icon: Settings, label: '設定', onClick: () => setIsSettingsOpen(true) },
	]

	const inputRef = useRef<HTMLInputElement>(null)

	const handleStartAdd = () => {
		setNewName('')
		setIsAdding(true)
	}

	const handleConfirmAdd = () => {
		if (newName.trim()) {
			onAddProject(newName.trim())
		}
		setIsAdding(false)
		setNewName('')
	}

	const handleCancelAdd = () => {
		setIsAdding(false)
		setNewName('')
	}

	const handleDeleteProject = async (id: string, name: string) => {
		const confirmed = await confirm({
			title: '刪除專案？',
			description: `「${name}」將被永久刪除，此操作無法復原。`,
			confirmLabel: '刪除',
			cancelLabel: '取消',
			variant: 'destructive',
		})

		if (confirmed) {
			onDeleteProject(id)
		}
	}

	const renderNavItems = () => {
		return navItems.map((item) => {
			const Icon = item.icon

			return (
				<Button
					key={item.label}
					variant='ghost'
					onClick={item.onClick}
					className='w-full justify-start gap-2.5 px-2.5 h-8 cursor-pointer text-sm text-stone-500 dark:text-neutral-500 hover:text-stone-900 dark:hover:text-neutral-100 hover:bg-stone-200/60 dark:hover:bg-white/5'
				>
					<Icon className='w-3.5 h-3.5 opacity-70' />
					<span>{item.label}</span>
				</Button>
			)
		})
	}

	const renderProjectList = () => {
		return projects.map((project) => {
			const isActive = activeProject === project.id
			const activeProjectStyle = isActive
				? 'bg-[#0DAABA]/10 dark:bg-[#0DAABA]/10 text-[#0A8E9C] dark:text-[#2DD4E4] font-semibold'
				: 'text-stone-500 dark:text-neutral-500 hover:bg-stone-200/60 dark:hover:bg-white/5 hover:text-stone-800 dark:hover:text-neutral-200'

			return (
				<div
					key={project.id}
					className={cx(
						'group relative border-l-2 transition-colors',
						isActive ? 'border-[#0DAABA]' : 'border-transparent',
					)}
				>
					<Button
						variant='ghost'
						onClick={() => onProjectChange(project.id)}
						className={cx(
							'flex items-center gap-2.5 px-2.5 h-auto py-1.5 rounded-md text-sm transition-all justify-start w-full pr-7',
							activeProjectStyle,
						)}
					>
						<span className={cx('w-1.5 h-1.5 rounded-full shrink-0', project.color)} />
						<span className='truncate'>{project.name}</span>
					</Button>
					<Button
						variant='ghost'
						size='icon'
						onClick={() => handleDeleteProject(project.id, project.name)}
						className='absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 hover:bg-transparent'
						aria-label={`刪除 ${project.name}`}
					>
						<X className='w-3 h-3' />
					</Button>
				</div>
			)
		})
	}

	const maybeRenderAddInput = () => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Enter') {
				handleConfirmAdd()
			}

			if (e.key === 'Escape') {
				handleCancelAdd()
			}
		}

		if (isAdding) {
			return (
				<div className='flex items-center gap-1.5 px-2 py-1'>
					<Input
						ref={inputRef}
						type='text'
						value={newName}
						onChange={(e) => setNewName(e.target.value)}
						onKeyDown={handleKeyDown}
						onBlur={handleConfirmAdd}
						placeholder='專案名稱'
						className='h-7 text-sm bg-transparent border-0 border-b border-stone-300 dark:border-neutral-600 rounded-none shadow-none focus-visible:ring-0 px-0 placeholder:text-stone-400'
					/>
				</div>
			)
		}
	}

	useEffect(() => {
		if (isAdding) {
			inputRef.current?.focus()
		}
	}, [isAdding])

	return (
		<>
			<ConfirmModal />
			<SettingsDialog
				open={isSettingsOpen}
				apiKey={apiKey}
				onClose={() => setIsSettingsOpen(false)}
				onSave={saveApiKey}
				onClear={clearApiKey}
			/>
			<aside
				className='
			  flex flex-col w-56 shrink-0 h-full
				bg-[#EDECEA] dark:bg-[#0D0D0C]
			  border-r border-stone-200 dark:border-[#2A2825]'
			>
				{/* ── Logo ── */}
				<div className='flex items-center gap-2.5 px-4 h-14 border-b border-stone-200 dark:border-[#2A2825] shrink-0'>
					<div className='w-6 h-6 rounded-md bg-[#0DAABA] flex items-center justify-center shrink-0'>
						<span className='text-white text-[11px] font-black tracking-tight'>P</span>
					</div>
					<span className='text-sm font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight'>
						PRD 產生器
					</span>
				</div>

				{/* ── 主導覽 ── */}
				<nav className='flex flex-col gap-0.5 px-2 pt-3'>{renderNavItems()}</nav>
				<div className='mx-3 my-3 border-t border-stone-200 dark:border-[#2A2825]' />

				{/* ── PRD 專案列表 ── */}
				<div className='px-2 flex-1 min-h-0 overflow-y-auto'>
					<div className='flex items-center justify-between px-2.5 mb-1.5'>
						<span className='text-[10px] font-bold text-stone-400 dark:text-neutral-600 uppercase tracking-widest'>
							專案列表
						</span>
						<Button
							variant='ghost'
							size='icon'
							onClick={handleStartAdd}
							className='w-5 h-5 text-stone-400 hover:text-stone-700 dark:hover:text-neutral-200'
						>
							<Plus className='w-3.5 h-3.5' />
						</Button>
					</div>
					<div className='flex flex-col gap-0.5'>
						{renderProjectList()}
						{maybeRenderAddInput()}
					</div>
				</div>

				{/* ── 使用者資訊 ── */}
				<div className='px-3 py-3 border-t border-stone-200 dark:border-[#2A2825] shrink-0'>
					<div className='flex items-center gap-2.5'>
						<div className='w-6 h-6 rounded-full bg-[#0DAABA]/15 dark:bg-[#0DAABA]/20 flex items-center justify-center text-[10px] font-bold text-[#0A8E9C] dark:text-[#2DD4E4] shrink-0'>
							B
						</div>
						<div className='min-w-0 flex-1'>
							<p className='text-xs font-medium text-stone-700 dark:text-neutral-300 truncate'>Bryan Wang</p>
						</div>
					</div>
				</div>
			</aside>
		</>
	)
}
