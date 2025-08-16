const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = (await import("@whiskeysockets/baileys"))
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from "pino"
import chalk from "chalk"
import util from "util"
import * as ws from "ws"
const { child, spawn, exec } = await import("child_process")
const { CONNECTING } = ws
import { makeWASocket } from "../lib/simple.js"
import { fileURLToPath } from "url"

let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = ""
let drm2 = ""

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const AYBotOptions = {}

if (!(global.conns instanceof Array)) global.conns = []

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  let time = global.db.data.users[m.sender].Subs + 120000
  const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
  const subBotsCount = subBots.length

  if (subBotsCount === 20) {
    return m.reply(`No se han encontrado espacios para *Sub-Bots* disponibles.`)
  }

  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  let id = `${who.split`@`[0]}`
  let pathAYBot = path.join(`./${bot}/`, id)
  if (!fs.existsSync(pathAYBot)) {
    fs.mkdirSync(pathAYBot, { recursive: true })
  }

  AYBotOptions.pathAYBot = pathAYBot
  AYBotOptions.m = m
  AYBotOptions.conn = conn
  AYBotOptions.args = args
  AYBotOptions.usedPrefix = usedPrefix
  AYBotOptions.command = command
  AYBotOptions.fromCommand = true

  AYBot(AYBotOptions)
  global.db.data.users[m.sender].Subs = new Date * 1
}

handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']
export default handler

