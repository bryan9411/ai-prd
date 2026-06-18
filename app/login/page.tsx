'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function LoginPage() {
	const [mode, setMode] = useState<'login' | 'register'>('login')
	const [message, setMessage] = useState<string | null>(null)
	const router = useRouter()

	const handleSuccess = (email: string) => {
		if (mode === 'register') {
			setMessage('註冊成功！若有啟用信箱驗證，請至信箱收信啟用帳號後登入。')
			setMode('login')
		} else {
			router.push('/')
		}
	}

	const maybeRenderMessage = () => {
		if (message) {
			return (
				<div className='mb-4 rounded-lg bg-emerald-500/10 p-3 text-xs font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-center animate-fade-in'>
					{message}
				</div>
			)
		}
	}

	const renderMode = () => {
		if (mode === 'login') {
			return <LoginForm onSwitchToRegister={() => setMode('register')} onSuccess={handleSuccess} />
		} else {
			return <RegisterForm onSwitchToLogin={() => setMode('login')} onSuccess={handleSuccess} />
		}
	}

	return (
		<div className='flex min-h-screen items-center justify-center bg-background px-4'>
			<div className='w-full max-w-sm'>
				<div className='mb-8 flex flex-col items-center gap-3'>
					<div className='flex h-11 w-11 items-center justify-center rounded-xl bg-[#0DAABA]/10'>
						<Sparkles className='h-5.5 w-5.5 text-[#0DAABA]' />
					</div>
					<div className='text-center'>
						<h1 className='text-xl font-bold tracking-tight text-foreground'>PRD 產生器</h1>
						<p className='mt-1 text-sm text-muted-foreground'>
							{mode === 'login' ? '登入帳號以繼續使用' : '建立帳號開始使用'}
						</p>
					</div>
				</div>

				<div className='rounded-xl border border-border bg-card p-6 shadow-sm'>
					<h2 className='mb-5 text-center text-base font-semibold text-card-foreground'>
						{mode === 'login' ? '會員登入' : '註冊新帳號'}
					</h2>
					{maybeRenderMessage()}
					{renderMode()}
				</div>
			</div>
		</div>
	)
}
