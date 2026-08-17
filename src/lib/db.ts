import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
}

declare global {
    var mongoose: MongooseCache;
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

// 1 = connected, 2 = connecting. Anything else cannot serve a query.
const READY = 1;
const CONNECTING = 2;

async function dbConnect() {
    // A serverless function can be frozen for long enough that the provider
    // drops the socket underneath us. The cached handle still looks fine, so
    // without this check the next query fails with an opaque server error --
    // which is what made pages break intermittently rather than consistently.
    const readyState = cached.conn?.connection?.readyState;
    if (cached.conn && readyState === READY) {
        return cached.conn;
    }
    if (cached.conn && readyState !== CONNECTING) {
        cached.conn = null;
        cached.promise = null;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            // Fail fast instead of hanging until the platform kills the request.
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        cached.conn = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;
