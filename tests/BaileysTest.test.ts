import type { WASocket } from '@whiskeysockets/baileys';
import connectToBaileys from '../dist/auth/BaileysAuth.js'; 
import BailyesController from '../dist/controllers/BaileysController.js';

async function clientTest(): Promise<void> {
    
    console.log('Iniciando conexão Baileys e aguardando cliente pronto...');
    
    // 1. CHAMA a função e AGUARDA que a Promise de conexão resolva
    const wppClient: WASocket = await connectToBaileys(); 
    
    console.log('🎉 Cliente Baileys pronto! Inicializando Controller.');

    const controller = new BailyesController(wppClient);
    
    await controller.initMessageListener(); 
}

clientTest();