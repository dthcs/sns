const SocketIO = require('socket.io');

module.exports = (server, app) => {
    const io = SocketIO(server, { path: '/socket.io' });
    app.set('io', io);

    io.on('connection', (socket) => {
        const req = socket.request;
        const { headers: {referer}} = req;
        const roomId = new URL(referer).pathname.split('/').at(-1);
        socket.join(roomId);
        socket.on('disconnect', () => {
            socket.leave(roomId);
        });
        // const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        // console.log('Access new client!', ip, socket.id, req.ip);
        // socket.on('disconnect', () => {
        //     console.log('disconnect client', ip, socket.id);
        //     clearInterval(socket.interval);
        // });
        // socket.on('error', (error) => {
        //     console.error(error);
        // });
        // socket.on('reply', (data) => {
        //     console.log(data);
        // });
        // socket.interval = setInterval(() => {
        //     socket.emit('news', 'Hello Socket.IO');
        // }, 3000);

    });
};




//========ws packet===========

// const webSocket = require('ws');

// module.exports = (server) => {
//     const wss = new WebSocket.Server({ server });
    
//     wss.on('connection', (ws, req) => {
//         const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
//         console.log("connect new client", ip);
//         ws.on('message', (message) => {
//             console.log(message.toString());
//         });
//         ws.on('error', (error) => {
//             console.error(error);
//         });
//         ws.on('close', () => {
//             console.log('disconnet client', ip);
//             clearInterval(ws.interval);
//         });

//         ws.interval = setInterval(() => {
//             if(ws.readyState === ws.OPEN){
//                 ws.send('server sends message to client');
//             }
//         }, 3000);
//     });
// };