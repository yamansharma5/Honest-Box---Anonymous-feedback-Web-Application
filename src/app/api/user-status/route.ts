import dbConnect from "@/lib/dbConnect";
import { User } from "@/models/user";
import { NextRequest, NextResponse } from "next/server";

// GET /api/user-status?username=xxx
// Public endpoint — returns whether a verified user exists and is accepting messages.
export async function GET(request: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { success: false, message: "Username is required" },
      { status: 400 }
    );
  }

  try {
    const user = await User.findOne(
      { username, isverified: true },
      { isAcceptingMessages: 1 }
    ).lean();

    if (!user) {
      return NextResponse.json(
        { success: false, exists: false, isAcceptingMessages: false },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, exists: true, isAcceptingMessages: user.isAcceptingMessages },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user status:", error);
    return NextResponse.json(
      { success: false, message: "Error fetching user status" },
      { status: 500 }
    );
  }
}
