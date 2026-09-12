export const APP_LANGUAGE_OPTIONS = [
  { code: 'pt-BR', label: 'Portugues (Brasil)' },
  { code: 'en-US', label: 'English (US)' },
  { code: 'es-ES', label: 'Espanol' },
  { code: 'fr-FR', label: 'Francais' },
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'it-IT', label: 'Italiano' }
] as const

export type AppLanguageCode = (typeof APP_LANGUAGE_OPTIONS)[number]['code']

const LANGUAGE_SET = new Set<string>(APP_LANGUAGE_OPTIONS.map((entry) => entry.code))

export function normalizeLanguage(value: unknown): AppLanguageCode {
  if (typeof value === 'string' && LANGUAGE_SET.has(value)) {
    return value as AppLanguageCode
  }
  return 'pt-BR'
}

type ConfigI18nText = {
  helpAriaLabel: string
  languageLabel: string
  languageHelp: string
  twitchChannelLabel: string
  twitchChannelHelp: string
  kickChannelLabel: string
  kickChannelHelp: string
  youtubeChannelLabel: string
  youtubeChannelHelp: string
  tiktokChannelLabel: string
  tiktokChannelHelp: string
  channelPlaceholder: string
  youtubePlaceholder: string
  tiktokPlaceholder: string
  fontTitle: string
  fontSizeLabel: string
  fontSizeHelp: string
  fontWeightLabel: string
  fontWeightHelp: string
  bgTitle: string
  bgDescription: string
  bgColorLabel: string
  bgPlaceholder: string
  bgOpacityLabel: string
  bgOpacityHelp: string
  platformColorDotTitle: string
  platformColorDotHelp: string
  platformColorDotLabel: string
  soundTitle: string
  soundDescription: string
  soundTypeLabel: string
  soundVolumeLabel: string
  soundVolumeHelp: string
  mutedLabel: string
  maxLabel: string
  testSound: string
  ttsTitle: string
  ttsDescription: string
  ttsOn: string
  ttsOff: string
  ttsVolumeLabel: string
  ttsVolumeHelp: string
  ttsRateLabel: string
  ttsRateHelp: string
  ttsReadAuthorLabel: string
  ttsReadAuthorHelp: string
  ttsTestLabel: string
  ttsTestAuthor: string
  ttsTestMessage: string
  ttsGenerating: string
  ttsPlayError: string
  ttsVoiceLabel: string
  ttsVoiceHelp: string
  ttsVoiceAuto: string
  ttsSlowLabel: string
  ttsFastLabel: string
  ttsRetryLabel: string
  ttsExampleLabel: string
  ttsOffHint: string
  ttsVoiceHintFaber: string
  ttsVoiceHintCadu: string
  ttsVoiceHintJeff: string
  ignoreBotsTitle: string
  ignoreBotsDescription: string
  ignoreBotsAriaLabel: string
  ignoreBotsPlaceholderEmpty: string
  ignoreBotsPlaceholderAdd: string
  removeBotAriaPrefix: string
  cancel: string
  save: string
  saving: string
  localServerTitle: string
  localServerDescription: string
  localServerHelp: string
  localServerCopyAria: string
  liveHowToLabel: string
  obsTitle: string
  obsDescription: string
  obsCopyLink: string
  obsCopied: string
  obsHelp: string
  obsHowToLabel: string
  obsCopyAria: string
  obsAppearanceTitle: string
  obsAppearanceDescription: string
  obsFontFamilyLabel: string
  obsFontFamilyHelp: string
  obsFontSizeHelp: string
  obsFontWeightHelp: string
  obsPageBgTitle: string
  obsPageBgColorLabel: string
  obsPageBgColorHelp: string
  obsPageBgOpacityLabel: string
  obsPageBgOpacityHelp: string
  obsMessageBgTitle: string
  obsMessageBgHelp: string
  obsMessageBgOpacityLabel: string
  obsMessageBgOpacityHelp: string
  obsMessageColorLabel: string
  obsAddColor: string
  obsRemoveColor: string
  obsRemoveColorAria: string
  obsPreviewTitle: string
  obsPreviewUser: string
  obsPreviewMessage: string
  sidebarGeneral: string
  sidebarGeneralIntro: string
  sidebarChannels: string
  sidebarChannelsIntro: string
  sidebarAppearance: string
  sidebarAppearanceIntro: string
  sidebarObs: string
  sidebarObsIntro: string
  sidebarLive: string
  sidebarLiveIntro: string
  liveAppearanceTitle: string
  liveAppearanceDescription: string
  liveFontFamilyHelp: string
  liveFontSizeHelp: string
  liveFontWeightHelp: string
  livePageBgTitle: string
  livePageBgColorLabel: string
  livePageBgColorHelp: string
  livePageBgOpacityLabel: string
  livePageBgOpacityHelp: string
  liveMessageBgTitle: string
  liveMessageBgHelp: string
  sidebarFilters: string
  sidebarFiltersIntro: string
  messageVisibilityTitle: string
  messageVisibilitySystemTitle: string
  messageVisibilitySystemHelp: string
  messageVisibilityViewersTitle: string
  messageVisibilityViewersHelp: string
  messageVisibilityAlways: string
  messageVisibilityTimed: string
  messageVisibilityHideAfter: string
  messageVisibilitySeconds: string
  emotesTitle: string
  emotesHelp: string
  emotesSeventvLabel: string
  emotesBetterttvLabel: string
  emotesOn: string
  emotesOff: string
  linkImagesTitle: string
  linkImagesHelp: string
  linkImagesLabel: string
  fontWeights: Record<number, string>
}

