'use client'

import cx from 'classnames'
import { useState } from 'react'
import { ChevronDown, Pin, PinOff } from 'lucide-react'
import { useProjectContext } from '@/contexts/ProjectContext'
import { ProjectVersion } from '@/types/project'
import { formatDateTime } from '@/lib/dayjs'
import { useConfirm } from '@/hooks/useConfirm'
import { Button } from '@/components/ui/button'

export const VersionDropdown = () => {
	const [menuOpen, setMenuOpen] = useState(false)

	const { confirm, ConfirmModal } = useConfirm()
	const { submitted, isDirty, versions, activeVersionId, pinnedVersionId, loadVersion, pinVersion } = useProjectContext()

	if (!submitted || versions.length === 0) return null

	const activeVersion = versions.find((version) => version.id === activeVersionId)

	const handleLoadVersion = async (versionId: string) => {
		if (isDirty) {
			const confirmed = await confirm({
				title: '放棄未儲存的變更？',
				description: '你有尚未儲存的變更，切換版本後這些變更將會遺失。',
				confirmLabel: '確認切換',
				cancelLabel: '取消',
				variant: 'destructive',
			})

			if (!confirmed) return
		}

		loadVersion(versionId)
		setMenuOpen(false)
	}

	const handlePinVersion = async (versionId: string) => {
		if (isDirty) {
			const confirmed = await confirm({
				title: '放棄未儲存的變更？',
				description: '你有尚未儲存的變更，釘選版本後這些變更將會遺失。',
				confirmLabel: '確認釘選',
				cancelLabel: '取消',
				variant: 'destructive',
			})

			if (!confirmed) return
		}

		pinVersion(versionId)
		setMenuOpen(false)
	}

	const handleVersionDate = (version: ProjectVersion) => {
		return formatDateTime(version.timestamp)
	}

	const renderVersions = () => {
		return versions.map((version) => {
			const isActive = version.id === activeVersionId
			const isPinned = version.id === pinnedVersionId

			const rowStyle = isActive
				? 'bg-neutral-100 dark:bg-neutral-800'
				: 'hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
			const textStyle = isActive
				? 'text-neutral-900 dark:text-neutral-100 font-medium'
				: 'text-neutral-600 dark:text-neutral-400'
			const pinStyle = isPinned
				? 'text-violet-500 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 hover:bg-violet-100 dark:hover:bg-violet-900/50'
				: 'text-neutral-300 dark:text-neutral-600 hover:text-neutral-500 dark:hover:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'

			return (
				<div key={version.id} className={cx('flex items-center gap-1.5 px-3 py-2 transition-colors', rowStyle)}>
					{/* 版本資訊（點擊切換） */}
					<Button
						variant='ghost'
						onClick={() => handleLoadVersion(version.id)}
						className={cx('flex-1 h-auto py-0 px-0 justify-between gap-3 min-w-0 hover:bg-transparent font-normal', textStyle)}
					>
						<span className='text-sm'>{version.label}</span>
						<span className='shrink-0 text-xs text-neutral-400 dark:text-neutral-500'>
							{handleVersionDate(version)}
						</span>
					</Button>

					{/* 釘選按鈕 */}
					<Button
						variant='ghost'
						size='icon'
						onClick={() => handlePinVersion(version.id)}
						title={isPinned ? '已設為使用版本' : '設為使用版本'}
						className={cx('shrink-0 w-7 h-7', pinStyle)}
					>
						{isPinned ? <Pin className='w-4 h-4' /> : <PinOff className='w-4 h-4' />}
					</Button>
				</div>
			)
		})
	}

	const maybeRenderVersionMenu = () => {
		if (!menuOpen) return null

		return (
			<>
				<div className='fixed inset-0 z-10' onClick={() => setMenuOpen(false)} />
				<div
					className='absolute right-0 top-full mt-1.5 z-20 min-w-64
          bg-white dark:bg-neutral-900
          border border-neutral-200 dark:border-neutral-800
          rounded-xl shadow-xl py-1.5 overflow-hidden'
				>
					<p className='px-4 pt-1.5 pb-2.5 text-xs text-neutral-400 dark:text-neutral-500 border-b border-neutral-100 dark:border-neutral-800'>
						釘選後，重整頁面將自動載入該版本
					</p>
					{renderVersions()}
				</div>
			</>
		)
	}

	return (
		<div className='relative'>
			<ConfirmModal />
			<button
				onClick={() => setMenuOpen((prev) => !prev)}
				className='flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all
					text-neutral-500 dark:text-neutral-400
					hover:bg-neutral-100 dark:hover:bg-neutral-900
					border border-neutral-200 dark:border-neutral-800'
			>
				{pinnedVersionId && <Pin className='w-3.5 h-3.5 opacity-70' />}
				<span>{activeVersion?.label ?? '版本'}</span>
				<ChevronDown className='w-4 h-4 opacity-70' />
			</button>

			{maybeRenderVersionMenu()}
		</div>
	)
}
