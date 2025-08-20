let handler = async (m, { conn, isAdmin }) => {
  if (!m.isGroup) return
  if (!isAdmin) return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Este comando está *restringido*.\n> ꕥ Solo los administradores pueden usarlo.', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })

  if (!m.mentionedJid || m.mentionedJid.length === 0) return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Acción inválida.\n> ꕥ Debes *mencionar* al usuario que deseas eliminar.', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })

  await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
  if (!global.db.data.users[who]) global.db.data.users[who] = {}
  global.db.data.users[who].banned = true

  return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Usuario eliminado del *grupo*.\n> ꕥ La acción fue ejecutada correctamente.', 
    contextInfo: { ...(m.contextInfo || {}), mentionedJid: [who, m.sender] } 
  }, { quoted: m })
}

handler.command = ['kick', 'eject']
handler.help = ['kick']
handler.tags = ['boss']
export default handler
