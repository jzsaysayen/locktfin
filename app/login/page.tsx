import { SignIn } from "@stackframe/stack";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>
        <SignIn />
        <Link href="/" className="">Go Back To Landing Page</Link>
      </div>
    </div>
  );
}