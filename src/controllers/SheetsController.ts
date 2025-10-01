import SheetsService from '../services/SheetsService.js';
import logger from '../utils/logger.js';

class SheetsController{
    
    static async getDailyPendingTransfers(formattedDate: string): Promise<string[][]> {
        logger.info(`Buscando viagens PENDENTES para a data: ${formattedDate}`);
        const range: string = `MIDDLE MILE!A:AA`;

        try {
            const allData: any[] | null = await SheetsService.getMapaSheetData(range);

            if (!allData || allData.length === 0){
                logger.warn('Nenhuma viagem encontrada na planilha.');
                return [];
            }

            const filteredRows = allData.filter(row => {
                const date = row[0]; // Coluna A (Data) é o índice 0
                const status = row[26]; // Coluna AA (Status) é o índice 26

                return row && date === formattedDate && status === 'PENDENTE';
            });

            const finalData = filteredRows.map(row => {

                const date = row[0]; // Coluna A: índice 0
                const driverName: string = row[13]; // Coluna N: índice 13
                const presentationTime: string = row[18]; // Coluna S: índice 18
                const status = row[26]; // Coluna AA: índice 26

                return [date, driverName, presentationTime, status];
            });
            
            logger.info(`Encontradas ${finalData.length} viagens PENDENTES`);
            logger.debug(`Detalhes das viagens PENDENTES: ${JSON.stringify(finalData)}`);
            return finalData;
        
        } catch (error) {
            logger.error(`Erro ao buscar dados da planilha: ${error instanceof Error ? error.message : error}`);
            throw error;
        }
    }

    static async getDriverData(driverName: string): Promise<string[][]> {
        logger.info(`Buscando dados do motorista: ${driverName}`);
        const range: string = `Motoristas!D:H`;

        try {
            const allData: any[] | null = await SheetsService.getMapaSheetData(range);

            if (!allData || allData.length === 0){
                logger.warn('Nenhum dado de motorista encontrado na planilha.');
                return [];
            }

            const findedDriver = allData.filter(row => {
                return row && row[0] === driverName;
            });

            if (findedDriver.length === 0) {
                logger.warn(`Motorista ${driverName} não encontrado na planilha.`);
                return [];
            }

            const finalData = findedDriver.map(row => {

                const name: string = row[0]; // Coluna D: índice 0
                const phone: string = row[4].replace("+", ""); // Coluna H: índice 4
                
                return [name, phone];
            });

            return finalData;

        } catch (error) {
            logger.error(`Erro ao buscar dados da planilha: ${error instanceof Error ? error.message : error}`);
            throw error;
        }
    }

    static async getCurrentTransferByPlate(placa: string): Promise<string[][]>{
        logger.info(`Buscando tranferência atual da PLACA:: ${placa}`);
        const range: string = `MM Amazon!B:L`;

        try{
            const allData: any[] = await SheetsService.getMonitSheetData(range);

            if (!allData || allData.length === 0){
                logger.warn('Nenhuma transferência vinculada a placa no momento.');
                return [];
            }

            const filteredRows = allData.filter(row => {
                const shPlaca = row[10]; // Coluna L (PLACA)
                const situation = row[6]; // Coluna H (SITUAÇÃO)

                return row && shPlaca === placa && situation !== 'ENTREGUE' && situation !== 'COLETADO';
            });

            const mappedData = filteredRows.map(row => {
                const vrid = row[0]; // Coluna B (VRID)
                const origin: string = row[1]; // Coluna C (ORIGEM)
                const destination: string = row[2]; // Coluna D (DESTINO)
                const situation: string = row[6]; // Coluna H (SITUAÇÃO)
                const shPlaca: string = row[10]; // Coluna L (PLACA)

                return [vrid, origin, destination, situation, shPlaca];
            });

            logger.info(`Encontradas ${mappedData.length} transferencias NÃO ENTREGUES, vinculada a PLACA ${placa}`);
            logger.debug(`Detalhes das tranfs NÃO ENTREGUES: ${JSON.stringify(mappedData)}`);
            return mappedData;
        
        }catch (error){
            logger.error(`Erro ao buscar dados da planilha: ${error instanceof Error ? error.message : error}`);
            throw error;
        }
    }
}

export default SheetsController;