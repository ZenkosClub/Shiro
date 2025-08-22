console.log('Inicializando Shiro...')

import { join, dirname } from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { setupMaster, fork } from 'cluster'
import { watchFile, unwatchFile } from 'fs'
import cfonts from 'cfonts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)

const fonts = ['block', 'simpleBlock', 'console', 'simple', 'small', 'tiny']

function autoFont(text, maxHeight = null) {
  const termWidth = process.stdout.columns || 80
  const termHeight = process.stdout.rows || 24
  const heightLimit = maxHeight || termHeight - 2

  for (let font of fonts) {
    try {
      const rendered = cfonts.render(text, { font, align: 'center', gradient: ['cyan','blue'], render: false })
      const lines = rendered.split('\n')
      const maxLine = Math.max(...lines.map(l => l.length))
      const totalLines = lines.length
      if (maxLine <= termWidth && totalLines <= heightLimit) return font
    } catch (e) {
      continue
    }
  }
  return 'tiny'
}

function printCfonts(text, gradient) {
  const font = autoFont(text)
  cfonts.say(text, {
    font,
    align: 'center',
    gradient,
    letterSpacing: 1,
    lineHeight: 1
  })
}

printCfonts('Shiro', ['cyan', 'blue'])
printCfonts('WhatsApp Multi-Bot Engine', ['blue', 'white'])

let isWorking = false

async function launch(scripts) {
  if (isWorking) return
  isWorking = true

  for (const script of scripts) {
    const args = [join(__dirname, script), ...process.argv.slice(2)]

    setupMaster({
      exec: args[0],
      args: args.slice(1),
    })

    const child = fork()

    child.on('exit', (code) => {
      isWorking = false
      launch(scripts)

      if (code === 0) return
      watchFile(args[0], () => {
        unwatchFile(args[0])
        launch(scripts)
      })
    })
  }
}

launch(['main.js'])
