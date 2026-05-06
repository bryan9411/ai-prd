'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { HeroBanner } from '@/components/workspace/HeroBanner'
import { IdeaInput } from '@/components/workspace/IdeaInput'
import { TabPanel } from '@/components/workspace/TabPanel'
import { RightPanel } from '@/components/layout/RightPanel'
import { ProjectProvider } from '@/contexts/ProjectContext'

const projects = [
	{ id: 1, name: 'Fitness App', color: 'bg-violet-500' },
	{ id: 2, name: 'Blog Platform', color: 'bg-sky-500' },
	{ id: 3, name: 'E-Commerce', color: 'bg-emerald-500' },
]

export default function Home() {
	const [isDark, setIsDark] = useState(false)
	const [activeProjectId, setActiveProjectId] = useState(1)

	const currentProject = projects.find((p) => p.id === activeProjectId)!

	const handleToggleDarkModel = () => setIsDark((prev) => !prev)

	useEffect(() => {
		const html = document.documentElement
		if (isDark) {
			html.classList.add('dark')
		} else {
			html.classList.remove('dark')
		}
	}, [isDark])

	return (
		// key={activeProjectId} 讓切換專案時重建 Provider，自動重置所有狀態
		<ProjectProvider key={activeProjectId} projectId={activeProjectId}>
			<div className='flex h-screen overflow-hidden bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100'>
				<Sidebar activeProject={activeProjectId} onProjectChange={setActiveProjectId} />
				<main className='flex flex-col flex-1 overflow-hidden'>
					<Topbar
						projectName={currentProject.name}
						isDark={isDark}
						onToggleDark={handleToggleDarkModel}
					/>
					<div className='flex flex-1 overflow-hidden'>
						<div className='flex flex-col flex-1 overflow-y-auto px-6 py-6 gap-5'>
							<HeroBanner projectName={currentProject.name} />
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
