let handler = async (m, { conn, participants }) => {  
  let who
  if (m.mentionedJid && m.mentionedJid.length > 0) {
    who = m.mentionedJid[0]
  } else {
    const groupMembers = participants
      .filter(p => p.jid !== m.sender)
      .map(p => p.jid)
    who = groupMembers[Math.floor(Math.random() * groupMembers.length)]
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
    caption: `😡 ᰔᩚ @${m.sender.split('@')[0]} está *enojado* con @${who.split('@')[0]}`, 
    contextInfo: { ...(m.contextInfo || {}), mentionedJid: [who, m.sender] } 
  }, { quoted: m })
}

handler.command = ['angry']
handler.help = ['angry']
handler.tags = ['anime']
export default handler
