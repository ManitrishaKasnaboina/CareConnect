const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const app = require('./app');
const { initSocket } = require('./config/socket');

dotenv.config();

const PORT = process.env.PORT || 5000;
const RETRY_DELAY_MS = 10000;

const wait = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));

const startServer = async () => {
  // Keep retrying while Atlas is unavailable instead of crashing nodemon.
  while (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (error) {
      console.error(`Retrying MongoDB connection in ${RETRY_DELAY_MS / 1000}s...`);
      await wait(RETRY_DELAY_MS);
    }
  }

  try {
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    // Initialize Socket.IO after the HTTP server is ready.
    initSocket(server);

    // Graceful shutdown
    const shutdown = () => {
      console.log('Signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        if (mongoose.connection.readyState === 1) {
          mongoose.connection.close().then(() => {
            console.log('MongoDB connection closed');
            process.exit(0);
          });
        } else {
          process.exit(0);
        }
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exitCode = 1;
  }
};

startServer();
