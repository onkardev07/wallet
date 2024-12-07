"use server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";

export async function p2pTransfer(to: string, amount: number) {
  const session = await getServerSession(authOptions);
  const from = session?.user?.id;

  if (!from) {
    throw new Error("Unauthenticated request");
  }

  const toUser = await prisma.user.findFirst({
    where: { mobile: to },
  });

  if (!toUser) {
    throw new Error("Recipient user not found");
  }

  try {
    await prisma.$transaction(async (tx: any) => {
      await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${from} FOR UPDATE`;

      const fromBalance = await tx.balance.findUnique({
        where: { userId: from },
      });

      if (!fromBalance || fromBalance.amount < amount) {
        throw new Error("Insufficient funds");
      }

      await tx.balance.update({
        where: { userId: from },
        data: { amount: { decrement: amount } },
      });

      await tx.balance.update({
        where: { userId: toUser.id },
        data: { amount: { increment: amount } },
      });

      await tx.pPTransfer.create({
        data: {
          fromUserId: from,
          toUserId: toUser.id,
          amount,
          status: "Success",
          timestamp: new Date(),
        },
      });
    });

    return {
      message: "Transfer successful",
    };
  } catch (error: any) {
    await prisma.pPTransfer.create({
      data: {
        fromUserId: from,
        toUserId: toUser.id,
        amount,
        status: "Failure",
        timestamp: new Date(),
      },
    });

    return {
      message: `Transfer failed: ${error.message}`,
    };
  }
}
