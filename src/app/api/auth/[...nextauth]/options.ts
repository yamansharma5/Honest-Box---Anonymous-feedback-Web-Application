import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import  dbConnect  from "@/lib/dbConnect";
import { User } from "@/models/user";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "Credentials",
            name: "Credentials",
            credentials: {
                email: { label: "email", type: "text", placeholder: "Username" },
                password :{ label: "Password", type: "password", placeholder: "Password" },
                },
            async authorize(credentials: any ): Promise<any> {
                await dbConnect();
                try {
                    const user = await User.findOne({ 
                        $or: [{ email: credentials.email }, 
                            { username: credentials.email }
                        ]
                    });
                    if (!user) {
                        throw new Error("No user found with the provided email or username.");
                    }
                    if (!user.isverified) {
                        throw new Error("Email not verified. Please verify your email before logging in.");
                    }

                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isPasswordValid) {
                        throw new Error("Invalid password.");
                    }
                    return {
                        id: user._id.toString(),
                        email: user.email,
                        username: user.username,
                        isverified: user.isverified,
                    };
                } catch (error: any) {// why any type is used here is because the error object can have different shapes and properties depending on the source of the error. By using any, we can access the message property without TypeScript throwing an error about it potentially not existing on the error object. This allows us to provide a more informative error message to the client while still handling any unexpected errors gracefully.
                    console.error("Error during authentication:", error);
                    throw new Error(error.message || "An error occurred during authentication.");
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
                token.id = user.id;
                token.email = user.email;
                token.username = user.username;
                token.isverified = user.isverified;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user._id = token.id;
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
        
    

