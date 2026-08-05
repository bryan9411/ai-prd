import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encrypt, decrypt } from '@/lib/crypto'

const getMaskedApiKey = (key: string): string => {
	if (!key) return ''
	if (key.length <= 8) return '••••••••'

	return `${key.slice(0, 3)}••••••••${key.slice(-4)}`
}

export const GET = async () => {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()

	if (!user) {
		return NextResponse.json({ hasApiKey: false, maskedApiKey: '' })
	}

	const { data, error } = await supabase
		.from('user_settings')
		.select('encrypted_api_key')
		.eq('user_id', user.id)
		.single()

	if (error) {
		if (error.code === 'PGRST116') {
			return NextResponse.json({ hasApiKey: false, maskedApiKey: '' })
		}

		return NextResponse.json({ error: '載入設定失敗' }, { status: 500 })
	}

	try {
		const apiKey = data?.encrypted_api_key ? decrypt(data.encrypted_api_key) : ''

		return NextResponse.json({
			hasApiKey: !!apiKey,
			maskedApiKey: getMaskedApiKey(apiKey),
		})
	} catch {
		return NextResponse.json({ hasApiKey: false, maskedApiKey: '' })
	}
}

export const POST = async (req: NextRequest) => {
	const supabase = await createClient()
	const { data: { user } } = await supabase.auth.getUser()

	if (!user) {
		return NextResponse.json({ error: '未登入使用者' }, { status: 401 })
	}

	let body: { apiKey?: string } | null = null
	try {
		body = await req.json()
	} catch {
		return NextResponse.json({ error: '請求格式錯誤' }, { status: 400 })
	}

	const apiKey = body?.apiKey ?? ''
	const encryptedApiKey = apiKey ? encrypt(apiKey) : ''

	const { error } = await supabase.from('user_settings').upsert(
		{
			user_id: user.id,
			encrypted_api_key: encryptedApiKey,
			updated_at: new Date().toISOString(),
		},
		{ onConflict: 'user_id' },
	)

	if (error) {
		return NextResponse.json({ error: '儲存設定失敗' }, { status: 500 })
	}

	return NextResponse.json({ success: true })
}
