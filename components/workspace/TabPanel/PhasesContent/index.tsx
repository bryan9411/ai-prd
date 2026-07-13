import { useProjectStore } from '@/store/useProjectStore'

export const PhasesContent = () => {
	const phases = useProjectStore((state) => state.phases)

	const renderDeliverables = (deliverables: string[]) => {
		return deliverables.map((item, i) => (
			<p key={i} className='text-sm text-neutral-700 dark:text-neutral-300 flex gap-2 leading-relaxed'>
				<span className='text-blue-400 mt-0.5 shrink-0'>•</span>
				{item}
			</p>
		))
	}

	const renderSuccessMetrics = (metrics: string[]) => {
		return metrics.map((item, i) => (
			<p key={i} className='text-sm text-neutral-700 dark:text-neutral-300 flex gap-2 leading-relaxed'>
				<span className='text-emerald-400 mt-0.5 shrink-0'>•</span>
				{item}
			</p>
		))
	}

	const renderPhaseCard = () => {
		return phases.map((phase, index) => (
			<div
				key={index}
				className='rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 overflow-hidden'
			>
				<div className='flex items-center gap-3 px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60'>
					<div className='w-6 h-6 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center text-[10px] font-bold shrink-0'>
						{index + 1}
					</div>
					<div>
						<p className='text-sm font-semibold text-neutral-800 dark:text-neutral-200'>{phase.name}</p>
						<p className='text-[10px] text-neutral-400 dark:text-neutral-500'>{phase.timeframe}</p>
					</div>
				</div>

				<div className='px-4 pt-3 pb-1'>
					<p className='text-[10px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-1'>
						階段目標
					</p>
					<p className='text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed'>{phase.goal}</p>
				</div>

				<div className='grid grid-cols-2 divide-x divide-neutral-100 dark:divide-neutral-800 px-0 py-3'>
					<div className='px-4 space-y-2'>
						<p className='text-[10px] font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2'>
							📦 階段完成項目
						</p>
						{renderDeliverables(phase.deliverables)}
					</div>

					<div className='px-4 space-y-2'>
						<p className='text-[10px] font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2'>
							📊 成功指標
						</p>
						{renderSuccessMetrics(phase.successMetrics)}
					</div>
				</div>
			</div>
		))
	}

	return <div className='space-y-4'>{renderPhaseCard()}</div>
}
