import { createClient } from './client'
import { v4 as uuidv4 } from 'uuid'
import type { Task, WorkflowData, ProjectVersion, ProjectMeta, ProjectData, Priority } from '@/types/project'
import type {
	PRDContent,
	AIPhase,
	AISuggestion,
	SectionLabels,
	UserPersona,
	Feature,
	SystemModule,
	DataModel,
} from '@/lib/ai-schema'

export interface UserSettingsResponse {
	hasApiKey: boolean
	maskedApiKey: string
}

// 取得目前使用者的所有專案列表
export async function fetchProjects(): Promise<ProjectMeta[]> {
	const supabase = createClient()
	const { data, error } = await supabase
		.from('projects')
		.select('id, name, color, embedding')
		.order('created_at', { ascending: true })

	if (error) throw error

	return (data || []).map((p) => ({
		id: p.id,
		name: p.name,
		color: p.color,
		embedding: p.embedding as number[] | undefined,
	}))
}

export async function createProject(name: string, color: string): Promise<ProjectMeta> {
	const supabase = createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) throw new Error('未登入使用者')

	const { data, error } = await supabase
		.from('projects')
		.insert({
			user_id: user.id,
			name,
			color,
		})
		.select('id, name, color')
		.single()

	if (error) throw error
	return data
}

export async function deleteProject(projectId: string): Promise<void> {
	const supabase = createClient()
	const { error } = await supabase.from('projects').delete().eq('id', projectId)

	if (error) throw error
}

// 更新專案的 Embedding 向量或基本設定
export async function updateProjectMeta(projectId: string, patch: Partial<Omit<ProjectMeta, 'id'>>): Promise<void> {
	const supabase = createClient()
	const { error } = await supabase.from('projects').update(patch).eq('id', projectId)

	if (error) throw error
}

// 載入特定專案的所有歷史版本與關聯資料 (PRD, Tasks, Workflows 等)
export async function fetchProjectData(projectId: string): Promise<ProjectData | null> {
	const supabase = createClient()

	const { data: project, error: projectError } = await supabase
		.from('projects')
		.select('pinned_version_id')
		.eq('id', projectId)
		.single()

	if (projectError) {
		if (projectError.code === 'PGRST116') return null
		throw projectError
	}
	if (!project) return null

	const { data: dbVersions, error: versionsError } = await supabase
		.from('project_versions')
		.select('*')
		.eq('project_id', projectId)
		.order('sort_order', { ascending: true })

	if (versionsError) {
		throw versionsError
	}

	if (!dbVersions || dbVersions.length === 0) {
		return { versions: [], pinnedVersionId: project.pinned_version_id ?? undefined }
	}

	const versionIds = dbVersions.map((version) => version.id)

	const [
		{ data: dbTasks },
		{ data: dbWorkflows },
		{ data: dbPrdContents },
		{ data: dbPhases },
		{ data: dbSuggestions },
	] = await Promise.all([
		supabase.from('tasks').select('*').in('version_id', versionIds).order('sort_order', { ascending: true }),
		supabase.from('workflows').select('*').in('version_id', versionIds),
		supabase.from('prd_contents').select('*').in('version_id', versionIds),
		supabase.from('phases').select('*').in('version_id', versionIds).order('sort_order', { ascending: true }),
		supabase.from('suggestions').select('*').in('version_id', versionIds).order('sort_order', { ascending: true }),
	])

	const workflowIds = dbWorkflows?.map((workflow) => workflow.id) || []
	const { data: dbWorkflowSteps } =
		workflowIds.length > 0
			? await supabase
					.from('workflow_steps')
					.select('*')
					.in('workflow_id', workflowIds)
					.order('sort_order', { ascending: true })
			: { data: [] }

	// 把各個子表撈出來的 Raw Data，依照 version_id 重新組裝回 versions
	const versions: ProjectVersion[] = dbVersions.map((version) => {
		const tasks: Task[] = (dbTasks || [])
			.filter((task) => task.version_id === version.id)
			.map((task) => ({
				id: task.id,
				label: task.label,
				priority: task.priority as Priority,
				done: task.done,
				readonly: task.readonly,
				suggestionId: task.suggestion_id ?? undefined,
			}))

		const currentWorkflow = (dbWorkflows || []).find((workflow) => workflow.version_id === version.id)
		let workflow: WorkflowData = { roleAName: '', roleBName: '', steps: [] }
		if (currentWorkflow) {
			const steps = (dbWorkflowSteps || [])
				.filter((step) => step.workflow_id === currentWorkflow.id)
				.map((step) => ({
					id: step.id,
					roleAStep: step.role_a_step,
					roleBStep: step.role_b_step,
				}))
			workflow = {
				roleAName: currentWorkflow.role_a_name,
				roleBName: currentWorkflow.role_b_name,
				steps,
			}
		}

		const prdRaw = (dbPrdContents || []).find((prd) => prd.version_id === version.id)
		let prd: PRDContent | undefined = undefined
		if (prdRaw) {
			prd = {
				tagline: prdRaw.tagline,
				overview: prdRaw.overview,
				productGoal: prdRaw.product_goal,
				sectionLabels: prdRaw.section_labels as unknown as SectionLabels,
				userPersonas: prdRaw.user_personas as unknown as UserPersona[],
				features: prdRaw.features as unknown as Feature[],
				systemModules: prdRaw.system_modules as unknown as SystemModule[],
				dataModels: prdRaw.data_models as unknown as DataModel[],
				valuePropositions: prdRaw.value_propositions as unknown as string[],
			}
		}

		const phases: AIPhase[] = (dbPhases || [])
			.filter((phase) => phase.version_id === version.id)
			.map((phase) => ({
				name: phase.name,
				timeframe: phase.timeframe,
				goal: phase.goal,
				deliverables: phase.deliverables as unknown as string[],
				successMetrics: phase.success_metrics as unknown as string[],
			}))

		const suggestions: AISuggestion[] = (dbSuggestions || [])
			.filter((suggestion) => suggestion.version_id === version.id)
			.map((suggestion) => ({
				id: suggestion.id,
				category: suggestion.category,
				title: suggestion.title,
				description: suggestion.description,
				actionItems: suggestion.action_items as unknown as string[],
				impact: suggestion.impact as 'High' | 'Medium' | 'Low',
			}))

		return {
			id: version.id,
			timestamp: new Date(version.created_at).getTime(),
			label: version.label,
			isOrigin: version.is_origin,
			idea: version.idea,
			tasks,
			workflow,
			prd,
			phases,
			suggestions,
		}
	})

	return {
		versions,
		pinnedVersionId: project.pinned_version_id ?? undefined,
	}
}

