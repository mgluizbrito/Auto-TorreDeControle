import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import logger from "../utils/logger.js";

const DB_PATH = "./auto_torre.db";
let db: Database;

export async function initializeDatabase() {
    db = await open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS alerted_drivers (
            driver_name TEXT PRIMARY KEY,
            alert_timestamp INTEGER
        );
    `);

    logger.info("Banco de dados SQLite inicializado.");
}

export async function loadAlertedDrivers(): Promise<string[]> {
    const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);

    const rows: { driver_name?: string }[] = await db.all("SELECT driver_name FROM alerted_drivers WHERE alert_timestamp > ?", [twoHoursAgo]);

    return rows.map((row: { driver_name?: string }) => row.driver_name ?? "");
}

export async function addAlertedDriver(driverName: string): Promise<void> {
    if (!db) {
        logger.error("A database não foi inicialiada! Tentando reconectar");
        initializeDatabase();
        addAlertedDriver(driverName);
    }
    
    const timestamp = Date.now();
    try {
        await db.run(
            "INSERT OR REPLACE INTO alerted_drivers (driver_name, alert_timestamp) VALUES (?, ?)", // Usando REPLACE para lidar com o caso de re-alerta (se a lógica de 2h mudar)
            [driverName, timestamp]
        );
        logger.debug(`Motorista ${driverName} salvo como motorista avisado.`);
    } catch (error) {
        logger.error(`Erro ao persistir motorista ${driverName}: ${(error as Error).message}`);
    }
}

export async function cleanupOldAlerts(): Promise<void> {
    if (!db) {
        logger.error("A database não foi inicialiada! Tentando reconectar");
        initializeDatabase();
        cleanupOldAlerts();
    }
    
    const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
    const result = await db.run("DELETE FROM alerted_drivers WHERE alert_timestamp <= ?", [twoHoursAgo]);
    
    if (result.changes && result.changes > 0) {
        logger.info(`Limpeza do BD concluída: ${result.changes} registros removidos.`);
    }
}

/**
 * Remove todos os motoristas.
 */
export async function resetAllAlertedDrivers(): Promise<void> {
    if (!db) {
        logger.error("A database não foi inicialiada! Tentando Reconectar");
        initializeDatabase();
        resetAllAlertedDrivers();
    }

    await db.run("DELETE FROM alerted_drivers");
    logger.info("Tabela de motoristas alertados foi completamente resetada no BD.");
}