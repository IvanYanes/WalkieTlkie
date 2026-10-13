const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Objeto para llevar el registro: { socketId: username }
let connectedUsers = {};

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado:', socket.id);

    // Cuando el usuario registra su nombre
    socket.on('register-username', (username) => {
        // Limpiamos por si acaso el mismo socket ya estaba registrado
        connectedUsers[socket.id] = username;
        console.log(`Usuario registrado: ${username} (${socket.id})`);
        
        // Emitimos la lista limpia y sin duplicados
        actualizarUsuarios();
    });

    // Cuando un usuario envía un mensaje de voz
    socket.on('voice-message', (data) => {
        console.log(`[AUDIO] Mensaje recibido de: ${data.username}`);
        socket.broadcast.emit('voice-message', data);
    });

    // Cuando se desconecta por completo
    socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);
        if (connectedUsers[socket.id]) {
            console.log(`Eliminando de la lista a: ${connectedUsers[socket.id]}`);
            delete connectedUsers[socket.id];
        }
        actualizarUsuarios();
    });
});

// Función auxiliar para enviar la lista actualizada a todos
function actualizarUsuarios() {
    // Obtenemos solo los valores únicos para evitar nombres repetidos si se reconectan rápido
    const listaUnica = [...new Set(Object.values(connectedUsers))];
    io.emit('update-user-list', listaUnica);
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});