import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            _id?: string;
            isverified?: boolean;
            isAcceptingMessages?: boolean;
            username?: string;
        } & DefaultSession["user"];
    }

    interface User extends DefaultUser {
        id: string;
        isverified?: boolean;
        isAcceptingMessages?: boolean;
        username?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        isverified?: boolean;  
        isAcceptingMessages?: boolean;
        username?: string;
    }
}
/*
Why optional?
When the token is first created, it may not have all user properties yet.
Keeping these fields optional avoids TypeScript errors before values are set.
*/