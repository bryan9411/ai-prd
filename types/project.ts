import type { PRDContent, AIPhase, AISuggestion } from '@/lib/ai-schema'

export type Priority = 'High' | 'Medium' | 'Low'

export interface Task {
	id: string
	label: string
	priority: Priority
	done: boolean
	readonly?: boolean
	suggestionId?: string
}

export interface WorkflowStep {
	id: string
	roleAStep: string
	roleBStep: string
}

export interface WorkflowData {
	roleAName: string
	roleBName: string
	steps: WorkflowStep[]
}

export interface ProjectMeta {
	id: string
	name: string
	color: string
}

export interface ProjectVersion {
	id: string
	timestamp: number
	label: string
	isOrigin?: boolean // 原始版本
	idea: string
	tasks: Task[]
	workflow: WorkflowData
	prd?: PRDContent
	phases?: AIPhase[]
	suggestions?: AISuggestion[]
}

export interface ProjectData {
	versions: ProjectVersion[]
	pinnedVersionId?: string
}
