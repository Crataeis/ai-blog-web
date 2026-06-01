import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold">Admin login</h1>
      <Suspense fallback={<div className="mt-6 rounded-md border border-line bg-white p-5">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
