import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-10">
      <SignUp forceRedirectUrl="/dashboard" signInUrl="/sign-in" />
    </div>
  );
}
