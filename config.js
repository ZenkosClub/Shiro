import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'

global.owner = [
  ['51942501966', 'Mateo', true],
  ['51901437507', 'Sunkovv', true],
]


global.ownerLid = [
  ['114263544885392', 'Sunkovv', true],
  ['78186205446362', 'Mateo', true],
]

global.sessions = 'Sessions'
global.bot = 'serbots' 
global.AFBots = true

global.namebot1 = 'Shiro'
global.namebot2 = 'Shiro'

global.ch = {
ch1: '120363403143798163@newsletter',
}

global.mods = []
global.prems = []

global.multiplier = 69 
global.maxwarn = '2'

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
