import type { Task, WorkflowData, ProjectVersion } from '@/types/project'

// 在 import 被測試模組之前先 mock uuid
jest.mock('uuid', () => ({
	v4: jest.fn(),
}))

import { v4 as uuidv4 } from 'uuid'
import { pickNextColor, buildVersion, overwriteVersion, pushVersion, cosineSimilarity } from '@/lib/project-utils'

const mockUuidv4 = uuidv4 as jest.Mock

describe('project-utils', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	// ─── pickNextColor ───────────────────────────────────────

	describe('pickNextColor', () => {
		it('應回傳第一個未被使用的顏色', () => {
			// 準備
			const projects = [{ color: 'bg-violet-500' }, { color: 'bg-sky-500' }]

			// 操作
			const result = pickNextColor(projects)

			// 驗證
			expect(result).toBe('bg-emerald-500')
		})

		it('所有顏色都被使用後應輪轉回傳', () => {
			// 準備：8 個顏色全部用完
			const allColors = [
				'bg-violet-500',
				'bg-sky-500',
				'bg-emerald-500',
				'bg-amber-500',
				'bg-rose-500',
				'bg-indigo-500',
				'bg-teal-500',
				'bg-orange-500',
			]
			const projects = allColors.map((color) => ({ color }))

			// 操作
			const result = pickNextColor(projects)

			// 驗證：projects.length = 8, 8 % 8 = 0，回傳第一個顏色
			expect(result).toBe('bg-violet-500')
		})
	})

	// ─── buildVersion ────────────────────────────────────────

	describe('buildVersion', () => {
		const baseTasks: Task[] = [
			{ id: 'old-task-1', label: '任務一', priority: 'High', done: false },
		]
		const baseWorkflow: WorkflowData = {
			roleAName: '產品經理',
			roleBName: '工程師',
			steps: [{ id: 'old-step-1', roleAStep: '定義需求', roleBStep: '評估技術' }],
		}

		it('isOrigin=true 時 label 為「原始版本」；isOrigin=false 時 label 為「版本」', () => {
			// 準備
			mockUuidv4.mockReturnValue('mock-uuid')

			// 操作
			const origin = buildVersion('我的點子', baseTasks, baseWorkflow, true)
			const edit = buildVersion('我的點子', baseTasks, baseWorkflow, false)

			// 驗證
			expect(origin.label).toBe('原始版本')
			expect(origin.isOrigin).toBe(true)
			expect(edit.label).toBe('版本')
			expect(edit.isOrigin).toBe(false)
		})

		it('tasks 與 workflow steps 應深拷貝並分配新 UUID', () => {
			// 準備
			let callCount = 0
			mockUuidv4.mockImplementation(() => `uuid-${callCount++}`)

			// 操作
			const result = buildVersion('我的點子', baseTasks, baseWorkflow)

			// 驗證：tasks 有新 UUID 且內容保留
			expect(result.tasks[0].id).not.toBe('old-task-1')
			expect(result.tasks[0].label).toBe('任務一')

			// 驗證：workflow steps 有新 UUID 且內容保留
			expect(result.workflow.steps[0].id).not.toBe('old-step-1')
			expect(result.workflow.steps[0].roleAStep).toBe('定義需求')
		})

		it('suggestions 的 suggestionId 應正確重新映射到 tasks', () => {
			// 準備
			let callCount = 0
			mockUuidv4.mockImplementation(() => `uuid-${callCount++}`)

			const tasksWithSuggestion: Task[] = [
				{ id: 'old-task', label: '任務', priority: 'High', done: false, suggestionId: 'ai_s_0' },
			]
			const aiData = {
				suggestions: [
					{
						id: 'old-suggestion',
						category: '技術',
						title: '建議',
						description: '說明',
						actionItems: ['做法'],
						impact: 'High' as const,
					},
				],
			}

			// 操作
			const result = buildVersion('點子', tasksWithSuggestion, baseWorkflow, false, aiData)

			// 驗證：suggestion 有新 ID
			const newSuggestionId = result.suggestions![0].id
			expect(newSuggestionId).not.toBe('old-suggestion')

			// 驗證：task 的 suggestionId 已映射到新的 suggestion ID
			expect(result.tasks[0].suggestionId).toBe(newSuggestionId)
		})
	})

	// ─── overwriteVersion ────────────────────────────────────

	describe('overwriteVersion', () => {
		it('應覆蓋匹配版本的內容，不匹配的保持不變', () => {
			// 準備
			const versions: ProjectVersion[] = [
				{
					id: 'v1',
					timestamp: 1000,
					label: '原始版本',
					isOrigin: true,
					idea: '舊點子',
					tasks: [],
					workflow: { roleAName: 'A', roleBName: 'B', steps: [] },
				},
				{
					id: 'v2',
					timestamp: 2000,
					label: '版本 2',
					idea: '舊編輯',
					tasks: [],
					workflow: { roleAName: 'A', roleBName: 'B', steps: [] },
				},
			]
			const newTasks: Task[] = [{ id: 't1', label: '新任務', priority: 'Medium', done: false }]
			const newWorkflow: WorkflowData = { roleAName: 'PM', roleBName: 'Dev', steps: [] }

			// 操作
			const result = overwriteVersion(versions, 'v2', '新點子', newTasks, newWorkflow)

			// 驗證：匹配的版本被覆蓋，id 與 label 不變
			expect(result[1].idea).toBe('新點子')
			expect(result[1].tasks).toEqual(newTasks)
			expect(result[1].id).toBe('v2')
			expect(result[1].label).toBe('版本 2')

			// 驗證：不匹配的版本不受影響
			expect(result[0].idea).toBe('舊點子')
		})
	})

	// ─── pushVersion ─────────────────────────────────────────

	describe('pushVersion', () => {
		const makeVersion = (overrides: Partial<ProjectVersion> = {}): ProjectVersion => ({
			id: 'test-id',
			timestamp: Date.now(),
			label: '版本',
			idea: '測試',
			tasks: [],
			workflow: { roleAName: 'A', roleBName: 'B', steps: [] },
			...overrides,
		})

		it('應將 origin 版本推入空陣列', () => {
			// 準備
			const origin = makeVersion({ id: 'origin', isOrigin: true, label: '原始版本' })

			// 操作
			const result = pushVersion([], origin)

			// 驗證
			expect(result).toHaveLength(1)
			expect(result[0].isOrigin).toBe(true)
		})

		it('已有 origin 時不應重複建立', () => {
			// 準備
			const existing = [makeVersion({ id: 'origin', isOrigin: true })]
			const duplicate = makeVersion({ id: 'origin-2', isOrigin: true })

			// 操作
			const result = pushVersion(existing, duplicate)

			// 驗證
			expect(result).toHaveLength(1)
			expect(result[0].id).toBe('origin')
		})

		it('編輯版本超過上限時應移除最舊的，並自動重新標籤', () => {
			// 準備：MAX_EDIT_VERSIONS = 2，已有 origin + 2 個編輯版本
			const origin = makeVersion({ id: 'origin', isOrigin: true })
			const edit1 = makeVersion({ id: 'edit-1', label: '版本 2' })
			const edit2 = makeVersion({ id: 'edit-2', label: '版本 3' })
			const edit3 = makeVersion({ id: 'edit-3', label: '新版本' })

			// 操作：再推一個編輯版本
			const result = pushVersion([origin, edit1, edit2], edit3)

			// 驗證：只保留最新的 2 個編輯版本
			expect(result).toHaveLength(3) // origin + 2 edits
			expect(result[0].isOrigin).toBe(true)

			// edit1 被移除，保留 edit2 和 edit3
			const editIds = result.filter((v) => !v.isOrigin).map((v) => v.id)
			expect(editIds).toEqual(['edit-2', 'edit-3'])

			// 標籤自動重新編號
			expect(result[1].label).toBe('版本 2')
			expect(result[2].label).toBe('版本 3')
		})
	})

	// ─── cosineSimilarity ────────────────────────────────────

	describe('cosineSimilarity', () => {
		it('相同向量應回傳 1', () => {
			const vec = [1, 2, 3]
			expect(cosineSimilarity(vec, vec)).toBeCloseTo(1)
		})

		it('不同長度的向量應回傳 0', () => {
			expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(0)
		})
	})
})
