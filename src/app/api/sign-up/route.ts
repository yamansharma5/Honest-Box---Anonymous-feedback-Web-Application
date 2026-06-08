import dbConnect from "@/lib/dbConnect";
import { User } from '@/models/user';
import bcrypt from "bcrypt";
import { ApiResponse } from "@/types/ApiResponse";
import { NextRequest, NextResponse } from "next/server";
import { signUpSchema } from "@/schemas/signUpSchema";
import { sendVerificationEmail } from "@/helpers/send-verification-email";

export async function POST(request: NextRequest) {
    await dbConnect();

    try {
        const body = await request.json();
        const parsed = signUpSchema.safeParse(body);
        if (!parsed.success) {
            const errors = parsed.error.issues.map((e) => e.message).join(", ");
            return NextResponse.json<ApiResponse>(
                { success: false, message: errors },
                { status: 400 }
            );
        }
        const { username, email, password } = parsed.data;
        const existingUserByEmail = await User.findOne({ email });

        const hashedPassword = await bcrypt.hash(password, 10);
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verifyCodeExpiry = new Date(Date.now() + 3600000); // 1 hour expiry

        if (existingUserByEmail) {
            if (existingUserByEmail.isverified) {
                return NextResponse.json<ApiResponse>(
                    { success: false, message: 'Email already in use.' },
                    { status: 400 }
                );
            } else {
                // Update the existing unverified user
                existingUserByEmail.username = username;
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifycode = verifyCode;
                existingUserByEmail.verifycodeexpire = verifyCodeExpiry;
                await existingUserByEmail.save();
            }
        } else {
            // Create a new user with the provided details
            const newUser = new User({
                username,
                email,
                password: hashedPassword,
                verifycode: verifyCode,
                verifycodeexpire: verifyCodeExpiry,
                isverified: false,
            });
            await newUser.save();
        }

        const emailResponse = await sendVerificationEmail(email, username, verifyCode);
        if (!emailResponse.success) {
            return NextResponse.json<ApiResponse>(
                { success: false, message: 'User saved but failed to send verification email.' },
                { status: 500 }
            );
        }

        return NextResponse.json<ApiResponse>({
            success: true,
            message: 'User registered successfully. Verification email sent.',
        });
    } catch (error) {
        console.error('Error during sign-up:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, message: 'An error occurred during sign-up.' },
            { status: 500 }
        );
    }
}