let handler = async (m, { conn, args }) => {
  try {
    // Si se pasa un ID de grupo/canal en args
    let id = args[0] ? args[0] : m.chat

    // Para grupos
    if (id.endsWith('@g.us')) {
      let info = await conn.groupMetadata(id)
      let txt = `
🆔 ID: ${info.id}
📛 Nombre: ${info.subject}
👤 Creado por: ${info.owner || 'Desconocido'}
📅 Creado el: ${new Date(info.creation * 1000).toLocaleString()}
👥 Participantes: ${info.participants.length}
📝 Descripción: ${info.desc ? info.desc : 'Sin descripción'}
      `
      await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
    }

    // Para canales
    else if (id.endsWith('@broadcast')) {
      let info = await conn.groupMetadata(id).catch(() => null)
      let txt = `
🆔 ID: ${id}
📛 Nombre: ${info?.subject || 'Canal sin nombre'}
📝 Descripción: ${info?.desc || 'Sin descripción'}
      `
      await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
    } else {
      m.reply('🚩 Debes dar un enlace válido de grupo o canal.')
    }

  } catch (e) {
    console.error(e)
    m.reply('❌ Error al obtener información.')
  }
}

handler.command = /^inspect$/i
export default handler
