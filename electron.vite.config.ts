import path from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

const aliases = [
  { find: '@', replacement: 'src' },
  { find: '@components', replacement: 'src/components' },
  { find: '@context', replacement: 'src/context' },
  { find: '@hooks', replacement: 'src/hooks' },
  { find: '@lib', replacement: 'src/lib' },
  { find: '@page', replacement: 'src/page' },
  { find: '@utils', replacement: 'src/utils' }
]

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: aliases.map(({ find, replacement }) => ({
        find,
        replacement: path.resolve(__dirname, replacement)
      }))
    },
    plugins: [react()]
  }
})
