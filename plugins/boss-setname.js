import { isJidGroup } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args, usedPrefix, command, isAdmin }) => {
  if (!m.isGroup) return
  if (!isAdmin) return conn.sendMessage(m.chat, { 
    text: '《✩》Solo los administradores pueden usar este comando.', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })

  const newName = args.join(' ').trim()
  if (!newName) return conn.sendMessage(m.chat, { 
    text: '《✩》Debes indicar el nuevo nombre del grupo. _Ejemplo:_ *#groupname Grupo Bot*', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })

  await conn.groupUpdateSubject(m.chat, newName)

  return conn.sendMessage(m.chat, { 
    text: `《✩》Nombre del grupo actualizado a: *${newName}*`, 
    contextInfo: { ...(m.contextInfo || {}), mentionedJid: [m.sender] } 
  }, { quoted: m })
}

handler.command = ['groupname', 'gbname', 'namegb', 'setgroupname']
handler.help = ['groupname']
handler.tags = ['boss']
export default handler