export async function AYBot(options) {
  let { pathAYBot, m, conn, args, usedPrefix, command } = options
  if (command === 'code') {
    command = 'qr'
    args.unshift('code')
  }

  const mcode = args[0] && /(--code|code)/.test(args[0].trim()) ? true : args[1] && /(--code|code)/.test(args[1].trim()) ? true : false
  let txtCode, codeBot, txtQR

  if (mcode) {
    args[0] = args[0].replace(/^--code$|^code$/, "").trim()
    if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim()
    if (args[0] == "") args[0] = undefined
  }

  const pathCreds = path.join(pathAYBot, "creds.json")
  if (!fs.existsSync(pathAYBot)) {
    fs.mkdirSync(pathAYBot, { recursive: true })
  }

  try {
    args[0] && args[0] != undefined ? fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')) : ""
  } catch {
    return
  }

  const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
  exec(comb.toString("utf-8"), async (err, stdout, stderr) => {
    const drmer = Buffer.from(drm1 + drm2, "base64")
    let { version, isLatest } = await fetchLatestBaileysVersion()
    const msgRetry = (MessageRetryMap) => { }
    const msgRetryCache = new NodeCache()
    const { state, saveState, saveCreds } = await useMultiFileAuthState(pathAYBot)

    const connectionOptions = {
      logger: pino({ level: "fatal" }),
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
      },
      msgRetry,
      msgRetryCache,
      browser: mcode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Anya Forger (Sub Bot)', 'Chrome', '2.0.0'],
      version,
      generateHighQualityLinkPreview: true
    }

    let sock = makeWASocket(connectionOptions)
    sock.isInit = false
    let isInit = true

    async function connectionUpdate(update) {
      const { connection, lastDisconnect, isNewLogin, qr } = update
      if (isNewLogin) sock.isInit = false

      if (qr && !mcode) {
  let txt = `[ Escaneo de QR requerido ]\n\n`
  txt += `Más opciones (⋮)\n`
  txt += `Dispositivos vinculados\n`
  txt += `Vincular nuevo dispositivo\n`
  txt += `Escanear código QR\n\n`
  txt += `> Este código QR caduca en pocos segundos.`

  let sendQR = await conn.sendFile(m.chat, await qrcode.toDataURL(qr, { scale: 8 }), "qrcode.png", txt, m, null)

  setTimeout(() => {
    conn.sendMessage(m.chat, { delete: sendQR.key })
  }, 30000)

  return
  }

      if (qr && mcode) {
        let secret = await sock.requestPairingCode(m.sender.split`@`[0])
        secret = secret?.match(/.{1,4}/g)?.join("-") || secret
        let txt = `[ Vinculación requerida ]\n\n`
        txt += `Más opciones (⋮)\n`
        txt += `Dispositivos vinculados\n`
        txt += `Vincular nuevo dispositivo\n`
        txt += `Vincular usando número\n\n`
        txt += `> Este código es temporal y válido solo para el número solicitante.`
        let sendTxt = await conn.reply(m.chat, txt, m)
        let sendCode = await conn.reply(m.chat, secret, m)

        setTimeout(() => {
          conn.sendMessage(m.chat, { delete: sendTxt.key })
          conn.sendMessage(m.chat, { delete: sendCode.key })
        }, 30000)
      }

      const endSesion = async (loaded) => {
        if (!loaded) {
          try { sock.ws.close() } catch { }
          sock.ev.removeAllListeners()
          let i = global.conns.indexOf(sock)
          if (i >= 0) {
            delete global.conns[i]
            global.conns.splice(i, 1)
          }
        }
      }

      const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode

      if (connection === 'close') {
        if ([428, 408, 515].includes(reason)) {
          console.log(chalk.bold.magentaBright(`\n┆ Subbot (+${path.basename(pathAYBot)}) desconectado (${reason}). Intentando reconectar...\n`))
          await creloadHandler(true).catch(console.error)
        }

        if ([405, 401].includes(reason)) {
          console.log(chalk.bold.magentaBright(`\n┆ Sesión inválida o cerrada manualmente. (+${path.basename(pathAYBot)})\n`))
          fs.rmdirSync(pathAYBot, { recursive: true })
        }

        if (reason === 440 || reason === 403) {
          console.log(chalk.bold.magentaBright(`\n┆ Sesión reemplazada o en soporte. Eliminando carpeta...\n`))
          fs.rmdirSync(pathAYBot, { recursive: true })
        }

        if (reason === 500) {
          console.log(chalk.bold.magentaBright(`\n┆ Conexión perdida. Eliminando sesión...\n`))
          return creloadHandler(true).catch(console.error)
        }
      }

      if (global.db.data == null) loadDatabase()

      if (connection === 'open') {
        if (!global.db.data?.users) loadDatabase()
        let userName = sock.authState.creds.me.name || 'Sub'
        let userJid = sock.authState.creds.me.jid || `${path.basename(pathAYBot)}@s.whatsapp.net`

        console.log(chalk.bold.cyanBright(`\n${userName} (+${path.basename(pathAYBot)}) conectado exitosamente.`))
        sock.isInit = true
        global.conns.push(sock)
        await joinChannels(sock)
      }
    }

    setInterval(async () => {
      if (!sock.user) {
        try { sock.ws.close() } catch (e) { }
        sock.ev.removeAllListeners()
        let i = global.conns.indexOf(sock)
        if (i >= 0) {
          delete global.conns[i]
          global.conns.splice(i, 1)
        }
      }
    }, 60000)

    let handler = await import('../handler.js')
    let creloadHandler = async function (restatConn) {
      try {
        const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
        if (Object.keys(Handler || {}).length) handler = Handler
      } catch (e) {
        console.error('Nuevo error: ', e)
      }

      if (restatConn) {
        const oldChats = sock.chats
        try { sock.ws.close() } catch { }
        sock.ev.removeAllListeners()
        sock = makeWASocket(connectionOptions, { chats: oldChats })
        isInit = true
      }

      if (!isInit) {
        sock.ev.off("messages.upsert", sock.handler)
        sock.ev.off("connection.update", sock.connectionUpdate)
        sock.ev.off("creds.update", sock.credsUpdate)
      }

      sock.handler = handler.handler.bind(sock)
      sock.connectionUpdate = connectionUpdate.bind(sock)
      sock.credsUpdate = saveCreds.bind(sock, true)

      sock.ev.on("messages.upsert", sock.handler)
      sock.ev.on("connection.update", sock.connectionUpdate)
      sock.ev.on("creds.update", sock.credsUpdate)

      isInit = false
      return true
    }

    creloadHandler(false)
  })
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
      seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  hours = (hours < 10) ? '0' + hours : hours
  minutes = (minutes < 10) ? '0' + minutes : minutes
  seconds = (seconds < 10) ? '0' + seconds : seconds
  return minutes + ' m y ' + seconds + ' s '
}

async function joinChannels(conn) {
  for (const channelId of Object.values(global.ch)) {
    await conn.newsletterFollow(channelId).catch(() => {})
  }
}
