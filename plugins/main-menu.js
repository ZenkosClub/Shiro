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
> ✐ *_Comandos para funciones principales y importantes._*
ᰔᩚ *#menu #help #all*
> ꕥ Muestra todos los comandos y categorías del bot.
ᰔᩚ *#status #p #ping*
> ꕥ Verifica el estado y la velocidad del bot.

╭┈❈─ׄ͜─ׄ͜─ׄ͜╴
   _ՏＯᑕＫᗴＴ_
╶͜─ׄ͜─ׄ͜─❈┈╯
> ✐ *_Comandos para gestionar conexión y datos del bot._*
ᰔᩚ *#code #qr*
> ꕥ Conecta un subbot por código o escaneando QR.
ᰔᩚ *#setbotname #setname*
> ꕥ Cambia el nombre del bot.
ᰔᩚ *#sockets #bots*
> ꕥ Ve el número de bots activos.

╭┈❈─ׄ͜─ׄ͜─ׄ͜╴
   _ᗷＯＳＳ_
╶͜─ׄ͜─ׄ͜─❈┈╯
> ✐ *_Comandos para administradores del grupo._*
ᰔᩚ *#kick #eject*
> ꕥ Elimina a un miembro del grupo.
ᰔᩚ *#tag #say #tagall*
> ꕥ Envía un mensaje mencionando a todos los miembros del grupo.
ᰔᩚ *#promote #authorize #grant*
> ꕥ Concede permisos de administrador a un usuario.
ᰔᩚ *#demote #degrade #revoke*
> ꕥ Quita permisos de administrador a un usuario.
ᰔᩚ *#groupname #gbname #namegb #setgroupname*
> ꕥ Cambia el nombre del grupo.
ᰔᩚ *#groupimage #gbimg #imagegb #setgroupimg*
> ꕥ Cambia la imagen del grupo.
ᰔᩚ *#close*
> ꕥ Cierra el grupo para que solo los administradores puedan enviar mensajes.
ᰔᩚ *#open*
> ꕥ Abre el grupo para que todos los usuarios puedan enviar mensajes.

╭┈❈─ׄ͜─ׄ͜─ׄ͜╴
   _ᗝᗯＮＥＲ_
╶͜─ׄ͜─ׄ͜─❈┈╯
> ✐ *_Comandos para funciones exclusivas del dueño._*
ᰔᩚ *#update #fix*
> ꕥ Actualiza completamente todo lo del bot.
`.trim()

    await conn.sendMessage(m.chat, {
  text,
  contextInfo: {
    externalAdReply: {
      title: `${names1} ${tipo}`,
      body: `${names2}, By Zenkos Club`,
      mediaType: 1,
      sourceUrl: "https://whatsapp.com/channel/0029VbAZUQ3002T9KZfx2O1M",
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
