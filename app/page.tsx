'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { HeroBanner } from './components/HeroBanner'
import { IdeaInput } from './components/IdeaInput'
import { TabPanel } from './components/TabPanel'
import { RightPanel } from './components/RightPanel'

const projects = [
	{ id: 1, name: 'Fitness App', color: 'bg-violet-500' },
	{ id: 2, name: 'Blog Platform', color: 'bg-sky-500' },
	{ id: 3, name: 'E-Commerce', color: 'bg-emerald-500' },
]

export default function Home() {
	const [isDark, setIsDark] = useState(false)
	const [activeProjectId, setActiveProjectId] = useState(1)
	const [idea, setIdea] = useState('')
	const [submitted, setSubmitted] = useState(false)
	const [loading, setLoading] = useState(false)

	const currentProject = projects.find((project) => project.id === activeProjectId)!

	// 切換專案時重置內容
	const handleProjectChange = (id: number) => {
		setActiveProjectId(id)
		setIdea('')
		setSubmitted(false)
	}

	// 產生 PRD + task + workflow + prompt
	const handleGenerate = () => {
		if (!idea.trim()) return
		setLoading(true)
		setTimeout(() => {
			setLoading(false)
			setSubmitted(true)
		}, 1200)
	}

	const handleToggleDarkModel = () => {
		setIsDark(!isDark)
	}

	useEffect(() => {
		const html = document.documentElement

		if (isDark) {
			html.classList.add('dark')
		} else {
			html.classList.remove('dark')
		}
	}, [isDark])

	return (
		<div className='flex h-screen overflow-hidden bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100'>
			<Sidebar activeProject={activeProjectId} onProjectChange={handleProjectChange} />
			<main className='flex flex-col flex-1 overflow-hidden'>
				<Topbar projectName={currentProject.name} isDark={isDark} onToggleDark={handleToggleDarkModel} />
				<div className='flex flex-1 overflow-hidden'>
					<div className='flex flex-col flex-1 overflow-y-auto px-6 py-6 gap-5'>
						<HeroBanner projectName={currentProject.name} />
						<IdeaInput idea={idea} loading={loading} onChange={setIdea} onGenerate={handleGenerate} />
						<TabPanel submitted={submitted} idea={idea} />
					</div>
					<RightPanel />
				</div>
			</main>
		</div>
	)
}
