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
    text: 'ᰔᩚ Acción inválida.\n> ꕥ Debes *mencionar* al usuario que deseas promover.', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })

  const groupMetadata = await conn.groupMetadata(m.chat)
  const participant = groupMetadata.participants.find(p => p.id === who)
  if (!participant) return
  if (participant.admin) return conn.sendMessage(m.chat, { 
    text: `ᰔᩚ El usuario ya es *administrador* en este grupo.\n> ꕥ Usuario @${who.split('@')[0]}`, 
    contextInfo: { ...(m.contextInfo || {}), mentionedJid: [who] } 
  }, { quoted: m })
  
  await conn.groupParticipantsUpdate(m.chat, [who], 'promote')

  return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Usuario *ascendido* al rango de administrador.\n> ꕥ La acción fue ejecutada correctamente.', 
    contextInfo: { ...(m.contextInfo || {}), mentionedJid: [who, m.sender] } 
  }, { quoted: m })
}

handler.command = ['promote', 'authorize', 'grant']
handler.help = ['promote']
handler.tags = ['boss']
export default handler
