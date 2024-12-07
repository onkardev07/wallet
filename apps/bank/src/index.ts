import axios from "axios";

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");
const app = express();
const prisma = new PrismaClient();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());

app.options("*", cors());

app.get("/", (req: any, res: any) => {
  res.status(200).json({ msg: "bk server" });
});

app.post("/withdraw", async (req: any, res: any) => {
  const { username, password, token, webhookUrl } = req.body;

  try {
    const bankUser = await prisma.hDFCUser.findFirst({
      where: {
        username: username,
        password: password,
      },
    });

    if (!bankUser || bankUser.password !== password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const trans = await prisma.bankTransaction.findUnique({
      where: {
        token: token,
      },
    });

    if (!trans) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (trans.amount > bankUser.accbal) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const updatedUser = await prisma.hDFCUser.update({
      where: {
        id: bankUser.id,
      },
      data: {
        accbal: {
          decrement: trans.amount,
        },
      },
    });

    try {
      const webhookResponse = await axios.post(webhookUrl, {
        token: token,
        user_identifier: trans.userId,
        amount: trans.amount,
      });

      console.log("Webhook sent successfully", webhookResponse.data);
    } catch (webhookError) {
      console.error("Error sending webhook:", webhookError);
      return res.status(500).json({ message: "Webhook sending failed" });
    }

    res.status(202).json({
      message: "Withdrawal successful, webhook sent",
      remainingBalance: updatedUser.accbal,
    });
  } catch (err) {
    console.error("Error processing withdrawal:", err);
    return res.status(500).json({ message: "Internal server error onkar" });
  }
});

app.post("/deposit", async (req: any, res: any) => {
  const { accno, token, webhookUrl } = req.body;

  try {
    const bankUser = await prisma.hDFCUser.findFirst({
      where: {
        accno: accno,
      },
    });

    if (!bankUser) {
      return res.status(401).json({ message: "Invalid user" });
    }

    const trans = await prisma.bankTransaction.findUnique({
      where: {
        token: token,
      },
    });

    if (!trans) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const updatedUser = await prisma.hDFCUser.update({
      where: {
        id: bankUser.id,
      },
      data: {
        accbal: {
          increment: trans.amount,
        },
      },
    });

    try {
      const webhookResponse = await axios.post(webhookUrl, {
        token: token,
        user_identifier: trans.userId,
        amount: trans.amount,
      });

      console.log("Webhook sent successfully", webhookResponse.data);
    } catch (webhookError) {
      console.error("Error sending webhook:", webhookError);
      return res.status(500).json({ message: "Webhook sending failed" });
    }

    res.status(202).json({
      message: "deposit successful, webhook sent",
      remainingBalance: updatedUser.accbal,
    });
  } catch (err) {
    console.error("Error processing withdrawal:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
