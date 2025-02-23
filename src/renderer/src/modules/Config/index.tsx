import { useEffect, useState } from 'react'
import Header from './components/Header'
import Button from '../../shared/components/Button'

export interface configDataProps {
  channel: string
}

export const Config = () => {
  const [config, setConfig] = useState<configDataProps>({ channel: '' })
  const [saved, setSaved] = useState(false)

  let timeoutID = setTimeout(() => setSaved(false), 2000)

  useEffect(() => {
    const fetchConfig = async () => {
      const data = await window.electron.ipcRenderer.invoke('get-config')
      console.log(data)
      if (!data || !data.channel) {
        console.log('Config inválida no build:', data)
        setConfig({ channel: '' }) // Define um valor padrão
      } else {
        setConfig(data)
      }
    }

    fetchConfig()
  }, [])

  function handleUpdateConfig(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    clearTimeout(timeoutID)
    window.electron.ipcRenderer.send('save-config', config)
    setSaved(true)
    timeoutID
  }

  return (
    <div className="size-full w-screen h-screen bg-slate-800">
      <Header />
      <form action="" className="flex flex-col gap-4 px-4 py-2" onSubmit={handleUpdateConfig}>
        <div className="flex flex-col gap-1">
          <label className="text-white font-semibold" htmlFor="channel">
            Nome do canal
          </label>
          <input
            className="px-2 h-[28px] rounded-sm w-[250px] focus:outline-blue-950"
            id="channel"
            type="text"
            value={config?.channel ?? ''}
            placeholder="Nome do canal"
            onChange={({ target }) => setConfig({ channel: target.value })}
          />
        </div>
        <div className="w-full flex gap-2 justify-end">
          {saved && <p className="text-green-400 mt-2 w-full text-end">Salvo!</p>}
          <Button
            className="bg-slate-600"
            type="button"
            onClick={() => window.electron.ipcRenderer.send('close-config')}
          >
            Ok
          </Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </div>
  )
}
