import dbConnect from "@/lib/dbConnect";
import { User as UserModel } from "@/models/user";
import { NextResponse } from "next/server";
import {z} from "zod";

const UsernameQuerySchema = z.object({
    username: z.string().min(2, "Username must be at least 2 characters").max(20, "Username must be no more than 20 characters").regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special characters")
})

export async function GET(request: Request){
    await dbConnect();

    try {
        const {searchParams} = new URL(request.url);
        const queryParams = {
            username: searchParams.get("username")
        }

        // validate with zod
        const result = UsernameQuerySchema.safeParse(queryParams);
        console.log(result); //TODO: remove
        if(!result.success){
            const usernameErrors = result.error.format().username?._errors || [];
            return NextResponse.json({
                success: false,
                message: usernameErrors?.length > 0 ? usernameErrors.join(", ") : "Invalid query parameters"
            }, {status: 400})
        }

        const {username} = result.data;

        const existingVerifiedUser = await UserModel.findOne({
            username,
            isVerified: true
        })

        if(existingVerifiedUser){
            return NextResponse.json({
                success: false,
                message: "Username is already taken"
            }, {status: 400})
        }

        return NextResponse.json({
            success: true,
            message: "Username is unique"
        }, {status: 200})

    } catch (error) {
        console.error("Error checking username", error);
        return NextResponse.json({
            success: false,
            message: "Error checking username"
        },
    {
        status: 500
    })
    }
}