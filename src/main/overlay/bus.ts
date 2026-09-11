import { EventEmitter } from 'events'

const overlayBus = new EventEmitter()
overlayBus.setMaxListeners(50)

export type OverlayEventName = 'tiktok-chat' | 'tiktok-status' | 'config-updated'

export function broadcastOverlayEvent(event: OverlayEventName, payload: unknown): void {
  overlayBus.emit(event, payload)
}

export function onOverlayEvent(
  event: OverlayEventName,
  listener: (payload: unknown) => void
): () => void {
  overlayBus.on(event, listener)
  return () => {
    overlayBus.off(event, listener)
  }
}
