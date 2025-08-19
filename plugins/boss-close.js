let handler = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return
  if (!isAdmin) return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Este comando está *restringido*.\n> ꕥ Solo los administradores pueden usarlo.', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })

  await conn.groupSettingUpdate(m.chat, 'announcement')
  return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ El grupo ha sido *cerrado*.\n> ꕥ Solo los administradores pueden enviar mensajes.', 
    contextInfo: { ...(m.contextInfo || {}), mentionedJid: [m.sender] } 
  }, { quoted: m })
}

handler.command = ['close']
handler.help = ['close']
handler.tags = ['boss']
export default handler
