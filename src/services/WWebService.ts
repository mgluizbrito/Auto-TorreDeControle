import 'dotenv/config';
import pkg from 'whatsapp-web.js';
import logger from '../utils/logger.js';

function getWhatsAppId(phoneNumber: string): string {
    // Adiciona o sufixo @c.us para IDs de contato (chat user)
    return `${phoneNumber}@c.us`; 
}

export async function sendWppMessage(wppClient: pkg.Client, phone: string, msg: string): Promise<void> {
    
    if (!wppClient.info) {
        logger.error("Cliente WhatsApp não foi settado ou não foi inicializado.");
        return;
    }
    
    const chatId = getWhatsAppId(phone);

    try {
        // Verifica se o ID é válido e se existe no WhatsApp
        if (!await wppClient.isRegisteredUser(chatId)) {
            logger.warn(`Número não registrado no WhatsApp: ${phone}`);
            return;
        }

        // Envia a mensagem
        await wppClient.sendMessage(chatId, msg);
        logger.info(`Mensagem enviada com sucesso para ${phone}`);

    } catch (error) {
        logger.error(`Falha ao enviar mensagem para ${phone}: ${error}`);
        throw error;
    }

    return;
}