import baileys from '@whiskeysockets/baileys'
import fs from 'fs'
import path from 'path'

const {
  proto,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  downloadContentFromMessage,
  areJidsSameUser,
  jidDecode
} = baileys

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
    let msg = copy.message[mtype]
    if (typeof msg === 'string') copy.message[mtype] = text || msg
    else if (msg.caption) msg.caption = text || msg.caption
    else if (msg.text) msg.text = text || msg.text
    if (typeof msg !== 'string') {
      copy.message[mtype] = { ...msg, ...options }
      copy.message[mtype].contextInfo = { ...(msg.contextInfo || {}), mentionedJid: options.mentions || msg.contextInfo?.mentionedJid || [] }
    }
    copy.key.remoteJid = jid
    copy.key.fromMe = areJidsSameUser((sender || ''), this.user?.id)
    return proto.WebMessageInfo.fromObject(copy)
  }
  if (!conn.copyNForward) conn.copyNForward = async function (jid, message, forwardingScore = true, options = {}) {
    let content = generateForwardMessageContent(message, !!forwardingScore)
    let ctype = Object.keys(content)[0]
    content[ctype].contextInfo = { ...(message.message?.[Object.keys(message.message || {})[0]]?.contextInfo || {}), ...(content[ctype].contextInfo || {}) }
    if (forwardingScore && typeof forwardingScore === 'number' && forwardingScore > 1) content[ctype].contextInfo.forwardingScore += forwardingScore
    let gen = generateWAMessageFromContent(jid, content, { ...options, userJid: this.user?.jid })
    await this.relayMessage(jid, gen.message, { messageId: gen.key.id, additionalAttributes: { ...options } })
    return gen
  }
  return conn
}

export function extractMessage(message) {
  if (!message) return null
  if (message.ephemeralMessage?.message) return extractMessage(message.ephemeralMessage.message)
  if (message.viewOnceMessage?.message) return extractMessage(message.viewOnceMessage.message)
  if (message.viewOnceMessageV2?.message) return extractMessage(message.viewOnceMessageV2.message)
  if (message.documentWithCaptionMessage?.message) return extractMessage(message.documentWithCaptionMessage.message)
  return message
}

