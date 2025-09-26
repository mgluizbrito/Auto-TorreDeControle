import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

function getClientInstance() {
    const client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        }
    });
    
    client.once('ready', () => console.log('WhatsApp client is ready!'));

    client.on('qr', (qr: string) => qrcode.generate(qr, { small: true }));

    client.initialize();
    return client;
}

export const wppClient = await getClientInstance();
