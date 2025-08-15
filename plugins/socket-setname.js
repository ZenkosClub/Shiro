import fs from 'fs'
import path from 'path'
import { join } from 'path'

let handler = async (m, { conn, text }) => {
   const botActual = conn.user?.jid?.split('@')[0]?.replace(/\D/g, '')
const configPath = join('./serbots', botActual, 'config.json')

let names1 = global.namebot1 || 'Shiro'  
let names2 = global.namebot2 || 'Shiro'  

if (fs.existsSync(configPath)) {  
  try {  
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))  
    if (config.namesbot1) names1 = config.namesbot1  
    if (config.namesbot2) names2 = config.namesbot2  
  } catch {}  
}

   if (!text) {
    return conn.reply(m.chat, `《✩》Debes escribir un nombre válido. _Ejemplo:_ *#setbotname ${names1} / ${names2}*`, m)
  }
  
  const senderNumber = m.sender.replace(/[^0-9]/g, '')
  const botPath = path.join('./serbots', senderNumber)

  if (!fs.existsSync(botPath)) {
    return conn.reply(m.chat, `《✩》Solo el *socket* del dueño del número puede ejecutar este comando.`, m)
  }

  let name1 = '', name2 = ''

  if (text.includes('/')) {
    let parts = text.split('/').map(v => v.trim())
    name1 = parts[0] || ''
    name2 = parts[1] || ''
  } else {
    name1 = text.trim()
    name2 = name1
  }

  const configPathUser = path.join(botPath, 'config.json')
  let config = {}
  if (fs.existsSync(configPathUser)) {
    try {
      config = JSON.parse(fs.readFileSync(configPathUser))
    } catch {}
  }

  config.namesbot1 = name1
  config.namesbot2 = name2

  try {
    fs.writeFileSync(configPathUser, JSON.stringify(config, null, 2))
    return conn.reply(m.chat,`《✩》Se ha cambiado el nombre del bot a *${name1}* / *${name2}*`, m)
  } catch {}
}

handler.command = ['setbotname', 'setname']
handler.help = ['setbotname']
handler.tags = ['socket']
export default handler
