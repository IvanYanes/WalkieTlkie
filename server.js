const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Objeto para llevar el registro de los usuarios conectados: { socketId: username }
let connectedUsers = {};

// Servir los archivos estáticos de la carpeta "public"
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado:', socket.id);

    // Cuando el usuario envía su nombre al entrar
    socket.on('register-username', (username) => {
        connectedUsers[socket.id] = username;
        console.log(`Usuario registrado: ${username} (${socket.id})`);
        
        // Notificamos a todos la lista actualizada
        io.emit('update-user-list', Object.values(connectedUsers));
    });

    // Cuando un usuario envía un mensaje de voz
    socket.on('voice-message', (data) => {
        console.log(`[AUDIO] Mensaje recibido de: ${data.username}`);
        socket.broadcast.emit('voice-message', data);
    });

    // Cuando se desconecta
    socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);
        delete connectedUsers[socket.id];
        
        // Actualizamos la lista para los demás
        io.emit('update-user-list', Object.values(connectedUsers));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});