import speed from 'performance-now'
import { exec } from 'child_process'
import { totalmem, freemem } from 'os'
import { sizeFormatter } from 'human-readable'
import fs from 'fs'

const format = sizeFormatter({
  std: 'JEDEC',
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
})

let handler = async (m, { conn }) => {
  const timestamp = speed()
  const latensi = speed() - timestamp
  const muptimeMs = await getMuptime()
  const muptime = clockString(muptimeMs)
  const cpuUsage = await getCpuUsage()

  exec('cat /proc/cpuinfo', (error, stdout) => {
    const cpuInfo = stdout.toString('utf-8')
    const procesador = (cpuInfo.match(/model name\s*:\s*(.*)/) || [])[1] || 'Unknown'
    const cpuMHz = (cpuInfo.match(/cpu MHz\s*:\s*(.*)/) || [])[1] || 'Unknown'

    let txt = `「✦」Estado del servidor\n\n`
    txt += `❖ Velocidad » *${latensi.toFixed(4)} ms*\n`
    txt += `✧ Procesador » *${procesador}*\n`
    txt += `✦ CPU » *${cpuMHz} MHz* (${cpuUsage.toFixed(2)} % uso)\n`
    txt += `⟁ RAM » *${format(totalmem() - freemem())}* / *${format(totalmem())}*\n`
    txt += `⟐ Tiempo activo » *${muptime}*`

    conn.reply(m.chat, txt, m)
  })
}

handler.command = ['status', 'p', 'ping']
handler.help = ['status']
handler.tags = ['main']
export default handler

function clockString(ms) {
  const d = isNaN(ms) ? '--' : Math.floor(ms / 86400000)
  const h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24
  const m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  const s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [d, 'd ', h, 'h ', m, 'm ', s, 's ']
    .map(v => v.toString().padStart(2, 0))
    .join('')
}

function getCpuUsage() {
  return new Promise(resolve => {
    const start = readCpuTimes()
    setTimeout(() => {
      const end = readCpuTimes()
      const idleDiff = end.idle - start.idle
      const totalDiff = end.total - start.total
      const usage = (1 - idleDiff / totalDiff) * 100
      resolve(usage)
    }, 100)
  })
}

function readCpuTimes() {
  const data = fs.readFileSync('/proc/stat', 'utf8')
  const cpuLine = data.split('\n')[0]
  const times = cpuLine.trim().split(/\s+/).slice(1).map(Number)
  const idle = times[3]
  const total = times.reduce((acc, val) => acc + val, 0)
  return { idle, total }
}

function getMuptime() {
  return new Promise(resolve => {
    exec('cat /proc/uptime', (error, stdout) => {
      if (error) return resolve(0)
      resolve(parseFloat(stdout.split(' ')[0]) * 1000)
    })
  })
}
