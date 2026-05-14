interface PrdContentProps {
	idea: string
}

export const PrdContent = ({ idea }: PrdContentProps) => {
	const prds = [
		{
			label: 'Overview',
			content: `基於「${idea}」的產品需求文件，目標是打造直覺、高效的用戶體驗。`,
		},
		{
			label: '目標用戶',
			content: '18–35 歲健身愛好者，有記錄訓練習慣需求的用戶群體。',
		},
		{
			label: '核心功能',
			content: '訓練記錄、動作庫、進度追蹤、AI 課表建議、社群挑戰。',
		},
		{
			label: '成功指標',
			content: 'DAU > 10K、7 日留存率 > 40%、NPS > 50。',
		},
	]

	const renderPrds = () => {
		return prds.map((prd) => (
			<div
				key={prd.label}
				className='rounded-lg border border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 px-4 py-3'
			>
				<p className='text-[10px] font-semibold uppercase tracking-widest text-violet-500 dark:text-violet-400 mb-1'>
					{prd.label}
				</p>
				<p className='text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed'>{prd.content}</p>
			</div>
		))
	}

	return <div className='space-y-2.5'>{renderPrds()}</div>
}
