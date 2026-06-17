import type { StateCreator } from 'zustand'
import { loadProjectData, saveProjectData } from '@/lib/project-storage'
import { buildVersion, pushVersion, overwriteVersion } from '@/lib/project-utils'
import type { ProjectVersion } from '@/types/project'
import type { ProjectStore, VersionSlice } from '../types'
import { emptyWorkflow } from '../types'

export const createVersionSlice: StateCreator<ProjectStore, [], [], VersionSlice> = (set, get) => ({
	versions: [] as ProjectVersion[],
	activeVersionId: null as string | null,
	pinnedVersionId: null as string | null,
	isSaveSuccess: false,

	saveVersion: () => {
		const { submitted, isDirty, idea, tasks, workflow, prd, phases, suggestions, projectId } = get()

		if (!submitted || !isDirty) return

		const data = loadProjectData(projectId) ?? { versions: [] }
		const newVersion = buildVersion(idea, tasks, workflow, false, { prd: prd ?? undefined, phases, suggestions })
		const nextVersions = pushVersion(data.versions, newVersion)

		saveProjectData(projectId, { versions: nextVersions, pinnedVersionId: data.pinnedVersionId })

		set({ versions: nextVersions, activeVersionId: newVersion.id, isDirty: false, isSaveSuccess: true })
		setTimeout(() => set({ isSaveSuccess: false }), 2000)
	},

	saveOverwrite: (versionId: string) => {
		const { submitted, isDirty, idea, tasks, workflow, versions, prd, phases, suggestions, projectId } = get()

		if (!submitted || !isDirty) return

		const target = versions.find((version) => version.id === versionId)

		if (!target || target.isOrigin) return

		const data = loadProjectData(projectId) ?? { versions: [] }
		const nextVersions = overwriteVersion(data.versions, versionId, idea, tasks, workflow, {
			prd: prd ?? undefined,
			phases,
			suggestions,
		})

		saveProjectData(projectId, { versions: nextVersions, pinnedVersionId: data.pinnedVersionId })

		set({ versions: nextVersions, activeVersionId: versionId, isDirty: false, isSaveSuccess: true })
		setTimeout(() => set({ isSaveSuccess: false }), 2000)
	},

	pinVersion: (versionId: string) => {
		const { versions, projectId } = get()

		const version = versions.find((version) => version.id === versionId)

		if (!version) return

		const data = loadProjectData(projectId)

		if (data) {
			saveProjectData(projectId, { ...data, pinnedVersionId: versionId })
		}

		set({
			idea: version.idea,
			tasks: version.tasks,
			workflow: version.workflow ?? emptyWorkflow,
			prd: version.prd ?? null,
			phases: version.phases ?? [],
			suggestions: version.suggestions ?? [],
			activeVersionId: versionId,
			pinnedVersionId: versionId,
			isDirty: false,
		})
	},

	loadVersion: (versionId: string) => {
		const { versions } = get()

		const version = versions.find((version) => version.id === versionId)

		if (!version) return

		set({
			idea: version.idea,
			tasks: version.tasks,
			workflow: version.workflow ?? emptyWorkflow,
			prd: version.prd ?? null,
			phases: version.phases ?? [],
			suggestions: version.suggestions ?? [],
			activeVersionId: versionId,
			isDirty: false,
		})
	},
})
