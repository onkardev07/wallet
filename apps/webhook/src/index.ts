const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");
const app = express();
const prisma = new PrismaClient();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5001"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

app.options("*", cors());

app.post("/hdfcwebhook", async (req: any, res: any) => {
  const paymentInfo = {
    token: req.body.token,
    userId: req.body.user_identifier,
    amount: Number(req.body.amount),
  };

  try {
    const balanceBeforeUpdate = await prisma.balance.findUnique({
      where: {
        userId: paymentInfo.userId,
      },
    });
    console.log("Balance before update:", balanceBeforeUpdate);

    const transactionResults = await prisma.$transaction([
      prisma.balance.updateMany({
        where: {
          userId: paymentInfo.userId,
        },
        data: {
          amount: {
            increment: paymentInfo.amount,
          },
        },
      }),
      prisma.bankTransaction.updateMany({
        where: {
          token: paymentInfo.token,
        },
        data: {
          status: "Success",
        },
      }),
    ]);

    console.log("Transaction result:", transactionResults);
    res.json({
      message: "Captured",
    });
  } catch (err) {
    console.error("Error processing webhook:", err);
    res.status(500).json({
      message: "Error while processing webhook",
    });
  }
});

app.post("/hdfcwebhookofframp", async (req: any, res: any) => {
  const paymentInfo = {
    token: req.body.token,
    userId: req.body.user_identifier,
    amount: req.body.amount,
  };

  try {
    const balanceBeforeUpdate = await prisma.balance.findUnique({
      where: {
        userId: paymentInfo.userId,
      },
    });
    console.log("Balance before update:", balanceBeforeUpdate);

    // Perform transaction
    const transactionResults = await prisma.$transaction([
      prisma.balance.updateMany({
        where: {
          userId: paymentInfo.userId,
        },
        data: {
          amount: {
            decrement: paymentInfo.amount,
          },
        },
      }),
      prisma.bankTransaction.updateMany({
        where: {
          token: paymentInfo.token,
        },
        data: {
          status: "Success",
        },
      }),
    ]);

    res.json({
      message: "Captured",
    });
  } catch (err) {
    console.error("Error processing webhook:", err);
    res.status(500).json({
      message: "Error while processing webhook",
    });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
