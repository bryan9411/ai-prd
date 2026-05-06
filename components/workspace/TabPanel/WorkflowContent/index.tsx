'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { WorkflowItem } from '@/components/workspace/TabPanel/WorkflowContent/WorkflowItem'
import { StepRowInput } from '@/components/workspace/TabPanel/WorkflowContent/StepRowInput'
import { type Step } from '@/components/workspace/TabPanel/WorkflowContent/types'
import { useProjectContext } from '@/contexts/ProjectContext'

export const WorkflowContent = () => {
	const { steps, updateSteps } = useProjectContext()
	const [isAdding, setIsAdding] = useState(false)

	const handleUpdateItem = (id: string, label: string) => {
		const next = steps.map((s) => (s.id === id ? { ...s, label } : s))
		updateSteps(next)
	}

	const handleDeleteItem = (id: string) => {
		updateSteps(steps.filter((s) => s.id !== id))
	}

	const handleAddStepRow = (label: string) => {
		const next: Step[] = [...steps, { id: `w${Date.now()}`, label }]
		updateSteps(next)
		setIsAdding(false)
	}

	const renderWorkflowItem = () =>
		steps.map((step, idx) => (
			<WorkflowItem
				key={step.id}
				step={step}
				index={idx}
				isLast={idx === steps.length - 1}
				onUpdate={handleUpdateItem}
				onDelete={handleDeleteItem}
			/>
		))

	const maybeRenderAddStepRow = () => {
		if (isAdding) {
			return (
				<StepRowInput
					stepNumber={steps.length + 1}
					onAdd={handleAddStepRow}
					onCancel={() => setIsAdding(false)}
				/>
			)
		}

		return (
			<Button
				className='h-7 text-xs text-neutral-400 mt-1 self-start pl-9'
				variant='ghost'
				size='sm'
				onClick={() => setIsAdding(true)}
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
