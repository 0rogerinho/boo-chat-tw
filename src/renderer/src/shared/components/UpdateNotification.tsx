import React, { useEffect, useRef, useState } from 'react'
import {
  AlertCircle,
  ArrowUpCircle,
  CheckCircle2,
  Download,
  FileText,
  Sparkles,
  Wand2,
  Wrench,
  X
} from 'lucide-react'
import { getUpdateI18n } from '../i18n'
import { cn } from '../lib'
import { useConfigStore } from '../store/useConfigStore'
import {
  hasReleaseNotes,
  parseReleaseNotes,
  type ParsedReleaseNotes,
  type ReleaseNotesInput,
  type ReleaseNotesSectionKey
} from '../utils/releaseNotes'

interface UpdateInfo {
  version: string
  releaseNotes?: ReleaseNotesInput
  releaseDate?: string
}

interface UpdateNotificationProps {
  onClose: () => void
}

type UpdateStatus = 'available' | 'downloading' | 'ready' | 'error'

function formatText(template: string, params: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_match, key) => params[key] ?? '')
}

const NOTE_SECTIONS: Array<{
  key: ReleaseNotesSectionKey
  icon: typeof Sparkles
  label: (i18n: ReturnType<typeof getUpdateI18n>) => string
}> = [
  { key: 'new', icon: Sparkles, label: (i18n) => i18n.notesNew },
  { key: 'improvements', icon: Wand2, label: (i18n) => i18n.notesImprovements },
  { key: 'fixes', icon: Wrench, label: (i18n) => i18n.notesFixes },
  { key: 'other', icon: FileText, label: (i18n) => i18n.notesOther }
]