// 儲存新版本與關聯內容到 Supabase 資料庫
export async function saveNewVersion(projectId: string, version: ProjectVersion, sortOrder: number): Promise<void> {
	const supabase = createClient()

	const suggestionIdMap = new Map<string, string>()
	const suggestionsToInsert = (version.suggestions || []).map((suggestion, idx) => {
		const sId = suggestion.id || uuidv4()
		suggestionIdMap.set(`ai_s_${idx}`, sId)
		if (suggestion.id) {
			suggestionIdMap.set(suggestion.id, sId)
		}
		return {
			id: sId,
			version_id: version.id,
			category: suggestion.category,
			title: suggestion.title,
			description: suggestion.description,
			action_items: suggestion.actionItems,
			impact: suggestion.impact,
			sort_order: idx,
		}
	})

	const { error: versionError } = await supabase.from('project_versions').insert({
		id: version.id,
		project_id: projectId,
		label: version.label,
		is_origin: version.isOrigin || false,
		idea: version.idea,
		sort_order: sortOrder,
		created_at: new Date(version.timestamp).toISOString(),
	})

	if (versionError) throw versionError

	if (version.tasks.length > 0) {
		const tasksToInsert = version.tasks.map((task, idx) => {
			let sId = task.suggestionId || null
			if (sId && suggestionIdMap.has(sId)) {
				sId = suggestionIdMap.get(sId)!
			} else if (sId && !sId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
				sId = null
			}
			return {
				id: task.id,
				version_id: version.id,
				label: task.label,
				priority: task.priority,
				done: task.done,
				readonly: task.readonly || false,
				suggestion_id: sId,
				sort_order: idx,
			}
		})
		const { error: tasksError } = await supabase.from('tasks').insert(tasksToInsert)
		if (tasksError) throw tasksError
	}

	if (version.workflow && (version.workflow.roleAName || version.workflow.roleBName)) {
		const { data: dbWorkflow, error: workflowError } = await supabase
			.from('workflows')
			.insert({
				version_id: version.id,
				role_a_name: version.workflow.roleAName,
				role_b_name: version.workflow.roleBName,
			})
			.select('id')
			.single()

		if (workflowError) throw workflowError

		if (dbWorkflow && version.workflow.steps.length > 0) {
			const stepsToInsert = version.workflow.steps.map((step, idx) => ({
				id: step.id,
				workflow_id: dbWorkflow.id,
				role_a_step: step.roleAStep,
				role_b_step: step.roleBStep,
				sort_order: idx,
			}))
			const { error: stepsError } = await supabase.from('workflow_steps').insert(stepsToInsert)
			if (stepsError) throw stepsError
		}
	}

	if (version.prd) {
		const { error: prdError } = await supabase.from('prd_contents').insert({
			version_id: version.id,
			tagline: version.prd.tagline,
			overview: version.prd.overview,
			product_goal: version.prd.productGoal,
			section_labels: version.prd.sectionLabels,
			user_personas: version.prd.userPersonas,
			features: version.prd.features,
			system_modules: version.prd.systemModules,
			data_models: version.prd.dataModels,
			value_propositions: version.prd.valuePropositions,
		})
		if (prdError) throw prdError
	}

	if (version.phases && version.phases.length > 0) {
		const phasesToInsert = version.phases.map((phase, idx) => ({
			version_id: version.id,
			name: phase.name,
			timeframe: phase.timeframe,
			goal: phase.goal,
			deliverables: phase.deliverables,
			success_metrics: phase.successMetrics,
			sort_order: idx,
		}))
		const { error: phasesError } = await supabase.from('phases').insert(phasesToInsert)
		if (phasesError) throw phasesError
	}

	if (suggestionsToInsert.length > 0) {
		const { error: suggestionsError } = await supabase.from('suggestions').insert(suggestionsToInsert)
		if (suggestionsError) throw suggestionsError
	}
}

