let handler = async (m, { conn, participants }) => {  
  if (!m.isGroup) return

  const sender = m.sender || 'unknown'
  let who = 'unknown'

  if (m.mentionedJid && m.mentionedJid.length > 0) {
    who = m.mentionedJid[0] || 'unknown'
  } else if (participants && participants.length > 1) {
    const groupMembers = participants.map(p => p.jid).filter(jid => jid !== sender)
    who = groupMembers[Math.floor(Math.random() * groupMembers.length)] || 'unknown'
  }

  const videos = [
    'https://raw.githubusercontent.com/ZenkosClub/animes/main/angry/angry1.mp4',
    'https://raw.githubusercontent.com/ZenkosClub/animes/main/angry/angry2.mp4',
    'https://raw.githubusercontent.com/ZenkosClub/animes/main/angry/angry3.mp4',
    'https://raw.githubusercontent.com/ZenkosClub/animes/main/angry/angry4.mp4',
    'https://raw.githubusercontent.com/ZenkosClub/animes/main/angry/angry5.mp4',
  ]
  const video = videos[Math.floor(Math.random() * videos.length)]

  return conn.sendMessage(m.chat, { 
    video: { url: video }, 
    caption: `😡 ᰔᩚ @${sender.split('@')[0]} está *enojado* con @${who.split('@')[0]}`, 
    contextInfo: { ...(m.contextInfo || {}), mentionedJid: [who, sender] } 
  }, { quoted: m })
}

handler.command = ['angry']
handler.help = ['angry']
handler.tags = ['anime']
export default handler
