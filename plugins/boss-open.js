let handler = async (m, { conn, isAdmin }) => {
  if (!m.isGroup) return
  if (!isAdmin) return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Este comando está *restringido*.\n> ꕥ Solo los administradores pueden usarlo.', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })

  await conn.groupSettingUpdate(m.chat, 'not_announcement')
  return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ El grupo ha sido *abierto*.\n> ꕥ Todos los miembros pueden enviar mensajes.', 
    contextInfo: { ...(m.contextInfo || {}), mentionedJid: [m.sender] } 
  }, { quoted: m })
}

handler.command = ['open']
handler.help = ['open']
handler.tags = ['boss']
export default handler
