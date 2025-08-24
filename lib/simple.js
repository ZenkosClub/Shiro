import path from "path";
import fs from "fs";
import fetch from "node-fetch";
import chalk from "chalk";
import PhoneNumber from "awesome-phonenumber";
import { fileTypeFromBuffer } from "file-type";
import { format } from "util";
import { fileURLToPath } from "url";
import { toAudio } from "./converter.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @type {import("@whiskeysockets/baileys")}
 */
const {
  default: _makeWaSocket,
  makeWALegacySocket,
  proto,
  downloadContentFromMessage,
  jidDecode,
  areJidsSameUser,
  generateWAMessage,
  generateForwardMessageContent,
  generateWAMessageFromContent,
  WAMessageStubType,
  extractMessageContent,
  makeInMemoryStore,
  getAggregateVotesInPollMessage,
  prepareWAMessageMedia,
  WA_DEFAULT_EPHEMERAL,
  PHONENUMBER_MCC,
} = (await import("@whiskeysockets/baileys")).default;

export async function makeWASocket(connectionOptions, options = {}) {
  const conn = (global.opts?.legacy ? makeWALegacySocket : _makeWaSocket)(connectionOptions);

  const sock = Object.defineProperties(conn, {
    decodeJid: {
      value(jid) {
        if (!jid || typeof jid !== "string") return null;
        return jid.includes("@") ? jid : jid + "@s.whatsapp.net";
      },
    },
    logger: {
      get() {
        return {
          info: (...args) =>
            console.log(chalk.bold.bgGreen("INFO "), `[${chalk.white(new Date().toUTCString())}]:`, chalk.cyan(format(...args))),
          error: (...args) =>
            console.log(chalk.bold.bgRed("ERROR "), `[${chalk.white(new Date().toUTCString())}]:`, chalk.redBright(format(...args))),
          warn: (...args) =>
            console.log(chalk.bold.bgYellow("WARNING "), `[${chalk.white(new Date().toUTCString())}]:`, chalk.yellow(format(...args))),
          debug: (...args) =>
            console.log(chalk.bold.bgBlue("DEBUG "), `[${chalk.white(new Date().toUTCString())}]:`, chalk.white(format(...args))),
          trace: (...args) =>
            console.log(chalk.grey("TRACE "), `[${chalk.white(new Date().toUTCString())}]:`, chalk.white(format(...args))),
        };
      },
      enumerable: true,
    },
    getFile: {
      async value(PATH, saveToFile = false) {
        let data, filename, res;
        if (Buffer.isBuffer(PATH)) data = PATH;
        else if (/^data:.*?\/.*?;base64,/i.test(PATH)) data = Buffer.from(PATH.split(",")[1], "base64");
        else if (/^https?:\/\//.test(PATH)) data = (res = await (await fetch(PATH)).buffer());
        else if (fs.existsSync(PATH)) {
          filename = PATH;
          data = fs.readFileSync(PATH);
        } else if (typeof PATH === "string") data = Buffer.from(PATH);
        else data = Buffer.alloc(0);

        if (!Buffer.isBuffer(data)) throw new TypeError("Result is not a buffer");
        const type = (await fileTypeFromBuffer(data)) || { mime: "application/octet-stream", ext: ".bin" };
        if (saveToFile && !filename) {
          filename = path.join(__dirname, "../tmp/" + Date.now() + "." + type.ext);
          await fs.promises.writeFile(filename, data);
        }
        return { res, filename, data, ...type, deleteFile: async () => filename && fs.promises.unlink(filename) };
      },
      enumerable: true,
    },
    reply: {
      value(jid, text = "", quoted, options = {}) {
        if (Buffer.isBuffer(text)) return conn.sendFile(jid, text, "file", "", quoted, false, options);
        return conn.sendMessage(jid, { text, ...options }, { quoted, ...options });
      },
      enumerable: true,
    },
    sendFile: {
      async value(jid, path, filename = "", caption = "", quoted, ptt = false, options = {}) {
        const type = await conn.getFile(path, true);
        let { data: file, filename: pathFile } = type;
        let mtype = "document";
        let mimetype = type.mime;

        if (/^image/.test(type.mime)) mtype = options.asSticker ? "sticker" : "image";
        else if (/video/.test(type.mime)) mtype = "video";
        else if (/audio/.test(type.mime)) {
          const conv = await toAudio(file, type.ext);
          file = conv.data;
          pathFile = conv.filename;
          mtype = "audio";
          mimetype = options.mimetype || "audio/mpeg; codecs=opus";
        }
        if (options.asDocument) mtype = "document";

        const message = { ...options, caption, ptt, [mtype]: { url: pathFile }, mimetype, fileName: filename || pathFile.split("/").pop() };

        try {
          return await conn.sendMessage(jid, message, { quoted, ...options });
        } catch {
          return await conn.sendMessage(jid, { ...message, [mtype]: file }, { quoted, ...options });
        }
      },
      enumerable: true,
    },
    sendContact: {
      async value(jid, data, quoted, options = {}) {
        if (!Array.isArray(data[0])) data = [data];
        const contacts = data.map(([number, name]) => {
          const njid = number.replace(/[^0-9]/g, "") + "@s.whatsapp.net";
          const vcard = `
BEGIN:VCARD
VERSION:3.0
N:;${name};;;
FN:${name}
TEL;type=CELL;waid=${number}:${PhoneNumber("+" + number).getNumber("international")}
END:VCARD
          `.trim();
          return { vcard, displayName: name };
        });
        return conn.sendMessage(jid, { contacts: { ...options, contacts, displayName: contacts.length > 1 ? `${contacts.length} contacts` : contacts[0].displayName } }, { quoted, ...options });
      },
      enumerable: true,
    },
    waitEvent: {
      value(eventName, check = () => true, maxTries = 25) {
        return new Promise((resolve, reject) => {
          let tries = 0;
          const listener = (...args) => {
            tries++;
            if (tries > maxTries) reject("Max tries reached");
            else if (check(...args)) {
              conn.ev.off(eventName, listener);
              resolve(...args);
            }
          };
          conn.ev.on(eventName, listener);
        });
      },
      enumerable: true,
    },
    sendNyanCat: {
      async value(jid, text = "", buffer, title, body, url, quoted, options = {}) {
        if (buffer) buffer = (await conn.getFile(buffer)).data;
        const prep = await generateWAMessageFromContent(jid, { extendedTextMessage: { text, contextInfo: { externalAdReply: { title, body, thumbnail: buffer, sourceUrl: url }, mentionedJid: await conn.parseMention(text) } } }, { quoted });
        return conn.relayMessage(jid, prep.message, { messageId: prep.key.id });
      },
      enumerable: true,
    },
    sendPayment: {
      async value(jid, amount, text, quoted, options = {}) {
        return conn.relayMessage(jid, { requestPaymentMessage: { currencyCodeIso4217: "PEN", amount1000: amount, requestFrom: null, noteMessage: { extendedTextMessage: { text, contextInfo: { mentionedJid: conn.parseMention(text) } } } } });
      },
      enumerable: true,
    },
    relayWAMessage: {
      async value(message) {
        if (message.message.audioMessage) await conn.sendPresenceUpdate("recording", message.key.remoteJid);
        else await conn.sendPresenceUpdate("composing", message.key.remoteJid);
        const sent = await conn.relayMessage(message.key.remoteJid, message.message, { messageId: message.key.id });
        conn.ev.emit("messages.upsert", { messages: [message], type: "append" });
        return sent;
      },
      enumerable: true,
    },
    sendButtonMessages: {
      async value(jid, messages, quoted, options = {}) {
        if (messages.length > 1) await conn.sendCarousel(jid, messages, quoted, options);
        else await conn.sendNCarousel(jid, ...messages[0], quoted, options);
      },
      enumerable: true,
    },
    sendNCarousel: {
      async value(jid, text = "", footer = "", buffer, buttons = [], copy = "", urls = [], list = [], quoted, options = {}) {
        let img, video;
        if (buffer) {
          try {
            if (/^https?:\/\//i.test(buffer)) {
              const res = await fetch(buffer);
              const ct = res.headers.get("content-type");
              if (/^image\//i.test(ct)) img = await prepareWAMessageMedia({ image: { url: buffer } }, { upload: conn.waUploadToServer, ...options });
              else if (/^video\//i.test(ct)) video = await prepareWAMessageMedia({ video: { url: buffer } }, { upload: conn.waUploadToServer, ...options });
            } else {
              const type = await conn.getFile(buffer);
              if (/^image\//i.test(type.mime)) img = await prepareWAMessageMedia({ image: type.data }, { upload: conn.waUploadToServer, ...options });
              else if (/^video\//i.test(type.mime)) video = await prepareWAMessageMedia({ video: type.data }, { upload: conn.waUploadToServer, ...options });
            }
          } catch (e) { console.error(e); }
        }
        return { img, video };
      },
      enumerable: true,
    },
  });

  return sock;
}

// Export protoType y serialize para compatibilidad
export const protoType = proto;
export function serialize(conn) { return conn; }
