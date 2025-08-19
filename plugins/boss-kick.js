import { isJidGroup } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args, participants, isAdmin }) => {
  if (!m.isGroup) return conn.sendMessage(m.chat, {
    text: '*[❗] Este comando solo puede ser usado en grupos.*',
    contextInfo: {
      ...rcanal.contextInfo
    }
  }, { quoted: m })
  
  if (!isAdmin) return conn.sendMessage(m.chat, { 
    text: '《✧》Debo ser admin para ejecutar este Comando.', 
    contextInfo: { 
      ...rcanal.contextInfo 
    } 
  }, { quoted: m })

  let who
  if (m.mentionedJid && m.mentionedJid.length > 0) who = m.mentionedJid[0]
  else if (args[0]) who = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  else if (m.quoted) who = m.quoted.sender

  if (!who) return conn.sendMessage(m.chat, { 
    text: '《✧》Menciona o escribe el número de la persona que deseas eliminar.', 
    contextInfo: { 
      ...rcanal.contextInfo 
    } 
  }, { quoted: m })

  if (participants.some(p => p.id === who && p.admin)) return conn.sendMessage(m.chat, { 
    text: '《✧》No puedo eliminar a un administrador.', 
    contextInfo: { 
      ...rcanal.contextInfo 
    } 
  }, { quoted: m })

  await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
  await conn.sendMessage(m.chat, { 
    text: `《✧》El usuario ha sido eliminado del grupo.`, 
    contextInfo: { 
      ...rcanal.contextInfo, 
      mentionedJid: [who] 
    } 
  }, { quoted: m })
}

handler.command = /^(kick|expulsar|ban)$/i
handler.group = true
export default handler
