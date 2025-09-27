import 'dotenv/config';
import wppClient from './auth/WWebAuth.js';
import { setWppClient, sendAlertMessageToDriver } from './services/WWebService.js';
import { getDailyPendingTransfers } from './services/SheetsService.js'
import runScheduler from './SchedulerCycle.js';
import logger from './utils/logger.js';

let exeCooldown = process.env.EXECUTE_CYCLE_MS ? parseInt(process.env.EXECUTE_CYCLE_MS) : 900000;
let timeWindow = process.env.TIME_WINDOW_MINUTES ? parseInt(process.env.TIME_WINDOW_MINUTES) : 90;

let alertedDrivers: string[] = [];
let lastResetTime = new Date();

async function main(): Promise<void>{
	
	// AGUARDANDO O WWEBJS INICIALIZAR
	while (!wppClient.info) {
		logger.info('Aguardando o cliente WhatsApp estar pronto...')
		await new Promise(resolve => setTimeout(resolve, 10000));
	}

	logger.info(`WWebClient inicializado em main(): ${wppClient.info}`)
	setWppClient(wppClient);
	await new Promise(resolve => setTimeout(resolve, 10000)); // Mais 10s anti-bloqueio
	
	runDriversAlertCycle();
}

async function runDriversAlertCycle(): Promise<void>{
	logger.info("Iniciando ciclo de alertas aos motoristas...");

    const currentTime = new Date();
    if (currentTime.getTime() - lastResetTime.getTime() >= (2 * 60 * 60 * 1000)) { // Se passaram mais de 2 horas desde o último reset, reseta a lista
        alertedDrivers = [];
        lastResetTime = currentTime;
        logger.info("Lista de motoristas alertados foi resetada.");
    }

	const today = new Date();
	const formattedToday = new Intl.DateTimeFormat('pt-BR').format(today);

    const dailyTransf: string[][] = await getDailyPendingTransfers(formattedToday);
    const upcomingTransf: string[][] = await runScheduler(dailyTransf, timeWindow);
    
    for (const tranf of upcomingTransf){

		if (tranf[0] === undefined || tranf[1] === undefined) continue;
		if (alertedDrivers.includes(tranf[0])){ logger.info(`Motorista ${tranf[0]} já foi alertado nas ultimas 2 horas. Pulando...`); continue; }
        
		let alertMessage = `⚠️ *ALERTA DE VIAGEM PRÓXIMA* ⚠️\n\nOlá ${tranf[0]}, você possui uma *coleta agendada para ${tranf[1]}*. Por favor, apresente-se na origem e prepare-se para o carregamento.\nCaso já tenha realizado a coleta, por favor, desconsidere esta mensagem.\n\nAtenciosamente, Torre de Controle - Diálogo Jundiaí\n(Essa é uma mensagem automática, por favor, não responda!)`;

		logger.info(`Enviando mensagem de alerta para o motorista ${tranf[0]} sobre coleta às ${tranf[1]}`);

    	sendAlertMessageToDriver(tranf[0], alertMessage);
		alertedDrivers.push(tranf[0]);

        await new Promise(resolve => setTimeout(resolve, Math.random() * 6000 + 12000)); // cooldown de 12s a 18s para evitar bloqueio do whatsapp
    }

	logger.info(`Ciclo de alertas concluído. Aguardando ${exeCooldown/60000} minutos para o próximo ciclo.`);
	setTimeout(async () => await runDriversAlertCycle(), exeCooldown);
}

main();