let handler = async (m, { conn, text, isAdmin, isOwner, isPrems }) => {

  if (!isAdmin && !isOwner && !isPrems) return conn.sendMessage(m.chat, {
    text: '《✩》Solo los administradores pueden usar este comando.',
    contextInfo: { ...m.contextInfo } 
  }, { quoted: m })
  
  const groupMetadata = await conn.groupMetadata(m.chat)
  const participants = groupMetadata.participants
  
  await conn.sendMessage(m.chat, { 
    text: text || ' ',
    mentions: participants.map(p => p.id)
  }, { quoted: m })

}

handler.command = ['tag', 'todos', 'mencionartodos']
handler.help = ['#tag']
handler.tags = ['grupos']
export default handler
