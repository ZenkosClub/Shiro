let handler = async (m, { conn, args, isAdmin, isOwner, isPrems }) => {
  if (!m.isGroup) return
  if (!isAdmin && !isOwner && !isPrems) return conn.sendMessage(m.chat, { 
    text: '《✩》Solo los administradores pueden usar este comando.', 
    contextInfo: { ...m.contextInfo } 
  }, { quoted: m })

  let text = args.join(' ')
  if (!text) text = '《✩》Debes enviar un mensaje para usar el comando.'

  return conn.sendMessage(m.chat, { 
    text,
    contextInfo: { ...m.contextInfo } 
  }, { quoted: m })
}

handler.command = ['tag', 'say', 'tagall']
handler.help = ['tag']
handler.tags = ['admin']
export default handler