'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import type { Priority } from '@/components/workspace/TabPanel/TasksContent/types'

interface TaskRowAddInput {
	onAdd: (label: string, priority: Priority) => void
	onCancel: () => void
}

const priorityOptions: Priority[] = ['High', 'Medium', 'Low']

export const TaskRowAddInput = ({ onAdd, onCancel }: TaskRowAddInput) => {
	const [label, setLabel] = useState('')
	const [priority, setPriority] = useState<Priority>('Medium')

	const inputRef = useRef<HTMLInputElement>(null)

	const handleAdd = () => {
		if (!label.trim()) return
		onAdd(label.trim(), priority)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			return handleAdd()
		}

		if (e.key === 'Escape') {
			onCancel()
		}
	}

	const renderPriorityOptions = () => {
		return priorityOptions.map((priority) => (
			<SelectItem key={priority} value={priority} className='text-sm'>
				{priority}
			</SelectItem>
		))
	}

	useEffect(() => {
		inputRef.current?.focus()
	}, [])

	return (
		<div className='flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg ring-1 ring-neutral-200 dark:ring-neutral-700 bg-white dark:bg-neutral-900 mb-0.5'>
			<div className='w-0.5 h-4 rounded-full bg-neutral-200 dark:bg-neutral-700 shrink-0' />
			<div className='w-4 h-4 rounded-full border-2 border-neutral-200 dark:border-neutral-700 shrink-0' />
			<Input
				ref={inputRef}
				value={label}
				onChange={(e) => setLabel(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder='輸入任務名稱…'
				className='h-8 text-sm flex-1 border-0 shadow-none focus-visible:ring-0 px-0'
			/>
			<Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
				<SelectTrigger className='h-8 w-28 text-xs shrink-0'>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>{renderPriorityOptions()}</SelectContent>
			</Select>
			<Button size='sm' onClick={handleAdd} className='h-8 text-xs px-2.5 shrink-0'>
				新增
			</Button>
			<Button size='sm' variant='outline' onClick={onCancel} className='h-8 text-xs px-2.5 shrink-0'>
				取消
			</Button>
		</div>
	)
}
