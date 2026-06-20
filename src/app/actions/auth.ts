"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// === Schemas ===

const loginSchema = z.object({
  email: z.string().email({ message: "Email tidak valid" }),
  password: z.string().min(1, { message: "Password tidak boleh kosong" }),
});

// === State ===

export type AuthState = { error: string } | null;

// === Actions ===

export async function signIn(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = (formData.get("email") as string).trim().toLowerCase();
  const password = formData.get("password") as string;

  const result = loginSchema.safeParse({ email, password });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/login");
}
