/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

// Mock OpenAI SDK
jest.mock('openai', () => ({
	__esModule: true,
	default: jest.fn(),
}))

const mockGetUser = jest.fn()
const mockSingle = jest.fn()

// Mock Supabase Server Client
jest.mock('@/lib/supabase/server', () => ({
	createClient: jest.fn(() => ({
		auth: { getUser: mockGetUser },
		from: jest.fn(() => ({
			select: jest.fn(() => ({
				eq: jest.fn(() => ({
					single: mockSingle,
				})),
			})),
		})),
	})),
}))

jest.mock('@/lib/crypto', () => ({
	decrypt: jest.fn((val: string) => val),
}))

import OpenAI from 'openai'
import { POST } from '@/app/api/pre-check/route'

const mockChatCreate = jest.fn()
const mockEmbeddingsCreate = jest.fn()

// 輔助函式：建立測試用 NextRequest
const buildRequest = (options: {
	body?: unknown
	invalidJson?: boolean
}) => {
	const headers: Record<string, string> = {
		'Content-Type': 'application/json',
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
		// 預設模擬有登入且有 API Key
		mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
		mockSingle.mockResolvedValue({ data: { encrypted_api_key: 'sk-test-key' }, error: null })

		// 每次測試前設定 OpenAI mock constructor
		;(OpenAI as unknown as jest.Mock).mockImplementation(() => ({
			chat: { completions: { create: mockChatCreate } },
			embeddings: { create: mockEmbeddingsCreate },
		}))
	})

	it('未登入或尚未設定 API Key 時應回傳 401', async () => {
		mockGetUser.mockResolvedValue({ data: { user: null } })

		const res = await POST(buildRequest({ body: { idea: '開一間咖啡店' } }))
		expect(res.status).toBe(401)
		const data = await res.json()
		expect(data.error).toBe('請先至設定中輸入 OpenAI API Key')
	})

	it('request body 不是合法 JSON 時應回傳 400', async () => {
		// 操作
		const res = await POST(
			buildRequest({
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
				body: { idea: '一個好點子' },
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

	it('OpenAI 回傳 401 時應回傳對應錯誤訊息', async () => {
		// 準備
		mockChatCreate.mockRejectedValue({ status: 401, message: 'Invalid API Key' })

		// 操作
		const res = await POST(
			buildRequest({
				body: { idea: '一個點子' },
			}),
		)

		// 驗證
		expect(res.status).toBe(401)
		const data = await res.json()
		expect(data.error).toBe('API Key 無效，請確認金鑰是否正確')
	})

	it('OpenAI 回傳 429 時應回傳對應錯誤訊息', async () => {
		// 準備
		mockChatCreate.mockRejectedValue({ status: 429, message: 'Rate limit exceeded' })

		// 操作
		const res = await POST(
			buildRequest({
				body: { idea: '一個點子' },
			}),
		)

		// 驗證
		expect(res.status).toBe(429)
		const data = await res.json()
		expect(data.error).toBe('請求過於頻繁或超過配額，請稍後再試')
	})
})
