let handler = async (m, { conn, participants }) => {  
  let who

  if (m.mentionedJid && m.mentionedJid.length > 0) {
    who = m.mentionedJid[0]
  } else if (participants && participants.length > 0) {
    const groupMembers = participants
      .filter(p => p.jid !== m.sender)
      .map(p => p.jid)
    who = groupMembers[Math.floor(Math.random() * groupMembers.length)]
  } else {
    who = m.sender
  }

  const videos = [
    'https://raw.githubusercontent.com/ZenkosClub/animes/main/angry/angry1.mp4',
    'https://raw.githubusercontent.com/ZenkosClub/animes/main/angry/angry2.mp4',
    'https://raw.githubusercontent.com/ZenkosClub/animes/main/angry/angry3.mp4',
    'https://raw.githubusercontent.com/ZenkosClub/animes/main/angry/angry4.mp4',
    'https://raw.githubusercontent.com/ZenkosClub/animes/main/angry/angry5.mp4',
  ]
  const video = videos[Math.floor(Math.random() * videos.length)]

  const senderName = (participants ? participants.find(p => p.jid === m.sender) : null)?.notify 
                     || (participants ? participants.find(p => p.jid === m.sender) : null)?.name 
                     || m.sender.split('@')[0]

  const whoName = (participants ? participants.find(p => p.jid === who) : null)?.notify 
                  || (participants ? participants.find(p => p.jid === who) : null)?.name 
                  || who.split('@')[0]

  return conn.sendMessage(m.chat, { 
    video: { url: video }, 
    caption: `😡 ᰔᩚ ${senderName} está *enojado* con ${whoName}`, 
    mentions: [m.sender, who], 
    contextInfo: { ...(m.contextInfo || {}) }
  }, { quoted: m })
}

handler.command = ['angry']
handler.help = ['angry']
handler.tags = ['anime']
export default handler
