import 'dotenv/config';
import { sheets } from '../auth/SpreadSheetAuth.js';

const spreadsheetId = process.env.SPREADSHEET_ID;

export async function getSheetData(range: string): Promise<any[] | null> {

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        return response.data.values || null;
        
    } catch (error) {
        console.error('Erro ao acessar a planilha:', error);
        throw error;
    }
}