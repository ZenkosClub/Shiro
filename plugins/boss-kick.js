let handler = async (m, { conn, isAdmin }) => {
  if (!m.isGroup) return
  if (!isAdmin) return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Este comando está *restringido*.\n> ꕥ Solo los administradores pueden usarlo.', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })

  const whoRaw = (m.mentionedJid && m.mentionedJid[0]) 
    || m.quoted?.sender 
    || m.quoted?.participant 
    || m.quoted?.key?.participant 
    || m.quoted?.contextInfo?.participant 
    || null

  if (!whoRaw) return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Acción inválida.\n> ꕥ Debes mencionar al usuario que deseas *eliminar*.', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })

  const who = whoRaw.replace(/:[0-9]+/, '')

  const ownerNumbers = (global.owner || []).map(v => {
    const id = typeof v === 'string' ? v.replace(/[^0-9]/g, '') : String(v).replace(/[^0-9]/g, '')
    return id + '@s.whatsapp.net'
  })

  if (ownerNumbers.includes(who)) return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Acción denegada.\n> ꕥ No puedo eliminar a un *owner*.', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })

  if (who === conn.user.jid) return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Acción inválida.\n> ꕥ No puedo eliminarme a mí *mismo*.', 
    contextInfo: { ...(m.contextInfo || {}) } 
  }, { quoted: m })

  try {
    const meta = await conn.groupMetadata(m.chat)
    const inGroup = Array.isArray(meta?.participants) && meta.participants.some(p => p?.id === who)
    if (!inGroup) return conn.sendMessage(m.chat, { 
      text: 'ᰔᩚ Acción inválida.\n> ꕥ El usuario no está en este *grupo*.', 
      contextInfo: { ...(m.contextInfo || {}) } 
    }, { quoted: m })
  } catch {}

  await conn.groupParticipantsUpdate(m.chat, [who], 'remove')

  if (!global.db.data.users[who]) global.db.data.users[who] = {}
  global.db.data.users[who].banned = true

  return conn.sendMessage(m.chat, { 
    text: 'ᰔᩚ Usuario eliminado del *grupo*.\n> ꕥ La acción fue ejecutada correctamente.', 
    contextInfo: { ...(m.contextInfo || {}), mentionedJid: [who, m.sender] } 
  }, { quoted: m })
}

handler.command = ['kick', 'eject']
handler.help = ['kick']
handler.tags = ['boss']
export default handler
