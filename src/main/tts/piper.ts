import { createWriteStream, existsSync, promises as fs } from 'fs'
import { IncomingMessage } from 'http'
import { get as httpsGet } from 'https'
import os from 'os'
import path from 'path'
import { app } from 'electron'
import * as ort from 'onnxruntime-node'

type LocalVoiceId = 'pt-BR-faber' | 'pt-BR-cadu' | 'pt-BR-jeff'

const HF_PIPER = 'https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR'

const VOICE_MODELS: Record<LocalVoiceId, { model: string; config: string; modelUrl: string; configUrl: string }> =
  {
    'pt-BR-faber': {
      model: 'pt_BR-faber-medium-uint8.onnx',
      config: 'pt_BR-faber-medium-uint8.onnx.json',
      modelUrl: 'https://cdn.jsdelivr.net/gh/Pedro21062014/vozz@main/pt_BR-faber-medium-uint8.onnx',
      configUrl: 'https://cdn.jsdelivr.net/gh/Pedro21062014/vozz@main/pt_BR-faber-medium-uint8.onnx.json'
    },
    'pt-BR-cadu': {
      model: 'pt_BR-cadu-medium.onnx',
      config: 'pt_BR-cadu-medium.onnx.json',
      modelUrl: `${HF_PIPER}/cadu/medium/pt_BR-cadu-medium.onnx`,
      configUrl: `${HF_PIPER}/cadu/medium/pt_BR-cadu-medium.onnx.json`
    },
    'pt-BR-jeff': {
      model: 'pt_BR-jeff-medium.onnx',
      config: 'pt_BR-jeff-medium.onnx.json',
      modelUrl: `${HF_PIPER}/jeff/medium/pt_BR-jeff-medium.onnx`,
      configUrl: `${HF_PIPER}/jeff/medium/pt_BR-jeff-medium.onnx.json`
    }
  }

function parseLocalVoice(value: unknown): LocalVoiceId {
  if (value === 'pt-BR-cadu' || value === 'pt-BR-jeff' || value === 'pt-BR-faber') return value
  return 'pt-BR-faber'
}

type PiperConfig = {
  audio?: { sample_rate?: number }
  phoneme_id_map?: Record<string, number[]>
  inference?: {
    noise_scale?: number
    length_scale?: number
    noise_w?: number
  }
}

type LoadedEngine = {
  session: ort.InferenceSession
  config: PiperConfig
  sampleRate: number
  phonemeMap: Record<string, number[]>
  noise: number
  duration: number
  noiseW: number
}

const engines = new Map<LocalVoiceId, Promise<LoadedEngine>>()
let synthesizeQueue: Promise<Buffer> = Promise.resolve(Buffer.alloc(0))

function ttsDir(): string {
  try {
    if (app?.isReady?.()) return path.join(app.getPath('userData'), 'tts')
  } catch {
    // fora do electron, usa pasta temporaria
  }
  return path.join(os.tmpdir(), 'boochat-tts')
}

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = (target: string, redirects = 0) => {
      if (redirects > 5) {
        reject(new Error('Muitos redirects ao baixar o modelo TTS'))
        return
      }

      httpsGet(
        target,
        {
          headers: {
            'User-Agent': 'BooChat-TTS',
            Accept: '*/*'
          }
        },
        (response: IncomingMessage) => {
        const status = response.statusCode ?? 0
        const location = response.headers.location
        if (status >= 300 && status < 400 && location) {
          request(new URL(location, target).toString(), redirects + 1)
          return
        }
        if (status !== 200) {
          reject(new Error(`Falha ao baixar modelo TTS (${status})`))
          return
        }

        const file = createWriteStream(dest)
        response.pipe(file)
        file.on('finish', () => file.close((error) => (error ? reject(error) : resolve())))
        file.on('error', reject)
      }).on('error', reject)
    }

    request(url)
  })
}

async function ensureFile(url: string, filename: string): Promise<string> {
  const dir = ttsDir()
  await fs.mkdir(dir, { recursive: true })
  const dest = path.join(dir, filename)
  if (existsSync(dest)) return dest

  const temp = `${dest}.part`
  await downloadFile(url, temp)
  await fs.rename(temp, dest)
  return dest
}

