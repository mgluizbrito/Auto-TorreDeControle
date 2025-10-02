import wppClient from '../dist/auth/WWebAuth.js';
import WWebController from '../dist/controllers/WWebController.js';

// AGUARDANDO O WWEBJS INICIALIZAR
while (!wppClient.info) {
    console.log('Aguardando o cliente WhatsApp estar pronto...')
    await new Promise(resolve => setTimeout(resolve, 10000));
}

const controller = new WWebController(wppClient);
controller.initMessageListener();