import { NextRequest, NextResponse } from "next/server";
import prisma from "@repo/db/client";
import bcrypt from "bcryptjs";
import { signupSchema } from "@/zod-schemas/Signup";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validationResult = signupSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMsg = validationResult.error.errors.map((err) => err.message);
      return NextResponse.json(
        { success: false, message: errorMsg.join(",") },
        { status: 400 }
      );
    }

    const { username, password, email, mobile } = validationResult.data;

    // Check if the user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: username }, { email: email }, { mobile: mobile }],
      },
    });

    if (existingUser) {
      let msg = "";
      if (existingUser.email === email) msg = "Email already exists";
      else if (existingUser.mobile === mobile)
        msg = "Mobile number already exists";
      else if (existingUser.username === username)
        msg = "Username already exists";
      return NextResponse.json(
        { success: false, message: msg },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        mobile,
        password: hashedPassword,
        verification: false,
      },
    });

    const userBalance = await prisma.balance.create({
      data: {
        amount: 0,
        userId: newUser.id,
      },
    });

    return NextResponse.json(
      { success: true, user: newUser, balance: userBalance },
      { status: 200 }
    );
  } catch (err) {
    console.error("Signup Error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
