'use client'

import { useState, useCallback } from 'react'
import { ConfirmDialog } from '@/components/ConfirmDialog'

interface ConfirmOptions {
	title: string
	description?: string
	confirmLabel?: string
	cancelLabel?: string
	variant?: 'default' | 'destructive'
}

export const useConfirm = () => {
	const [open, setOpen] = useState(false)
	const [options, setOptions] = useState<ConfirmOptions>({ title: '' })
	const [resolve, setResolve] = useState<((value: boolean) => void) | null>(null)

	const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
		return new Promise((res) => {
			setOptions(opts)
			setResolve(() => res)
			setOpen(true)
		})
	}, [])

	const handleConfirm = () => {
		setOpen(false)
		resolve?.(true)
	}

	const handleCancel = () => {
		setOpen(false)
		resolve?.(false)
	}

	const ConfirmModal = () => {
		return (
			<ConfirmDialog
				open={open}
				title={options.title}
				description={options.description}
				confirmLabel={options.confirmLabel}
				cancelLabel={options.cancelLabel}
				variant={options.variant}
				onConfirm={handleConfirm}
				onCancel={handleCancel}
			/>
		)
	}

	return { confirm, ConfirmModal }
}
