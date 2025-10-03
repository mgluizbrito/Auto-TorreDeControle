import type { WASocket } from '@whiskeysockets/baileys';
import BaileysService from '../services/BaileysService.js';
import logger from '../utils/logger.js';
import SheetsController from './SheetsController.js'

let wppService: BaileysService;

class BaileysController {

    constructor(client: WASocket) {
        wppService = new BaileysService(client);
        logger.info('Cliente Baileys definido no serviço BaileysService.');
    }

    async sendAlertMessageToDriver(driverName: string, alertMessage: string): Promise<void> {

        const driverDataArray: string[][] = await SheetsController.getDriverData(driverName);
        const driverData: string[] | undefined = driverDataArray[0];
        
        if (!driverData || !driverData[1]) {
            logger.warn(`Motorista '${driverName}' ou número de telefone não encontrado.`);
            return;
        }

        const phone = driverData[1];
        await wppService.sendWppMessage(phone, alertMessage);
    }

    async initMessageListener(): Promise<void> {
        
        wppService.setupMessageListener();
    }
}

export default BaileysController;