function ReleaseNotesList({
  notes,
  i18n
}: {
  notes: ParsedReleaseNotes
  i18n: ReturnType<typeof getUpdateI18n>
}) {
  if (!hasReleaseNotes(notes)) return null

  return (
    <div className="mt-2 max-h-36 space-y-2 overflow-y-auto pr-0.5">
      {NOTE_SECTIONS.map(({ key, icon: Icon, label }) => {
        const items = notes[key]
        if (items.length === 0) return null

        return (
          <div key={key}>
            <p className="flex items-center gap-1 text-[11px] font-medium text-gray-300">
              <Icon size={11} className="shrink-0 text-primary-300" />
              {label(i18n)}
            </p>
            <ul className="mt-1 space-y-0.5">
              {items.map((item, index) => (
                <li key={`${key}-${index}`} className="flex gap-1.5 text-[11px] leading-relaxed text-gray-400">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-gray-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({ onClose }) => {
  const { config } = useConfigStore()
  const i18n = getUpdateI18n(config?.language)
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [currentVersion, setCurrentVersion] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isUpdateDownloaded, setIsUpdateDownloaded] = useState(false)
  const canShowErrorRef = useRef(false)

  useEffect(() => {
    void window.api
      ?.getAppVersion()
      .then((value) => {
        if (value && value !== 'overlay') {
          setCurrentVersion(value)
        }
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    const handleUpdateAvailable = (info: UpdateInfo) => {
      canShowErrorRef.current = true
      setUpdateInfo(info)
      setError(null)
    }

    const handleError = (errorMessage: string) => {
      if (!canShowErrorRef.current) {
        return
      }

      setError(errorMessage)
      setIsDownloading(false)
    }

    const handleDownloadProgress = (progress: { percent?: number }) => {
      setIsDownloading(true)
      setDownloadProgress(progress.percent ?? 0)
    }

    const handleUpdateDownloaded = () => {
      setIsDownloading(false)
      setIsUpdateDownloaded(true)
      setError(null)
    }

    window.api.onUpdaterUpdateAvailable(handleUpdateAvailable)
    window.api.onUpdaterError(handleError)
    window.api.onUpdaterDownloadProgress(handleDownloadProgress)
    window.api.onUpdaterUpdateDownloaded(handleUpdateDownloaded)

    return () => {
      window.api.removeAllUpdaterListeners()
    }
  }, [])

  const handleDownloadUpdate = async () => {
    try {
      canShowErrorRef.current = true
      setIsDownloading(true)
      setError(null)
      const result = await window.api.downloadUpdate()
      if (!result.success) {
        setError(result.error || i18n.downloadError)
        setIsDownloading(false)
      }
    } catch {
      setError(i18n.downloadError)
      setIsDownloading(false)
    }
  }

  const handleInstallUpdate = async () => {
    try {
      await window.api.installUpdate()
    } catch {
      setError(i18n.installError)
    }
  }

  if (!updateInfo) return null

  const status: UpdateStatus = error
    ? 'error'
    : isUpdateDownloaded
      ? 'ready'
      : isDownloading
        ? 'downloading'
        : 'available'

  const version = updateInfo.version
  const parsedNotes = parseReleaseNotes(updateInfo.releaseNotes)
  const showNotes = status === 'available' || status === 'ready'
  const title = {
    available: i18n.availableTitle,
    downloading: i18n.downloadingTitle,
    ready: i18n.readyTitle,
    error: i18n.errorTitle
  }[status]
  const description = {
    available: formatText(i18n.availableDescription, { version }),
    downloading: i18n.downloadingDescription,
    ready: formatText(i18n.readyDescription, { version }),
    error: error || i18n.downloadError
  }[status]
  const Icon = {
    available: ArrowUpCircle,
    downloading: Download,
    ready: CheckCircle2,
    error: AlertCircle
  }[status]
  const accentClass = {
    available: 'from-primary-500 via-primary-400 to-primary-600',
    downloading: 'from-primary-500 via-primary-400 to-primary-600',
    ready: 'from-emerald-500 via-emerald-400 to-primary-500',
    error: 'from-red-500 via-red-400 to-red-600'
  }[status]
  const iconClass = {
    available: 'bg-primary-600/15 text-primary-300',
    downloading: 'bg-primary-600/15 text-primary-300',
    ready: 'bg-emerald-500/15 text-emerald-300',
    error: 'bg-red-500/15 text-red-300'
  }[status]

  return (
    <div className="pointer-events-none fixed inset-x-2.5 bottom-2.5 z-50 no-move animate-slide-up">
      <section
        role="status"
        aria-live="polite"
        className="pointer-events-auto overflow-hidden rounded-[8px] border border-gray-600 bg-gray-900/95 shadow-xl shadow-black/40 backdrop-blur-sm"
      >
        <div className={cn('h-0.5 bg-gradient-to-r', accentClass)} />

        <div className="flex items-start gap-2.5 px-3 py-2.5">
          <span
            className={cn(
              'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md',
              iconClass
            )}
          >
            <Icon size={16} className={status === 'downloading' ? 'animate-pulse' : undefined} />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-white">{title}</h3>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-400">{description}</p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex size-6 shrink-0 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
                aria-label={i18n.later}
              >
                <X size={14} />
              </button>
            </div>

            {(currentVersion || version) && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {currentVersion ? (
                  <span className="rounded-md bg-gray-800 px-1.5 py-0.5 text-[11px] text-gray-400">
                    {currentVersion}
                  </span>
                ) : null}
                {currentVersion && version ? (
                  <span className="text-[11px] text-gray-500">→</span>
                ) : null}
                <span className="rounded-md bg-primary-600/20 px-1.5 py-0.5 text-[11px] text-primary-200">
                  {version}
                </span>
              </div>
            )}

            {showNotes ? <ReleaseNotesList notes={parsedNotes} i18n={i18n} /> : null}

            {status === 'downloading' ? (
              <div className="mt-2.5">
                <div className="mb-1 flex items-center justify-between text-[11px] text-gray-400">
                  <span>{i18n.downloadingTitle}</span>
                  <span className="tabular-nums text-primary-300">
                    {Math.round(downloadProgress)}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
                  <div
                    className="h-full rounded-full bg-primary-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, downloadProgress))}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {status === 'ready' ? (
                  <button
                    type="button"
                    onClick={handleInstallUpdate}
                    className="inline-flex h-8 items-center justify-center rounded-md bg-primary-600 px-3 text-sm font-medium text-white transition-colors hover:bg-primary-500"
                  >
                    {i18n.installNow}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDownloadUpdate}
                    className="inline-flex h-8 items-center justify-center rounded-md bg-primary-600 px-3 text-sm font-medium text-white transition-colors hover:bg-primary-500"
                  >
                    {status === 'error' ? i18n.retry : i18n.downloadNow}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-8 items-center justify-center rounded-md border border-gray-700 bg-gray-800/80 px-3 text-sm font-medium text-gray-300 transition-colors hover:border-gray-500 hover:bg-gray-800 hover:text-white"
                >
                  {i18n.later}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
