import { isJidGroup } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args, participants, isAdmin, isBotAdmin, usedPrefix, command }) => {
  if (!m.isGroup) return
  if (!isAdmin) return conn.sendMessage(m.chat, { 
    text: '《✩》Solo los administradores pueden usar este comando.',
    contextInfo: { ...m.contextInfo } 
  }, { quoted: m })

  if (!isBotAdmin) return conn.sendMessage(m.chat, { 
    text: '《✧》Debo ser administrador para ejecutar este Comando.',
    contextInfo: { ...m.contextInfo } 
  }, { quoted: m })
  
  if (!m.mentionedJid || m.mentionedJid.length === 0) return conn.sendMessage(m.chat, { 
    text: `《✩》Debes mencionar al usuario que deseas eliminar.`,
    contextInfo: { ...m.contextInfo } 
  }, { quoted: m })

  const who = m.mentionedJid[0]
  const ownerNumbers = global.owner.map(v => { 
    const id = typeof v === 'string' ? v.replace(/[^0-9]/g, '') : String(v).replace(/[^0-9]/g, '') 
    return id + '@s.whatsapp.net' 
  })
  if (ownerNumbers.includes(who)) return
  if (who === conn.user.jid) return

  await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
  if (!global.db.data.users[who]) global.db.data.users[who] = {}
  global.db.data.users[who].banned = true

  const userName = await conn.getName(who)
  const adminName = await conn.getName(m.sender)
  const groupName = (await conn.groupMetadata(m.chat)).subject

  return conn.sendMessage(m.chat, { 
    text: `《✩》Usuario eliminado del grupo.`,
    contextInfo: { ...m.contextInfo, mentionedJid: [who, m.sender] } 
  }, { quoted: m })
}

handler.command = ['kick', 'eject']
handler.help = ['kick']
handler.tags = ['boss']
export default handler
