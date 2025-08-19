let handler = async (m, { conn, isAdmin }) => {
  if (!m.isGroup) return

  if (!isAdmin) return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Este comando está *restringido*.\n> ꕥ Solo los administradores pueden usarlo.', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })

  // Detectar al usuario: mencionado o respondido
  let who = m.mentionedJid && m.mentionedJid[0] 
    ? m.mentionedJid[0] 
    : m.quoted && m.quoted.sender 
      ? m.quoted.sender 
      : null

  if (!who) return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Acción inválida.\n> ꕥ Debes *mencionar* o *responder* al usuario que deseas eliminar.', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })

  const ownerNumbers = global.owner.map(v => { 
    const id = typeof v === 'string' ? v.replace(/[^0-9]/g, '') : String(v).replace(/[^0-9]/g, '') 
    return id + '@s.whatsapp.net' 
  })

  if (ownerNumbers.includes(who)) return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Acción denegada.\n> ꕥ No puedo eliminar a un *owner*.', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })

  if (who === conn.user.jid) return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Acción inválida.\n> ꕥ No puedo eliminarme a mí mismo.', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })

  // Eliminar al usuario
  await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
  if (!global.db.data.users[who]) global.db.data.users[who] = {}
  global.db.data.users[who].banned = true

  // Avisos
  await conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Usuario eliminado del grupo.\n> ꕥ La acción fue ejecutada correctamente.', 
    contextInfo: { ...(m.contextInfo || {}), mentionedJid: [who, m.sender] } 
  }, { quoted: m })

  await conn.sendMessage(who, { 
    text: '🚩 Has sido eliminado del grupo.' 
  })
}

handler.command = ['kick', 'eject', 'expulsar']
handler.help = ['kick *@user*']
handler.tags = ['boss']
export default handler
