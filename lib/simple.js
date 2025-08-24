import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'

const {
  default: _makeWaSocket,
  proto,
  downloadContentFromMessage
} = (await import('@whiskeysockets/baileys')).default

async function streamToBuffer(stream) {
  const chunks = []
  for await (const chunk of stream) chunks.push(chunk)
  return Buffer.concat(chunks)
}

function cleanJid(jid) {
  if (!jid) return jid
  if (jid.includes('@lid')) return jid
  return jid.replace(/:\d+/, '') + '@s.whatsapp.net'
}

async function defaultContextInfo(caption, conn) {
  return {
    mentionedJid: await conn.parseMention(caption),
    isForwarded: true,
    forwardingScore: 1
  }
}

export async function smsg(conn, m) {
  if (!m) return m

  if (!m.mentionedJid) m.mentionedJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []

  if (!m.quoted && m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
    const ctx = m.message.extendedTextMessage.contextInfo
    const quotedMessage = {
      key: {
        id: ctx.stanzaId,
        fromMe: ctx.participant === conn.user?.jid,
        remoteJid: m.chat,
        participant: ctx.participant
      },
      message: ctx.quotedMessage,
      messageTimestamp: m.messageTimestamp,
      participant: ctx.participant,
      sender: ctx.participant,
      chat: m.chat
    }
    m.quoted = {
      ...quotedMessage,
      download: () => downloadContentFromMessage(quotedMessage, 'buffer')
    }
  }

  if (m.key) {
    m.id = m.key.id
    m.chat = m.key.remoteJid
    m.fromMe = m.key.fromMe
    m.isGroup = m.chat?.endsWith('@g.us') || false

    let senderJid = m.fromMe ? conn.user.id : m.key.participant || m.key.remoteJid
    m.sender = senderJid.endsWith('@lid') ? senderJid : cleanJid(senderJid)
    m.who = m.mentionedJid?.[0] || (m.fromMe ? conn.user.id : m.sender)

    m.pp = await conn.profilePictureUrl(m.who, 'image').catch(_ => 'https://telegra.ph/file/33bed21a0eaa789852c30.jpg')

    if (m.isGroup) {
      try {
        const metadata = await conn.groupMetadata(m.chat)
        const participants = metadata.participants || []
        m.isAdmin = participants.some(p => p.id === m.sender && ['admin','superadmin'].includes(p.admin))
        m.isBotAdmin = participants.some(p => p.id === conn.user?.id.replace(/:\d+@/, "@") && ['admin','superadmin'].includes(p.admin))
      } catch {
        m.isAdmin = false
        m.isBotAdmin = false
      }
    }
  }

  m.download = async () => {
    const messageContent = m.message || m.quoted?.message
    if (!messageContent) throw new Error('No hay contenido para descargar')
    const type = Object.keys(messageContent)[0]
    const stream = await downloadContentFromMessage(messageContent[type], type.includes('image') ? 'image' : type.includes('video') ? 'video' : 'document')
    return await streamToBuffer(stream)
  }

  conn.decodeJid = (jid) => {
    if (!jid) return jid
    if (jid.endsWith('@lid')) return jid
    if (/:\d+@/i.test(jid)) return jid.split(':')[0] + '@s.whatsapp.net'
    return jid
  }

  conn.getName = async (jid, withoutContact = false, m = null) => {
    if (!jid) return null
    jid = conn.decodeJid ? conn.decodeJid(jid) : jid
    try {
      if (jid.endsWith('@g.us')) {
        const metadata = await conn.groupMetadata(jid)
        return metadata.subject || (withoutContact ? null : jid.split('@')[0])
      } else {
        if (jid === '0@s.whatsapp.net') return 'WhatsApp'
        if (conn.user?.jid && jid === conn.user.jid) return conn.user.name || jid.split('@')[0]
        if (m?.pushName && m.sender === jid) return m.pushName
        return jid.split('@')[0]
      }
    } catch {
      return jid.split('@')[0]
    }
  }

  conn.parseMention = async (text = '') => {
    if (typeof text !== 'string') return []
    return [...text.matchAll(/@([0-9]{5,15})/g)].map(m => `${m[1]}@s.whatsapp.net`)
  }

  conn.reply = async (jid, text, quoted = null, options = {}) => {
    const contextInfo = options.contextInfo ?? await defaultContextInfo(text, conn)
    return conn.sendMessage(jid, { text, contextInfo }, { quoted, ...options })
  }

  Array.prototype.getRandom = function () { return this[Math.floor(Math.random() * this.length)] }

  return m
}
