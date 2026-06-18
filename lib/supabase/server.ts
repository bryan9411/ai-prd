import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = async () => {
	const cookieStore = await cookies()

	return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
		cookies: {
			getAll() {
				return cookieStore.getAll()
			},
			setAll(cookiesToSet) {
				try {
					cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
				} catch {
					// 當此方法從 Server Component 被呼叫時，Next.js 不允許修改 Cookie。
					// 有使用 Middleware 來更新使用者 Session，則可以安全地忽略此錯誤。
				}
			},
		},
	})
}
