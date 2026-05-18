'use client'

import { createContext, useContext, useState, useCallback, useEffect, startTransition, type ReactNode } from 'react'
import { loadProjectData, saveProjectData } from '@/store/project-store'
import { buildVersion, pushVersion, overwriteVersion } from '@/lib/project-utils'
import type { Task, Step, ProjectVersion } from '@/types/project'

export interface ProjectContextValue {
	submitted: boolean
	projectId: string
	loading: boolean
	idea: string
	tasks: Task[]
	steps: Step[]
	isDirty: boolean
	versions: ProjectVersion[]
	activeVersionId: string | null
	pinnedVersionId: string | null
	isSaveSuccess: boolean
	setIdea: (idea: string) => void
	generate: () => void
	saveVersion: () => void
	saveOverwrite: (versionId: string) => void // 覆蓋指定版本的內容（原始版本不能覆蓋）
	loadVersion: (versionId: string) => void
	pinVersion: (versionId: string) => void
	updateTasks: (tasks: Task[]) => void
	updateSteps: (steps: Step[]) => void
	removeProject: () => void
}

interface ProjectProviderProps {
	projectId: string
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
	pinnedVersionId: string | null
}

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

const ProjectContext = createContext<ProjectContextValue | null>(null)

const emptyProjectState: ProjectState = {
	submitted: false,
	idea: '',
	tasks: [],
	steps: [],
	isDirty: false,
	versions: [],
	activeVersionId: null,
	pinnedVersionId: null,
}

export const useProjectContext = (): ProjectContextValue => {
	const ctx = useContext(ProjectContext)
	if (!ctx) {
		throw new Error('useProjectContext 需要被 ProjectProvider 包裹')
	}

	return ctx
}

const onLoadProjectData = (projectId: string): ProjectState => {
	const data = loadProjectData(projectId)

	if (data && data.versions.length > 0) {
		let versions = data.versions

		const hasOrigin = versions.some((v) => v.isOrigin)
		
    if (!hasOrigin) {
      const oldestVersion = versions[versions.length - 1]

      versions = versions.map((version) => {
        if (version.id !== oldestVersion.id) return version

        return {
          ...version,
          isOrigin: true,
          label: '原始版本',
        }
      })

      saveProjectData(projectId, { ...data, versions })
    }

		const pinnedId = data.pinnedVersionId ?? null
		const activeVersion =
			(pinnedId ? versions.find((v) => v.id === pinnedId) : null) ??
			versions[versions.length - 1]

		return {
			submitted: true,
			idea: activeVersion.idea,
			tasks: activeVersion.tasks,
			steps: activeVersion.steps,
			isDirty: false,
			versions,
			activeVersionId: activeVersion.id,
			pinnedVersionId: pinnedId,
		}
	}

	return emptyProjectState
}

export const ProjectProvider = ({ projectId, children }: ProjectProviderProps) => {
	const [projectState, setProjectState] = useState<ProjectState>(emptyProjectState)
	const [loading, setLoading] = useState(false)
	const [isSaveSuccess, setIsSaveSuccess] = useState(false)

	// 暫使用假資料，生成完成後自動儲存為「原始版本 origin」
	const generate = useCallback(() => {
		if (!projectState.idea.trim() || loading || projectState.submitted) return

		setLoading(true)
		setTimeout(() => {
			const originVersion = buildVersion(projectState.idea, MOCK_TASKS, MOCK_STEPS, true)
			const data = loadProjectData(projectId) ?? { versions: [] }
			const nextVersions = pushVersion(data.versions, originVersion)

			saveProjectData(projectId, { versions: nextVersions, pinnedVersionId: originVersion.id })

			setProjectState((prev) => ({
				...prev,
				tasks: MOCK_TASKS,
				steps: MOCK_STEPS,
				submitted: true,
				isDirty: false,
				versions: nextVersions,
				activeVersionId: originVersion.id,
				pinnedVersionId: originVersion.id,
			}))

			setLoading(false)
		}, 1200)
	}, [projectState.idea, projectState.submitted, loading, projectId])

	const saveVersion = useCallback(() => {
		const { submitted, isDirty, idea, tasks, steps } = projectState

		if (!submitted || !isDirty) return

		const data = loadProjectData(projectId) ?? { versions: [] }
		const newVersion = buildVersion(idea, tasks, steps, false)
		const nextVersions = pushVersion(data.versions, newVersion)

		saveProjectData(projectId, { versions: nextVersions, pinnedVersionId: data.pinnedVersionId })
		
		setProjectState((prev) => {
			return {
				...prev,
				versions: nextVersions,
				activeVersionId: newVersion.id,
				isDirty: false,
			}
		})

		setIsSaveSuccess(true)
		setTimeout(() => setIsSaveSuccess(false), 2000)
	}, [projectState, projectId])

	const saveOverwrite = useCallback((versionId: string) => {
    const { submitted, isDirty, idea, tasks, steps, versions } = projectState

    if (!submitted || !isDirty) return

    // origin 版本不允許覆蓋
    const target = versions.find((v) => v.id === versionId)
    if (!target || target.isOrigin) return

    const data = loadProjectData(projectId) ?? { versions: [] }
    const nextVersions = overwriteVersion(data.versions, versionId, idea, tasks, steps)

    saveProjectData(projectId, { versions: nextVersions, pinnedVersionId: data.pinnedVersionId })
    setProjectState((prev) => ({
      ...prev,
      versions: nextVersions,
      activeVersionId: versionId,
      isDirty: false,
    }))

    setIsSaveSuccess(true)
    setTimeout(() => setIsSaveSuccess(false), 2000)
  }, [projectState, projectId])

	const pinVersion = useCallback((versionId: string) => {
    const version = projectState.versions.find((v) => v.id === versionId)
    if (!version) return

    const data = loadProjectData(projectId)
    if (data) {
      saveProjectData(projectId, { ...data, pinnedVersionId: versionId })
    }

    setProjectState((prev) => ({
      ...prev,
      idea: version.idea,
      tasks: version.tasks,
      steps: version.steps,
      activeVersionId: versionId,
      pinnedVersionId: versionId,
      isDirty: false,
    }))
  }, [projectState.versions, projectId])

	const loadVersion = useCallback((versionId: string) => {
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
  }, [projectState.versions])

	const removeProject = useCallback(() => {
		localStorage.removeItem(`prd_project_${projectId}`)

		setProjectState(emptyProjectState)
		setLoading(false)
	}, [projectId])

	const setIdea = useCallback((idea: string) => {
		setProjectState((prev) => {
			return { ...prev, idea }
		})
	}, [])

	const updateTasks = useCallback((nextTasks: Task[]) => {
		setProjectState((prev) => {
			return { ...prev, tasks: nextTasks, isDirty: true }
		})
	}, [])

	const updateSteps = useCallback((nextSteps: Step[]) => {
		setProjectState((prev) => {
			return { ...prev, steps: nextSteps, isDirty: true }
		})
	}, [])

	useEffect(() => {
		startTransition(() => {
			setProjectState(onLoadProjectData(projectId))
		})
	}, [projectId])

	const value: ProjectContextValue = {
		projectId,
		...projectState,
		loading,
		isSaveSuccess,
		setIdea,
		generate,
		saveVersion,
		saveOverwrite,
		loadVersion,
		pinVersion,
		updateTasks,
		updateSteps,
		removeProject,
	}

	return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}
