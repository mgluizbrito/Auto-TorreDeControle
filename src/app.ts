import connectToBaileys from './auth/BaileysAuth.js'; 
import BaileysController from './controllers/BaileysController.js';
import runDriversAlertCycle from './DriversAlertCycle.js'
import logger from './utils/logger.js';
import type { WASocket } from '@whiskeysockets/baileys'; // Para tipagem
import cron from 'node-cron';

const alertCycleCooldown_MS = process.env.EXECUTE_CYCLE_MS ? parseInt(process.env.EXECUTE_CYCLE_MS) : 900000;

async function main(): Promise<void>{
    logger.info('INICIANDO MAIN - AUTOMAÇÃO - TORRE DE CONTROLE');
    
	const wppSoket: WASocket = await connectToBaileys();
	await new Promise(resolve => setTimeout(resolve, 10000)); // Mais 10s anti-bloqueio

    const controller = new BaileysController(wppSoket);
    

    cron.schedule(`*/${(alertCycleCooldown_MS / 60000)} * * * *`, async () => await runDriversAlertCycle(controller));
    
}

main();