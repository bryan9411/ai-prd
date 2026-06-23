import { formatRelativeTime, formatDateTime } from '@/lib/dayjs'

describe('dayjs 時間格式化', () => {
	// 固定「現在」時間為 2024-06-15 12:00:00
	const NOW = new Date('2024-06-15T12:00:00').getTime()

	beforeEach(() => {
		jest.useFakeTimers()
		jest.setSystemTime(new Date(NOW))
	})

	afterEach(() => {
		jest.useRealTimers()
	})

	describe('formatRelativeTime', () => {
		it('不到 1 分鐘應顯示「剛剛」', () => {
			// 準備：30 秒前
			const thirtySecondsAgo = NOW - 30 * 1000

			// 操作 & 驗證
			expect(formatRelativeTime(thirtySecondsAgo)).toBe('剛剛')
		})

		it('N 分鐘前應顯示「N 分鐘前」', () => {
			// 準備：30 分鐘前
			const thirtyMinAgo = NOW - 30 * 60 * 1000

			// 操作 & 驗證
			expect(formatRelativeTime(thirtyMinAgo)).toBe('30 分鐘前')
		})

		it('N 小時前應顯示「N 小時前」', () => {
			// 準備 & 操作 & 驗證
			const oneHourAgo = NOW - 1 * 60 * 60 * 1000
			expect(formatRelativeTime(oneHourAgo)).toBe('1 小時前')

			const fiveHoursAgo = NOW - 5 * 60 * 60 * 1000
			expect(formatRelativeTime(fiveHoursAgo)).toBe('5 小時前')
		})

		it('24~48 小時前應顯示「昨天」', () => {
			// 準備：25 小時前
			const oneDayAgo = NOW - 25 * 60 * 60 * 1000

			// 操作 & 驗證
			expect(formatRelativeTime(oneDayAgo)).toBe('昨天')
		})

		it('超過 2 天應顯示日期格式 M/D', () => {
			// 準備：3 天前（6/15 - 3 天 = 6/12）
			const threeDaysAgo = NOW - 3 * 24 * 60 * 60 * 1000

			// 操作 & 驗證
			expect(formatRelativeTime(threeDaysAgo)).toBe('6/12')
		})
	})

	describe('formatDateTime', () => {
		it('應格式化為「M月D日 HH:mm」', () => {
			// 準備
			const timestamp = new Date('2024-03-05T09:30:00').getTime()

			// 操作 & 驗證
			expect(formatDateTime(timestamp)).toBe('3月5日 09:30')
		})
	})
})
