let handler = async (m, { conn, text, isAdmin, isOwner, isPrems }) => {

  if (!m.isGroup) return conn.sendMessage(m.chat, {
    text: '*[❗] Este comando solo puede ser usado en grupos.*',
    contextInfo: {
      ...rcanal.contextInfo
    }
  }, { quoted: m })
  
  if (!isAdmin && !isOwner && !isPrems) return conn.sendMessage(m.chat, {
    text: '*[❗] Solo los administradores pueden usar este comando.*',
    contextInfo: {
      ...rcanal.contextInfo
    }
  }, { quoted: m })
  
  try {

    const groupMetadata = await conn.groupMetadata(m.chat)
    const participants = groupMetadata.participants
    
    await conn.sendMessage(m.chat, { 
      text: text || ' ',
      mentions: participants.map(p => p.id)
    }, { quoted: m })
    
  } catch (e) {
    console.error('Error en comando tag-all:', e)
    conn.sendMessage(m.chat, {
      text: '*[❗] Ocurrió un error al intentar etiquetar a los miembros del grupo.*',
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
  }
}

handler.help = ['#tag']
handler.tags = ['grupos']
handler.command = ['tag', 'todos', 'mencionartodos']

export default handler
