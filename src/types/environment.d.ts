declare namespace NodeJS {
    interface ProcessEnv {

        SPREADSHEET_ID: string;
        EXECUTE_CYCLE_MS: number;
        NODE_ENV: 'development' | 'production';
        TIME_WINDOW_MINUTES: string;
        CLIENT_ID: string;
        CLIENT_SECRET: string;
    }
}