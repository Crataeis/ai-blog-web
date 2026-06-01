"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false
    });
    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push(searchParams.get("callbackUrl") ?? "/admin");
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-md border border-line bg-white p-5">
      <input className="w-full rounded-md border border-line px-3 py-2" name="email" type="email" placeholder="Email" required />
      <input className="w-full rounded-md border border-line px-3 py-2" name="password" type="password" placeholder="Password" required />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <button className="w-full rounded-md bg-ink px-4 py-2 font-semibold text-paper">Sign in</button>
    </form>
  );
}
