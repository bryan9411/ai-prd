/** 核心功能 */
export interface Feature {
	name: string
	description: string
	icon: string
}

/** 使用者角色 */
export interface UserPersona {
	name: string
	description: string
}

/** 系統模組 */
export interface SystemModule {
	name: string
	description: string
}

/** 資料模型 */
export interface DataModel {
	name: string
	description: string
}

/** 章節標題 */
export interface SectionLabels {
	userPersonas: string
	features: string
	systemModules: string
	dataModels: string
	valuePropositions: string
}

/** 模組化 PRD 結構 */
export interface PRDContent {
	tagline: string
	overview: string
	productGoal: string
	sectionLabels: SectionLabels
	userPersonas: UserPersona[]
	features: Feature[]
	systemModules: SystemModule[]
	dataModels: DataModel[]
	valuePropositions: string[]
}

export interface AIPhase {
	name: string
	timeframe: string
	goal: string
	deliverables: string[]
	successMetrics: string[]
}

export interface AISuggestion {
	category: string
	title: string
	description: string
	actionItems: string[]
	impact: 'High' | 'Medium' | 'Low'
}

export interface AIGenerateOutput {
	prd: PRDContent
	tasks: { label: string; priority: 'High' | 'Medium' | 'Low' }[]
	workflow: {
		roleAName: string
		roleBName: string
		steps: { roleAStep: string; roleBStep: string }[]
	}
	phases: AIPhase[]
	suggestions: AISuggestion[]
}

export const AI_OUTPUT_SCHEMA = {
	type: 'object',
	required: ['prd', 'tasks', 'workflow', 'phases', 'suggestions'],
	additionalProperties: false,
	properties: {
		prd: {
			type: 'object',
			required: [
				'tagline',
				'overview',
				'productGoal',
				'sectionLabels',
				'userPersonas',
				'features',
				'systemModules',
				'dataModels',
				'valuePropositions',
			],
			additionalProperties: false,
			properties: {
				tagline: { type: 'string' },
				overview: { type: 'string' },
				productGoal: { type: 'string' },
				sectionLabels: {
					type: 'object',
					required: ['userPersonas', 'features', 'systemModules', 'dataModels', 'valuePropositions'],
					additionalProperties: false,
					properties: {
						userPersonas: { type: 'string' },
						features: { type: 'string' },
						systemModules: { type: 'string' },
						dataModels: { type: 'string' },
						valuePropositions: { type: 'string' },
					},
				},
				userPersonas: {
					type: 'array',
					minItems: 1,
					items: {
						type: 'object',
						required: ['name', 'description'],
						additionalProperties: false,
						properties: {
							name: { type: 'string' },
							description: { type: 'string' },
						},
					},
				},
				features: {
					type: 'array',
					minItems: 3,
					items: {
						type: 'object',
						required: ['name', 'description', 'icon'],
						additionalProperties: false,
						properties: {
							name: { type: 'string' },
							description: { type: 'string' },
							icon: { type: 'string' },
						},
					},
				},
				systemModules: {
					type: 'array',
					minItems: 2,
					items: {
						type: 'object',
						required: ['name', 'description'],
						additionalProperties: false,
						properties: {
							name: { type: 'string' },
							description: { type: 'string' },
						},
					},
				},
				dataModels: {
					type: 'array',
					minItems: 2,
					items: {
						type: 'object',
						required: ['name', 'description'],
						additionalProperties: false,
						properties: {
							name: { type: 'string' },
							description: { type: 'string' },
						},
					},
				},
				valuePropositions: {
					type: 'array',
					minItems: 2,
					items: { type: 'string' },
				},
			},
		},
		tasks: {
			type: 'array',
			items: {
				type: 'object',
				required: ['label', 'priority'],
				additionalProperties: false,
				properties: {
					label: { type: 'string' },
					priority: { type: 'string', enum: ['High', 'Medium', 'Low'] },
				},
			},
		},
		workflow: {
			type: 'object',
			required: ['roleAName', 'roleBName', 'steps'],
			additionalProperties: false,
			properties: {
				roleAName: { type: 'string' },
				roleBName: { type: 'string' },
				steps: {
					type: 'array',
					items: {
						type: 'object',
						required: ['roleAStep', 'roleBStep'],
						additionalProperties: false,
						properties: {
							roleAStep: { type: 'string' },
							roleBStep: { type: 'string' },
						},
					},
				},
			},
		},
		phases: {
			type: 'array',
			minItems: 3,
			items: {
				type: 'object',
				required: ['name', 'timeframe', 'goal', 'deliverables', 'successMetrics'],
				additionalProperties: false,
				properties: {
					name: { type: 'string' },
					timeframe: { type: 'string' },
					goal: { type: 'string' },
					deliverables: { type: 'array', items: { type: 'string' } },
					successMetrics: { type: 'array', items: { type: 'string' } },
				},
			},
		},
		suggestions: {
			type: 'array',
			items: {
				type: 'object',
				required: ['category', 'title', 'description', 'actionItems', 'impact'],
				additionalProperties: false,
				properties: {
					category: { type: 'string' },
					title: { type: 'string' },
					description: { type: 'string' },
					actionItems: { type: 'array', minItems: 2, maxItems: 4, items: { type: 'string' } },
					impact: { type: 'string', enum: ['High', 'Medium', 'Low'] },
				},
			},
		},
	},
}
