"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import Image from "next/image";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { FormProvider, useForm } from "react-hook-form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { signinSchema } from "@/zod-schemas/Signin"; // Your Zod schema
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

interface SignInResponse {
  status?: string;
  id?: number;
  error?: string;
  ok?: boolean;
}

const SignIn = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const formMethods = useForm<z.infer<typeof signinSchema>>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof signinSchema>) {
    try {
      setLoading(true);
      const result = (await signIn("credentials", {
        username: values.username,
        password: values.password,
        redirect: false,
      })) as unknown as SignInResponse;

      console.log("res" + JSON.stringify(result));

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.replace("/home");
      }
    } catch (error) {
      console.error("Sign-in Error:", error);
      alert("An error occurred during sign-in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full max-w-sm p-6 space-y-3 bg-white rounded-lg shadow-md">
        <div className="flex justify-center">
          <Avatar>
            <AvatarImage asChild src="/Payment.png">
              <Image src="/Payment.png" alt="logo" width={40} height={40} />
            </AvatarImage>
            <AvatarFallback>N</AvatarFallback>
          </Avatar>
        </div>

        <div className="text-[20px] font-bold text-center text-[#768ea7]">
          Log In to Paytm
        </div>

        {/* Form Section */}
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
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </div>
          </form>
        </FormProvider>

        <div className="text-center font-sans text-[14px]">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-500 underline">
            Signup Now
          </Link>
        </div>

        {error && <p className="text-red-500 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default SignIn;
