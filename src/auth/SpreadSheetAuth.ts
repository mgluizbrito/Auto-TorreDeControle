import { google } from 'googleapis';
import {authenticate} from '@google-cloud/local-auth';
import path from 'path';

async function getAuth(){
    
    const auth = await authenticate({
        keyfilePath: path.join(process.cwd(), 'credentials.json'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    try {
        return google.sheets({ version: 'v4', auth });

    } catch (error) {
        console.error('Erro na autenticação da Conta de Serviço:', error);
        throw error;
    }
}

export const sheets = await getAuth();