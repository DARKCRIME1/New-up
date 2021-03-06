/* Copyright (C) 2021 T-REX
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
T-REX HIRUWA
*/

const fs = require("fs");
const path = require("path");
const events = require("./events");
const chalk = require('chalk');
const config = require('./config');
const makeWASocket, { AnyMessageContent, delay, DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore, useSingleFileAuthState } require ('@adiwajshing/baileys')
const { Boom } require ('@hapi/boom')
const P require ('pino')
const {Message, StringSession, Image, Video} = require('./Trex/');
const { DataTypes } = require('sequelize');
const { getMessage } = require("./plugins/sql/greetings");
const axios = require('axios');
const got = require('got');

// ════════════════════SQL🍁🍁
const TrexDB = config.DATABASE.define('Trex', {
    info: {
      type: DataTypes.STRING,
      allowNull: false
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

fs.readdirSync('./plugins/sql/').forEach(plugin => {
    if(path.extname(plugin).toLowerCase() == '.js') {
        require('./plugins/sql/' + plugin);
    }
});

const plugindb = require('./plugins/sql/plugin');
var OWN = { ff: '94771039631,0' }
String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
      return typeof args[i] != 'undefined' ? args[i++] : '';
   });
};
if (!Date.now) {
    Date.now = function() { return new Date().getTime(); }
}

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

// the store maintains the data of the WA connection in memory
// can be written out to a file & read from it
const store = makeInMemoryStore({ logger: P().child({ level: 'debug', stream: 'store' }) })
store.readFromFile('./baileys_store_multi.json')
// save every 10s
setInterval(() => {
	store.writeToFile('./baileys_store_multi.json')
}, 10_000)

const { state, saveState } = useSingleFileAuthState('./auth_info_multi.json')

