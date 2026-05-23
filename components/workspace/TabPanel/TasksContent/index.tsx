'use client'

import cx from 'classnames'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { TaskItem } from '@/components/workspace/TabPanel/TasksContent/TaskItem'
import { TaskRowAddInput } from '@/components/workspace/TabPanel/TasksContent/TaskRowAddInput'
import { useProjectContext } from '@/contexts/ProjectContext'
import { type Task, type Priority } from './types'

const PRIORITY_ORDER: Priority[] = ['High', 'Medium', 'Low']

const priorityGroupLabel: Record<Priority, string> = {
	High: '高優先',
	Medium: '中優先',
	Low: '低優先',
}

const priorityDotStyle: Record<Priority, string> = {
	High: 'bg-red-400',
	Medium: 'bg-amber-400',
	Low: 'bg-neutral-300 dark:bg-neutral-600',
}

export const TasksContent = () => {
	const [adding, setAdding] = useState(false)

	const { tasks, updateTasks } = useProjectContext()

	const handleToggle = (id: string) => {
		const next = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
		updateTasks(next)
	}

	const handleUpdate = (id: string, label: string, priority: Priority) => {
		const next = tasks.map((t) => (t.id === id ? { ...t, label, priority } : t))
		updateTasks(next)
	}

	const handleDelete = (id: string) => {
		updateTasks(tasks.filter((t) => t.id !== id))
	}

	const handleAdd = (label: string, priority: Priority) => {
		const next: Task[] = [...tasks, { id: `t${Date.now()}`, label, priority, done: false }]

		updateTasks(next)
		setAdding(false)
	}

	const taskGroupsByPriority = PRIORITY_ORDER.map((priority) => {
		const items = tasks.filter((t) => t.priority === priority)

		return { priority, items }
	})

	const renderGroups = () => {
		if (taskGroupsByPriority.length === 0) return null

		return taskGroupsByPriority.map((group) => (
			<div key={group.priority} className='mb-4 last:mb-0'>
				<div className='flex items-center gap-1.5 mb-1 px-2.5'>
					<span className={cx('w-1.5 h-1.5 rounded-full shrink-0', priorityDotStyle[group.priority])} />
					<span className='text-[10px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500'>
						{priorityGroupLabel[group.priority]}
					</span>
					<span className='text-[10px] text-neutral-300 dark:text-neutral-700 ml-0.5'>{group.items.length}</span>
				</div>
				<div className='space-y-0.5'>
					{group.items.map((item) => (
						<TaskItem
							key={item.id}
							task={item}
							onToggle={handleToggle}
							onUpdate={handleUpdate}
							onDelete={handleDelete}
						/>
					))}
				</div>
			</div>
		))
	}

	const maybeRenderEmptyState = () => {
		if (tasks.length === 0 && !adding) {
			return (
				<div className='flex flex-col items-center justify-center py-12 gap-3'>
					<div className='w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center'>
						<span className='text-xl'>✓</span>
					</div>
					<p className='text-sm text-neutral-400 dark:text-neutral-500'>尚無任務，點擊下方按鈕新增</p>
				</div>
			)
		}
	}

	return (
		<div>
			{renderGroups()}
			{maybeRenderEmptyState()}
			{adding && <TaskRowAddInput onAdd={handleAdd} onCancel={() => setAdding(false)} />}
			<div className='mt-3 flex justify-end'>
				<Button
					variant='ghost'
					size='sm'
					className='h-7 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
					onClick={() => setAdding(true)}
				>
					+ 新增任務
				</Button>
			</div>
		</div>
	)
}
