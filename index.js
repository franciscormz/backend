const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 👇 ESTA LÍNEA ES CLAVE
//Línea para activar la carpeta public pc2
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Cliente nuevo conectado');

    socket.on('mensaje', (data) => {
        io.emit('mensaje', data);
    });
});

//Iniciar el servidor nodejs
server.listen(3000, () => {
    console.log('Servidor en http://localhost:3000');
});