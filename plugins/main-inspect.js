let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `*🚩 Ingresa un enlace de grupo o canal válido.*\n\nEjemplo:\n> ${usedPrefix + command} https://chat.whatsapp.com/XXXXXXXXXXXXXXX\n> ${usedPrefix + command} https://whatsapp.com/channel/XXXXXXXXXXXXXXX`, m)

  let [_, code] = text.match(/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/) || []
  let [__, channel] = text.match(/whatsapp\.com\/channel\/([0-9A-Za-z]{20,24})/) || []

  try {
    if (code) {
      let res = await conn.groupGetInviteInfo(code)
      let txt = `≡ *INVITACIÓN DE GRUPO*\n\n`
      txt += `*🆔 ID:* ${res.id}\n`
      txt += `*📌 Nombre:* ${res.subject}\n`
      txt += `*👤 Creado por:* ${res.owner ? '@' + res.owner.split('@')[0] : 'Desconocido'}\n`
      txt += `*📅 Creado el:* ${new Date(res.creation * 1000).toLocaleString()}\n`
      txt += `*👥 Participantes:* ${res.size}\n`
      txt += `*📖 Descripción:* ${res.desc || 'Sin descripción'}\n\n`
      txt += `> ᴮʸ ʙᴏss-ᴍᴅ`

      return conn.sendMessage(m.chat, { text: txt, mentions: conn.parseMention(txt) }, { quoted: m })
    } else if (channel) {
      let channelId = `${channel}@newsletter`
      let info = await conn.newsletterMetadata(channelId)
      
      let txt = `≡ *INVITACIÓN DE CANAL*\n\n`
      txt += `*🆔 ID Canal:* ${info.id}\n`
      txt += `*📌 Nombre:* ${info.subject || 'Sin nombre'}\n`
      txt += `*👤 Creador:* ${info.creator ? '@' + info.creator.split('@')[0] : 'Desconocido'}\n`
      txt += `*👥 Seguidores:* ${info.subscribers || 0}\n`
      txt += `*📖 Descripción:* ${info.desc || 'Sin descripción'}\n\n`
      txt += `> ᴮʸ ʙᴏss-ᴍᴅ`

      return conn.sendMessage(m.chat, { text: txt, mentions: conn.parseMention(txt) }, { quoted: m })
    } else {
      return conn.reply(m.chat, `*🚩 Enlace inválido.*`, m)
    }
  } catch (e) {
    console.error(e)
    return conn.reply(m.chat, `*⚠️ Error al obtener la información.*`, m)
  }
}

handler.help = ['infoenlace <url>']
handler.tags = ['group']
handler.command = /^info(enlace|link|url)$/i

export default handler
