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
            
            logger.info(`[MENSAGEM RECEBIDA] De: ${from} | Conteúdo: ${trimmedBody}`);

            await new Promise(resolve => setTimeout(resolve, 5500));

            const currentConv = this.activeConversations.get(from);

            if (currentConv) {
                await this.processResponse(from, trimmedBody, currentConv);

            } else {
                const respostaPadrao = `👋 Olá, Motorista! Eu sou o Assistente Virtual da Torre de Controle - Diálogo ✅\n\nComo posso te ajudar no momento? Digite o número da opção desejada:\n⚠️ 1 - Desbloqueio de Caminhão\n⚠️ 2 - Abertura de Baú\n⚠️ 3 - Desativar Alarme\n\nPor favor, responda apenas com o número da opção, ou se precisar de algo diferente, entre em contato com a Torre de Controle. 🚀`;

                await this.waSocket.sendMessage(from, { text: respostaPadrao });
                this.activeConversations.set(from, { state: ConversationState.WAITING_FOR_OPTION, selectedOption: '' });
            }
        });

        logger.info('✅ Listener de mensagens Baileys configurado com sucesso.');
    }

    // --- MÉTODOS DE RESPOSTA E AÇÃO (FLUXO DE MÚLTIPLAS ETAPAS) ---

    private async processResponse(from: string, response: string, currentConv: ActiveConversation): Promise<void> {
        const sendMsg = (text: string) => this.waSocket.sendMessage(from, { text: text });
        
        switch (currentConv.state) {
            
            // ------------------------------------
            // ETAPA 1: AGUARDANDO OPÇÃO DO MENU
            // ------------------------------------
            case ConversationState.WAITING_FOR_OPTION:
                if (['1', '2', '3'].includes(response)) {
                    // Atualiza o estado para a próxima etapa (Placa)
                    this.activeConversations.set(from, { 
                        state: ConversationState.WAITING_FOR_PLATE, 
                        selectedOption: response 
                    });
                    await sendMsg('Certo! Para darmos prosseguimento, por favor, *digite a PLACA* do caminhão:');
                } else {
                    await sendMsg('Opção inválida. Por favor, responda APENAS com 1, 2 ou 3.');
                }
                break;

            // ------------------------------------
            // ETAPA 2: AGUARDANDO PLACA
            // ------------------------------------
            case ConversationState.WAITING_FOR_PLATE:
                const plate = response.replace(/[^A-Z0-9]/g, ''); // Limpa a placa (remove hífens, etc.)
                
                // 1. Simula a busca da viagem
                const trip = await this.findTripByPlate(plate);

                if (trip) {
                    // 2. Se a viagem for encontrada, avança para a confirmação
                    this.activeConversations.set(from, {
                        ...currentConv,
                        state: ConversationState.CONFIRMING_TRIP,
                        plate: plate,
                        tripData: trip
                    });
                    
                    const confirmationMsg = `Encontramos uma viagem para a placa *${plate}*:\n\nVRID:${trip.vrid}\nROTA: ${trip.origin} -> ${trip.destination}\n\n**Esta é a sua viagem?**\n(Responda *SIM* ou *NAO* para confirmar.)`;
                    await sendMsg(confirmationMsg);

                } else {
                    // 3. Se a viagem NÃO for encontrada, encerra ou pede novamente
                    await sendMsg(`Não foi possível encontrar uma viagem ativa para a placa *${plate}*. Por favor, verifique a placa e tente novamente, ou digite o número da opção do menu inicial.`);
                    this.activeConversations.set(from, { state: ConversationState.WAITING_FOR_OPTION, selectedOption: '' }); // Volta ao menu
                }
                break;
            
            // ------------------------------------
            // ETAPA 3: CONFIRMANDO VIAGEM
            // ------------------------------------
            case ConversationState.CONFIRMING_TRIP:
                if (response === 'SIM') {
                    // Viagem confirmada, chama o handler correto
                    await this.executeAction(from, currentConv.selectedOption, currentConv.tripData);
                    this.activeConversations.delete(from); // Encerra a conversa
                    
                } else if (response === 'NAO') {
                    await sendMsg('Tudo bem. Por favor, entre em contato com a Torre de Controle se a viagem estiver incorreta. A conversa será encerrada.');
                    this.activeConversations.delete(from); // Encerra a conversa

                } else {
                    await sendMsg('Resposta inválida. Por favor, responda apenas *SIM* ou *NAO*.');
                }
                break;

            default:
                this.activeConversations.delete(from);
                break;
        }
    }
    
    // --- FUNÇÃO CENTRAL PARA EXECUTAR AÇÃO ---

    private async executeAction(from: string, option: string, tripData: any): Promise<void> {
        const sendMsg = (text: string) => this.waSocket.sendMessage(from, { text: text });

        switch(option){
            case '1':
                await this.handleDesbloquear(from, tripData);
                await sendMsg(`✅ *SOLICITAÇÃO DE DESBLOQUEIO RECEBIDA* para a viagem: ${tripData.destination}. Entraremos em contato em breve.`);
                break;
            case '2':
                await this.handleAbrirBau(from, tripData);
                await sendMsg(`✅ *SOLICITAÇÃO DE ABERTURA DE BAÚ PROCESSADA* para a viagem: ${tripData.destination}. Tenha um bom dia!`);
                break;
            case '3':
                await this.handleSolicitarChamado(from, tripData);
                await sendMsg(`✅ *SOLICITAÇÃO DE CHAMADO NOTIFICADA* para a viagem: ${tripData.destination}. Nossa equipe de suporte foi avisada.`);
                break;
        }
    }


    // --- FUNÇÕES DE BUSCA E AÇÃO (MOCKUP) ---

    // [NOVA FUNÇÃO DE BUSCA]
    private async findTripByPlate(plate: string): Promise<any | null> {
        logger.info(`BUSCA: Tentando encontrar viagem para a placa: ${plate}`);
        
        // --- LÓGICA DE NEGÓCIO: CHAME SEU SERVIÇO DE BANCO DE DADOS/PLANILHA AQUI ---
        // Exemplo: Simula que só encontra a viagem se a placa for "ABC1234"
        if (plate === 'ABC1234') {
            return {
                origin: 'POA1',
                destination: 'DRS5',
                vrid: 'VRID123456',
            };
        }
        return null;
        // --------------------------------------------------------------------------
    }

    private async handleAbrirBau(from: string, tripData: any) {
        logger.info(`AÇÃO: Motorista ${from} solicitou a abertura do baú na viagem ${tripData.vrid}.`);
        // LÓGICA DE ABERTURA AQUI (e.g., chamada API da Torre de Controle)
    }

    private async handleDesbloquear(from: string, tripData: any) {
        logger.info(`AÇÃO: Motorista ${from} solicitou o desbloqueio na viagem ${tripData.vrid}.`);
        // LÓGICA DE DESBLOQUEIO AQUI
    }

    private async handleSolicitarChamado(from: string, tripData: any) {   
        logger.info(`AÇÃO: Motorista ${from} solicitou um chamado na viagem ${tripData.vrid}.`);
        // LÓGICA DE CHAMADO AQUI
    }
}

export default BaileysService;