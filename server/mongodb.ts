import mongoose from 'mongoose';
import { log } from './vite';

// MongoDB connection string (from environment variable)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://cogniflow:Cogniflow%40123@cluster0.nv6lk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB
export async function connectToDatabase(): Promise<typeof mongoose> {
  try {
    log('Connecting to MongoDB...', 'mongodb');
    
    const connection = await mongoose.connect(MONGODB_URI);
    
    log('Connected to MongoDB successfully!', 'mongodb');
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      log(`MongoDB connection error: ${err}`, 'mongodb');
    });
    
    mongoose.connection.on('disconnected', () => {
      log('MongoDB disconnected', 'mongodb');
    });
    
    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      log('MongoDB connection closed due to app termination', 'mongodb');
      process.exit(0);
    });
    
    return connection;
  } catch (error) {
    log(`Failed to connect to MongoDB: ${error}`, 'mongodb');
    throw error;
  }
}

export default mongoose;