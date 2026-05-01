'use client'

import { useState } from 'react'

const navItems = [
	{ icon: '⊞', label: '總覽' },
	{ icon: '◎', label: '設定' },
]

interface Project {
	id: number
	name: string
	color: string
}

const defaultProjects: Project[] = [
	{ id: 1, name: 'Fitness App', color: 'bg-violet-500' },
	{ id: 2, name: 'Blog Platform', color: 'bg-sky-500' },
	{ id: 3, name: 'E-Commerce', color: 'bg-emerald-500' },
]

interface SidebarProps {
	activeProject: number
	onProjectChange: (id: number) => void
}

export const Sidebar = ({ activeProject, onProjectChange }: SidebarProps) => {
	const [projects] = useState<Project[]>(defaultProjects)

	const renderNavItems = () => {
		return navItems.map((item) => (
			<button
				key={item.label}
				className='
          flex items-center gap-2.5 px-2.5 py-1.5 rounded-md
          text-sm text-neutral-500 dark:text-neutral-400
          hover:bg-neutral-100 dark:hover:bg-neutral-900
          hover:text-neutral-900 dark:hover:text-neutral-100
          transition-colors text-left
        '
			>
				<span className='text-xs opacity-70'>{item.icon}</span>
				<span>{item.label}</span>
			</button>
		))
	}

	const renderProjectList = () => {
		return projects.map((project) => {
			const activeProjectColor =
				activeProject === project.id
					? 'bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-medium'
					: 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900/60 hover:text-neutral-800 dark:hover:text-neutral-200'
			return (
				<button
					key={project.id}
					onClick={() => onProjectChange(project.id)}
					className={`
            flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-all text-left
            ${activeProjectColor}
          `}
				>
					<span className={`w-1.5 h-1.5 rounded-full ${project.color} shrink-0`} />
					<span className='truncate'>{project.name}</span>
				</button>
			)
		})
	}

	return (
		<aside
			className='
			flex flex-col w-56 shrink-0 h-full
			bg-white dark:bg-neutral-950
			border-r border-neutral-200 dark:border-neutral-800
		'
		>
			{/* ── Logo ── */}
			<div className='flex items-center gap-2.5 px-4 h-14 border-b border-neutral-200 dark:border-neutral-800 shrink-0'>
				<div className='w-6 h-6 rounded-md bg-neutral-900 dark:bg-white flex items-center justify-center shrink-0'>
					<span className='text-white dark:text-neutral-900 text-[11px] font-black tracking-tight'>P</span>
				</div>
				<span className='text-sm font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight'>PRD Studio</span>
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
					<button className='text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors text-base leading-none'>
						+
					</button>
				</div>
				<div className='flex flex-col gap-0.5'>{renderProjectList()}</div>
			</div>

			{/*  使用者資訊  */}
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
	)
}
