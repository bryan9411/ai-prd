'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useProjectContext } from '@/contexts/ProjectContext'

export const IdeaInput = () => {
	const { idea, loading, submitted, setIdea, generate } = useProjectContext()

	// 只有「尚未生成（submitted = false）且非 loading 中」才可點擊
	const isDisabled = loading || submitted

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

	const maybeRenderInputPreview = () => {
		if (idea) {
			return (
				<p className='mt-2.5 text-xs text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5'>
					<span className='text-violet-500'>↳</span>
					<span className='text-neutral-600 dark:text-neutral-400 italic'>&ldquo;{idea}&rdquo;</span>
				</p>
			)
		}
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
				<Input
					type='text'
					value={idea}
					onChange={(e) => setIdea(e.target.value)}
					onKeyDown={(e) => e.key === 'Enter' && !isDisabled && generate()}
					placeholder='例如：我要做一個健身 App…'
					className='flex-1'
					disabled={submitted}
				/>

				<Button
					onClick={generate}
					disabled={isDisabled || !idea.trim()}
					className='gap-1.5 whitespace-nowrap'
					title={submitted ? '已生成，如需重新生成請先清除儲存資料' : ''}
				>
					{renderBtnText()}
				</Button>
			</div>
			{maybeRenderInputPreview()}
		</section>
	)
}