const CONFIG_I18N: Record<AppLanguageCode, ConfigI18nText> = {
  'pt-BR': {
    helpAriaLabel: 'Ajuda',
    tiktokChannelLabel: 'Nome do canal do TikTok',
    tiktokChannelHelp: 'Usuario do TikTok cujo chat ao vivo sera exibido. Pode ser com ou sem @.',
    languageLabel: 'Idioma do aplicativo',
    languageHelp: 'Define o idioma da interface do BooChat, incluindo menus e avisos.',
    twitchChannelLabel: 'Nome do canal da Twitch',
    twitchChannelHelp: 'Canal da Twitch cujo chat sera exibido. Digite so o nome, sem o link.',
    kickChannelLabel: 'Nome do canal da Kick',
    kickChannelHelp: 'Canal da Kick cujo chat sera exibido. Digite o slug do canal, sem o link.',
    youtubeChannelLabel: 'Nome do canal do YouTube',
    youtubeChannelHelp: 'Canal, @handle ou URL da live do YouTube para capturar o chat.',
    channelPlaceholder: 'Digite o nome do canal ex: devrogerinho',
    youtubePlaceholder: 'Ex: @OCodigodoRogerinho ou https://youtube.com/watch?v=...',
    tiktokPlaceholder: 'Ex: @devrogerinho ou devrogerinho',
    fontTitle: 'Configuracoes de Fonte',
    fontSizeLabel: 'Tamanho da fonte',
    fontSizeHelp: 'Tamanho do texto das mensagens no overlay e na janela do chat.',
    fontWeightLabel: 'Espessura da fonte',
    fontWeightHelp: 'Quanto mais alto o valor, mais forte e visivel fica o texto das mensagens.',
    bgTitle: 'Configuracoes de Fundo',
    bgDescription: 'Cor aplicada atras de cada mensagem para melhorar a leitura no overlay.',
    bgColorLabel: 'Cor de fundo',
    bgPlaceholder: 'Codigo hexadecimal ou deixe vazio',
    bgOpacityLabel: 'Opacidade do fundo',
    bgOpacityHelp: 'Quao visivel fica o fundo atras da mensagem. 0 e transparente, 100 e solido.',
    platformColorDotTitle: 'Icone da plataforma',
    platformColorDotHelp:
      'Troca o logo da Twitch, Kick, YouTube e TikTok por um circulo na cor de cada plataforma.',
    platformColorDotLabel: 'Usar circulo colorido',
    soundTitle: 'Som ao receber mensagem',
    soundDescription:
      'Toca um alerta quando chegar mensagem nova do chat (Twitch, Kick, YouTube ou TikTok).',
    soundTypeLabel: 'Som de alerta',
    soundVolumeLabel: 'Volume / intensidade',
    soundVolumeHelp: 'Intensidade do alerta sonoro quando chega uma mensagem nova.',
    mutedLabel: 'Mudo',
    maxLabel: 'Maximo',
    testSound: 'Testar som',
    ttsTitle: 'Robo ler mensagens',
    ttsDescription:
      'Le as mensagens no seu computador, sem enviar o chat para a Microsoft. Na primeira vez baixa um modelo de ~19 MB; depois funciona offline. Nao le avisos de conexao e nao toca no overlay do OBS.',
    ttsOn: 'Ligado',
    ttsOff: 'Desligado',
    ttsVolumeLabel: 'Volume da voz',
    ttsVolumeHelp: 'Intensidade da voz que le as mensagens.',
    ttsRateLabel: 'Velocidade da leitura',
    ttsRateHelp: 'Quao rapido o robo fala. 1.0 e o ritmo normal.',
    ttsReadAuthorLabel: 'Dizer quem falou',
    ttsReadAuthorHelp: 'Se ligado, a voz comeca com o nick. Exemplo: ana falou. oi tudo bem?',
    ttsTestLabel: 'Testar voz',
    ttsTestAuthor: 'ana',
    ttsTestMessage: 'oi, tudo bem? so passando para testar a voz.',
    ttsGenerating: 'Preparando a voz...',
    ttsPlayError: 'Nao deu para tocar. Na primeira vez a voz precisa baixar; depois tenta de novo.',
    ttsVoiceLabel: 'Voz',
    ttsVoiceHelp:
      'Vozes locais em portugues. Cadu e Jeff baixam o modelo na primeira vez (~60 MB).',
    ttsVoiceAuto: 'Automatico',
    ttsSlowLabel: 'Lenta',
    ttsFastLabel: 'Rapida',
    ttsRetryLabel: 'Tentar de novo',
    ttsExampleLabel: 'Assim vai soar',
    ttsOffHint: 'Liga para o robo ler o chat em voz alta neste computador.',
    ttsVoiceHintFaber: 'Padrao · natural',
    ttsVoiceHintCadu: 'Mais grave',
    ttsVoiceHintJeff: 'Mais clara',
    ignoreBotsTitle: 'Ignorar bots',
    ignoreBotsDescription:
      'Mensagens desses nicks nao aparecem no chat. Digite um nome e pressione Enter, virgula ou espaco para criar uma tag. Exemplo: nightbot streamelements',
    ignoreBotsAriaLabel: 'Nomes de bots a ignorar',
    ignoreBotsPlaceholderEmpty: 'Digite um bot e pressione Enter...',
    ignoreBotsPlaceholderAdd: 'Adicionar outro...',
    removeBotAriaPrefix: 'Remover',
    cancel: 'Cancelar',
    save: 'Salvar',
    saving: 'Salvando...',
    localServerTitle: 'Aparecer na tela da live',
    localServerDescription:
      'Este link e so para o chat aparecer na CENA da live, para quem assiste. Nao use no painel/dock do OBS.',
    localServerHelp:
      '1. Copie o link.\n2. No OBS, na CENA da live: Adicionar > Fonte > Navegador.\n3. Cole a URL, defina largura e altura e marque fundo transparente.\n4. Desmarque "Desligar fonte quando nao estiver visivel".\n5. Arraste o chat para o lugar onde ele deve aparecer para quem assiste.\n6. O BooChat precisa ficar aberto.',
    localServerCopyAria: 'Copiar link para aparecer na live',
    liveHowToLabel: 'Como colocar na live',
    obsTitle: 'Usar no painel do OBS',
    obsDescription:
      'Este link e so para o painel do OBS (dock). So voce ve o chat. Quem assiste a live nao ve.',
    obsCopyLink: 'Copiar link',
    obsCopied: 'Link copiado!',
    obsHelp:
      '1. Copie o link.\n2. No OBS, abra Painéis.\n3. Clique em Painéis personalizáveis com URL...\n4. Adicione o nome do painel (ex: BooChat) e cole a URL.\n5. O chat abre num painel ao lado — só você vê, quem assiste não vê.',
    obsHowToLabel: 'Como colocar no painel',
    obsCopyAria: 'Copiar link do painel do OBS',
    obsAppearanceTitle: 'Aparencia do overlay',
    obsAppearanceDescription:
      'Estas opcoes valem so para o link do OBS. A janela do aplicativo continua com as cores da secao Aparencia.',
    obsFontFamilyLabel: 'Familia da fonte',
    obsFontFamilyHelp: 'Fonte usada nas mensagens do overlay no OBS.',
    obsFontSizeHelp: 'Tamanho do texto das mensagens no overlay do OBS.',
    obsFontWeightHelp: 'Quanto mais alto o valor, mais forte fica o texto no overlay.',
    obsPageBgTitle: 'Fundo da pagina',
    obsPageBgColorLabel: 'Cor de fundo da pagina',
    obsPageBgColorHelp:
      'Cor atras de todo o overlay. Use opacidade 0 para deixar o fundo transparente no OBS.',
    obsPageBgOpacityLabel: 'Opacidade da pagina',
    obsPageBgOpacityHelp: '0 deixa o fundo da pagina transparente no OBS. 100 deixa a cor solida.',
    obsMessageBgTitle: 'Fundo das mensagens',
    obsMessageBgHelp:
      'Cada mensagem usa a proxima cor da lista, e depois recomeça do inicio. Exemplo: cor 1, cor 2, cor 1, cor 2...',
    obsMessageBgOpacityLabel: 'Opacidade das mensagens',
    obsMessageBgOpacityHelp:
      'Opacidade so desta cor. 0 e transparente, 100 e solido. Cada cor da lista pode ter um valor diferente.',
    obsMessageColorLabel: 'Cor {n}',
    obsAddColor: 'Adicionar cor',
    obsRemoveColor: 'Remover',
    obsRemoveColorAria: 'Remover cor',
    obsPreviewTitle: 'Previa',
    obsPreviewUser: 'viewer',
    obsPreviewMessage: 'mensagem de exemplo',
    sidebarGeneral: 'Geral',
    sidebarGeneralIntro:
      'Idioma, emotes de terceiros, som de alerta, leitor de voz e quanto tempo as mensagens ficam visiveis.',
    sidebarChannels: 'Canais',
    sidebarChannelsIntro: 'Conecte os chats da Twitch, Kick, YouTube e TikTok.',
    sidebarAppearance: 'Aparencia',
    sidebarAppearanceIntro: 'Fonte e fundo das mensagens na janela do aplicativo.',
    sidebarObs: 'Painel OBS',
    sidebarObsIntro: 'Link e visual do chat no painel do OBS. So voce ve. Nao aparece na live.',
    sidebarLive: 'Na live',
    sidebarLiveIntro: 'Link e visual do chat na cena da live. Quem assiste ve. Nao use no painel.',
    liveAppearanceTitle: 'Aparencia da tela da live',
    liveAppearanceDescription:
      'Estas opcoes valem so para o link da live. O painel do OBS e a janela do app nao mudam.',
    liveFontFamilyHelp: 'Fonte usada nas mensagens na tela da live.',
    liveFontSizeHelp: 'Tamanho do texto das mensagens na tela da live.',
    liveFontWeightHelp: 'Quanto mais alto o valor, mais forte fica o texto na tela da live.',
    livePageBgTitle: 'Fundo da pagina',
    livePageBgColorLabel: 'Cor de fundo da pagina',
    livePageBgColorHelp:
      'Cor atras de todo o chat na live. Use opacidade 0 para deixar o fundo transparente.',
    livePageBgOpacityLabel: 'Opacidade da pagina',
    livePageBgOpacityHelp: '0 deixa o fundo transparente na live. 100 deixa a cor solida.',
    liveMessageBgTitle: 'Fundo das mensagens',
    liveMessageBgHelp:
      'Cada mensagem usa a proxima cor da lista, e depois recomeca do inicio. Exemplo: cor 1, cor 2, cor 1, cor 2...',
    sidebarFilters: 'Filtros',
    sidebarFiltersIntro: 'Esconda mensagens de bots e nicks que voce nao quer ver no chat.',
    messageVisibilityTitle: 'Visibilidade das mensagens',
    messageVisibilitySystemTitle: 'Mensagens de conexao',
    messageVisibilitySystemHelp:
      'Avisos de conectado, erro ou canal nao encontrado. Podem ficar sempre na tela ou sumir depois de alguns segundos.',
    messageVisibilityViewersTitle: 'Mensagens dos viewers',
    messageVisibilityViewersHelp:
      'Mensagens enviadas pelo chat. Podem ficar sempre visiveis ou desaparecer depois do tempo definido.',
    messageVisibilityAlways: 'Sempre visiveis',
    messageVisibilityTimed: 'Desaparecer',
    messageVisibilityHideAfter: 'Sumir depois de',
    messageVisibilitySeconds: 'segundos',
    emotesTitle: 'Emotes de terceiros',
    emotesHelp:
      'Mostra emotes extras da 7TV e BetterTTV no chat da Twitch. Os catalogos sao baixados uma vez e ficam em cache.',
    emotesSeventvLabel: '7TV',
    emotesBetterttvLabel: 'BetterTTV',
    emotesOn: 'Ligado',
    emotesOff: 'Desligado',
    linkImagesTitle: 'Imagens e GIFs',
    linkImagesHelp:
      'Quando alguem envia um link direto de imagem ou GIF (.png, .jpg, .gif, .webp), o arquivo aparece no chat. Tambem mostra prints da TWShot e links do Lightshot (prnt.sc), Imgur e Tenor.',
    linkImagesLabel: 'Mostrar imagens dos links',
    fontWeights: {
      300: 'Leve',
      400: 'Normal',
      500: 'Medio',
      600: 'Semi-negrito',
      700: 'Negrito'
    }
  },
  'en-US': {
    helpAriaLabel: 'Help',
    tiktokChannelLabel: 'TikTok channel name',
    tiktokChannelHelp: 'TikTok username whose live chat will be shown. With or without @.',
    languageLabel: 'App language',
    languageHelp: 'Sets the BooChat interface language, including menus and system notices.',
    twitchChannelLabel: 'Twitch channel name',
    twitchChannelHelp:
      'Twitch channel whose chat will be shown. Enter the name only, without the URL.',
    kickChannelLabel: 'Kick channel name',
    kickChannelHelp:
      'Kick channel whose chat will be shown. Enter the channel slug, without the URL.',
    youtubeChannelLabel: 'YouTube channel name',
    youtubeChannelHelp: 'Channel name, @handle, or live URL used to capture YouTube chat.',
    channelPlaceholder: 'Enter the channel name, e.g. devrogerinho',
    youtubePlaceholder: 'E.g. @YourChannel or https://youtube.com/watch?v=...',
    tiktokPlaceholder: 'E.g. @devrogerinho or devrogerinho',
    fontTitle: 'Font settings',
    fontSizeLabel: 'Font size',
    fontSizeHelp: 'Text size of chat messages in the overlay and chat window.',
    fontWeightLabel: 'Font weight',
    fontWeightHelp: 'Higher values make message text bolder and easier to read.',
    bgTitle: 'Background settings',
    bgDescription: 'Color drawn behind each message to improve contrast on the overlay.',
    bgColorLabel: 'Background color',
    bgPlaceholder: 'Hex color code or leave empty',
    bgOpacityLabel: 'Background opacity',
    bgOpacityHelp: 'How visible the message background is. 0 is transparent, 100 is solid.',
    platformColorDotTitle: 'Platform icon',
    platformColorDotHelp:
      'Replaces the Twitch, Kick, YouTube, and TikTok logos with a circle in each platform color.',
    platformColorDotLabel: 'Use a colored circle',
    soundTitle: 'Message notification sound',
    soundDescription:
      'Plays an alert when a new chat message arrives (Twitch, Kick, YouTube, or TikTok).',
    soundTypeLabel: 'Alert sound',
    soundVolumeLabel: 'Volume / intensity',
    soundVolumeHelp: 'How loud the alert is when a new message arrives.',
    mutedLabel: 'Muted',
    maxLabel: 'Maximum',
    testSound: 'Test sound',
    ttsTitle: 'Read messages aloud',
    ttsDescription:
      'Reads messages on your computer without sending chat to Microsoft. The first time it downloads a ~19 MB model; after that it works offline. Connection notices are skipped, and it does not play in the OBS overlay.',
    ttsOn: 'On',
    ttsOff: 'Off',
    ttsVolumeLabel: 'Voice volume',
    ttsVolumeHelp: 'How loud the voice is when reading messages.',
    ttsRateLabel: 'Reading speed',
    ttsRateHelp: 'How fast the voice speaks. 1.0 is the normal pace.',
    ttsReadAuthorLabel: 'Say who spoke',
    ttsReadAuthorHelp: 'If enabled, the voice starts with the nick. Example: ana said. hi there?',
    ttsTestLabel: 'Test voice',
    ttsTestAuthor: 'ana',
    ttsTestMessage: 'hey, just checking the voice with a test message.',
    ttsGenerating: 'Preparing the voice...',
    ttsPlayError:
      'Could not play the voice. The first run needs to download the model; then try again.',
    ttsVoiceLabel: 'Voice',
    ttsVoiceHelp:
      'Local Portuguese voices. Cadu and Jeff download their model on first use (~60 MB).',
    ttsVoiceAuto: 'Automatic',
    ttsSlowLabel: 'Slow',
    ttsFastLabel: 'Fast',
    ttsRetryLabel: 'Try again',
    ttsExampleLabel: 'This is how it will sound',
    ttsOffHint: 'Turn on to have chat read aloud on this computer.',
    ttsVoiceHintFaber: 'Default · natural',
    ttsVoiceHintCadu: 'Deeper',
    ttsVoiceHintJeff: 'Clearer',
    ignoreBotsTitle: 'Ignore bots',
    ignoreBotsDescription:
      'Messages from these nicks are hidden. Type a name and press Enter, comma, or space to create a tag. Example: nightbot streamelements',
    ignoreBotsAriaLabel: 'Bot names to ignore',
    ignoreBotsPlaceholderEmpty: 'Type a bot and press Enter...',
    ignoreBotsPlaceholderAdd: 'Add another...',
    removeBotAriaPrefix: 'Remove',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...',
    localServerTitle: 'Show on the live screen',
    localServerDescription:
      'This link is only for chat on the live SCENE, so viewers can see it. Do not use it in the OBS panel/dock.',
    localServerHelp:
      '1. Copy the link.\n2. In OBS, on the live SCENE: Add > Source > Browser.\n3. Paste the URL, set width and height, and enable a transparent background.\n4. Uncheck "Shutdown source when not visible".\n5. Drag the chat to where viewers should see it.\n6. BooChat must stay open.',
    localServerCopyAria: 'Copy link to show on the live screen',
    liveHowToLabel: 'How to put it on the live',
    obsTitle: 'Use in the OBS panel',
    obsDescription:
      'This link is only for the OBS panel (dock). Only you see the chat. Viewers do not see it.',
    obsCopyLink: 'Copy link',
    obsCopied: 'Link copied!',
    obsHelp:
      '1. Copy the link.\n2. In OBS, open Docks.\n3. Click Custom Browser Docks.\n4. Add the panel name (e.g. BooChat) and paste the URL.\n5. Chat opens in a side panel — only you see it, viewers do not.',
    obsHowToLabel: 'How to put it in the panel',
    obsCopyAria: 'Copy OBS panel link',
    obsAppearanceTitle: 'Overlay appearance',
    obsAppearanceDescription:
      'These options apply only to the OBS link. The app window still uses the Appearance section.',
    obsFontFamilyLabel: 'Font family',
    obsFontFamilyHelp: 'Font used for overlay messages in OBS.',
    obsFontSizeHelp: 'Text size of chat messages in the OBS overlay.',
    obsFontWeightHelp: 'Higher values make overlay text bolder and easier to read.',
    obsPageBgTitle: 'Page background',
    obsPageBgColorLabel: 'Page background color',
    obsPageBgColorHelp:
      'Color behind the entire overlay. Set opacity to 0 to keep a transparent background in OBS.',
    obsPageBgOpacityLabel: 'Page opacity',
    obsPageBgOpacityHelp: '0 keeps the overlay page transparent in OBS. 100 makes the color solid.',
    obsMessageBgTitle: 'Message backgrounds',
    obsMessageBgHelp:
      'Each new message uses the next color in the list, then starts over. Example: color 1, color 2, color 1, color 2...',
    obsMessageBgOpacityLabel: 'Message opacity',
    obsMessageBgOpacityHelp:
      'Opacity for this color only. 0 is transparent, 100 is solid. Each color in the list can have its own value.',
    obsMessageColorLabel: 'Color {n}',
    obsAddColor: 'Add color',
    obsRemoveColor: 'Remove',
    obsRemoveColorAria: 'Remove color',
    obsPreviewTitle: 'Preview',
    obsPreviewUser: 'viewer',
    obsPreviewMessage: 'sample message',
    sidebarGeneral: 'General',
    sidebarGeneralIntro:
      'Language, third-party emotes, alert sound, text-to-speech, and how long messages stay on screen.',
    sidebarChannels: 'Channels',
    sidebarChannelsIntro: 'Connect chats from Twitch, Kick, YouTube, and TikTok.',
    sidebarAppearance: 'Appearance',
    sidebarAppearanceIntro: 'Font and background of messages in the app window.',
    sidebarObs: 'OBS panel',
    sidebarObsIntro: 'Link and look of the chat in the OBS panel. Only you see it. It does not appear on stream.',
    sidebarLive: 'On stream',
    sidebarLiveIntro: 'Link and look of the chat on the live scene. Viewers see it. Do not use it in the panel.',
    liveAppearanceTitle: 'Live screen appearance',
    liveAppearanceDescription:
      'These options apply only to the live link. The OBS panel and app window stay unchanged.',
    liveFontFamilyHelp: 'Font used for messages on the live screen.',
    liveFontSizeHelp: 'Text size of chat messages on the live screen.',
    liveFontWeightHelp: 'Higher values make live-screen text bolder and easier to read.',
    livePageBgTitle: 'Page background',
    livePageBgColorLabel: 'Page background color',
    livePageBgColorHelp:
      'Color behind the entire live chat. Set opacity to 0 to keep a transparent background.',
    livePageBgOpacityLabel: 'Page opacity',
    livePageBgOpacityHelp: '0 keeps the live page transparent. 100 makes the color solid.',
    liveMessageBgTitle: 'Message backgrounds',
    liveMessageBgHelp:
      'Each message uses the next color in the list, then starts over. Example: color 1, color 2, color 1, color 2...',
    sidebarFilters: 'Filters',
    sidebarFiltersIntro: 'Hide messages from bots and nicks you do not want in chat.',
    messageVisibilityTitle: 'Message visibility',
    messageVisibilitySystemTitle: 'Connection messages',
    messageVisibilitySystemHelp:
      'Connected, error, or channel-not-found notices. Keep them on screen or hide them after a few seconds.',
    messageVisibilityViewersTitle: 'Viewer messages',
    messageVisibilityViewersHelp:
      'Chat messages from viewers. Keep them always visible or hide them after the time you set.',
    messageVisibilityAlways: 'Always visible',
    messageVisibilityTimed: 'Hide after',
    messageVisibilityHideAfter: 'Hide after',
    messageVisibilitySeconds: 'seconds',
    emotesTitle: 'Third-party emotes',
    emotesHelp:
      'Show extra 7TV and BetterTTV emotes in Twitch chat. Catalogs are downloaded once and cached.',
    emotesSeventvLabel: '7TV',
    emotesBetterttvLabel: 'BetterTTV',
    emotesOn: 'On',
    emotesOff: 'Off',
    linkImagesTitle: 'Images and GIFs',
    linkImagesHelp:
      'When someone posts a direct image or GIF link (.png, .jpg, .gif, .webp), it appears in chat. Also shows TWShot images and Lightshot (prnt.sc), Imgur and Tenor links.',
    linkImagesLabel: 'Show images from links',
    fontWeights: {
      300: 'Light',
      400: 'Regular',
      500: 'Medium',
      600: 'Semi-bold',
      700: 'Bold'
    }
  },
  'es-ES': {
    helpAriaLabel: 'Ayuda',
    tiktokChannelLabel: 'Nombre del canal de TikTok',
    tiktokChannelHelp: 'Usuario de TikTok cuyo chat en vivo se mostrara. Con o sin @.',
    languageLabel: 'Idioma de la aplicacion',
    languageHelp: 'Define el idioma de la interfaz de BooChat, incluidos menus y avisos.',
    twitchChannelLabel: 'Nombre del canal de Twitch',
    twitchChannelHelp:
      'Canal de Twitch cuyo chat se mostrara. Escribe solo el nombre, sin el enlace.',
    kickChannelLabel: 'Nombre del canal de Kick',
    kickChannelHelp:
      'Canal de Kick cuyo chat se mostrara. Escribe el slug del canal, sin el enlace.',
    youtubeChannelLabel: 'Nombre del canal de YouTube',
    youtubeChannelHelp: 'Canal, @handle o URL de la live de YouTube para capturar el chat.',
    channelPlaceholder: 'Escribe el nombre del canal, ej: devrogerinho',
    youtubePlaceholder: 'Ej: @TuCanal o https://youtube.com/watch?v=...',
    tiktokPlaceholder: 'Ej: @devrogerinho o devrogerinho',
    fontTitle: 'Configuracion de fuente',
    fontSizeLabel: 'Tamano de fuente',
    fontSizeHelp: 'Tamano del texto de los mensajes en el overlay y en la ventana del chat.',
    fontWeightLabel: 'Grosor de fuente',
    fontWeightHelp: 'Un valor mas alto hace el texto mas grueso y facil de leer.',
    bgTitle: 'Configuracion de fondo',
    bgDescription: 'Color detras de cada mensaje para mejorar el contraste en el overlay.',
    bgColorLabel: 'Color de fondo',
    bgPlaceholder: 'Codigo hexadecimal o dejalo vacio',
    bgOpacityLabel: 'Opacidad del fondo',
    bgOpacityHelp: 'Que tan visible es el fondo del mensaje. 0 es transparente, 100 es solido.',
    platformColorDotTitle: 'Icono de la plataforma',
    platformColorDotHelp:
      'Cambia el logo de Twitch, Kick, YouTube y TikTok por un circulo del color de cada plataforma.',
    platformColorDotLabel: 'Usar circulo de color',
    soundTitle: 'Sonido al recibir mensaje',
    soundDescription:
      'Reproduce una alerta cuando llega un mensaje nuevo del chat (Twitch, Kick, YouTube o TikTok).',
    soundTypeLabel: 'Sonido de alerta',
    soundVolumeLabel: 'Volumen / intensidad',
    soundVolumeHelp: 'Intensidad de la alerta sonora cuando llega un mensaje nuevo.',
    mutedLabel: 'Silencio',
    maxLabel: 'Maximo',
    testSound: 'Probar sonido',
    ttsTitle: 'Leer mensajes en voz alta',
    ttsDescription:
      'Lee los mensajes en tu computadora, sin enviar el chat a Microsoft. La primera vez descarga un modelo de ~19 MB; luego funciona sin internet. No lee avisos de conexion y no suena en el overlay de OBS.',
    ttsOn: 'Activado',
    ttsOff: 'Desactivado',
    ttsVolumeLabel: 'Volumen de la voz',
    ttsVolumeHelp: 'Intensidad de la voz que lee los mensajes.',
    ttsRateLabel: 'Velocidad de lectura',
    ttsRateHelp: 'Que tan rapido habla la voz. 1.0 es el ritmo normal.',
    ttsReadAuthorLabel: 'Decir quien hablo',
    ttsReadAuthorHelp:
      'Si esta activo, la voz empieza con el nick. Ejemplo: ana hablo. hola que tal?',
    ttsTestLabel: 'Probar voz',
    ttsTestAuthor: 'ana',
    ttsTestMessage: 'hola, solo paso para probar la voz.',
    ttsGenerating: 'Preparando la voz...',
    ttsPlayError:
      'No se pudo reproducir. La primera vez hay que descargar el modelo; luego reintenta.',
    ttsVoiceLabel: 'Voz',
    ttsVoiceHelp:
      'Voces locales en portugues. Cadu y Jeff descargan el modelo la primera vez (~60 MB).',
    ttsVoiceAuto: 'Automatico',
    ttsSlowLabel: 'Lenta',
    ttsFastLabel: 'Rapida',
    ttsRetryLabel: 'Reintentar',
    ttsExampleLabel: 'Asi va a sonar',
    ttsOffHint: 'Activalo para que el robot lea el chat en voz alta en esta computadora.',
    ttsVoiceHintFaber: 'Predeterminada · natural',
    ttsVoiceHintCadu: 'Mas grave',
    ttsVoiceHintJeff: 'Mas clara',
    ignoreBotsTitle: 'Ignorar bots',
    ignoreBotsDescription:
      'Los mensajes de estos nicks no aparecen en el chat. Escribe un nombre y presiona Enter, coma o espacio para crear una etiqueta. Ejemplo: nightbot streamelements',
    ignoreBotsAriaLabel: 'Nombres de bots para ignorar',
    ignoreBotsPlaceholderEmpty: 'Escribe un bot y presiona Enter...',
    ignoreBotsPlaceholderAdd: 'Agregar otro...',
    removeBotAriaPrefix: 'Quitar',
    cancel: 'Cancelar',
    save: 'Guardar',
    saving: 'Guardando...',
    localServerTitle: 'Aparecer en la pantalla de la live',
    localServerDescription:
      'Este enlace es solo para que el chat aparezca en la ESCENA de la live, para quien mira. No lo uses en el panel/dock de OBS.',
    localServerHelp:
      '1. Copia el enlace.\n2. En OBS, en la ESCENA de la live: Agregar > Fuente > Navegador.\n3. Pega la URL, define ancho y alto y marca fondo transparente.\n4. Desmarca "Apagar fuente cuando no sea visible".\n5. Arrastra el chat al lugar donde debe verse.\n6. BooChat debe permanecer abierto.',
    localServerCopyAria: 'Copiar enlace para aparecer en la live',
    liveHowToLabel: 'Como ponerlo en la live',
    obsTitle: 'Usar en el panel de OBS',
    obsDescription:
      'Este enlace es solo para el panel de OBS (dock). Solo tu ves el chat. Quien mira la live no lo ve.',
    obsCopyLink: 'Copiar enlace',
    obsCopied: 'Enlace copiado!',
    obsHelp:
      '1. Copia el enlace.\n2. En OBS, abre Paneles.\n3. Haz clic en Paneles personalizables con URL...\n4. Añade el nombre del panel (ej: BooChat) y pega la URL.\n5. El chat se abre en un panel al lado: solo tu lo ves.',
    obsHowToLabel: 'Como ponerlo en el panel',
    obsCopyAria: 'Copiar enlace del panel de OBS',
    obsAppearanceTitle: 'Apariencia del overlay',
    obsAppearanceDescription:
      'Estas opciones solo aplican al enlace de OBS. La ventana de la app sigue usando la seccion Apariencia.',
    obsFontFamilyLabel: 'Familia de fuente',
    obsFontFamilyHelp: 'Fuente usada en los mensajes del overlay en OBS.',
    obsFontSizeHelp: 'Tamano del texto de los mensajes en el overlay de OBS.',
    obsFontWeightHelp: 'Un valor mas alto hace el texto del overlay mas grueso y facil de leer.',
    obsPageBgTitle: 'Fondo de la pagina',
    obsPageBgColorLabel: 'Color de fondo de la pagina',
    obsPageBgColorHelp:
      'Color detras de todo el overlay. Usa opacidad 0 para mantener el fondo transparente en OBS.',
    obsPageBgOpacityLabel: 'Opacidad de la pagina',
    obsPageBgOpacityHelp: '0 deja la pagina transparente en OBS. 100 deja el color solido.',
    obsMessageBgTitle: 'Fondos de los mensajes',
    obsMessageBgHelp:
      'Cada mensaje usa el siguiente color de la lista y luego vuelve al inicio. Ejemplo: color 1, color 2, color 1, color 2...',
    obsMessageBgOpacityLabel: 'Opacidad de los mensajes',
    obsMessageBgOpacityHelp:
      'Opacidad solo de este color. 0 es transparente, 100 es solido. Cada color de la lista puede tener un valor distinto.',
    obsMessageColorLabel: 'Color {n}',
    obsAddColor: 'Agregar color',
    obsRemoveColor: 'Quitar',
    obsRemoveColorAria: 'Quitar color',
    obsPreviewTitle: 'Vista previa',
    obsPreviewUser: 'viewer',
    obsPreviewMessage: 'mensaje de ejemplo',
    sidebarGeneral: 'General',
    sidebarGeneralIntro:
      'Idioma, emotes de terceros, sonido de alerta, lector de voz y cuanto tiempo permanecen visibles los mensajes.',
    sidebarChannels: 'Canales',
    sidebarChannelsIntro: 'Conecta los chats de Twitch, Kick, YouTube y TikTok.',
    sidebarAppearance: 'Apariencia',
    sidebarAppearanceIntro: 'Fuente y fondo de los mensajes en la ventana de la aplicacion.',
    sidebarObs: 'Panel OBS',
    sidebarObsIntro: 'Enlace y aspecto del chat en el panel de OBS. Solo tu lo ves. No aparece en la live.',
    sidebarLive: 'En la live',
    sidebarLiveIntro: 'Enlace y aspecto del chat en la escena de la live. Quien mira lo ve. No lo uses en el panel.',
    liveAppearanceTitle: 'Apariencia de la pantalla de la live',
    liveAppearanceDescription:
      'Estas opciones valen solo para el enlace de la live. El panel de OBS y la ventana de la app no cambian.',
    liveFontFamilyHelp: 'Fuente usada en los mensajes de la pantalla de la live.',
    liveFontSizeHelp: 'Tamano del texto de los mensajes en la pantalla de la live.',
    liveFontWeightHelp: 'Un valor mas alto hace el texto de la live mas grueso y facil de leer.',
    livePageBgTitle: 'Fondo de la pagina',
    livePageBgColorLabel: 'Color de fondo de la pagina',
    livePageBgColorHelp:
      'Color detras de todo el chat en la live. Usa opacidad 0 para mantener el fondo transparente.',
    livePageBgOpacityLabel: 'Opacidad de la pagina',
    livePageBgOpacityHelp: '0 deja la pagina transparente en la live. 100 deja el color solido.',
    liveMessageBgTitle: 'Fondos de los mensajes',
    liveMessageBgHelp:
      'Cada mensaje usa el siguiente color de la lista y luego vuelve a empezar. Ejemplo: color 1, color 2, color 1, color 2...',
    sidebarFilters: 'Filtros',
    sidebarFiltersIntro: 'Oculta mensajes de bots y nicks que no quieres ver en el chat.',
    messageVisibilityTitle: 'Visibilidad de mensajes',
    messageVisibilitySystemTitle: 'Mensajes de conexion',
    messageVisibilitySystemHelp:
      'Avisos de conectado, error o canal no encontrado. Pueden quedarse en pantalla o desaparecer despues de unos segundos.',
    messageVisibilityViewersTitle: 'Mensajes de los viewers',
    messageVisibilityViewersHelp:
      'Mensajes del chat. Pueden quedar siempre visibles o desaparecer despues del tiempo definido.',
    messageVisibilityAlways: 'Siempre visibles',
    messageVisibilityTimed: 'Desaparecer',
    messageVisibilityHideAfter: 'Ocultar despues de',
    messageVisibilitySeconds: 'segundos',
    emotesTitle: 'Emotes de terceros',
    emotesHelp:
      'Muestra emotes extra de 7TV y BetterTTV en el chat de Twitch. Los catalogos se descargan una vez y se cachean.',
    emotesSeventvLabel: '7TV',
    emotesBetterttvLabel: 'BetterTTV',
    emotesOn: 'Activado',
    emotesOff: 'Desactivado',
    linkImagesTitle: 'Imagenes y GIFs',
    linkImagesHelp:
      'Cuando alguien envia un enlace directo de imagen o GIF (.png, .jpg, .gif, .webp), el archivo aparece en el chat. Tambien muestra imagenes de la extension TWShot (upl:, img:, tnr:, ls:).',
    linkImagesLabel: 'Mostrar imagenes de los enlaces',
    fontWeights: {
      300: 'Ligera',
      400: 'Normal',
      500: 'Media',
      600: 'Semi-negrita',
      700: 'Negrita'
    }
  },
  'fr-FR': {
    helpAriaLabel: 'Aide',
    tiktokChannelLabel: 'Nom du canal TikTok',
    tiktokChannelHelp: 'Nom d utilisateur TikTok dont le chat live sera affiche. Avec ou sans @.',
    languageLabel: "Langue de l'application",
    languageHelp: "Definissez la langue de l'interface BooChat, y compris les menus et les avis.",
    twitchChannelLabel: 'Nom de la chaine Twitch',
    twitchChannelHelp:
      'Chaine Twitch dont le chat sera affiche. Entrez uniquement le nom, sans le lien.',
    kickChannelLabel: 'Nom de la chaine Kick',
    kickChannelHelp:
      'Chaine Kick dont le chat sera affiche. Entrez le slug de la chaine, sans le lien.',
    youtubeChannelLabel: 'Nom de la chaine YouTube',
    youtubeChannelHelp: 'Chaine, @handle ou URL du live YouTube pour capturer le chat.',
    channelPlaceholder: 'Entrez le nom de la chaine, ex: devrogerinho',
    youtubePlaceholder: 'Ex: @VotreChaine ou https://youtube.com/watch?v=...',
    tiktokPlaceholder: 'Ex: @devrogerinho ou devrogerinho',
    fontTitle: 'Parametres de police',
    fontSizeLabel: 'Taille de police',
    fontSizeHelp: 'Taille du texte des messages dans l overlay et la fenetre de chat.',
    fontWeightLabel: 'Epaisseur de police',
    fontWeightHelp: 'Une valeur plus elevee rend le texte plus gras et plus lisible.',
    bgTitle: 'Parametres de fond',
    bgDescription: 'Couleur derriere chaque message pour ameliorer le contraste sur l overlay.',
    bgColorLabel: 'Couleur de fond',
    bgPlaceholder: 'Code hexadecimal ou laissez vide',
    bgOpacityLabel: 'Opacite du fond',
    bgOpacityHelp: 'Visibilite du fond du message. 0 est transparent, 100 est opaque.',
    platformColorDotTitle: 'Icone de la plateforme',
    platformColorDotHelp:
      'Remplace le logo Twitch, Kick, YouTube et TikTok par un cercle a la couleur de chaque plateforme.',
    platformColorDotLabel: 'Utiliser un cercle colore',
    soundTitle: 'Son a la reception de message',
    soundDescription:
      'Joue une alerte quand un nouveau message arrive (Twitch, Kick, YouTube ou TikTok).',
    soundTypeLabel: 'Son d alerte',
    soundVolumeLabel: 'Volume / intensite',
    soundVolumeHelp: 'Intensite de l alerte sonore a l arrivee d un nouveau message.',
    mutedLabel: 'Muet',
    maxLabel: 'Maximum',
    testSound: 'Tester le son',
    ttsTitle: 'Lire les messages a voix haute',
    ttsDescription:
      'Lit les messages sur votre ordinateur, sans envoyer le chat a Microsoft. Le premier lancement telecharge un modele de ~19 Mo ; ensuite cela fonctionne hors ligne. Les avis de connexion sont ignores, et cela ne joue pas dans l overlay OBS.',
    ttsOn: 'Active',
    ttsOff: 'Desactive',
    ttsVolumeLabel: 'Volume de la voix',
    ttsVolumeHelp: 'Intensite de la voix qui lit les messages.',
    ttsRateLabel: 'Vitesse de lecture',
    ttsRateHelp: 'Vitesse a laquelle la voix parle. 1.0 est le rythme normal.',
    ttsReadAuthorLabel: 'Dire qui a parle',
    ttsReadAuthorHelp:
      'Si active, la voix commence par le nick. Exemple : ana a dit. salut ca va ?',
    ttsTestLabel: 'Tester la voix',
    ttsTestAuthor: 'ana',
    ttsTestMessage: 'salut, je passe juste pour tester la voix.',
    ttsGenerating: 'Preparation de la voix...',
    ttsPlayError:
      'Impossible de lire la voix. Le premier lancement doit telecharger le modele ; puis reessayez.',
    ttsVoiceLabel: 'Voix',
    ttsVoiceHelp:
      'Voix locales en portugais. Cadu et Jeff telechargent le modele au premier usage (~60 Mo).',
    ttsVoiceAuto: 'Automatique',
    ttsSlowLabel: 'Lente',
    ttsFastLabel: 'Rapide',
    ttsRetryLabel: 'Reessayer',
    ttsExampleLabel: 'Voici comment cela sonnera',
    ttsOffHint: 'Activez pour que le robot lise le chat a voix haute sur cet ordinateur.',
    ttsVoiceHintFaber: 'Par defaut · naturelle',
    ttsVoiceHintCadu: 'Plus grave',
    ttsVoiceHintJeff: 'Plus claire',
    ignoreBotsTitle: 'Ignorer les bots',
    ignoreBotsDescription:
      'Les messages de ces nicks n apparaissent pas dans le chat. Tapez un nom et appuyez sur Entree, virgule ou espace pour creer une etiquette. Exemple : nightbot streamelements',
    ignoreBotsAriaLabel: 'Noms de bots a ignorer',
    ignoreBotsPlaceholderEmpty: 'Tapez un bot et appuyez sur Entree...',
    ignoreBotsPlaceholderAdd: 'Ajouter un autre...',
    removeBotAriaPrefix: 'Retirer',
    cancel: 'Annuler',
    save: 'Enregistrer',
    saving: 'Enregistrement...',
    localServerTitle: 'Afficher sur l ecran du live',
    localServerDescription:
      'Ce lien sert uniquement a afficher le chat sur la SCENE du live, pour les spectateurs. Ne l utilisez pas dans le panneau/dock OBS.',
    localServerHelp:
      '1. Copiez le lien.\n2. Dans OBS, sur la SCENE du live : Ajouter > Source > Navigateur.\n3. Collez l URL, definissez largeur et hauteur, et activez le fond transparent.\n4. Decochez "Desactiver la source quand elle n est pas visible".\n5. Placez le chat la ou les spectateurs doivent le voir.\n6. BooChat doit rester ouvert.',
    localServerCopyAria: 'Copier le lien pour l ecran du live',
    liveHowToLabel: 'Comment le mettre sur le live',
    obsTitle: 'Utiliser dans le panneau OBS',
    obsDescription:
      'Ce lien sert uniquement au panneau OBS (dock). Vous seul voyez le chat. Les spectateurs ne le voient pas.',
    obsCopyLink: 'Copier le lien',
    obsCopied: 'Lien copie !',
    obsHelp:
      '1. Copiez le lien.\n2. Dans OBS, ouvrez Panneaux.\n3. Cliquez sur Panneaux personnalisables avec URL...\n4. Ajoutez le nom du panneau (ex: BooChat) et collez l URL.\n5. Le chat s ouvre dans un panneau a cote : vous seul le voyez.',
    obsHowToLabel: 'Comment le mettre dans le panneau',
    obsCopyAria: 'Copier le lien du panneau OBS',
    obsAppearanceTitle: "Apparence de l'overlay",
    obsAppearanceDescription:
      "Ces options s'appliquent uniquement au lien OBS. La fenetre de l'application utilise toujours la section Apparence.",
    obsFontFamilyLabel: 'Famille de police',
    obsFontFamilyHelp: 'Police utilisee pour les messages de l overlay dans OBS.',
    obsFontSizeHelp: 'Taille du texte des messages dans l overlay OBS.',
    obsFontWeightHelp: "Une valeur plus elevee rend le texte de l'overlay plus gras et lisible.",
    obsPageBgTitle: 'Fond de la page',
    obsPageBgColorLabel: 'Couleur de fond de la page',
    obsPageBgColorHelp:
      "Couleur derriere tout l'overlay. Mettez l'opacite a 0 pour garder un fond transparent dans OBS.",
    obsPageBgOpacityLabel: 'Opacite de la page',
    obsPageBgOpacityHelp: '0 laisse la page transparente dans OBS. 100 rend la couleur opaque.',
    obsMessageBgTitle: 'Fonds des messages',
    obsMessageBgHelp:
      'Chaque message utilise la couleur suivante de la liste, puis recommence. Exemple : couleur 1, couleur 2, couleur 1, couleur 2...',
    obsMessageBgOpacityLabel: 'Opacite des messages',
    obsMessageBgOpacityHelp:
      'Opacite de cette couleur uniquement. 0 est transparent, 100 est opaque. Chaque couleur de la liste peut avoir sa propre valeur.',
    obsMessageColorLabel: 'Couleur {n}',
    obsAddColor: 'Ajouter une couleur',
    obsRemoveColor: 'Retirer',
    obsRemoveColorAria: 'Retirer la couleur',
    obsPreviewTitle: 'Apercu',
    obsPreviewUser: 'viewer',
    obsPreviewMessage: 'message exemple',
    sidebarGeneral: 'General',
    sidebarGeneralIntro:
      'Langue, emotes tiers, son d alerte, synthese vocale et duree d affichage des messages.',
    sidebarChannels: 'Chaines',
    sidebarChannelsIntro: 'Connectez les chats Twitch, Kick, YouTube et TikTok.',
    sidebarAppearance: 'Apparence',
    sidebarAppearanceIntro: "Police et fond des messages dans la fenetre de l'application.",
    sidebarObs: 'Panneau OBS',
    sidebarObsIntro: 'Lien et aspect du chat dans le panneau OBS. Vous seul le voyez. Il n apparait pas sur le live.',
    sidebarLive: 'Sur le live',
    sidebarLiveIntro: 'Lien et aspect du chat sur la scene du live. Les spectateurs le voient. Ne l utilisez pas dans le panneau.',
    liveAppearanceTitle: "Apparence de l ecran du live",
    liveAppearanceDescription:
      "Ces options valent uniquement pour le lien du live. Le panneau OBS et la fenetre de l app ne changent pas.",
    liveFontFamilyHelp: 'Police utilisee pour les messages sur l ecran du live.',
    liveFontSizeHelp: 'Taille du texte des messages sur l ecran du live.',
    liveFontWeightHelp: "Une valeur plus elevee rend le texte du live plus gras et lisible.",
    livePageBgTitle: 'Fond de la page',
    livePageBgColorLabel: 'Couleur de fond de la page',
    livePageBgColorHelp:
      "Couleur derriere tout le chat du live. Mettez l opacite a 0 pour garder un fond transparent.",
    livePageBgOpacityLabel: 'Opacite de la page',
    livePageBgOpacityHelp: '0 garde la page du live transparente. 100 rend la couleur solide.',
    liveMessageBgTitle: 'Fonds des messages',
    liveMessageBgHelp:
      'Chaque message utilise la couleur suivante de la liste, puis recommence. Exemple : couleur 1, couleur 2, couleur 1, couleur 2...',
    sidebarFilters: 'Filtres',
    sidebarFiltersIntro: 'Masquez les messages des bots et des nicks que vous ne voulez pas voir.',
    messageVisibilityTitle: 'Visibilite des messages',
    messageVisibilitySystemTitle: 'Messages de connexion',
    messageVisibilitySystemHelp:
      'Avis de connexion, erreur ou chaine introuvable. Ils peuvent rester affiches ou disparaitre apres quelques secondes.',
    messageVisibilityViewersTitle: 'Messages des viewers',
    messageVisibilityViewersHelp:
      'Messages du chat. Ils peuvent rester toujours visibles ou disparaitre apres le delai defini.',
    messageVisibilityAlways: 'Toujours visibles',
    messageVisibilityTimed: 'Masquer',
    messageVisibilityHideAfter: 'Masquer apres',
    messageVisibilitySeconds: 'secondes',
    emotesTitle: 'Emotes tiers',
    emotesHelp:
      'Affiche les emotes 7TV et BetterTTV dans le chat Twitch. Les catalogues sont telecharges une fois et mis en cache.',
    emotesSeventvLabel: '7TV',
    emotesBetterttvLabel: 'BetterTTV',
    emotesOn: 'Active',
    emotesOff: 'Desactive',
    linkImagesTitle: 'Images et GIFs',
    linkImagesHelp:
      'Quand quelqu un envoie un lien direct d image ou de GIF (.png, .jpg, .gif, .webp), le fichier s affiche dans le chat. Affiche aussi les images de l extension TWShot (upl:, img:, tnr:, ls:).',
    linkImagesLabel: 'Afficher les images des liens',
    fontWeights: {
      300: 'Legere',
      400: 'Normale',
      500: 'Moyenne',
      600: 'Semi-grasse',
      700: 'Grasse'
    }
  },
  'de-DE': {
    helpAriaLabel: 'Hilfe',
    tiktokChannelLabel: 'TikTok-Kanalname',
    tiktokChannelHelp: 'TikTok-Benutzer, dessen Live-Chat angezeigt wird. Mit oder ohne @.',
    languageLabel: 'App-Sprache',
    languageHelp: 'Legt die Sprache der BooChat-Oberflaeche fest, inklusive Menues und Hinweise.',
    twitchChannelLabel: 'Twitch-Kanalname',
    twitchChannelHelp:
      'Twitch-Kanal, dessen Chat angezeigt wird. Nur den Namen eingeben, ohne Link.',
    kickChannelLabel: 'Kick-Kanalname',
    kickChannelHelp: 'Kick-Kanal, dessen Chat angezeigt wird. Nur den Slug eingeben, ohne Link.',
    youtubeChannelLabel: 'YouTube-Kanalname',
    youtubeChannelHelp: 'Kanal, @handle oder Live-URL von YouTube zum Erfassen des Chats.',
    channelPlaceholder: 'Kanalnamen eingeben, z. B. devrogerinho',
    youtubePlaceholder: 'Z. B. @DeinKanal oder https://youtube.com/watch?v=...',
    tiktokPlaceholder: 'Z. B. @devrogerinho oder devrogerinho',
    fontTitle: 'Schrift-Einstellungen',
    fontSizeLabel: 'Schriftgroesse',
    fontSizeHelp: 'Textgroesse der Nachrichten im Overlay und im Chat-Fenster.',
    fontWeightLabel: 'Schriftstaerke',
    fontWeightHelp: 'Hoehere Werte machen den Nachrichtentext fetter und besser lesbar.',
    bgTitle: 'Hintergrund-Einstellungen',
    bgDescription: 'Farbe hinter jeder Nachricht, um den Kontrast im Overlay zu verbessern.',
    bgColorLabel: 'Hintergrundfarbe',
    bgPlaceholder: 'Hex-Farbcode oder leer lassen',
    bgOpacityLabel: 'Hintergrund-Deckkraft',
    bgOpacityHelp:
      'Wie sichtbar der Nachrichtenhintergrund ist. 0 ist transparent, 100 ist deckend.',
    platformColorDotTitle: 'Plattform-Symbol',
    platformColorDotHelp:
      'Ersetzt die Logos von Twitch, Kick, YouTube und TikTok durch einen Kreis in der Plattformfarbe.',
    platformColorDotLabel: 'Farbigen Kreis verwenden',
    soundTitle: 'Ton bei neuer Nachricht',
    soundDescription:
      'Spielt einen Alarm bei neuen Chat-Nachrichten (Twitch, Kick, YouTube oder TikTok).',
    soundTypeLabel: 'Hinweiston',
    soundVolumeLabel: 'Lautstaerke / Intensitaet',
    soundVolumeHelp: 'Lautstaerke des Alarms, wenn eine neue Nachricht ankommt.',
    mutedLabel: 'Stumm',
    maxLabel: 'Maximum',
    testSound: 'Sound testen',
    ttsTitle: 'Nachrichten vorlesen',
    ttsDescription:
      'Liest Nachrichten auf deinem Computer, ohne den Chat an Microsoft zu senden. Beim ersten Mal wird ein ~19 MB Modell geladen; danach funktioniert es offline. Verbindungshinweise werden uebersprungen, und sie spielt nicht im OBS-Overlay.',
    ttsOn: 'An',
    ttsOff: 'Aus',
    ttsVolumeLabel: 'Stimmenlautstaerke',
    ttsVolumeHelp: 'Wie laut die Stimme Nachrichten vorliest.',
    ttsRateLabel: 'Lesegeschwindigkeit',
    ttsRateHelp: 'Wie schnell die Stimme spricht. 1.0 ist das normale Tempo.',
    ttsReadAuthorLabel: 'Sagen, wer gesprochen hat',
    ttsReadAuthorHelp:
      'Wenn aktiv, beginnt die Stimme mit dem Nick. Beispiel: ana sagte. hallo, alles gut?',
    ttsTestLabel: 'Stimme testen',
    ttsTestAuthor: 'ana',
    ttsTestMessage: 'hallo, ich teste nur kurz die Stimme.',
    ttsGenerating: 'Stimme wird vorbereitet...',
    ttsPlayError:
      'Die Stimme konnte nicht abgespielt werden. Beim ersten Mal muss das Modell geladen werden.',
    ttsVoiceLabel: 'Stimme',
    ttsVoiceHelp:
      'Lokale Stimmen auf Portugiesisch. Cadu und Jeff laden das Modell beim ersten Mal (~60 MB).',
    ttsVoiceAuto: 'Automatisch',
    ttsSlowLabel: 'Langsam',
    ttsFastLabel: 'Schnell',
    ttsRetryLabel: 'Erneut versuchen',
    ttsExampleLabel: 'So wird es klingen',
    ttsOffHint: 'Einschalten, damit der Chat auf diesem Computer vorgelesen wird.',
    ttsVoiceHintFaber: 'Standard · natuerlich',
    ttsVoiceHintCadu: 'Tiefer',
    ttsVoiceHintJeff: 'Klarer',
    ignoreBotsTitle: 'Bots ignorieren',
    ignoreBotsDescription:
      'Nachrichten dieser Nicks erscheinen nicht im Chat. Namen eingeben und Enter, Komma oder Leerzeichen druecken, um ein Tag zu erstellen. Beispiel: nightbot streamelements',
    ignoreBotsAriaLabel: 'Zu ignorierende Bot-Namen',
    ignoreBotsPlaceholderEmpty: 'Bot eingeben und Enter druecken...',
    ignoreBotsPlaceholderAdd: 'Weiteren hinzufuegen...',
    removeBotAriaPrefix: 'Entfernen',
    cancel: 'Abbrechen',
    save: 'Speichern',
    saving: 'Wird gespeichert...',
    localServerTitle: 'Auf dem Live-Bildschirm zeigen',
    localServerDescription:
      'Dieser Link ist nur fuer den Chat auf der Live-SZENE, damit Zuschauer ihn sehen. Nicht im OBS-Panel/Dock verwenden.',
    localServerHelp:
      '1. Kopiere den Link.\n2. In OBS, auf der Live-SZENE: Hinzufuegen > Quelle > Browser.\n3. URL einfuegen, Breite und Hoehe setzen und transparenten Hintergrund aktivieren.\n4. "Quelle schliessen, wenn nicht sichtbar" deaktivieren.\n5. Ziehe den Chat dorthin, wo Zuschauer ihn sehen sollen.\n6. BooChat muss geoeffnet bleiben.',
    localServerCopyAria: 'Link fuer den Live-Bildschirm kopieren',
    liveHowToLabel: 'So kommt es auf den Live-Stream',
    obsTitle: 'Im OBS-Panel verwenden',
    obsDescription:
      'Dieser Link ist nur fuer das OBS-Panel (Dock). Nur du siehst den Chat. Zuschauer sehen ihn nicht.',
    obsCopyLink: 'Link kopieren',
    obsCopied: 'Link kopiert!',
    obsHelp:
      '1. Kopiere den Link.\n2. In OBS oeffne Fenster.\n3. Klicke auf Benutzerdefinierte Browserdocks.\n4. Gib den Panel-Namen ein (z. B. BooChat) und fuege die URL ein.\n5. Der Chat oeffnet sich in einem Seitenpanel — nur du siehst ihn.',
    obsHowToLabel: 'So kommt es ins Panel',
    obsCopyAria: 'OBS-Panel-Link kopieren',
    obsAppearanceTitle: 'Overlay-Erscheinungsbild',
    obsAppearanceDescription:
      'Diese Optionen gelten nur fuer den OBS-Link. Das App-Fenster nutzt weiter den Bereich Erscheinungsbild.',
    obsFontFamilyLabel: 'Schriftfamilie',
    obsFontFamilyHelp: 'Schrift fuer Overlay-Nachrichten in OBS.',
    obsFontSizeHelp: 'Textgroesse der Nachrichten im OBS-Overlay.',
    obsFontWeightHelp: 'Hoehere Werte machen den Overlay-Text fetter und besser lesbar.',
    obsPageBgTitle: 'Seitenhintergrund',
    obsPageBgColorLabel: 'Hintergrundfarbe der Seite',
    obsPageBgColorHelp:
      'Farbe hinter dem gesamten Overlay. Deckkraft 0 behält einen transparenten Hintergrund in OBS.',
    obsPageBgOpacityLabel: 'Seiten-Deckkraft',
    obsPageBgOpacityHelp: '0 laesst die Seite in OBS transparent. 100 macht die Farbe deckend.',
    obsMessageBgTitle: 'Nachrichtenhintergruende',
    obsMessageBgHelp:
      'Jede neue Nachricht nutzt die naechste Farbe der Liste und beginnt dann von vorn. Beispiel: Farbe 1, Farbe 2, Farbe 1, Farbe 2...',
    obsMessageBgOpacityLabel: 'Nachrichten-Deckkraft',
    obsMessageBgOpacityHelp:
      'Deckkraft nur fuer diese Farbe. 0 ist transparent, 100 ist deckend. Jede Farbe in der Liste kann einen eigenen Wert haben.',
    obsMessageColorLabel: 'Farbe {n}',
    obsAddColor: 'Farbe hinzufuegen',
    obsRemoveColor: 'Entfernen',
    obsRemoveColorAria: 'Farbe entfernen',
    obsPreviewTitle: 'Vorschau',
    obsPreviewUser: 'viewer',
    obsPreviewMessage: 'Beispielnachricht',
    sidebarGeneral: 'Allgemein',
    sidebarGeneralIntro:
      'Sprache, Drittanbieter-Emotes, Hinweiston, Vorlesen und wie lange Nachrichten sichtbar bleiben.',
    sidebarChannels: 'Kanaele',
    sidebarChannelsIntro: 'Verbinde Chats von Twitch, Kick, YouTube und TikTok.',
    sidebarAppearance: 'Erscheinungsbild',
    sidebarAppearanceIntro: 'Schrift und Hintergrund der Nachrichten im App-Fenster.',
    sidebarObs: 'OBS-Panel',
    sidebarObsIntro: 'Link und Aussehen des Chats im OBS-Panel. Nur du siehst ihn. Er erscheint nicht im Stream.',
    sidebarLive: 'Im Stream',
    sidebarLiveIntro: 'Link und Aussehen des Chats auf der Live-Szene. Zuschauer sehen ihn. Nicht im Panel verwenden.',
    liveAppearanceTitle: 'Erscheinungsbild des Live-Bildschirms',
    liveAppearanceDescription:
      'Diese Optionen gelten nur fuer den Live-Link. OBS-Panel und App-Fenster bleiben unveraendert.',
    liveFontFamilyHelp: 'Schrift fuer Nachrichten auf dem Live-Bildschirm.',
    liveFontSizeHelp: 'Textgroesse der Nachrichten auf dem Live-Bildschirm.',
    liveFontWeightHelp: 'Hoehere Werte machen den Live-Text fetter und lesbarer.',
    livePageBgTitle: 'Seitenhintergrund',
    livePageBgColorLabel: 'Farbe des Seitenhintergrunds',
    livePageBgColorHelp:
      'Farbe hinter dem gesamten Live-Chat. Opazitaet 0 haelt den Hintergrund transparent.',
    livePageBgOpacityLabel: 'Seitenopazitaet',
    livePageBgOpacityHelp: '0 haelt die Live-Seite transparent. 100 macht die Farbe deckend.',
    liveMessageBgTitle: 'Nachrichtenhintergruende',
    liveMessageBgHelp:
      'Jede Nachricht nutzt die naechste Farbe der Liste und beginnt dann von vorn. Beispiel: Farbe 1, Farbe 2, Farbe 1, Farbe 2...',
    sidebarFilters: 'Filter',
    sidebarFiltersIntro: 'Blende Nachrichten von Bots und Nicks aus, die du nicht sehen willst.',
    messageVisibilityTitle: 'Sichtbarkeit der Nachrichten',
    messageVisibilitySystemTitle: 'Verbindungsnachrichten',
    messageVisibilitySystemHelp:
      'Hinweise zu Verbindung, Fehler oder nicht gefundenem Kanal. Sie bleiben sichtbar oder verschwinden nach einigen Sekunden.',
    messageVisibilityViewersTitle: 'Zuschauer-Nachrichten',
    messageVisibilityViewersHelp:
      'Chat-Nachrichten. Sie bleiben immer sichtbar oder verschwinden nach der festgelegten Zeit.',
    messageVisibilityAlways: 'Immer sichtbar',
    messageVisibilityTimed: 'Ausblenden',
    messageVisibilityHideAfter: 'Ausblenden nach',
    messageVisibilitySeconds: 'Sekunden',
    emotesTitle: 'Drittanbieter-Emotes',
    emotesHelp:
      'Zeigt zusaetzliche 7TV- und BetterTTV-Emotes im Twitch-Chat. Kataloge werden einmal geladen und zwischengespeichert.',
    emotesSeventvLabel: '7TV',
    emotesBetterttvLabel: 'BetterTTV',
    emotesOn: 'An',
    emotesOff: 'Aus',
    linkImagesTitle: 'Bilder und GIFs',
    linkImagesHelp:
      'Wenn jemand einen direkten Bild- oder GIF-Link (.png, .jpg, .gif, .webp) sendet, erscheint die Datei im Chat. Zeigt auch Bilder der TWShot-Erweiterung (upl:, img:, tnr:, ls:).',
    linkImagesLabel: 'Bilder aus Links anzeigen',
    fontWeights: {
      300: 'Leicht',
      400: 'Normal',
      500: 'Mittel',
      600: 'Halbfett',
      700: 'Fett'
    }
  },
  'it-IT': {
    helpAriaLabel: 'Aiuto',
    tiktokChannelLabel: 'Nome canale TikTok',
    tiktokChannelHelp: 'Utente TikTok la cui chat live verra mostrata. Con o senza @.',
    languageLabel: "Lingua dell'app",
    languageHelp: "Imposta la lingua dell'interfaccia di BooChat, inclusi menu e avvisi.",
    twitchChannelLabel: 'Nome canale Twitch',
    twitchChannelHelp:
      'Canale Twitch la cui chat verra mostrata. Inserisci solo il nome, senza il link.',
    kickChannelLabel: 'Nome canale Kick',
    kickChannelHelp:
      'Canale Kick la cui chat verra mostrata. Inserisci lo slug del canale, senza il link.',
    youtubeChannelLabel: 'Nome canale YouTube',
    youtubeChannelHelp: 'Canale, @handle o URL della live YouTube per catturare la chat.',
    channelPlaceholder: 'Inserisci il nome canale, es: devrogerinho',
    youtubePlaceholder: 'Es: @IlTuoCanale o https://youtube.com/watch?v=...',
    tiktokPlaceholder: 'Es: @devrogerinho o devrogerinho',
    fontTitle: 'Impostazioni carattere',
    fontSizeLabel: 'Dimensione carattere',
    fontSizeHelp: 'Dimensione del testo dei messaggi nell overlay e nella finestra della chat.',
    fontWeightLabel: 'Spessore carattere',
    fontWeightHelp: 'Un valore piu alto rende il testo piu marcato e leggibile.',
    bgTitle: 'Impostazioni sfondo',
    bgDescription: 'Colore dietro ogni messaggio per migliorare il contrasto sull overlay.',
    bgColorLabel: 'Colore di sfondo',
    bgPlaceholder: 'Codice esadecimale o lascia vuoto',
    bgOpacityLabel: 'Opacita sfondo',
    bgOpacityHelp: 'Quanto e visibile lo sfondo del messaggio. 0 e trasparente, 100 e solido.',
    platformColorDotTitle: 'Icona della piattaforma',
    platformColorDotHelp:
      'Sostituisce i loghi di Twitch, Kick, YouTube e TikTok con un cerchio nel colore di ogni piattaforma.',
    platformColorDotLabel: 'Usa un cerchio colorato',
    soundTitle: 'Suono alla ricezione messaggi',
    soundDescription:
      'Riproduce un avviso quando arriva un nuovo messaggio (Twitch, Kick, YouTube o TikTok).',
    soundTypeLabel: 'Suono di avviso',
    soundVolumeLabel: 'Volume / intensita',
    soundVolumeHelp: 'Intensita dell avviso sonoro quando arriva un nuovo messaggio.',
    mutedLabel: 'Muto',
    maxLabel: 'Massimo',
    testSound: 'Testa suono',
    ttsTitle: 'Leggi i messaggi ad alta voce',
    ttsDescription:
      'Legge i messaggi sul computer, senza inviare la chat a Microsoft. La prima volta scarica un modello di ~19 MB; poi funziona offline. Gli avvisi di connessione vengono saltati e non viene riprodotta nell overlay OBS.',
    ttsOn: 'Attivo',
    ttsOff: 'Disattivo',
    ttsVolumeLabel: 'Volume della voce',
    ttsVolumeHelp: 'Quanto e alta la voce quando legge i messaggi.',
    ttsRateLabel: 'Velocita di lettura',
    ttsRateHelp: 'Quanto velocemente parla la voce. 1.0 e il ritmo normale.',
    ttsReadAuthorLabel: 'Dire chi ha parlato',
    ttsReadAuthorHelp:
      'Se attivo, la voce inizia con il nick. Esempio: ana ha detto. ciao, tutto bene?',
    ttsTestLabel: 'Prova voce',
    ttsTestAuthor: 'ana',
    ttsTestMessage: 'ciao, passo solo per provare la voce.',
    ttsGenerating: 'Preparazione della voce...',
    ttsPlayError:
      'Impossibile riprodurre la voce. La prima volta deve scaricare il modello; poi riprova.',
    ttsVoiceLabel: 'Voce',
    ttsVoiceHelp:
      'Voci locali in portoghese. Cadu e Jeff scaricano il modello al primo uso (~60 MB).',
    ttsVoiceAuto: 'Automatico',
    ttsSlowLabel: 'Lenta',
    ttsFastLabel: 'Veloce',
    ttsRetryLabel: 'Riprova',
    ttsExampleLabel: 'Cosi suonera',
    ttsOffHint: 'Attiva per far leggere la chat ad alta voce su questo computer.',
    ttsVoiceHintFaber: 'Predefinita · naturale',
    ttsVoiceHintCadu: 'Piu grave',
    ttsVoiceHintJeff: 'Piu chiara',
    ignoreBotsTitle: 'Ignora bot',
    ignoreBotsDescription:
      'I messaggi di questi nick non compaiono in chat. Digita un nome e premi Invio, virgola o spazio per creare un tag. Esempio: nightbot streamelements',
    ignoreBotsAriaLabel: 'Nomi bot da ignorare',
    ignoreBotsPlaceholderEmpty: 'Digita un bot e premi Invio...',
    ignoreBotsPlaceholderAdd: 'Aggiungi altro...',
    removeBotAriaPrefix: 'Rimuovi',
    cancel: 'Annulla',
    save: 'Salva',
    saving: 'Salvataggio...',
    localServerTitle: 'Mostra sullo schermo della live',
    localServerDescription:
      'Questo link serve solo per far comparire la chat sulla SCENA della live, per chi guarda. Non usarlo nel pannello/dock di OBS.',
    localServerHelp:
      '1. Copia il link.\n2. In OBS, sulla SCENA della live: Aggiungi > Sorgente > Browser.\n3. Incolla l URL, imposta larghezza e altezza e attiva lo sfondo trasparente.\n4. Togli "Spegni sorgente quando non visibile".\n5. Sposta la chat dove deve comparire per chi guarda.\n6. BooChat deve restare aperto.',
    localServerCopyAria: 'Copia il link per la live',
    liveHowToLabel: 'Come metterlo in live',
    obsTitle: 'Usa nel pannello di OBS',
    obsDescription:
      'Questo link serve solo per il pannello di OBS (dock). Solo tu vedi la chat. Chi guarda la live non la vede.',
    obsCopyLink: 'Copia link',
    obsCopied: 'Link copiato!',
    obsHelp:
      '1. Copia il link.\n2. In OBS, apri Pannelli.\n3. Clicca su Pannelli personalizzabili con URL...\n4. Aggiungi il nome del pannello (es: BooChat) e incolla l URL.\n5. La chat si apre in un pannello a lato: solo tu la vedi.',
    obsHowToLabel: 'Come metterlo nel pannello',
    obsCopyAria: 'Copia il link del pannello OBS',
    obsAppearanceTitle: "Aspetto dell'overlay",
    obsAppearanceDescription:
      "Queste opzioni valgono solo per il link OBS. La finestra dell'app continua a usare la sezione Aspetto.",
    obsFontFamilyLabel: 'Famiglia di caratteri',
    obsFontFamilyHelp: "Carattere usato nei messaggi dell'overlay in OBS.",
    obsFontSizeHelp: "Dimensione del testo dei messaggi nell'overlay OBS.",
    obsFontWeightHelp: "Un valore piu alto rende il testo dell'overlay piu marcato e leggibile.",
    obsPageBgTitle: 'Sfondo della pagina',
    obsPageBgColorLabel: 'Colore di sfondo della pagina',
    obsPageBgColorHelp:
      "Colore dietro tutto l'overlay. Imposta l'opacita a 0 per tenere lo sfondo trasparente in OBS.",
    obsPageBgOpacityLabel: 'Opacita della pagina',
    obsPageBgOpacityHelp: '0 lascia la pagina trasparente in OBS. 100 rende il colore solido.',
    obsMessageBgTitle: 'Sfondi dei messaggi',
    obsMessageBgHelp:
      'Ogni messaggio usa il colore successivo della lista e poi ricomincia. Esempio: colore 1, colore 2, colore 1, colore 2...',
    obsMessageBgOpacityLabel: 'Opacita dei messaggi',
    obsMessageBgOpacityHelp:
      'Opacita solo di questo colore. 0 e trasparente, 100 e solido. Ogni colore della lista puo avere un valore diverso.',
    obsMessageColorLabel: 'Colore {n}',
    obsAddColor: 'Aggiungi colore',
    obsRemoveColor: 'Rimuovi',
    obsRemoveColorAria: 'Rimuovi colore',
    obsPreviewTitle: 'Anteprima',
    obsPreviewUser: 'viewer',
    obsPreviewMessage: 'messaggio di esempio',
    sidebarGeneral: 'Generale',
    sidebarGeneralIntro:
      'Lingua, emote di terze parti, suono di avviso, lettura vocale e quanto restano visibili i messaggi.',
    sidebarChannels: 'Canali',
    sidebarChannelsIntro: 'Collega le chat di Twitch, Kick, YouTube e TikTok.',
    sidebarAppearance: 'Aspetto',
    sidebarAppearanceIntro: "Carattere e sfondo dei messaggi nella finestra dell'app.",
    sidebarObs: 'Pannello OBS',
    sidebarObsIntro: 'Link e aspetto della chat nel pannello OBS. Solo tu la vedi. Non compare in live.',
    sidebarLive: 'In live',
    sidebarLiveIntro: 'Link e aspetto della chat sulla scena della live. Chi guarda la vede. Non usarlo nel pannello.',
    liveAppearanceTitle: 'Aspetto dello schermo della live',
    liveAppearanceDescription:
      "Queste opzioni valgono solo per il link della live. Il pannello OBS e la finestra dell'app non cambiano.",
    liveFontFamilyHelp: 'Carattere usato nei messaggi sullo schermo della live.',
    liveFontSizeHelp: 'Dimensione del testo dei messaggi sullo schermo della live.',
    liveFontWeightHelp: 'Un valore piu alto rende il testo della live piu marcato e leggibile.',
    livePageBgTitle: 'Sfondo della pagina',
    livePageBgColorLabel: 'Colore di sfondo della pagina',
    livePageBgColorHelp:
      'Colore dietro tutta la chat in live. Imposta l opacita a 0 per tenere lo sfondo trasparente.',
    livePageBgOpacityLabel: 'Opacita della pagina',
    livePageBgOpacityHelp: '0 lascia la pagina della live trasparente. 100 rende il colore solido.',
    liveMessageBgTitle: 'Sfondi dei messaggi',
    liveMessageBgHelp:
      'Ogni messaggio usa il colore successivo della lista e poi ricomincia. Esempio: colore 1, colore 2, colore 1, colore 2...',
    sidebarFilters: 'Filtri',
    sidebarFiltersIntro: 'Nascondi i messaggi di bot e nick che non vuoi vedere in chat.',
    messageVisibilityTitle: 'Visibilita dei messaggi',
    messageVisibilitySystemTitle: 'Messaggi di connessione',
    messageVisibilitySystemHelp:
      'Avvisi di connessione, errore o canale non trovato. Possono restare a schermo o scomparire dopo alcuni secondi.',
    messageVisibilityViewersTitle: 'Messaggi dei viewer',
    messageVisibilityViewersHelp:
      'Messaggi della chat. Possono restare sempre visibili o scomparire dopo il tempo definito.',
    messageVisibilityAlways: 'Sempre visibili',
    messageVisibilityTimed: 'Nascondi',
    messageVisibilityHideAfter: 'Nascondi dopo',
    messageVisibilitySeconds: 'secondi',
    emotesTitle: 'Emote di terze parti',
    emotesHelp:
      'Mostra emote extra di 7TV e BetterTTV nella chat Twitch. I cataloghi vengono scaricati una volta e restano in cache.',
    emotesSeventvLabel: '7TV',
    emotesBetterttvLabel: 'BetterTTV',
    emotesOn: 'Attivo',
    emotesOff: 'Disattivo',
    linkImagesTitle: 'Immagini e GIF',
    linkImagesHelp:
      'Quando qualcuno invia un link diretto a un immagine o GIF (.png, .jpg, .gif, .webp), il file appare in chat. Mostra anche le immagini dell estensione TWShot (upl:, img:, tnr:, ls:).',
    linkImagesLabel: 'Mostra immagini dai link',
    fontWeights: {
      300: 'Leggero',
      400: 'Normale',
      500: 'Medio',
      600: 'Semi-grassetto',
      700: 'Grassetto'
    }
  }
}

