let handler = async (m, { conn, participants, isAdmin }) => {
  if (!m.isGroup) return
  if (!isAdmin) return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Este comando está *restringido*.\n> ꕥ Solo los administradores pueden usarlo.', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })

  let user
  if (m.mentionedJid[0]) {
    user = m.mentionedJid[0]
  } else if (m.quoted) {
    user = m.quoted.sender
  }

  if (!user) return conn.sendMessage(m.chat, { 
    text: '🚩 Debes *mencionar* o *responder* al usuario que deseas expulsar.', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })

  await conn.groupParticipantsUpdate(m.chat, [user], 'remove')

  return conn.sendMessage(m.chat, { 
    text: `ᰔᩚ El usuario fue *expulsado* correctamente.\n> ꕥ Acción ejecutada por un administrador.`, 
    contextInfo: { ...(m.contextInfo || {}), mentionedJid: [m.sender, user] } 
  }, { quoted: m })
}

handler.command = ['kick', 'expulsar', 'ban']
handler.help = ['kick']
handler.tags = ['boss']
export default handler
