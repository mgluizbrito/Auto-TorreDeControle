import 'dotenv/config';
import type { WASocket } from '@whiskeysockets/baileys'; // Importa o tipo correto do Baileys
import logger from '../utils/logger.js';
import ConversationState from './utils/ConversationState.js';
import type { ActiveConversation } from './utils/ActiveConversationType.js';

class BaileysService {
    waSocket: WASocket; 
    activeConversations = new Map<string, ActiveConversation>();

    constructor(socket: WASocket) {
        this.waSocket = socket;
    }
    
    async sendWppMessage(phone: string, msg: string): Promise<void> {   
        const chatId = `${phone}@s.whatsapp.net`;

        try {
            await this.waSocket.sendMessage(chatId, { text: msg });
            logger.info(`Mensagem enviada com sucesso para ${phone}`);

        } catch (error) {
            logger.error(`Falha ao enviar mensagem para ${phone}: ${error}`);
            throw error; 
        }
    }
    
    async setupMessageListener(): Promise<void> {

        this.waSocket.ev.on('messages.upsert', async (chatUpdate) => {
            const msg = chatUpdate.messages[0];

            if (!msg || !msg.message || msg.key.fromMe) return; 

            const from = msg.key.remoteJid;
            if (!from || from.endsWith('@g.us')) return;

            // Extrai o corpo da mensagem. Baileys é mais complexo que wweb.js
            const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
            const trimmedBody = body.trim().toUpperCase(); // Padroniza a resposta

            if (!body || body === '') return;
            
            logger.info(`[MENSAGEM RECEBIDA] De: ${from} | Conteúdo: ${trimmedBody}`);

            await new Promise(resolve => setTimeout(resolve, 5500));

            const respostaPadrao = `No momento sou apenas um robô feito para te lembrar dos seus carregamentos. Se precisar de suporte, procure pelo time da torre de controle:\n\nhttps://sandwiche.me/contatostorredecontrole\n\nUm abraço!`;

            await this.waSocket.sendMessage(from, { text: respostaPadrao });
            this.activeConversations.set(from, { state: ConversationState.WAITING_FOR_OPTION, selectedOption: '' });
        });

        logger.info('✅ Listener de mensagens Baileys configurado com sucesso.');
    }
}

export default BaileysService;