import { v4 as uuidv4 } from 'uuid'
import type { Task, WorkflowData, ProjectVersion } from '@/types/project'
import type { PRDContent, AIPhase, AISuggestion } from '@/lib/ai-schema'

type AIVersionData = {
	prd?: PRDContent
	phases?: AIPhase[]
	suggestions?: AISuggestion[]
}

const PROJECT_COLORS = [
	'bg-violet-500',
	'bg-sky-500',
	'bg-emerald-500',
	'bg-amber-500',
	'bg-rose-500',
	'bg-indigo-500',
	'bg-teal-500',
	'bg-orange-500',
]

const MAX_EDIT_VERSIONS = 2 // 原始版本(不可以編輯) + 最多 2 個編輯版本 = 共 3 筆

export const pickNextColor = (projects: { color: string }[]): string => {
	const usedColors = new Set(projects.map((project) => project.color))

	const availableColor = PROJECT_COLORS.find((color) => {
		return !usedColors.has(color)
	})

	if (availableColor) {
		return availableColor
	}

	return PROJECT_COLORS[projects.length % PROJECT_COLORS.length]
}

export const generateProjectId = () => {
	return uuidv4().split('-')[0]
}

/**
 * 建立版本
 * @param isOrigin true = 生成後自動存的原始版本
 * @param aiData AI 生成的 prd / phases / suggestions
 */
export const buildVersion = (
	idea: string,
	tasks: Task[],
	workflow: WorkflowData,
	isOrigin = false,
	aiData?: AIVersionData,
): ProjectVersion => {
	const timestamp = Date.now()

	// 建立 suggestionId 映射表並為 suggestions 生成新的 UUID
	const suggestionIdMap = new Map<string, string>()
	const clonedSuggestions = aiData?.suggestions?.map((s, idx) => {
		const newId = uuidv4()

		if (s.id) {
			suggestionIdMap.set(s.id, newId)
		}

		suggestionIdMap.set(`ai_s_${idx}`, newId)
		return {
			...s,
			id: newId,
		}
	})

	// 複製任務並指派新的 UUID
	const clonedTasks = tasks.map((t) => {
		let nextSuggestionId = t.suggestionId || undefined
		if (nextSuggestionId && suggestionIdMap.has(nextSuggestionId)) {
			nextSuggestionId = suggestionIdMap.get(nextSuggestionId)
		}
		return {
			...t,
			id: uuidv4(),
			suggestionId: nextSuggestionId,
		}
	})

	// 複製工作流程與步驟，並指派新的 UUID
	const clonedWorkflow: WorkflowData = {
		roleAName: workflow.roleAName,
		roleBName: workflow.roleBName,
		steps: (workflow.steps || []).map((s) => ({
			...s,
			id: uuidv4(),
		})),
	}

	return {
		id: uuidv4(),
		timestamp,
		label: isOrigin ? '原始版本' : '版本',
		isOrigin,
		idea,
		tasks: clonedTasks,
		workflow: clonedWorkflow,
		...(aiData?.prd !== undefined && { prd: aiData.prd }),
		...(aiData?.phases !== undefined && { phases: aiData.phases }),
		...(clonedSuggestions !== undefined && { suggestions: clonedSuggestions }),
	}
}

/**
 * 原地覆蓋指定版本的內容（不改變 id、label、isOrigin）
 * 只更新 idea / tasks / steps / timestamp
 */
export const overwriteVersion = (
	versions: ProjectVersion[],
	targetId: string,
	idea: string,
	tasks: Task[],
	workflow: WorkflowData,
	aiData?: AIVersionData,
): ProjectVersion[] => {
	return versions.map((version) => {
		if (version.id !== targetId) return version

		return {
			...version,
			idea,
			tasks,
			workflow,
			timestamp: Date.now(),
			...(aiData?.prd !== undefined && { prd: aiData.prd }),
			...(aiData?.phases !== undefined && { phases: aiData.phases }),
			...(aiData?.suggestions !== undefined && { suggestions: aiData.suggestions }),
		}
	})
}

/**
 * 將新版本推入陣列。
 * - isOrigin = true：只有在還沒有 origin 時才加入（防止重複）
 * - isOrigin = false：加到編輯版本尾端，超過 MAX_EDIT_VERSIONS 時刪最舊的編輯版，並重新標籤
 * 順序：[原始版本, 版本 2（較舊）, 版本 3（最新）]
 */
export const pushVersion = (versions: ProjectVersion[], newVersion: ProjectVersion): ProjectVersion[] => {
	if (newVersion.isOrigin) {
		// 已有 origin 就不重複建立
		const hasOrigin = versions.some((version) => version.isOrigin)
		if (hasOrigin) return versions

		return [newVersion]
	}

	const origin = versions.find((version) => version.isOrigin)
	const edits = versions.filter((version) => !version.isOrigin)

	const nextEdits = [...edits, newVersion]
	const trimmed =
		nextEdits.length > MAX_EDIT_VERSIONS ? nextEdits.slice(nextEdits.length - MAX_EDIT_VERSIONS) : nextEdits

	// 重新標籤：版本 2, 版本 3
	const relabeled = trimmed.map((value, i) => {
		return { ...value, label: `版本 ${i + 2}` }
	})

	return origin ? [origin, ...relabeled] : relabeled
}

/**
 * 計算兩個向量的餘弦相似度，範圍 -1 ~ 1，越接近 1 表示越相似。
 * 用於比對兩個 embedding 向量的語意距離。
 */
export const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
	if (vecA.length !== vecB.length || vecA.length === 0) return 0

	let dotProduct = 0
	let sumOfSquaresA = 0
	let sumOfSquaresB = 0

	for (let i = 0; i < vecA.length; i++) {
		dotProduct += vecA[i] * vecB[i]
		sumOfSquaresA += vecA[i] * vecA[i]
		sumOfSquaresB += vecB[i] * vecB[i]
	}

	const magnitudeA = Math.sqrt(sumOfSquaresA)
	const magnitudeB = Math.sqrt(sumOfSquaresB)

	if (magnitudeA === 0 || magnitudeB === 0) return 0

	return dotProduct / (magnitudeA * magnitudeB)
}
