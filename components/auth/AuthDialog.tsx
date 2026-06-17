'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

interface AuthDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	onSuccess: (email: string) => void
}

export const AuthDialog = ({ open, onOpenChange, onSuccess }: AuthDialogProps) => {
	const [mode, setMode] = useState<'login' | 'register'>('login')

	const router = useRouter()
	const pathname = usePathname()

	const handleClose = () => {
		onOpenChange(false)
	}

	const handleSuccess = (email: string) => {
		if (pathname !== '/') {
			router.push('/')
		}

		onSuccess(email)
		handleClose()
	}

	const renderMode = () => {
		if (mode === 'login') {
			return <LoginForm onSwitchToRegister={() => setMode('register')} onSuccess={handleSuccess} />
		} else {
			return <RegisterForm onSwitchToLogin={() => setMode('login')} onSuccess={handleSuccess} />
		}
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className='max-w-90 sm:max-w-100'>
				<DialogHeader>
					<DialogTitle className='text-center text-lg font-bold tracking-tight'>
						{mode === 'login' ? '會員登入' : '註冊新帳號'}
					</DialogTitle>
				</DialogHeader>
				{renderMode()}
			</DialogContent>
		</Dialog>
	)
}
