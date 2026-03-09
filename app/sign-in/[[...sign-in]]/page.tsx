import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-10">
      <SignIn forceRedirectUrl="/dashboard" signUpUrl="/sign-up" />
    </div>
  );
}
