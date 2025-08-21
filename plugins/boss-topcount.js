let handler = async (m, { conn, args, isAdmin }) => {
  if (!m.isGroup) return
  if (!isAdmin) return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Este comando está *restringido*.\n> ꕥ Solo los administradores pueden usarlo.', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })

  let days = parseInt(args[0]) || 7
  if (isNaN(days) || days < 1) days = 7
  let since = Date.now() - (days * 24 * 60 * 60 * 1000)

  let chat = global.db.data.chats[m.chat] || {}
  if (!chat.msgCount) chat.msgCount = {}

  let ranking = Object.entries(chat.msgCount)
    .map(([user, msgs]) => [user, msgs.filter(v => v.timestamp >= since).length])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  if (!ranking.length) return conn.sendMessage(m.chat, { 
    text: `ᰔᩚ No hay mensajes registrados en los últimos *${days}* días.` 
  }, { quoted: m })

  let text = `✿ Top usuarios más activos en los últimos *${days}* días:\n\n`
  text += ranking.map(([user, count], i) => `*${i + 1}.* @${user.split('@')[0]} — ${count} msgs`).join('\n')

  return conn.sendMessage(m.chat, { 
    text, 
    contextInfo: { ...(m.contextInfo || {}), mentionedJid: ranking.map(([user]) => user) } 
  }, { quoted: m })
}

handler.command = ['topcount']
handler.help = ['topcount']
handler.tags = ['boss']
export default handler