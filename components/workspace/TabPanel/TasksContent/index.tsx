'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { type Task, type Priority } from './types'
import { TaskItem } from '@/components/workspace/TabPanel/TasksContent/TaskItem'
import { TaskRowAddInput } from '@/components/workspace/TabPanel/TasksContent/TaskRowAddInput'
import { useProjectContext } from '@/contexts/ProjectContext'

export const TasksContent = () => {
	const [adding, setAdding] = useState(false)

	const { tasks, updateTasks } = useProjectContext()

	const done = tasks.filter((t) => t.done).length

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

	const renderTaskItem = () =>
		tasks.map((task) => (
			<TaskItem key={task.id} task={task} onToggle={handleToggle} onUpdate={handleUpdate} onDelete={handleDelete} />
		))

	const maybeRenderTaskRowAddInput = () => {
		if (adding) {
			return <TaskRowAddInput onAdd={handleAdd} onCancel={() => setAdding(false)} />
		}
	}

	const maybeRenderEmptyTask = () => {
		if (tasks.length === 0 && !adding) {
			return (
				<div className='flex flex-col items-center justify-center py-10 gap-2'>
					<p className='text-sm text-neutral-400 dark:text-neutral-500'>尚無任務</p>
				</div>
			)
		}
	}

	return (
		<div className='space-y-2'>
			<div className='flex items-center justify-between mb-1'>
				<p className='text-xs text-neutral-400 dark:text-neutral-500'>
					<span className='font-medium text-neutral-700 dark:text-neutral-300'>{done}</span> / {tasks.length} 完成
				</p>
				<Button variant='ghost' size='sm' className='h-7 text-xs text-neutral-400' onClick={() => setAdding(true)}>
					+ 新增任務
				</Button>
			</div>
			{renderTaskItem()}
			{maybeRenderTaskRowAddInput()}
			{maybeRenderEmptyTask()}
		</div>
	)
}
