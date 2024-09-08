import mongoose from 'mongoose';
import app from './app';
import config from './app/config';
import seedSuperAdmin from './app/DB';
import { errorLogger, logger } from './app/logger/winstonLogger';
import colors from 'colors';
import seedUsers from './app/seeds/user.seeds';
import seedFacilities from './app/seeds/facility.seeds';
import seedProperties from './app/seeds/property.seeds';
import { Server } from 'socket.io';
import { createServer, Server as HttpServer } from 'http';

let server: HttpServer;

// Create HTTP server and Socket.io server
const httpServer = createServer(app);
const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: config.corsOrigin,
    credentials: true,
  },
});

app.set('io', io);

async function main() {
  try {
    const connectionInstance = await mongoose.connect(
      `${config.dbURL}/${config.collectionName}`,
    );

    // Seed data
    seedSuperAdmin();
    seedUsers();
    seedFacilities();
    seedProperties();

    logger.info(
      colors.bgGreen.bold(
        `✅ Database Connected! Host: ${connectionInstance?.connection?.host}`,
      ),
    );

    server = app.listen(Number(config.port), config.ipAddress as string, () => {
      logger.info(
        colors.bgGreen.bold(
          `🚀 Server running on: ${config.ipAddress}:${config.port}`,
        ),
      );
    });
  } catch (error) {
    errorLogger.error(
      colors.bgCyan.bold(`❌ MongoDB connection error: ${error}`),
    );
    process.exit(1);
  }
}

main();

process.on('unhandledRejection', (error) => {
  errorLogger.error(
    colors.bgYellow.bold(`⚠️ Unhandled rejection, shutting down... ${error}`),
  );

  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  errorLogger.error(
    colors.bgRed.bold(`❌ Uncaught exception: ${error}, shutting down...`),
  );
  process.exit(1);
});
