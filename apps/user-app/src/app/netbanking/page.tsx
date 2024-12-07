"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import Image from "next/image";
import { FormProvider, useForm } from "react-hook-form";
import { signinSchema } from "@/zod-schemas/Signin";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const LogIn = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const formMethods = useForm<z.infer<typeof signinSchema>>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof signinSchema>) => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:5001/withdraw", {
        token: localStorage.getItem("transToken"),
        webhookUrl: "http://localhost:5000/hdfcwebhook",
        username: values.username,
        password: values.password,
      });

      localStorage.clear();

      // Display success toast
      toast.success("Payment successful!");

      // Redirect to transfer page
      router.push("/transfer");

      console.log("Payment success:", response.data);
    } catch (err) {
      console.error("Error during payment:", err);
      setError("Payment failed. Please try again.");
      toast.error("Payment failed. Please try again."); // Display error toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full max-w-sm p-6 space-y-3 bg-white rounded-lg shadow-md">
        <div className="flex justify-center">
          <Avatar>
            <AvatarImage asChild>
              <Image src="/Payment.png" alt="logo" width={40} height={40} />
            </AvatarImage>
            <AvatarFallback>N</AvatarFallback>
          </Avatar>
        </div>

        <div className="text-[20px] font-bold text-center text-[#768ea7]">
          Login to Net Banking
        </div>

        <FormProvider {...formMethods}>
          <form
            onSubmit={formMethods.handleSubmit(onSubmit)}
            className="space-y-2"
          >
            <FormField
              control={formMethods.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={formMethods.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex pt-[10px] justify-center">
              <Button type="submit" disabled={loading}>
                {loading ? "Payment Processing..." : "Pay Now"}
              </Button>
            </div>
          </form>
        </FormProvider>

        {error && <p className="text-red-500 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default LogIn;
