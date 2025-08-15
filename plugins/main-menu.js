import fs from 'fs'
import { join } from 'path'

let handler = async (m, { conn, usedPrefix }) => {
  try {
    const botActual = conn.user?.jid?.split('@')[0]?.replace(/\D/g, '')
    const configPath = join('./serbots', botActual, 'config.json')

    let names1 = global.namebot1 || 'Shiro'
    let names2 = global.namebot2 || 'Shiro'
    let imgBot = './storage/img/menu.jpg'

    if (fs.existsSync(configPath)) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        if (config.namesbot1) names1 = config.namesbot1
        if (config.namesbot2) names2 = config.namesbot2
        if (config.img && fs.existsSync(config.img)) imgBot = config.img
      } catch {}
    }
    
    const tipo = conn.user.jid === global.conn.user.jid
      ? ''
      : '(𝐒𝐮𝐛-𝐁𝐨𝐭)'
    
    let totalf = Object.values(global.plugins)
      .filter(v => v.help && v.tags)
      .length

    const text = `
︶•︶°︶•︶°︶•︶°︶•︶°︶•︶°︶
> 𝗛ola! Soy ${names1} (｡•̀ᴗ-)✧

╭┈──────────
│ᰔᩚ *Modo* » Privado
│☕︎ *Plugins* » ${totalf}
│🜸 *Baileys* » Multi Devices
╰───────────

╭─ׄ͜─ׄ͜─ׄ͜─ׄ͜─ׄ͜─ׄ͜─ׄ͜─ׄ͜─ׄ͜─ׄ͜─ׄ͜
> ✿ Crea un *Sub-Bot* con tu número utilizando *#qr* o *#code*
╰ׅ─ׄ͜─ׄ͜─ׄ͜─ׄ͜─ׄ͜─ׄ͜─ׄ͜─ׄ͜─ׄ͜─ׄ͜─ׄ͜

╭┈❈─ׄ͜─ׄ͜─ׄ͜╴
   _ᗰᗩＩＮ_
╶͜─ׄ͜─ׄ͜─❈┈╯
> ✐ Comandos de *main* para funciones principales y importantes.
➨ #menu #help #all
> ❈ Muestra todos los comandos y categorías del bot.
➨ #status #p #ping
> ❈ Verifica el estado y la velocidad del bot.

╭┈❈─ׄ͜─ׄ͜─ׄ͜╴
   _ՏＯᑕＫᗴＴ_
╶͜─ׄ͜─ׄ͜─❈┈╯
> ✐ Comandos de *socket* para gestionar conexión y datos.
➨ #code #qr
> ❈ Conecta un subbot por código o escaneando QR.
➨ #setbotname #setname
> ❈ Cambia el nombre del bot.
➨ #sockets #bots
> ❈ Ver el número de bots activos.

╭┈❈─ׄ͜─ׄ͜─ׄ͜╴
   _ᗝᗯＮＥＲ_
╶͜─ׄ͜─ׄ͜─❈┈╯
> ✐ Comandos de *owner* para funciones exclusivas.
➨ #update #fix
> ❈ Actualiza todo lo del bot.
`.trim()

    await conn.sendMessage(m.chat, {
  text,
  contextInfo: {
    externalAdReply: {
      title: `${names1} ${tipo}`,
      body: `${names2}, By Zenkos Club`,
      mediaType: 1,
      sourceUrl: "https://whatsapp.com/channel/0029Vb5Vinf72WTo11c5hJ3O",
      thumbnail: fs.readFileSync(imgBot),
      renderLargerThumbnail: true
    }
  }
}, { quoted: m })

  } catch (err) {
    console.error(err)
  }
}

handler.command = ['menu', 'help', 'all']
handler.help = ['menu']
handler.tags = ['main']
export default handler
