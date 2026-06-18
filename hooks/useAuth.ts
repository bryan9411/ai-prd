'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export const useAuth = () => {
	const [user, setUser] = useState<User | null>(null)
	const [isLoading, setIsLoading] = useState(true)

	const supabase = createClient()

	const logout = useCallback(async () => {
		setIsLoading(true)
		await supabase.auth.signOut()
		setIsLoading(false)
	}, [supabase])

	useEffect(() => {
		// 取得初始使用者資訊
		supabase.auth.getUser().then(({ data: { user } }) => {
			setUser(user)
			setIsLoading(false)
		})

		// 監聽身份驗證狀態變化
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null)
			setIsLoading(false)
		})

		return () => {
			subscription.unsubscribe()
		}
	}, [supabase])

	return { user, isLoading, logout }
}
