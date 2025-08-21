let handler = async (m, { conn, text }) => {
  if (!text) return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Por favor escribe tu sugerencia.\n> ꕥ Ejemplo: #suggest Agreguen más stickers', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })

  let groupJid = 'CNpDsNmGXZx2D2ZH4pveHb@g.us'
  let suggestMsg = `╭┈❈─ׄ͜─ׄ͜─ׄ͜╴
ᰔᩚ *Nueva sugerencia recibida*
╰❈╾\n` +
                   `> ꕥ De: @${m.sender.split('@')[0]}\n` +
                   `> ꕥ Mensaje: ${text}`

  await conn.sendMessage(groupJid, { text: suggestMsg, mentions: [m.sender] })
  return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Tu sugerencia ha sido enviada al grupo de sugerencias.\n> ꕥ ¡Gracias por ayudar a mejorar el bot!', 
    contextInfo: { ...(m.contextInfo || {}), mentionedJid: [m.sender] } 
  }, { quoted: m })
}

handler.command = ['suggest']
handler.help = ['suggest']
handler.tags = ['main']
export default handler