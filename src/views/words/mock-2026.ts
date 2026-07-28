export interface WordItem {
  word: string
  /** 自定义例句 */
  example?: string
}

export interface DailyWords {
  date: string
  words: WordItem[]
}

export const mockData: DailyWords[] = [
  {
    date: '2026-07-28',
    words: [
      { word: 'Thought', example: 'Thougth: 1.6s' },
      { word: 'done', example: 'All done.' },
      { word: 'Today', example: '' },
      { word: 'Yesterday', example: '' },
      { word: 'week', example: 'A week ago' },
      { word: 'ago', example: 'A week ago' }
    ]
  }
]
