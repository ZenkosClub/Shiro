import path from 'path'
import fs from 'fs'
import util, { format } from 'util'
import chalk from 'chalk'
import fetch from 'node-fetch'
import PhoneNumber from 'awesome-phonenumber'
import { fileTypeFromBuffer } from 'file-type'
import { fileURLToPath } from 'url'
import store from './store.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const {
    default: _makeWaSocket,
    makeWALegacySocket,
    proto,
    downloadContentFromMessage,
    jidDecode,
    areJidsSameUser,
    generateForwardMessageContent,
    generateWAMessageFromContent,
    WAMessageStubType,
    extractMessageContent,
    prepareWAMessageMedia
} = (await import('@whiskeysockets/baileys')).default

export function protoType() {
    Buffer.prototype.toArrayBuffer = function () {
        const ab = new ArrayBuffer(this.length)
        const view = new Uint8Array(ab)
        for (let i = 0; i < this.length; i++) view[i] = this[i]
        return ab
    }
    ArrayBuffer.prototype.toBuffer = function () {
        return Buffer.from(new Uint8Array(this))
    }
    Uint8Array.prototype.getFileType = ArrayBuffer.prototype.getFileType = Buffer.prototype.getFileType = async function () {
        return await fileTypeFromBuffer(this)
    }
    String.prototype.isNumber = Number.prototype.isNumber = function () {
        const n = parseInt(this)
        return !isNaN(n) && typeof n === 'number'
    }
    String.prototype.capitalize = function () {
        return this.charAt(0).toUpperCase() + this.slice(1)
    }
    String.prototype.capitalizeV2 = function () {
        return this.split(' ').map(v => v.capitalize()).join(' ')
    }
    String.prototype.decodeJid = function () {
        if (/:\d+@/gi.test(this)) {
            const decode = jidDecode(this) || {}
            return (decode.user && decode.server && decode.user + '@' + decode.server || this).trim()
        }
        return this.trim()
    }
    Number.prototype.toTimeString = function () {
        const seconds = Math.floor((this / 1000) % 60)
        const minutes = Math.floor((this / (60 * 1000)) % 60)
        const hours = Math.floor((this / (60 * 60 * 1000)) % 24)
        const days = Math.floor(this / (24 * 60 * 60 * 1000))
        return (
            (days ? `${days} day(s) ` : '') +
            (hours ? `${hours} hour(s) ` : '') +
            (minutes ? `${minutes} minute(s) ` : '') +
            (seconds ? `${seconds} second(s)` : '')
        ).trim()
    }
    Number.prototype.getRandom = String.prototype.getRandom = Array.prototype.getRandom = function () {
        if (Array.isArray(this) || typeof this === 'string') return this[Math.floor(Math.random() * this.length)]
        return Math.floor(Math.random() * this)
    }
}

function nullish(args) {
    return !(args !== null && args !== undefined)
}

export function smsg(conn, m, hasParent) {
    if (!m) return m
    let M = proto.WebMessageInfo
    m = M.fromObject(m)
    m.conn = conn
    if (m.message && m.mtype == 'protocolMessage' && m.msg?.key) {
        const protocolMessageKey = m.msg.key
        if (protocolMessageKey == 'status@broadcast') protocolMessageKey.remoteJid = m.chat
        if (!protocolMessageKey.participant || protocolMessageKey.participant == 'status_me') protocolMessageKey.participant = m.sender
        protocolMessageKey.fromMe = conn.decodeJid(protocolMessageKey.participant) === conn.decodeJid(conn.user.id)
    }
    if (!m.mediaMessage) delete m.download
    return m
}

export function serialize() {
    const MediaType = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage']
    return Object.defineProperties(proto.WebMessageInfo.prototype, {
        conn: { value: undefined, enumerable: false, writable: true },
        id: { get() { return this.key?.id } },
        chat: { get() { return (this.key?.remoteJid || this.message?.senderKeyDistributionMessage?.groupId || '').decodeJid() } },
        isGroup: { get() { return this.chat.endsWith('@g.us') }, enumerable: true },
        sender: { get() { return this.conn?.decodeJid(this.key?.fromMe ? this.conn?.user.id : this.participant || this.key.participant || this.chat) }, enumerable: true },
        fromMe: { get() { return this.key?.fromMe || areJidsSameUser(this.conn?.user.id, this.sender) || false } },
        mtype: { get() { if (!this.message) return ''; const type = Object.keys(this.message); return (!['senderKeyDistributionMessage', 'messageContextInfo'].includes(type[0]) && type[0]) || (type.length >= 3 && type[1] !== 'messageContextInfo' && type[1]) || type[type.length - 1]; }, enumerable: true },
        msg: { get() { if (!this.message) return null; return this.message[this.mtype] } },
        mediaMessage: { get() { if (!this.message) return null; const Message = ((this.msg?.url || this.msg?.directPath) ? { ...this.message } : extractMessageContent(this.message)) || null; if (!Message) return null; const mtype = Object.keys(Message)[0]; return MediaType.includes(mtype) ? Message : null }, enumerable: true },
        mediaType: { get() { const message = this.mediaMessage; if (!message) return null; return Object.keys(message)[0] }, enumerable: true },
        download: { value(saveToFile = false) { const mtype = this.mediaType; return this.conn?.downloadM(this.mediaMessage[mtype], mtype.replace(/message/i, ''), saveToFile) }, enumerable: true, configurable: true },
        reply: { value(text, chatId, options) { return this.conn?.reply(chatId || this.chat, text, this, options) } },
        copy: { value() { const M = proto.WebMessageInfo; return smsg(this.conn, M.fromObject(M.toObject(this))) }, enumerable: true },
        forward: { value(jid, force = false, options = {}) { return this.conn?.sendMessage(jid, { forward: this, force, ...options }, options) }, enumerable: true },
        copyNForward: { value(jid, forceForward = false, options = {}) { return this.conn?.copyNForward(jid, this, forceForward, options) }, enumerable: true },
        cMod: { value(jid, text = '', sender = this.sender, options = {}) { return this.conn?.cMod(jid, this, text, sender, options) }, enumerable: true },
        getQuotedObj: { value() { if (!this.quoted?.id) return null; const q = proto.WebMessageInfo.fromObject(this.conn?.loadMessage(this.quoted.id) || this.quoted.vM); return smsg(this.conn, q) }, enumerable: true },
        delete: { value() { return this.conn?.sendMessage(this.chat, { delete: this.key }) }, enumerable: true },
        react: { value(text) { return this.conn?.sendMessage(this.chat, { react: { text, key: this.key } }) }, enumerable: true },
        fakeReply: { value(jid, text, sender, options) { return this.conn?.sendMessage(jid, { text, contextInfo: { stanzaId: this.id, participant: sender || this.sender, quotedMessage: this.msg } }, options) }, enumerable: true },
        parseMention: { value(text) { return [...text.matchAll(/@(\d{5,16})/g)].map(v => v[1] + '@s.whatsapp.net') }, enumerable: true },
        getName: { value(jid, withoutContact) { let v = jidDecode(jid) || {}; return v.user || v.server || jid }, enumerable: true }
    })
}

export function makeWASocket(connectionOptions, options = {}) {
    let conn = (global.opts['legacy'] ? makeWALegacySocket : _makeWaSocket)(connectionOptions)
    let sock = Object.defineProperties(conn, {
        chats: { value: { ...(options.chats || {}) }, writable: true },
        decodeJid: { value(jid) { if (!jid || typeof jid !== 'string') return (!nullish(jid) && jid) || null; return jid.decodeJid() } }
    })
    store.bind(sock)
    return sock
}
