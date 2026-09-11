export function isChatMessageExpired(
  timestamp: number,
  alwaysVisible: boolean,
  hideAfterSeconds: number,
  now: number
): boolean {
  if (alwaysVisible) return false
  const lifetimeMs = Math.max(1, hideAfterSeconds) * 1000
  return now - timestamp >= lifetimeMs
}
