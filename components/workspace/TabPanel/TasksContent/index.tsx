'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { type Task, type Priority } from './types'
import { TaskItem } from '@/components/workspace/TabPanel/TasksContent/TaskItem'
import { TaskRowAddInput } from '@/components/workspace/TabPanel/TasksContent/TaskRowAddInput'

const initialTasks: Task[] = [
	{ id: 't1', label: '設計 UI/UX 原型', priority: 'High', done: false },
	{ id: 't2', label: '建立後端 API 架構', priority: 'High', done: false },
	{ id: 't3', label: '實作用戶認證系統', priority: 'Medium', done: false },
	{ id: 't4', label: '整合 AI 課表推薦', priority: 'Medium', done: false },
	{ id: 't5', label: '撰寫測試計劃', priority: 'Low', done: false },
]

export const TasksContent = () => {
	const [tasks, setTasks] = useState<Task[]>(initialTasks)
	const [adding, setAdding] = useState(false)

	const done = tasks.filter((t) => t.done).length

	const handleToggle = (id: string) => {
		setTasks((prev) => {
			return prev.map((value) => {
				if (value.id === id) {
					return { ...value, done: !value.done }
				}
				return value
			})
		})
	}

	const handleUpdate = (id: string, label: string, priority: Priority) => {
		setTasks((prev) => {
			return prev.map((value) => {
				if (value.id === id) {
					return { ...value, label, priority }
				}
				return value
			})
		})
	}

	const handleDelete = (id: string) => {
		setTasks((prev) => {
			return prev.filter((value) => value.id !== id)
		})
	}

	const handleAdd = (label: string, priority: Priority) => {
		setTasks((prev) => {
			return [
				...prev,
				{
					id: `t${Date.now()}`,
					label,
					priority,
					done: false,
				},
			]
		})
		setAdding(false)
	}

	const renderTaskItem = () => {
		return tasks.map((task) => {
			return (
				<TaskItem key={task.id} task={task} onToggle={handleToggle} onUpdate={handleUpdate} onDelete={handleDelete} />
			)
		})
	}

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
