import { google } from 'googleapis';
// import {authenticate} from '@google-cloud/local-auth';
import path from 'path';
import logger from '../utils/logger.js';

async function getAuth(){
    logger.info('Autenticando API do Google Sheets...')
    
    const auth = await new google.auth.GoogleAuth({
        keyFile: path.join(process.cwd(), 'servaccs-credentials.json'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    try {
        return google.sheets({ version: 'v4', auth });

    } catch (error) {
        logger.error(`Erro ao buscar dados da planilha: ${error instanceof Error ? error.message : error}`);
        throw error;
    }
}

export const sheets = await getAuth();