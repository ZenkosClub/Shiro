let handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('⚠️ Este comando solo funciona en grupos.')

  let id = m.chat
  let groupMetadata = await conn.groupMetadata(id)
  let admins = groupMetadata.participants.filter(p => p.admin)
  let owner = groupMetadata.owner ? groupMetadata.owner : (admins[0] ? admins[0].id : 'No definido')
  let subject = groupMetadata.subject
  let desc = groupMetadata.desc ? groupMetadata.desc : 'Sin descripción'
  let participants = groupMetadata.participants.length
  let adminList = admins.map((a, i) => `*${i+1}.* @${a.id.split('@')[0]}`).join('\n')

  let text = `*🔍 Información del grupo*\n\n` +
             `🏷️ *Nombre:* ${subject}\n` +
             `👑 *Creador:* @${owner.split('@')[0]}\n` +
             `👥 *Miembros:* ${participants}\n` +
             `📌 *Descripción:* ${desc}\n\n` +
             `🛡️ *Administradores:*\n${adminList || 'No hay administradores'}`

  await conn.sendMessage(m.chat, { text, mentions: [owner, ...admins.map(a => a.id)] }, { quoted: m })
}

handler.help = ['inspeccionar']
handler.tags = ['group']
handler.command = ['inspeccionar']

export default handler
