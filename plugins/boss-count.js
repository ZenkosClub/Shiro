let handler = async (m, { conn, args, isAdmin }) => {
  if (!m.isGroup) return
  if (!isAdmin) return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Este comando está *restringido*.\n> ꕥ Solo los administradores pueden usarlo.', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })

  let days = parseInt(args[1]) || parseInt(args[0]) || 7
  if (isNaN(days) || days < 1) days = 7
  let since = Date.now() - (days * 24 * 60 * 60 * 1000)

  let chat = global.db.data.chats[m.chat] || {}
  if (!chat.msgCount) chat.msgCount = {}

  if (!m.mentionedJid || m.mentionedJid.length === 0) return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Acción inválida.\n> ꕥ Debes *mencionar* al usuario.', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })

  let who = m.mentionedJid[0]
  let msgs = (chat.msgCount[who] || []).filter(v => v.timestamp >= since)
  let total = msgs.length

  return conn.sendMessage(m.chat, { 
    text: `ᰔᩚ El usuario @${who.split('@')[0]} ha enviado *${total}* mensajes en los últimos *${days}* días.`, 
    contextInfo: { ...(m.contextInfo || {}), mentionedJid: [who] } 
  }, { quoted: m })
}

handler.command = ['count']
handler.help = ['count']
handler.tags = ['boss']
export default handler