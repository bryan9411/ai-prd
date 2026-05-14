'use client'

import cx from 'classnames'
import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { type Step } from '@/components/workspace/TabPanel/WorkflowContent/types'

interface WorkflowItemProps {
	step: Step
	index: number
	isLast: boolean
	onUpdate: (id: string, label: string) => void
	onDelete: (id: string) => void
}

export const WorkflowItem = ({ step, index, isLast, onUpdate, onDelete }: WorkflowItemProps) => {
	const [isEditing, setIsEditing] = useState(false)
	const [editLabel, setEditLabel] = useState(step.label)

	const inputRef = useRef<HTMLInputElement>(null)

	const handleConfirm = () => {
		if (!editLabel.trim()) {
			setIsEditing(false)
		}

		onUpdate(step.id, editLabel.trim())
		setIsEditing(false)
	}

	const handleCancel = () => {
		setEditLabel(step.label)
		setIsEditing(false)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleConfirm()
		}

		if (e.key === 'Escape') {
			handleCancel()
		}
	}

	const maybeRenderEditInput = () => {
		if (isEditing) {
			return (
				<>
					<Input
						ref={inputRef}
						value={editLabel}
						onChange={(e) => setEditLabel(e.target.value)}
						onKeyDown={handleKeyDown}
						className='h-9 text-sm flex-1'
					/>
					<Button size='sm' onClick={handleConfirm} className='h-9 text-sm px-3 shrink-0'>
						確認
					</Button>
					<Button size='sm' variant='outline' onClick={handleCancel} className='h-9 text-sm px-3 shrink-0'>
						取消
					</Button>
				</>
			)
		}

		return (
			<>
				<span className='text-sm text-neutral-700 dark:text-neutral-300 flex-1'>{step.label}</span>
				<div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0'>
					<Button
						size='icon'
						variant='ghost'
						title='編輯'
						onClick={() => setIsEditing(true)}
						className='w-6 h-6 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
					>
						✎
					</Button>
					<Button
						size='icon'
						variant='ghost'
						title='刪除'
						onClick={() => onDelete(step.id)}
						className='w-6 h-6 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40'
					>
						✕
					</Button>
				</div>
			</>
		)
	}

	useEffect(() => {
		if (isEditing) {
			inputRef.current?.focus()
		}
	}, [isEditing])

	return (
		<div className='flex items-stretch gap-3'>
			<div className='flex flex-col items-center shrink-0'>
				<div className='w-6 h-6 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center text-[10px] font-bold'>
					{index + 1}
				</div>
				{!isLast && <div className='w-px flex-1 bg-neutral-200 dark:bg-neutral-800 mt-1 mb-0.5' />}
			</div>
			<div className={cx('flex-1', { 'pb-2': !isLast })}>
				<div className='group flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900'>
					{maybeRenderEditInput()}
				</div>
			</div>
		</div>
	)
}
