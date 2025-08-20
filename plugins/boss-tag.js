let handler = async (m, { conn, text, isAdmin, usedPrefix, command }) => {
  if (!m.isGroup) return
  if (!isAdmin) return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Este comando está *restringido*.\n> ꕥ Solo los administradores pueden usarlo.', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })
  
  const groupMetadata = await conn.groupMetadata(m.chat)
  const participants = groupMetadata.participants

  let content = text?.trim()
  if (!content) {
    if (m.quoted?.text) {
      content = m.quoted.text
    } else {
      content = '@todos'
    }
  }

  await conn.sendMessage(m.chat, { 
    text: content,
    mentions: participants.map(p => p.id)
  }, { quoted: m })
}

handler.command = ['tag', 'say', 'tagall']
handler.help = ['tag']
handler.tags = ['boss']
export default handler
