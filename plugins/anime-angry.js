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

  const senderContact = participants.find(p => p.jid === m.sender)
  const senderName = senderContact ? senderContact.notify || senderContact.name || m.sender.split('@')[0] : m.sender.split('@')[0]

  const whoContact = participants.find(p => p.jid === who)
  const whoName = whoContact ? whoContact.notify || whoContact.name || who.split('@')[0] : who.split('@')[0]

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