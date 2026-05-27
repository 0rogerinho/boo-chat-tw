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
  languageLabel: string
  languageHelp: string
  twitchChannelLabel: string
  kickChannelLabel: string
  youtubeChannelLabel: string
  channelPlaceholder: string
  youtubePlaceholder: string
  fontTitle: string
  fontSizeLabel: string
  fontWeightLabel: string
  bgTitle: string
  bgDescription: string
  bgPlaceholder: string
  soundTitle: string
  soundDescription: string
  soundVolumeLabel: string
  mutedLabel: string
  maxLabel: string
  testSound: string
  ignoreBotsTitle: string
  ignoreBotsDescription: string
  ignoreBotsAriaLabel: string
  ignoreBotsPlaceholderEmpty: string
  ignoreBotsPlaceholderAdd: string
  removeBotAriaPrefix: string
  cancel: string
  save: string
  saving: string
  fontWeights: Record<number, string>
}

const CONFIG_I18N: Record<AppLanguageCode, ConfigI18nText> = {
  'pt-BR': {
    languageLabel: 'Idioma do aplicativo',
    languageHelp: 'Escolha o idioma da interface.',
    twitchChannelLabel: 'Nome do canal da Twitch',
    kickChannelLabel: 'Nome do canal da Kick',
    youtubeChannelLabel: 'Nome do canal do YouTube',
    channelPlaceholder: 'Digite o nome do canal ex: devrogerinho',
    youtubePlaceholder: 'Ex: @OCodigodoRogerinho ou https://youtube.com/watch?v=...',
    fontTitle: 'Configuracoes de Fonte',
    fontSizeLabel: 'Tamanho da fonte',
    fontWeightLabel: 'Espessura da fonte',
    bgTitle: 'Configuracoes de Fundo',
    bgDescription: 'Adicione uma cor para o fundo do texto para deixar mais visivel.',
    bgPlaceholder: 'Codigo hexadecimal ou deixe vazio',
    soundTitle: 'Som ao receber mensagem',
    soundDescription:
      'Toca um alerta quando chegar mensagem nova do chat (Twitch, Kick ou YouTube).',
    soundVolumeLabel: 'Volume / intensidade',
    mutedLabel: 'Mudo',
    maxLabel: 'Maximo',
    testSound: 'Testar som',
    ignoreBotsTitle: 'Ignorar bots',
    ignoreBotsDescription:
      'Digite um nome e pressione Enter, virgula ou espaco para criar uma tag.',
    ignoreBotsAriaLabel: 'Nomes de bots a ignorar',
    ignoreBotsPlaceholderEmpty: 'Digite um bot e pressione Enter...',
    ignoreBotsPlaceholderAdd: 'Adicionar outro...',
    removeBotAriaPrefix: 'Remover',
    cancel: 'Cancelar',
    save: 'Salvar',
    saving: 'Salvando...',
    fontWeights: {
      300: 'Leve',
      400: 'Normal',
      500: 'Medio',
      600: 'Semi-negrito',
      700: 'Negrito'
    }
  },
  'en-US': {
    languageLabel: 'App language',
    languageHelp: 'Choose the interface language.',
    twitchChannelLabel: 'Twitch channel name',
    kickChannelLabel: 'Kick channel name',
    youtubeChannelLabel: 'YouTube channel name',
    channelPlaceholder: 'Enter the channel name, e.g. devrogerinho',
    youtubePlaceholder: 'E.g. @YourChannel or https://youtube.com/watch?v=...',
    fontTitle: 'Font settings',
    fontSizeLabel: 'Font size',
    fontWeightLabel: 'Font weight',
    bgTitle: 'Background settings',
    bgDescription: 'Add a background color behind messages to improve contrast.',
    bgPlaceholder: 'Hex color code or leave empty',
    soundTitle: 'Message notification sound',
    soundDescription: 'Play a notification for new chat messages (Twitch, Kick, or YouTube).',
    soundVolumeLabel: 'Volume / intensity',
    mutedLabel: 'Muted',
    maxLabel: 'Maximum',
    testSound: 'Test sound',
    ignoreBotsTitle: 'Ignore bots',
    ignoreBotsDescription: 'Type a name and press Enter, comma, or space to create a tag.',
    ignoreBotsAriaLabel: 'Bot names to ignore',
    ignoreBotsPlaceholderEmpty: 'Type a bot and press Enter...',
    ignoreBotsPlaceholderAdd: 'Add another...',
    removeBotAriaPrefix: 'Remove',
    cancel: 'Cancel',
    save: 'Save',
    saving: 'Saving...',
    fontWeights: {
      300: 'Light',
      400: 'Regular',
      500: 'Medium',
      600: 'Semi-bold',
      700: 'Bold'
    }
  },
  'es-ES': {
    languageLabel: 'Idioma de la aplicacion',
    languageHelp: 'Elige el idioma de la interfaz.',
    twitchChannelLabel: 'Nombre del canal de Twitch',
    kickChannelLabel: 'Nombre del canal de Kick',
    youtubeChannelLabel: 'Nombre del canal de YouTube',
    channelPlaceholder: 'Escribe el nombre del canal, ej: devrogerinho',
    youtubePlaceholder: 'Ej: @TuCanal o https://youtube.com/watch?v=...',
    fontTitle: 'Configuracion de fuente',
    fontSizeLabel: 'Tamano de fuente',
    fontWeightLabel: 'Grosor de fuente',
    bgTitle: 'Configuracion de fondo',
    bgDescription: 'Agrega un color de fondo para mejorar el contraste del texto.',
    bgPlaceholder: 'Codigo hexadecimal o dejalo vacio',
    soundTitle: 'Sonido al recibir mensaje',
    soundDescription:
      'Reproduce una alerta cuando llega un mensaje nuevo del chat (Twitch, Kick o YouTube).',
    soundVolumeLabel: 'Volumen / intensidad',
    mutedLabel: 'Silencio',
    maxLabel: 'Maximo',
    testSound: 'Probar sonido',
    ignoreBotsTitle: 'Ignorar bots',
    ignoreBotsDescription:
      'Escribe un nombre y presiona Enter, coma o espacio para crear una etiqueta.',
    ignoreBotsAriaLabel: 'Nombres de bots para ignorar',
    ignoreBotsPlaceholderEmpty: 'Escribe un bot y presiona Enter...',
    ignoreBotsPlaceholderAdd: 'Agregar otro...',
    removeBotAriaPrefix: 'Quitar',
    cancel: 'Cancelar',
    save: 'Guardar',
    saving: 'Guardando...',
    fontWeights: {
      300: 'Ligera',
      400: 'Normal',
      500: 'Media',
      600: 'Semi-negrita',
      700: 'Negrita'
    }
  },
  'fr-FR': {
    languageLabel: "Langue de l'application",
    languageHelp: "Choisissez la langue de l'interface.",
    twitchChannelLabel: 'Nom de la chaine Twitch',
    kickChannelLabel: 'Nom de la chaine Kick',
    youtubeChannelLabel: 'Nom de la chaine YouTube',
    channelPlaceholder: 'Entrez le nom de la chaine, ex: devrogerinho',
    youtubePlaceholder: 'Ex: @VotreChaine ou https://youtube.com/watch?v=...',
    fontTitle: 'Parametres de police',
    fontSizeLabel: 'Taille de police',
    fontWeightLabel: 'Epaisseur de police',
    bgTitle: 'Parametres de fond',
    bgDescription: 'Ajoutez une couleur de fond pour ameliorer le contraste du texte.',
    bgPlaceholder: 'Code hexadecimal ou laissez vide',
    soundTitle: 'Son a la reception de message',
    soundDescription: 'Joue une alerte quand un nouveau message arrive (Twitch, Kick ou YouTube).',
    soundVolumeLabel: 'Volume / intensite',
    mutedLabel: 'Muet',
    maxLabel: 'Maximum',
    testSound: 'Tester le son',
    ignoreBotsTitle: 'Ignorer les bots',
    ignoreBotsDescription:
      'Tapez un nom et appuyez sur Entree, virgule ou espace pour creer une etiquette.',
    ignoreBotsAriaLabel: 'Noms de bots a ignorer',
    ignoreBotsPlaceholderEmpty: 'Tapez un bot et appuyez sur Entree...',
    ignoreBotsPlaceholderAdd: 'Ajouter un autre...',
    removeBotAriaPrefix: 'Retirer',
    cancel: 'Annuler',
    save: 'Enregistrer',
    saving: 'Enregistrement...',
    fontWeights: {
      300: 'Legere',
      400: 'Normale',
      500: 'Moyenne',
      600: 'Semi-grasse',
      700: 'Grasse'
    }
  },
  'de-DE': {
    languageLabel: 'App-Sprache',
    languageHelp: 'Waehle die Sprache der Benutzeroberflaeche.',
    twitchChannelLabel: 'Twitch-Kanalname',
    kickChannelLabel: 'Kick-Kanalname',
    youtubeChannelLabel: 'YouTube-Kanalname',
    channelPlaceholder: 'Kanalnamen eingeben, z. B. devrogerinho',
    youtubePlaceholder: 'Z. B. @DeinKanal oder https://youtube.com/watch?v=...',
    fontTitle: 'Schrift-Einstellungen',
    fontSizeLabel: 'Schriftgroesse',
    fontWeightLabel: 'Schriftstaerke',
    bgTitle: 'Hintergrund-Einstellungen',
    bgDescription: 'Fuege eine Hintergrundfarbe hinzu, um den Kontrast zu verbessern.',
    bgPlaceholder: 'Hex-Farbcode oder leer lassen',
    soundTitle: 'Ton bei neuer Nachricht',
    soundDescription: 'Spielt einen Alarm bei neuen Chat-Nachrichten (Twitch, Kick oder YouTube).',
    soundVolumeLabel: 'Lautstaerke / Intensitaet',
    mutedLabel: 'Stumm',
    maxLabel: 'Maximum',
    testSound: 'Sound testen',
    ignoreBotsTitle: 'Bots ignorieren',
    ignoreBotsDescription:
      'Namen eingeben und Enter, Komma oder Leerzeichen druecken, um ein Tag zu erstellen.',
    ignoreBotsAriaLabel: 'Zu ignorierende Bot-Namen',
    ignoreBotsPlaceholderEmpty: 'Bot eingeben und Enter druecken...',
    ignoreBotsPlaceholderAdd: 'Weiteren hinzufuegen...',
    removeBotAriaPrefix: 'Entfernen',
    cancel: 'Abbrechen',
    save: 'Speichern',
    saving: 'Wird gespeichert...',
    fontWeights: {
      300: 'Leicht',
      400: 'Normal',
      500: 'Mittel',
      600: 'Halbfett',
      700: 'Fett'
    }
  },
  'it-IT': {
    languageLabel: "Lingua dell'app",
    languageHelp: "Scegli la lingua dell'interfaccia.",
    twitchChannelLabel: 'Nome canale Twitch',
    kickChannelLabel: 'Nome canale Kick',
    youtubeChannelLabel: 'Nome canale YouTube',
    channelPlaceholder: 'Inserisci il nome canale, es: devrogerinho',
    youtubePlaceholder: 'Es: @IlTuoCanale o https://youtube.com/watch?v=...',
    fontTitle: 'Impostazioni carattere',
    fontSizeLabel: 'Dimensione carattere',
    fontWeightLabel: 'Spessore carattere',
    bgTitle: 'Impostazioni sfondo',
    bgDescription: 'Aggiungi un colore di sfondo per migliorare il contrasto del testo.',
    bgPlaceholder: 'Codice esadecimale o lascia vuoto',
    soundTitle: 'Suono alla ricezione messaggi',
    soundDescription:
      'Riproduce un avviso quando arriva un nuovo messaggio (Twitch, Kick o YouTube).',
    soundVolumeLabel: 'Volume / intensita',
    mutedLabel: 'Muto',
    maxLabel: 'Massimo',
    testSound: 'Testa suono',
    ignoreBotsTitle: 'Ignora bot',
    ignoreBotsDescription: 'Digita un nome e premi Invio, virgola o spazio per creare un tag.',
    ignoreBotsAriaLabel: 'Nomi bot da ignorare',
    ignoreBotsPlaceholderEmpty: 'Digita un bot e premi Invio...',
    ignoreBotsPlaceholderAdd: 'Aggiungi altro...',
    removeBotAriaPrefix: 'Rimuovi',
    cancel: 'Annulla',
    save: 'Salva',
    saving: 'Salvataggio...',
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
