'use client'

import { useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SettingsDialogProps {
	open: boolean
	apiKey: string
	onClose: () => void
	onSave: (key: string) => void
	onClear: () => void
}

export const SettingsDialog = ({ open, apiKey, onClose, onSave, onClear }: SettingsDialogProps) => {
	const [inputValue, setInputValue] = useState(apiKey)
	const [isVisible, setIsVisible] = useState(false)

	useEffect(() => {
		setInputValue(apiKey)
	}, [apiKey])

	const hasKey = apiKey.length > 0

	const handleSave = () => {
		onSave(inputValue.trim())
		onClose()
	}

	const handleClear = () => {
		onClear()
		setInputValue('')
	}

	const handleToggleVisible = () => {
		setIsVisible((prev) => !prev)
	}

	const handleDialogOpenChange = (isOpen: boolean) => {
		if (!isOpen) {
			onClose()
		}
	}

	const renderInput = () => {
		const VisibilityIcon = isVisible ? EyeOff : Eye

		return (
			<div className='relative'>
				<Input
					type={isVisible ? 'text' : 'password'}
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={(e) => e.key === 'Enter' && handleSave()}
					placeholder='請輸入 openai API key'
					className='pr-9 font-mono text-sm'
				/>
				<Button
					type='button'
					variant='ghost'
					size='icon'
					onClick={handleToggleVisible}
					className='absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
				>
					<VisibilityIcon className='w-3.5 h-3.5' />
				</Button>
			</div>
		)
	}

	const renderFooter = () => {
		if (hasKey) {
			return (
				<AlertDialogFooter>
					<Button
						variant='ghost'
						onClick={handleClear}
						className='mr-auto text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40'
					>
						清除 Key
					</Button>
					<AlertDialogCancel onClick={onClose}>取消</AlertDialogCancel>
					<AlertDialogAction onClick={handleSave}>儲存</AlertDialogAction>
				</AlertDialogFooter>
			)
		}

		return (
			<AlertDialogFooter>
				<AlertDialogCancel onClick={onClose}>取消</AlertDialogCancel>
				<AlertDialogAction onClick={handleSave}>儲存</AlertDialogAction>
			</AlertDialogFooter>
		)
	}

	return (
		<AlertDialog open={open} onOpenChange={handleDialogOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>API 設定</AlertDialogTitle>
				</AlertDialogHeader>
				<div className='flex flex-col gap-3'>
					<div className='flex flex-col gap-1.5'>
						<label className='text-xs font-medium text-neutral-600 dark:text-neutral-400'>OpenAI API Key</label>
						{renderInput()}
					</div>
				</div>
				{renderFooter()}
			</AlertDialogContent>
		</AlertDialog>
	)
}
