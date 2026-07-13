'use client'

import cx from 'classnames'
import { memo, useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { WorkflowStep } from '@/types/project'

interface WorkflowItemProps {
	step: WorkflowStep
	index: number
	isLast: boolean
	onUpdate: (id: string, field: 'roleAStep' | 'roleBStep', value: string) => void
	onDelete: (id: string) => void
}

type EditField = 'roleAStep' | 'roleBStep' | null

export const WorkflowItem = memo(({ step, index, isLast, onUpdate, onDelete }: WorkflowItemProps) => {
	const [editField, setEditField] = useState<EditField>(null)
	const [editValue, setEditValue] = useState('')

	const inputRef = useRef<HTMLInputElement>(null)

	const startEdit = (field: 'roleAStep' | 'roleBStep') => {
		setEditField(field)
		setEditValue(step[field])
	}

	const handleConfirm = () => {
		if (editField && editValue.trim()) {
			onUpdate(step.id, editField, editValue.trim())
		}
		setEditField(null)
	}

	const handleCancel = () => {
		setEditField(null)
		setEditValue('')
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') handleConfirm()
		if (e.key === 'Escape') handleCancel()
	}

	useEffect(() => {
		if (editField) {
			inputRef.current?.focus()
		}
	}, [editField])

	const renderCell = (field: 'roleAStep' | 'roleBStep') => {
		const value = step[field]

		if (editField === field) {
			return (
				<div className='flex items-center gap-2'>
					<Input
						ref={inputRef}
						value={editValue}
						onChange={(e) => setEditValue(e.target.value)}
						onKeyDown={handleKeyDown}
						className='h-7 text-sm flex-1'
					/>
					<Button size='sm' onClick={handleConfirm} className='h-7 text-xs px-2 shrink-0'>
						確認
					</Button>
					<Button size='sm' variant='outline' onClick={handleCancel} className='h-7 text-xs px-2 shrink-0'>
						取消
					</Button>
				</div>
			)
		}

		return (
			<div className='group/cell flex items-center gap-2'>
				<span className='text-sm text-neutral-700 dark:text-neutral-300 flex-1'>{value}</span>
				<Button
					size='icon'
					variant='ghost'
					title='編輯'
					onClick={() => startEdit(field)}
					className='w-6 h-6 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 opacity-0 group-hover/cell:opacity-100 transition-opacity shrink-0'
				>
					✎
				</Button>
			</div>
		)
	}

	return (
		<div className='group flex items-stretch gap-3'>
			<div className='flex flex-col items-center shrink-0'>
				<div className='w-6 h-6 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center text-[10px] font-bold'>
					{index + 1}
				</div>
				{!isLast && <div className='w-px flex-1 bg-neutral-200 dark:bg-neutral-800 mt-1 mb-0.5' />}
			</div>
			<div className={cx('flex-1 grid grid-cols-2 gap-2', { 'pb-2': !isLast })}>
				<div className='rounded-lg border px-3 py-2.5 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900'>
					{renderCell('roleAStep')}
				</div>
				<div className='rounded-lg border px-3 py-2.5 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900'>
					{renderCell('roleBStep')}
				</div>
			</div>
			<div className='flex items-start pt-2 shrink-0'>
				<Button
					size='icon'
					variant='ghost'
					title='刪除'
					onClick={() => onDelete(step.id)}
					className='w-6 h-6 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 opacity-0 group-hover:opacity-100 transition-opacity'
				>
					✕
				</Button>
			</div>
		</div>
	)
})

WorkflowItem.displayName = 'WorkflowItem'