export function getConfigI18n(language: unknown): ConfigI18nText {
  return CONFIG_I18N[normalizeLanguage(language)]
}

const CHAT_SYSTEM_I18N = {
  'pt-BR': {
    connectLabel: 'CONEXAO',
    helpLabel: 'AJUDA',
    connecting: 'Conectando com o canal "{channel}"...',
    connected: 'Conectado ao chat de "{channel}"',
    channelNotFound: 'O canal {channel} nao foi encontrado',
    overlayHelp:
      'Para esconder/mostrar a janela use no Windows "Ctrl + Alt + A", Mac "CTRL + OPTION + A".'
  },
  'en-US': {
    connectLabel: 'CONNECTION',
    helpLabel: 'HELP',
    connecting: 'Connecting to channel "{channel}"...',
    connected: 'Connected to "{channel}" chat',
    channelNotFound: 'Channel {channel} was not found',
    overlayHelp: 'To hide/show the window use Windows "Ctrl + Alt + A", Mac "CTRL + OPTION + A".'
  },
  'es-ES': {
    connectLabel: 'CONEXION',
    helpLabel: 'AYUDA',
    connecting: 'Conectando al canal "{channel}"...',
    connected: 'Conectado al chat de "{channel}"',
    channelNotFound: 'No se encontro el canal {channel}',
    overlayHelp:
      'Para ocultar/mostrar la ventana usa en Windows "Ctrl + Alt + A", Mac "CTRL + OPTION + A".'
  },
  'fr-FR': {
    connectLabel: 'CONNEXION',
    helpLabel: 'AIDE',
    connecting: 'Connexion a la chaine "{channel}"...',
    connected: 'Connecte au chat de "{channel}"',
    channelNotFound: 'La chaine {channel} est introuvable',
    overlayHelp:
      'Pour masquer/afficher la fenetre utilisez Windows "Ctrl + Alt + A", Mac "CTRL + OPTION + A".'
  },
  'de-DE': {
    connectLabel: 'VERBINDUNG',
    helpLabel: 'HILFE',
    connecting: 'Verbinde mit Kanal "{channel}"...',
    connected: 'Mit Chat von "{channel}" verbunden',
    channelNotFound: 'Kanal {channel} wurde nicht gefunden',
    overlayHelp:
      'Zum Verstecken/Anzeigen des Fensters unter Windows "Ctrl + Alt + A", Mac "CTRL + OPTION + A".'
  },
  'it-IT': {
    connectLabel: 'CONNESSIONE',
    helpLabel: 'AIUTO',
    connecting: 'Connessione al canale "{channel}"...',
    connected: 'Connesso alla chat di "{channel}"',
    channelNotFound: 'Canale {channel} non trovato',
    overlayHelp:
      'Per nascondere/mostrare la finestra usa su Windows "Ctrl + Alt + A", Mac "CTRL + OPTION + A".'
  }
} as const

