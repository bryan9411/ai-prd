'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorProps {
	error: Error & { digest?: string }
	reset: () => void
}

const Error = ({ error, reset }: ErrorProps) => {
	const handleGoHome = () => {
		window.location.href = '/'
	}

	const maybeRenderErrorMessage = () => {
		if (error.message) {
			return (
				<div className='mt-4 overflow-hidden rounded-lg border bg-muted/50 p-3 text-left font-mono text-xs text-neutral-600 dark:text-neutral-400 max-w-full break-all max-h-32 overflow-y-auto'>
					{error.message}
				</div>
			)
		}
	}

	useEffect(() => {
		console.error('未被捕獲的應用程式崩潰:', error)
	}, [error])

	return (
		<div className='flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center text-foreground'>
			<div className='max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300'>
				<div className='mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive dark:bg-destructive/20'>
					<AlertCircle className='size-8' />
				</div>

				<div className='space-y-2'>
					<h1 className='text-2xl font-bold tracking-tight'>應用程式發生非預期錯誤</h1>
					<p className='text-muted-foreground text-sm leading-relaxed'>
						很抱歉，系統運作時發生了一些問題。你可以嘗試重新載入，或返回首頁。
					</p>
					{maybeRenderErrorMessage()}
				</div>

				<div className='flex items-center justify-center gap-3'>
					<Button onClick={reset} className='gap-2 cursor-pointer'>
						<RefreshCw className='size-4' />
						重新整理
					</Button>
					<Button variant='outline' onClick={handleGoHome} className='gap-2 cursor-pointer'>
						<Home className='size-4' />
						回首頁
					</Button>
				</div>
			</div>
		</div>
	)
}

export default Error
