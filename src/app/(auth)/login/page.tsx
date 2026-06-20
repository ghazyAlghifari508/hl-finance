"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionState } from "react";
import { signIn } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, formAction] = useActionState(signIn, null);

  return (
    <div className="rounded-[24px] border border-sand bg-paper-white p-8">
      {state?.error && (
        <div className="mb-4 p-4 rounded-[12.8px] bg-ember-orange/10 border border-ember-orange/20 text-ember-orange text-[14px]">
          {state.error}
        </div>
      )}
      <form action={formAction} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-ink-black text-[14px]">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="nama@email.com"
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-ink-black text-[14px]">Password</Label>
            <Link href="#" className="text-[14px] text-electric-blue hover:underline">
              Lupa password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>
        <Button type="submit" variant="primary" className="w-full mt-2">
          Sign In
        </Button>
      </form>
    </div>
  );
}
