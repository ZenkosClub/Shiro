let handler = async (m, { conn, isAdmin }) => {
  if (!m.isGroup) return
  if (!isAdmin) return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Este comando está *restringido*.\n> ꕥ Solo los administradores pueden usarlo.', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })

  let who = m.mentionedJid && m.mentionedJid[0] 
    ? m.mentionedJid[0] 
    : m.quoted 
      ? m.quoted.sender 
      : null

  if (!who) return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Acción inválida.\n> ꕥ Debes *mencionar* al usuario que deseas degradar.', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })
  
  const groupMetadata = await conn.groupMetadata(m.chat)
  const participant = groupMetadata.participants.find(p => p.id === who)
  if (!participant) return
  if (!participant.admin) return

  if (!participant.admin) return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Acción inválida.\n> ꕥ Este usuario *no es administrador*.', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })

  await conn.groupParticipantsUpdate(m.chat, [who], 'demote')


  return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Usuario *degradado* del rango de administrador.\n> ꕥ La acción fue ejecutada correctamente.', 
    contextInfo: { ...(m.contextInfo || {}), mentionedJid: [who, m.sender] } 
  }, { quoted: m })
}

handler.command = ['demote', 'degrade', 'revoke']
handler.help = ['demote']
handler.tags = ['boss']
export default handler
