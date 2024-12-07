"use server";
import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { revalidatePath } from "next/cache";

export async function createOffRampTxn(amount: number, provider: string) {
  if (amount <= 0) {
    throw new Error("Amount cannot be insignificant");
  }

  const session = await getServerSession(authOptions);
  if (!session?.user || !session.user?.id) {
    throw new Error("Unauthenticated request");
  }

  const bal = await prisma.balance.findUnique({
    where: {
      userId: session.user.id,
    },
  });

  if (!bal) {
    throw new Error("Balance not found");
  }

  if (bal.amount < amount) {
    throw new Error("Insufficient balance");
  }

  const token = Math.random().toString(36).substring(2); // Generate a random token

  try {
    await prisma.bankTransaction.create({
      data: {
        status: "Pending",
        startTime: new Date(),
        token: token,
        userId: session?.user?.id,
        provider: provider,
        amount,
      },
    });

    revalidatePath("/transfer");

    return {
      message: "Transaction created successfully",
      transToken: token,
    };
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw new Error("An error occurred while creating the transaction");
  }
}
