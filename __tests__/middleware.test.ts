/**
 * @jest-environment node
 */

// Mock @supabase/ssr
jest.mock('@supabase/ssr', () => ({
	createServerClient: jest.fn(),
}))

import { createServerClient } from '@supabase/ssr'
import { NextRequest } from 'next/server'
import { middleware } from '@/middleware'

const mockGetUser = jest.fn()
const mockCreateServerClient = createServerClient as jest.Mock

describe('middleware', () => {
	const originalEnv = process.env

	beforeEach(() => {
		jest.clearAllMocks()
		process.env = {
			...originalEnv,
			NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
			NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
		}
		// 每次測試前設定 Supabase mock
		mockCreateServerClient.mockImplementation(() => ({
			auth: { getUser: mockGetUser },
		}))
	})

	afterAll(() => {
		process.env = originalEnv
	})

	it('API 路徑不應進行登入檢查，直接通過', async () => {
		// 準備
		const req = new NextRequest('http://localhost/api/generate', { method: 'POST' })

		// 操作
		const res = await middleware(req)

		// 驗證：不應呼叫 getUser
		expect(mockGetUser).not.toHaveBeenCalled()
		// 應正常通過（非 redirect）
		expect(res.headers.get('location')).toBeNull()
	})

	it('未登入使用者訪問受保護頁面應重導至 /login', async () => {
		// 準備
		mockGetUser.mockResolvedValue({ data: { user: null } })
		const req = new NextRequest('http://localhost/dashboard')

		// 操作
		const res = await middleware(req)

		// 驗證
		expect(res.status).toBe(307)
		expect(new URL(res.headers.get('location')!).pathname).toBe('/login')
	})

	it('未登入使用者訪問 /login 應正常通過', async () => {
		// 準備
		mockGetUser.mockResolvedValue({ data: { user: null } })
		const req = new NextRequest('http://localhost/login')

		// 操作
		const res = await middleware(req)

		// 驗證
		expect(res.headers.get('location')).toBeNull()
	})

	it('已登入使用者訪問一般頁面應正常通過', async () => {
		// 準備
		mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
		const req = new NextRequest('http://localhost/')

		// 操作
		const res = await middleware(req)

		// 驗證
		expect(res.headers.get('location')).toBeNull()
	})

	it('已登入使用者訪問 /login 應重導至 /', async () => {
		// 準備
		mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
		const req = new NextRequest('http://localhost/login')

		// 操作
		const res = await middleware(req)

		// 驗證
		expect(res.status).toBe(307)
		expect(new URL(res.headers.get('location')!).pathname).toBe('/')
	})
})
