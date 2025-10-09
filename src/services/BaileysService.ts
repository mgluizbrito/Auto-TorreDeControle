import 'dotenv/config';
import type { WASocket } from '@whiskeysockets/baileys'; // Importa o tipo correto do Baileys
import logger from '../utils/logger.js';
import ConversationState from './utils/ConversationState.js';
import type { ActiveConversation } from './utils/ActiveConversationType.js';
import ResponseProcessor from './utils/ResponseProcessor.js';

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
            
            logger.info(`[MENSAGEM RECEBIDA] De: ${from} | Conteúdo: ${trimmedBody}`);

            await new Promise(resolve => setTimeout(resolve, 5500));

            const currentConv = this.activeConversations.get(from);

            if (currentConv) {
                await new ResponseProcessor(this.waSocket, this.activeConversations).processResponse(from, trimmedBody, currentConv);

            } else {
                const respostaPadrao = `👋 Olá, Motorista! Eu sou o Assistente Virtual da Torre de Controle - Diálogo ✅\n\nComo posso te ajudar no momento? Digite o número da opção desejada:\n⚠️ 1 - Desbloqueio de Caminhão\n⚠️ 2 - Abertura de Baú\n⚠️ 3 - Desativar Alarme\n\nPor favor, responda apenas com o número da opção, ou se precisar de algo diferente, entre em contato com a Torre de Controle. 🚀`;

                await this.waSocket.sendMessage(from, { text: respostaPadrao });
                this.activeConversations.set(from, { state: ConversationState.WAITING_FOR_OPTION, selectedOption: '' });
            }
        });

        logger.info('✅ Listener de mensagens Baileys configurado com sucesso.');
    }
}

export default BaileysService;