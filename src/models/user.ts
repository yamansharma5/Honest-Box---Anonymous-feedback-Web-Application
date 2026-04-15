import mongoose, { Document, Schema } from 'mongoose';

export interface message extends Document {

    content: string;
    createdAt: Date;
}
//difference between interface and type in typescript is that interface can be extended and implemented by classes, while type cannot. Interface is used to define the shape of an object, while type can be used to define a union or intersection of types. In this case, we use interface to define the shape of the message object, which includes content and createdAt properties.
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

export const User = mongoose.model<user>('User', userSchema);// default export of the User model, which can be imported and used in other parts of the application to interact with the users collection in the MongoDB database. The User model includes all the properties defined in the user interface, as well as the messages subdocument array.
export const Message = mongoose.model<message>('Message', messageSchema);