// 覆寫指定版本的內容
export async function overwriteVersion(
	versionId: string,
	idea: string,
	tasks: Task[],
	workflow: WorkflowData,
	details: {
		prd?: PRDContent
		phases?: AIPhase[]
		suggestions?: AISuggestion[]
	},
): Promise<void> {
	const supabase = createClient()

	const suggestionIdMap = new Map<string, string>()
	const suggestionsToInsert = (details.suggestions || []).map((suggestion, idx) => {
		const sId = suggestion.id || uuidv4()
		suggestionIdMap.set(`ai_s_${idx}`, sId)
		if (suggestion.id) {
			suggestionIdMap.set(suggestion.id, sId)
		}
		return {
			id: sId,
			version_id: versionId,
			category: suggestion.category,
			title: suggestion.title,
			description: suggestion.description,
			action_items: suggestion.actionItems,
			impact: suggestion.impact,
			sort_order: idx,
		}
	})

	// 更新版本主表中的 Idea
	const { error: versionError } = await supabase.from('project_versions').update({ idea }).eq('id', versionId)

	if (versionError) throw versionError

	// 先清除舊的關聯資料，再重新寫入，避免處理複雜的 Diff 比對
	await Promise.all([
		supabase.from('tasks').delete().eq('version_id', versionId),
		supabase.from('workflows').delete().eq('version_id', versionId),
		supabase.from('prd_contents').delete().eq('version_id', versionId),
		supabase.from('phases').delete().eq('version_id', versionId),
		supabase.from('suggestions').delete().eq('version_id', versionId),
	])

	if (tasks.length > 0) {
		const tasksToInsert = tasks.map((task, idx) => {
			let sId = task.suggestionId || null
			if (sId && suggestionIdMap.has(sId)) {
				sId = suggestionIdMap.get(sId)!
			} else if (sId && !sId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
				sId = null
			}
			return {
				id: task.id,
				version_id: versionId,
				label: task.label,
				priority: task.priority,
				done: task.done,
				readonly: task.readonly || false,
				suggestion_id: sId,
				sort_order: idx,
			}
		})
		const { error: tasksError } = await supabase.from('tasks').insert(tasksToInsert)
		if (tasksError) throw tasksError
	}

	if (workflow && (workflow.roleAName || workflow.roleBName)) {
		const { data: dbWorkflow, error: workflowError } = await supabase
			.from('workflows')
			.insert({
				version_id: versionId,
				role_a_name: workflow.roleAName,
				role_b_name: workflow.roleBName,
			})
			.select('id')
			.single()

		if (workflowError) throw workflowError

		if (dbWorkflow && workflow.steps.length > 0) {
			const stepsToInsert = workflow.steps.map((step, idx) => ({
				id: step.id,
				workflow_id: dbWorkflow.id,
				role_a_step: step.roleAStep,
				role_b_step: step.roleBStep,
				sort_order: idx,
			}))
			const { error: stepsError } = await supabase.from('workflow_steps').insert(stepsToInsert)
			if (stepsError) throw stepsError
		}
	}

	if (details.prd) {
		const { error: prdError } = await supabase.from('prd_contents').insert({
			version_id: versionId,
			tagline: details.prd.tagline,
			overview: details.prd.overview,
			product_goal: details.prd.productGoal,
			section_labels: details.prd.sectionLabels,
			user_personas: details.prd.userPersonas,
			features: details.prd.features,
			system_modules: details.prd.systemModules,
			data_models: details.prd.dataModels,
			value_propositions: details.prd.valuePropositions,
		})
		if (prdError) throw prdError
	}

	if (details.phases && details.phases.length > 0) {
		const phasesToInsert = details.phases.map((phase, idx) => ({
			version_id: versionId,
			name: phase.name,
			timeframe: phase.timeframe,
			goal: phase.goal,
			deliverables: phase.deliverables,
			success_metrics: phase.successMetrics,
			sort_order: idx,
		}))
		const { error: phasesError } = await supabase.from('phases').insert(phasesToInsert)
		if (phasesError) throw phasesError
	}

	if (suggestionsToInsert.length > 0) {
		const { error: suggestionsError } = await supabase.from('suggestions').insert(suggestionsToInsert)
		if (suggestionsError) throw suggestionsError
	}
}

