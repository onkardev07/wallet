"use client";

import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { useState } from "react";
import { TextInput } from "@repo/ui/textInput";
import { createOffRampTxn } from "@/lib/actions/createofframptxn";

export const WithdrawMoney = () => {
  const [value, setValue] = useState("");
  const [error, setError] = useState(""); // For error handling
  const [loading, setLoading] = useState(false);

  const handleWithdrawMoney = async () => {
    setLoading(true);
    setError("");
    console.log("withdraw clicked");
    try {
      const response = await createOffRampTxn(Number(value), "SELF");
      console.log("response", response);
      setValue("");
      localStorage.setItem("offRampToken", response.transToken || "");
      window.location.href = "http://localhost:3000/accountdetails";
    } catch (error: any) {
      console.error("Error during withdrawal:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Withdraw Money">
      <div className="w-full">
        <TextInput
          label={"Amount"}
          placeholder={"Amount"}
          onChange={(val) => setValue(val)}
          value={value}
        />

        <Button
          className="w-[150px] bg-[#3779b8] py-[10px] text-[white] rounded-md text-[16px] flex items-center justify-center text-center mt-[20px] mx-auto"
          onClick={handleWithdrawMoney}
        >
          Withdraw Money
        </Button>
        {/* Display Error Message if Any */}
        {error && <p className="text-red-500 text-center mt-5">{error}</p>}
      </div>
    </Card>
  );
};
