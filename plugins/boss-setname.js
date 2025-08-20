let handler = async (m, { conn, args, isAdmin }) => {
  if (!m.isGroup) return
  if (!isAdmin) return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Este comando está *restringido*.\n> ꕥ Solo los administradores pueden usarlo.', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })

  const newName = args.join(' ').trim()
  if (!newName) return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Acción inválida.\n> ꕥ Debes indicar el *nuevo nombre* del grupo.', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })

  await conn.groupUpdateSubject(m.chat, newName)

  return conn.sendMessage(m.chat, { 
    text: `ᰔᩚ Nombre del grupo *actualizado* correctamente.\n> ꕥ Nuevo nombre: *${newName}*`, 
    contextInfo: { ...(m.contextInfo || {}), mentionedJid: [m.sender] } 
  }, { quoted: m })
}

handler.command = ['groupname', 'gbname', 'namegb', 'setgroupname']
handler.help = ['groupname']
handler.tags = ['boss']
export default handler
