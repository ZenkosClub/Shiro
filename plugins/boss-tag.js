let handler = async (m, { conn, text, isAdmin }) => {
  if (!m.isGroup) return
  if (!isAdmin) return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Este comando está *restringido*.\n> ꕥ Solo los administradores pueden usarlo.', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })
  
  const groupMetadata = await conn.groupMetadata(m.chat)
  const participants = groupMetadata.participants

  let quotedMsg = m.quoted ? m.quoted : m

  await conn.sendMessage(m.chat, { 
    text: text || quotedMsg.text || ' ',
    mentions: participants.map(p => p.id)
  }, { quoted: quotedMsg })

}

handler.command = ['tag', 'say', 'tagall']
handler.help = ['tag']
handler.tags = ['boss']
export default handler
