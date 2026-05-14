import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-tw'

dayjs.extend(relativeTime)
dayjs.locale('zh-tw')

export { dayjs }

/**
 * 相對時間：剛剛 / N 分鐘前 / N 小時前 / 昨天 / M/D
 */
export const formatRelativeTime = (timestamp: number): string => {
	const now = dayjs()
	const target = dayjs(timestamp)
	const diffMin = now.diff(target, 'minute')
	const diffHour = now.diff(target, 'hour')
	const diffDay = now.diff(target, 'day')

	if (diffMin < 1) return '剛剛'
	if (diffHour < 1) return `${diffMin} 分鐘前`
	if (diffDay < 1) return `${diffHour} 小時前`
	if (diffDay < 2) return '昨天'

	return target.format('M/D')
}

/**
 * 完整日期時間：M月D日 HH:mm
 */
export const formatDateTime = (timestamp: number): string => {
	return dayjs(timestamp).format('M月D日 HH:mm')
}
