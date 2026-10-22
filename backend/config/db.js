import mongoose from 'mongoose';
import Permit from '../models/Permit.js';
import User from '../models/User.js';

let databaseName = 'Ajeer';
let localUri;
let atlasUri;
let connectionOptions;
let secondaryConnection;
let primaryName = 'local';
let secondaryName = 'atlas';
let syncQueue = Promise.resolve();
let connectionPromise;
let syncTimer;

const getSecondaryUri = () => (primaryName === 'local' ? atlasUri : localUri);
const getSecondaryName = () => (primaryName === 'local' ? 'atlas' : 'local');

// 1. Secondary Connection Handler
const connectSecondary = async () => {
  const uri = getSecondaryUri();
  if (!uri || secondaryConnection?.readyState === 1) return;

  const connection = mongoose.createConnection();
  try {
    await connection.openUri(uri, connectionOptions);
    secondaryConnection = connection;
    secondaryName = getSecondaryName();
    console.log(`Secondary MongoDB connected: ${secondaryName} (${databaseName})`);
    await syncDatabases();
  } catch (error) {
    await connection.close().catch(() => {});
    console.warn(`Secondary MongoDB (${getSecondaryName()}) unavailable; will retry: ${error.message}`);
  }
};

// 2. Collection Sync Engine
const syncCollection = async (modelName, schema) => {
  if (!secondaryConnection || secondaryConnection.readyState !== 1) return;

  try {
    const primaryModel = mongoose.model(modelName);
    const secondaryModel = secondaryConnection.models[modelName] 
      || secondaryConnection.model(modelName, schema);

    const [primaryDocs, secondaryDocs] = await Promise.all([
      primaryModel.find({}).lean(),
      secondaryModel.find({}).lean(),
    ]);

    const latestDocuments = new Map();

    // Primary aur Secondary dono ke docs ko evaluate karen
    [...primaryDocs, ...secondaryDocs].forEach((doc) => {
      const key = String(doc._id);
      const current = latestDocuments.get(key);
      const docTime = new Date(doc.updatedAt || doc.createdAt || 0).getTime();
      const currentTime = current 
        ? new Date(current.updatedAt || current.createdAt || 0).getTime() 
        : -1;

      if (!current || docTime > currentTime) {
        latestDocuments.set(key, doc);
      }
    });

    const operations = [...latestDocuments.values()].map((doc) => ({
      replaceOne: {
        filter: { _id: doc._id },
        replacement: doc,
        upsert: true, // Naye document ko insert karega
      },
    }));

    if (operations.length > 0) {
      await Promise.all([
        primaryModel.bulkWrite(operations, { ordered: false }),
        secondaryModel.bulkWrite(operations, { ordered: false }),
      ]);
    }
  } catch (error) {
    console.warn(`Sync failed for ${modelName}:`, error.message);
  }
};

// 3. Full Database Sync Runner
const runSync = async () => {
  if (!secondaryConnection || secondaryConnection.readyState !== 1) return;
  await syncCollection('Permit', Permit.schema);
  await syncCollection('User', User.schema);
};

export const syncDatabases = () => {
  syncQueue = syncQueue.then(runSync, runSync);
  return syncQueue;
};

export const getDatabaseStatus = () => ({
  database: databaseName,
  primary: primaryName,
  primaryConnected: mongoose.connection.readyState === 1,
  secondary: secondaryName || getSecondaryName(),
  secondaryConnected: secondaryConnection?.readyState === 1,
});

// 4. Main Database Connection
const connectDB = () => {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (connectionPromise) return connectionPromise;

  databaseName = process.env.MONGO_DB_NAME || 'Ajeer';
  localUri = process.env.MONGO_LOCAL_URI || `mongodb://127.0.0.1:27017/${databaseName}`;
  atlasUri = process.env.MONGO_ATLAS_URI || process.env.MONGO_URI;

  connectionOptions = {
    dbName: databaseName,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  };

  connectionPromise = (async () => {
    try {
      // Vercel deployment par direct Atlas se connect hoga
      if (process.env.VERCEL) {
        if (!atlasUri) throw new Error('MONGO_URI must be configured on Vercel');
        await mongoose.connect(atlasUri, connectionOptions);
        primaryName = 'atlas';
        console.log(`Primary MongoDB connected: atlas (${databaseName})`);
        return;
      }

      // Pehle Local MongoDB se connect karne ki koshish karen
      try {
        await mongoose.connect(localUri, connectionOptions);
        primaryName = 'local';
        secondaryName = 'atlas';
      } catch (localError) {
        if (!atlasUri) throw localError;
        console.warn(`Local MongoDB unavailable, falling back to Atlas: ${localError.message}`);
        await mongoose.connect(atlasUri, connectionOptions);
        primaryName = 'atlas';
        secondaryName = 'local';
      }

      console.log(`Primary MongoDB connected: ${primaryName} (${databaseName})`);
      
      // Secondary DB (Local ya Atlas) connect karen
      await connectSecondary();

      // Har 15 seconds baad auto sync chalayen
      if (!syncTimer) {
        const syncInterval = Number(process.env.MONGO_SYNC_INTERVAL_MS) || 15000;
        syncTimer = setInterval(async () => {
          await connectSecondary();
          await syncDatabases();
        }, syncInterval);
        syncTimer.unref();
      }
    } catch (error) {
      console.error('MongoDB connection failed:', error.message);
      throw error;
    }
  })();

  connectionPromise = connectionPromise.catch((error) => {
    connectionPromise = undefined;
    throw error;
  });

  return connectionPromise;
};

export default connectDB;