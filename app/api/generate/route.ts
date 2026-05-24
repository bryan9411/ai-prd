import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { AI_OUTPUT_SCHEMA, type AIGenerateOutput } from '@/lib/ai-schema'
import { SYSTEM_PROMPT } from '@/prompts/prd'

const MODEL = 'gpt-5'

export async function POST(req: NextRequest) {
	const authHeader = req.headers.get('Authorization')
	if (!authHeader?.startsWith('Bearer ')) {
		return NextResponse.json({ error: '請先至設定中輸入 OpenAI API Key' }, { status: 401 })
	}

	const apiKey = authHeader.slice(7).trim()
	let body: { idea?: string } | null = null

	if (!apiKey) {
		return NextResponse.json({ error: '請先至設定中輸入 OpenAI API Key' }, { status: 401 })
	}

	try {
		body = await req.json()
	} catch {
		return NextResponse.json({ error: '請求格式錯誤' }, { status: 400 })
	}

	if (!body?.idea?.trim()) {
		return NextResponse.json({ error: '缺少產品構想內容' }, { status: 400 })
	}

	const client = new OpenAI({ apiKey })

	try {
		const response = await client.chat.completions.create({
			model: MODEL,
			messages: [
				{ role: 'system', content: SYSTEM_PROMPT },
				{ role: 'user', content: body.idea },
			],
			response_format: {
				type: 'json_schema',
				json_schema: {
					name: 'prd_output',
					strict: true,
					schema: AI_OUTPUT_SCHEMA,
				},
			},
		})

		const content = response.choices[0]?.message?.content
		if (!content) {
			return NextResponse.json({ error: 'AI 未回傳內容，請再試一次' }, { status: 500 })
		}

		const result = JSON.parse(content) as AIGenerateOutput
		return NextResponse.json(result)
	} catch (err: unknown) {
		const error = err as {
			status?: number
			message?: string
			error?: { message?: string; code?: string; type?: string }
		}

		if (error.status === 401) {
			return NextResponse.json({ error: 'API Key 無效，請確認金鑰是否正確' }, { status: 401 })
		}
		if (error.status === 429) {
			return NextResponse.json({ error: '請求過於頻繁或超過配額，請稍後再試' }, { status: 429 })
		}

		// 回傳 OpenAI 的原始錯誤訊息，方便 debug
		const detail = error.error?.message ?? error.message ?? '未知錯誤'
		const code = error.error?.code ? ` [${error.error.code}]` : ''
		const status = error.status ? ` (HTTP ${error.status})` : ''

		return NextResponse.json({ error: `AI 生成失敗${status}${code}：${detail}` }, { status: error.status ?? 500 })
	}
}
