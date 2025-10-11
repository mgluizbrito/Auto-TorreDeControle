import nodemailer from 'nodemailer';
import logger from './logger.js';
import 'dotenv/config';

// Configuracao do Nodemailer (usando SMTP configurado pelas variaveis de ambiente)
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export async function sendErrorEmail(subject: string, errorDetails: string): Promise<void> {
    logger.warn("Enviando email de erro para o QA Desenvolvedor e Líder da Torre de Controle...");

    const adminEmail = process.env.ADMIN_EMAIL;
    const emailUser = process.env.EMAIL_USER;
    const leadEmail = process.env.LEAD_EMAIL;

    if (!adminEmail || !emailUser || !leadEmail) {
        logger.error('Nao foi possivel enviar o email de erro. Variaveis de email (ADMIN_EMAIL ou EMAIL_USER) nao configuradas no .env.');
        return;
    }

    const mailOptions = {
        from: emailUser,
        to: adminEmail,
        cc: leadEmail,
        subject: `[ERRO CRÍTICO] - ${subject}`,
        text: `Ocorreu um erro fatal no ciclo de automacao.
        
Detalhes do Erro:
--------------------------------------------------
${errorDetails}
--------------------------------------------------
Por favor, verifique o sistema imediatamente.`,
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.warn(`Email de alerta de erro enviado para ${adminEmail} e ${leadEmail}`);
    } catch (error) {
        // Se falhar ao enviar o email, apenas loga e nao quebra o processo.
        logger.error(`Falha ao enviar o email de erro. Verifique as credenciais SMTP: ${error}`);
    }
}