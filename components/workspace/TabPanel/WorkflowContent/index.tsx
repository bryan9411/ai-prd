'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { WorkflowItem } from '@/components/workspace/TabPanel/WorkflowContent/WorkflowItem'
import { StepRowInput } from '@/components/workspace/TabPanel/WorkflowContent/StepRowInput'
import { useProjectStore } from '@/store/useProjectStore'
import { type WorkflowStep } from '@/types/project'

export const WorkflowContent = () => {
	const [isAdding, setIsAdding] = useState(false)

	const workflow = useProjectStore((state) => state.workflow)
	const updateWorkflow = useProjectStore((state) => state.updateWorkflow)

	const handleUpdateItem = (id: string, field: 'roleAStep' | 'roleBStep', value: string) => {
		const nextSteps = workflow.steps.map((step) => {
			const isTargetStep = step.id === id

			if (!isTargetStep) return step

			return {
				...step,
				[field]: value,
			}
		})

		updateWorkflow({
			...workflow,
			steps: nextSteps,
		})
	}

	const handleDeleteItem = (id: string) => {
		const nextSteps = workflow.steps.filter((step) => step.id !== id)

		updateWorkflow({
			...workflow,
			steps: nextSteps,
		})
	}

	const handleAddStepRow = (roleAStep: string, roleBStep: string) => {
		const newStep: WorkflowStep = {
			id: `w${Date.now()}`,
			roleAStep,
			roleBStep,
		}

		const nextSteps = [...workflow.steps, newStep]

		updateWorkflow({
			...workflow,
			steps: nextSteps,
		})

		setIsAdding(false)
	}

	const maybeRenderRoleHeaders = () => {
		if (workflow.steps.length === 0) return

		return (
			<div className='flex items-center gap-3 mb-1'>
				<div className='w-6 shrink-0' />
				<div className='flex-1 grid grid-cols-2 gap-2'>
					<div className='text-xs font-semibold text-blue-600 dark:text-blue-400 px-3'>{workflow.roleAName}</div>
					<div className='text-xs font-semibold text-emerald-600 dark:text-emerald-400 px-3'>{workflow.roleBName}</div>
				</div>
				<div className='w-6 shrink-0' />
			</div>
		)
	}

	const renderWorkflowItems = () =>
		workflow.steps.map((step, idx) => (
			<WorkflowItem
				key={step.id}
				step={step}
				index={idx}
				isLast={idx === workflow.steps.length - 1}
				onUpdate={handleUpdateItem}
				onDelete={handleDeleteItem}
			/>
		))

	const maybeRenderAddStepRow = () => {
		if (isAdding) {
			return (
				<StepRowInput
					stepNumber={workflow.steps.length + 1}
					roleAName={workflow.roleAName}
					roleBName={workflow.roleBName}
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
			{maybeRenderRoleHeaders()}
			{renderWorkflowItems()}
			{maybeRenderAddStepRow()}
		</div>
	)
}
