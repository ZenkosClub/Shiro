let handler = async (m, { conn, participants }) => {  
  if (!m.isGroup) return

  const sender = m.sender || 'unknown'
  let who

  if (m.mentionedJid && m.mentionedJid.length > 0) {
    who = m.mentionedJid[0]
  } else {
    const groupMembers = participants?.map(p => p.jid).filter(jid => jid !== sender) || []
    if (groupMembers.length > 0) {
      who = groupMembers[Math.floor(Math.random() * groupMembers.length)]
    } else {
      who = sender
    }
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
