import mongoose from 'mongoose';
import { validateServerEnv } from "@/lib/env";

type ConnectionObject = {
    isConnected?: number;
    
};
const connection: ConnectionObject = {};

const dbConnect = async (): Promise<void> => {
    validateServerEnv();

    if (connection.isConnected) {// Use existing connection if already connected to MongoDB and advantage is that it will not create multiple connections to MongoDB when we have multiple requests to our API to avoid performance issues and memory leaks
        console.log('Already connected to MongoDB');
        return;
    }
    try {
        const db = await mongoose.connect(process.env.MONGODB_URI!, {});
        connection.isConnected = db.connections[0].readyState;
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw new Error('Failed to connect to MongoDB');
    }  
};

export default dbConnect; 
