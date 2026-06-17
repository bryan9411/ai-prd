'use client'

import { useState, useCallback } from 'react'
import { getApiKey, saveApiKey as saveApiKeyToStorage, clearApiKey as clearApiKeyFromStorage } from '@/lib/project-storage'

export const useSettings = () => {
	const [apiKey, setApiKey] = useState(getApiKey)

	const saveApiKey = useCallback((key: string) => {
		saveApiKeyToStorage(key)
		setApiKey(key)
	}, [])

	const clearApiKey = useCallback(() => {
		clearApiKeyFromStorage()
		setApiKey('')
	}, [])

	return { apiKey, saveApiKey, clearApiKey }
}

