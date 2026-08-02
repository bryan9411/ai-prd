import { encrypt, decrypt } from '@/lib/crypto'

describe('lib/crypto', () => {
	const originalEnv = process.env

	beforeEach(() => {
		process.env = {
			...originalEnv,
			// 32 bytes 的測試用金鑰（64 個 hex 字元）
			ENCRYPTION_KEY: 'd7a9b0c265e89410f27461c3b5d8e90f23a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8',
		}
	})

	afterAll(() => {
		process.env = originalEnv
	})

	it('加密後的文字應能透過 decrypt 還原成原始明文', () => {
		// 準備
		const plainText = 'sk-test-1234567890'

		// 操作
		const encrypted = encrypt(plainText)
		const decrypted = decrypt(encrypted)

		// 驗證
		expect(decrypted).toBe(plainText)
	})

	it('同樣的明文每次加密應產生不同的密文（隨機 IV）', () => {
		// 準備
		const plainText = 'sk-test-1234567890'

		// 操作
		const encryptedA = encrypt(plainText)
		const encryptedB = encrypt(plainText)

		// 驗證
		expect(encryptedA).not.toBe(encryptedB)
		// 但兩者都能各自解回正確的原文
		expect(decrypt(encryptedA)).toBe(plainText)
		expect(decrypt(encryptedB)).toBe(plainText)
	})

	it('密文格式不完整（缺少區段）時應回傳空字串', () => {
		// 操作
		const result = decrypt('only-one-part')

		// 驗證
		expect(result).toBe('')
	})

	it('密文被竄改時應拋出錯誤，不應靜默回傳錯誤內容', () => {
		// 準備：加密後竄改密文內容
		const encrypted = encrypt('sk-test-1234567890')
		const [iv, authTag, cipherHex] = encrypted.split(':')
		const tamperedCipher = cipherHex.slice(0, -2) + (cipherHex.slice(-2) === '00' ? '11' : '00')
		const tampered = `${iv}:${authTag}:${tamperedCipher}`

		// 操作 + 驗證
		expect(() => decrypt(tampered)).toThrow()
	})

	it('缺少 ENCRYPTION_KEY 環境變數時應拋出錯誤', () => {
		// 準備
		delete process.env.ENCRYPTION_KEY

		// 操作 + 驗證
		expect(() => encrypt('sk-test')).toThrow('缺少 ENCRYPTION_KEY 環境變數')
	})
})
