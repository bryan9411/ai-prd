import type { StateCreator } from 'zustand'
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'
import { buildVersion } from '@/lib/project-utils'
import { emptyWorkflow } from '../types'
import {
	fetchUserSettings,
	fetchProjectData,
	saveNewVersion,
	updateProjectMeta,
	matchSimilarProjects,
	pinProjectVersion,
} from '@/lib/supabase/db'
import type { Task, WorkflowData } from '@/types/project'
import type { PRDContent, PartialAIGenerateOutput, AIGenerateOutput } from '@/lib/ai-schema'
import type { ProjectStore, AISlice } from '../types'

export const createAISlice: StateCreator<ProjectStore, [], [], AISlice> = (set, get) => ({
	loading: false,
	isStreaming: false,
	generateError: null,
	validationError: null,
	similarProject: null,
	pendingIdea: null,
	pendingEmbedding: null,

	generate: async () => {
		const { idea, loading, submitted, projectId } = get()

		if (!idea.trim() || loading || submitted) return

		const settings = await fetchUserSettings()

		if (!settings.hasApiKey) {
			return set({ generateError: '請先至設定中輸入 OpenAI API Key' })
		}

		set({ loading: true, generateError: null, validationError: null, similarProject: null })

		let preCheck: { valid: boolean; reason: string; embedding: number[] }
		try {
			const { data } = await axios.post('/api/pre-check', { idea })
			preCheck = data
		} catch (err) {
			const errorMessage = axios.isAxiosError(err) ? (err.response?.data?.error ?? '失敗，請稍後再試') : '網路錯誤，請稍後再試'
			return set({ loading: false, generateError: errorMessage })
		}

		if (!preCheck.valid) {
			return set({ loading: false, validationError: preCheck.reason || '請輸入一個產品或商業構想' })
		}

		let mostSimilar: { id: string; name: string; color: string; similarity: number } | null = null
		try {
			mostSimilar = await matchSimilarProjects(preCheck.embedding, 0.92, 1, projectId)
		} catch (err) {
			console.error('向量搜尋失敗：', err)
		}

		if (mostSimilar) {
			set({
				loading: false,
				similarProject: {
					meta: { id: mostSimilar.id, name: mostSimilar.name, color: mostSimilar.color },
					similarity: mostSimilar.similarity,
					currentEmbedding: preCheck.embedding,
				},
			})
			return
		}

		set({
			pendingIdea: idea,
			pendingEmbedding: preCheck.embedding,
			isStreaming: true,
		})
	},

	clearGenerateError: () => {
		set({ generateError: null })
	},

	clearValidationError: () => {
		set({ validationError: null })
	},

	loadSimilarProject: async () => {
		const { idea, projectId, similarProject, versions } = get()
		if (!similarProject) return

		const sourceData = await fetchProjectData(similarProject.meta.id)
		const originVersion = sourceData?.versions.find((version) => version.isOrigin)

		if (!originVersion) {
			return set({ similarProject: null })
		}

		const newOriginVersion = buildVersion(idea, originVersion.tasks, originVersion.workflow, true, {
			prd: originVersion.prd,
			phases: originVersion.phases,
			suggestions: originVersion.suggestions,
		})

		// 儲存新版本與釘選，並將 embedding 向量存入 metadata
		await saveNewVersion(projectId, newOriginVersion, versions.length)
		await pinProjectVersion(projectId, newOriginVersion.id)
		await updateProjectMeta(projectId, {
			embedding: similarProject.currentEmbedding,
		})

		const nextVersions = [...versions, newOriginVersion]

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
		const { idea, similarProject } = get()
		const settings = await fetchUserSettings()

		if (!settings.hasApiKey || !similarProject) return

		set({
			loading: true,
			similarProject: null,
			generateError: null,
			pendingIdea: idea,
			pendingEmbedding: similarProject.currentEmbedding,
			isStreaming: true,
		})
	},

	clearPendingIdea: () => {
		set({ pendingIdea: null })
	},

	applyStreamingPartial: (partial: PartialAIGenerateOutput) => {
		const prd: PRDContent | null = partial.prd
			? {
					tagline: partial.prd.tagline ?? '',
					overview: partial.prd.overview ?? '',
					productGoal: partial.prd.productGoal ?? '',
					sectionLabels: {
						userPersonas: partial.prd.sectionLabels?.userPersonas ?? '',
						features: partial.prd.sectionLabels?.features ?? '',
						systemModules: partial.prd.sectionLabels?.systemModules ?? '',
						dataModels: partial.prd.sectionLabels?.dataModels ?? '',
						valuePropositions: partial.prd.sectionLabels?.valuePropositions ?? '',
					},
					userPersonas: (partial.prd.userPersonas ?? []).map((person) => ({
						name: person?.name ?? '',
						description: person?.description ?? '',
					})),
					features: (partial.prd.features ?? []).map((feature) => ({
						name: feature?.name ?? '',
						description: feature?.description ?? '',
						icon: feature?.icon ?? '',
					})),
					systemModules: (partial.prd.systemModules ?? []).map((module) => ({
						name: module?.name ?? '',
						description: module?.description ?? '',
					})),
					dataModels: (partial.prd.dataModels ?? []).map((model) => ({
						name: model?.name ?? '',
						description: model?.description ?? '',
					})),
					valuePropositions: (partial.prd.valuePropositions ?? []).map((proposition) => proposition ?? ''),
				}
			: null

		const tasks: Task[] = (partial.tasks ?? []).map((task, index) => ({
			id: `stream-${index}`,
			label: task?.label ?? '',
			priority: task?.priority ?? 'Medium',
			done: false,
		}))

		const workflow: WorkflowData = partial.workflow
			? {
					roleAName: partial.workflow.roleAName ?? '',
					roleBName: partial.workflow.roleBName ?? '',
					steps: (partial.workflow.steps ?? []).map((step, index) => ({
						id: `stream-${index}`,
						roleAStep: step?.roleAStep ?? '',
						roleBStep: step?.roleBStep ?? '',
					})),
				}
			: emptyWorkflow

		const phases = (partial.phases ?? []).map((phase) => ({
			name: phase?.name ?? '',
			timeframe: phase?.timeframe ?? '',
			goal: phase?.goal ?? '',
			deliverables: (phase?.deliverables ?? []).map((deliverable) => deliverable ?? ''),
			successMetrics: (phase?.successMetrics ?? []).map((metric) => metric ?? ''),
		}))

		const suggestions = (partial.suggestions ?? []).map((suggest) => ({
			category: suggest?.category ?? '',
			title: suggest?.title ?? '',
			description: suggest?.description ?? '',
			actionItems: (suggest?.actionItems ?? []).map((item) => item ?? ''),
			impact: suggest?.impact ?? 'Medium',
		}))

		set({ prd, tasks, workflow, phases, suggestions })
	},

	finalizeGenerate: async (output: AIGenerateOutput) => {
		const { pendingIdea, idea, projectId, pendingEmbedding } = get()
		const effectiveIdea = pendingIdea ?? idea

		try {
			const tasks: Task[] = output.tasks.map((task) => ({
				id: uuidv4(),
				label: task.label,
				priority: task.priority,
				done: false,
			}))

			const workflow: WorkflowData = {
				roleAName: output.workflow.roleAName,
				roleBName: output.workflow.roleBName,
				steps: output.workflow.steps.map((step) => ({
					id: uuidv4(),
					roleAStep: step.roleAStep,
					roleBStep: step.roleBStep,
				})),
			}

			const suggestions = output.suggestions.map((suggestion) => ({
				...suggestion,
				id: uuidv4(),
			}))

			const originVersion = buildVersion(effectiveIdea, tasks, workflow, true, {
				prd: output.prd,
				phases: output.phases,
				suggestions,
			})

			// 寫入 Supabase，並將此原始版本設為預設釘選版與同步 Embedding
			await saveNewVersion(projectId, originVersion, 0)
			await pinProjectVersion(projectId, originVersion.id)
			await updateProjectMeta(projectId, {
				embedding: pendingEmbedding ?? [],
			})

			set({
				tasks,
				workflow,
				prd: output.prd,
				phases: output.phases,
				suggestions,
				submitted: true,
				isDirty: false,
				versions: [originVersion],
				activeVersionId: originVersion.id,
				pinnedVersionId: originVersion.id,
			})
		} catch (err) {
			const errorMessage = axios.isAxiosError(err)
				? (err.response?.data?.error ?? 'AI 生成失敗，請稍後再試')
				: '生成結果儲存失敗，請稍後再試'
			set({ generateError: errorMessage })
		} finally {
			set({
				loading: false,
				isStreaming: false,
				pendingIdea: null,
				pendingEmbedding: null,
			})
		}
	},

	handleStreamError: (message: string) => {
		set({
			generateError: message,
			loading: false,
			isStreaming: false,
			pendingIdea: null,
			pendingEmbedding: null,
		})
	},
})
