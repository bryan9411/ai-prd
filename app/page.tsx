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
import { fetchProjects, createProject, deleteProject } from '@/lib/supabase/db'
import { pickNextColor } from '@/lib/project-utils'
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

	const handleAddProject = async (name: string) => {
		if (!name.trim()) return

		try {
			const color = pickNextColor(projects)
			const newProject = await createProject(name.trim(), color)
			const next = [...projects, newProject]

			setProjects(next)
			setActiveProjectId(newProject.id)
		} catch (err) {
			console.error('建立專案失敗：', err)
		}
	}

	const handleDeleteProject = async (id: string) => {
		try {
			await deleteProject(id)
			const next = projects.filter((p) => p.id !== id)

			setProjects(next)

			if (id === activeProjectId) {
				setActiveProjectId(next.length > 0 ? next[0].id : '')
			}
		} catch (err) {
			console.error('刪除專案失敗：', err)
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
		const loadInitialData = async () => {
			try {
				const stored = await fetchProjects()
				startTransition(() => {
					setProjects(stored)
					setActiveProjectId(stored.length > 0 ? stored[0].id : '')
				})
			} catch (err) {
				console.error('載入專案清單失敗：', err)
			}
		}
		loadInitialData()
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
