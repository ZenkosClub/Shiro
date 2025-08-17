let handler = async (m, { conn, text, isAdmin, isOwner, isPrems }) => {

  if (!m.isGroup) return conn.sendMessage(m.chat, {
    text: '*[❗] Este comando solo puede ser usado en grupos.*',
    contextInfo: {
      ...rcanal.contextInfo
    }
  }, { quoted: m })
  
  if (!isAdmin && !isOwner && !isPrems) return conn.sendMessage(m.chat, {
    text: '《✩》Solo los administradores pueden usar este comando.*',
    contextInfo: {
      ...rcanal.contextInfo
    }
  }, { quoted: m })
  
  try {

    const groupMetadata = await conn.groupMetadata(m.chat)
    const participants = groupMetadata.participants
    
    await conn.sendMessage(m.chat, { 
      text: text || ' ',
      mentions: participants.map(p => p.id)
    }, { quoted: m })

handler.command = ['tag', 'say', 'tagall']
handler.help = ['tag']
handler.tags = ['admin']
export default handler
