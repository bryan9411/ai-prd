import type { Task, Priority } from '@/components/workspace/TabPanel/TasksContent/types'
import type { Step } from '@/components/workspace/TabPanel/WorkflowContent/types'

export type { Task, Priority, Step }

export interface ProjectMeta {
	id: string
	name: string
	color: string
}

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
