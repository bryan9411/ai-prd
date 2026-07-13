/**
 * @jest-environment node
 */

// 模擬 @ai-sdk/openai 與 ai 相關函式
jest.mock('@ai-sdk/openai', () => ({
	createOpenAI: jest.fn(),
}))

jest.mock('ai', () => ({
	streamText: jest.fn(),
	Output: { object: jest.fn((opts) => ({ ...opts })) },
	createTextStreamResponse: jest.fn(),
	toTextStream: jest.fn(),
}))

import { NextRequest } from 'next/server'

import { createOpenAI } from '@ai-sdk/openai'
import { streamText, createTextStreamResponse, toTextStream } from 'ai'
import { POST } from '@/app/api/generate/route'

const mockCreateOpenAI = createOpenAI as unknown as jest.Mock
const mockStreamText = streamText as unknown as jest.Mock
const mockCreateTextStreamResponse = createTextStreamResponse as unknown as jest.Mock
const mockToTextStream = toTextStream as unknown as jest.Mock

const buildRequest = (options: { headers?: Record<string, string>; body?: unknown; invalidJson?: boolean }) => {
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
		// createOpenAI 回傳一個可用於取得 model 的工廠函式
		mockCreateOpenAI.mockImplementation(() => jest.fn())
	})

	it('缺少或格式不正確的授權標頭時應回傳 401', async () => {
		const res1 = await POST(buildRequest({ body: { idea: '測試' } }))
		expect(res1.status).toBe(401)

		const res2 = await POST(buildRequest({ headers: { Authorization: 'Bearer    ' }, body: { idea: '測試' } }))
		expect(res2.status).toBe(401)
	})

	it('請求主體不是合法 JSON 時應回傳 400', async () => {
		const res = await POST(buildRequest({ headers: { Authorization: 'Bearer sk-test-key' }, invalidJson: true }))
		expect(res.status).toBe(400)
		const data = await res.json()
		expect(data.error).toBe('請求格式錯誤')
	})

	it('構想欄位為空或只有空白時應回傳 400', async () => {
		const res = await POST(buildRequest({ headers: { Authorization: 'Bearer sk-test-key' }, body: { idea: '   ' } }))
		expect(res.status).toBe(400)
		const data = await res.json()
		expect(data.error).toBe('缺少產品構想內容')
	})

	it('成功呼叫串流生成功能並回傳串流回應', async () => {
		// 準備
		mockStreamText.mockReturnValue({ stream: 'fake-stream' })
		mockToTextStream.mockReturnValue('text-stream')
		mockCreateTextStreamResponse.mockReturnValue(new Response('streamed', { status: 200 }))

		// 操作
		const res = await POST(
			buildRequest({ headers: { Authorization: 'Bearer sk-test-key' }, body: { idea: '一個好點子' } }),
		)

		// 驗證
		expect(mockCreateOpenAI).toHaveBeenCalled()
		expect(mockStreamText).toHaveBeenCalled()
		expect(mockToTextStream).toHaveBeenCalledWith({ stream: 'fake-stream' })
		expect(mockCreateTextStreamResponse).toHaveBeenCalled()

		expect(res.status).toBe(200)
		const text = await res.text()
		expect(text).toBe('streamed')
	})

	it.each([
		{ status: 401, expected: 'API Key 無效，請確認金鑰是否正確' },
		{ status: 429, expected: '請求過於頻繁或超過配額，請稍後再試' },
	])('當串流生成功能拋出 $status 時應回傳對應錯誤', async ({ status, expected }) => {
		mockStreamText.mockImplementation(() => {
			throw { status, message: 'err', error: { message: 'details' } }
		})

		const res = await POST(buildRequest({ headers: { Authorization: 'Bearer sk-test-key' }, body: { idea: '測試' } }))
		expect(res.status).toBe(status)
		const data = await res.json()
		expect(data.error).toBe(expected)
	})
})
