import runScheduler from './SchedulerCycle.js';
import logger from './utils/logger.js';
import BaileysController from './controllers/BaileysController.js'
import SheetsController from './controllers/SheetsController.js'

let exeCooldown = process.env.EXECUTE_CYCLE_MS ? parseInt(process.env.EXECUTE_CYCLE_MS) : 900000;
let timeWindow = process.env.TIME_WINDOW_MINUTES ? parseInt(process.env.TIME_WINDOW_MINUTES) : 90;

let alertedDrivers: string[] = [];
let lastResetTime = new Date();

export default async function runDriversAlertCycle(baileysController: BaileysController): Promise<void>{
	logger.info("Iniciando ciclo de alertas aos motoristas...");

    const currentTime = new Date();
    if (currentTime.getTime() - lastResetTime.getTime() >= (2 * 60 * 60 * 1000)) { // Se passaram mais de 2 horas desde o último reset, reseta a lista
        alertedDrivers = [];
        lastResetTime = currentTime;
        logger.info("Lista de motoristas alertados foi resetada.");
    }

	const today = new Date();
	const formattedToday = new Intl.DateTimeFormat('pt-BR').format(today);

    const dailyTransf: string[][] = await SheetsController.getDailyPendingTransfers(formattedToday);
    const upcomingTransf: string[][] = await runScheduler(dailyTransf, timeWindow);
    
    for (const transferencias of upcomingTransf){

		const [date, name, presentationTime, status] = transferencias;

		if (name === undefined || presentationTime === undefined) continue;
		if (alertedDrivers.includes(name)){ logger.info(`Motorista ${name} já foi alertado nas ultimas 2 horas. Pulando...`); continue; }
        
		let alertMessage = `⚠️ *ALERTA DE VIAGEM PRÓXIMA* ⚠️\n\nOlá ${name}, você possui uma *coleta agendada para ${presentationTime}*. Por favor, apresente-se na origem e prepare-se para o carregamento.\nCaso já tenha realizado a coleta, por favor, desconsidere esta mensagem.\n\nTorre de Controle - Diálogo Jundiaí\n(Essa é uma mensagem automática, por favor, não responda!)`;
		logger.info(`Enviando mensagem de alerta para o motorista ${name} sobre coleta às ${presentationTime}`);

    	baileysController.sendAlertMessageToDriver(name, alertMessage);
		alertedDrivers.push(name);

        await new Promise(resolve => setTimeout(resolve, Math.random() * 10000 + 12000)); // cooldown de 12s a 22s para evitar bloqueio do whatsapp
    }

    logger.info(`Ciclo de alertas concluído. Excutando novamente em ${exeCooldown/60000} minutos \n-----------------*-----------------*-----------------*-----------------`);
}