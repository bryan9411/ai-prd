'use client'

import { useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useProjectStore } from '@/store/useProjectStore'
import { useGenerateStream } from '@/hooks/useGenerateStream'

export const IdeaInput = () => {
	useGenerateStream()

	const idea = useProjectStore((state) => state.idea)
	const loading = useProjectStore((state) => state.loading)
	const submitted = useProjectStore((state) => state.submitted)
	const validationError = useProjectStore((state) => state.validationError)
	const setIdea = useProjectStore((state) => state.setIdea)
	const generate = useProjectStore((state) => state.generate)
	const clearValidationError = useProjectStore((state) => state.clearValidationError)

	const textareaRef = useRef<HTMLTextAreaElement>(null)

	const isDisabled = loading || submitted

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !isDisabled && idea.trim()) {
			e.preventDefault()
			generate()
		}
	}

	const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setIdea(e.target.value)
		if (validationError) clearValidationError()
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
				<p className='mt-2.5 text-xs text-muted-foreground flex items-center gap-1.5'>
					<span className='text-primary'>↳</span>
					<span className='italic'>&ldquo;{idea}&rdquo;</span>
				</p>
			)
		}
	}

	const maybeRenderValidationError = () => {
		if (validationError) {
			return (
				<p className='mt-2 text-xs text-red-500 dark:text-red-400 flex items-center gap-1.5'>
					<span>✕</span>
					<span>{validationError}</span>
				</p>
			)
		}
	}

	useEffect(() => {
		const el = textareaRef.current

		if (!el) return

		el.style.height = 'auto'
		el.style.height = `${el.scrollHeight}px`
	}, [idea])

	return (
		<section className='rounded-xl bg-card border border-border p-5 shadow-sm transition-shadow hover:shadow-md animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]' style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
			<div className='flex items-center gap-2 mb-3'>
				<span className='text-xs font-bold text-muted-foreground/60 uppercase tracking-widest'>
					輸入你的產品想法
				</span>
			</div>

			<textarea
				ref={textareaRef}
				value={idea}
				onChange={handleTextAreaChange}
				onKeyDown={handleKeyDown}
				placeholder='例如：我要做一個健身 App，或：我想開一間手沖咖啡廳…'
				rows={1}
				disabled={submitted}
				className='
					w-full resize-none overflow-hidden rounded-lg
					border border-border
					bg-input/30 dark:bg-input/10 px-3 py-2 text-sm leading-relaxed
					placeholder:text-muted-foreground
					focus:outline-none focus:ring-2 focus:ring-ring/30
					disabled:opacity-50 disabled:cursor-not-allowed
					transition-all min-h-9
				'
			/>

			<div className='flex items-center justify-between mt-2.5'>
				<span className='text-[11px] text-muted-foreground/50 select-none'>⌘ Enter 送出</span>
				<Button
					onClick={generate}
					disabled={isDisabled || !idea.trim()}
					className='h-8 text-sm gap-2 px-4 whitespace-nowrap shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all disabled:shadow-none'
					title={submitted ? '已生成，如需重新生成請先清除儲存資料' : ''}
				>
					{renderBtnText()}
				</Button>
			</div>
			{maybeRenderValidationError()}
			{!validationError && maybeRenderInputPreview()}
		</section>
	)
}
