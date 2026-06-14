'use client'

import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface SimilarProjectDialogProps {
	open: boolean
	projectName: string
	onUseCached: () => void
	onRegenerate: () => void
}

export const SimilarProjectDialog = ({ open, projectName, onUseCached, onRegenerate }: SimilarProjectDialogProps) => {
	return (
		<AlertDialog open={open}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>找到相似的構想</AlertDialogTitle>
					<AlertDialogDescription>
						你的輸入與現有專案「<span className='font-medium text-foreground'>{projectName}</span>
						」的構想非常相似。要直接載入既有結果，還是重新生成一份？
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<Button variant='outline' onClick={onRegenerate}>
						重新生成
					</Button>
					<Button onClick={onUseCached}>使用舊結果</Button>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
