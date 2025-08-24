import baileys from '@whiskeysockets/baileys'

const {
  default: _makeWaSocket,
  makeWALegacySocket,
  proto,
  downloadContentFromMessage,
  jidNormalizedUser,
} = (await import('@whiskeysockets/baileys')).default

export function makeWASocket(connectionOptions, options = {}) {
  const conn = (global.opts?.legacy ? makeWALegacySocket : _makeWaSocket)(
    connectionOptions
  )

  Object.defineProperties(conn, {
    chats: {
      value: { ...(options.chats || {}) },
      writable: true,
    },
    decodeJid: {
      value(jid) {
        if (!jid || typeof jid !== 'string') return jid
        return jidNormalizedUser(jid)
      },
    },
  })

  return conn
}

export function protoType() {
  if (proto.Message.prototype.toJSON) return
  proto.Message.prototype.toJSON = function () {
    return JSON.parse(JSON.stringify(this))
  }
}

export function serialize(conn, m, store) {
  if (!m) return m
  return smsg(conn, m, store)
}

export function smsg(conn, m, store) {
  if (!m) return m
  let M = {}
  try {
    M.id = m.key?.id
    M.from = m.key?.remoteJid
    M.isGroup = M.from?.endsWith('@g.us')
    M.sender = m.key?.fromMe ? conn.user.id : m.key?.participant || M.from
    M.pushName = m.pushName || (M.isGroup ? (store?.contacts[M.sender]?.name || '') : '')
    M.mtype = Object.keys(m.message || {})[0]
    M.msg = M.mtype ? m.message[M.mtype] : {}
    M.text = M.msg?.text || M.msg?.conversation || M.msg?.caption || ''
    M.mentionedJid = m.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
    M.quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage || null
    M.reply = async (text, options = {}) => {
      return await conn.sendMessage(M.from, { text, ...options }, { quoted: m })
    }
    M.download = async () => {
      if (!M.mtype) return null
      if (!['imageMessage','videoMessage','audioMessage','stickerMessage','documentMessage'].includes(M.mtype)) return null
      let stream = await downloadContentFromMessage(m.message[M.mtype], M.mtype.replace('Message',''))
      let buffer = Buffer.from([])
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
      return buffer
    }
  } catch (e) {
    console.error('Error en smsg:', e)
  }
  return M
}

export { proto, jidNormalizedUser, downloadContentFromMessage }
