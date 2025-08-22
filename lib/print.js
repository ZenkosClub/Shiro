import { WAMessageStubType } from '@whiskeysockets/baileys'
import PhoneNumber from 'awesome-phonenumber'
import chalk from 'chalk'
import { watchFile } from 'fs'

const terminalImage = global.opts['img'] ? await import('terminal-image').then(m => m.default) : null
const urlRegex = (await import('url-regex-safe')).default({ strict: false })

export default async function printMessage(m, conn = { user: {} }) {
  if (m.messageStubType && !m.text && !m.mtype) return

  const timestamp = chalk.gray(new Date().toLocaleTimeString())
  const senderName = await conn.getName(m.sender)
  const userData = global.DATABASE?.data?.users?.[m.sender] || {}

  let img
  if (terminalImage) {
    try {
      if (/sticker|image/gi.test(m.mtype)) img = await terminalImage.buffer(await m.download())
    } catch (e) {
      console.error('Error generating image preview:', e)
    }
  }

  const filesize = calculateFileSize(m)
  logHeader(senderName, timestamp)

  if (img) console.log(img.trimEnd())

  if (typeof m.text === 'string' && m.text) {
    let log = await formatTextLog(m.text, m.mentionedJid, conn)
    console.log(log)
  }

  if (Array.isArray(m.messageStubParameters) && m.messageStubParameters.length > 0) {
    await logStubParameters(m.messageStubParameters, conn)
  }

  logMessageType(m)
  console.log()
}

function calculateFileSize(m) {
  if (!m.msg) return m.text?.length || 0
  const msg = m.msg
  return msg.vcard?.length
    || msg.fileLength?.low || msg.fileLength
    || msg.axolotlSenderKeyDistributionMessage?.length
    || m.text?.length
    || 0
}

function logHeader(senderName, timestamp) {
  const gradientTitle = chalk.hex('#ff6b81').bold('Shiro') + chalk.hex('#48dbfb').bold(' Bot')
  console.log(`${gradientTitle} ${chalk.cyan('Mensaje de')} ${chalk.yellow(senderName || 'Sistema')} ${timestamp}`)
}

async function formatTextLog(text, mentionedJid = [], conn) {
  let log = text.replace(/\u200e+/g, '')

  const mdRegex = /(?<=(?:^|[\s\n])\S?)(?:([*_~])(.+?)\1|```((?:.||[\n\r])+?)```)(?=\S?(?:[\s\n]|$))/g
  const mdFormat = (depth = 4) => (_, type, t, monospace) => {
    const types = { _: 'italic', '*': 'bold', '~': 'strikethrough' }
    const content = t || monospace
    return (!types[type] || depth < 1) ? content : chalk[types[type]](content.replace(mdRegex, mdFormat(depth - 1)))
  }

  if (log.length < 4096) {
    log = log.replace(urlRegex, (url, i, text) => {
      const end = url.length + i
      return i === 0 || end === text.length || (/^\s$/.test(text[end]) && /^\s$/.test(text[i - 1]))
        ? chalk.blueBright(url)
        : url
    })
  }

  log = log.replace(mdRegex, mdFormat(4))

  for (const user of mentionedJid) {
    const jid = typeof user === 'string' ? user : (user.jid || user.lid || user.id || '')
    if (!jid) continue
    const username = await conn.getName(jid)
    log = log.replace(`@${jid.split('@')[0]}`, chalk.magentaBright(`@${username}`))
  }

  return log
}

async function logStubParameters(params, conn) {
  const processed = await Promise.all(params.map(async (jid) => {
    if (!jid) return ''
    try {
      const decodedJid = conn.decodeJid(jid)
      const name = await conn.getName(decodedJid) || ''
      const phone = decodedJid.replace('@s.whatsapp.net', '')
      let formatted = phone
      try { formatted = PhoneNumber('+' + phone).getNumber('international') || phone } catch {}
      return chalk.gray(`${formatted}${name ? ' ~' + name : ''}`)
    } catch (err) {
      console.error('Error processing messageStubParameter:', err)
      return ''
    }
  }))
  const filtered = processed.filter(Boolean)
  if (filtered.length) console.log(filtered.join(', '))
}

function logMessageType(m) {
  const msg = m.msg || {}
  if (/document/i.test(m.mtype)) console.log(chalk.cyan(`📄 ${msg.fileName || msg.displayName || 'Document'}`))
  else if (/ContactsArray/i.test(m.mtype)) console.log(chalk.green(`👨‍👩‍👧‍👦 Contacts Array`))
  else if (/contact/i.test(m.mtype)) console.log(chalk.green(`👨 ${msg.displayName || ''}`))
  else if (/audio/i.test(m.mtype)) {
    const dur = msg.seconds || 0
    console.log(chalk.yellow(`${msg.ptt ? '🎤 (PTT ' : '🎵 ('}AUDIO) ${String(Math.floor(dur/60)).padStart(2,'0')}:${String(dur%60).padStart(2,'0')}`))
  }
}

const file = global.__filename(import.meta.url)
watchFile(file, () => console.log(chalk.redBright("Update 'lib/print.js'")))
