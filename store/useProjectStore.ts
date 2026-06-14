import axios from 'axios'
import { create } from 'zustand'
import { loadProjectData, saveProjectData, loadProjects, updateProjectMeta } from '@/lib/project-storage'
import { buildVersion, pushVersion, overwriteVersion, cosineSimilarity } from '@/lib/project-utils'
import type { Task, WorkflowData, ProjectVersion, ProjectMeta } from '@/types/project'
import type { AIGenerateOutput, PRDContent, AIPhase, AISuggestion } from '@/lib/ai-schema'

const emptyWorkflow: WorkflowData = { roleAName: '', roleBName: '', steps: [] }

const runGenerate = async (
	idea: string,
	projectId: string,
	embedding: number[],
	apiKey: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	set: (partial: any) => void,
) => {
	try {
		const { data: output } = await axios.post<AIGenerateOutput>(
			'/api/generate',
			{ idea },
			{ headers: { Authorization: `Bearer ${apiKey}` } },
		)

		const tasks: Task[] = output.tasks.map((task, i) => ({
			id: `t_${Date.now()}_${i}`,
			label: task.label,
			priority: task.priority,
			done: false,
		}))

		const workflow: WorkflowData = {
			roleAName: output.workflow.roleAName,
			roleBName: output.workflow.roleBName,
			steps: output.workflow.steps.map((step, i) => ({
				id: `s_${Date.now()}_${i}`,
				roleAStep: step.roleAStep,
				roleBStep: step.roleBStep,
			})),
		}

		const originVersion = buildVersion(idea, tasks, workflow, true, {
			prd: output.prd,
			phases: output.phases,
			suggestions: output.suggestions,
		})

		const data = loadProjectData(projectId) ?? { versions: [] }
		const nextVersions = pushVersion(data.versions, originVersion)

		saveProjectData(projectId, { versions: nextVersions, pinnedVersionId: originVersion.id })
		updateProjectMeta(projectId, { embedding })

		set({
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
		})
	} catch (err) {
		const errorMessage = axios.isAxiosError(err)
			? (err.response?.data?.error ?? 'AI 生成失敗，請稍後再試')
			: '網路錯誤，請稍後再試'
		set({ generateError: errorMessage })
	} finally {
		set({ loading: false })
	}
}

interface ProjectStore {
	projectId: string
	submitted: boolean
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
	validationError: string | null
	similarProject: { meta: ProjectMeta; similarity: number; currentEmbedding: number[] } | null
	initProject: (projectId: string) => void
	setIdea: (idea: string) => void
	generate: () => Promise<void>
	clearGenerateError: () => void
	clearValidationError: () => void
	loadSimilarProject: () => void
	forceGenerate: () => Promise<void>
	saveVersion: () => void
	saveOverwrite: (versionId: string) => void // 覆蓋指定版本的內容（原始版本不能覆蓋）
	loadVersion: (versionId: string) => void
	pinVersion: (versionId: string) => void
	updateTasks: (tasks: Task[]) => void
	updateWorkflow: (workflow: WorkflowData) => void
	removeProject: () => void
}

