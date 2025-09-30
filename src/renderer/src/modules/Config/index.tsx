import Header from './components/Header'
import Button from '../../shared/components/Button'
import { ErrorNotification, SuccessNotification } from '../../shared/components/ErrorNotification'
import useModel from './hooks/useModel'

export const Config = () => {
  const {
    config,
    isLoading,
    error,
    successMessage,
    updateConfig,
    handleUpdateConfig,
    setError,
    setSuccessMessage
  } = useModel()

  console.log('Config na página de configuração:', config)

  return (
    <div className="flex flex-col w-screen h-screen rounded-[8px] overflow-hidden bg-gray-900 backdrop-blur-sm border border-gray-600 ">
      <Header />

      {/* Notificações */}
      <ErrorNotification error={error} onClose={() => setError(null)} />
      <SuccessNotification message={successMessage} onClose={() => setSuccessMessage(null)} />

      <form
        action=""
        className="flex flex-col overflow-y-auto gap-6 px-6 py-6 scroll"
        onSubmit={handleUpdateConfig}
      >
        {/* Twitch Channel */}
        <div className="space-y-2">
          <label className="text-white font-medium text-sm" htmlFor="channel">
            Nome do canal da Twitch
          </label>
          <input
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            id="channel"
            type="text"
            value={config?.twitch.channel ?? ''}
            placeholder="Digite o nome do canal ex: devrogerinho"
            onChange={({ target }) => updateConfig('twitch', { channel: target.value })}
          />
        </div>

        {/* Kick Channel */}
        <div className="space-y-2">
          <label className="text-white font-medium text-sm" htmlFor="kick-channel">
            Nome do canal da Kick
          </label>
          <input
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            id="kick-channel"
            type="text"
            value={config?.kick.slug ?? ''}
            placeholder="Digite o nome do canal ex: devrogerinho"
            onChange={({ target }) => updateConfig('kick', { slug: target.value })}
          />
        </div>

        {/* YouTube Channel */}
        <div className="space-y-2">
          <label className="text-white font-medium text-sm" htmlFor="youtube-channel">
            Nome do canal do YouTube
          </label>
          <input
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            id="youtube-channel"
            type="text"
            value={config?.youtube?.channelName ?? ''}
            placeholder="Ex: @OCódigodoRogerinho"
            onChange={({ target }) =>
              updateConfig('youtube', {
                channelName: target.value
              })
            }
          />
        </div>

        {/* Font Settings */}
        <div className="space-y-4">
          <h3 className="text-white font-medium text-lg">Configurações de Fonte</h3>

          {/* Font Size */}
          <div className="flex flex-col space-y-2">
            <label className="text-white font-medium text-sm" htmlFor="font-size">
              Tamanho da fonte: {config?.font?.size ?? 14}px
            </label>
            <input
              className=" h-2 bg-red-700 rounded-lg appearance-none cursor-pointer slider"
              id="font-size"
              type="range"
              min="10"
              max="24"
              value={config?.font?.size ?? 14}
              onChange={({ target }) =>
                updateConfig('font', {
                  ...config?.font,
                  size: parseInt(target.value)
                })
              }
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>10px</span>
              <span>24px</span>
            </div>
          </div>

          {/* Font Weight */}
          <div className="space-y-2">
            <label className="text-white font-medium text-sm" htmlFor="font-weight">
              Espessura da fonte:{' '}
              {config?.font?.weight === 300
                ? 'Leve'
                : config?.font?.weight === 400
                  ? 'Normal'
                  : config?.font?.weight === 500
                    ? 'Médio'
                    : config?.font?.weight === 600
                      ? 'Semi-negrito'
                      : config?.font?.weight === 700
                        ? 'Negrito'
                        : 'Normal'}
            </label>
            <select
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              id="font-weight"
              value={config?.font?.weight ?? 400}
              onChange={({ target }) =>
                updateConfig('font', {
                  ...config?.font,
                  weight: parseInt(target.value)
                })
              }
            >
              <option value={300}>Leve (300)</option>
              <option value={400}>Normal (400)</option>
              <option value={500}>Médio (500)</option>
              <option value={600}>Semi-negrito (600)</option>
              <option value={700}>Negrito (700)</option>
            </select>
          </div>
        </div>

        {/* <hr className="border-gray-700" /> */}

        {/* Actions */}

        <div className="flex gap-2 items-center justify-end">
          <Button
            className="w-fit"
            variant="secondary"
            type="button"
            onClick={() => window.electron.ipcRenderer.send('close-config')}
          >
            Cancelar
          </Button>
          <Button className="w-fit" type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  )
}
