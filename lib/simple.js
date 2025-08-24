import {
  makeWASocket,
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  jidNormalizedUser,
  PHONENUMBER_MCC,
  makeInMemoryStore,
  proto,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  downloadContentFromMessage,
  areJidsSameUser,
  jidDecode
} from '@whiskeysockets/baileys'

import fs from 'fs'
import path from 'path'
import P from 'pino'

const logger = P({ level: 'silent' })
export { makeWASocket, DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState, jidNormalizedUser, PHONENUMBER_MCC, makeInMemoryStore, proto }

export function protoType() {
  const protoType = {}
  const serialize = (m, conn) => {
    if (!m) return m
    if (m.key) {
      m.id = m.key.id
      m.isBaileys = m.id && m.id.length === 16 || false
      m.chat = m.key.remoteJid
      m.fromMe = m.key.fromMe
      m.isGroup = m.chat.endsWith('@g.us')
      m.sender = m.fromMe ? conn.user.id : m.key.participant || m.chat
    }
    if (m.message) {
      m.mtype = Object.keys(m.message)[0]
      m.msg = m.message[m.mtype]
      if (m.mtype === 'viewOnceMessageV2') {
        m.msg = m.message[m.mtype].message[Object.keys(m.message[m.mtype].message)[0]]
        m.mtype = Object.keys(m.message[m.mtype].message)[0]
      }
      m.text = m.msg?.text || m.msg?.conversation || m.msg?.caption || m.msg?.contentText || m.msg?.selectedDisplayText || m.msg?.title || ''
    }
    m.reply = (text, chatId = m.chat) => conn.sendMessage(chatId, { text }, { quoted: m })
    return m
  }
  return { protoType, serialize }
}

export function attachConnHelpers(conn) {
  if (!conn) return conn
  if (!conn.decodeJid) conn.decodeJid = jid => {
    if (!jid || typeof jid !== 'string') return jid
    if (/:\d+@/gi.test(jid)) {
      const d = jidDecode(jid) || {}
      return d.user && d.server ? d.user + '@' + d.server : jid
    }
    return jid.trim()
  }
  if (!conn.getName) conn.getName = async function (jid = '', withoutContact = false) {
    jid = this.decodeJid(jid)
    let v
    if (jid.endsWith('@g.us')) {
      v = this.chats?.[jid] || {}
      if (!(v.name || v.subject)) try { v = await this.groupMetadata(jid) || {} } catch {}
      return v.name || v.subject || jid
    } else {
      v = jid === '0@s.whatsapp.net'
        ? { vname: 'WhatsApp' }
        : areJidsSameUser(jid, this.user?.id)
          ? this.user
          : (this.chats?.[jid] || {})
      return (withoutContact ? '' : v.name) || v.subject || v.vname || v.notify || jid
    }
  }
  if (!conn.parseMention) conn.parseMention = text => [...(text || '').matchAll(/@([0-9]{5,16}|0)/g)].map(v => v[1] + '@s.whatsapp.net')
  if (!conn.reply) conn.reply = function (jid, text = '', quoted, options = {}) { return this.sendMessage(jid, { text, ...options }, { quoted, ...options }) }
  if (!conn.downloadM) conn.downloadM = async function (m, type, saveToFile = false) {
    if (!m) return Buffer.alloc(0)
    const stream = await downloadContentFromMessage(m, type)
    let buffer = Buffer.from([])
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
    if (!saveToFile) return buffer
    const dir = path.join(process.cwd(), 'tmp')
    try { fs.mkdirSync(dir, { recursive: true }) } catch {}
    const file = path.join(dir, Date.now() + '.' + type)
    fs.writeFileSync(file, buffer)
    return file
  }
  if (!conn.cMod) conn.cMod = function (jid, message, text = '', sender = this.user?.jid, options = {}) {
    let copy = proto.WebMessageInfo.fromObject(JSON.parse(JSON.stringify(message)))
    let mtype = Object.keys(copy.message || {})[0]
    if (!mtype) return message
    let msg =
