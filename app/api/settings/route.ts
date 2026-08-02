import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encrypt, decrypt } from '@/lib/crypto'

export const GET = async () => {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) return NextResponse.json({ apiKey: '' })

	const { data, error } = await supabase
		.from('user_settings')
		.select('encrypted_api_key')
		.eq('user_id', user.id)
		.single()

	if (error) {
		if (error.code === 'PGRST116') return NextResponse.json({ apiKey: '' }) // 尚無設定
		return NextResponse.json({ error: '載入設定失敗' }, { status: 500 })
	}

	try {
		const apiKey = data?.encrypted_api_key ? decrypt(data.encrypted_api_key) : ''
		return NextResponse.json({ apiKey })
	} catch {
		// 密文毀損或 ENCRYPTION_KEY 已變更導致無法解密
		return NextResponse.json({ error: '解密設定失敗，請重新設定 API Key' }, { status: 500 })
	}
}

export const POST = async (req: NextRequest) => {
	const supabase = await createClient()
	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) return NextResponse.json({ error: '未登入使用者' }, { status: 401 })

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

	if (error) return NextResponse.json({ error: '儲存設定失敗' }, { status: 500 })

	return NextResponse.json({ success: true })
}
