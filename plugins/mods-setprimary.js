import { isJidGroup } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args, isAdmin, isOwner, isPrems, usedPrefix, command }) => {
  if (!isAdmin && !isOwner && !isPrems) return conn.sendMessage(m.chat, {
    text: '《✧》Solo los administradores pueden usar este comando.',
    contextInfo: { ...rcanal.contextInfo }
  }, { quoted: m })

  let who
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    who = m.mentionedJid[0]
  } else if (m.quoted && m.quoted.sender) {
    who = m.quoted.sender
  } else {
    return conn.sendMessage(m.chat, {
      text: `《✧》Debes mencionar o responder al bot que deseas establecer como primario.\n\n> Ejemplo: ${usedPrefix + command} @usuario`,
      contextInfo: { ...rcanal.contextInfo }
    }, { quoted: m })
  }

  if (!global.db.data.chats[m.chat]) {
    global.db.data.chats[m.chat] = {}
  }

  global.db.data.chats[m.chat].primaryBot = who

  const botName = await conn.getName(who)
  const adminName = await conn.getName(m.sender)
  const groupName = (await conn.groupMetadata(m.chat)).subject

  return conn.sendMessage(m.chat, {
    text: `✿ Bot establecido como primario en el grupo.\n\n✰ Bot: @${who.split('@')[0]}\n❏ Admin: @${m.sender.split('@')[0]}\n\n✐ Grupo: ${groupName}`,
    contextInfo: { ...rcanal.contextInfo, mentionedJid: [who, m.sender] }
  }, { quoted: m })
}

handler.command = ['setprimary']
handler.help = ['setprimary']
handler.tags = ['group']
export default handler