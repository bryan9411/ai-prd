'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import cx from 'classnames'
import { createClient } from '@/lib/supabase/client'

interface LoginFormProps {
	onSwitchToRegister: () => void
	onSuccess: (email: string) => void
}

export const LoginForm = ({ onSwitchToRegister, onSuccess }: LoginFormProps) => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
	const [isLoading, setIsLoading] = useState(false)

	const validate = () => {
		const newErrors: { email?: string; password?: string } = {}

		if (!email.trim()) {
			newErrors.email = '帳號為必填欄位'
		} else if (!/\S+@\S+\.\S+/.test(email)) {
			newErrors.email = '請輸入有效的電子郵件格式'
		}

		if (!password) {
			newErrors.password = '密碼為必填欄位'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value)

		if (errors.email) {
			setErrors((prev) => ({ ...prev, email: undefined }))
		}
	}

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(e.target.value)

		if (errors.password) {
			setErrors((prev) => ({ ...prev, password: undefined }))
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!validate()) return

		setIsLoading(true)
		setErrors({})

		const supabase = createClient()
		const { error } = await supabase.auth.signInWithPassword({
			email: email.trim(),
			password,
		})

		if (error) {
			setErrors({ email: error.message })
			setIsLoading(false)
			return
		}

		onSuccess(email.trim())
	}

	const maybeRenderLoaderIcon = () => {
		if (isLoading) {
			return <Loader2 className='mr-2 h-4 w-4 animate-spin' />
		}

		return '登入'
	}

	return (
		<form onSubmit={handleSubmit} className='flex flex-col gap-4'>
			<div className='flex flex-col gap-1.5'>
				<label className='text-xs font-medium text-stone-600 dark:text-neutral-400'>帳號</label>
				<Input
					type='text'
					placeholder='name@example.com'
					value={email}
					onChange={handleEmailChange}
					disabled={isLoading}
					className={cx({ 'border-red-500 focus-visible:ring-red-500': errors.email })}
				/>
				{errors.email && <span className='text-[11px] text-red-500 font-medium'>{errors.email}</span>}
			</div>

			<div className='flex flex-col gap-1.5'>
				<label className='text-xs font-medium text-stone-600 dark:text-neutral-400'>密碼</label>
				<Input
					type='password'
					placeholder='請輸入密碼'
					value={password}
					onChange={handlePasswordChange}
					disabled={isLoading}
					className={cx({ 'border-red-500 focus-visible:ring-red-500': errors.password })}
				/>
				{errors.password && <span className='text-[11px] text-red-500 font-medium'>{errors.password}</span>}
			</div>

			<Button
				type='submit'
				disabled={isLoading}
				className='w-full mt-2 cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground'
			>
				{maybeRenderLoaderIcon()}
			</Button>

			<div className='text-center text-xs text-stone-500 dark:text-neutral-500 mt-2'>
				還沒有帳號？{' '}
				<button
					type='button'
					onClick={onSwitchToRegister}
					disabled={isLoading}
					className='text-primary hover:underline font-semibold cursor-pointer disabled:opacity-50'
				>
					註冊
				</button>
			</div>
		</form>
	)
}
