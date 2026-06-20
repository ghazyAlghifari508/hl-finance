import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Root route.
 *
 * Sesuai SOT (techstack.md: "page.tsx # Landing/login redirect") dan AC-1.1/AC-1.3:
 * aplikasi mewajibkan login sebelum fitur dapat diakses, dan user yang valid
 * "lands on the home/dashboard". Tidak ada marketing/landing page di acceptance criteria.
 *
 * Maka `/` hanya meneruskan: ke /dashboard jika sudah login, ke /login jika belum.
 */
export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  redirect("/login");
}
