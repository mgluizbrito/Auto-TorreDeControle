import 'dotenv/config';
import { sheets } from '../auth/SpreadSheetAuth.js';

const spreadsheetId = process.env.SPREADSHEET_ID;

class SheetsService{

    async getSheetData(range: string): Promise<any[]> {
        
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        if (!response.data.values) return [];
        return response.data.values;
    }
}

export default SheetsService;