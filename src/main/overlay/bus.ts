import { EventEmitter } from 'events'

export type OverlayEventName = 'tiktok-chat' | 'tiktok-status' | 'config-updated'

type OverlayEventListener = (payload: unknown) => void

const overlayBus = new EventEmitter()
overlayBus.setMaxListeners(50)

export function broadcastOverlayEvent(event: OverlayEventName, payload: unknown): void {
  overlayBus.emit(event, payload)
}

export function onOverlayEvent(
  event: OverlayEventName,
  listener: OverlayEventListener
): () => void {
  overlayBus.on(event, listener)

  return () => {
    overlayBus.off(event, listener)
  }
}
