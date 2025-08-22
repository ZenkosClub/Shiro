import { smsg } from './lib/simple.js'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { watchFile, unwatchFile, readFileSync, existsSync } from 'fs'
import chalk from 'chalk'
const { proto } = (await import('@whiskeysockets/baileys')).default

const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => new Promise(r => setTimeout(r, ms))

let ownersCache = null
const getAllOwners = () => {
  if (ownersCache) return ownersCache
  ownersCache = [
    global.conn.decodeJid(global.conn.user.id),
    ...global.owner.flatMap(([n]) => [n.replace(/\D/g, '') + '@s.whatsapp.net', n.replace(/\D/g, '') + '@lid']),
    ...(global.ownerLid || []).flatMap(([n]) => [n.replace(/\D/g, '') + '@s.whatsapp.net', n.replace(/\D/g, '') + '@lid'])
  ]
  return ownersCache
}

const usersProxy = () => new Proxy(global.db.data.users, { get: (t, k) => t[k] ||= { exp: 0, limit: 10, registered: false, name: '', age: -1, regTime: -1, banned: false, level: 0, coins: 0 } })
const chatsProxy = () => new Proxy(global.db.data.chats, { get: (t, k) => t[k] ||= { isBanned: false, bienvenida: true, antiLink: false, onlyLatinos: false, nsfw: false, expired: 0 } })
const settingsProxy = () => new Proxy(global.db.data.settings, { get: (t, k) => t[k] ||= { self: false, autoread: true } })

const groupCache = new Map()
const GROUP_TTL = 15000
const getGroupData = async (conn, jid) => {
  const now = Date.now()
  const c = groupCache.get(jid)
  if (c && now - c.ts < GROUP_TTL) return c.data
  const meta = await conn.groupMetadata(jid).catch(() => ({}))
  const data = { metadata: meta || {}, participants: meta?.participants || [] }
  groupCache.set(jid, { ts: now, data })
  return data
}

let pluginsCache = null
let pluginsSignature = ''
const signatureOfPlugins = () => {
  const keys = Object.keys(global.plugins || {}).sort().join('|')
  return keys
}
const getProcessedPlugins = () => {
  const sig = signatureOfPlugins()
  if (pluginsCache && pluginsSignature === sig) return pluginsCache
  pluginsSignature = sig
  pluginsCache = Object.entries(global.plugins || {})
    .filter(([_, p]) => p && !p.disabled)
    .map(([name, p]) => ({
      name,
      handler: p.handler || p,
      command: Array.isArray(p.command) ? p.command : p.command ? [p.command] : [],
      tags: p.tags || [],
      all: p.all,
      customPrefix: p.customPrefix
    }))
  return pluginsCache
}

const botConfigCache = new Map()
const BOTCONF_TTL = 30000
const getSubBotConfig = (jid) => {
  const now = Date.now()
  const c = botConfigCache.get(jid)
  if (c && now - c.ts < BOTCONF_TTL) return c.data
  try {
    const botNumber = jid.split('@')[0].replace(/\D/g, '')
    const p = `./serbots/${botNumber}/config.json`
    const data = existsSync(p) ? JSON.parse(readFileSync(p, 'utf-8')) : {}
    botConfigCache.set(jid, { ts: now, data })
    return data
  } catch {
    const data = {}
    botConfigCache.set(jid, { ts: now, data })
    return data
  }
}

