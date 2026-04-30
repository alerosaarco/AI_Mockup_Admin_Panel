import { createContext, useContext, useState } from 'react'

export const ASSISTANTS_LIST = [
  { id: 1, name: 'Grammar & Style', status: 'healthy' },
  { id: 2, name: 'Factual Accuracy', status: 'healthy' },
  { id: 3, name: 'Punctuation', status: 'healthy' },
  { id: 4, name: 'Bilingual Review', status: 'healthy' },
  { id: 5, name: 'Socioemotional Tone', status: 'degraded' },
  { id: 6, name: 'STEAM Content', status: 'healthy' },
  { id: 7, name: 'Curriculum Alignment', status: 'healthy' },
  { id: 8, name: 'Readability Score', status: 'healthy' },
  { id: 9, name: 'Citation Checker', status: 'healthy' },
  { id: 10, name: 'Vocabulary Level', status: 'healthy' },
]

const AssistantContext = createContext(null)

export function AssistantProvider({ children }) {
  const [assistants] = useState(ASSISTANTS_LIST)
  const [selected, setSelected] = useState(ASSISTANTS_LIST[0])

  return (
    <AssistantContext.Provider value={{ assistants, selected, setSelected }}>
      {children}
    </AssistantContext.Provider>
  )
}

export function useAssistant() {
  const ctx = useContext(AssistantContext)
  if (!ctx) throw new Error('useAssistant must be used within AssistantProvider')
  return ctx
}
