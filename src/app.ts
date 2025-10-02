import 'dotenv/config';
import wppClient from './auth/WWebAuth.js';
import WWebController from './controllers/WWebController.js';
import runDriversAlertCycle from './DriversAlertCycle.js'
import logger from './utils/logger.js';

async function main(): Promise<void>{

	// AGUARDANDO O WWEBJS INICIALIZAR
	while (!wppClient.info) {
		logger.info('Aguardando o cliente WhatsApp estar pronto...')
		await new Promise(resolve => setTimeout(resolve, 10000));
	}

	logger.info(`WWebClient inicializado em main(): ${wppClient.info}`)
	const wppController = new WWebController(wppClient)
	await new Promise(resolve => setTimeout(resolve, 10000)); // Mais 10s anti-bloqueio
	
	runDriversAlertCycle(wppController);	
	
}

main();