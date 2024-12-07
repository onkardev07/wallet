import { AddMoney } from "@/components/AddMoney";
import { BalanceCard } from "@/components/BalanceCard";
import { RecentTransactions } from "@/components/RecentTransaction";

import { WithdrawMoney } from "@/components/WithdrawMoney";
import { authOptions } from "@/lib/auth";
import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";

async function getBalance() {
  const session = await getServerSession(authOptions);
  const balance = await prisma.balance.findFirst({
    where: {
      userId: session?.user?.id,
    },
  });
  return {
    amount: balance?.amount || 0,
  };
}

async function getOnRampTransactions() {
  const session = await getServerSession(authOptions);
  const txns = await prisma.bankTransaction.findMany({
    where: {
      userId: session?.user?.id,
    },
  });
  return txns.map((t: any) => ({
    time: t?.startTime,
    amount: t?.amount,
    status: t?.status,
    provider: t?.provider,
  }));
}

async function getOffRampTransactions() {
  const session = await getServerSession(authOptions);
  const txns = await prisma.bankTransaction.findMany({
    where: {
      userId: session?.user?.id,
    },
  });
  return txns.map((t: any) => ({
    time: t?.startTime,
    amount: t?.amount,
    status: t?.status,
    provider: "SELF",
  }));
}

export default async function () {
  const balance = await getBalance();
  const onRampTransactions = await getOnRampTransactions();

  const combinedTransactions = [...onRampTransactions];

  return (
    <div className="w-screen">
      <div className="text-4xl text-[#6a51a6] pt-8 mb-8 font-bold">
        Transfer
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-4">
        <div>
          <AddMoney />
          <div className="pt-4">
            <WithdrawMoney></WithdrawMoney>
          </div>
        </div>
        <div>
          <BalanceCard amount={balance?.amount} locked={0} />
          <div className="pt-4">
            <RecentTransactions transactions={combinedTransactions} />
          </div>
        </div>
      </div>
    </div>
  );
}
