import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@repo/db/client";

// Transaction interface
interface User {
  username: string | null;
}

export const enum TransactionType {
  Credit = "credit",
  Debit = "debit",
}

// type Transaction = P2PTransaction | OnRampTransaction;

async function getP2PTransactions() {
  const session = await getServerSession(authOptions);

  const fromTxns: P2PTransaction[] = await prisma.pPTransfer.findMany({
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

  const toTxns: P2PTransaction[] = await prisma.pPTransfer.findMany({
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

  const txns: P2PTransaction[] = [...fromTxns, ...toTxns];
  console.log("Transactions", txns);

  return txns.map((t) => {
    if (t.fromUserId === session?.user?.id) {
      return {
        amount: t?.amount,
        time: t?.timestamp,
        id: t.id,
        provider: t?.toUser?.username || "Unknown",
        status: t?.status,
        type: TransactionType.Debit,
      };
    } else {
      return {
        amount: t?.amount,
        id: t.id,
        time: t?.timestamp,
        status: t?.status,
        provider: t?.fromUser?.username || "Unknown",
        type: TransactionType.Credit,
      };
    }
  });
}

async function getBankTransactions() {
  const session = await getServerSession(authOptions);
  const txns: OnRampTransaction[] = await prisma.bankTransaction.findMany({
    where: {
      userId: session?.user?.id,
    },
  });
  return txns.map((t) => ({
    id: t.id,
    token: t.token,
    time: t?.startTime,
    amount: t?.amount,
    status: t?.status,
    provider: t?.provider,
    type:
      t.provider === "SELF" ? TransactionType.Debit : TransactionType.Credit,
  }));
}

interface P2PTransaction {
  fromUserId: string;
  toUserId: string;
  id: string;
  amount: number;
  status: string;
  timestamp: Date;
  toUser?: User;
  fromUser?: User;
}

interface OnRampTransaction {
  id: string;
  token: string;
  startTime: Date;
  amount: number;
  status: string;
  provider: string;
}

interface TotalTrans {
  id: string;
  token?: string;
  provider: string;
  time: Date;
  amount: number;
  status: string;
  type: TransactionType;
}

export default async function TransactionList() {
  const P2PTransactions = await getP2PTransactions();
  const bankTransactions = await getBankTransactions();
  const transactions: TotalTrans[] = [...P2PTransactions, ...bankTransactions];

  return (
    <div className="">
      <Table className="">
        <TableHeader>
          <TableRow>
            <TableHead>Id</TableHead>
            <TableHead>Provider</TableHead>
            <TableHead>Ref</TableHead>
            <TableHead>Timestamp</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Deposit Amt</TableHead>
            <TableHead>Withdraw Amt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((txn, idx) => (
            <TableRow key={idx}>
              <TableCell>{txn.id}</TableCell>
              <TableCell>{txn.provider || ""}</TableCell>
              <TableCell>{txn.token || ""}</TableCell>
              <TableCell>{txn.time.toISOString()}</TableCell>
              <TableCell>{txn.status}</TableCell>
              <TableCell>
                {txn.type == TransactionType.Credit ? txn.amount : ""}
              </TableCell>
              <TableCell>
                {txn.type == TransactionType.Debit ? txn.amount : ""}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
