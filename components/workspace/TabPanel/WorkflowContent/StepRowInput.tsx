'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface StepRowInputProps {
	stepNumber: number
	onAdd: (label: string) => void
	onCancel: () => void
}

export const StepRowInput = ({ stepNumber, onAdd, onCancel }: StepRowInputProps) => {
	const [label, setLabel] = useState('')

	const inputRef = useRef<HTMLInputElement>(null)

	const handleAdd = () => {
		if (!label.trim()) return

		onAdd(label.trim())
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			return handleAdd()
		}

		if (e.key === 'Escape') {
			return onCancel()
		}
	}

	useEffect(() => {
		inputRef.current?.focus()
	}, [])

	return (
		<div className='flex items-stretch gap-3'>
			<div className='flex flex-col items-center shrink-0'>
				<div className='w-6 h-6 rounded-full border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-[10px] font-bold text-neutral-400'>
					{stepNumber}
				</div>
			</div>
			<div className='flex-1'>
				<div className='flex items-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 px-3 py-2.5'>
					<Input
						ref={inputRef}
						value={label}
						onChange={(e) => setLabel(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder='輸入步驟名稱…'
						className='h-9 text-sm flex-1'
					/>
					<Button size='sm' onClick={handleAdd} className='h-9 text-sm px-3 shrink-0'>
						新增
					</Button>
					<Button size='sm' variant='outline' onClick={onCancel} className='h-9 text-sm px-3 shrink-0'>
						取消
					</Button>
				</div>
			</div>
		</div>
	)
}
