'use client'

import { useState, useCallback, useEffect } from 'react'
import { fetchUserSettings, saveUserSettings } from '@/lib/supabase/db'

export const useSettings = () => {
	const [apiKey, setApiKey] = useState('')

	useEffect(() => {
		fetchUserSettings()
			.then((key) => {
				setApiKey(key)
			})
			.catch((err) => {
				console.error('載入設定失敗：', err)
			})
	}, [])

	const saveApiKey = useCallback(async (key: string) => {
		try {
			await saveUserSettings(key)
			setApiKey(key)
		} catch (err) {
			console.error('儲存設定失敗：', err)
		}
	}, [])

	const clearApiKey = useCallback(async () => {
		try {
			await saveUserSettings('')
			setApiKey('')
		} catch (err) {
			console.error('清除設定失敗：', err)
		}
	}, [])

	return { apiKey, saveApiKey, clearApiKey }
}
