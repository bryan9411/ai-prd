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
import { POST } from '@/app/api/pre-check/route'

const mockChatCreate = jest.fn()
const mockEmbeddingsCreate = jest.fn()

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

	return new NextRequest('http://localhost/api/pre-check', init as any)
}

describe('POST /api/pre-check', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		// 每次測試前設定 OpenAI mock constructor
		;(OpenAI as unknown as jest.Mock).mockImplementation(() => ({
			chat: { completions: { create: mockChatCreate } },
			embeddings: { create: mockEmbeddingsCreate },
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

	it('idea 為空或只有空白時應回傳 400', async () => {
		// 操作
		const res = await POST(
			buildRequest({
				headers: { Authorization: 'Bearer sk-test-key' },
				body: { idea: '   ' },
			}),
		)

		// 驗證
		expect(res.status).toBe(400)
		const data = await res.json()
		expect(data.error).toBe('缺少想法內容')
	})

	it('正常請求應回傳 valid、reason、embedding', async () => {
		// 準備
		mockChatCreate.mockResolvedValue({
			choices: [{ message: { content: JSON.stringify({ valid: true, reason: '這是一個好想法' }) } }],
		})
		mockEmbeddingsCreate.mockResolvedValue({
			data: [{ embedding: [0.1, 0.2, 0.3] }],
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
		expect(data).toEqual({
			valid: true,
			reason: '這是一個好想法',
			embedding: [0.1, 0.2, 0.3],
		})
	})

	it.each([
		{ status: 401, expected: 'API Key 無效，請確認金鑰是否正確' },
		{ status: 429, expected: '請求過於頻繁或超過配額，請稍後再試' },
	])('OpenAI 回傳 $status 時應回傳對應錯誤訊息', async ({ status, expected }) => {
		// 準備：模擬 OpenAI 拋出錯誤
		mockChatCreate.mockRejectedValue({
			status,
			message: 'OpenAI error',
			error: { message: 'details' },
		})

		// 操作
		const res = await POST(
			buildRequest({
				headers: { Authorization: 'Bearer sk-test-key' },
				body: { idea: '開一間咖啡店' },
			}),
		)

		// 驗證
		expect(res.status).toBe(status)
		const data = await res.json()
		expect(data.error).toBe(expected)
	})
})
