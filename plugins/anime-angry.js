let handler = async (m, { conn }) => {  
  if (!m.isGroup) return
  if (!m.mentionedJid || m.mentionedJid.length === 0) return

  const sender = m.sender
  const who = m.mentionedJid[0]

  const videos = [
    'https://raw.githubusercontent.com/ZenkosClub/animes/main/angry/angry1.mp4',
    'https://raw.githubusercontent.com/ZenkosClub/animes/main/angry/angry2.mp4',
    'https://raw.githubusercontent.com/ZenkosClub/animes/main/angry/angry3.mp4',
    'https://raw.githubusercontent.com/ZenkosClub/animes/main/angry/angry4.mp4',
    'https://raw.githubusercontent.com/ZenkosClub/animes/main/angry/angry5.mp4',
  ]
  const video = videos[Math.floor(Math.random() * videos.length)]

  const safeSender = sender.split('@')[0]
  const safeWho = who.split('@')[0]

  return conn.sendMessage(
    m.chat, 
    { 
      video: { url: video }, 
      caption: `😡 ᰔᩚ @${safeSender} está *enojado* con @${safeWho}`, 
      contextInfo: { ...(m.contextInfo || {}), mentionedJid: [who, sender] } 
    }, { quoted: m })
}

handler.command = ['angry']
handler.help = ['angry']
handler.tags = ['anime']
export default handler
