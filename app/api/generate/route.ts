import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { AI_OUTPUT_SCHEMA, type AIGenerateOutput } from '@/lib/ai-schema'

const MODEL = 'gpt-5'

const SYSTEM_PROMPT = `你是一位資深產品經理，請根據使用者提供的產品構想，產生完整的產品規格書內容。

規則：
- 全程使用繁體中文
- 嚴格按照指定 JSON schema 輸出，不得包含 schema 外的任何欄位或文字
- 不要輸出 JSON 以外的任何文字
- 使用者提供的所有限制條件（預算、地點、時程、客群等）必須反映在每個欄位的輸出內容中

各欄位要求：
- prd：結構化物件，包含以下子欄位：
  - tagline：一句話產品定位（20 字內，具體、有吸引力，不可使用「創新平台」等通用語）
  - overview：100–150 字的產品背景與核心定位說明
  - productGoal：清楚說明產品要達成的目標（30–60 字，具體描述解決什麼問題、服務誰、核心功能方向）
  - sectionLabels：針對此產品客製的章節標題，需反映產品類型——包含 userPersonas（如「使用者角色」「服務對象」）、features（如「核心功能」「主要服務」）、systemModules（如「系統架構」「模組拆分」）、dataModels（如「資料結構」「核心資料模型」）、valuePropositions（如「核心價值」「產品優勢」）
  - userPersonas：至少 2 個使用者角色，每個包含 name（角色名稱，如「一般消費者」「餐廳店家」）與 description（該角色的使用情境，40 字內）
  - features：至少 4 個核心功能，依產品複雜度自行決定數量，每個包含 name（功能名稱）、description（25 字內說明）、icon（1 個相關 emoji）
  - systemModules：至少 3 個系統模組，依架構複雜度自行決定數量，每個包含 name（模組名稱，如「訂位系統」「金流支付系統」）與 description（該模組職責，20 字內）
  - dataModels：至少 3 個核心資料模型，依資料複雜度自行決定數量，每個包含 name（英文名稱+中文，如「Reservation（訂位）」）與 description（20 字內說明該模型代表的概念）
  - valuePropositions：至少 3 個核心價值主張（20 字內，簡短有力）
- tasks：至少 4 個 任務，High / Medium / Low 優先級均需有
- steps：至少 3 個 工作流程步驟，按執行順序排列
- phases：固定 3 個階段（起步→穩定→擴張），依構想自訂名稱與時程，每階段包含：goal（該階段核心目標，20–40 字）、deliverables（至少3個具體可驗收的階段完成項目）、successMetrics（2–3 個可量化的成功指標）
- suggestions：3–5 個具體可執行建議，類別多元（變現、UX、技術、成長等），每個建議包含：
  - category：建議類別（如「變現策略」「使用者體驗」「技術架構」「成長駭客」）
  - title：建議標題（15 字內，具體明確）
  - description：60–100 字的背景說明，解釋為什麼此建議對這個產品重要、能解決什麼問題或創造什麼機會
  - actionItems：2–4 個具體可執行的行動步驟，每步驟 20–40 字，清楚描述做什麼、怎麼做
  - impact：預期影響等級（High / Medium / Low）`

export async function POST(req: NextRequest) {
	const authHeader = req.headers.get('Authorization')
	if (!authHeader?.startsWith('Bearer ')) {
		return NextResponse.json({ error: '請先至設定中輸入 OpenAI API Key' }, { status: 401 })
	}

	const apiKey = authHeader.slice(7).trim()
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
