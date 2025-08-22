let handler = async (m, { conn }) => {  
  if (!m.mentionedJid || m.mentionedJid.length === 0) return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Acción inválida.\n> ꕥ Debes *mencionar* a alguien para usar este comando.', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })
  
  const who = m.mentionedJid[0]
  const videos = [
    'https://raw.githubusercontent.com/ZenkosClub/animes/main/angry/angry1.mp4',
    'https://raw.githubusercontent.com/ZenkosClub/animes/main/angry/angry1.mp4',
    'https://raw.githubusercontent.com/ZenkosClub/animes/main/angry/angry1.mp4'
  ]
  const video = videos[Math.floor(Math.random() * videos.length)]
  
  return conn.sendMessage(m.chat, { 
    video: { url: video }, 
    caption: `😡 ᰔᩚ @${m.sender.split('@')[0]} está *enojado* con @${who.split('@')[0]}`, 
    mentions: [m.sender, who], 
    contextInfo: { ...(m.contextInfo || {}) }
  }, { quoted: m })
}

handler.command = ['angry']
handler.help = ['angry']
handler.tags = ['anime']
export default handler
