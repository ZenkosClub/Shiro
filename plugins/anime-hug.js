import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  let user = m.mentionedJid[0]
  if (!user) return m.reply('ᰔᩚ Debes *mencionar* a alguien.\n> ꕥ Ejemplo: *#hug @usuario*')

  let res = await fetch('https://api.waifu.pics/sfw/hug')
  let json = await res.json()

  await conn.sendMessage(m.chat, { 
    text: `ᰔᩚ @${m.sender.split('@')[0]} le dio un *abrazo* a @${user.split('@')[0]}`, 
    contextInfo: { mentionedJid: [m.sender, user] } 
  }, { quoted: m })

  await conn.sendFile(m.chat, json.url, 'hug.gif', '', m)
}

handler.command = ['hug']
handler.help = ['hug']
handler.tags = ['anime']
export default handler