async function loadEngine(voice: LocalVoiceId): Promise<LoadedEngine> {
  const files = VOICE_MODELS[voice]
  const [modelPath, configPath] = await Promise.all([
    ensureFile(files.modelUrl, files.model),
    ensureFile(files.configUrl, files.config)
  ])

  const config = JSON.parse(await fs.readFile(configPath, 'utf8')) as PiperConfig
  const session = await ort.InferenceSession.create(modelPath, {
    executionProviders: ['cpu'],
    graphOptimizationLevel: 'all'
  })

  return {
    session,
    config,
    sampleRate: config.audio?.sample_rate ?? 22050,
    phonemeMap: config.phoneme_id_map ?? {},
    noise: config.inference?.noise_scale ?? 0.667,
    duration: config.inference?.length_scale ?? 1,
    noiseW: config.inference?.noise_w ?? 0.8
  }
}

function getEngine(voice: LocalVoiceId): Promise<LoadedEngine> {
  const cached = engines.get(voice)
  if (cached) return cached

  const loading = loadEngine(voice).catch((error) => {
    engines.delete(voice)
    throw error
  })
  engines.set(voice, loading)
  return loading
}

function idsFromIpa(ipa: string, map: Record<string, number[]>): number[] {
  const pad = map['_']?.[0] ?? 0
  const ids: number[] = []
  if (map['^']) ids.push(map['^'][0], pad)

  for (const char of ipa.normalize('NFD')) {
    const entry = map[char]
    if (entry) ids.push(entry[0], pad)
  }

  if (map['$']) ids.push(map['$'][0])
  return ids
}

function encodeWav(samples: Float32Array, sampleRate: number): Buffer {
  const dataSize = samples.length * 2
  const buffer = Buffer.alloc(44 + dataSize)
  buffer.write('RIFF', 0)
  buffer.writeUInt32LE(36 + dataSize, 4)
  buffer.write('WAVE', 8)
  buffer.write('fmt ', 12)
  buffer.writeUInt32LE(16, 16)
  buffer.writeUInt16LE(1, 20)
  buffer.writeUInt16LE(1, 22)
  buffer.writeUInt32LE(sampleRate, 24)
  buffer.writeUInt32LE(sampleRate * 2, 28)
  buffer.writeUInt16LE(2, 32)
  buffer.writeUInt16LE(16, 34)
  buffer.write('data', 36)
  buffer.writeUInt32LE(dataSize, 40)

  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]))
    buffer.writeInt16LE(Math.round(sample * 32767), 44 + i * 2)
  }

  return buffer
}

async function synthesizeOnce(text: string, rate: number, voice: LocalVoiceId): Promise<Buffer> {
  const engine = await getEngine(voice)
  const { fonemizar } = await import('@pedrobef/vozz/g2p')
  const ipa = fonemizar(text)
  const ids = idsFromIpa(ipa, engine.phonemeMap)
  if (ids.length <= 2) {
    throw new Error('Texto sem fonemas para ler')
  }

  const velocidade = Math.min(2, Math.max(0.5, rate))
  const durationScale = engine.duration / velocidade
  const feeds: Record<string, ort.Tensor> = {
    input: new ort.Tensor('int64', BigInt64Array.from(ids, (id) => BigInt(id)), [1, ids.length]),
    input_lengths: new ort.Tensor('int64', BigInt64Array.from([BigInt(ids.length)]), [1]),
    scales: new ort.Tensor(
      'float32',
      Float32Array.from([engine.noise, durationScale, engine.noiseW]),
      [3]
    )
  }

  if (engine.session.inputNames.includes('sid')) {
    feeds.sid = new ort.Tensor('int64', BigInt64Array.from([0n]), [1])
  }

  const output = await engine.session.run(feeds)
  const raw = output[engine.session.outputNames[0]]?.data
  if (!raw) throw new Error('Modelo TTS nao gerou audio')

  const samples = raw instanceof Float32Array ? raw : Float32Array.from(raw as ArrayLike<number>)
  return encodeWav(samples, engine.sampleRate)
}

export function synthesizeLocalSpeech(options: {
  text: string
  author?: string
  voice?: string
  rate: number
}): Promise<Buffer> {
  const message = options.text.trim()
  if (!message) return Promise.reject(new Error('Texto vazio'))

  const voice = parseLocalVoice(options.voice)
  const author = options.author?.trim()
  const spoken = author ? `${author}. ${message}` : message

  const job = synthesizeQueue.then(
    () => synthesizeOnce(spoken, options.rate, voice),
    () => synthesizeOnce(spoken, options.rate, voice)
  )
  synthesizeQueue = job.then(
    () => Buffer.alloc(0),
    () => Buffer.alloc(0)
  )
  return job
}
