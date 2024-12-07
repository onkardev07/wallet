import { Peer2PeerTransactions } from "@/components/Peer2PeerTransaction";
import { SendCard } from "@/components/PeerToPeer";
import { authOptions } from "@/lib/auth";
import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { TransactionType } from "@/types/type";

// Transaction interface
interface User {
  username: string | null;
}

interface Transaction {
  fromUserId: string;
  toUserId: string;
  amount: number;
  status: string;
  timestamp: Date;
  toUser?: User;
  fromUser?: User;
}

// enum TransactionType {
//   Credit = "credit",
//   Debit = "debit",
// }

async function getP2PTransactions() {
  const session = await getServerSession(authOptions);

  const fromTxns: Transaction[] = await prisma.pPTransfer.findMany({
    where: {
      fromUserId: session?.user?.id,
    },
    include: {
      toUser: {
        select: {
          username: true,
        },
      },
    },
  });

  const toTxns: Transaction[] = await prisma.pPTransfer.findMany({
    where: {
      toUserId: session?.user?.id,
    },
    include: {
      fromUser: {
        select: {
          username: true,
        },
      },
    },
  });

  const txns: Transaction[] = [...fromTxns, ...toTxns];
  console.log("Transactions", txns);

  return txns.map((t) => {
    if (t.fromUserId === session?.user?.id) {
      return {
        amount: t?.amount,
        time: t?.timestamp,
        name: t?.toUser?.username || "Unknown",
        status: t?.status,
        type: TransactionType.Debit,
      };
    } else {
      return {
        amount: t?.amount,
        time: t?.timestamp,
        status: t?.status,
        name: t?.fromUser?.username || "Unknown",
        type: TransactionType.Credit,
      };
    }
  });
}

export default async function Peer2PeerPage() {
  const transactions = await getP2PTransactions();
  return (
    <div className="w-screen">
      <div className="text-4xl text-[#6a51a6] pt-8 mb-8 font-bold">
        Peer To Peer Transfer
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-4">
        <div>
          <SendCard />
        </div>
        <div>
          <Peer2PeerTransactions transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
