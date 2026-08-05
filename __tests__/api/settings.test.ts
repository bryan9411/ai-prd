/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

// Mock Supabase Server Client
jest.mock('@/lib/supabase/server', () => ({
	createClient: jest.fn(),
}))

// Mock 加解密模組，測試中只驗證是否有正確呼叫，不測試演算法本身
jest.mock('@/lib/crypto', () => ({
	encrypt: jest.fn(),
	decrypt: jest.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { encrypt, decrypt } from '@/lib/crypto'
import { GET, POST } from '@/app/api/settings/route'

const mockGetUser = jest.fn()
const mockSingle = jest.fn()
const mockEq = jest.fn(() => ({ single: mockSingle }))
const mockSelect = jest.fn(() => ({ eq: mockEq }))
const mockUpsert = jest.fn()
const mockFrom = jest.fn(() => ({ select: mockSelect, upsert: mockUpsert }))

const mockCreateClient = createClient as jest.Mock
const mockEncrypt = encrypt as jest.Mock
const mockDecrypt = decrypt as jest.Mock

// 輔助函式：建立測試用 NextRequest
const buildRequest = (options: { body?: unknown; invalidJson?: boolean }) => {
	const init: RequestInit = { method: 'POST', headers: { 'Content-Type': 'application/json' } }

	if (options.invalidJson) {
		init.body = 'not-json'
	} else if (options.body !== undefined) {
		init.body = JSON.stringify(options.body)
	}

	return new NextRequest('http://localhost/api/settings', init as any)
}

describe('GET /api/settings', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		mockCreateClient.mockResolvedValue({
			auth: { getUser: mockGetUser },
			from: mockFrom,
		})
	})

	it('未登入使用者應回傳空字串 apiKey 與 hasApiKey: false', async () => {
		// 準備
		mockGetUser.mockResolvedValue({ data: { user: null } })

		// 操作
		const res = await GET()

		// 驗證
		expect(res.status).toBe(200)
		const data = await res.json()
		expect(data).toEqual({ hasApiKey: false, maskedApiKey: '' })
		expect(mockFrom).not.toHaveBeenCalled()
	})

	it('尚無設定資料（PGRST116）時應回傳空字串 apiKey 與 hasApiKey: false', async () => {
		// 準備
		mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
		mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })

		// 操作
		const res = await GET()

		// 驗證
		expect(res.status).toBe(200)
		const data = await res.json()
		expect(data).toEqual({ hasApiKey: false, maskedApiKey: '' })
		expect(mockDecrypt).not.toHaveBeenCalled()
	})

	it('查詢發生非預期錯誤時應回傳 500', async () => {
		// 準備
		mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
		mockSingle.mockResolvedValue({ data: null, error: { code: 'OTHER_ERROR' } })

		// 操作
		const res = await GET()

		// 驗證
		expect(res.status).toBe(500)
		const data = await res.json()
		expect(data.error).toBe('載入設定失敗')
	})

	it('有設定資料時應解密後回傳遮罩 apiKey 與 hasApiKey: true', async () => {
		// 準備
		mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
		mockSingle.mockResolvedValue({ data: { encrypted_api_key: 'iv:tag:cipher' }, error: null })
		mockDecrypt.mockReturnValue('sk-plain-key')

		// 操作
		const res = await GET()

		// 驗證
		expect(mockDecrypt).toHaveBeenCalledWith('iv:tag:cipher')
		expect(res.status).toBe(200)
		const data = await res.json()
		expect(data).toEqual({ hasApiKey: true, maskedApiKey: 'sk-••••••••-key' })
	})

	it('密文毀損導致解密失敗時應視為未設定 Key 並回傳 hasApiKey: false', async () => {
		// 準備
		mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
		mockSingle.mockResolvedValue({ data: { encrypted_api_key: 'corrupted-cipher' }, error: null })
		mockDecrypt.mockImplementation(() => {
			throw new Error('decrypt failed')
		})

		// 操作
		const res = await GET()

		// 驗證
		expect(res.status).toBe(200)
		const data = await res.json()
		expect(data).toEqual({ hasApiKey: false, maskedApiKey: '' })
	})
})

describe('POST /api/settings', () => {
	beforeEach(() => {
		jest.clearAllMocks()
		mockCreateClient.mockResolvedValue({
			auth: { getUser: mockGetUser },
			from: mockFrom,
		})
	})

	it('未登入使用者應回傳 401', async () => {
		// 準備
		mockGetUser.mockResolvedValue({ data: { user: null } })

		// 操作
		const res = await POST(buildRequest({ body: { apiKey: 'sk-test' } }))

		// 驗證
		expect(res.status).toBe(401)
		const data = await res.json()
		expect(data.error).toBe('未登入使用者')
		expect(mockFrom).not.toHaveBeenCalled()
	})

	it('request body 不是合法 JSON 時應回傳 400', async () => {
		// 準備
		mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })

		// 操作
		const res = await POST(buildRequest({ invalidJson: true }))

		// 驗證
		expect(res.status).toBe(400)
		const data = await res.json()
		expect(data.error).toBe('請求格式錯誤')
	})

	it('傳入合法 apiKey 時應加密後寫入資料庫', async () => {
		// 準備
		mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
		mockEncrypt.mockReturnValue('iv:tag:cipher')
		mockUpsert.mockResolvedValue({ error: null })

		// 操作
		const res = await POST(buildRequest({ body: { apiKey: 'sk-plain-key' } }))

		// 驗證
		expect(mockEncrypt).toHaveBeenCalledWith('sk-plain-key')
		expect(mockUpsert).toHaveBeenCalledWith(
			expect.objectContaining({ user_id: 'user-1', encrypted_api_key: 'iv:tag:cipher' }),
			{ onConflict: 'user_id' },
		)
		expect(res.status).toBe(200)
		const data = await res.json()
		expect(data).toEqual({ success: true })
	})

	it('傳入空字串 apiKey（清除設定）時不應呼叫 encrypt，直接存空字串', async () => {
		// 準備
		mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
		mockUpsert.mockResolvedValue({ error: null })

		// 操作
		const res = await POST(buildRequest({ body: { apiKey: '' } }))

		// 驗證
		expect(mockEncrypt).not.toHaveBeenCalled()
		expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({ user_id: 'user-1', encrypted_api_key: '' }), {
			onConflict: 'user_id',
		})
		expect(res.status).toBe(200)
	})

	it('寫入資料庫失敗時應回傳 500', async () => {
		// 準備
		mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
		mockEncrypt.mockReturnValue('iv:tag:cipher')
		mockUpsert.mockResolvedValue({ error: { message: 'db error' } })

		// 操作
		const res = await POST(buildRequest({ body: { apiKey: 'sk-plain-key' } }))

		// 驗證
		expect(res.status).toBe(500)
		const data = await res.json()
		expect(data.error).toBe('儲存設定失敗')
	})
})
