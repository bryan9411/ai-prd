import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'

const getKey = (): Buffer => {
	const key = process.env.ENCRYPTION_KEY
	if (!key) {
		throw new Error('缺少 ENCRYPTION_KEY 環境變數')
	}

	return Buffer.from(key, 'hex')
}

export const encrypt = (text: string): string => {
	const iv = crypto.randomBytes(12)
	const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv)
	const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
	const authTag = cipher.getAuthTag()

	return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`
}

export const decrypt = (payload: string): string => {
	const [ivHex, authTagHex, encryptedHex] = payload.split(':')

	if (!ivHex || !authTagHex || !encryptedHex) return ''

	const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivHex, 'hex'))
	decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))

	const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedHex, 'hex')), decipher.final()])

	return decrypted.toString('utf8')
}
