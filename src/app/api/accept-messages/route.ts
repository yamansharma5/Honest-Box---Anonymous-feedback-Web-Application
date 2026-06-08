import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import { User as UserModel } from "@/models/user";
import { User } from "next-auth";
import {NextResponse} from "next/server";

export async function POST(request: Request){
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if(!session || !session.user){
        return NextResponse.json({
            success: false,
            message: "Not authenticated"
        }, {status: 401})
    }

    const userId = user._id;
    const {acceptMessages} = await request.json();

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            {isAcceptingMessages: acceptMessages},
            {new: true}
        )

        if(!updatedUser){
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, {status: 404})
        }

        return NextResponse.json({
            success: true,
            message: "Message acceptance status updated successfully",
            updatedUser
        }, {status: 200})

    } catch {
        console.error("Failed to update user status to accept messages");
        return NextResponse.json({
            success: false,
            message: "Failed to update user status to accept messages"
        }, {status: 500})
    }
}

export async function GET(){
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;

    if(!session || !session.user){
        return NextResponse.json({
            success: false,
            message: "Not authenticated"
        }, {status: 401})
    }

    const userId = user._id;

    try {
        const foundUser = await UserModel.findById(userId);
    
        if(!foundUser){
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, {status: 404})
        }
    
        return NextResponse.json({
            success: true,
            isAcceptingMessages: foundUser.isAcceptingMessages
        }, {status: 200})
    } catch {
        console.error("Error in getting message acceptance status");
        return NextResponse.json({
            success: false,
            message: "Error in getting message acceptance status"
        }, {status: 500})
    }
}