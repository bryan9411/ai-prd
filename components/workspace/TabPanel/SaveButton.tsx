'use client'

import cx from 'classnames'
import { useState } from 'react'
import { Save, Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProjectContext } from '@/contexts/ProjectContext'

export const SaveButton = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  const { submitted, isDirty, isSaveSuccess, versions, activeVersionId, saveVersion, saveOverwrite } = useProjectContext()

  if (!submitted) return null

  const activeVersion = versions.find((v) => v.id === activeVersionId)
  const isActiveOrigin = activeVersion?.isOrigin ?? false
  const isVersionsFull = versions.length >= 3

  const handleSaveVersion = () => {
    saveVersion()
    setMenuOpen(false)
  }

  const handleSaveOverwrite = () => {
    if (activeVersionId) saveOverwrite(activeVersionId)
    setMenuOpen(false)
  }

  const maybeRenderSaveMenu = () => {
    if (!menuOpen) return null
    
    return (
      <>
        <div className='fixed inset-0 z-10' onClick={() => setMenuOpen(false)} />
        <div
          className='absolute right-0 top-full mt-1.5 z-20 min-w-52
          bg-white dark:bg-neutral-900
          border border-neutral-200 dark:border-neutral-800
          rounded-xl shadow-xl py-1.5 overflow-hidden'
        >
          {/* 另存新版本 */}
          <button
            onClick={handleSaveVersion}
            disabled={isVersionsFull && !isActiveOrigin}
            className={cx(
              'w-full text-left px-4 py-2.5 text-sm flex items-start gap-2 transition-colors',
              isVersionsFull && !isActiveOrigin
                ? 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800',
            )}
          >
            <div className='flex flex-col gap-0.5'>
              <span className='font-medium'>另存新版本</span>
              <span className='text-xs text-neutral-400 dark:text-neutral-500'>
                {isVersionsFull && !isActiveOrigin ? '已達版本上限（3 個）' : '推入新的版本槽位'}
              </span>
            </div>
          </button>

          <div className='border-t border-neutral-100 dark:border-neutral-800 my-1' />

          {/* 覆蓋目前版本 */}
          <button
            onClick={handleSaveOverwrite}
            disabled={isActiveOrigin || !activeVersionId}
            className={cx(
              'w-full text-left px-4 py-2.5 text-sm flex items-start gap-2 transition-colors',
              isActiveOrigin || !activeVersionId
                ? 'text-neutral-300 dark:text-neutral-600 cursor-not-allowed'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800',
            )}
          >
            <div className='flex flex-col gap-0.5'>
              <span className='font-medium'>覆蓋目前版本</span>
              <span className='text-xs text-neutral-400 dark:text-neutral-500'>
                {isActiveOrigin ? '原始版本不可覆蓋' : `更新「${activeVersion?.label}」的內容`}
              </span>
            </div>
          </button>
        </div>
      </>
    )
  }

  if (isSaveSuccess) {
    return (
      <Button
        size='sm'
        variant='ghost'
        disabled
        className='h-9 px-3 text-sm gap-2 text-emerald-600 dark:text-emerald-400 pointer-events-none'
      >
        <Check className='w-4 h-4' />
        <span>已儲存</span>
      </Button>
    )
  }

  if (!isDirty) {
    return (
      <Button size='sm' variant='outline' disabled className='h-9 px-3 text-sm gap-2 text-neutral-400 dark:text-neutral-600'>
        <Save className='w-4 h-4' />
        <span>儲存</span>
      </Button>
    )
  }

  return (
    <div className='relative'>
      <Button
        size='sm'
        variant='default'
        onClick={() => setMenuOpen((prev) => !prev)}
        className='h-9 px-3 text-sm gap-2'
      >
        <Save className='w-4 h-4' />
        <span>儲存</span>
        <span className='w-2 h-2 rounded-full bg-amber-400 shrink-0' />
        <ChevronDown className='w-4 h-4 opacity-70' />
      </Button>

      {maybeRenderSaveMenu()}
    </div>
  )
}
