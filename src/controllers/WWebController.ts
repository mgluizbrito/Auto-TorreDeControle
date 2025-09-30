import pkg from 'whatsapp-web.js';
import { sendWppMessage } from '../services/WWebService.js';
import logger from '../utils/logger.js';
import {getDriverData} from './SheetsController.js'

let wppClient: pkg.Client;

export async function sendAlertMessageToDriver(driverName: string | undefined, alertMessage: string): Promise<void>{

    if (!driverName) return;
    const driverDataArray: string[][] = await getDriverData(driverName);

    const driverData: string[] | undefined = driverDataArray[0];
    if (!driverData) return;

    if (driverData[1]) {
        
        sendWppMessage(wppClient, driverData[1], alertMessage);

    } else {
        logger.warn(`Número de telefone não encontrado para o motorista: ${driverName}`);
        return;
    }
}

export function setWppClient(client: pkg.Client): void {
    wppClient = client;
    logger.info('Cliente WhatsApp definido no serviço WWebService.');
}