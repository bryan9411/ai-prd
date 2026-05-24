'use client'

import { createContext, useContext, useState, useCallback, useEffect, startTransition, type ReactNode } from 'react'
import { loadProjectData, saveProjectData } from '@/store/project-store'
import { buildVersion, pushVersion, overwriteVersion } from '@/lib/project-utils'
import type { Task, WorkflowData, ProjectVersion } from '@/types/project'
import type { AIGenerateOutput, PRDContent, AIPhase, AISuggestion } from '@/lib/ai-schema'

export interface ProjectContextValue {
	submitted: boolean
	projectId: string
	loading: boolean
	idea: string
	tasks: Task[]
	workflow: WorkflowData
	prd: PRDContent | null
	phases: AIPhase[]
	suggestions: AISuggestion[]
	isDirty: boolean
	versions: ProjectVersion[]
	activeVersionId: string | null
	pinnedVersionId: string | null
	isSaveSuccess: boolean
	generateError: string | null
	setIdea: (idea: string) => void
	generate: () => void
	clearGenerateError: () => void
	saveVersion: () => void
	saveOverwrite: (versionId: string) => void // 覆蓋指定版本的內容（原始版本不能覆蓋）
	loadVersion: (versionId: string) => void
	pinVersion: (versionId: string) => void
	updateTasks: (tasks: Task[]) => void
	updateWorkflow: (workflow: WorkflowData) => void
	removeProject: () => void
}

interface ProjectProviderProps {
	projectId: string
	children: ReactNode
}

const emptyWorkflow: WorkflowData = { roleAName: '', roleBName: '', steps: [] }

interface ProjectState {
	submitted: boolean
	idea: string
	tasks: Task[]
	workflow: WorkflowData
	prd: PRDContent | null
	phases: AIPhase[]
	suggestions: AISuggestion[]
	isDirty: boolean
	versions: ProjectVersion[]
	activeVersionId: string | null
	pinnedVersionId: string | null
}

const ProjectContext = createContext<ProjectContextValue | null>(null)

