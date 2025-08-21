let handler = async (m, { conn, args, isAdmin }) => {
  if (!m.isGroup) return
  if (!isAdmin) return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Este comando está *restringido*.\n> ꕥ Solo los administradores pueden usarlo.', 
  }, { quoted: m })

  if (!m.mentionedJid || m.mentionedJid.length === 0) return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Acción inválida.\n> ꕥ Debes *mencionar* al usuario.', 
  }, { quoted: m })

  let who = m.mentionedJid[0]
  let msgs = await conn.fetchMessages(m.chat, { limit: 200 })
  let total = msgs.filter(v => v.key.participant === who).length

  return conn.sendMessage(m.chat, { 
    text: `ᰔᩚ El usuario @${who.split('@')[0]} tiene *${total}* mensajes en los últimos 200 del grupo.`, 
    contextInfo: { mentionedJid: [who] } 
  }, { quoted: m })
}

handler.command = ['count']
handler.help = ['count']
handler.tags = ['boss']
export default handler
