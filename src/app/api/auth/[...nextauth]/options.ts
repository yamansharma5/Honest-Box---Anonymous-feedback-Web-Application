import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import  dbConnect  from "@/lib/dbConnect";
import { User } from "@/models/user";

type CredentialInput = {
    email: string;
    password: string;
};

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "Credentials",
            name: "Credentials",
            credentials: {
                email: { label: "email", type: "text", placeholder: "Username" },
                password :{ label: "Password", type: "password", placeholder: "Password" },
                },
            async authorize(credentials) {
                await dbConnect();
                try {
                    if (!credentials?.email || !credentials?.password) {
                        throw new Error("Email/username and password are required.");
                    }

                    const { email, password } = credentials as CredentialInput;

                    const user = await User.findOne({
                        $or: [{ email }, { username: email }],
                    });
                    if (!user) {
                        throw new Error("No user found with the provided email or username.");
                    }
                    if (!user.isverified) {
                        throw new Error("Email not verified. Please verify your email before logging in.");
                    }

                    const isPasswordValid = await bcrypt.compare(password, user.password);
                    if (!isPasswordValid) {
                        throw new Error("Invalid password.");
                    }
                    return {
                        id: user._id.toString(),
                        _id: user._id.toString(),
                        email: user.email,
                        username: user.username,
                        isverified: user.isverified,
                        isAcceptingMessages: user.isAcceptingMessages,
                    };
                } catch (error: unknown) {
                    console.error("Error during authentication:", error);
                    const message = error instanceof Error
                        ? error.message
                        : "An error occurred during authentication.";
                    throw new Error(message);
                }
            }
        })
    ],
    pages: {
        signIn: "/sign-in",
        error: "/sign-in"
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token._id = user._id;
                token.isverified = user.isverified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id;
                session.user.isverified = token.isverified;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
                session.user.username = token.username; 
            }
            return session;
        }
    },

    session: {
        strategy: "jwt",
    },
    jwt: {
        secret: process.env.NEXTAUTH_SECRET,
    },
};
        
    

