import fs from 'fs'
import path from 'path'

let handler = async (m, { text, isAdmin, isOwner, isPrems }) => {
  if (!isAdmin && !isOwner && !isPrems) {
    return m.reply('《✧》Solo los administradores pueden usar este comando.')
  }

  if (!text || !text.replace(/[^0-9]/g, '')) {
    return m.reply('Debes etiquetar o escribir el número del bot que quieres hacer principal en este grupo.')
  }

  let number = text.replace(/[^0-9]/g, '')
  let botJid = number + '@s.whatsapp.net'
  let subbotPath = path.join('./serbots', number, 'creds.json')

  if (!fs.existsSync(subbotPath)) {
    return m.reply(`El número *${number}* no corresponde a un Subbot válido (no se encontró su *creds.json* en JadiBots).`)
  }

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  global.db.data.chats[m.chat].primaryBot = botJid

  return m.reply(
    `✿ Bot establecido como primario en este grupo.\n\n✰ Bot: *@${number}*\n❏ Admin: @${m.sender.split('@')[0]}`, 
    { mentions: [botJid, m.sender] }
  )
}

handler.help = ['setprimary @bot | número']
handler.tags = ['serbot']
handler.command = ['setprimary']

export default handler