const emptyState = {
	submitted: false,
	loading: false,
	idea: '',
	tasks: [] as Task[],
	workflow: emptyWorkflow,
	prd: null as PRDContent | null,
	phases: [] as AIPhase[],
	suggestions: [] as AISuggestion[],
	isDirty: false,
	versions: [] as ProjectVersion[],
	activeVersionId: null as string | null,
	pinnedVersionId: null as string | null,
	isSaveSuccess: false,
	generateError: null as string | null,
	validationError: null as string | null,
	similarProject: null as { meta: ProjectMeta; similarity: number; currentEmbedding: number[] } | null,
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
	projectId: '',
	...emptyState,

	initProject: (projectId: string) => {
		if (!projectId) {
			return set({ projectId: '', ...emptyState })
		}

		const data = loadProjectData(projectId)

		if (data && data.versions.length > 0) {
			let versions = data.versions

			const hasOrigin = versions.some((version) => version.isOrigin)

			if (!hasOrigin) {
				const oldestVersion = versions[versions.length - 1]

				versions = versions.map((version) => {
					if (version.id !== oldestVersion.id) return version

					return { ...version, isOrigin: true, label: '原始版本' }
				})

				saveProjectData(projectId, { ...data, versions })
			}

			const pinnedId = data.pinnedVersionId ?? null
			const activeVersion = pinnedId
				? (versions.find((v) => v.id === pinnedId) ?? versions[versions.length - 1])
				: versions[versions.length - 1]

			set({
				projectId,
				submitted: true,
				loading: false,
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
				isSaveSuccess: false,
				generateError: null,
			})

			return
		}

		set({ projectId, ...emptyState })
	},

	setIdea: (idea: string) => {
		set({ idea })
	},

	generate: async () => {
		const { idea, loading, submitted, projectId } = get()

		if (!idea.trim() || loading || submitted) return

		const apiKey = typeof window !== 'undefined' ? localStorage.getItem('openai_api_key') : null

		if (!apiKey?.trim()) {
			set({ generateError: '請先至設定中輸入 OpenAI API Key' })
			return
		}

		set({ loading: true, generateError: null, validationError: null, similarProject: null })

		let preCheck: { valid: boolean; reason: string; embedding: number[] }
		try {
			const { data } = await axios.post<{ valid: boolean; reason: string; embedding: number[] }>(
				'/api/pre-check',
				{ idea },
				{ headers: { Authorization: `Bearer ${apiKey}` } },
			)
			preCheck = data
		} catch (err) {
			const errorMessage = axios.isAxiosError(err)
				? (err.response?.data?.error ?? '失敗，請稍後再試')
				: '網路錯誤，請稍後再試'
			return set({ loading: false, generateError: errorMessage })
		}

		if (!preCheck.valid) {
			return set({ loading: false, validationError: preCheck.reason || '請輸入一個產品或商業構想' })
		}

		// 語意相似度比對
		const SIMILARITY_THRESHOLD = 0.92
		const allProjects = loadProjects()
		let mostSimilar: { meta: ProjectMeta; similarity: number } | null = null

		for (const meta of allProjects) {
			if (!meta.embedding || meta.id === projectId) continue
			const sim = cosineSimilarity(meta.embedding, preCheck.embedding)
			if (sim >= SIMILARITY_THRESHOLD && (!mostSimilar || sim > mostSimilar.similarity)) {
				mostSimilar = { meta, similarity: sim }
			}
		}

		if (mostSimilar) {
			set({
				loading: false,
				similarProject: { ...mostSimilar, currentEmbedding: preCheck.embedding },
			})
			return
		}

		await runGenerate(idea, projectId, preCheck.embedding, apiKey, set)
	},

	clearGenerateError: () => {
		set({ generateError: null })
	},

	clearValidationError: () => {
		set({ validationError: null })
	},

	loadSimilarProject: () => {
		const { idea, projectId, similarProject } = get()
		if (!similarProject) return

		// 從相似專案讀取 origin 版本資料
		const sourceData = loadProjectData(similarProject.meta.id)
		const originVersion = sourceData?.versions.find((v) => v.isOrigin)

		if (!originVersion) {
			return set({ similarProject: null })
		}

		const newOriginVersion = buildVersion(idea, originVersion.tasks, originVersion.workflow, true, {
			prd: originVersion.prd,
			phases: originVersion.phases,
			suggestions: originVersion.suggestions,
		})

		const data = loadProjectData(projectId) ?? { versions: [] }
		const nextVersions = pushVersion(data.versions, newOriginVersion)

		saveProjectData(projectId, { versions: nextVersions, pinnedVersionId: newOriginVersion.id })
		updateProjectMeta(projectId, { embedding: similarProject.currentEmbedding })

		set({
			tasks: originVersion.tasks,
			workflow: originVersion.workflow ?? emptyWorkflow,
			prd: originVersion.prd ?? null,
			phases: originVersion.phases ?? [],
			suggestions: originVersion.suggestions ?? [],
			submitted: true,
			isDirty: false,
			versions: nextVersions,
			activeVersionId: newOriginVersion.id,
			pinnedVersionId: newOriginVersion.id,
			similarProject: null,
		})
	},

	forceGenerate: async () => {
		const { idea, projectId, similarProject } = get()
		const apiKey = typeof window !== 'undefined' ? localStorage.getItem('openai_api_key') : null

		if (!apiKey?.trim() || !similarProject) return

		const embedding = similarProject.currentEmbedding
		set({ loading: true, similarProject: null, generateError: null })
		await runGenerate(idea, projectId, embedding, apiKey, set)
	},

	saveVersion: () => {
		const { submitted, isDirty, idea, tasks, workflow, prd, phases, suggestions, projectId } = get()

		if (!submitted || !isDirty) return

		const data = loadProjectData(projectId) ?? { versions: [] }
		const newVersion = buildVersion(idea, tasks, workflow, false, { prd: prd ?? undefined, phases, suggestions })
		const nextVersions = pushVersion(data.versions, newVersion)

		saveProjectData(projectId, { versions: nextVersions, pinnedVersionId: data.pinnedVersionId })

		set({ versions: nextVersions, activeVersionId: newVersion.id, isDirty: false, isSaveSuccess: true })
		setTimeout(() => set({ isSaveSuccess: false }), 2000)
	},

	saveOverwrite: (versionId: string) => {
		const { submitted, isDirty, idea, tasks, workflow, versions, prd, phases, suggestions, projectId } = get()

		if (!submitted || !isDirty) return

		const target = versions.find((version) => version.id === versionId)

		if (!target || target.isOrigin) return

		const data = loadProjectData(projectId) ?? { versions: [] }
		const nextVersions = overwriteVersion(data.versions, versionId, idea, tasks, workflow, {
			prd: prd ?? undefined,
			phases,
			suggestions,
		})

		saveProjectData(projectId, { versions: nextVersions, pinnedVersionId: data.pinnedVersionId })

		set({ versions: nextVersions, activeVersionId: versionId, isDirty: false, isSaveSuccess: true })
		setTimeout(() => set({ isSaveSuccess: false }), 2000)
	},

	pinVersion: (versionId: string) => {
		const { versions, projectId } = get()

		const version = versions.find((version) => version.id === versionId)

		if (!version) return

		const data = loadProjectData(projectId)

		if (data) {
			saveProjectData(projectId, { ...data, pinnedVersionId: versionId })
		}

		set({
			idea: version.idea,
			tasks: version.tasks,
			workflow: version.workflow ?? emptyWorkflow,
			prd: version.prd ?? null,
			phases: version.phases ?? [],
			suggestions: version.suggestions ?? [],
			activeVersionId: versionId,
			pinnedVersionId: versionId,
			isDirty: false,
		})
	},

	loadVersion: (versionId: string) => {
		const { versions } = get()

		const version = versions.find((version) => version.id === versionId)

		if (!version) return

		set({
			idea: version.idea,
			tasks: version.tasks,
			workflow: version.workflow ?? emptyWorkflow,
			prd: version.prd ?? null,
			phases: version.phases ?? [],
			suggestions: version.suggestions ?? [],
			activeVersionId: versionId,
			isDirty: false,
		})
	},

	updateTasks: (tasks: Task[]) => {
		set({ tasks, isDirty: true })
	},

	updateWorkflow: (workflow: WorkflowData) => {
		set({ workflow, isDirty: true })
	},

	removeProject: () => {
		const { projectId } = get()

		localStorage.removeItem(`prd_project_${projectId}`)
		set({ ...emptyState })
	},
}))
