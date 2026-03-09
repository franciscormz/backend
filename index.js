const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const pool = require("./config/db.js");


const app = express();
const server = http.createServer(app);
const io = new Server(server);


//Línea para activar la carpeta public pc2 en nodejs
app.use(express.static('public'));
const usuariosUbicacion = {};
let usuariosConectados = 0;

io.on('connection', (socket) => {
    console.log("Usuario conectado:", socket.id);
    usuariosConectados++;

    // Obtener usuarios existentes
    socket.on("getUsuarios", async () => {
        const result = await pool.query("SELECT * FROM usuarios ORDER BY id");
        socket.emit("getUsuarios", result.rows);
    });

    // Insertar usuario
    socket.on("nuevoUsuario", async (data) => {

        const result = await pool.query(
            `INSERT INTO usuarios 
            (nombre_usuario,password,nombre,ap_paterno,ap_materno,created_at)
            VALUES ($1,$2,$3,$4,$5,NOW())
            RETURNING *`,
            [
                data.nombre_usuario,
                data.password,
                data.nombre,
                data.ap_paterno,
                data.ap_materno
            ]
        );

        // Usuario insertado
        const usuario = result.rows[0];

        // Enviar a todos los clientes
        io.emit("usuarioAgregado", usuario);
    });

    // chat
    socket.on('mensaje', (data) => {
        io.emit('mensaje', data);
    });

    socket.emit("usuariosIniciales", usuariosUbicacion);

    // Recibir ubicación
    socket.on("ubicacion", (data) => {

        usuariosUbicacion[socket.id] = {
            lat: data.lat,
            lng: data.lng
        };

        io.emit("ubicacionUsuarios", {
            id: socket.id,
            lat: data.lat,
            lng: data.lng
        });

    });


    io.emit("usuariosConectados", usuariosConectados);

    socket.on("disconnect", () => {

        usuariosConectados--;

        delete usuariosUbicacion[socket.id];

        console.log("Usuario desconectado:", socket.id);

        io.emit("usuarioDesconectado", socket.id);

        io.emit("usuariosConectados", usuariosConectados);

    });

});

//Iniciar el servidor nodejs
server.listen(3000, () => {
    console.log('Servidor en http://localhost:3000');
});