export async function handler(chatUpdate) {
  if (!chatUpdate?.messages?.length) return
  this.msgqueque = this.msgqueque || []
  this.pushMessage(chatUpdate.messages).catch(() => {})

  let m = smsg(this, chatUpdate.messages[chatUpdate.messages.length - 1]) || chatUpdate.messages[chatUpdate.messages.length - 1]
  if (!m || m.messageStubType) return
  m.exp = 0
  m.limit = false

  if (!global.db.data) await global.loadDatabase()
  const OPTS = globalThis.opts || {}
  const users = usersProxy()
  const chats = chatsProxy()
  const sets = settingsProxy()
  const user = users[m.sender]
  const chat = chats[m.chat]
  const setting = sets[this.user.jid]

  if (!('autoread' in OPTS)) OPTS.autoread = true
  if (OPTS['nyimak'] || (!m.fromMe && OPTS['self']) || (OPTS['swonly'] && m.chat !== 'status@broadcast')) return
  if (typeof m.text !== 'string') m.text = ''

  const allOwnerIds = getAllOwners()
  const isROwner = allOwnerIds.includes(m.sender)
  const isOwner = isROwner || (m.fromMe && this.user.jid === global.conn.user.jid)
  const isMods = isOwner || (global.mods || []).some(v => m.sender === v.replace(/\D/g, '') + '@s.whatsapp.net')
  const isPrems = isROwner || (global.prems || []).some(v => m.sender === v.replace(/\D/g, '') + '@s.whatsapp.net') || user?.prem

  if (OPTS['queque'] && m.text && !(isMods || isPrems)) {
    const q = this.msgqueque
    q.push(m.id || m.key.id)
    setTimeout(() => {
      const i = q.indexOf(m.id || m.key.id)
      if (i !== -1) q.splice(i, 1)
    }, 5000)
  }

  if (m.isBaileys) return
  m.exp += Math.ceil(Math.random() * 10)

  let participants = []
  let groupMetadata = {}
  if (m.isGroup) {
    const g = await getGroupData(this, m.chat)
    participants = g.participants
    groupMetadata = g.metadata
  }

  const userInGroup = m.isGroup ? (participants.find(u => this.decodeJid(u.id) === m.sender) || {}) : {}
  const botInGroup = m.isGroup ? (participants.find(u => this.decodeJid(u.id) === this.user.jid) || {}) : {}
  const isAdmin = ['admin', 'superadmin'].includes(userInGroup?.admin)
  const isBotAdmin = ['admin', 'superadmin'].includes(botInGroup?.admin)

  const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
  const plugins = getProcessedPlugins()

  await Promise.all(plugins.map(async p => {
    const __filename = join(___dirname, p.name)
    if (typeof p.all === 'function') await p.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename }).catch(() => {})
    if (!OPTS['restrict'] && p.tags?.includes('admin')) return
    const pref = p.customPrefix || global.prefix || '.'
    const re = pref instanceof RegExp ? pref : new RegExp(String(pref).replace(/[|\\{}()[\]^$+*?.]/g, '\\$&'))
    const match = re.exec(m.text)
    if (!match) return
    const slice = m.text.slice(match[0].length).trim()
    const parts = slice.length ? slice.split(/\s+/) : []
    const command = (parts.shift() || '').toLowerCase()
    const isMatchCommand = p.command.some(c => typeof c === 'string' ? c.toLowerCase() === command : c.test(command))
    if (!isMatchCommand) return

    if (!m.isGroup && !['qr', 'code', 'setbotname', 'setbotimg', 'setautoread'].includes(command) && !isOwner) {
      return
    }

    if (m.isGroup && global.db.data.botGroups && global.db.data.botGroups[m.chat] === false) {
      if (!['grupo'].includes(command) && !isOwner) {
        return m.reply(`El bot está desactivado en este grupo.\n\n> Pídele a un administrador que lo active.`)
      }
    }

    try {
      await p.handler.call(this, m, { match, conn: this, participants, groupMetadata, user: userInGroup, bot: botInGroup, isROwner, isOwner, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename, usedPrefix: match[0], command, args: parts, text: parts.join(' ') })
      m.plugin = p.name
      m.command = command
      m.args = parts
    } catch (e) {
      console.error(chalk.red(`[PLUGIN ERROR] ${p.name}`), e)
    }
  }))

  user.exp += m.exp
  if (m.limit) user.limit -= m.limit

  const prefixes = ['.', '#', '!', '/']
  const isCmd = prefixes.some(p => m.text?.startsWith(p))
  const isReplyCmd = m.quoted?.fromMe && prefixes.some(p => m.text?.startsWith(p))
  if (isCmd || isReplyCmd) {
    const isSubBot = this.user.jid !== global.conn.user.jid
    if (isSubBot) {
      const conf = getSubBotConfig(this.user.jid)
      if (conf.autoRead !== false) {
        await this.readMessages([m.key]).catch(() => {})
        if (m.isGroup) await this.readMessages([m.key], { readEphemeral: true }).catch(() => {})
      }
    } else {
      if (OPTS.autoread) {
        await this.readMessages([m.key]).catch(() => {})
        if (m.isGroup) await this.readMessages([m.key], { readEphemeral: true }).catch(() => {})
      }
    }
  }
}

watchFile(global.__filename(import.meta.url, true), async () => {
  unwatchFile(global.__filename(import.meta.url, true))
  console.log(chalk.magenta("Se actualizó 'handler.js'"))
  if (global.reloadHandler) console.log(await global.reloadHandler())
})
