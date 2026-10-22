import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';

dotenv.config();

const startPort = Number(process.env.PORT) || 5001;

const listen = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      const nextPort = port + 1;
      console.warn(`Port ${port} is busy. Retrying on port ${nextPort}...`);
      listen(nextPort);
      return;
    }

    console.error('Server failed to listen:', error.message);
    process.exit(1);
  });
};

const startServer = async () => {
  try {
    await connectDB();
    listen(startPort);
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
