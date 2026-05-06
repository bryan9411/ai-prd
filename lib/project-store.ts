import type { Task, Priority } from '@/components/workspace/TabPanel/TasksContent/types'
import type { Step } from '@/components/workspace/TabPanel/WorkflowContent/types'

export type { Task, Priority, Step }

// ── Types ────────────────────────────────────────────────

export interface ProjectVersion {
	id: string
	timestamp: number
	/** 顯示用標籤，如「版本 1」 */
	label: string
	idea: string
	tasks: Task[]
	steps: Step[]
}

export interface ProjectData {
	/** index 0 = 最新版本，最多 3 筆 */
	versions: ProjectVersion[]
}

// ── Constants ────────────────────────────────────────────

const MAX_VERSIONS = 3

function storageKey(projectId: number) {
	return `prd_project_${projectId}`
}

// ── Utilities ────────────────────────────────────────────

export function loadProjectData(projectId: number): ProjectData | null {
	if (typeof window === 'undefined') return null
	try {
		const raw = localStorage.getItem(storageKey(projectId))
		if (!raw) return null
		return JSON.parse(raw) as ProjectData
	} catch {
		return null
	}
}

export function saveProjectData(projectId: number, data: ProjectData): void {
	if (typeof window === 'undefined') return
	localStorage.setItem(storageKey(projectId), JSON.stringify(data))
}

export function buildVersion(
	idea: string,
	tasks: Task[],
	steps: Step[],
	existingCount: number,
): ProjectVersion {
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
export function pushVersion(
	versions: ProjectVersion[],
	newVersion: ProjectVersion,
): ProjectVersion[] {
	const next = [newVersion, ...versions]
	if (next.length > MAX_VERSIONS) {
		return next.slice(0, MAX_VERSIONS)
	}
	return next
}
