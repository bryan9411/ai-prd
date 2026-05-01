'use client'

interface IdeaInputProps {
	idea: string
	loading: boolean
	onChange: (val: string) => void
	onGenerate: () => void
}

export const IdeaInput = ({ idea, loading, onChange, onGenerate }: IdeaInputProps) => {
	const renderBtnText = () => {
		if (loading) {
			return <span className='inline-block animate-spin text-base leading-none'>↻</span>
		}

		return (
			<>
				<span className='text-base leading-none'>→</span>
				<span>開始生成</span>
			</>
		)
	}

	return (
		<section
			className='
			rounded-xl bg-white dark:bg-neutral-950
			border border-neutral-200 dark:border-neutral-800
			p-5 shadow-sm
		'
		>
			<div className='flex items-center gap-2 mb-3'>
				<span className='text-xs font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-widest'>
					輸入你的產品想法
				</span>
			</div>

			<div className='flex gap-2'>
				<input
					type='text'
					value={idea}
					onChange={(e) => onChange(e.target.value)}
					onKeyDown={(e) => e.key === 'Enter' && onGenerate()}
					placeholder='例如：我要做一個健身 App…'
					className='
						flex-1 bg-neutral-50 dark:bg-neutral-900
						border border-neutral-200 dark:border-neutral-800
						rounded-lg px-3.5 py-2.5 text-sm
						text-neutral-900 dark:text-neutral-100
						placeholder-neutral-400 dark:placeholder-neutral-600
						focus:outline-none focus:ring-2 focus:ring-neutral-900/10 dark:focus:ring-neutral-100/10
						focus:border-neutral-400 dark:focus:border-neutral-600
						transition-all
					'
				/>
				<button
					onClick={onGenerate}
					disabled={loading || !idea.trim()}
					className='
						flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium
						bg-neutral-900 dark:bg-neutral-100
						text-white dark:text-neutral-900
						hover:bg-neutral-700 dark:hover:bg-neutral-300
						disabled:opacity-40 disabled:cursor-not-allowed
						transition-all active:scale-[0.98]
						whitespace-nowrap
					'
				>
					{renderBtnText()}
				</button>
			</div>

			{/* 輸入內容預覽 */}
			{idea && (
				<p className='mt-2.5 text-xs text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5'>
					<span className='text-violet-500'>↳</span>
					<span className='text-neutral-600 dark:text-neutral-400 italic'>&ldquo;{idea}&rdquo;</span>
				</p>
			)}
		</section>
	)
}
