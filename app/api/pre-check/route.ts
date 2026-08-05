import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { decrypt } from '@/lib/crypto'

export async function POST(req: NextRequest) {
	let apiKey = ''

	try {
		const supabase = await createClient()
		const { data: { user } } = await supabase.auth.getUser()

		if (user) {
			const { data } = await supabase
				.from('user_settings')
				.select('encrypted_api_key')
				.eq('user_id', user.id)
				.single()

			if (data?.encrypted_api_key) {
				try {
					apiKey = decrypt(data.encrypted_api_key)
				} catch (error) {
					console.error('API Key 解密失敗', error)
				}
			}
		}
	} catch (error) {
		console.error('取得使用者設定失敗', error)
	}

	if (!apiKey) {
		return NextResponse.json({ error: '請先至設定中輸入 OpenAI API Key' }, { status: 401 })
	}

	let body: { idea?: string } | null = null
	try {
		body = await req.json()
	} catch {
		return NextResponse.json({ error: '請求格式錯誤' }, { status: 400 })
	}

	if (!body?.idea?.trim()) {
		return NextResponse.json({ error: '缺少想法內容' }, { status: 400 })
	}

	const idea = body.idea.trim()
	const client = new OpenAI({ apiKey })

	try {
		const [validationRes, embeddingRes] = await Promise.all([
			client.chat.completions.create({
				model: 'gpt-4o-mini',
				messages: [
					{
						role: 'system',
						content:
							'你是一個意圖分類器。判斷使用者輸入是否為一個產品或商業構想（例如：開一間店、做一個 App、開發一個服務、創業點子等）。只以 JSON 回覆：{ "valid": true 或 false, "reason": "一句話說明原因" }。不符合的例子包含：程式碼請求、一般問答、翻譯需求、隨機文字、指令等。',
					},
					{ role: 'user', content: idea },
				],
				response_format: { type: 'json_object' },
				max_tokens: 100,
			}),
			client.embeddings.create({
				model: 'text-embedding-3-small',
				input: idea,
				dimensions: 1536,
			}),
		])

		const raw = validationRes.choices[0]?.message?.content
		const parsed = raw ? (JSON.parse(raw) as { valid?: boolean; reason?: string }) : {}

		return NextResponse.json({
			valid: parsed.valid ?? true,
			reason: parsed.reason ?? '',
			embedding: embeddingRes.data[0].embedding,
		})
	} catch (err: unknown) {
		const error = err as {
			status?: number
			message?: string
			error?: { message?: string }
		}

		if (error.status === 401) {
			return NextResponse.json({ error: 'API Key 無效，請確認金鑰是否正確' }, { status: 401 })
		}

		if (error.status === 429) {
			return NextResponse.json({ error: '請求過於頻繁或超過配額，請稍後再試' }, { status: 429 })
		}

		const detail = error.error?.message ?? error.message ?? '未知錯誤'

		return NextResponse.json({ error: `預檢失敗：${detail}` }, { status: error.status ?? 500 })
	}
}
