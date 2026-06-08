import mongoose, { Document, Schema } from 'mongoose';

export interface message extends Document {

    content: string;
    createdAt: Date;
}
const messageSchema: Schema<message> = new Schema({
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Define the user interface and schema for Mongoose, including the messages as a subdocument array
export interface user extends Document { // extends Document to include Mongoose document properties and methods 

    username: string;
    email: string;
    password: string;
    isverified: boolean;
    verifycode: string;
    verifycodeexpire: Date;
    isAcceptingMessages: boolean;
    messages: message[];
}

const userSchema: Schema<user> = new Schema({
    username: { type: String, required: true },
    email: { 
        type: String,
        required: true,
        unique: true,
        match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    },
    password: { type: String, required: true },
    verifycode: { type: String,
        required: [true, 'Verification code is required.']
     },
    verifycodeexpire: { 
        type: Date,
        required: [true, 'Verification code expiration date is required.']
    },
    isverified: { type: Boolean, default: false },
    isAcceptingMessages: { type: Boolean, default: true },
    messages: [messageSchema]

}); 

export const User =
  (mongoose.models.User as mongoose.Model<user>) ||
  mongoose.model<user>('User', userSchema);

export const Message =
  (mongoose.models.Message as mongoose.Model<message>) ||
  mongoose.model<message>('Message', messageSchema);
