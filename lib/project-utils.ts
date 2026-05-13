import { v4 as uuidv4 } from 'uuid'
import type { Task, Step, ProjectVersion } from '@/types/project'

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

const MAX_VERSIONS = 3

export const pickNextColor = (projects: { color: string }[]): string => {
	const used = new Set(projects.map((p) => p.color))

	return PROJECT_COLORS.find((c) => !used.has(c)) ?? PROJECT_COLORS[projects.length % PROJECT_COLORS.length]
}

// 產生專案 ID
export const generateProjectId = () => {
	return uuidv4().split('-')[0]
}

// 建立版本
export const buildVersion = (idea: string, tasks: Task[], steps: Step[], existingCount: number): ProjectVersion => {
	const timestamp = Date.now()

	return {
		id: `v_${timestamp}`,
		timestamp,
		label: `版本 ${existingCount + 1}`,
		idea,
		tasks,
		steps,
	}
}

/**
 * 將新版本推入陣列最前面，超過 MAX_VERSIONS 時刪除最舊的。
 * 回傳新的版本陣列（不 mutate 原陣列）。
 */
export const pushVersion = (versions: ProjectVersion[], newVersion: ProjectVersion): ProjectVersion[] => {
	const next = [newVersion, ...versions]
	return next.length > MAX_VERSIONS ? next.slice(0, MAX_VERSIONS) : next
}
