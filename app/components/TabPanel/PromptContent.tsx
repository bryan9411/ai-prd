interface PromptContentProps {
	idea: string
}

export const PromptContent = ({ idea }: PromptContentProps) => {
	return (
		<div className='rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-950 overflow-hidden'>
			{/* 程式碼標題列 */}
			<div className='flex items-center gap-1.5 px-4 py-2.5 border-b border-neutral-800'>
				<div className='w-2.5 h-2.5 rounded-full bg-red-500/60' />
				<div className='w-2.5 h-2.5 rounded-full bg-yellow-500/60' />
				<div className='w-2.5 h-2.5 rounded-full bg-emerald-500/60' />
				<span className='ml-2 text-[10px] text-neutral-500'>system_prompt.txt</span>
			</div>
			{/* 程式碼內容 */}
			<pre className='px-4 py-4 text-xs leading-relaxed text-emerald-400 font-mono overflow-x-auto'>
				<span className='text-neutral-600'># Role</span>
				{'\n'}
				{'You are a professional product manager.\n\n'}
				<span className='text-neutral-600'># Task</span>
				{'\n'}
				{`Based on the idea: "${idea}",\ngenerate a detailed PRD including:\n`}
				{'  - User stories\n'}
				{'  - Feature list\n'}
				{'  - Technical requirements\n'}
				{'  - Success metrics\n\n'}
				<span className='text-neutral-600'># Output Format</span>
				{'\n'}
				{'Markdown with clear sections.'}
			</pre>
		</div>
	)
}
