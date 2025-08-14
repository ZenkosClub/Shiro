import { WAMessageStubType } from '@whiskeysockets/baileys'
import PhoneNumber from 'awesome-phonenumber'
import chalk from 'chalk'
import { watchFile } from 'fs'

const terminalImage = global.opts['img'] ? require('terminal-image') : ''
const urlRegex = (await import('url-regex-safe')).default({ strict: false })

export default async function (m, conn = { user: {} }) {
  
  if (m.messageStubType && !m.text && !m.mtype) {
    return
  }
  
  let _name = await conn.getName(m.sender)
  let chat = await conn.getName(m.chat)
  let img
  try {
    if (global.opts['img'])
      img = /sticker|image/gi.test(m.mtype) ? await terminalImage.buffer(await m.download()) : false
  } catch (e) {
    console.error(e)
  }
  let filesize = (m.msg ?
    m.msg.vcard ?
      m.msg.vcard.length :
      m.msg.fileLength ?
        m.msg.fileLength.low || m.msg.fileLength :
        m.msg.axolotlSenderKeyDistributionMessage ?
          m.msg.axolotlSenderKeyDistributionMessage.length :
          m.text ?
            m.text.length :
            0
    : m.text ? m.text.length : 0) || 0
  let user = global.DATABASE.data.users[m.sender]

  
  if (_name || m.text || m.mtype) {
    console.log(
      chalk.blue.bgCyan.bold('KIYOMI MD'),
      chalk.blue('Mensaje'),
      chalk.blue('de'),
      chalk.blue(`${_name || 'Sistema'}`)
      //chalk.white(`: ${m.text || ''}`)
    )
  }

  if (img) console.log(img.trimEnd())

  if (typeof m.text === 'string' && m.text) {
    let log = m.text.replace(/\u200e+/g, '')
    let mdRegex = /(?<=(?:^|[\s\n])\S?)(?:([*_~])(.+?)\1|```((?:.||[\n\r])+?)```)(?=\S?(?:[\s\n]|$))/g
    let mdFormat = (depth = 4) => (_, type, text, monospace) => {
      let types = {
        _: 'italic',
        '*': 'bold',
        '~': 'strikethrough'
      }
      text = text || monospace
      let formatted = !types[type] || depth < 1 ? text : chalk[types[type]](text.replace(mdRegex, mdFormat(depth - 1)))
      return formatted
    }
    if (log.length < 4096)
      log = log.replace(urlRegex, (url, i, text) => {
        let end = url.length + i
        return i === 0 || end === text.length || (/^\s$/.test(text[end]) && /^\s$/.test(text[i - 1])) ? chalk.blueBright(url) : url
      })
    log = log.replace(mdRegex, mdFormat(4))
    
    if (m.mentionedJid) {
      for (const user of m.mentionedJid) {
        const userString = typeof user === 'string' ? user : (user.jid || user.lid || user.id || '')
        if (userString) {
          const username = await conn.getName(userString)
          log = log.replace('@' + userString.split('@')[0], chalk.blueBright('@' + username))
        }
      }
    }

  console.log(log)
  }

  if (m.messageStubParameters && m.messageStubParameters.length > 0) {
    const processedParams = m.messageStubParameters
      .map((jid) => {
        try {
          if (!jid || typeof jid !== 'string') return ''
          const decodedJid = conn.decodeJid(jid)
          if (!decodedJid) return ''
          const name = conn.getName(decodedJid) || ''
          const phoneNumber = decodedJid.replace('@s.whatsapp.net', '')
          let formattedNumber = ''
          try {
            formattedNumber = PhoneNumber('+' + phoneNumber).getNumber('international') || phoneNumber;
          } catch {
            formattedNumber = phoneNumber
          }
          return chalk.gray(formattedNumber + (name ? ' ~' + name : ''))
        } catch (error) {
          console.error('Error processing messageStubParameter:', error)
          return ''
        }
      })
      .filter(Boolean)
    
    if (processedParams.length > 0) {
      console.log(processedParams.join(', '))
    }
  }

  if (/document/i.test(m.mtype)) console.log(`📄 ${m.msg.fileName || m.msg.displayName || 'Document'}`)
  else if (/ContactsArray/i.test(m.mtype)) console.log(`👨‍👩‍👧‍👦 ${' ' || ''}`)
  else if (/contact/i.test(m.mtype)) console.log(`👨 ${m.msg.displayName || ''}`)
  else if (/audio/i.test(m.mtype)) {
    const duration = m.msg.seconds
    console.log(`${m.msg.ptt ? '🎤 (PTT ' : '🎵 ('}AUDIO) ${Math.floor(duration / 60).toString().padStart(2, 0)}:${(duration % 60).toString().padStart(2, 0)}`)
  }

  console.log()
}

let file = global.__filename(import.meta.url)
watchFile(file, () => {
  console.log(chalk.redBright("Update 'lib/print.js'"))
})
