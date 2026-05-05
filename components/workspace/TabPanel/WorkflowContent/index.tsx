'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { WorkflowItem } from '@/components/workspace/TabPanel/WorkflowContent/WorkflowItem'
import { StepRowInput } from '@/components/workspace/TabPanel/WorkflowContent/StepRowInput'
import { type Step } from '@/components/workspace/TabPanel/WorkflowContent/types'

const initialSteps: Step[] = [
	{ id: 'w1', label: '需求分析' },
	{ id: 'w2', label: '原型設計' },
	{ id: 'w3', label: '技術架構' },
	{ id: 'w4', label: '開發實作' },
	{ id: 'w5', label: '測試上線' },
]

export const WorkflowContent = () => {
	const [steps, setSteps] = useState<Step[]>(initialSteps)
	const [isAdding, setIsAdding] = useState(false)

	const handleUpdateItem = (id: string, label: string) => {
		setSteps((prev) => {
			return prev.map((value) => {
				if (value.id === id) {
					return { ...value, label }
				}
				return value
			})
		})
	}

	const handleDeleteItem = (id: string) => {
		setSteps((prev) => {
			return prev.filter((value) => value.id !== id)
		})
	}

	const handleAddStepRow = (label: string) => {
		setSteps((prev) => [...prev, { id: `w${Date.now()}`, label }])
		setIsAdding(false)
	}

	const handleOpenAddStepRow = () => {
		setIsAdding(true)
	}

	const handleCancelAddStepRow = () => {
		setIsAdding(false)
	}

	const renderWorkflowItem = () => {
		return steps.map((step, idx) => (
			<WorkflowItem
				key={step.id}
				step={step}
				index={idx}
				isLast={idx === steps.length - 1}
				onUpdate={handleUpdateItem}
				onDelete={handleDeleteItem}
			/>
		))
	}

	const maybeRenderAddStepRow = () => {
		if (isAdding) {
			return <StepRowInput stepNumber={steps.length + 1} onAdd={handleAddStepRow} onCancel={handleCancelAddStepRow} />
		}

		return (
			<Button
				className='h-7 text-xs text-neutral-400 mt-1 self-start pl-9'
				variant='ghost'
				size='sm'
				onClick={handleOpenAddStepRow}
			>
				+ 新增步驟
			</Button>
		)
	}

	return (
		<div className='flex flex-col gap-1.5'>
			{renderWorkflowItem()}
			{maybeRenderAddStepRow()}
		</div>
	)
}
