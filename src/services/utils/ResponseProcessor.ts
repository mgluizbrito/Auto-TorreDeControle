import type { ActiveConversation } from "./ActiveConversationType.js";
import ConversationState from "./ConversationState.js";

import type { WASocket } from '@whiskeysockets/baileys';
import logger from '../../utils/logger.js';
import SheetsController from "../../controllers/SheetsController.js";

class ResponseProcessor {
    waSocket: WASocket;
    activeConversations: Map<string, ActiveConversation>;

    constructor(socket: WASocket, conversations: Map<string, ActiveConversation>) {
        this.waSocket = socket;
        this.activeConversations = conversations;
    }

    async processResponse(from: string, response: string, currentConv: ActiveConversation): Promise<void> {
        
        const sendMsg = (text: string) => this.waSocket.sendMessage(from, { text: text });
        const activeConversations = this.activeConversations;
        
        switch (currentConv.state) {
            // ------------------------------------
            // ETAPA 1: AGUARDANDO OPÇÃO DO MENU
            // ------------------------------------
            case ConversationState.WAITING_FOR_OPTION:
                if (['1', '2', '3'].includes(response)) {
                    // Atualiza o estado para a próxima etapa (Placa)
                    activeConversations.set(from, { 
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
                const plate: string = response.replace(/[^A-Z0-9]/g, ''); // Limpa a placa (remove hífens, etc.)
                
                const [vrid, origin, destination, situation, shPlaca, typology, driverName] = await SheetsController.getCurrentTransferByPlate(plate.toUpperCase());

                if (vrid && origin && destination || shPlaca) {
                    activeConversations.set(from, {
                        ...currentConv,
                        state: ConversationState.CONFIRMING_TRIP,
                        plate: plate,
                        tripData: {
                            vrid,
                            origin,
                            destination,
                            situation,
                            shPlaca,
                            typology,
                            driverName
                        }
                    });
                    
                    const confirmationMsg = `Encontramos uma viagem para a placa *${plate} - ${typology}*:\n\nVRID: ${vrid}\nROTA: ${origin} -> ${destination}\n\n**Esta é a sua viagem?**\n(Responda *SIM* ou *NAO* para confirmar.)`;
                    await sendMsg(confirmationMsg);

                } else {
                    await sendMsg(`Não foi possível encontrar uma viagem ativa para a placa *${plate}*. Por favor, verifique a placa e tente novamente, ou contate a Torre de Controle para assistência.`);
                    activeConversations.set(from, { state: ConversationState.WAITING_FOR_OPTION, selectedOption: '' }); // Volta ao menu
                }
                break;
            
            // ------------------------------------
            // ETAPA 3: CONFIRMANDO VIAGEM
            // ------------------------------------
            case ConversationState.CONFIRMING_TRIP:
                if (response === 'SIM') {
                    // Viagem confirmada, chama o handler correto
                    await this.executeAction(from, currentConv.selectedOption, currentConv.tripData);
                    activeConversations.delete(from); // Encerra a conversa
                    
                } else if (response === 'NAO') {
                    await sendMsg('Tudo bem. Por favor, entre em contato com a Torre de Controle se a viagem estiver incorreta. A conversa será encerrada.');
                    activeConversations.delete(from); // Encerra a conversa

                } else {
                    await sendMsg('Resposta inválida. Por favor, responda apenas *SIM* ou *NAO*.');
                }
                break;

            default:
                activeConversations.delete(from);
                break;
        }
    }

    private async executeAction(from: string, option: string, tripData: any): Promise<void> {
        const sendMsg = (text: string) => this.waSocket.sendMessage(from, { text: text });

        switch(option){
            case '1':
                await this.handleDesbloquear(from, tripData);
                await sendMsg(`✅ *SOLICITAÇÃO DE DESBLOQUEIO RECEBIDA* para a viagem com destino: ${tripData.destination}. Entraremos em contato em breve.`);
                break;
                
            case '2':
                await this.handleAbrirBau(from, tripData);
                await sendMsg(`✅ *SOLICITAÇÃO DE ABERTURA DE BAÚ PROCESSADA* para a viagem com destino: ${tripData.destination}. Tenha um bom dia!`);
                break;

            case '3':
                await this.handleSolicitarChamado(from, tripData);
                await sendMsg(`✅ *SOLICITAÇÃO DE CHAMADO NOTIFICADA* para a viagem com destino: ${tripData.destination}. Nossa equipe de suporte foi avisada.`);
                break;
        }
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

export default ResponseProcessor;