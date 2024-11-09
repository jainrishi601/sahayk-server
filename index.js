// Import necessary modules
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');  // Add CORS support if needed

const app = express();

// Middleware for CORS
app.use(cors());  // Allow all origins; configure as needed

// Create server and attach socket.io
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*',  // Replace '*' with the specific URL if you know it
        methods: ['GET', 'POST']
    }
});

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
            const { room, image } = JSON.parse(data);  // Destructure room and image data
            if (!room || !image) throw new Error("Incomplete data received");

            // Broadcast screen data to all clients in the room
            socket.to(room).emit('screen-data', image);
            console.log(`Broadcasting screen data to room: ${room}`);
        } catch (error) {
            console.error('Error parsing screen data:', error);
            socket.emit('error-message', 'Invalid screen data format');
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
