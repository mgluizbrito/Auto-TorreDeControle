import { getSheetData } from '../controllers/SheetsController.js';

export async function getDailyPendingTransfers(formattedDate: string): Promise<string[][]> {
    const range = `MIDDLE MILE!A:AA`;

    const allData = await getSheetData(range);

    if (!allData || allData.length === 0) throw new Error('Nenhum dado encontrado na planilha.');

    const filteredRows = allData.filter(row => {
        const date = row[0]; // Coluna A (Data) é o índice 0
        const status = row[26]; // Coluna AA (Status) é o índice 26

        return row && date === formattedDate && status === 'PENDENTE';
    });

    const finalData = filteredRows.map(row => {

        const date = row[0]; // Coluna A: índice 0
        const driverName = row[13]; // Coluna N: índice 13
        const presentationTime = row[18]; // Coluna S: índice 18
        const status = row[26]; // Coluna AA: índice 26

        return [date, driverName, presentationTime, status];
    });
    
    return finalData;
}