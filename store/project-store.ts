import type { ProjectMeta, ProjectData } from '@/types/project'

const PROJECTS_KEY = 'prd_projects'

export const defaultProjects: ProjectMeta[] = [
	{ id: '1', name: 'Fitness App', color: 'bg-violet-500' },
	{ id: '2', name: 'Blog Platform', color: 'bg-sky-500' },
	{ id: '3', name: 'E-Commerce', color: 'bg-emerald-500' },
]

export const loadProjects = (): ProjectMeta[] => {
	if (typeof window === 'undefined') {
		return defaultProjects
	}

	try {
		const raw = localStorage.getItem(PROJECTS_KEY)

		if (!raw) {
			return defaultProjects
		}

		const parsed = JSON.parse(raw) as ProjectMeta[]

		return parsed.length > 0 ? parsed : defaultProjects
	} catch {
		return defaultProjects
	}
}

export const saveProjects = (projects: ProjectMeta[]): void => {
	if (typeof window === 'undefined') return
	localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
}

// ---- 單一專案的 PRD 內容（versions / tasks / workflow / ai suggestions） ----

const projectKey = (projectId: string) => `prd_project_${projectId}`

export const loadProjectData = (projectId: string): ProjectData | null => {
	if (typeof window === 'undefined') return null

	try {
		const raw = localStorage.getItem(projectKey(projectId))

		if (!raw) return null

		return JSON.parse(raw) as ProjectData
	} catch {
		return null
	}
}

export const saveProjectData = (projectId: string, data: ProjectData): void => {
	if (typeof window === 'undefined') return
	localStorage.setItem(projectKey(projectId), JSON.stringify(data))
}
