import mongoose, { Document, Schema } from 'mongoose';

export interface message extends Document {

    content: string;
    createdAt: Date;
}

const messageSchema: Schema<message> = new Schema({
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});


export interface user extends Document {

    username: string;
    email: string;
    password: string;
    isverified: boolean;
    verifycode: Date;
    verifycodeExpire: Date;
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
    verifycode: { type: Date,
        required: [true, 'Verification code is required.']
     },
    verifycodeExpire: { 
        type: Date,
        required: [true, 'Verification code expiration date is required.']
    },
    isverified: { type: Boolean, default: false },
    messages: [messageSchema]

}); 

export const User = mongoose.model<user>('User', userSchema);
export const Message = mongoose.model<message>('Message', messageSchema);
