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

		const [date, origin, driverName, presentationTime, status] = transferencias;

		if (driverName === undefined || presentationTime === undefined) continue;
		if (alertedDrivers.includes(driverName)){ logger.info(`Motorista ${driverName} já foi alertado nas ultimas 2 horas. Pulando...`); continue; }
        
		let alertMessage = `Olá, ${driverName}!\n\nPassando pra te lembrar do seu carregamento às ${presentationTime} em ${origin} 😎🚚.\n\n✅Boas práticas:\n- Garanta que você está seguindo os endereços e horários da programação.\n- Chegar com 1h de antecedência em relação ao horário de carregamento, para evitar atrasos com a portaria ou filas de veículos.\n- Verifique a limpeza do baú do seu veículo.\n- Envie as fotos dos papeis de carregamento entregues após serem entregues a você.\n\n⛑️BRSipa:\nPara garantir a sua segurança e dos demais ao seu redor, existe o programa *BRSipa*. Cada excesso de velocidade ou de jornada você receberá pontos.\n\nVelocidade:\n90 ~ 91km/h = 2pts.\n101 ~ 110km/h = 6pts.\n111 ~ 120km/h = 10pts.\n+120 km/h = 18pts.\n\nJornada:\nTempo máximo de direção = 5h30min\nA cada 30min excedentes = 5pts.\n\n*O motorista que tiver mais de 90pts será BLOQUEADO e precisará passar por reciclagem.*\n\n📞Contato:\nhttps://sandwiche.me/contatostorredecontrole\n\nBoa viagem! (Essa é uma mensagem automática, por favor, não responda!)`;
		logger.info(`Enviando mensagem de alerta para o motorista ${driverName} sobre coleta às ${presentationTime}`);

    	baileysController.sendAlertMessageToDriver(driverName, alertMessage);
		alertedDrivers.push(driverName);

        await new Promise(resolve => setTimeout(resolve, Math.random() * 10000 + 12000)); // cooldown de 12s a 22s para evitar bloqueio do whatsapp
    }

    logger.info(`Ciclo de alertas concluído. Excutando novamente em ${exeCooldown/60000} minutos \n-----------------*-----------------*-----------------*-----------------`);
}