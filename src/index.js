import startBot from './whatsapp.js';

// Entry point
top:
(async () => {
    try {
        await startBot();
    } catch (err) {
        console.error('Fatal error:', err);
        process.exit(1);
    }
})();