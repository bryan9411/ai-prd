import { z } from 'zod'
import type { DeepPartial } from 'ai'

/** 章節標題 */
export const sectionLabelsSchema = z.object({
	userPersonas: z.string(),
	features: z.string(),
	systemModules: z.string(),
	dataModels: z.string(),
	valuePropositions: z.string(),
})

/** 使用者角色 */
export const userPersonaSchema = z.object({
	name: z.string(),
	description: z.string(),
})

/** 核心功能 */
export const featureSchema = z.object({
	name: z.string(),
	description: z.string(),
	icon: z.string(),
})

/** 系統模組 */
export const systemModuleSchema = z.object({
	name: z.string(),
	description: z.string(),
})

/** 資料模型 */
export const dataModelSchema = z.object({
	name: z.string(),
	description: z.string(),
})

/** 模組化 PRD 結構 */
export const prdContentSchema = z.object({
	tagline: z.string(),
	overview: z.string(),
	productGoal: z.string(),
	sectionLabels: sectionLabelsSchema,
	userPersonas: z.array(userPersonaSchema).min(1),
	features: z.array(featureSchema).min(3),
	systemModules: z.array(systemModuleSchema).min(2),
	dataModels: z.array(dataModelSchema).min(2),
	valuePropositions: z.array(z.string()).min(2),
})

export const taskItemSchema = z.object({
	label: z.string(),
	priority: z.enum(['High', 'Medium', 'Low']),
})

export const workflowStepSchema = z.object({
	roleAStep: z.string(),
	roleBStep: z.string(),
})

export const workflowOutputSchema = z.object({
	roleAName: z.string(),
	roleBName: z.string(),
	steps: z.array(workflowStepSchema),
})

export const aiPhaseSchema = z.object({
	name: z.string(),
	timeframe: z.string(),
	goal: z.string(),
	deliverables: z.array(z.string()),
	successMetrics: z.array(z.string()),
})

export const aiSuggestionSchema = z.object({
	category: z.string(),
	title: z.string(),
	description: z.string(),
	actionItems: z.array(z.string()).min(2).max(4),
	impact: z.enum(['High', 'Medium', 'Low']),
})

export const aiGenerateOutputSchema = z.object({
	prd: prdContentSchema,
	tasks: z.array(taskItemSchema),
	workflow: workflowOutputSchema,
	phases: z.array(aiPhaseSchema).min(3),
	suggestions: z.array(aiSuggestionSchema),
})

export type SectionLabels = z.infer<typeof sectionLabelsSchema>
export type UserPersona = z.infer<typeof userPersonaSchema>
export type Feature = z.infer<typeof featureSchema>
export type SystemModule = z.infer<typeof systemModuleSchema>
export type DataModel = z.infer<typeof dataModelSchema>
export type PRDContent = z.infer<typeof prdContentSchema>
export type AIPhase = z.infer<typeof aiPhaseSchema>
export type AISuggestion = z.infer<typeof aiSuggestionSchema> & { id?: string }
export type AIGenerateOutput = z.infer<typeof aiGenerateOutputSchema>

// 串流生成過程中，AI 逐步輸出的部分
export type PartialAIGenerateOutput = DeepPartial<AIGenerateOutput>
