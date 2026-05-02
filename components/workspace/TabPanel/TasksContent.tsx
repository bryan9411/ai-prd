export const TasksContent = () => {
	const tasks = [
		{ task: '設計 UI/UX 原型', priority: 'High' },
		{ task: '建立後端 API 架構', priority: 'High' },
		{ task: '實作用戶認證系統', priority: 'Medium' },
		{ task: '整合 AI 課表推薦', priority: 'Medium' },
		{ task: '撰寫測試計劃', priority: 'Low' },
	]

	const badge: Record<string, string> = {
		High: 'text-red-500 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900',
		Medium: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
		Low: 'text-neutral-400 bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800',
	}

	const renderTasks = () => {
		return tasks.map((task, idx) => (
			<div
				key={idx}
				className='flex items-center gap-3 px-4 py-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 hover:bg-white dark:hover:bg-neutral-900 transition-colors'
			>
				<div className='w-4 h-4 rounded border-2 border-neutral-300 dark:border-neutral-700 shrink-0 hover:border-violet-400 transition-colors cursor-pointer' />
				<span className='text-sm text-neutral-700 dark:text-neutral-300 flex-1'>{task.task}</span>
				<span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${badge[task.priority]}`}>
					{task.priority}
				</span>
			</div>
		))
	}

	return <div className='space-y-1.5'>{renderTasks()}</div>
}
