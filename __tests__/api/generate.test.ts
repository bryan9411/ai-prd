/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

// Mock OpenAI SDK
jest.mock('openai', () => ({
	__esModule: true,
	default: jest.fn(),
}))

import OpenAI from 'openai'
import { POST } from '@/app/api/generate/route'

const mockChatCreate = jest.fn()

// 輔助函式：建立測試用 NextRequest
const buildRequest = (options: {
	headers?: Record<string, string>
	body?: unknown
	invalidJson?: boolean
}) => {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
		...(options.headers || {}),
	}
	const init: RequestInit = { method: 'POST', headers }

	if (options.invalidJson) {
		init.body = 'not-json'
	} else if (options.body !== undefined) {
		init.body = JSON.stringify(options.body)
	}

	return new NextRequest('http://localhost/api/generate', init as any)
}

describe('POST /api/generate', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		;(OpenAI as unknown as jest.Mock).mockImplementation(() => ({
			chat: { completions: { create: mockChatCreate } },
		}))
	})

	it('Authorization header 缺失或 token 為空時應回傳 401', async () => {
		// 情境 1：完全沒有 Authorization header
		const res1 = await POST(buildRequest({ body: { idea: '開一間咖啡店' } }))
		expect(res1.status).toBe(401)

		// 情境 2：Bearer 後面只有空白
		const res2 = await POST(
			buildRequest({
				headers: { Authorization: 'Bearer    ' },
				body: { idea: '開一間咖啡店' },
			}),
		)
		expect(res2.status).toBe(401)
	})

	it('request body 不是合法 JSON 時應回傳 400', async () => {
		// 操作
		const res = await POST(
			buildRequest({
				headers: { Authorization: 'Bearer sk-test-key' },
				invalidJson: true,
			}),
		)

		// 驗證
		expect(res.status).toBe(400)
		const data = await res.json()
		expect(data.error).toBe('請求格式錯誤')
	})

	it('idea 為空時應回傳 400', async () => {
		// 操作
		const res = await POST(
			buildRequest({
				headers: { Authorization: 'Bearer sk-test-key' },
				body: { idea: '' },
			}),
		)

		// 驗證
		expect(res.status).toBe(400)
		const data = await res.json()
		expect(data.error).toBe('缺少產品構想內容')
	})

	it('正常請求應回傳 AIGenerateOutput 結構', async () => {
		// 準備
		const mockOutput = {
			prd: {
				tagline: '測試標語',
				overview: '概述',
				productGoal: '目標',
				sectionLabels: {
					userPersonas: '使用者角色',
					features: '核心功能',
					systemModules: '系統模組',
					dataModels: '資料模型',
					valuePropositions: '價值主張',
				},
				userPersonas: [{ name: '使用者', description: '描述' }],
				features: [
					{ name: '功能一', description: '說明', icon: '⭐' },
					{ name: '功能二', description: '說明', icon: '🔥' },
					{ name: '功能三', description: '說明', icon: '💡' },
				],
				systemModules: [
					{ name: '模組一', description: '說明' },
					{ name: '模組二', description: '說明' },
				],
				dataModels: [
					{ name: '模型一', description: '說明' },
					{ name: '模型二', description: '說明' },
				],
				valuePropositions: ['價值一', '價值二'],
			},
			tasks: [{ label: '任務一', priority: 'High' }],
			workflow: {
				roleAName: '產品經理',
				roleBName: '工程師',
				steps: [{ roleAStep: '定義需求', roleBStep: '評估技術' }],
			},
			phases: [
				{
					name: '第一階段',
					timeframe: '1-2 週',
					goal: '目標',
					deliverables: ['交付物一'],
					successMetrics: ['指標一'],
				},
				{
					name: '第二階段',
					timeframe: '3-4 週',
					goal: '目標',
					deliverables: ['交付物二'],
					successMetrics: ['指標二'],
				},
				{
					name: '第三階段',
					timeframe: '5-6 週',
					goal: '目標',
					deliverables: ['交付物三'],
					successMetrics: ['指標三'],
				},
			],
			suggestions: [
				{
					category: '技術',
					title: '建議一',
					description: '說明',
					actionItems: ['做法一', '做法二'],
					impact: 'High',
				},
			],
		}

		mockChatCreate.mockResolvedValue({
			choices: [{ message: { content: JSON.stringify(mockOutput) } }],
		})

		// 操作
		const res = await POST(
			buildRequest({
				headers: { Authorization: 'Bearer sk-test-key' },
				body: { idea: '開一間咖啡店' },
			}),
		)

		// 驗證
		expect(res.status).toBe(200)
		const data = await res.json()
		expect(data.prd.tagline).toBe('測試標語')
		expect(data.tasks).toHaveLength(1)
		expect(data.workflow.roleAName).toBe('產品經理')
		expect(data.phases).toHaveLength(3)
		expect(data.suggestions).toHaveLength(1)
	})

	it('AI 回傳空內容或 OpenAI 錯誤時應回傳對應錯誤', async () => {
		// 情境 1：AI 回傳空內容 → 500
		mockChatCreate.mockResolvedValue({
			choices: [{ message: { content: null } }],
		})

		const res1 = await POST(
			buildRequest({
				headers: { Authorization: 'Bearer sk-test-key' },
				body: { idea: '開一間咖啡店' },
			}),
		)
		expect(res1.status).toBe(500)
		const data1 = await res1.json()
		expect(data1.error).toBe('AI 未回傳內容，請再試一次')

		// 情境 2：OpenAI 回傳 401 → 對應錯誤
		mockChatCreate.mockRejectedValue({
			status: 401,
			message: 'Invalid API key',
			error: { message: 'Invalid API key' },
		})

		const res2 = await POST(
			buildRequest({
				headers: { Authorization: 'Bearer sk-test-key' },
				body: { idea: '開一間咖啡店' },
			}),
		)
		expect(res2.status).toBe(401)
		const data2 = await res2.json()
		expect(data2.error).toBe('API Key 無效，請確認金鑰是否正確')
	})
})
