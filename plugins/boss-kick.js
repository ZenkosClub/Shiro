import { isJidGroup } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args, participants, isAdmin, isBotAdmin, isOwner, isPrems, usedPrefix, command }) => {
  if (!m.isGroup) return conn.sendMessage(m.chat, {
    text: '《✧》Este comando solo puede ser usado en grupos.',
    contextInfo: {
      ...rcanal.contextInfo
    }
  }, { quoted: m })
  
  if (!isAdmin && !isOwner && !isPrems) return conn.sendMessage(m.chat, {
    text: '《✧》Solo los administradores pueden usar este comando.',
    contextInfo: {
      ...rcanal.contextInfo
    }
  }, { quoted: m })
  
  if (!m.mentionedJid || m.mentionedJid.length === 0) {
    return conn.sendMessage(m.chat, {
      text: `《✧》Debes mencionar al usuario que deseas banear.\n\n> Ejemplo: ${usedPrefix + command} @usuario`,
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
  }
  const who = m.mentionedJid[0]
  
  const ownerNumbers = global.owner.map(v => {
    const id = typeof v === 'string' ? v.replace(/[^0-9]/g, '') : String(v).replace(/[^0-9]/g, '');
    return id + '@s.whatsapp.net';
  });
  
  if (ownerNumbers.includes(who)) {
    return conn.sendMessage(m.chat, {
      text: '《✧》No puedes eliminar a un propietario del bot.',
      contextInfo: {
        ...rcanal.contextInfo
      }
    }, { quoted: m })
  }
  
  if (who === conn.user.jid) return conn.sendMessage(m.chat, {
    text: '《✧》No se puede usar este comando para eliminar al bot.',
    contextInfo: {
      ...rcanal.contextInfo
    }
  }, { quoted: m })
  
  await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
  
  if (!global.db.data.users[who]) {
    global.db.data.users[who] = {}
  }
  global.db.data.users[who].banned = true
  

  const userName = await conn.getName(who)
  const adminName = await conn.getName(m.sender)
  const groupName = (await conn.groupMetadata(m.chat)).subject
  

  return conn.sendMessage(m.chat, {
    text: `✿ Usuario eliminado exitosamente.\n\n✰ Usuario: @${who.split('@')[0]}\n❏ Admin: @${m.sender.split('@')[0]}\n\n✐ Grupo: ${groupName}`,
    contextInfo: {
      ...rcanal.contextInfo,
      mentionedJid: [who, m.sender]
    }
  }, { quoted: m })
}

handler.command = ['ban', 'kick']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
