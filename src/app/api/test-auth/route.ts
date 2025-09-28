import { auth } from "@/server/auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      message: "Authenticated successfully",
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      },
    });
  } catch (error) {
    console.error("Auth test error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
