import 'dotenv/config';
import { sheets } from '../auth/SpreadSheetAuth.js';

const MAPA_SPREADSHEET_ID = process.env.MAPA_TRANF_SPREADSHEET_ID;
const MONITORAMENTO_SPREADSHEET_ID = process.env.MONITORAMENTO_SPREADSHEET_ID;

class SheetsService{

    static async getMapaSheetData(range: string): Promise<any[]> {
        
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: MAPA_SPREADSHEET_ID,
            range,
        });

        if (!response.data.values) return [];
        return response.data.values;
    }
    
    static async getMonitSheetData(range: string): Promise<any[]>{
        
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: MONITORAMENTO_SPREADSHEET_ID,
            range,
        });

        if (!response.data.values) return [];
        return response.data.values;
    }
}

export default SheetsService;