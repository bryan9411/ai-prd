import React, { ReactNode } from 'react'
import { useProjectContext } from '@/contexts/ProjectContext'

const SectionTitle = ({ children }: { children: ReactNode }) => {
	return <h3 className='text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-3'>{children}</h3>
}

export const PrdContent = () => {
	const { prd } = useProjectContext()

	if (!prd) return null

	const {
		tagline,
		overview,
		productGoal,
		sectionLabels,
		userPersonas,
		features,
		systemModules,
		dataModels,
		valuePropositions,
	} = prd

	const renderUserPersona = () => {
		return userPersonas.map((persona) => (
			<div
				key={persona.name}
				className='rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 px-4 py-3'
			>
				<p className='text-xs font-semibold text-violet-600 dark:text-violet-400 mb-0.5'>{persona.name}</p>
				<p className='text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed'>{persona.description}</p>
			</div>
		))
	}

	const renderFeatures = () => {
		return features.map((feature) => (
			<div
				key={feature.name}
				className='rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 p-3.5'
			>
				<div className='text-xl mb-2'>{feature.icon}</div>
				<p className='text-sm font-semibold text-neutral-800 dark:text-neutral-200 mb-1'>{feature.name}</p>
				<p className='text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed'>{feature.description}</p>
			</div>
		))
	}

	const renderSystemModules = () => {
		return systemModules.map((module, index) => (
			<div
				key={module.name}
				className='flex items-start gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 px-3.5 py-3'
			>
				<span className='shrink-0 w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 text-[10px] font-bold flex items-center justify-center mt-0.5'>
					{index + 1}
				</span>
				<div>
					<p className='text-xs font-semibold text-neutral-800 dark:text-neutral-200'>{module.name}</p>
					<p className='text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed mt-0.5'>
						{module.description}
					</p>
				</div>
			</div>
		))
	}

	const renderDataModels = () => {
		return dataModels.map((model) => (
			<div
				key={model.name}
				className='rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 px-3 py-2'
				title={model.description}
			>
				<p className='text-xs font-mono font-semibold text-neutral-800 dark:text-neutral-200'>{model.name}</p>
				<p className='text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5'>{model.description}</p>
			</div>
		))
	}

	const renderValuePropositions = () => {
		return valuePropositions.map((value, i) => (
			<li key={i} className='flex items-start gap-2'>
				<span className='text-emerald-500 mt-0.5 shrink-0'>✓</span>
				<span className='text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed'>{value}</span>
			</li>
		))
	}

	return (
		<div className='space-y-6'>
			{/* Tagline + 概覽 */}
			<div>
				<p className='text-base font-semibold text-neutral-900 dark:text-neutral-100 mb-1.5'>{tagline}</p>
				<p className='text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed'>{overview}</p>
			</div>

			{/* 產品目標 */}
			<div className='rounded-xl border border-violet-200 dark:border-violet-900 bg-violet-50 dark:bg-violet-950/30 px-4 py-3'>
				<p className='text-[10px] font-semibold uppercase tracking-widest text-violet-500 dark:text-violet-400 mb-1'>
					產品目標
				</p>
				<p className='text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed'>{productGoal}</p>
			</div>

			{/* 使用者角色 */}
			<section>
				<SectionTitle>{sectionLabels.userPersonas}</SectionTitle>
				<div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>{renderUserPersona()}</div>
			</section>

			{/* 核心功能 */}
			<section>
				<SectionTitle>{sectionLabels.features}</SectionTitle>
				<div className='grid grid-cols-2 gap-2.5 sm:grid-cols-3'>{renderFeatures()}</div>
			</section>

			{/* 系統模組拆分 */}
			<section>
				<SectionTitle>{sectionLabels.systemModules}</SectionTitle>
				<div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>{renderSystemModules()}</div>
			</section>

			{/* 資料結構 */}
			<section>
				<SectionTitle>{sectionLabels.dataModels}</SectionTitle>
				<div className='flex flex-wrap gap-2'>{renderDataModels()}</div>
			</section>

			{/* 核心價值 */}
			<section className='rounded-xl border border-neutral-200 dark:border-neutral-800 p-4'>
				<SectionTitle>⭐ {sectionLabels.valuePropositions}</SectionTitle>
				<ul className='grid grid-cols-1 gap-1.5 sm:grid-cols-2'>{renderValuePropositions()}</ul>
			</section>
		</div>
	)
}
