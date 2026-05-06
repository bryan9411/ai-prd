export type Priority = 'High' | 'Medium' | 'Low'

export interface Task {
	id: string
	label: string
	priority: Priority
	done: boolean
	readonly?: boolean
	suggestionId?: string
}
