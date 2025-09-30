import 'dotenv/config';
import pkg from 'whatsapp-web.js';
import logger from '../utils/logger.js';


class WWebService {
    wppClient: pkg.Client;

    constructor(client: pkg.Client) {
        this.wppClient = client;
    }

    async sendWppMessage(phone: string, msg: string): Promise<void> {   
        const chatId = getWhatsAppId(phone);

        try {
            // Verifica se o ID é válido e se existe no WhatsApp
            if (!await this.wppClient.isRegisteredUser(chatId)) {
                logger.warn(`Número não registrado no WhatsApp: ${phone}`);
                return;
            }

            // Envia a mensagem
            await this.wppClient.sendMessage(chatId, msg);
            logger.info(`Mensagem enviada com sucesso para ${phone}`);

        } catch (error) {
            logger.error(`Falha ao enviar mensagem para ${phone}: ${error}`);
            throw error;
        }

        return;
    }

    async setupMessageListener(): Promise<void> {
        let activeConversations = new Map<string, 'initial' | 'waiting_for_option'>();

        this.wppClient.on('message', async msg => {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 5000 + 5000));

            const from = msg.from;
            const chat = await msg.getChat();
            const contact = await msg.getContact();
            const senderName = chat.isGroup ? chat.name : contact.pushname || contact.number;

            if (chat.isGroup) return;
            logger.info(`[MENSAGEM RECEBIDA] De: ${senderName} | Conteúdo: ${msg.body}`);

            if (activeConversations.has(from)) await processResponse(msg, activeConversations);
            else {
                
                const respostaPadrao = `👋 Olá, *${senderName}*! Eu sou o Assistente Virtual da Torre de Controle - Diálogo ✅\n\nComo posso te ajudar no momento? Digite o número da opção desejada:\n⚠️ 1 - Desbloqueio de Caminhão\n⚠️ 2 - Abertura de Baú\n⚠️ 3 - Desativar Alarme\n\nPor favor, responda apenas com o número da opção, ou se precisar de algo diferente, entre em contato com a Torre de Controle. 🚀`;
                
                await this.wppClient.sendMessage(from, respostaPadrao);
                activeConversations.set(from, 'waiting_for_option'); // Define o estado da conversa para "esperando uma opção"
            }
        });

        logger.info('✅ Listener de mensagens configurado com sucesso.');
    }

}

async function processResponse(msg: pkg.Message, activeConversations: Map<string, 'initial' | 'waiting_for_option'>): Promise<void>{
    const from = msg.from;
    const response = msg.body.trim();

    switch(response){

        case '1':
            await handleAbrirBau(msg);
            await msg.reply('Sua solicitação para abrir o baú foi processada. Tenha um bom dia!');
            activeConversations.delete(from);
            break;

        case '2':
            await handleDesbloquear(msg);
            await msg.reply('Sua solicitação de desbloqueio foi recebida. Entraremos em contato em breve.');
            activeConversations.delete(from);
            break;

        case '3':
            await handleSolicitarChamado(msg);
            await msg.reply('A equipe de suporte foi notificada. Eles retornarão o contato assim que possível.');
            activeConversations.delete(from);
            break;

        default:
            await msg.reply('Opção inválida. Por favor, responda APENAS com 1, 2 ou 3.');
            break;
    }
}

/**
 * Funções de ação para cada opção do menu.
 * (Substitua a lógica de log pelas suas funções reais de negócio)
 */
async function handleAbrirBau(msg: pkg.Message) {
    logger.info(`Motorista ${msg.from} solicitou a abertura do baú.`);
    // Exemplo: lógica para interagir com outra API, enviar e-mail, etc.
}

async function handleDesbloquear(msg: pkg.Message) {
    logger.info(`Motorista ${msg.from} solicitou o desbloqueio.`);
    // Exemplo: lógica para desbloqueio
}

async function handleSolicitarChamado(msg: pkg.Message) {   
    logger.info(`Motorista ${msg.from} solicitou um chamado.`);
    // Exemplo: lógica para abrir um chamado
}

function getWhatsAppId(phoneNumber: string): string {
    // Adiciona o sufixo @c.us para IDs de contato (chat user)
    return `${phoneNumber}@c.us`; 
}

export default WWebService;