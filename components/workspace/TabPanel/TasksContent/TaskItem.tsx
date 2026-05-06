'use client'

import cx from 'classnames'
import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Check, Pencil, X } from 'lucide-react'
import { type Task, type Priority } from './types'

interface TaskItemProps {
	task: Task
	onToggle: (id: string) => void
	onUpdate: (id: string, label: string, priority: Priority) => void
	onDelete: (id: string) => void
}

const priorityOptions: Priority[] = ['High', 'Medium', 'Low']

export const TaskItem = ({ task, onToggle, onUpdate, onDelete }: TaskItemProps) => {
	const [isEditing, setIsEditing] = useState(false)
	const [editLabel, setEditLabel] = useState(task.label)
	const [editPriority, setEditPriority] = useState<Priority>(task.priority)

	const inputRef = useRef<HTMLInputElement>(null)

	const badgeStyle: Record<Priority, string> = {
		High: 'text-red-500 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900',
		Medium: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
		Low: 'text-neutral-400 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800',
	}

	const isEditingStyle = isEditing
		? 'border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900'
		: 'border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 hover:bg-white dark:hover:bg-neutral-900'

	const isCheckBoxDoneStyle = task.done
		? 'bg-neutral-900 dark:bg-neutral-100 border-neutral-900 dark:border-neutral-100'
		: 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-500 dark:hover:border-neutral-400'

	const isLineThroughDoneStyle = task.done
		? 'line-through text-neutral-400 dark:text-neutral-600'
		: 'text-neutral-700 dark:text-neutral-300'

	const handleStartEdit = () => {
		setEditLabel(task.label)
		setEditPriority(task.priority)
		setIsEditing(true)
	}

	const handleConfirm = () => {
		if (!editLabel.trim()) {
			setIsEditing(false)
		}

		onUpdate(task.id, editLabel.trim(), editPriority)
		setIsEditing(false)
	}

	const handleCancel = () => {
		setEditLabel(task.label)
		setEditPriority(task.priority)
		setIsEditing(false)
	}

	const maybeRenderCheck = () => {
		if (task.done) {
			return <Check className='w-2.5 h-2.5 text-white dark:text-neutral-900' />
		}
	}

	const renderEditMode = () => {
		const handleKeyDown = (e: React.KeyboardEvent) => {
			if (e.key === 'Enter') {
				handleConfirm()
			}

			if (e.key === 'Escape') {
				handleCancel()
			}
		}

		const renderPriorityOptions = () => {
			return priorityOptions.map((priority) => (
				<SelectItem key={priority} value={priority} className='text-xs'>
					{priority}
				</SelectItem>
			))
		}

		return (
			<div className='flex items-center gap-2 flex-1 min-w-0'>
				<Input
					ref={inputRef}
					value={editLabel}
					onChange={(e) => setEditLabel(e.target.value)}
					onKeyDown={handleKeyDown}
					className='h-7 text-sm flex-1'
				/>

				<Select value={editPriority} onValueChange={(value) => setEditPriority(value as Priority)}>
					<SelectTrigger className='h-7 w-24 text-xs'>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>{renderPriorityOptions()}</SelectContent>
				</Select>

				<Button size='sm' onClick={handleConfirm} className='h-7 text-xs px-2'>
					確認
				</Button>
				<Button size='sm' variant='outline' onClick={handleCancel} className='h-7 text-xs px-2'>
					取消
				</Button>
			</div>
		)
	}

	const maybeRenderEditButton = () => {
		if (task.readonly) return

		return (
			<Button
				size='icon'
				variant='ghost'
				title='編輯'
				onClick={handleStartEdit}
				className='w-6 h-6 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
			>
				<Pencil className='w-4 h-4' />
			</Button>
		)
	}

	const renderViewMode = () => {
		return (
			<>
				<span className={cx('text-sm flex-1 transition-colors', isLineThroughDoneStyle)}>{task.label}</span>

				<Badge variant='outline' className={cx('text-[10px] shrink-0', badgeStyle[task.priority])}>
					{task.priority}
				</Badge>

				<div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0'>
					{maybeRenderEditButton()}

					<Button
						size='icon'
						variant='ghost'
						title='刪除'
						onClick={() => onDelete(task.id)}
						className='w-6 h-6 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40'
					>
						<X className='w-4 h-4' />
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
		<div
			className={cx('group flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors', isEditingStyle)}
		>
			<button
				onClick={() => !isEditing && onToggle(task.id)}
				className={cx(
					'w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-all',
					isCheckBoxDoneStyle,
				)}
			>
				{maybeRenderCheck()}
			</button>
			{isEditing ? renderEditMode() : renderViewMode()}
		</div>
	)
}
