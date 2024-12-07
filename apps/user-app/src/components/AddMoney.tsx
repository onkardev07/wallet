"use client";

import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import { Select } from "@repo/ui/select";
import { useState } from "react";
import { TextInput } from "@repo/ui/textInput";
import { createOnRampTxn } from "@/lib/actions/createonramptxn";

const SUPPORTED_BANKS = [
  { name: "HDFC Bank", redirectUrl: "https://netbanking.hdfcbank.com" },
  { name: "Axis Bank", redirectUrl: "https://www.axisbank.com/" },
];

export const AddMoney = () => {
  const [value, setValue] = useState("");
  const [provider, setProvider] = useState(SUPPORTED_BANKS[0]?.name || "");

  const handleAddMoney = async () => {
    const response = await createOnRampTxn(Number(value), provider);
    if (response?.message === "Done") {
      setValue("");
    }
    // console.log("onRampToken" + response.transToken);
    localStorage.setItem("transToken", response.transToken || "");
    window.location.href = "http://localhost:3000/netbanking";
  };

  return (
    <Card title="Add Money">
      <div className="w-full">
        <TextInput
          label={"Amount"}
          placeholder={"Amount"}
          onChange={(val) => setValue(val)}
          value={value}
        />

        <div className="py-2 text-left">Bank</div>
        <Select
          onSelect={(value) => {
            setProvider(
              SUPPORTED_BANKS.find((x) => x.name === value)?.name || ""
            );
          }}
          options={SUPPORTED_BANKS.map((x) => ({
            key: x.name,
            value: x.name,
          }))}
        />

        <Button
          className="w-[150px] bg-[#3779b8] py-[10px] text-[white] rounded-md text-[16px] flex items-center justify-center text-center mt-[20px] mx-auto"
          onClick={handleAddMoney}
        >
          Add Money
        </Button>
      </div>
    </Card>
  );
};
