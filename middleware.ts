import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export const middleware = async (request: NextRequest) => {
	let supabaseResponse = NextResponse.next({
		request,
	})

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll()
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
					supabaseResponse = NextResponse.next({
						request,
					})
					cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
				},
			},
		},
	)

	// 如果是 API 請求，不進行登入重新導向，僅允許透過或回傳 session cookie
	if (request.nextUrl.pathname.startsWith('/api')) {
		return supabaseResponse
	}

	const {
		data: { user },
	} = await supabase.auth.getUser()

	// 未登入使用者：除了訪問 /login 外，訪問其他頁面一律重導向至 /login
	if (!user && request.nextUrl.pathname !== '/login') {
		const url = request.nextUrl.clone()
		url.pathname = '/login'
		return NextResponse.redirect(url)
	}

	// 已登入使用者：如果試圖訪問 /login，重導向回首頁 /
	if (user && request.nextUrl.pathname === '/login') {
		const url = request.nextUrl.clone()
		url.pathname = '/'
		return NextResponse.redirect(url)
	}

	return supabaseResponse
}

export const config = {
	matcher: [
		/*
		 * 比對所有請求路徑，排除以下靜態資源：
		 * - _next/static (靜態檔案)
		 * - _next/image (圖片優化檔案)
		 * - favicon.ico (網站圖示)
		 * - 任何副檔名為 svg, png, jpg, jpeg, gif, webp 的圖片
		 */
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
}
