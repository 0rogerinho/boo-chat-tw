declare module '@pedrobef/vozz/g2p' {
  export function fonemizar(
    texto: string,
    opcoes?: { normalizar?: boolean; lexico?: Record<string, string> }
  ): string
}
