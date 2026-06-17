import type { StateCreator } from 'zustand'
import type { Task, WorkflowData } from '@/types/project'
import type { PRDContent, AIPhase, AISuggestion } from '@/lib/ai-schema'
import type { ProjectStore, ContentSlice } from '../types'
import { emptyWorkflow } from '../types'

export const createContentSlice: StateCreator<ProjectStore, [], [], ContentSlice> = (set) => ({
	tasks: [] as Task[],
	workflow: emptyWorkflow,
	prd: null as PRDContent | null,
	phases: [] as AIPhase[],
	suggestions: [] as AISuggestion[],
	isDirty: false,

	updateTasks: (tasks: Task[]) => {
		set({ tasks, isDirty: true })
	},

	updateWorkflow: (workflow: WorkflowData) => {
		set({ workflow, isDirty: true })
	},
})
