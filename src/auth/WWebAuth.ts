import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;

import logger from '../utils/logger.js';
import qrcode from 'qrcode-terminal';

let wppClient: pkg.Client;

export function getClientInstance(): pkg.Client{
    logger.info('Inicializando o cliente WhatsApp...');
    try{

        const client = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            }
        });
        
        client.once('ready', () => logger.info('Cliente WhatsApp está pronto!'));
    
        client.on('qr', (qr: string) => qrcode.generate(qr, { small: true }));
    
        client.initialize();
        return client;

    } catch (error) {
        console.error('Erro ao inicializar o cliente WhatsApp:', error);
        throw error;
    }
}

export default wppClient = getClientInstance();
