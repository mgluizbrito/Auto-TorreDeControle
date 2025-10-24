import connectToBaileys from './auth/BaileysAuth.js'; 
import BaileysController from './controllers/BaileysController.js';
import runDriversAlertCycle from './DriversAlertCycle.js'
import logger from './utils/logger.js';
import type { WASocket } from '@whiskeysockets/baileys'; // Para tipagem
import cron from 'node-cron';
import { sendErrorEmail } from './utils/EmailSender.js';
import { initializeDatabase } from './sqlite/DriverPersistence.js';

const alertCycleCooldown_MS = process.env.EXECUTE_CYCLE_MS ? parseInt(process.env.EXECUTE_CYCLE_MS) : 900000;

async function main(): Promise<void>{
    logger.info('INICIANDO MAIN - AUTOMAÇÃO - TORRE DE CONTROLE');
    
	const wppSoket: WASocket = await connectToBaileys();
	await new Promise(resolve => setTimeout(resolve, 10000)); // Mais 10s anti-bloqueio

    const controller = new BaileysController(wppSoket);
    
    try{
        await initializeDatabase();
        await controller.initMessageListener();
        await runDriversAlertCycle(controller);
        
        cron.schedule(`*/${(alertCycleCooldown_MS / 60000)} * * * *`, async () => await runDriversAlertCycle(controller));
    
    }catch(error){
        await sendErrorEmail("FALHA na AUTOMAÇÃO", ((error instanceof Error ? error : new Error(String(error))).stack || (error instanceof Error ? error : new Error(String(error))).message));
        logger.error("Tentando iniciar o programa novamente");
        main();
    }
}

main();