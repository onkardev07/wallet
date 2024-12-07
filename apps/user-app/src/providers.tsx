"use client";
import { RecoilRoot } from "recoil";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <RecoilRoot>
      <SessionProvider>
        <Toaster position="top-center" /> {children}
      </SessionProvider>
    </RecoilRoot>
  );
};
