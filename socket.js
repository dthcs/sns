const webSocket = require('ws');

module.exports = (server) => {
    const wss = new WebSocket.Server({ server });
    
    wss.on('connection', (ws, req) => {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        console.log("connect new client", ip);
        ws.on('message', (message) => {
            console.log(message.toString());
        });
        ws.on('error', (error) => {
            console.error(error);
        });
        ws.on('close', () => {
            console.log('disconnet client', ip);
            clearInterval(ws.interval);
        });

        ws.interval = setInterval(() => {
            if(ws.readyState === ws.OPEN){
                ws.send('server sends message to client');
            }
        }, 3000);
    });
};