import type { StateCreator } from 'zustand'
import { fetchProjectData, deleteProject } from '@/lib/supabase/db'
import { emptyState, emptyWorkflow } from '../types'
import type { ProjectStore, ProjectSlice } from '../types'

export const createProjectSlice: StateCreator<ProjectStore, [], [], ProjectSlice> = (set, get) => ({
	projectId: '',
	submitted: false,
	idea: '',

	initProject: async (projectId: string) => {
		if (!projectId) {
			return set({ projectId: '', ...emptyState })
		}

		const data = await fetchProjectData(projectId)

		if (data && data.versions.length > 0) {
			const versions = data.versions
			const pinnedId = data.pinnedVersionId ?? null
			const activeVersion = pinnedId
				? (versions.find((v) => v.id === pinnedId) ?? versions[versions.length - 1])
				: versions[versions.length - 1]

			set({
				projectId,
				submitted: true,
				loading: false,
				idea: activeVersion.idea,
				tasks: activeVersion.tasks,
				workflow: activeVersion.workflow ?? emptyWorkflow,
				prd: activeVersion.prd ?? null,
				phases: activeVersion.phases ?? [],
				suggestions: activeVersion.suggestions ?? [],
				isDirty: false,
				versions,
				activeVersionId: activeVersion.id,
				pinnedVersionId: pinnedId,
				isSaveSuccess: false,
				generateError: null,
			})

			return
		}

		set({ projectId, ...emptyState })
	},

	setIdea: (idea: string) => {
		set({ idea })
	},

	removeProject: async () => {
		const { projectId } = get()

		if (projectId) {
			await deleteProject(projectId)
		}

		set({ ...emptyState })
	},
})
