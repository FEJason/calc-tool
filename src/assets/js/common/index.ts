/**
 * 将给定的数字截断到指定的小数位。
 * @param num - 要处理的原始数字。
 * @param decimals - （可选）要保留的小数位数，默认为2。
 * @returns 返回处理后的数字，保留指定小数位。
 */
export const limitDecimalPlaces = (num: number, decimalPlaces: number = 2): number => {
  const factor = Math.pow(10, decimalPlaces)
  return Math.floor(num * factor) / factor
}

/**
 * 限制输入框的小数位数
 * @param value - 输入字符串
 * @param decimals - 保留的小数位数（默认为 2）
 * @param allowNegative - 是否允许输入负数
 * @returns 限制后的数字字符串
 */
export const limitDecimalInput = (
  value: string,
  decimals: number = 2,
  allowNegative: boolean = false
): string => {
  const negativePattern = allowNegative ? '-?' : ''
  const regex = new RegExp(`^${negativePattern}\\d*\\.?\\d{0,${decimals}}`)
  const match = value.match(regex)

  return match ? match[0] : ''
}
