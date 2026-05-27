export const MAX_CHAT_MESSAGES = 50

export function limitMessages<T>(messages: T[], max = MAX_CHAT_MESSAGES): T[] {
  if (messages.length <= max) return messages
  return messages.slice(-max) // mantém as mais recentes
}
