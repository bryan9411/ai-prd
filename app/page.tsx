'use client'

import { useState, useEffect, startTransition } from 'react'
import { Layers } from 'lucide-react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { HeroBanner } from '@/components/workspace/HeroBanner'
import { IdeaInput } from '@/components/workspace/IdeaInput'
import { TabPanel } from '@/components/workspace/TabPanel'
import { RightPanel } from '@/components/layout/RightPanel'
import { EmptyHint } from '@/components/EmptyHint'
import { SimilarProjectDialog } from '@/components/SimilarProjectDialog'
import { useProjectStore } from '@/store/useProjectStore'
import { loadProjects, saveProjects, deleteProjectData } from '@/lib/project-storage'
import { pickNextColor, generateProjectId } from '@/lib/project-utils'
import type { ProjectMeta } from '@/types/project'

export const dynamic = 'force-dynamic'

export default function Home() {
	const [isDark, setIsDark] = useState(false)
	const [projects, setProjects] = useState<ProjectMeta[]>([])
	const [activeProjectId, setActiveProjectId] = useState<string>('')

	const similarProject = useProjectStore((state) => state.similarProject)
	const loadSimilarProject = useProjectStore((state) => state.loadSimilarProject)
	const forceGenerate = useProjectStore((state) => state.forceGenerate)

	const currentProject = projects.find((project) => project.id === activeProjectId) ?? projects[0]

	const handleToggleDarkModel = () => setIsDark((prev) => !prev)

	const handleAddProject = (name: string) => {
		if (!name.trim()) return

		const current = loadProjects()
		const newProject: ProjectMeta = {
			id: generateProjectId(),
			name: name.trim(),
			color: pickNextColor(current),
		}

		const next = [...current, newProject]

		setProjects(next)
		saveProjects(next)
		setActiveProjectId(newProject.id)
	}

	const handleDeleteProject = (id: string) => {
		deleteProjectData(id)
		const current = loadProjects()
		const next = current.filter((p) => p.id !== id)

		saveProjects(next)
		setProjects(next)

		if (id === activeProjectId) {
			setActiveProjectId(next.length > 0 ? next[0].id : '')
		}
	}

	const maybeRenderProjectInfo = () => {
		if (projects.length === 0) {
			return (
				<div className='flex flex-col flex-1 items-center justify-center'>
					<EmptyHint icon={Layers} title='尚未建立任何專案' description='從左側新增第一個專案，開始建立 PRD' />
				</div>
			)
		}

		return (
			<div className='flex flex-col flex-1 overflow-y-auto px-6 py-6 gap-5'>
				<HeroBanner projectName={currentProject?.name ?? ''} />
				<IdeaInput />
				<TabPanel />
			</div>
		)
	}

	useEffect(() => {
		useProjectStore.getState().initProject(activeProjectId)
	}, [activeProjectId])

	useEffect(() => {
		const stored = loadProjects()

		startTransition(() => {
			setProjects(stored)
			setActiveProjectId(stored.length > 0 ? stored[0].id : '')
		})
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
		<div className='flex h-screen overflow-hidden bg-background text-foreground'>
			<Sidebar
				projects={projects}
				activeProject={activeProjectId}
				onProjectChange={setActiveProjectId}
				onAddProject={handleAddProject}
				onDeleteProject={handleDeleteProject}
			/>
			<main className='flex flex-col flex-1 overflow-hidden'>
				<Topbar projectName={currentProject?.name ?? ''} isDark={isDark} onToggleDark={handleToggleDarkModel} />
				{maybeRenderProjectInfo()}
			</main>
			<RightPanel />
			<SimilarProjectDialog
				open={!!similarProject}
				projectName={similarProject?.meta.name ?? ''}
				onUseCached={() => loadSimilarProject()}
				onRegenerate={forceGenerate}
			/>
		</div>
	)
}
