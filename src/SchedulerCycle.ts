import logger from './utils/logger.js';
import 'dotenv/config';

export default async function runScheduler(dailyTransf: string[][], timeWindow: number): Promise<string[][]> {
    logger.info("Executando ciclo de verificação agendada...");
    
    const today = new Date();
    const formattedToday = new Intl.DateTimeFormat('pt-BR').format(today);
    let upcomingTransfers: string[][] = [];

    if (dailyTransf.length === 0) {
        logger.info("Nenhuma transferência PENDENTE encontrada para verificação.");
        return upcomingTransfers;
    }

    logger.debug(`Verificando viagens PENDENTES dos próximos ${timeWindow} minutos.`);

    for (const transfer of dailyTransf) {
        const [date, origin, driverName, presentationTime, status] = transfer;

        // Cria o objeto Date completo para a comparação
        const scheduledDate = createScheduledDate(date, presentationTime);

        if (isWithinTimeWindow(scheduledDate, timeWindow)) {

            logger.info(`Motorista ${driverName} com horário de apresentação às ${presentationTime} (${origin}) está dentro da janela`);
            upcomingTransfers.push(transfer);

        }else logger.debug(`Viagem do motorista ${driverName} com horário de apresentação às ${presentationTime} (${origin}) está fora da janela de ${timeWindow} minutos.`);
    }
    
    logger.info("Ciclo de verificação concluído.");
    return upcomingTransfers;
}

// ----------------------------------------------------
// Lógica de Verificação de Tempo
// ----------------------------------------------------
/**
 * Converte o horário de apresentação (HH:mm) para um objeto Date completo (hoje + horário).
 */
function createScheduledDate(dateString: string | undefined, presentationTime: string | undefined): Date {
    const today = new Date();
    if (!presentationTime || !dateString) return today;

    const [day, month, year] = dateString.split('/').map(Number);
    const [hours, minutes] = presentationTime.split(':').map(Number);
    
    // Cria um novo objeto Date com a data de hoje, mas com o horário de apresentação
    const scheduledDate = new Date(
        year? year : today.getFullYear(),
        month? month - 1 : today.getMonth(),
        day,
        hours,
        minutes,
        0 // Segundos
    );
    
    return scheduledDate;
}

/**
 * Verifica se a apresentação está a 90 minutos ou menos de acontecer.
 */
function isWithinTimeWindow(scheduledDate: Date, timeWindow: number): boolean {
    const currentTime = new Date();

    const diffMs = scheduledDate.getTime() - currentTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    // Condições:
    // 1. A diferença deve ser maior que 0 (ainda não aconteceu).
    // 2. A diferença deve ser menor ou igual à janela de tempo (90 minutos).
    return diffMinutes > 0 && diffMinutes <= timeWindow;
}