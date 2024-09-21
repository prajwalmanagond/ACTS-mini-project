const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const http = require('http');
const socketIo = require('socket.io');

const taskRoutes = require('./routes/tasks');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('Client connected');
  // Emit notification when a task's deadline is approaching
  const sendNotifications = () => {
    Task.find({ status: 'Upcoming' }).then(tasks => {
      const upcomingTasks = tasks.filter(task => {
        const endDate = new Date(task.endDate);
        const now = new Date();
        return endDate.getTime() - now.getTime() <= 24 * 60 * 60 * 1000; // Check if deadline is within 24 hours
      });
      if (upcomingTasks.length > 0) {
        socket.emit('notify', upcomingTasks);
      }
    });
  };

  setInterval(sendNotifications, 60 * 1000);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/ACTS")
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Routes
app.use('/tasks', taskRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
