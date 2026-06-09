import dns from 'node:dns';
import mongoose from 'mongoose';
import { validateServerEnv } from "@/lib/env";

type ConnectionObject = {
    isConnected?: number;
    
};
const connection: ConnectionObject = {};
const fallbackDnsServers = ["8.8.8.8", "1.1.1.1"];

function isSrvLookupRefused(error: unknown) {
    return (
        error instanceof Error &&
        "code" in error &&
        error.code === "ECONNREFUSED" &&
        error.message.includes("querySrv")
    );
}

async function connectToMongoDB() {
    const db = await mongoose.connect(process.env.MONGODB_URI!, {});
    connection.isConnected = db.connections[0].readyState;
    console.log('Connected to MongoDB');
}

const dbConnect = async (): Promise<void> => {
    validateServerEnv(["MONGODB_URI"]);

    if (connection.isConnected) {// Use existing connection if already connected to MongoDB and advantage is that it will not create multiple connections to MongoDB when we have multiple requests to our API to avoid performance issues and memory leaks
        console.log('Already connected to MongoDB');
        return;
    }
    try {
        await connectToMongoDB();
    } catch (error) {
        if (
            process.env.MONGODB_URI?.startsWith("mongodb+srv://") &&
            isSrvLookupRefused(error)
        ) {
            console.warn('MongoDB SRV DNS lookup was refused. Retrying with fallback DNS servers.');
            dns.setServers(fallbackDnsServers);

            try {
                await connectToMongoDB();
                return;
            } catch (retryError) {
                console.error('Error connecting to MongoDB after DNS fallback:', retryError);
                throw new Error('Failed to connect to MongoDB');
            }
        }

        console.error('Error connecting to MongoDB:', error);
        throw new Error('Failed to connect to MongoDB');
    }  
};

export default dbConnect; 
