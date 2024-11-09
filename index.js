// Import necessary modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();

// Create server and attach socket.io
const server = http.createServer(app);
const io = socketIo(server);

// Serve the viewer page (display.html)
app.get('/view', (req, res) => {
    res.sendFile(__dirname + '/display.html');
});

// Handle socket.io connections
io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle room joining
    socket.on('join-message', (roomId) => {
        if (!roomId || roomId.trim() === '') {
            socket.emit('error-message', 'Room ID is required.');
            return;
        }
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });

    // Handle receiving screen data
    socket.on('screen-data', (data) => {
        try {
            data = JSON.parse(data); // Parse the incoming data
            const room = data.room;
            const imgStr = data.image;

            // Broadcast screen data to all clients in the room
            socket.broadcast.to(room).emit('screen-data', imgStr);
            console.log(`Broadcasting screen data to room: ${room}`);
        } catch (error) {
            console.error('Error parsing screen data:', error);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });

    // Handle socket errors
    socket.on('error', (err) => {
        console.error('Socket error:', err);
    });
});

// Set up server to listen on port 5000
const port = process.env.PORT || 5000;
server.listen(port, () => {
    console.log(`Server started on port: ${port}`);
});
