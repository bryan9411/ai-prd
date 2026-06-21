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

		// 1. 區分原始版本和現有的編輯版本
		const origin = versions.find((v) => v.isOrigin)
		const edits = versions.filter((v) => !v.isOrigin)

		// 2. 限制編輯版本最多為 2 個。若加上新的會變成 3 個，需刪除最舊的
		const MAX_EDIT_VERSIONS = 2
		const nextEdits = [...edits]

		// 建立新版本
		const newVersion = buildVersion(idea, tasks, workflow, false, { prd: prd ?? undefined, phases, suggestions })

		// 如果已經有 2 個編輯版本，需要刪除最舊的
		if (nextEdits.length >= MAX_EDIT_VERSIONS) {
			const oldVersion = nextEdits.shift() // 移出最舊的
			if (oldVersion) {
				await deleteProjectVersion(oldVersion.id)
			}
		}

		// 將新版本推入
		nextEdits.push(newVersion)

		// 3. 重新標籤與設定 sort_order
		// 原始版本 sort_order 為 0, label 為 '原始版本'
		// 第一個編輯版本 (i=0) -> label: '版本 2', sort_order: 1
		// 第二個編輯版本 (i=1) -> label: '版本 3', sort_order: 2
		const updatedEdits = nextEdits.map((v, i) => {
			return {
				...v,
				label: `版本 ${i + 2}`,
			}
		})

		const nextVersions = origin ? [origin, ...updatedEdits] : updatedEdits

		// 4. 同步資料庫：更新舊編輯版本的 label 與 sort_order；寫入新版本
		// 需要更新的舊編輯版本 (排除最後一個剛剛建立的新版本)
		const updatesToDb = updatedEdits
			.slice(0, -1) // 排除新版本，新版本用 saveNewVersion
			.map((v, idx) => ({
				id: v.id,
				label: v.label,
				sort_order: idx + 1,
			}))

		if (updatesToDb.length > 0) {
			await updateVersionsMeta(updatesToDb)
		}

		// 寫入新版本 (它的 sortOrder 是 updatedEdits.length)
		const newVersionIndex = updatedEdits.length - 1
		const newVersionFinal = updatedEdits[newVersionIndex]
		await saveNewVersion(projectId, newVersionFinal, newVersionIndex + 1)

		// 5. 更新 Zustand 狀態
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

		const nextVersions = versions.map((v) => {
			if (v.id !== versionId) return v
			return {
				...v,
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
