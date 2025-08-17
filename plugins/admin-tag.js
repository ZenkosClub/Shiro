let handler = async (m, { conn, args, isAdmin, isOwner, isPrems }) => {

  if (!m.isGroup) return
  if (!isAdmin && !isOwner && !isPrems) return conn.sendMessage(m.chat, {
    text: '《✩》Solo los administradores pueden usar este comando.',
    contextInfo: { ...m.contextInfo }
  }, { quoted: m })

  try {
    const groupMetadata = await conn.groupMetadata(m.chat)
    const participants = groupMetadata.participants

    await conn.sendMessage(m.chat, {
      text: args?.join(' ') || ' ',
      mentions: participants.map(p => p.id)
    }, { quoted: m })

  } catch (e) {
    console.error(e)
  }
}

handler.command = ['tag', 'say', 'tagall']
handler.help = ['tag']
handler.tags = ['admin']
export default handler
