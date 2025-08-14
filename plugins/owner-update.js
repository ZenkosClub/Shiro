import { execSync } from 'child_process'

let handler = async (m, { conn, text, isOwner }) => {
  if (!isOwner) {
    return conn.reply(m.chat,'《✩》Solo los dueños pueden usar este comando.', m)
  }

  const cmd = 'git pull' + (m.fromMe && text ? ` ${text}` : '')
  const stdout = execSync(cmd)
  await conn.reply(m.chat, stdout.toString(), m)
}

handler.command = ['update', 'fix']
handler.help = ['update']
handler.tags = ['owner']

export default handler