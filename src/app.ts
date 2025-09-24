import { getDailyPendingTransfers } from './services/SheetsService.js'

const today = new Date();
const formattedToday = new Intl.DateTimeFormat('pt-BR').format(today);

async function main(): Promise<void>{

	const dailyTransf: string[][] = await getDailyPendingTransfers(formattedToday);
	console.log(`Encontradas ${dailyTransf.length} viagens restantes para a data de hoje: ${JSON.stringify(dailyTransf)}`);
}

main();