'use client'

import { useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useProjectContext } from '@/contexts/ProjectContext'

export const IdeaInput = () => {
	const { idea, loading, submitted, setIdea, generate } = useProjectContext()

	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const isDisabled = loading || submitted

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !isDisabled && idea.trim()) {
			e.preventDefault()
			generate()
		}
	}

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
				<p className='mt-2.5 text-xs text-stone-400 dark:text-neutral-600 flex items-center gap-1.5'>
					<span className='text-[#0DAABA]'>↳</span>
					<span className='text-neutral-600 dark:text-neutral-400 italic'>&ldquo;{idea}&rdquo;</span>
				</p>
			)
		}
	}

	// 自動調整高度
	useEffect(() => {
		const el = textareaRef.current

		if (!el) return

		el.style.height = 'auto'
		el.style.height = `${el.scrollHeight}px`
	}, [idea])

	return (
		<section className='rounded-xl bg-white dark:bg-[#1C1B18] border border-stone-200 dark:border-[#2A2825] p-5 shadow-sm'>
			<div className='flex items-center gap-2 mb-3'>
				<span className='text-xs font-bold text-stone-400 dark:text-neutral-600 uppercase tracking-widest'>
					輸入你的產品想法
				</span>
			</div>

			<textarea
				ref={textareaRef}
				value={idea}
				onChange={(e) => setIdea(e.target.value)}
				onKeyDown={handleKeyDown}
				placeholder='例如：我要做一個健身 App，支援課表安排、飲食紀錄…'
				rows={1}
				disabled={submitted}
				className='
					w-full resize-none overflow-hidden rounded-lg
					border border-stone-200 dark:border-[#2A2825]
					bg-stone-50/60 dark:bg-white/3 px-3 py-2 text-sm leading-relaxed
					placeholder:text-stone-400 dark:placeholder:text-neutral-600
					focus:outline-none focus:ring-2 focus:ring-[#0DAABA]/30 dark:focus:ring-[#0DAABA]/20
					disabled:opacity-50 disabled:cursor-not-allowed
					transition-all min-h-9
				'
			/>

			<div className='flex items-center justify-between mt-2.5'>
				<span className='text-[11px] text-stone-300 dark:text-neutral-700 select-none'>⌘ Enter 送出</span>
				<Button
					onClick={generate}
					disabled={isDisabled || !idea.trim()}
					className='h-8 text-sm gap-2 px-4 whitespace-nowrap shadow-[0_2px_12px_rgba(13,170,186,0.35)] disabled:shadow-none'
					title={submitted ? '已生成，如需重新生成請先清除儲存資料' : ''}
				>
					{renderBtnText()}
				</Button>
			</div>
			{maybeRenderInputPreview()}
		</section>
	)
}
