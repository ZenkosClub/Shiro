import fs from 'fs'
import path from 'path'
import { join } from 'path'

let handler = async (m, { conn, text, isAdmin, isOwner, isPrems }) => {
  if (!isAdmin && !isOwner && !isPrems) {
    return conn.reply(m.chat, '《✧》Solo los administradores pueden usar este comando.', m)
  }

  if (!text || !text.replace(/[^0-9]/g, '')) {
    return conn.reply(m.chat, `《✧》Debes escribir o mencionar el número del bot que quieres establecer como primario.\n\n> Ejemplo: #setprimary 51987654321`, m)
  }

  let number = text.replace(/[^0-9]/g, '')
  let botJid = number + '@s.whatsapp.net'
  let subbotPath = path.join('./serbots', number, 'creds.json')

  if (!fs.existsSync(subbotPath)) {
    return conn.reply(m.chat, `El número *${number}* no corresponde a un Subbot válido (no se encontró *creds.json* en ./serbots).`, m)
  }

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  global.db.data.chats[m.chat].primaryBot = botJid

  return conn.reply(m.chat, `✿ Bot establecido como primario en este grupo.\n\n✰ Bot: *@${number}*\n❏ Admin: @${m.sender.split('@')[0]}`, m, { mentions: [botJid, m.sender] })
}

handler.command = ['setprimary']
handler.help = ['setprimary']
handler.tags = ['socket']

export default handler
