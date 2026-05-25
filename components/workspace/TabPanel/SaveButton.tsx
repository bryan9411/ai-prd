'use client'

import cx from 'classnames'
import { useState } from 'react'
import { Save, Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProjectStore } from '@/store/useProjectStore'

export const SaveButton = () => {
	const [menuOpen, setMenuOpen] = useState(false)

	const submitted = useProjectStore((state) => state.submitted)
	const isDirty = useProjectStore((state) => state.isDirty)
	const isSaveSuccess = useProjectStore((state) => state.isSaveSuccess)
	const versions = useProjectStore((state) => state.versions)
	const activeVersionId = useProjectStore((state) => state.activeVersionId)
	const saveVersion = useProjectStore((state) => state.saveVersion)
	const saveOverwrite = useProjectStore((state) => state.saveOverwrite)

	if (!submitted) return null

	const activeVersion = versions.find((version) => version.id === activeVersionId)
	const isActiveOrigin = activeVersion?.isOrigin ?? false
	const isVersionsFull = versions.length >= 3

	const handleSaveVersion = () => {
		saveVersion()
		setMenuOpen(false)
	}

	const handleSaveOverwrite = () => {
		if (activeVersionId) saveOverwrite(activeVersionId)
		setMenuOpen(false)
	}

	const maybeRenderSaveMenu = () => {
		if (!menuOpen) return null

		return (
			<>
				<div className='fixed inset-0 z-10' onClick={() => setMenuOpen(false)} />
				<div className='absolute right-0 top-full mt-1.5 z-20 min-w-52 bg-white dark:bg-[#1C1B18] border border-stone-200 dark:border-[#2A2825] rounded-xl shadow-xl py-1.5 overflow-hidden'>
					{/* 另存新版本 */}
					<button
						onClick={handleSaveVersion}
						disabled={isVersionsFull && !isActiveOrigin}
						className={cx(
							'w-full text-left px-4 py-2.5 text-sm flex items-start gap-2 transition-colors',
							isVersionsFull && !isActiveOrigin
								? 'text-stone-300 dark:text-neutral-600 cursor-not-allowed'
								: 'text-stone-700 dark:text-neutral-300 hover:bg-stone-50 dark:hover:bg-white/5',
						)}
					>
						<div className='flex flex-col gap-0.5'>
							<span className='font-medium'>另存新版本</span>
							<span className='text-xs text-neutral-400 dark:text-neutral-500'>
								{isVersionsFull && !isActiveOrigin ? '已達版本上限(3 個）' : '另存新版本'}
							</span>
						</div>
					</button>

					<div className='border-t border-stone-100 dark:border-[#2A2825] my-1' />

					{/* 覆蓋目前版本 */}
					<button
						onClick={handleSaveOverwrite}
						disabled={isActiveOrigin || !activeVersionId}
						className={cx(
							'w-full text-left px-4 py-2.5 text-sm flex items-start gap-2 transition-colors',
							isActiveOrigin || !activeVersionId
								? 'text-stone-300 dark:text-neutral-600 cursor-not-allowed'
								: 'text-stone-700 dark:text-neutral-300 hover:bg-stone-50 dark:hover:bg-white/5',
						)}
					>
						<div className='flex flex-col gap-0.5'>
							<span className='font-medium'>覆蓋目前版本</span>
							<span className='text-xs text-neutral-400 dark:text-neutral-500'>
								{isActiveOrigin ? '原始版本不可覆蓋' : `更新「${activeVersion?.label}」的內容`}
							</span>
						</div>
					</button>
				</div>
			</>
		)
	}

	if (isSaveSuccess) {
		return (
			<Button
				size='sm'
				variant='ghost'
				disabled
				className='h-9 px-3 text-sm gap-2 text-emerald-600 dark:text-emerald-400 pointer-events-none'
			>
				<Check className='w-4 h-4' />
				<span>已儲存</span>
			</Button>
		)
	}

	if (!isDirty) {
		return (
			<Button
				size='sm'
				variant='outline'
				disabled
				className='h-9 px-3 text-sm gap-2 text-neutral-400 dark:text-neutral-600'
			>
				<Save className='w-4 h-4' />
				<span>儲存</span>
			</Button>
		)
	}

	return (
		<div className='relative'>
			<Button
				size='sm'
				variant='default'
				onClick={() => setMenuOpen((prev) => !prev)}
				className='h-9 px-3 text-sm gap-2'
			>
				<Save className='w-4 h-4' />
				<span>儲存</span>
				<span className='w-2 h-2 rounded-full bg-amber-400 shrink-0' />
				<ChevronDown className='w-4 h-4 opacity-70' />
			</Button>

			{maybeRenderSaveMenu()}
		</div>
	)
}
