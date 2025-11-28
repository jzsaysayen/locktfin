"use client";

import { SignIn } from "@stackframe/stack";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        {error === 'unauthorized' && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm font-medium">
              Access denied. Only authorized accounts can log in.
            </p>
          </div>
        )}
        <SignIn />
        <Link href="/" className="block text-center mt-4 text-blue-600 hover:underline">
          Go Back To Landing Page
        </Link>
      </div>
    </div>
  );
}