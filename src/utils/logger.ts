import winston from 'winston';
import path from 'path';
import 'dotenv/config';

// Define o formato de data e hora do log
const { combine, timestamp, printf, colorize } = winston.format;

// O formato: [2025-09-25 10:00:00] [INFO] Mensagem
const logFormat = printf(({ level, message, timestamp }) => `${timestamp} [${level.toUpperCase()}]: ${message}`);

// Configura o logger
const logger = winston.createLogger({

    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug', // Nível de log: 'info' em produção, 'debug' em desenvolvimento
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        // Log para o Console (Terminal)
        new winston.transports.Console({
            format: combine(colorize({ all: true })),
        }),
        
        // Log para Arquivo (para persistência no VPS)
        new winston.transports.File({ 
            filename: path.join(process.cwd(), 'logs', 'error.log'), 
            level: 'error', // Este arquivo só registrará logs de nível 'error'
        }),
        
        // Log Geral para Arquivo
        new winston.transports.File({ 
            filename: path.join(process.cwd(), 'logs', 'combined.log'),
            level: 'info', // Este arquivo registrará logs de 'info' e superiores
        }),

        // Log das tranferencias do dia para Arquivo
        new winston.transports.File({
            filename: path.join(process.cwd(), 'logs', 'debug.log'),
            level: 'debug',
        })
    ],
});

export default logger;