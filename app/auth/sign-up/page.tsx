import { Suspense } from "react";
import { SignUpForm } from "@/components/sign-up-form";

function SignUpFormFallback() {
  return (
    <div className="w-full space-y-4 animate-pulse">
      <div className="h-6 w-36 bg-white/[0.05] rounded" />
      <div className="h-9 w-48 bg-white/[0.07] rounded" />
      <div className="h-11 w-full bg-white/[0.03] rounded-lg mt-6" />
      <div className="h-11 w-full bg-white/[0.03] rounded-lg" />
      <div className="h-11 w-full bg-white/[0.03] rounded-lg" />
      <div className="h-11 w-full bg-white/[0.08] rounded-lg mt-6" />
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<SignUpFormFallback />}>
      <SignUpForm />
    </Suspense>
  );
}
