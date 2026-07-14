'use client'

import { useEffect } from 'react'
import { useObject } from '@ai-sdk/react'
import { useProjectStore } from '@/store/useProjectStore'
import { aiGenerateOutputSchema } from '@/lib/ai-schema'

const parseErrorMessage = (error: Error): string => {
	try {
		const parsed = JSON.parse(error.message) as { error?: string }
		if (parsed?.error) return parsed.error
	} catch {
		// 若非 JSON 格式就直接回傳預設錯誤
	}
	return '生成失敗，請確認 API Key 或稍後再試'
}

/**
 * 把 AI 的串流結果（不完整的物件片段）同步到 Zustand 的 store。
 * 使用方式：放在會送出 `pendingIdea` 的元件下（例如 IdeaInput），它會自動監聽並送出請求、以及把每次收到的片段套用到 store。
 */
export const useGenerateStream = () => {
	const pendingIdea = useProjectStore((state) => state.pendingIdea)
	const clearPendingIdea = useProjectStore((state) => state.clearPendingIdea)
	const applyStreamingPartial = useProjectStore((state) => state.applyStreamingPartial)
	const finalizeGenerate = useProjectStore((state) => state.finalizeGenerate)
	const handleStreamError = useProjectStore((state) => state.handleStreamError)

	const { submit, object } = useObject({
		api: '/api/generate',
		schema: aiGenerateOutputSchema,
		// headers 函數在發送請求時才會被調用，所以直接拿 Store 裡當前最新 API Key
		headers: () => ({ Authorization: `Bearer ${useProjectStore.getState().pendingApiKey ?? ''}` }),
		onFinish: ({ object: result, error }) => {
			if (error || !result) {
				handleStreamError('生成結果格式錯誤，請稍後再試')
				return
			}
			finalizeGenerate(result)
		},
		onError: (error) => {
			handleStreamError(parseErrorMessage(error))
		},
	})

	useEffect(() => {
		if (!pendingIdea) return
		submit({ idea: pendingIdea })
		clearPendingIdea()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pendingIdea])

	useEffect(() => {
		if (object) {
			applyStreamingPartial(object)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [object])
}
