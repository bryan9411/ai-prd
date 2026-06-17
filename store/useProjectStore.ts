import { create } from 'zustand'
import { createProjectSlice } from './slices/projectSlice'
import { createAISlice } from './slices/aiSlice'
import { createContentSlice } from './slices/contentSlice'
import { createVersionSlice } from './slices/versionSlice'
import type { ProjectStore } from './types'

export const useProjectStore = create<ProjectStore>((set, get, store) => ({
	...createProjectSlice(set, get, store),
	...createAISlice(set, get, store),
	...createContentSlice(set, get, store),
	...createVersionSlice(set, get, store),
}))
