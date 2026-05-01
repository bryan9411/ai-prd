export const WorkflowContent = () => {
	const steps = ['需求分析', '原型設計', '技術架構', '開發實作', '測試上線']

	const renderSteps = () => {
		return steps.map((step, idx) => {
			return (
				<div key={idx} className='flex items-stretch gap-3'>
					<div className='flex flex-col items-center'>
						<div className='w-6 h-6 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center text-[10px] font-bold shrink-0'>
							{idx + 1}
						</div>
						{idx < steps.length - 1 && <div className='w-px flex-1 bg-neutral-200 dark:bg-neutral-800 mt-1' />}
					</div>
					<div className='flex-1 pb-2'>
						<div className='rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-300'>
							{step}
						</div>
					</div>
				</div>
			)
		})
	}

	return <div className='flex flex-col gap-1.5'>{renderSteps()}</div>
}
