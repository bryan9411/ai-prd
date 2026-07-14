import type { StateCreator } from 'zustand'
import { buildVersion } from '@/lib/project-utils'
import { saveNewVersion, overwriteVersion, pinProjectVersion, deleteProjectVersion, updateVersionsMeta } from '@/lib/supabase/db'
import type { ProjectStore, VersionSlice } from '../types'
import { emptyWorkflow } from '../types'

export const createVersionSlice: StateCreator<ProjectStore, [], [], VersionSlice> = (set, get) => ({
	versions: [],
	activeVersionId: null,
	pinnedVersionId: null,
	isSaveSuccess: false,

	saveVersion: async () => {
		const { submitted, isDirty, idea, tasks, workflow, prd, phases, suggestions, projectId, versions } = get()

		if (!submitted || !isDirty) return

		// 把 AI 第一次產生的 origin 版本跟使用者自己改過的 edits 分開
		const origin = versions.find((version) => version.isOrigin)
		const edits = versions.filter((version) => !version.isOrigin)

		// 限制編輯版本最多 2 個（連同原始版本共 3 個），若超過就刪除最舊的編輯版
		const MAX_EDIT_VERSIONS = 2
		const nextEdits = [...edits]

		const newVersion = buildVersion(idea, tasks, workflow, false, { prd: prd ?? undefined, phases, suggestions })

		if (nextEdits.length >= MAX_EDIT_VERSIONS) {
			const oldVersion = nextEdits.shift()
			if (oldVersion) {
				await deleteProjectVersion(oldVersion.id)
			}
		}

		nextEdits.push(newVersion)

		// 重新幫編輯版本排序和命名（版本 2, 版本 3...）
		const updatedEdits = nextEdits.map((version, idx) => {
			return {
				...version,
				label: `版本 ${idx + 2}`,
			}
		})

		const nextVersions = origin ? [origin, ...updatedEdits] : updatedEdits

		// 同步更新資料庫：把剩餘的舊編輯版本排序與標籤寫回，再插入這次的新版本
		const updatesToDb = updatedEdits
			.slice(0, -1)
			.map((version, idx) => ({
				id: version.id,
				label: version.label,
				sort_order: idx + 1,
			}))

		if (updatesToDb.length > 0) {
			await updateVersionsMeta(updatesToDb)
		}

		const newVersionIndex = updatedEdits.length - 1
		const newVersionFinal = updatedEdits[newVersionIndex]
		await saveNewVersion(projectId, newVersionFinal, newVersionIndex + 1)

		// 成功儲存後更新 Zustand State，並觸發 2 秒的儲存成功 UI 提示
		set({ versions: nextVersions, activeVersionId: newVersionFinal.id, isDirty: false, isSaveSuccess: true })
		setTimeout(() => set({ isSaveSuccess: false }), 2000)
	},

	saveOverwrite: async (versionId: string) => {
		const { submitted, isDirty, idea, tasks, workflow, versions, prd, phases, suggestions } = get()

		if (!submitted || !isDirty) return

		const target = versions.find((version) => version.id === versionId)

		if (!target || target.isOrigin) return

		await overwriteVersion(versionId, idea, tasks, workflow, {
			prd: prd ?? undefined,
			phases,
			suggestions,
		})

		const nextVersions = versions.map((version) => {
			if (version.id !== versionId) return version
			return {
				...version,
				idea,
				tasks,
				workflow,
				prd: prd ?? undefined,
				phases,
				suggestions,
			}
		})

		set({ versions: nextVersions, activeVersionId: versionId, isDirty: false, isSaveSuccess: true })
		setTimeout(() => set({ isSaveSuccess: false }), 2000)
	},

	pinVersion: async (versionId: string) => {
		const { versions, projectId } = get()

		const version = versions.find((version) => version.id === versionId)

		if (!version) return

		await pinProjectVersion(projectId, versionId)

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
