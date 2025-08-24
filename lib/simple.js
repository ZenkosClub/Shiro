import path from 'path'
import { toAudio } from './converter.js'
import chalk from 'chalk'
import fetch from 'node-fetch'
import PhoneNumber from 'awesome-phonenumber'
import fs from 'fs'
import util from 'util'
import { fileTypeFromBuffer } from 'file-type'
import { format } from 'util'
import { fileURLToPath } from 'url'
import store from './store.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Baileys imports
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

// Función principal para crear socket
export function makeWASocket(connectionOptions, options = {}) {
    let conn = (global.opts['legacy'] ? makeWALegacySocket : _makeWaSocket)(connectionOptions)

    let sock = Object.defineProperties(conn, {
        chats: {
            get() { return conn.chats || {} },
            set(v) { conn.chats = v }
        },
        messages: {
            get() { return conn.messages || {} },
            set(v) { conn.messages = v }
        }
    })

    // Funciones auxiliares
    sock.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
        let buffer = Buffer.from([])
        let stream = await downloadContentFromMessage(message, message.mtype.replace('Message', ''))
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])
        let type = await fileTypeFromBuffer(buffer) || { ext: '' }
        let filepath = path.join(__dirname, filename + (attachExtension ? '.' + type.ext : ''))
        await fs.promises.writeFile(filepath, buffer)
        return filepath
    }

    sock.sendImageAsSticker = async (jid, pathOrBuffer, options = {}) => {
        let buff = Buffer.isBuffer(pathOrBuffer) ? pathOrBuffer : await fs.promises.readFile(pathOrBuffer)
        let stikerBuff = await toAudio(buff, 'sticker') // suponiendo que tu converter.js maneja stickers
        await sock.sendMessage(jid, { sticker: stikerBuff, ...options })
        return stikerBuff
    }

    // Métodos de mensajería
    sock.sendText = async (jid, text, quoted) => {
        return await sock.sendMessage(jid, { text: text, contextInfo: { quoted } })
    }

    sock.reply = async (jid, text, quoted) => sock.sendText(jid, text, quoted)

    sock.copyNForward = async (jid, message, forceForward = false, options = {}) => {
        let mtype = Object.keys(message.message)[0]
        let content = await generateForwardMessageContent(message, forceForward)
        let waMsg = await generateWAMessageFromContent(jid, content, options)
        await sock.relayMessage(jid, waMsg.message, { messageId: waMsg.key.id })
        return waMsg
    }

    return sock
}

// Exportaciones de utilidad
export {
    proto,
    downloadContentFromMessage,
    jidDecode,
    areJidsSameUser,
    generateForwardMessageContent,
    generateWAMessageFromContent,
    WAMessageStubType,
    extractMessageContent,
    prepareWAMessageMedia
}
