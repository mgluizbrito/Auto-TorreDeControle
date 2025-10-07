import type { WASocket } from '@whiskeysockets/baileys';
import connectToBaileys from '../dist/auth/BaileysAuth.js';
import BaileysService from '../dist/services/BaileysService.js' 
import BailyesController from '../dist/controllers/BaileysController.js';
import { sendErrorEmail } from '../dist/utils/EmailSender.js';

async function clientTest(): Promise<void> {
    
    console.log('Iniciando conexão Baileys e aguardando cliente pronto...');
    
    // 1. CHAMA a função e AGUARDA que a Promise de conexão resolva
    const wppClient: WASocket = await connectToBaileys(); 
    
    console.log('🎉 Cliente Baileys pronto! Inicializando Controller.');
    await new Promise(resolve => setTimeout(resolve, 10000));
    const controller = new BailyesController(wppClient);
    const service = new BaileysService(wppClient);
    

    try{        
        await controller.initMessageListener();
        service.sendWppMessage("5511913188992", `${new Date().toUTCString()} | TESTE ENVIO MSG LUIZ BRITO`);
    
    }catch(error){
        await sendErrorEmail("FALHA na AUTOMAÇÃO", ((error instanceof Error ? error : new Error(String(error))).stack || (error instanceof Error ? error : new Error(String(error))).message));
    }

}

clientTest();