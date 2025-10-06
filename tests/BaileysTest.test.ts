import type { WASocket } from '@whiskeysockets/baileys';
import connectToBaileys from '../dist/auth/BaileysAuth.js';
import BaileysService from '../dist/services/BaileysService.js' 
import BailyesController from '../dist/controllers/BaileysController.js';

async function clientTest(): Promise<void> {
    
    console.log('Iniciando conexão Baileys e aguardando cliente pronto...');
    
    // 1. CHAMA a função e AGUARDA que a Promise de conexão resolva
    const wppClient: WASocket = await connectToBaileys(); 
    
    console.log('🎉 Cliente Baileys pronto! Inicializando Controller.');
    await new Promise(resolve => setTimeout(resolve, 10000));
    const controller = new BailyesController(wppClient);
    const service = new BaileysService(wppClient);
    
    await service.sendWppMessage("5511913188992", `${new Date().toUTCString} | TESTE ENVIO MSG LUIZ BRITO`);
    await controller.initMessageListener(); 
}

clientTest();