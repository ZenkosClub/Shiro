import { isJidGroup } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args, participants, isAdmin }) => {
  if (!m.isGroup) return conn.sendMessage(m.chat, { 
    text: '*[❗] Este comando solo puede ser usado en grupos.*' 
  }, { quoted: m })

  if (!isAdmin) return conn.sendMessage(m.chat, { 
    text: '《✧》Debo ser admin para ejecutar este Comando.' 
  }, { quoted: m })

  let who
  if (m.mentionedJid && m.mentionedJid.length > 0) who = m.mentionedJid[0]
  else if (args[0]) who = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  else return conn.sendMessage(m.chat, { 
    text: '《✧》Debes mencionar o escribir el número del usuario a expulsar.' 
  }, { quoted: m })

  if (!participants.find(p => p.id == who)) return conn.sendMessage(m.chat, { 
    text: '《✧》Ese usuario no se encuentra en el grupo.' 
  }, { quoted: m })

  await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
  conn.sendMessage(m.chat, { 
    text: `《✧》El usuario fue expulsado correctamente.` 
  }, { quoted: m })
}

handler.help = ['kick @usuario']
handler.tags = ['group']
handler.command = /^kick$/i

export default handler
