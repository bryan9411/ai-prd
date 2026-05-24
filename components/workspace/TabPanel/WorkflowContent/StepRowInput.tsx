'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface StepRowInputProps {
	stepNumber: number
	roleAName: string
	roleBName: string
	onAdd: (roleAStep: string, roleBStep: string) => void
	onCancel: () => void
}

export const StepRowInput = ({ stepNumber, roleAName, roleBName, onAdd, onCancel }: StepRowInputProps) => {
	const [roleAStep, setTrackAStep] = useState('')
	const [roleBStep, setTrackBStep] = useState('')

	const inputARef = useRef<HTMLInputElement>(null)

	const handleAdd = () => {
		if (!roleAStep.trim() || !roleBStep.trim()) return
		onAdd(roleAStep.trim(), roleBStep.trim())
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') return handleAdd()
		if (e.key === 'Escape') return onCancel()
	}

	useEffect(() => {
		inputARef.current?.focus()
	}, [])

	return (
		<div className='flex items-center gap-3'>
			<div className='flex flex-col items-center shrink-0'>
				<div className='w-6 h-6 rounded-full border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-[10px] font-bold text-neutral-400'>
					{stepNumber}
				</div>
			</div>
			<div className='flex-1 grid grid-cols-2 gap-2'>
				<Input
					ref={inputARef}
					value={roleAStep}
					onChange={(e) => setTrackAStep(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={`${roleAName}的行為…`}
					className='h-9 text-sm'
				/>
				<Input
					value={roleBStep}
					onChange={(e) => setTrackBStep(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={`${roleBName}的操作…`}
					className='h-9 text-sm'
				/>
			</div>
			<div className='flex items-center gap-2 shrink-0'>
				<Button size='sm' onClick={handleAdd} className='h-9 text-sm px-3'>
					新增
				</Button>
				<Button size='sm' variant='outline' onClick={onCancel} className='h-9 text-sm px-3'>
					取消
				</Button>
			</div>
		</div>
	)
}
