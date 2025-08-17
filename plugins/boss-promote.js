import { isJidGroup } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args, participants, isAdmin, isBotAdmin, isOwner, isPrems, usedPrefix, command }) => {
  if (!m.isGroup) return
  if (!isAdmin && !isOwner && !isPrems) return conn.sendMessage(m.chat, { 
    text: '《✩》Solo los administradores pueden usar este comando.', 
    contextInfo: { ...m.contextInfo } 
  }, { quoted: m })
  
  if (!m.mentionedJid || m.mentionedJid.length === 0) return conn.sendMessage(m.chat, { 
    text: `《✩》Menciona al usuario que deseas dar a administrador.`, 
    contextInfo: { ...m.contextInfo } 
  }, { quoted: m })

  const who = m.mentionedJid[0]
  if (who === conn.user.jid) return

  const groupMetadata = await conn.groupMetadata(m.chat)
  const isUserAdmin = groupMetadata.participants.find(p => p.id === who)?.admin
  if (isUserAdmin) return conn.sendMessage(m.chat, { 
    text: `《✩》@${who.split('@')[0]} ya es administrador del grupo.`, 
    contextInfo: { ...m.contextInfo, mentionedJid: [who] } 
  }, { quoted: m })

  await conn.groupParticipantsUpdate(m.chat, [who], 'promote')

  const groupName = groupMetadata.subject
  const adminName = await conn.getName(m.sender)

  return conn.sendMessage(m.chat, { 
    text: `《✩》Usuario promovido a administrador del grupo.`, 
    contextInfo: { ...m.contextInfo, mentionedJid: [who, m.sender] } 
  }, { quoted: m })
}

handler.command = ['promote', 'authorize', 'grant']
handler.help = ['promote']
handler.tags = ['boss']
export default handler
