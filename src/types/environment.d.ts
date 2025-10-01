declare namespace NodeJS {
    interface ProcessEnv {

        MAPA_TRANF_SPREADSHEET_ID: string;
        MONITORAMENTO_SPREADSHEET_ID: string
        EXECUTE_CYCLE_MS: string;
        NODE_ENV: 'development' | 'production';
        TIME_WINDOW_MINUTES: string;
        CLIENT_ID: string;
        CLIENT_SECRET: string;
    }
}