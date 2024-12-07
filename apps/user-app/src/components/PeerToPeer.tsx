"use client";
import { p2pTransfer } from "@/lib/actions/p2ptransfer";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { TextInput } from "@repo/ui/textInput";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export function SendCard() {
  const [number, setNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState(""); // For error handling
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleP2PTransfer = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await p2pTransfer(number, Number(amount));
      toast.success("Payment successful!");
      router.push("/transfer");
      console.log("Response:", response);
    } catch (err) {
      toast.error("Payment failed. Please try again.");
      setError("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="">
      <Card title="Send">
        <div className=" pt-2">
          <TextInput
            placeholder={"Number"}
            label="Number"
            onChange={(value) => {
              setNumber(value);
            }}
            value={number}
          />
          <TextInput
            placeholder={"Amount"}
            label="Amount"
            onChange={(value) => {
              setAmount(value);
            }}
            value={amount}
          />
          <div className="pt-4 flex justify-center">
            <Button
              onClick={handleP2PTransfer}
              className=" py-[10px] w-[150px] bg-[#3779b8] py-[10px] text-[white] rounded-md text-[16px]"
            >
              Send
            </Button>
          </div>
          {error && <p className="text-red-500 text-center mt-5">{error}</p>}
        </div>
      </Card>
    </div>
  );
}
