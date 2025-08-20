import { extractGroupInvite } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('📌 Envía un enlace de grupo o canal.')

  let linkRegex = /(https?:\/\/chat\.whatsapp\.com\/[0-9A-Za-z]{20,24})/i
  let link = text.match(linkRegex) ? text.match(linkRegex)[0] : null

  if (!link) return m.reply('❌ No encontré ningún enlace válido.')

  try {
    // Extraer el código de invitación
    let code = link.split('/').pop()

    // Obtener info del grupo/canal
    let res = await conn.groupGetInviteInfo(code)

    if (!res) return m.reply('⚠️ No pude obtener información de ese enlace.')

    let txt = `╭─❖ 「 *ENLACE INSPECTOR* 」\n`
    txt += `├ 🔑 ID: ${res.id || '-'}\n`
    txt += `├ 📌 Nombre: ${res.subject || '-'}\n`
    txt += `├ 👤 Creado por: ${res.owner || '-'}\n`
    txt += `├ 📅 Creado: ${res.creation ? new Date(res.creation * 1000).toLocaleString() : '-'}\n`
    txt += `├ 👥 Participantes: ${res.size || 0}\n`
    txt += `├ 📖 Descripción:\n${res.desc || '-'}\n`
    txt += `╰───────────────❖`

    // Enviar foto si existe
    if (res?.subjectPicture) {
      await conn.sendMessage(m.chat, {
        image: { url: res.subjectPicture },
        caption: txt
      }, { quoted: m })
    } else {
      await m.reply(txt)
    }

  } catch (e) {
    console.error(e)
    m.reply('❌ Error al inspeccionar el enlace.')
  }
}

handler.help = ['inspect <enlace>']
handler.tags = ['info']
handler.command = /^inspect$/i

export default handler
