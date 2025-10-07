declare namespace NodeJS {
    interface ProcessEnv {
        NODE_ENV: 'development' | 'production';
        
        MAPA_TRANF_SPREADSHEET_ID: string;
        MONITORAMENTO_SPREADSHEET_ID: string;
        
        EXECUTE_CYCLE_MS: string;
        TIME_WINDOW_MINUTES: string;

        EMAIL_USER: string;
        EMAIL_PASS: string;
        ADMIN_EMAIL: string;
        
        CLIENT_ID: string;
        CLIENT_SECRET: string;
    }
}