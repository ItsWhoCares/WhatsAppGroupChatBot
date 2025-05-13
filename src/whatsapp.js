import * as Crypto from 'crypto';
if (!globalThis.crypto) globalThis.crypto = Crypto;

import qrcode from 'qrcode-terminal';
import * as baileys from 'baileys';
import NodeCache from 'node-cache';
import { AUTH_PATH } from './config.js';
import { messageHandler } from './handlers/messageHandler.js';

const { makeWASocket, DisconnectReason, fetchLatestBaileysVersion, useMultiFileAuthState } = baileys;

/**
 * Initialize and start the WhatsApp bot
 * @returns {Promise<void>}
 */
export default async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_PATH);
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`WhatsApp Web v${version.join('.')}, latest: ${isLatest}`);

    // Initialize group metadata cache
    const groupCache = new NodeCache({ stdTTL: 300, checkperiod: 600 });
    const sock = makeWASocket({
        version,
        auth: state,
        // Provide cached group metadata to avoid rate limits
        cachedGroupMetadata: async (jid) => groupCache.get(jid)
    });

    // Update cache on group metadata upserts
    sock.ev.on('groups.upsert', (groupMetas) => {
        groupMetas.forEach(meta => groupCache.set(meta.id, meta));
    });

    sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
        if (qr) {
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'close') {
            const code = lastDisconnect?.error?.output?.statusCode;
            const reconnect = code !== DisconnectReason.loggedOut;
            console.log(`Connection closed (${code}), reconnecting: ${reconnect}`);
            if (reconnect) startBot();
        } else if (connection === 'open') {
            console.log('✅ Connected');
        }
    });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('messages.upsert', messageHandler(sock));
}