// 釘選指定版本為專案的預設載入版本
export async function pinProjectVersion(projectId: string, versionId: string): Promise<void> {
	const supabase = createClient()
	const { error } = await supabase.from('projects').update({ pinned_version_id: versionId }).eq('id', projectId)

	if (error) throw error
}

export const fetchUserSettings = async (): Promise<UserSettingsResponse> => {
	const res = await fetch('/api/settings')
	if (!res.ok) throw new Error('載入設定失敗')

	const data = await res.json()

	return {
		hasApiKey: data.hasApiKey ?? false,
		maskedApiKey: data.maskedApiKey ?? '',
	}
}

export const saveUserSettings = async (apiKey: string): Promise<void> => {
	const res = await fetch('/api/settings', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ apiKey }),
	})

	if (!res.ok) throw new Error('儲存設定失敗')
}

// 利用 pgvector 進行相似度比對，排除當前操作的專案
export async function matchSimilarProjects(
	embedding: number[],
	threshold: number,
	matchCount: number,
	projectId: string,
): Promise<{ id: string; name: string; color: string; similarity: number } | null> {
	const supabase = createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) return null

	const { data, error } = await supabase.rpc('match_projects', {
		query_embedding: embedding,
		match_threshold: threshold,
		match_count: matchCount,
		owner_id: user.id,
	})

	if (error) throw error

	const rows = (data || []) as Array<{ id: string; name: string; color: string; similarity: number }>

	// 排除當前正在操作的專案
	const filtered = rows.filter((row) => row.id !== projectId)
	if (filtered.length === 0) return null

	return filtered[0]
}

// 刪除指定的專案版本
export async function deleteProjectVersion(versionId: string): Promise<void> {
	const supabase = createClient()
	const { error } = await supabase.from('project_versions').delete().eq('id', versionId)

	if (error) throw error
}

// 批次更新多個版本的 Label 與排序
export async function updateVersionsMeta(updates: { id: string; label: string; sort_order: number }[]): Promise<void> {
	const supabase = createClient()

	await Promise.all(
		updates.map(async (update) => {
			const { error } = await supabase
				.from('project_versions')
				.update({ label: update.label, sort_order: update.sort_order })
				.eq('id', update.id)
			if (error) throw error
		}),
	)
}
