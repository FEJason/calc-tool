/**
 * 将文本按指定每页最大字符数进行分页，优先在句子结束符处断行
 * @param {string} text - 需要分页的文本内容
 * @param {number} maxCharsPerPage - 每页最大字符数，默认为238
 * @returns {string[]} 分页后的文本数组，每个元素为一页的内容
 */
export const paginateText = (text, maxCharsPerPage = 238) => {
  const pages = []
  let i = 0
  const len = text.length

  // 合法的断句符号（包括中英文句号、问号、感叹号、分号、省略号、逗号等）
  const sentenceBreaks = /[。！？；…\.!?;:,，]/

  while (i < len) {
    // 计算本页理论结束位置（不能超过文本总长）
    let end = Math.min(i + maxCharsPerPage, len)

    // 如果剩余内容 ≤ maxCharsPerPage，直接作为最后一页
    if (end === len) {
      pages.push(text.slice(i))
      break
    }

    // 在 [i, end) 范围内，从后往前找第一个断句符号
    let splitPos = end - 1
    let found = false

    // 向前扫描，最多扫完整个片段
    while (splitPos >= i) {
      if (sentenceBreaks.test(text[splitPos])) {
        // 找到断点，包含该符号（+1）
        splitPos += 1
        found = true
        break
      }
      splitPos--
    }

    // 如果没找到任何断句符号，则强制在 maxCharsPerPage 处截断
    if (!found) {
      splitPos = end
    }

    pages.push(text.slice(i, splitPos))
    i = splitPos
  }

  return pages
}