function formatTemplate(template: string, params: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_match, key) => params[key] ?? '')
}

export function getChatSystemText(
  language: unknown,
  key: keyof (typeof CHAT_SYSTEM_I18N)['pt-BR']
) {
  const selected = CHAT_SYSTEM_I18N[normalizeLanguage(language)]
  return selected[key]
}

export function getChatSystemTextWithParams(
  language: unknown,
  key: keyof (typeof CHAT_SYSTEM_I18N)['pt-BR'],
  params: Record<string, string>
) {
  return formatTemplate(getChatSystemText(language, key), params)
}

const UPDATE_I18N = {
  'pt-BR': {
    availableTitle: 'Atualização disponível',
    availableDescription: 'A versão {version} já pode ser baixada.',
    downloadingTitle: 'Baixando atualização',
    downloadingDescription: 'Isso pode levar alguns instantes.',
    readyTitle: 'Pronto para instalar',
    readyDescription: 'Reinicie o BooChat para aplicar a versão {version}.',
    errorTitle: 'Falha na atualização',
    downloadError: 'Não foi possível baixar a atualização.',
    installError: 'Não foi possível instalar a atualização.',
    downloadNow: 'Baixar',
    installNow: 'Reiniciar',
    later: 'Depois',
    retry: 'Tentar de novo'
  },
  'en-US': {
    availableTitle: 'Update available',
    availableDescription: 'Version {version} is ready to download.',
    downloadingTitle: 'Downloading update',
    downloadingDescription: 'This may take a moment.',
    readyTitle: 'Ready to install',
    readyDescription: 'Restart BooChat to apply version {version}.',
    errorTitle: 'Update failed',
    downloadError: 'Could not download the update.',
    installError: 'Could not install the update.',
    downloadNow: 'Download',
    installNow: 'Restart',
    later: 'Later',
    retry: 'Try again'
  },
  'es-ES': {
    availableTitle: 'Actualización disponible',
    availableDescription: 'La versión {version} ya se puede descargar.',
    downloadingTitle: 'Descargando actualización',
    downloadingDescription: 'Esto puede tardar un momento.',
    readyTitle: 'Lista para instalar',
    readyDescription: 'Reinicia BooChat para aplicar la versión {version}.',
    errorTitle: 'Error al actualizar',
    downloadError: 'No se pudo descargar la actualización.',
    installError: 'No se pudo instalar la actualización.',
    downloadNow: 'Descargar',
    installNow: 'Reiniciar',
    later: 'Después',
    retry: 'Reintentar'
  },
  'fr-FR': {
    availableTitle: 'Mise à jour disponible',
    availableDescription: 'La version {version} est prête à être téléchargée.',
    downloadingTitle: 'Téléchargement',
    downloadingDescription: 'Cela peut prendre quelques instants.',
    readyTitle: 'Prêt à installer',
    readyDescription: 'Redémarrez BooChat pour appliquer la version {version}.',
    errorTitle: 'Échec de la mise à jour',
    downloadError: 'Impossible de télécharger la mise à jour.',
    installError: "Impossible d'installer la mise à jour.",
    downloadNow: 'Télécharger',
    installNow: 'Redémarrer',
    later: 'Plus tard',
    retry: 'Réessayer'
  },
  'de-DE': {
    availableTitle: 'Update verfügbar',
    availableDescription: 'Version {version} kann jetzt heruntergeladen werden.',
    downloadingTitle: 'Update wird geladen',
    downloadingDescription: 'Das kann einen Moment dauern.',
    readyTitle: 'Bereit zur Installation',
    readyDescription: 'Starte BooChat neu, um Version {version} anzuwenden.',
    errorTitle: 'Update fehlgeschlagen',
    downloadError: 'Das Update konnte nicht geladen werden.',
    installError: 'Das Update konnte nicht installiert werden.',
    downloadNow: 'Laden',
    installNow: 'Neu starten',
    later: 'Später',
    retry: 'Erneut versuchen'
  },
  'it-IT': {
    availableTitle: 'Aggiornamento disponibile',
    availableDescription: 'La versione {version} è pronta per il download.',
    downloadingTitle: 'Download in corso',
    downloadingDescription: 'Potrebbe richiedere qualche istante.',
    readyTitle: "Pronto per l'installazione",
    readyDescription: 'Riavvia BooChat per applicare la versione {version}.',
    errorTitle: 'Aggiornamento non riuscito',
    downloadError: "Impossibile scaricare l'aggiornamento.",
    installError: "Impossibile installare l'aggiornamento.",
    downloadNow: 'Scarica',
    installNow: 'Riavvia',
    later: 'Dopo',
    retry: 'Riprova'
  }
} as const

export function getUpdateI18n(language: unknown) {
  return UPDATE_I18N[normalizeLanguage(language)]
}
