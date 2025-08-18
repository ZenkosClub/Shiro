import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args, usedPrefix, command, isAdmin }) => {
  if (!m.isGroup) return
  if (!isAdmin) return conn.sendMessage(m.chat, { 
    text: '《✩》Solo los administradores pueden usar este comando.', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })

  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''
  if (!mime || !mime.startsWith('image/')) return conn.sendMessage(m.chat, { 
    text: `《✩》Debes enviar o responder a una imagen con el comando. _Ejemplo:_ *#groupimage (respondiendo a una foto)*`, 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })

  let img = await downloadContentFromMessage(q.msg || q, 'image')
  let buffer = Buffer.from([])
  for await (const chunk of img) buffer = Buffer.concat([buffer, chunk])

  await conn.updateProfilePicture(m.chat, buffer)

  return conn.sendMessage(m.chat, { 
    text: '《✩》Imagen del grupo actualizada correctamente.', 
    contextInfo: { ...(m.contextInfo || {}), mentionedJid: [m.sender] } 
  }, { quoted: m })
}

handler.command = ['groupimage', 'gbimg', 'imagegb', 'setgroupimg']
handler.help = ['groupimage']
handler.tags = ['boss']
export default handler