import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args, isAdmin }) => {
  if (!m.isGroup) return conn.reply(m.chat, '🚩 Este comando solo funciona en *grupos o canales*.', m)

  try {
    const metadata = await conn.groupMetadata(m.chat)
    const owner = metadata.owner ? '@' + metadata.owner.split('@')[0] : 'No definido'
    const creation = new Date(metadata.creation * 1000).toLocaleString()
    const link = 'https://chat.whatsapp.com/' + (await conn.groupInviteCode(m.chat))

    let info = `*🔎 INSPECCIÓN COMPLETA*
    
🏷️ *Nombre:* ${metadata.subject}
🆔 *ID:* ${metadata.id}
👤 *Creador/Owner:* ${owner}
📅 *Creado el:* ${creation}
👥 *Participantes:* ${metadata.participants.length}
🔗 *Enlace:* ${link}
📖 *Descripción:* ${metadata.desc || 'Sin descripción'}
`

    await conn.sendMessage(m.chat, { text: info, mentions: conn.parseMention(info) }, { quoted: m })

  } catch (e) {
    console.log(e)
    conn.reply(m.chat, '❌ Error al inspeccionar el grupo/canal.', m)
  }
}

handler.command = /^(inspect|inspeccionar|info)$/i
handler.group = true

export default handler