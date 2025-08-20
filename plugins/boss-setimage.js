let handler = async (m, { conn, isAdmin }) => {
  if (!m.isGroup) return
  if (!isAdmin) return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Este comando está *restringido*.\n> ꕥ Solo los administradores pueden usarlo.', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })

  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!mime || !mime.startsWith('image/')) return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Acción inválida.\n> ꕥ Debes *responder* a una imagen con el comando.\n\nꕥ Ejemplo:\n> ᰔᩚ *#groupimage (respondiendo a una foto)*', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })

  let img = await downloadContentFromMessage(q.msg || q, 'image')
  let buffer = Buffer.from([])
  for await (const chunk of img) buffer = Buffer.concat([buffer, chunk])

  await conn.updateProfilePicture(m.chat, buffer)

  return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Imagen de grupo *actualizada* correctamente.\n> ꕥ La acción fue ejecutada por un administrador.', 
    contextInfo: { ...(m.contextInfo || {}), mentionedJid: [m.sender] } 
  }, { quoted: m })
}

handler.command = ['groupimage', 'gbimg', 'imagegb', 'setgroupimg']
handler.help = ['groupimage']
handler.tags = ['boss']
export default handler
