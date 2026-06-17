import type { StateCreator } from 'zustand'
import axios from 'axios'
import { getApiKey, loadProjectData, saveProjectData, loadProjects, updateProjectMeta } from '@/lib/project-storage'
import { buildVersion, pushVersion, cosineSimilarity } from '@/lib/project-utils'
import type { Task, WorkflowData, ProjectMeta } from '@/types/project'
import type { AIGenerateOutput } from '@/lib/ai-schema'
import type { ProjectStore, AISlice } from '../types'
import { emptyWorkflow } from '../types'

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

export const createAISlice: StateCreator<ProjectStore, [], [], AISlice> = (set, get) => ({
	loading: false,
	generateError: null,
	validationError: null,
	similarProject: null,

	generate: async () => {
		const { idea, loading, submitted, projectId } = get()

		if (!idea.trim() || loading || submitted) return

		const apiKey = getApiKey()

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
		const apiKey = getApiKey()

		if (!apiKey?.trim() || !similarProject) return

		const embedding = similarProject.currentEmbedding
		set({ loading: true, similarProject: null, generateError: null })
		await runGenerate(idea, projectId, embedding, apiKey, set)
	},
})
