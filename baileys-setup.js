// Polyfill Node.js crypto for Baileys
import * as Crypto from 'crypto';
// Assign Node crypto module to globalThis.crypto so Baileys can use it
if (!globalThis.crypto) globalThis.crypto = Crypto;

import * as baileys from 'baileys';
import { Boom } from '@hapi/boom';

const { makeWASocket, DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState } = baileys;

async function startBot() {
    // Initialize multi-file auth state (auth_info folder)
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

    // Fetch the latest WhatsApp Web version
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`Using WhatsApp Web v${version.join('.')}, latest: ${isLatest}`);

    // Create the socket
    const sock = makeWASocket({
        version,
        printQRInTerminal: true,
        auth: state
    });

    // Connection update handler
    sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed, reconnecting:', shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('✅ Connection opened');
        }
    });

    // Save credentials on update
    sock.ev.on('creds.update', saveCreds);

    // Listen for incoming messages
    sock.ev.on('messages.upsert', async (m) => {
        if (m.type !== 'notify') return;
        for (const msg of m.messages) {
            if (!msg.message || msg.key.fromMe) continue;

            // Extract the message content (text or extended)
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
            const from = msg.key.remoteJid;
            console.log(`Received message from ${from}:`, text);

            // Example: echo back the message
            if (from) {
                await sock.sendMessage(from, { text: `You said: ${text}` });
            }
        }
    });
}

startBot().catch(err => console.error('Unexpected error:', err));
