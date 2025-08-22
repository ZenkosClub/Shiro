let handler = async (m, { conn, participants }) => {  
  if (!m.isGroup) return

  const sender = m.sender || (participants && participants[0] ? participants[0].jid : '0@s.whatsapp.net')
  let who

  if (m.mentionedJid && m.mentionedJid.length > 0) {
    who = m.mentionedJid[0]
  } else if (participants && participants.length > 1) {
    const groupMembers = participants.map(p => p.jid).filter(jid => jid !== sender)
    who = groupMembers[Math.floor(Math.random() * groupMembers.length)]
  } else {
    who = sender
  }

  const videos = [
    'https://raw.githubusercontent.com/ZenkosClub/animes/main/angry/angry1.mp4',
    'https://raw.githubusercontent.com/ZenkosClub/animes/main/angry/angry2.mp4',
    'https://raw.githubusercontent.com/ZenkosClub/animes/main/angry/angry3.mp4',
    'https://raw.githubusercontent.com/ZenkosClub/animes/main/angry/angry4.mp4',
    'https://raw.githubusercontent.com/ZenkosClub/animes/main/angry/angry5.mp4',
  ]
  const video = videos[Math.floor(Math.random() * videos.length)]

  const safeSender = sender.includes('@') ? sender.split('@')[0] : sender
  const safeWho = who.includes('@') ? who.split('@')[0] : who

  return conn.sendMessage(
    m.chat, 
    { 
      video: { url: video }, 
      caption: `😡 ᰔᩚ @${safeSender} está *enojado* con @${safeWho}`, 
      contextInfo: { ...(m.contextInfo || {}), mentionedJid: [sender, who] } 
    }, 
    { quoted: m }
  )
}

handler.command = ['angry']
handler.help = ['angry']
handler.tags = ['anime']
export default handler
