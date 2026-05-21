'use client'

import { useState, useCallback } from 'react'

const STORAGE_KEY = 'openai_api_key'

const getDefaultApiKey = () => {
	if (typeof window === 'undefined') return ''

	return localStorage.getItem(STORAGE_KEY) ?? ''
}

export const useSettings = () => {
	const [apiKey, setApiKey] = useState(getDefaultApiKey())

	const saveApiKey = useCallback((key: string) => {
		localStorage.setItem(STORAGE_KEY, key)
		setApiKey(key)
	}, [])

	const clearApiKey = useCallback(() => {
		localStorage.removeItem(STORAGE_KEY)
		setApiKey('')
	}, [])

	return { apiKey, saveApiKey, clearApiKey }
}