export function smsg(conn, m) {
  if (!m) return m
  m = proto.WebMessageInfo.fromObject(m)
  m.conn = conn
  Object.defineProperties(m, {
    id: { get() { return this.key?.id }, enumerable: true },
    chat: { get() { const g = this.message?.senderKeyDistributionMessage?.groupId; return (this.key?.remoteJid || (g && g !== 'status@broadcast' && g) || '').trim() }, enumerable: true },
    isGroup: { get() { return (this.chat || '').endsWith('@g.us') }, enumerable: true },
    sender: { get() { return this.conn?.decodeJid(this.key?.fromMe && this.conn?.user?.id || this.participant || this.key?.participant || this.chat || '') }, enumerable: true },
    fromMe: { get() { return this.key?.fromMe || areJidsSameUser(this.conn?.user?.id, this.sender) || false }, enumerable: true },
    mtype: { get() { if (!this.message) return ''; const t = Object.keys(this.message); return (!['senderKeyDistributionMessage','messageContextInfo'].includes(t[0]) && t[0]) || (t.length >= 3 && t[1] !== 'messageContextInfo' && t[1]) || t[t.length - 1] }, enumerable: true },
    msg: { get() { if (!this.message) return null; return this.message[this.mtype] }, enumerable: true },
    mediaMessage: { get() { if (!this.message) return null; const base = (this.msg?.url || this.msg?.directPath) ? { ...this.message } : extractMessage(this.message); if (!base) return null; const k = Object.keys(base)[0]; return ['imageMessage','videoMessage','audioMessage','stickerMessage','documentMessage'].includes(k) ? base : null }, enumerable: true },
    mediaType: { get() { const mm = this.mediaMessage; return mm ? Object.keys(mm)[0] : null }, enumerable: true },
    mentionedJid: { get() { return this.msg?.contextInfo?.mentionedJid || [] }, enumerable: true },
    text: { get() { const m = this.msg; const t = typeof m === 'string' ? m : m?.text || m?.caption || m?.conversation || m?.contentText || m?.selectedDisplayText || ''; if (typeof this._text === 'string') return this._text; return t || m?.title || '' }, set(v) { this._text = v }, enumerable: true },
    quoted: { get() {
      const self = this
      const ctx = self.msg?.contextInfo
      const quoted = ctx?.quotedMessage
      if (!quoted) return null
      const type = Object.keys(quoted)[0]
      let q = quoted[type]
      const wrap = JSON.parse(JSON.stringify(typeof q === 'string' ? { text: q } : q))
      return Object.defineProperties(wrap, {
        mtype: { get() { return type }, enumerable: true },
        id: { get() { return ctx.stanzaId }, enumerable: true },
        chat: { get() { return ctx.remoteJid || self.chat }, enumerable: true },
        sender: { get() { return self.conn?.decodeJid(ctx.participant || this.chat || '') }, enumerable: true },
        fromMe: { get() { return areJidsSameUser(this.sender, self.conn?.user?.jid) }, enumerable: true },
        text: { get() { return wrap.text || wrap.caption || (type === 'conversation' ? q : '') || '' }, enumerable: true },
        mediaMessage: { get() { const base = (q?.url || q?.directPath) ? { [type]: q } : extractMessage(quoted); if (!base) return null; const k = Object.keys(base)[0]; return ['imageMessage','videoMessage','audioMessage','stickerMessage','documentMessage'].includes(k) ? base : null }, enumerable: true },
        mediaType: { get() { const mm = this.mediaMessage; return mm ? Object.keys(mm)[0] : null }, enumerable: true },
        vM: { get() { return proto.WebMessageInfo.fromObject({ key: { fromMe: this.fromMe, remoteJid: this.chat, id: this.id }, message: quoted, ...(self.isGroup ? { participant: this.sender } : {}) }) } },
        reply: { value(text, chatId, options) { return self.conn?.sendMessage(chatId || this.chat, { text, ...options }, { quoted: self }) }, enumerable: true },
        download: { value(saveToFile = false) { const mt = this.mediaType; return self.conn?.downloadM(this.mediaMessage?.[mt], mt?.replace(/message/i, ''), saveToFile) }, enumerable: true },
        copy: { value() { const W = proto.WebMessageInfo; return smsg(self.conn, W.fromObject(W.toObject(this.vM))) }, enumerable: true },
        forward: { value(jid, force = false, options) { return self.conn?.sendMessage(jid, { forward: this.vM, force, ...options }, { ...options }) }, enumerable: true },
        copyNForward: { value(jid, forceForward = false, options) { return self.conn?.copyNForward(jid, this.vM, forceForward, options) }, enumerable: true },
        cMod: { value(jid, text = '', sender = this.sender, options = {}) { return self.conn?.cMod(jid, this.vM, text, sender, options) }, enumerable: true },
        delete: { value() { return self.conn?.sendMessage(this.chat, { delete: this.vM.key }) }, enumerable: true },
        react: { value(emoji) { return self.conn?.sendMessage(this.chat, { react: { text: emoji, key: this.vM.key } }) }, enumerable: true }
      })
    }, enumerable: true },
    reply: { value(text, chatId, options) { return this.conn?.sendMessage(chatId || this.chat, { text, ...options }, { quoted: this }) }, enumerable: true },
    download: { value(saveToFile = false) { const mt = this.mediaType; return this.conn?.downloadM(this.mediaMessage?.[mt], mt?.replace(/message/i, ''), saveToFile) }, enumerable: true },
    forward: { value(jid, force = false, options = {}) { return this.conn?.sendMessage(jid, { forward: this, force, ...options }, { ...options }) }, enumerable: true },
    copyNForward: { value(jid, forceForward = false, options = {}) { return this.conn?.copyNForward(jid, this, forceForward, options) }, enumerable: true },
    cMod: { value(jid, text = '', sender = this.sender, options = {}) { return this.conn?.cMod(jid, this, text, sender, options) }, enumerable: true },
    delete: { value() { return this.conn?.sendMessage(this.chat, { delete: this.key }) }, enumerable: true },
    react: { value(emoji) { return this.conn?.sendMessage(this.chat, { react: { text: emoji, key: this.key } }) }, enumerable: true }
  })
  return m
}

export function serialize(conn, m) {
  return smsg(conn, m)
}