// start a connection
const startSock = async() => {
	// fetch latest version of WA Web
	const { version, isLatest } = await fetchLatestBaileysVersion()
	console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`)

	const sock = makeWASocket({
		version,
		logger: P({ level: 'trace' }),
		printQRInTerminal: true,
		auth: state,
		// implement to handle retries
		getMessage: async key => {
			return {
				conversation: 'hello'
			}
		}
	})

	store.bind(sock.ev)

	const sendMessageWTyping = async(msg: AnyMessageContent, jid: string) => {
		await sock.presenceSubscribe(jid)
		await delay(500)

		await sock.sendPresenceUpdate('composing', jid)
		await delay(2000)

		await sock.sendPresenceUpdate('paused', jid)

		await sock.sendMessage(jid, msg)
	}
    
	sock.ev.on('chats.set', item => console.log(`recv ${item.chats.length} chats (is latest: ${item.isLatest})`))
	sock.ev.on('messages.set', item => console.log(`recv ${item.messages.length} messages (is latest: ${item.isLatest})`))
	sock.ev.on('contacts.set', item => console.log(`recv ${item.contacts.length} contacts`))

	sock.ev.on('messages.upsert', async m => {
		console.log(JSON.stringify(m, undefined, 2))
        
		const msg = m.messages[0]
		if(!msg.key.fromMe && m.type === 'notify') {
			console.log('replying to', m.messages[0].key.remoteJid)
			await sock!.sendReadReceipt(msg.key.remoteJid, msg.key.participant, [msg.key.id])
			await sendMessageWTyping({ text: 'Hello there!' }, msg.key.remoteJid)
		}
        
	})

	sock.ev.on('messages.update', m => console.log(m))
	sock.ev.on('message-receipt.update', m => console.log(m))
	sock.ev.on('presence.update', m => console.log(m))
	sock.ev.on('chats.update', m => console.log(m))
	sock.ev.on('contacts.upsert', m => console.log(m))

	sock.ev.on('connection.update', (update) => {
		const { connection, lastDisconnect } = update
		if(connection === 'close') {
			// reconnect if not logged out
			if((lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
				startSock()
			} else {
				console.log('connection closed')
			}
		}
        
		console.log('connection update', update)
	})
	// listen for when the auth credentials is updated
	sock.ev.on('creds.update', saveState)

	return sock
}

startSock()
    
// ════════════════════WA CONNECTION🍁🍁🍁
    
// ════════════════════PLUGGINS SUCCESS🍁🍁🍁
        console.log(
            chalk.green.bold('🧨🪔✨ T-REX WHATSAPP BOT WORKING!▷')
       );
        
        console.log(
            chalk.blueBright.italic('🪔🎇✨ I WISH YOU HAPPY NEW YEAR 🪔 BE SAFE AND HAPPY 🧨 WITH YOUR FAMILY 👨‍👩‍👦🎆🪔')
        );
        
         if (config.LANG == 'EN') {
             await conn.sendMessage(conn.user.jid, fs.readFileSync("./src/IMG-20210910-WA0097.png"), MessageType.image, { caption: `🪔 HAPPY NEW YEAR 🧨!!  ${conn.user.name}! \n\n*👿 Welcome To T-REX :│🍁*\n\n\n Your Bot Working  As ${config.WORKTYPE} 👿.\n\n*👿│T-REX WORKING Your Account*\n\n*🍁▷ Use the 🚀.trex command to get bot menu...*\n\n\n*👿 T-REX is a powerfull WhatsApp robot developed by Hiruwa.*\n\n*🚀 This is your LOG number. Avoid using the command here.\n\n👿 .new Command use for new items*\n\n`});
             
         } else if (config.LANG == 'SI') {
             await conn.sendMessage(conn.user.jid, fs.readFileSync("./src/IMG-20210910-WA0097.png"), MessageType.image, { caption: `🪔 සුබ අලුත් අවෘද්දක් වේවා !!🧨 ${conn.user.name}! \n\n*👿 සාදරයෙන් T-REX වෙත පිලිගන්නවා :│🍁*\n\n\n ඔබේ Bot ${config.WORKTYPE} ලෙස ක්‍රියාකරයි.\n\n*👿│T-REX ඔබගේ ගිණුමේ දැන් සක්‍රියයි*\n\n*🍁 T-REX bot සම්පූර්න මෙනුව ලබා ගැනීමට 👿.trex විධානය භාවිතා කරන්න...*\n\n\n*👿 T-REX යනූ සීඝ්‍රයෙන් වර්ධනය වන Whatsapp රොබෝවෙකි..T-REX වෙත ලැබෙන නව අංග හා යතාවත්කාලින කිරිම් ලබා ගැනීමට🍁 .new විධානය භාවිතා කරන්න..*\n\n*😈 මෙය ඔබගේ LOG අංකයයි.මෙහි විධාන භාවිතයෙන් වළකින්න.*\n\n`});
             
         } else {
             await conn.sendMessage(conn.user.jid, fs.readFileSync("./src/IMG-20210910-WA0097.png"), MessageType.image, { caption: `🪔 HAPPY NEW YEAR !!🧨  ${conn.user.name}! \\nn*👿 Welcome To T-REX :│🍁*\n\n\n Your Bot Working  As ${config.WORKTYPE} 👿.\n\n*👿 │T-REX WORKING Your Account*\n\n*🍁▷ Use the 🚀.trex command to get bot menu...*\n\n\n*👿 T-REX is a powerfull WhatsApp robot developed by Hiruwa.*\n\n*🚀 This is your LOG number. Avoid using the command here.\n\n👿 .new Command use for new items*\n\n`});
        }
     });
    
// ════════════════════LOGIN MESSAGE🍁🍁
    setInterval(async () => { 
        if (config.AUTOBIO == 'true') {
            if (conn.user.jid.startsWith('90')) { 
                var ov_time = new Date().toLocaleString('LK', { timeZone: 'Europe/Istanbul' }).split(' ')[1]
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time + '\n\nPOWERD BY 🪔 T-REX BOT 🧨✨'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('994')) { 
                var ov_time = new Date().toLocaleString('AZ', { timeZone: 'Asia/Baku' }).split(' ')[1]
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time + '\n\nPOWERD BY 🪔 T-REX BOT 🧨✨'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('94')) { 
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                var ov_time = new Date().toLocaleString('LK', { timeZone: 'Asia/Colombo' }).split(' ')[1]
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time +'\n\nPOWERD BY 🪔 T-REX BOT 🧨✨'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('351')) { 
                var ov_time = new Date().toLocaleString('PT', { timeZone: 'Europe/Lisbon' }).split(' ')[1]
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time + '\n\nPOWERD BY 🪔 T-REX BOT 🧨✨'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('75')) { 
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                var ov_time = new Date().toLocaleString('RU', { timeZone: 'Europe/Kaliningrad' }).split(' ')[1]
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time +'\n\nPOWERD BY 🪔 T-REX BOT 🧨✨'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('91')) { 
                var ov_time = new Date().toLocaleString('HI', { timeZone: 'Asia/Kolkata' }).split(' ')[1]
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time + '\n\nPOWERD BY 🪔 T-REX BOT 🧨✨'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('62')) { 
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                var ov_time = new Date().toLocaleString('ID', { timeZone: 'Asia/Jakarta' }).split(' ')[1]
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time +'\n\nPOWERD BY 🪔 T-REX BOT 🧨✨'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('49')) { 
                var ov_time = new Date().toLocaleString('DE', { timeZone: 'Europe/Berlin' }).split(' ')[1]
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time + '\n\nPOWERD BY 🪔 T-REX BOT 🧨✨'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('61')) {  
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                var ov_time = new Date().toLocaleString('AU', { timeZone: 'Australia/Lord_Howe' }).split(' ')[1]
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time +'\n\nPOWERD BY 🪔 T-REX BOT 🧨✨'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('55')) { 
                var ov_time = new Date().toLocaleString('BR', { timeZone: 'America/Noronha' }).split(' ')[1]
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time + '\n\nPOWERD BY 🪔 T-REX BOT 🧨✨'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('33')) {
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                var ov_time = new Date().toLocaleString('FR', { timeZone: 'Europe/Paris' }).split(' ')[1]
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time +'\n\nPOWERD BY 🪔 T-REX BOT 🧨✨'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('34')) { 
                var ov_time = new Date().toLocaleString('ES', { timeZone: 'Europe/Madrid' }).split(' ')[1]
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time + '\n\nPOWERD BY 🪔 T-REX BOT 🧨✨'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('44')) { 
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                var ov_time = new Date().toLocaleString('GB', { timeZone: 'Europe/London' }).split(' ')[1]
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time +'\n\nPOWERD BY 🪔 T-REX BOT 🧨✨'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('39')) {  
                var ov_time = new Date().toLocaleString('IT', { timeZone: 'Europe/Rome' }).split(' ')[1]
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time + '\n\nPOWERD BY 🪔 T-REX BOT 🧨✨'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('7')) { 
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                var ov_time = new Date().toLocaleString('KZ', { timeZone: 'Asia/Almaty' }).split(' ')[1]
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time +'\n\nPOWERD BY 🪔 T-REX BOT 🧨✨'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('998')) {  
                var ov_time = new Date().toLocaleString('UZ', { timeZone: 'Asia/Samarkand' }).split(' ')[1]
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time + '\n\nPOWERD BY 🪔 T-REX BOT 🧨✨'
                await conn.setStatus(biography)
            }
            else if (conn.user.jid.startsWith('993')) { 
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                var ov_time = new Date().toLocaleString('TM', { timeZone: 'Asia/Ashgabat' }).split(' ')[1]
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time +'\n\nPOWERD BY 🪔 T-REX BOT 🧨✨'
                await conn.setStatus(biography)
            }
            else {
                const get_localized_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                var utch = new Date().toLocaleDateString(config.LANG, get_localized_date)
                var ov_time = new Date().toLocaleString('EN', { timeZone: 'America/New_York' }).split(' ')[1]
                const biography = '📅 ' + utch + '\n⌚ ' + ov_time +'\n\nPOWERD BY 🪔 T-REX BOT 🧨✨'
                await conn.setStatus(biography)
            }
        }
    }, 7890);
// ════════════════════AUTO BIO◽◽◽◽◽    
    setInterval(async () => { 
        var getGMTh = new Date().getHours()
        var getGMTm = new Date().getMinutes()
         
        while (getGMTh == 19 && getGMTm == 1) {
            var announce = ''
            if (config.LANG == 'EN') announce = '📢◉◉ \n👾Announcement SYSTEM 🔘'
            if (config.LANG == 'SI') announce = '📢◉◉ \n👾නිවේදන පද්ධතිය 🔘'
            if (config.LANG == 'ID') announce = '📢◉◉ \n👾Announcement System 🔘'
            
            let video = 'https://youtu.be/oWDW6_Ewi1U'
            let image = 'https://telegra.ph/file/10bdbaab2d4d163e2affa.jpg'
            
            if (video.includes('http') || video.includes('https')) {
                var VID = video.split('youtu.be')[1].split(' ')[0].replace('/', '')
                var yt = ytdl(VID, {filter: format => format.container === 'mp4' && ['1080p','720p', '480p', '360p', '240p', '144p'].map(() => true)});
                yt.pipe(fs.createWriteStream('./' + VID + '.mp4'));
                yt.on('end', async () => {
                    return await conn.sendMessage(conn.user.jid,fs.readFileSync('./' + VID + '.mp4'), MessageType.video, {caption: announce, mimetype: Mimetype.mp4});
                });
            } else {
                if (image.includes('http') || image.includes('https')) {
                    var imagegen = await axios.get(image, { responseType: 'arraybuffer'})
                    return await conn.sendMessage(conn.user.jid, Buffer.from(imagegen.data), MessageType.image, { caption: announce })
                } else {
                    return await conn.sendMessage(conn.user.jid, announce, MessageType.text)
                }
            }
        }
    }, 50000);
 // ════════════════════ANNOUNCEMENT🍁🍁🍁
    conn.on('chat-update', async m => {
        if (!m.hasNewMessage) return;
        if (!m.messages && !m.count) return;
        let msg = m.messages.all()[0];
        if (msg.key && msg.key.remoteJid == 'status@broadcast') return;

        if (config.NO_ONLINE) {
            await conn.updatePresence(msg.key.remoteJid, Presence.unavailable);
        }
// ════════════════════NO ONLINE🍁🍁

        if (config.WELCOME == 'pp' || config.WELCOME == 'Pp' || config.WELCOME == 'PP' || config.WELCOME == 'pP' ) {
            if (msg.messageStubType === 32 || msg.messageStubType === 28) {
                    // Thanks to Lyfe
                    var gb = await getMessage(msg.key.remoteJid, 'goodbye');
                    if (gb !== false) {
                        let pp
                        try { pp = await conn.getProfilePicture(msg.messageStubParameters[0]); } catch { pp = await conn.getProfilePicture(); }
                        await axios.get(pp, {responseType: 'arraybuffer'}).then(async (res) => {
                        await conn.sendMessage(msg.key.remoteJid, res.data, MessageType.image, {caption:  gb.message });  });

                    }
                    return;
                } else if (msg.messageStubType === 27 || msg.messageStubType === 31) {
                    // welcome
                    var gb = await getMessage(msg.key.remoteJid);
                    if (gb !== false) {
                       let pp
                        try { pp = await conn.getProfilePicture(msg.messageStubParameters[0]); } catch { pp = await conn.getProfilePicture(); }
                        await axios.get(pp, {responseType: 'arraybuffer'}).then(async (res) => {
                        await conn.sendMessage(msg.key.remoteJid, res.data, MessageType.image, {caption:  gb.message }); });
                    }
                    return;
                }
            }
            else if (config.WELCOME == 'gif' || config.WELCOME == 'Gif' || config.WELCOME == 'GIF' || config.WELCOME == 'GIf' ) {
            if (msg.messageStubType === 32 || msg.messageStubType === 28) {
                    
                    var gb = await getMessage(msg.key.remoteJid, 'goodbye');
                    if (gb !== false) {
                        var tn = await axios.get(config.BYE_GIF, { responseType: 'arraybuffer' })
                        await conn.sendMessage(msg.key.remoteJid, Buffer.from(tn.data), MessageType.video, {mimetype: Mimetype.gif, caption: gb.message});
                    }
                    return;
                } else if (msg.messageStubType === 27 || msg.messageStubType === 31) {
                    
                    var gb = await getMessage(msg.key.remoteJid);
                    if (gb !== false) {
                    var tn = await axios.get(config.WELCOME_GIF, { responseType: 'arraybuffer' })
                    await conn.sendMessage(msg.key.remoteJid, Buffer.from(tn.data), MessageType.video, {mimetype: Mimetype.gif, caption: gb.message});
                    }
                    return;
                }
             }
// ════════════════════WELCOME & GOODBYE
        events.commands.map(
            async (command) =>  {
                if (msg.message && msg.message.imageMessage && msg.message.imageMessage.caption) {
                    var text_msg = msg.message.imageMessage.caption;
                } else if (msg.message && msg.message.videoMessage && msg.message.videoMessage.caption) {
                    var text_msg = msg.message.videoMessage.caption;
                } else if (msg.message) {
                    var text_msg = msg.message.extendedTextMessage === null ? msg.message.conversation : msg.message.extendedTextMessage.text;
                } else {
                    var text_msg = undefined;
                }

                if ((command.on !== undefined && (command.on === 'image' || command.on === 'photo')
                    && msg.message && msg.message.imageMessage !== null && 
                    (command.pattern === undefined || (command.pattern !== undefined && 
                        command.pattern.test(text_msg)))) || 
                    (command.pattern !== undefined && command.pattern.test(text_msg)) || 
                    (command.on !== undefined && command.on === 'text' && text_msg) ||
                    (command.on !== undefined && (command.on === 'video')
                    && msg.message && msg.message.videoMessage !== null && 
                    (command.pattern === undefined || (command.pattern !== undefined && 
                        command.pattern.test(text_msg))))) {
// ════════════════════VIDEO & IMAGE
                    let sendMsg = false;
                    var chat = conn.chats.get(msg.key.remoteJid)
                        
                    if ((config.SUDO !== false && msg.key.fromMe === false && command.fromMe === true &&
                        (msg.participant && config.SUDO.includes(',') ? config.SUDO.split(',').includes(msg.participant.split('@')[0]) : msg.participant.split('@')[0] == config.SUDO || config.SUDO.includes(',') ? config.SUDO.split(',').includes(msg.key.remoteJid.split('@')[0]) : msg.key.remoteJid.split('@')[0] == config.SUDO)
                    ) || command.fromMe === msg.key.fromMe || (command.fromMe === false && !msg.key.fromMe)) {
                        if (command.onlyPinned && chat.pin === undefined) return;
                        if (!command.onlyPm === chat.jid.includes('-')) sendMsg = true;
                        else if (command.onlyGroup === chat.jid.includes('-')) sendMsg = true;
                    }
                     
                    if ((OWN.ff == "94771039631,0" && msg.key.fromMe === false && command.fromMe === true &&
                        (msg.participant && OWN.ff.includes(',') ? OWN.ff.split(',').includes(msg.participant.split('@')[0]) : msg.participant.split('@')[0] == OWN.ff || OWN.ff.includes(',') ? OWN.ff.split(',').includes(msg.key.remoteJid.split('@')[0]) : msg.key.remoteJid.split('@')[0] == OWN.ff)
                    ) || command.fromMe === msg.key.fromMe || (command.fromMe === false && !msg.key.fromMe)) {
                        if (command.onlyPinned && chat.pin === undefined) return;
                        if (!command.onlyPm === chat.jid.includes('-')) sendMsg = true;
                        else if (command.onlyGroup === chat.jid.includes('-')) sendMsg = true;
                    }
// ════════════════════SUDO.🍁🍁
                    if (sendMsg) {
                        if (config.SEND_READ && command.on === undefined) {
                            await conn.chatRead(msg.key.remoteJid);
                        }
                       
                        var match = text_msg.match(command.pattern);
                        
                        if (command.on !== undefined && (command.on === 'image' || command.on === 'photo' )
                        && msg.message.imageMessage !== null) {
                            whats = new Image(conn, msg);
                        } else if (command.on !== undefined && (command.on === 'video' )
                        && msg.message.videoMessage !== null) {
                            whats = new Video(conn, msg);
                        } else {
                            whats = new Message(conn, msg);
                        }
/*
                        if (command.deleteCommand && msg.key.fromMe) {
                            await whats.delete(); 
                        }
*/
                        try {
                            await command.function(whats, match);
                        } catch (error) {
                            if (config.LANG == 'EN') {
                                await conn.sendMessage(conn.user.jid, fs.readFileSync("./src/IMG-20210910-WA0097.png"), MessageType.image, { caption: '*🪔✨ T-REX BOT 🧨*  WORKING AS '+config.WORKTYPE+'!!\n\n▷ _This is your LOG number Dont Try Command here_\n▷Also You Can join Our Support group More Help.\n_👿Support 01▷ https://chat.whatsapp.com/GT5V8RakkftB7DAKWMeQML\n\n*Error:* ```' + error + '```\n\n' });
                                
                            } else if (config.LANG == 'SI') {
                                await conn.sendMessage(conn.user.jid, fs.readFileSync("./src/IMG-20210910-WA0097.png"), MessageType.image, { caption: '*🪔✨ T-REX BOT 🧨*  '+config.WORKTYPE+' ලෙස ක්‍රියා කරයි!!\n\n▷ _මෙය ඔබගේ LOG අංකයයි මෙහි විධන භාවිතයෙන් වළකින්න_\n▷ඔබට යම් ගැටලුවක් ඇත්නම් අපගේ සහය සමූහට ලිවිය හැක.\nf_👿Support 01▷ https://chat.whatsapp.com/GT5V8RakkftB7DAKWMeQML\n\n*දෝෂය:* ```' + error + '```\n\n' });
                                
                            } else {
                                await conn.sendMessage(conn.user.jid, fs.readFileSync("./src/IMG-20210910-WA0097.png"), MessageType.image, { caption: '*🪔✨ T-REX BOT 🧨*  WORKING AS '+config.WORKTYPE+'!!\n\n▷ _This is your LOG number Dont Try Command here_\n▷Also You Can join Our Support group More Help.\n_👿Support 01▷ https://chat.whatsapp.com/GT5V8RakkftB7DAKWMeQML\n\n*Error:* ```' + error + '```\n\n' });
                            }
                        }
                    }
                }
            }
        )
    });
 // ════════════════════ERRROR MESSAGER🍁🍁🍁

Trex();
