'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { HeroBanner } from '@/components/workspace/HeroBanner'
import { IdeaInput } from '@/components/workspace/IdeaInput'
import { TabPanel } from '@/components/workspace/TabPanel'
import { RightPanel } from '@/components/layout/RightPanel'
import { ProjectProvider } from '@/contexts/ProjectContext'
import { loadProjects, saveProjects, defaultProjects } from '@/store/project-store'
import { pickNextColor, generateProjectId } from '@/lib/project-utils'
import type { ProjectMeta } from '@/types/project'

export default function Home() {
	const [isDark, setIsDark] = useState(false)
	const [projects, setProjects] = useState<ProjectMeta[]>(defaultProjects)
	const [activeProjectId, setActiveProjectId] = useState<string>(defaultProjects[0]?.id)

	const currentProject = projects.find((p) => p.id === activeProjectId) ?? projects[0]

	const handleToggleDarkModel = () => setIsDark((prev) => !prev)

	const handleAddProject = (name: string) => {
		if (!name.trim()) return

		const newProject: ProjectMeta = {
			id: generateProjectId(),
			name: name.trim(),
			color: pickNextColor(projects),
		}

		const next = [...projects, newProject]
		setProjects(next)
		saveProjects(next)
		setActiveProjectId(newProject.id)
	}

	const handleDeleteProject = (id: string) => {
		localStorage.removeItem(`prd_project_${id}`)
		const next = projects.filter((p) => p.id !== id)
		saveProjects(next)
		setProjects(next)

		// 若刪除的是目前選中的專案，切換到第一個
		if (id === activeProjectId && next.length > 0) {
			setActiveProjectId(next[0].id)
		}
	}

	useEffect(() => {
		const stored = loadProjects()

		setProjects(stored)
		setActiveProjectId((prev) => (stored.find((p) => p.id === prev) ? prev : stored[0]?.id))
	}, [])

	useEffect(() => {
		const html = document.documentElement

		if (isDark) {
			html.classList.add('dark')
		} else {
			html.classList.remove('dark')
		}
	}, [isDark])

	return (
		<ProjectProvider key={activeProjectId} projectId={activeProjectId}>
			<div className='flex h-screen overflow-hidden bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100'>
				<Sidebar
					projects={projects}
					activeProject={activeProjectId}
					onProjectChange={setActiveProjectId}
					onAddProject={handleAddProject}
					onDeleteProject={handleDeleteProject}
				/>
				<main className='flex flex-col flex-1 overflow-hidden'>
					<Topbar projectName={currentProject?.name ?? ''} isDark={isDark} onToggleDark={handleToggleDarkModel} />
					<div className='flex flex-1 overflow-hidden'>
						<div className='flex flex-col flex-1 overflow-y-auto px-6 py-6 gap-5'>
							<HeroBanner projectName={currentProject?.name ?? ''} />
							<IdeaInput />
							<TabPanel />
						</div>
						<RightPanel />
					</div>
				</main>
			</div>
		</ProjectProvider>
	)
}
