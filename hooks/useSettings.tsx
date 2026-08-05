'use client'

import { useState, useCallback, useEffect } from 'react'
import { fetchUserSettings, saveUserSettings } from '@/lib/supabase/db'

export const useSettings = () => {
	const [hasApiKey, setHasApiKey] = useState(false)
	const [maskedApiKey, setMaskedApiKey] = useState('')

	const loadSettings = useCallback(async () => {
		try {
			const data = await fetchUserSettings()

			setHasApiKey(data.hasApiKey)
			setMaskedApiKey(data.maskedApiKey)
		} catch (err) {
			setHasApiKey(false)
			console.error('載入設定失敗：', err)
		}
	}, [])

	useEffect(() => {
		loadSettings()
	}, [loadSettings])

	const saveApiKey = useCallback(async (key: string) => {
		try {
			await saveUserSettings(key)
			await loadSettings()
		} catch (err) {
			console.error('儲存設定失敗：', err)
		}
	},[loadSettings])

	const clearApiKey = useCallback(async () => {
		try {
			await saveUserSettings('')
			setHasApiKey(false)
			setMaskedApiKey('')
		} catch (err) {
			console.error('清除設定失敗：', err)
		}
	}, [])

	return { hasApiKey, maskedApiKey, saveApiKey, clearApiKey }
}
