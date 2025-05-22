import { handleGemini } from '../geminiClient.js';
import { handleGrok } from '../grokClient.js'

const NUMBER_MAP = {
    '@918296853017': 'Vaibhav',
    '@919482789606': 'Prakash',
    '@917019460164': 'Gautam',
    '@919019876827': 'Rachesh',
    '@919380851686': 'Gunderao',
    '@918296464809': 'Ganesh',
    '@916363427957': 'Ram Kumar',
    '@918431252665': 'Rajkumar',
    '@916362375389': 'Verandra',
    '@6285647248699': 'Grok-3'

}

/**
 * Creates a message handler bound to the socket
 * @param {import('baileys').WASocket} sock
 * @returns {Function}
 */
export function messageHandler(sock) {
    return async (upsert) => {
        if (upsert.type !== 'notify') return; const { messages } = upsert;
        for (const msg of messages) {
            console.log('Received message:', JSON.stringify(msg), sock.user.id);
            if (!msg.message || msg.key.fromMe) continue;
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
            const from = msg.key.remoteJid;

            // Check for @mention
            const context = msg.message.extendedTextMessage?.contextInfo;
            const mentions = context?.mentionedJid || [];
            const myBase = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            const myQuoted = context?.participant || [];

            if (!mentions.includes(myBase) && myQuoted !== myBase) {
                console.log('Not a mention, skipping...');
                continue;
            };
            let question = "";

            // check if there is quoted message
            let quotedMessage = context?.quotedMessage?.conversation || context?.quotedMessage?.extendedTextMessage?.text;

            if (quotedMessage) {
                question += `\n\nQuoted message: ${JSON.stringify(quotedMessage)}` + "\n\n";
            }


            question += (msg?.pushName ? msg?.pushName + ': ' : '') + text.replace(/@\S+\s*/, '').trim();

            for (const [key, value] of Object.entries(NUMBER_MAP)) {
                if (text.includes(key)) {
                    question = question.replaceAll(key, value);
                }
            }

            console.log(`Question from ${from}: ${question}`);


            // Show typing indicator
            await sock.sendPresenceUpdate('composing', from);

            // Generate answer via Gemini
            const answer = await handleGrok(question);

            // Send the answer
            await sock.sendMessage(from, { text: answer }, { quoted: msg });

            // Pause typing indicator
            await sock.sendPresenceUpdate('paused', from);
        }
    };
}
