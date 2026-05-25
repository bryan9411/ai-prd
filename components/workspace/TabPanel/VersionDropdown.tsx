'use client'

import cx from 'classnames'
import { useState } from 'react'
import { ChevronDown, Pin, PinOff } from 'lucide-react'
import { useProjectStore } from '@/store/useProjectStore'
import { ProjectVersion } from '@/types/project'
import { formatDateTime } from '@/lib/dayjs'
import { useConfirm } from '@/hooks/useConfirm'
import { Button } from '@/components/ui/button'

export const VersionDropdown = () => {
	const [menuOpen, setMenuOpen] = useState(false)

	const { confirm, ConfirmModal } = useConfirm()

	const submitted = useProjectStore((state) => state.submitted)
	const isDirty = useProjectStore((state) => state.isDirty)
	const versions = useProjectStore((state) => state.versions)
	const activeVersionId = useProjectStore((state) => state.activeVersionId)
	const pinnedVersionId = useProjectStore((state) => state.pinnedVersionId)
	const loadVersion = useProjectStore((state) => state.loadVersion)
	const pinVersion = useProjectStore((state) => state.pinVersion)

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

			const rowStyle = isActive ? 'bg-stone-100 dark:bg-white/5' : 'hover:bg-stone-50 dark:hover:bg-white/[0.03]'
			const textStyle = isActive
				? 'text-stone-900 dark:text-neutral-100 font-medium'
				: 'text-stone-600 dark:text-neutral-400'
			const pinStyle = isPinned
				? 'text-[#0A8E9C] dark:text-[#2DD4E4] bg-[#E4F7F9] dark:bg-[#0DAABA]/12 hover:bg-[#E4F7F9] dark:hover:bg-[#0DAABA]/20'
				: 'text-stone-300 dark:text-neutral-600 hover:text-stone-500 dark:hover:text-neutral-400 hover:bg-stone-100 dark:hover:bg-white/5'

			return (
				<div key={version.id} className={cx('flex items-center gap-1.5 px-3 py-2 transition-colors', rowStyle)}>
					<Button
						variant='ghost'
						onClick={() => handleLoadVersion(version.id)}
						className={cx(
							'flex-1 h-auto py-0 px-0 justify-between gap-3 min-w-0 hover:bg-transparent font-normal',
							textStyle,
						)}
					>
						<span className='text-sm'>{version.label}</span>
						<span className='shrink-0 text-xs text-stone-400 dark:text-neutral-500'>{handleVersionDate(version)}</span>
					</Button>

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
				<div className='absolute right-0 top-full mt-1.5 z-20 min-w-64 bg-white dark:bg-[#1C1B18] border border-stone-200 dark:border-[#2A2825] rounded-xl shadow-xl py-1.5 overflow-hidden'>
					<p className='px-4 pt-1.5 pb-2.5 text-xs text-stone-400 dark:text-neutral-500 border-b border-stone-100 dark:border-[#2A2825]'>
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
				className='
          flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all
					text-stone-500 dark:text-neutral-400
					hover:bg-stone-100 dark:hover:bg-white/5
					border border-stone-200 dark:border-[#2A2825]'
			>
				{pinnedVersionId && <Pin className='w-3.5 h-3.5 opacity-70' />}
				<span>{activeVersion?.label ?? '版本'}</span>
				<ChevronDown className='w-4 h-4 opacity-70' />
			</button>

			{maybeRenderVersionMenu()}
		</div>
	)
}
