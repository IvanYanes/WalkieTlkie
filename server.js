const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir los archivos estáticos de la carpeta "public"
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Un usuario se ha conectado:', socket.id);

    // Recibimos un objeto { username, audioBuffer } desde el cliente
    socket.on('voice-message', (data) => {
        console.log(`[AUDIO] Mensaje recibido de: ${data.username} (${socket.id})`);
        
        // Reenviamos el mensaje a todos los demás conectados
        socket.broadcast.emit('voice-message', data);
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});