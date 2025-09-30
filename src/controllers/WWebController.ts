import pkg from 'whatsapp-web.js';
import WWebService from '../services/WWebService.js';
import logger from '../utils/logger.js';
import {getDriverData} from './SheetsController.js'

let wppService: WWebService;

class WWebController{

    constructor(client: pkg.Client) {
        wppService = new WWebService(client);
        logger.info('Cliente WhatsApp definido no serviço WWebService.');
    }

    async sendAlertMessageToDriver(driverName: string | undefined, alertMessage: string): Promise<void>{

        if (!driverName) return;
        const driverDataArray: string[][] = await getDriverData(driverName);

        const driverData: string[] | undefined = driverDataArray[0];
        if (!driverData) return;

        if (driverData[1]) {
            
            wppService.sendWppMessage(driverData[1], alertMessage);

        } else {
            logger.warn(`Número de telefone não encontrado para o motorista: ${driverName}`);
            return;
        }
    }

    
}

export default WWebController;