import { join, dirname } from 'path'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { setupMaster, fork } from 'cluster'
import { watchFile, unwatchFile } from 'fs'
import figlet from 'figlet'
import gradient from 'gradient-string'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)

function printBanner(text, gradientColors = ['cyan','blue']) {
  const width = process.stdout.columns || 80
  const height = process.stdout.rows || 24
  let font = 'Standard'

  if (width < 50) font = 'Small'
  else if (width < 100) font = 'Standard'
  else font = 'Slant'

  const rendered = figlet.textSync(text, { font, width, horizontalLayout: 'default', verticalLayout: 'default' })
  const lines = rendered.split('\n')
  const paddingTop = Math.max(Math.floor((height - lines.length) / 2), 0)

  console.clear()
  console.log('\n'.repeat(paddingTop) + gradient(gradientColors)(rendered))
}

function renderBanners() {
  printBanner('Shiro', ['cyan','blue'])
  printBanner('WhatsApp Multi-Bot Engine', ['blue','white'])
}

renderBanners()

process.stdout.on('resize', () => {
  renderBanners()
})

let isWorking = false

async function launch(scripts) {
  if (isWorking) return
  isWorking = true

  for (const script of scripts) {
    const args = [join(__dirname, script), ...process.argv.slice(2)]
    setupMaster({ exec: args[0], args: args.slice(1) })
    let child = fork()
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
