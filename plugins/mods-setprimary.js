import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!global.conn || !global.conns) global.conns = []
  if (!args[0]) throw `✳️ Ingresa el número del SubBot.\n\n📌 Ejemplo:\n${usedPrefix + command} 51987654321`

  let numero = args[0].replace(/[^0-9]/g, '')
  let sessionDir = path.join('./serbots', numero)

  if (!fs.existsSync(sessionDir)) throw `⚠️ El número *${numero}* no corresponde a un SubBot válido (no existe la carpeta en ./serbots)`
  if (!fs.existsSync(path.join(sessionDir, 'creds.json'))) throw `⚠️ El número *${numero}* no corresponde a un SubBot válido (falta *creds.json*)`

  let mainDir = './sessions'
  if (!fs.existsSync(mainDir)) fs.mkdirSync(mainDir, { recursive: true })

  // mover creds.json a la carpeta principal
  let credsSrc = path.join(sessionDir, 'creds.json')
  let credsDest = path.join(mainDir, 'creds.json')

  fs.copyFileSync(credsSrc, credsDest)

  m.reply(`✅ El SubBot con número *${numero}* ahora es el **Principal**.`)

  // reiniciar la conexión principal con las credenciales nuevas
  setTimeout(async () => {
    try {
      if (global.conn) {
        try { await global.conn.ws.close() } catch {}
        global.conn = null
      }
      let { default: makeWASocket, useMultiFileAuthState } = await import('@whiskeysockets/baileys')
      let { state, saveCreds } = await useMultiFileAuthState(mainDir)

      let sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
      })
      sock.ev.on('creds.update', saveCreds)
      global.conn = sock
      m.reply(`♻️ Bot principal reiniciado con el SubBot *${numero}*.`)
    } catch (e) {
      m.reply(`❌ Error al reiniciar como principal:\n${e.message}`)
    }
  }, 2000)
}

handler.help = ['setprimary <número>']
handler.tags = ['owner']
handler.command = /^setprimary$/i

export default handler
