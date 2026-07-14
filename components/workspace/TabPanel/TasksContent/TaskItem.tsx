'use client'

import cx from 'classnames'
import { memo, useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Check, Pencil, X } from 'lucide-react'
import { type Task, type Priority } from '@/types/project'

interface TaskItemProps {
	task: Task
	onToggle: (id: string) => void
	onUpdate: (id: string, label: string, priority: Priority) => void
	onDelete: (id: string) => void
}

const priorityOptions: Priority[] = ['High', 'Medium', 'Low']

const priorityStripStyle: Record<Priority, string> = {
	High: 'bg-red-400',
	Medium: 'bg-amber-400',
	Low: 'bg-neutral-300 dark:bg-neutral-500',
}

export const TaskItem = memo(({ task, onToggle, onUpdate, onDelete }: TaskItemProps) => {
	const [isEditing, setIsEditing] = useState(false)
	const [editLabel, setEditLabel] = useState(task.label)
	const [editPriority, setEditPriority] = useState<Priority>(task.priority)

	const inputRef = useRef<HTMLInputElement>(null)

	const handleStartEdit = () => {
		setEditLabel(task.label)
		setEditPriority(task.priority)
		setIsEditing(true)
	}

	const handleConfirm = () => {
		if (!editLabel.trim()) {
			setIsEditing(false)
			return
		}
		onUpdate(task.id, editLabel.trim(), editPriority)
		setIsEditing(false)
	}

	const handleCancel = () => {
		setEditLabel(task.label)
		setEditPriority(task.priority)
		setIsEditing(false)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') handleConfirm()
		if (e.key === 'Escape') handleCancel()
	}

	useEffect(() => {
		if (isEditing) inputRef.current?.focus()
	}, [isEditing])

	const renderEditMode = () => {
		return (
			<div className='flex items-center gap-2 flex-1 min-w-0'>
				<Input
					ref={inputRef}
					value={editLabel}
					onChange={(e) => setEditLabel(e.target.value)}
					onKeyDown={handleKeyDown}
					className='h-8 text-sm flex-1'
				/>
				<Select value={editPriority} onValueChange={(value) => setEditPriority(value as Priority)}>
					<SelectTrigger className='h-8 w-28 text-xs'>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{priorityOptions.map((priority) => (
							<SelectItem key={priority} value={priority} className='text-sm'>
								{priority}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Button size='sm' onClick={handleConfirm} className='h-8 text-xs px-2.5'>
					確認
				</Button>
				<Button size='sm' variant='outline' onClick={handleCancel} className='h-8 text-xs px-2.5'>
					取消
				</Button>
			</div>
		)
	}

	const renderViewMode = () => {
		return (
			<>
				<span
					className={cx(
						'text-sm flex-1 leading-snug transition-colors',
						task.done ? 'line-through text-neutral-300 dark:text-neutral-600' : 'text-neutral-700 dark:text-neutral-200',
					)}
				>
					{task.label}
				</span>
				<div className='flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0'>
					{!task.readonly && (
						<Button
							size='icon'
							variant='ghost'
							title='編輯'
							onClick={handleStartEdit}
							className='w-6 h-6 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
						>
							<Pencil className='w-3.5 h-3.5' />
						</Button>
					)}
					<Button
						size='icon'
						variant='ghost'
						title='刪除'
						onClick={() => onDelete(task.id)}
						className='w-6 h-6 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40'
					>
						<X className='w-3.5 h-3.5' />
					</Button>
				</div>
			</>
		)
	}

	return (
		<div
			className={cx(
				'group flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors',
				isEditing
					? 'bg-white dark:bg-neutral-900 ring-1 ring-neutral-200 dark:ring-neutral-700'
					: 'hover:bg-neutral-100/80 dark:hover:bg-neutral-800/50',
			)}
		>
			<div className={cx('w-0.5 h-4 rounded-full shrink-0', priorityStripStyle[task.priority])} />

			<button
				onClick={() => !isEditing && onToggle(task.id)}
				className={cx(
					'w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all',
					task.done
						? 'bg-emerald-500 border-emerald-500'
						: 'border-neutral-300 dark:border-neutral-600 hover:border-emerald-400 dark:hover:border-emerald-500',
				)}
			>
				{task.done && <Check className='w-2.5 h-2.5 text-white' />}
			</button>

			{isEditing ? renderEditMode() : renderViewMode()}
		</div>
	)
})

TaskItem.displayName = 'TaskItem'
