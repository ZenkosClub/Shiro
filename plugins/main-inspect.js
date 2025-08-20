import { extractGroupInvite, getHttpStream } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) return conn.sendMessage(m.chat, { 
    text: `✦ Debes dar un link.\n\nEjemplo: *${usedPrefix + command} https://chat.whatsapp.com/xxxx*` 
  }, { quoted: m })

  let link = args[0]
  let code = extractGroupInvite(link)

  try {
    // ----------- INSPECCIONAR GRUPOS -----------
    if (link.includes("chat.whatsapp.com/")) {
      let res = await conn.groupGetInviteInfo(code)
      let info = `
╭─「 🔍 *INSPECCIÓN DE GRUPO* 」
│ 📛 Nombre: ${res.subject || 'Sin nombre'}
│ 🆔 ID: ${res.id}
│ 👤 Creador: ${res.creator || 'Desconocido'}
│ 👥 Participantes: ${res.size}
│ 🛡️ Admins: ${res.participants.filter(p => p.admin).length}
│ 📝 Descripción: ${res.desc || 'Sin descripción'}
╰───────────────
`.trim()

      return conn.sendMessage(m.chat, { text: info }, { quoted: m })
    }

    // ----------- INSPECCIONAR CANALES -----------
    if (link.includes("whatsapp.com/channel/")) {
      // Extraemos el ID del canal
      let channelId = link.split("/channel/")[1]

      let metadata = await conn.newsletterMetadata(channelId)
      let info = `
╭─「 📡 *INSPECCIÓN DE CANAL* 」
│ 📛 Nombre: ${metadata.name || 'Sin nombre'}
│ 🆔 ID: ${metadata.id}
│ 👤 Creador: ${metadata.creatorJid || 'Desconocido'}
│ 👥 Seguidores: ${metadata.subscribers || 0}
│ 📝 Descripción: ${metadata.description || 'Sin descripción'}
╰───────────────
`.trim()

      return conn.sendMessage(m.chat, { text: info }, { quoted: m })
    }

    return m.reply("❌ El link no es válido para inspección.")
  } catch (e) {
    console.log(e)
    return m.reply("❌ Error al inspeccionar el enlace.")
  }
}

handler.help = ['inspect <link>']
handler.tags = ['group', 'info']
handler.command = /^inspect$/i

export default handler
