import { isJidGroup } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args, participants, isAdmin, isOwner, isPrems, usedPrefix, command }) => {
  if (!m.isGroup) return
  if (!isAdmin && !isOwner && !isPrems) return conn.sendMessage(m.chat, { 
    text: '《✩》Solo los administradores pueden usar este comando.', 
    contextInfo: { ...m.contextInfo } 
  }, { quoted: m })
  
  if (!m.mentionedJid || m.mentionedJid.length === 0) return conn.sendMessage(m.chat, { 
    text: `《✩》Menciona al usuario que deseas degradar a administrador.`, 
    contextInfo: { ...m.contextInfo } 
  }, { quoted: m })

  const who = m.mentionedJid[0]
  if (who === conn.user.jid) return

  const groupMetadata = await conn.groupMetadata(m.chat)
  const participant = groupMetadata.participants.find(p => p.id === who)
  if (!participant) return
  if (!participant.admin) return

  await conn.groupParticipantsUpdate(m.chat, [who], 'demote')

  return conn.sendMessage(m.chat, { 
    text: `《✩》El usuario ya no es administrador del grupo.`, 
    contextInfo: { ...m.contextInfo, mentionedJid: [who, m.sender] } 
  }, { quoted: m })
}

handler.command = ['demote', 'degrade', 'revoke']
handler.help = ['demote']
handler.tags = ['boss']
export default handler
