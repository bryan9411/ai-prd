import type { ProjectMeta, ProjectData } from '@/types/project'

const PROJECTS_KEY = 'prd_projects'

export const loadProjects = (): ProjectMeta[] => {
	if (typeof window === 'undefined') {
		return []
	}

	try {
		const raw = localStorage.getItem(PROJECTS_KEY)

		if (!raw) return []

		const parsed = JSON.parse(raw) as ProjectMeta[]

		return parsed
	} catch {
		return []
	}
}

export const saveProjects = (projects: ProjectMeta[]): void => {
	if (typeof window === 'undefined') return
	localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
}

//  單一專案的 PRD 內容（versions / tasks / workflow / phase / ai suggestions

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

export const updateProjectMeta = (projectId: string, patch: Partial<Omit<ProjectMeta, 'id'>>): void => {
	if (typeof window === 'undefined') return

	const projects = loadProjects()
	const updated = projects.map((p) => (p.id === projectId ? { ...p, ...patch } : p))

	saveProjects(updated)
}
