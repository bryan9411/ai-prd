'use client'

import { useState, useRef, useEffect } from 'react'
import cx from 'classnames'
import { LayoutDashboard, Settings, X, LucideIcon } from 'lucide-react'
import type { ProjectMeta } from '@/types/project'

type NavItem = {
	icon: LucideIcon
	label: string
}

interface SidebarProps {
	projects: ProjectMeta[]
	activeProject: string
	onProjectChange: (id: string) => void
	onAddProject: (name: string) => void
	onDeleteProject: (id: string) => void
}

const navItems: NavItem[] = [
	{ icon: LayoutDashboard, label: '總覽' },
	{ icon: Settings, label: '設定' },
]

export const Sidebar = ({ projects, activeProject, onProjectChange, onAddProject, onDeleteProject }: SidebarProps) => {
	const [isAdding, setIsAdding] = useState(false)
	const [newName, setNewName] = useState('')

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

	const renderNavItems = () => {
		return navItems.map((item) => {
			const Icon = item.icon
			return (
				<button
					key={item.label}
					className='
          flex items-center gap-2.5 px-2.5 py-1.5 rounded-md
          text-sm text-neutral-500 dark:text-neutral-400
          hover:bg-neutral-100 dark:hover:bg-neutral-900
          hover:text-neutral-900 dark:hover:text-neutral-100
          transition-colors text-left'
				>
					<Icon className='w-3.5 h-3.5 opacity-70 text-xs ' />
					<span>{item.label}</span>
				</button>
			)
		})
	}

	const renderProjectList = () => {
		return projects.map((project) => {
			const isActive = activeProject === project.id
			const activeProjectStyle = isActive
				? 'bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium'
				: 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 hover:text-neutral-800 dark:hover:text-neutral-200'

			return (
				<div key={project.id} className='group relative'>
					<button
						onClick={() => onProjectChange(project.id)}
						className={cx(
							'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-all text-left w-full pr-7',
							activeProjectStyle,
						)}
					>
						<span className={cx('w-1.5 h-1.5 rounded-full shrink-0', project.color)} />
						<span className='truncate'>{project.name}</span>
					</button>
					<button
						onClick={(e) => {
							e.stopPropagation()
							onDeleteProject(project.id)
						}}
						className='
							absolute right-1.5 top-1/2 -translate-y-1/2
							opacity-0 group-hover:opacity-100
							p-0.5 rounded text-neutral-400 hover:text-red-500
							transition-all'
						aria-label={`刪除 ${project.name}`}
					>
						<X className='w-3 h-3' />
					</button>
				</div>
			)
		})
	}

	const maybeRenderAddInput = () => {
		const handleKeyDown = (e: React.KeyboardEvent) => {
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
					<input
						ref={inputRef}
						type='text'
						value={newName}
						onChange={(e) => setNewName(e.target.value)}
						onKeyDown={handleKeyDown}
						onBlur={handleConfirmAdd}
						placeholder='專案名稱'
						className='
            flex-1 min-w-0 text-sm bg-transparent outline-none
            border-b border-neutral-300 dark:border-neutral-600
            text-neutral-800 dark:text-neutral-200
          placeholder:text-neutral-400 dark:placeholder:text-neutral-600
            pb-0.5'
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
			<aside
				className='
			  flex flex-col w-56 shrink-0 h-full
			bg-white dark:bg-neutral-950
			  border-r border-neutral-200 dark:border-neutral-800'
			>
				{/* ── Logo ── */}
				<div className='flex items-center gap-2.5 px-4 h-14 border-b border-neutral-200 dark:border-neutral-800 shrink-0'>
					<div className='w-6 h-6 rounded-md bg-neutral-900 dark:bg-white flex items-center justify-center shrink-0'>
						<span className='text-white dark:text-neutral-900 text-[11px] font-black tracking-tight'>P</span>
					</div>
					<span className='text-sm font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight'>
						PRD Studio
					</span>
				</div>

				{/* ── 主導覽 ── */}
				<nav className='flex flex-col gap-0.5 px-2 pt-3'>{renderNavItems()}</nav>
				<div className='mx-3 my-3 border-t border-neutral-100 dark:border-neutral-800' />

				{/* ── PRD 專案列表 ── */}
				<div className='px-2 flex-1 min-h-0 overflow-y-auto'>
					<div className='flex items-center justify-between px-2.5 mb-1.5'>
						<span className='text-[10px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-widest'>
							專案列表
						</span>
						<button
							onClick={handleStartAdd}
							className='text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors text-base leading-none'
						>
							+
						</button>
					</div>
					<div className='flex flex-col gap-0.5'>
						{renderProjectList()}
						{maybeRenderAddInput()}
					</div>
				</div>

				{/* ── 使用者資訊 ── */}
				<div className='px-3 py-3 border-t border-neutral-100 dark:border-neutral-800 shrink-0'>
					<div className='flex items-center gap-2.5'>
						<div className='w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-[10px] font-bold text-neutral-600 dark:text-neutral-300 shrink-0'>
							B
						</div>
						<div className='min-w-0 flex-1'>
							<p className='text-xs font-medium text-neutral-800 dark:text-neutral-200 truncate'>Bryan Wang</p>
						</div>
					</div>
				</div>
			</aside>
		</>
	)
}
