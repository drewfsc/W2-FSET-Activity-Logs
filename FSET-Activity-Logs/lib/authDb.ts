import mongoose, { Connection } from 'mongoose';

const AUTH_MONGODB_URI = process.env.AUTH_MONGODB_URI || '';
const AUTH_MONGODB_DB = process.env.AUTH_MONGODB_DB || 'FSC';

if (!AUTH_MONGODB_URI) {
  throw new Error('Please define the AUTH_MONGODB_URI environment variable');
}

interface AuthMongooseCache {
  conn: Connection | null;
  promise: Promise<Connection> | null;
}

declare global {
  var authMongoose: AuthMongooseCache | undefined;
}

let authCached: AuthMongooseCache = global.authMongoose || { conn: null, promise: null };

if (!global.authMongoose) {
  global.authMongoose = authCached;
}

async function authDbConnect(): Promise<Connection> {
  if (authCached.conn) {
    return authCached.conn;
  }

  if (!authCached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: AUTH_MONGODB_DB,
    };

    // Create a separate mongoose connection for auth database
    authCached.promise = mongoose.createConnection(AUTH_MONGODB_URI, opts).asPromise();
  }

  try {
    authCached.conn = await authCached.promise;
  } catch (e) {
    authCached.promise = null;
    throw e;
  }

  return authCached.conn;
}

export default authDbConnect;
