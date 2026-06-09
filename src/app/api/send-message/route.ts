import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/user";
import { NextRequest, NextResponse } from "next/server";
import { messageSchema } from "@/schemas/messageSchema";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const parsed = messageSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((e) => e.message).join(", ");
      return NextResponse.json(
        { success: false, message: errors },
        { status: 400 }
      );
    }
    const { content } = parsed.data;

    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json(
        { success: false, message: "Username is required" },
        { status: 400 }
      );
    }

    const user = await User.findOne(
      { username, isverified: true },
      { isAcceptingMessages: 1, messages: 1 }
    );
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (!user.isAcceptingMessages) {
      return NextResponse.json(
        { success: false, message: "This user is not accepting messages" },
        { status: 403 }
      );
    }

    user.messages.push({ content, createdAt: new Date() } as never);
    await user.save();

    return NextResponse.json(
      { success: true, message: "Message sent successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error && error.message === "Failed to connect to MongoDB"
            ? "Could not connect to the database. Please check your MongoDB connection."
            : "An error occurred while sending the message",
      },
      { status: 500 }
    );
  }
}
