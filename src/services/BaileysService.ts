import 'dotenv/config';
import type { WASocket } from '@whiskeysockets/baileys'; // Importa o tipo correto do Baileys
import logger from '../utils/logger.js';

class BaileysService {
    waSocket: WASocket; 
    activeConversations = new Map<string, 'waiting_for_option'>();

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
            if (!from) return;

            // Extrai o corpo da mensagem. Baileys é mais complexo que wweb.js
            const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
            const trimmedBody = body.trim();
            
            if (from.endsWith('@g.us')) return;

            logger.info(`[MENSAGEM RECEBIDA] De: ${from} | Conteúdo: ${trimmedBody}`);
            
            await new Promise(resolve => setTimeout(resolve, 1000)); 

            if (this.activeConversations.has(from)) {
                await this.processResponse(from, trimmedBody);

            } else { 
                const respostaPadrao = `👋 Olá, Motorista! Eu sou o Assistente Virtual da Torre de Controle - Diálogo ✅\n\nComo posso te ajudar no momento? Digite o número da opção desejada:\n⚠️ 1 - Desbloqueio de Caminhão\n⚠️ 2 - Abertura de Baú\n⚠️ 3 - Desativar Alarme\n\nPor favor, responda apenas com o número da opção, ou se precisar de algo diferente, entre em contato com a Torre de Controle. 🚀`;

                await this.waSocket.sendMessage(from, { text: respostaPadrao });
                this.activeConversations.set(from, 'waiting_for_option');
            }
        });

        logger.info('✅ Listener de mensagens Baileys configurado com sucesso.');
    }

    // --- MÉTODOS DE RESPOSTA E AÇÃO (MOVIDOS PARA DENTRO DA CLASSE) ---

    private async processResponse(from: string, response: string): Promise<void>{
        const sendMsg = (text: string) => this.waSocket.sendMessage(from, { text: text });
        
        switch(response){
            case '1':
                await this.handleDesbloquear(from);
                await sendMsg('Sua solicitação de desbloqueio foi recebida. Entraremos em contato em breve.');
                this.activeConversations.delete(from);
                break;

            case '2':
                await this.handleAbrirBau(from);
                await sendMsg('Sua solicitação para abrir o baú foi processada. Tenha um bom dia!');
                this.activeConversations.delete(from);
                break;

            case '3':
                await this.handleSolicitarChamado(from);
                await sendMsg('A equipe de suporte foi notificada. Eles retornarão o contato assim que possível.');
                this.activeConversations.delete(from);
                break;

            default:
                await sendMsg('Opção inválida. Por favor, responda APENAS com 1, 2 ou 3.');
                break;
        }
    }

    // --- FUNÇÕES DE AÇÃO ---

    private async handleAbrirBau(from: string) {
        logger.info(`AÇÃO: Motorista ${from} solicitou a abertura do baú.`);
        // [ADICIONE A LÓGICA DE NEGÓCIO AQUI]
    }

    private async handleDesbloquear(from: string) {
        logger.info(`AÇÃO: Motorista ${from} solicitou o desbloqueio.`);
        // [ADICIONE A LÓGICA DE NEGÓCIO AQUI]
    }

    private async handleSolicitarChamado(from: string) {   
        logger.info(`AÇÃO: Motorista ${from} solicitou um chamado.`);
        // [ADICIONE A LÓGICA DE NEGÓCIO AQUI]
    }
}

export default BaileysService;