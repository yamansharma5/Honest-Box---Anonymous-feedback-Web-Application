import dbConnect from "@/lib/dbConnect";
import { User as UserModel } from "@/models/user";
import {NextResponse} from "next/server";

export async function POST(request: Request){
    await dbConnect();

    try {
        const {username, code} = await request.json();

        const decodedUsername = decodeURIComponent(username);
        const user = await UserModel.findOne({
            username: decodedUsername
        })

        if(!user){
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, {status: 404})
        }

        const isCodeValid = user.verifycode === code;
        const isCodeNotExpired = new Date(user.verifycodeexpire) > new Date();

        if(isCodeValid && isCodeNotExpired){
            user.isverified = true;
            await user.save();

            return NextResponse.json({
                success: true,
                message: "Account verified successfully"
            }, {status: 200})
        } else if(!isCodeNotExpired){
            return NextResponse.json({
                success: false,
                message: "Verification code has expired, please sign up again to get a new code"
            }, {status: 400})
        } else {
            return NextResponse.json({
                success: false,
                message: "Incorrect verification code"
            }, {status: 400})
        }

    } catch (error) {
        console.error("Error verifying user", error);
        return NextResponse.json({
            success: false,
            message: "Error verifying user"
        },
    {
        status: 500
    })
    }
}