const emptyProjectState: ProjectState = {
	submitted: false,
	idea: '',
	tasks: [],
	workflow: emptyWorkflow,
	prd: null,
	phases: [],
	suggestions: [],
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

const getActiveVersion = (pinnedId: string | null, versions: ProjectVersion[]) => {
	if (pinnedId) {
		const pinnedVersion = versions.find((v) => v.id === pinnedId)

		if (pinnedVersion) {
			return pinnedVersion
		}
	}

	return versions[versions.length - 1]
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
		const activeVersion = getActiveVersion(pinnedId, versions)

		return {
			submitted: true,
			idea: activeVersion.idea,
			tasks: activeVersion.tasks,
			workflow: activeVersion.workflow ?? emptyWorkflow,
			prd: activeVersion.prd ?? null,
			phases: activeVersion.phases ?? [],
			suggestions: activeVersion.suggestions ?? [],
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
	const [generateError, setGenerateError] = useState<string | null>(null)

	const clearGenerateError = useCallback(() => setGenerateError(null), [])

	const generate = useCallback(async () => {
		if (!projectState.idea.trim() || loading || projectState.submitted) return

		const apiKey = typeof window !== 'undefined' ? localStorage.getItem('openai_api_key') : null

		if (!apiKey?.trim()) {
			setGenerateError('請先至設定中輸入 OpenAI API Key')
			return
		}

		setLoading(true)
		setGenerateError(null)

		try {
			const res = await fetch('/api/generate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify({ idea: projectState.idea }),
			})

			const json = await res.json()

			if (!res.ok) {
				setGenerateError(json.error ?? 'AI 生成失敗，請稍後再試')
				return
			}

			const output = json as AIGenerateOutput

			const tasks: Task[] = output.tasks.map((t, i) => ({
				id: `t_${Date.now()}_${i}`,
				label: t.label,
				priority: t.priority,
				done: false,
			}))

			const workflow: WorkflowData = {
				roleAName: output.workflow.roleAName,
				roleBName: output.workflow.roleBName,
				steps: output.workflow.steps.map((s, i) => ({
					id: `s_${Date.now()}_${i}`,
					roleAStep: s.roleAStep,
					roleBStep: s.roleBStep,
				})),
			}

			const originVersion = buildVersion(projectState.idea, tasks, workflow, true, {
				prd: output.prd,
				phases: output.phases,
				suggestions: output.suggestions,
			})

			const data = loadProjectData(projectId) ?? { versions: [] }
			const nextVersions = pushVersion(data.versions, originVersion)

			saveProjectData(projectId, { versions: nextVersions, pinnedVersionId: originVersion.id })

			setProjectState((prev) => ({
				...prev,
				tasks,
				workflow,
				prd: output.prd,
				phases: output.phases,
				suggestions: output.suggestions,
				submitted: true,
				isDirty: false,
				versions: nextVersions,
				activeVersionId: originVersion.id,
				pinnedVersionId: originVersion.id,
			}))
		} catch {
			setGenerateError('網路錯誤，請稍後再試')
		} finally {
			setLoading(false)
		}
	}, [projectState.idea, projectState.submitted, loading, projectId])

	const saveVersion = useCallback(() => {
		const { submitted, isDirty, idea, tasks, workflow, prd, phases, suggestions } = projectState

		if (!submitted || !isDirty) return

		const data = loadProjectData(projectId) ?? { versions: [] }
		const newVersion = buildVersion(idea, tasks, workflow, false, { prd: prd ?? undefined, phases, suggestions })
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

	const saveOverwrite = useCallback(
		(versionId: string) => {
			const { submitted, isDirty, idea, tasks, workflow, versions, prd, phases, suggestions } = projectState

			if (!submitted || !isDirty) return

			// origin 版本不允許覆蓋
			const target = versions.find((v) => v.id === versionId)
			if (!target || target.isOrigin) return

			const data = loadProjectData(projectId) ?? { versions: [] }
			const nextVersions = overwriteVersion(data.versions, versionId, idea, tasks, workflow, {
				prd: prd ?? undefined,
				phases,
				suggestions,
			})

			saveProjectData(projectId, { versions: nextVersions, pinnedVersionId: data.pinnedVersionId })
			setProjectState((prev) => ({
				...prev,
				versions: nextVersions,
				activeVersionId: versionId,
				isDirty: false,
			}))

			setIsSaveSuccess(true)
			setTimeout(() => setIsSaveSuccess(false), 2000)
		},
		[projectState, projectId],
	)

	const pinVersion = useCallback(
		(versionId: string) => {
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
				workflow: version.workflow ?? emptyWorkflow,
				prd: version.prd ?? null,
				phases: version.phases ?? [],
				suggestions: version.suggestions ?? [],
				activeVersionId: versionId,
				pinnedVersionId: versionId,
				isDirty: false,
			}))
		},
		[projectState.versions, projectId],
	)

	const loadVersion = useCallback(
		(versionId: string) => {
			const version = projectState.versions.find((v) => v.id === versionId)

			if (!version) return

			setProjectState((prev) => ({
				...prev,
				idea: version.idea,
				tasks: version.tasks,
				workflow: version.workflow ?? emptyWorkflow,
				prd: version.prd ?? null,
				phases: version.phases ?? [],
				suggestions: version.suggestions ?? [],
				activeVersionId: versionId,
				isDirty: false,
			}))
		},
		[projectState.versions],
	)

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

	const updateWorkflow = useCallback((nextWorkflow: WorkflowData) => {
		setProjectState((prev) => {
			return { ...prev, workflow: nextWorkflow, isDirty: true }
		})
	}, [])

	useEffect(() => {
		if (!projectId) return

		startTransition(() => {
			setProjectState(onLoadProjectData(projectId))
		})
	}, [projectId])

	const value: ProjectContextValue = {
		projectId,
		loading,
		isSaveSuccess,
		generateError,
		setIdea,
		generate,
		clearGenerateError,
		saveVersion,
		saveOverwrite,
		loadVersion,
		pinVersion,
		updateTasks,
		updateWorkflow,
		removeProject,
		...projectState,
	}

	return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}
