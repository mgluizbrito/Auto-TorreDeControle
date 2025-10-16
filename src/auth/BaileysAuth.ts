import makeWASocket, { DisconnectReason, useMultiFileAuthState, Browsers } from '@whiskeysockets/baileys';
import type { WASocket } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import logger from '../utils/logger.js'; 
import qrcode from 'qrcode-terminal';
import pino from 'pino';


let sock: WASocket | null = null; 

export default async function connectToBaileys(): Promise<WASocket> {
    logger.info('Iniciando o processo de conexão Baileys (Protocolo Multi-Dispositivo)...');
    const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info');

    // Inicializa o socket Baileys
    sock = makeWASocket({
        auth: state,
        version: [2, 3000, 1025190524],
        logger: pino({level: 'silent'}),
        browser: Browsers.macOS('Chrome'),
        getMessage: async (key) => {
            // Lógica para obter mensagens offline, se necessário
            return { conversation: 'Mensagem' } as any;
        }
    }) as WASocket; 

    // Listener de Eventos de Conexão
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            logger.error(`❌ Conexão Baileys fechada. Tentando reconectar: ${shouldReconnect}`);
            if (shouldReconnect) setTimeout(() => connectToBaileys(), 5000);

        } else if (connection === 'open') logger.info('Baileys conectado com sucesso!');
        
        if (qr) {
            console.log('----------------------------------------------------');
            console.log('🚨 ESCANEIE O QR CODE IMEDIATAMENTE 🚨');
            qrcode.generate(qr, { small: true }); 
            console.log('----------------------------------------------------');
        }
    });

    // Listener para Salvar Credenciais (Crucial para manter a sessão)
    sock.ev.on('creds.update', saveCreds);

    return sock;
}