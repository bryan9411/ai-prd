import type { Task, WorkflowData, ProjectVersion, ProjectMeta } from '@/types/project'
import type { PRDContent, AIPhase, AISuggestion } from '@/lib/ai-schema'

export interface ProjectSlice {
	projectId: string
	submitted: boolean
	idea: string
	initProject: (projectId: string) => Promise<void>
	setIdea: (idea: string) => void
	removeProject: () => Promise<void>
}

export interface AISlice {
	loading: boolean
	generateError: string | null
	validationError: string | null
	similarProject: { meta: ProjectMeta; similarity: number; currentEmbedding: number[] } | null
	generate: () => Promise<void>
	clearGenerateError: () => void
	clearValidationError: () => void
	loadSimilarProject: () => Promise<void>
	forceGenerate: () => Promise<void>
}

export interface ContentSlice {
	tasks: Task[]
	workflow: WorkflowData
	prd: PRDContent | null
	phases: AIPhase[]
	suggestions: AISuggestion[]
	isDirty: boolean
	updateTasks: (tasks: Task[]) => void
	updateWorkflow: (workflow: WorkflowData) => void
}

export interface VersionSlice {
	versions: ProjectVersion[]
	activeVersionId: string | null
	pinnedVersionId: string | null
	isSaveSuccess: boolean
	saveVersion: () => Promise<void>
	saveOverwrite: (versionId: string) => Promise<void>
	loadVersion: (versionId: string) => void
	pinVersion: (versionId: string) => Promise<void>
}

export type ProjectStore = ProjectSlice & AISlice & ContentSlice & VersionSlice

export const emptyWorkflow: WorkflowData = { roleAName: '', roleBName: '', steps: [] }

export const emptyState = {
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
