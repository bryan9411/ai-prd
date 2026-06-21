import { createClient } from './client'
import { v4 as uuidv4 } from 'uuid'
import type { Task, WorkflowData, ProjectVersion, ProjectMeta, ProjectData, Priority } from '@/types/project'
import type { PRDContent, AIPhase, AISuggestion, SectionLabels, UserPersona, Feature, SystemModule, DataModel } from '@/lib/ai-schema'

// 1. 取得專案列表
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

// 2. 建立新專案
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

// 3. 刪除專案 (會觸發 CASCADE 刪除所有版本與項目)
export async function deleteProject(projectId: string): Promise<void> {
	const supabase = createClient()
	const { error } = await supabase.from('projects').delete().eq('id', projectId)

	if (error) throw error
}

// 4. 更新專案中繼資料 (例如 Embedding)
export async function updateProjectMeta(projectId: string, patch: Partial<Omit<ProjectMeta, 'id'>>): Promise<void> {
	const supabase = createClient()
	const { error } = await supabase.from('projects').update(patch).eq('id', projectId)

	if (error) throw error
}

// 5. 載入特定專案的所有版本與細節
export async function fetchProjectData(projectId: string): Promise<ProjectData | null> {
	const supabase = createClient()

	// 取得專案及釘選版本 ID
	const { data: project, error: pError } = await supabase
		.from('projects')
		.select('pinned_version_id')
		.eq('id', projectId)
		.single()

	if (pError) {
		if (pError.code === 'PGRST116') return null // 找不到專案
		throw pError
	}
	if (!project) return null

	// 取得所有版本
	const { data: dbVersions, error: vError } = await supabase
		.from('project_versions')
		.select('*')
		.eq('project_id', projectId)
		.order('sort_order', { ascending: true })

	if (vError) throw vError
	if (!dbVersions || dbVersions.length === 0) {
		return { versions: [], pinnedVersionId: project.pinned_version_id ?? undefined }
	}

	const versionIds = dbVersions.map((v) => v.id)

	// 平行載入所有版本細節
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

	// 平行載入工作流程步驟
	const workflowIds = dbWorkflows?.map((w) => w.id) || []
	const { data: dbWorkflowSteps } =
		workflowIds.length > 0
			? await supabase
					.from('workflow_steps')
					.select('*')
					.in('workflow_id', workflowIds)
					.order('sort_order', { ascending: true })
			: { data: [] }

	// 組裝回原先的 ProjectVersion[] 架構
	const versions: ProjectVersion[] = dbVersions.map((v) => {
		// 1. 任務列表
		const tasks: Task[] = (dbTasks || [])
			.filter((t) => t.version_id === v.id)
			.map((t) => ({
				id: t.id,
				label: t.label,
				priority: t.priority as Priority,
				done: t.done,
				readonly: t.readonly,
				suggestionId: t.suggestion_id ?? undefined,
			}))

		// 2. 工作流程
		const wf = (dbWorkflows || []).find((w) => w.version_id === v.id)
		let workflow: WorkflowData = { roleAName: '', roleBName: '', steps: [] }
		if (wf) {
			const steps = (dbWorkflowSteps || [])
				.filter((s) => s.workflow_id === wf.id)
				.map((s) => ({
					id: s.id,
					roleAStep: s.role_a_step,
					roleBStep: s.role_b_step,
				}))
			workflow = {
				roleAName: wf.role_a_name,
				roleBName: wf.role_b_name,
				steps,
			}
		}

		// 3. PRD 內容
		const prdRaw = (dbPrdContents || []).find((p) => p.version_id === v.id)
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

		// 4. 開發階段
		const phases: AIPhase[] = (dbPhases || [])
			.filter((p) => p.version_id === v.id)
			.map((p) => ({
				name: p.name,
				timeframe: p.timeframe,
				goal: p.goal,
				deliverables: p.deliverables as unknown as string[],
				successMetrics: p.success_metrics as unknown as string[],
			}))

		// 5. AI 建議
		const suggestions: AISuggestion[] = (dbSuggestions || [])
			.filter((s) => s.version_id === v.id)
			.map((s) => ({
				category: s.category,
				title: s.title,
				description: s.description,
				actionItems: s.action_items as unknown as string[],
				impact: s.impact as 'High' | 'Medium' | 'Low',
			}))

		return {
			id: v.id,
			timestamp: new Date(v.created_at).getTime(),
			label: v.label,
			isOrigin: v.is_origin,
			idea: v.idea,
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

// 6. 寫入全新的版本與相關項目
export async function saveNewVersion(projectId: string, version: ProjectVersion, sortOrder: number): Promise<void> {
	const supabase = createClient()

	// 建立 suggestionId 映射表
	const suggestionIdMap = new Map<string, string>()
	const suggestionsToInsert = (version.suggestions || []).map((s, idx) => {
		const sId = s.id || uuidv4()
		suggestionIdMap.set(`ai_s_${idx}`, sId)
		if (s.id) {
			suggestionIdMap.set(s.id, sId)
		}
		return {
			id: sId,
			version_id: version.id,
			category: s.category,
			title: s.title,
			description: s.description,
			action_items: s.actionItems,
			impact: s.impact,
			sort_order: idx,
		}
	})

	// ① 寫入版本主表
	const { error: vError } = await supabase.from('project_versions').insert({
		id: version.id,
		project_id: projectId,
		label: version.label,
		is_origin: version.isOrigin || false,
		idea: version.idea,
		sort_order: sortOrder,
		created_at: new Date(version.timestamp).toISOString(),
	})

	if (vError) throw vError

	// ② 寫入任務
	if (version.tasks.length > 0) {
		const tasksToInsert = version.tasks.map((t, idx) => {
			let sId = t.suggestionId || null
			if (sId && suggestionIdMap.has(sId)) {
				sId = suggestionIdMap.get(sId)!
			} else if (sId && !sId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
				sId = null
			}
			return {
				id: t.id,
				version_id: version.id,
				label: t.label,
				priority: t.priority,
				done: t.done,
				readonly: t.readonly || false,
				suggestion_id: sId,
				sort_order: idx,
			}
		})
		const { error: tError } = await supabase.from('tasks').insert(tasksToInsert)
		if (tError) throw tError
	}

	// ③ 寫入工作流程與步驟
	if (version.workflow && (version.workflow.roleAName || version.workflow.roleBName)) {
		const { data: wf, error: wError } = await supabase
			.from('workflows')
			.insert({
				version_id: version.id,
				role_a_name: version.workflow.roleAName,
				role_b_name: version.workflow.roleBName,
			})
			.select('id')
			.single()

		if (wError) throw wError

		if (wf && version.workflow.steps.length > 0) {
			const stepsToInsert = version.workflow.steps.map((s, idx) => ({
				id: s.id,
				workflow_id: wf.id,
				role_a_step: s.roleAStep,
				role_b_step: s.roleBStep,
				sort_order: idx,
			}))
			const { error: sError } = await supabase.from('workflow_steps').insert(stepsToInsert)
			if (sError) throw sError
		}
	}

	// ④ 寫入 PRD 內容
	if (version.prd) {
		const { error: pError } = await supabase.from('prd_contents').insert({
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
		if (pError) throw pError
	}

	// ⑤ 寫入開發階段
	if (version.phases && version.phases.length > 0) {
		const phasesToInsert = version.phases.map((p, idx) => ({
			version_id: version.id,
			name: p.name,
			timeframe: p.timeframe,
			goal: p.goal,
			deliverables: p.deliverables,
			success_metrics: p.successMetrics,
			sort_order: idx,
		}))
		const { error: phError } = await supabase.from('phases').insert(phasesToInsert)
		if (phError) throw phError
	}

	// ⑥ 寫入建議
	if (suggestionsToInsert.length > 0) {
		const { error: suError } = await supabase.from('suggestions').insert(suggestionsToInsert)
		if (suError) throw suError
	}
}

// 7. 覆寫現有版本細節
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

	// 建立 suggestionId 映射表
	const suggestionIdMap = new Map<string, string>()
	const suggestionsToInsert = (details.suggestions || []).map((s, idx) => {
		const sId = s.id || uuidv4()
		suggestionIdMap.set(`ai_s_${idx}`, sId)
		if (s.id) {
			suggestionIdMap.set(s.id, sId)
		}
		return {
			id: sId,
			version_id: versionId,
			category: s.category,
			title: s.title,
			description: s.description,
			action_items: s.actionItems,
			impact: s.impact,
			sort_order: idx,
		}
	})

	// ① 更新版本主表中的 Idea
	const { error: vError } = await supabase.from('project_versions').update({ idea }).eq('id', versionId)

	if (vError) throw vError

	// ② 刪除此版本原先的所有細節，採用重新插入的方式更新
	await Promise.all([
		supabase.from('tasks').delete().eq('version_id', versionId),
		supabase.from('workflows').delete().eq('version_id', versionId),
		supabase.from('prd_contents').delete().eq('version_id', versionId),
		supabase.from('phases').delete().eq('version_id', versionId),
		supabase.from('suggestions').delete().eq('version_id', versionId),
	])

	// ③ 重新寫入任務
	if (tasks.length > 0) {
		const tasksToInsert = tasks.map((t, idx) => {
			let sId = t.suggestionId || null
			if (sId && suggestionIdMap.has(sId)) {
				sId = suggestionIdMap.get(sId)!
			} else if (sId && !sId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
				sId = null
			}
			return {
				id: t.id,
				version_id: versionId,
				label: t.label,
				priority: t.priority,
				done: t.done,
				readonly: t.readonly || false,
				suggestion_id: sId,
				sort_order: idx,
			}
		})
		const { error: tError } = await supabase.from('tasks').insert(tasksToInsert)
		if (tError) throw tError
	}

	// ④ 重新寫入工作流程
	if (workflow && (workflow.roleAName || workflow.roleBName)) {
		const { data: wf, error: wError } = await supabase
			.from('workflows')
			.insert({
				version_id: versionId,
				role_a_name: workflow.roleAName,
				role_b_name: workflow.roleBName,
			})
			.select('id')
			.single()

		if (wError) throw wError

		if (wf && workflow.steps.length > 0) {
			const stepsToInsert = workflow.steps.map((s, idx) => ({
				id: s.id,
				workflow_id: wf.id,
				role_a_step: s.roleAStep,
				role_b_step: s.roleBStep,
				sort_order: idx,
			}))
			const { error: sError } = await supabase.from('workflow_steps').insert(stepsToInsert)
			if (sError) throw sError
		}
	}

	// ⑤ 重新寫入 PRD 內容
	if (details.prd) {
		const { error: pError } = await supabase.from('prd_contents').insert({
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
		if (pError) throw pError
	}

	// ⑥ 重新寫入開發階段
	if (details.phases && details.phases.length > 0) {
		const phasesToInsert = details.phases.map((p, idx) => ({
			version_id: versionId,
			name: p.name,
			timeframe: p.timeframe,
			goal: p.goal,
			deliverables: p.deliverables,
			success_metrics: p.successMetrics,
			sort_order: idx,
		}))
		const { error: phError } = await supabase.from('phases').insert(phasesToInsert)
		if (phError) throw phError
	}

	// ⑦ 重新寫入建議
	if (suggestionsToInsert.length > 0) {
		const { error: suError } = await supabase.from('suggestions').insert(suggestionsToInsert)
		if (suError) throw suError
	}
}

// 8. 釘選版本
export async function pinProjectVersion(projectId: string, versionId: string): Promise<void> {
	const supabase = createClient()
	const { error } = await supabase.from('projects').update({ pinned_version_id: versionId }).eq('id', projectId)

	if (error) throw error
}

// 9. 讀取 API Key 設定
export async function fetchUserSettings(): Promise<string> {
	const supabase = createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) return ''

	const { data, error } = await supabase.from('user_settings').select('encrypted_api_key').eq('user_id', user.id).single()

	if (error) {
		if (error.code === 'PGRST116') return '' // 尚無設定
		throw error
	}

	return data?.encrypted_api_key ?? ''
}

// 10. 儲存 API Key 設定
export async function saveUserSettings(apiKey: string): Promise<void> {
	const supabase = createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) throw new Error('未登入使用者')

	const { error } = await supabase.from('user_settings').upsert(
		{
			user_id: user.id,
			encrypted_api_key: apiKey,
			updated_at: new Date().toISOString(),
		},
		{
			onConflict: 'user_id',
		},
	)

	if (error) throw error
}

// 11. 調用資料庫 pgvector 計算進行語意相似度比對
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
	const filtered = rows.filter((p) => p.id !== projectId)
	if (filtered.length === 0) return null

	return filtered[0]
}

// 12. 刪除特定專案版本
export async function deleteProjectVersion(versionId: string): Promise<void> {
	const supabase = createClient()
	const { error } = await supabase.from('project_versions').delete().eq('id', versionId)

	if (error) throw error
}

// 13. 批次更新多個專案版本的 Label 與 Sort Order
export async function updateVersionsMeta(
	updates: { id: string; label: string; sort_order: number }[]
): Promise<void> {
	const supabase = createClient()

	await Promise.all(
		updates.map(async (u) => {
			const { error } = await supabase
				.from('project_versions')
				.update({ label: u.label, sort_order: u.sort_order })
				.eq('id', u.id)
			if (error) throw error
		})
	)
}

