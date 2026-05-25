import React, { ReactNode } from 'react'
import { useProjectStore } from '@/store/useProjectStore'

const SectionTitle = ({ children }: { children: ReactNode }) => {
	return (
		<h3 className='text-[10px] font-bold text-stone-400 dark:text-neutral-500 uppercase tracking-widest mb-3'>
			{children}
		</h3>
	)
}

export const PrdContent = () => {
	const prd = useProjectStore((state) => state.prd)

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
				className='rounded-lg bg-stone-50 dark:bg-white/3 border-l-2 border-[#0DAABA]/25 dark:border-[#0DAABA]/20 hover:border-[#0DAABA] dark:hover:border-[#0DAABA] px-4 py-3 transition-colors'
			>
				<p className='text-xs font-semibold text-[#0A8E9C] dark:text-[#2DD4E4] mb-0.5'>{persona.name}</p>
				<p className='text-xs text-stone-500 dark:text-neutral-400 leading-relaxed'>{persona.description}</p>
			</div>
		))
	}

	const renderFeatures = () => {
		return features.map((feature) => (
			<div
				key={feature.name}
				className='rounded-lg bg-stone-50 dark:bg-white/3 border border-stone-200 dark:border-[#2A2825] border-t-2 border-t-transparent hover:border-t-[#0DAABA] p-3.5 transition-all'
			>
				<div className='text-xl mb-2'>{feature.icon}</div>
				<p className='text-sm font-semibold text-stone-800 dark:text-neutral-200 mb-1'>{feature.name}</p>
				<p className='text-xs text-stone-500 dark:text-neutral-400 leading-relaxed'>{feature.description}</p>
			</div>
		))
	}

	const renderSystemModules = () => {
		return systemModules.map((module, index) => (
			<div
				key={module.name}
				className='flex items-start gap-3 rounded-lg bg-stone-50 dark:bg-white/3 border border-stone-200 dark:border-[#2A2825] px-3.5 py-3'
			>
				<span className='shrink-0 w-5 h-5 rounded-full bg-[#E4F7F9] dark:bg-[#0DAABA]/15 text-[#0A8E9C] dark:text-[#2DD4E4] text-[10px] font-bold flex items-center justify-center mt-0.5'>
					{index + 1}
				</span>
				<div>
					<p className='text-xs font-semibold text-stone-800 dark:text-neutral-200'>{module.name}</p>
					<p className='text-[11px] text-stone-500 dark:text-neutral-400 leading-relaxed mt-0.5'>
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
				className='rounded-lg bg-stone-50 dark:bg-white/3 border-l-2 border-[#0DAABA]/30 dark:border-[#0DAABA]/20 px-3 py-2 shadow-sm'
				title={model.description}
			>
				<p className='text-xs font-mono font-semibold text-stone-800 dark:text-neutral-200'>{model.name}</p>
				<p className='text-[10px] text-stone-400 dark:text-neutral-500 mt-0.5'>{model.description}</p>
			</div>
		))
	}

	const renderValuePropositions = () => {
		return valuePropositions.map((value, index) => (
			<li key={index} className='flex items-start gap-2'>
				<span className='text-[#0DAABA] dark:text-[#14C4D5] mt-0.5 shrink-0'>✓</span>
				<span className='text-xs text-stone-600 dark:text-neutral-300 leading-relaxed'>{value}</span>
			</li>
		))
	}

	return (
		<div className='space-y-6'>
			{/* Tagline + 概覽 */}
			<div>
				<p className='text-[17px] font-bold text-stone-900 dark:text-neutral-100 tracking-tight mb-1.5'>{tagline}</p>
				<p className='text-sm text-stone-500 dark:text-neutral-400 leading-relaxed'>{overview}</p>
			</div>

			{/* 產品目標 */}
			<div className='flex gap-0'>
				<div className='w-1 shrink-0 rounded-full bg-[#0DAABA] mr-3' />
				<div className='flex-1 bg-[#E4F7F9] dark:bg-[#0DAABA]/10 rounded-r-lg px-3 py-2.5'>
					<p className='text-[10px] font-bold uppercase tracking-widest text-[#0A8E9C] dark:text-[#2DD4E4] mb-1'>
						產品目標
					</p>
					<p className='text-sm text-stone-700 dark:text-neutral-300 leading-relaxed'>{productGoal}</p>
				</div>
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
			<section>
				<SectionTitle>⭐ {sectionLabels.valuePropositions}</SectionTitle>
				<ul className='grid grid-cols-1 gap-1.5 sm:grid-cols-2'>{renderValuePropositions()}</ul>
			</section>
		</div>
	)
}
