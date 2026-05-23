import type { Task, Priority } from '@/components/workspace/TabPanel/TasksContent/types'
import type { Step } from '@/components/workspace/TabPanel/WorkflowContent/types'
import type { PRDContent, AIPhase, AISuggestion } from '@/lib/ai-schema'

export type { Task, Priority, Step }
export type { PRDContent, AIPhase, AISuggestion }

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
	steps: Step[]
	prd?: PRDContent
	phases?: AIPhase[]
	suggestions?: AISuggestion[]
}

export interface ProjectData {
	versions: ProjectVersion[]
	pinnedVersionId?: string
}
