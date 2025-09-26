import { wppClient } from '../dist/auth/WWebAuth.js';

wppClient.on('message_create', (msg: any) => {
    if (msg.body === 'ping') wppClient.sendMessage(msg.from, 'pong');
});