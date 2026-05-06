'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import {
	loadProjectData,
	saveProjectData,
	buildVersion,
	pushVersion,
	type Task,
	type Step,
	type ProjectVersion,
} from '@/lib/project-store'

const MOCK_TASKS: Task[] = [
	{ id: 't1', label: '設計 UI/UX 原型', priority: 'High', done: false },
	{ id: 't2', label: '建立後端 API 架構', priority: 'High', done: false },
	{ id: 't3', label: '實作用戶認證系統', priority: 'Medium', done: false },
	{ id: 't4', label: '整合 AI 課表推薦', priority: 'Medium', done: false },
	{ id: 't5', label: '撰寫測試計劃', priority: 'Low', done: false },
]

const MOCK_STEPS: Step[] = [
	{ id: 'w1', label: '需求分析' },
	{ id: 'w2', label: '原型設計' },
	{ id: 'w3', label: '技術架構' },
	{ id: 'w4', label: '開發實作' },
	{ id: 'w5', label: '測試上線' },
]

export interface ProjectContextValue {
	projectId: number
	submitted: boolean
	loading: boolean
	idea: string
	tasks: Task[]
	steps: Step[]
	isDirty: boolean // 是否有未儲存的變更
	versions: ProjectVersion[]
	activeVersionId: string | null
	isSaveSuccess: boolean
	setIdea: (idea: string) => void
	generate: () => void
	saveVersion: () => void
	loadVersion: (versionId: string) => void
	updateTasks: (tasks: Task[]) => void
	updateSteps: (steps: Step[]) => void
	removeProject: () => void
}

interface ProjectProviderProps {
	projectId: number
	children: ReactNode
}

interface ProjectState {
	submitted: boolean
	idea: string
	tasks: Task[]
	steps: Step[]
	isDirty: boolean
	versions: ProjectVersion[]
	activeVersionId: string | null
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

const emptyProjectState: ProjectState = {
	submitted: false,
	idea: '',
	tasks: [],
	steps: [],
	isDirty: false,
	versions: [],
	activeVersionId: null,
}

export const useProjectContext = (): ProjectContextValue => {
	const ctx = useContext(ProjectContext)
	if (!ctx) {
		throw new Error('useProjectContext must be used within ProjectProvider')
	}
	return ctx
}

const onLoadProjectData = (projectId: number) => {
	const data = loadProjectData(projectId)

	if (data && data.versions.length > 0) {
		const latest = data.versions[0]

		return {
			submitted: true,
			idea: latest.idea,
			tasks: latest.tasks,
			steps: latest.steps,
			isDirty: false,
			versions: data.versions,
			activeVersionId: latest.id,
		}
	}

	return emptyProjectState
}

export const ProjectProvider = ({ projectId, children }: ProjectProviderProps) => {
	const [projectState, setProjectState] = useState<ProjectState>(() => onLoadProjectData(projectId))
	const [loading, setLoading] = useState(false)
	const [isSaveSuccess, setIsSaveSuccess] = useState(false)

	/** 開始生成（使用假資料） */
	const generate = useCallback(() => {
		if (!projectState.idea.trim() || loading || projectState.submitted) return

		setLoading(true)
		setTimeout(() => {
			setProjectState((prev) => ({
				...prev,
				tasks: MOCK_TASKS,
				steps: MOCK_STEPS,
				submitted: true,
				isDirty: true,
			}))

			setLoading(false)
		}, 1200)
	}, [projectState.idea, projectState.submitted, loading])

	const saveVersion = useCallback(() => {
		const { submitted, isDirty, idea, tasks, steps } = projectState
		if (!submitted || !isDirty) return

		const data = loadProjectData(projectId) ?? { versions: [] }
		const newVersion = buildVersion(idea, tasks, steps, data.versions.length)
		const nextVersions = pushVersion(data.versions, newVersion)

		saveProjectData(projectId, { versions: nextVersions })
		setProjectState((prev) => ({
			...prev,
			versions: nextVersions,
			activeVersionId: newVersion.id,
			isDirty: false,
		}))

		setIsSaveSuccess(true)
		setTimeout(() => setIsSaveSuccess(false), 2000)
	}, [projectState, projectId])

	const loadVersion = useCallback(
		(versionId: string) => {
			const version = projectState.versions.find((v) => v.id === versionId)
			if (!version) return
			setProjectState((prev) => ({
				...prev,
				idea: version.idea,
				tasks: version.tasks,
				steps: version.steps,
				activeVersionId: versionId,
				isDirty: false,
			}))
		},
		[projectState.versions],
	)

	const removeProject = useCallback(() => {
		localStorage.removeItem(`project-${projectId}`)
		setProjectState(emptyProjectState)
		setLoading(false)
	}, [projectId])

	const setIdea = useCallback((idea: string) => {
		setProjectState((prev) => {
			return { ...prev, idea }
		})
	}, [])

	/** Tasks 更新，更新後尚未儲存自動標記 isDirty */
	const updateTasks = useCallback((nextTasks: Task[]) => {
		setProjectState((prev) => {
			return { ...prev, tasks: nextTasks, isDirty: true }
		})
	}, [])

	/** Steps 更新，更新後尚未儲存自動標記 isDirty */
	const updateSteps = useCallback((nextSteps: Step[]) => {
		setProjectState((prev) => {
			return { ...prev, steps: nextSteps, isDirty: true }
		})
	}, [])

	const value: ProjectContextValue = {
		projectId,
		...projectState,
		loading,
		isSaveSuccess,
		setIdea,
		generate,
		saveVersion,
		loadVersion,
		updateTasks,
		updateSteps,
		removeProject,
	}

	return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}
