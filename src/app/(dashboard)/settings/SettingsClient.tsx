"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User, Lock, Wallet, LogOut } from "lucide-react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateProfile, updatePassword } from "@/app/actions/settings";
import { signOut } from "@/app/actions/auth";

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="ghost" disabled={pending}>
      {pending ? "Menyimpan..." : text}
    </Button>
  );
}

export default function SettingsClient({ profile }: { profile: any }) {
  const [profileState, profileAction] = useActionState(updateProfile, null);
  const [passwordState, passwordAction] = useActionState(updatePassword, null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[32px] leading-[1.16] tracking-[-0.96px] font-semibold">Pengaturan</h1>
        <p className="text-steel text-[16px] mt-1">Kelola profil dan preferensi akun Anda</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-electric-blue" />
            Profil
          </CardTitle>
          <p className="text-[14px] text-steel">Informasi dasar akun Anda</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-parchment border border-sand text-ink-black flex items-center justify-center font-bold text-2xl uppercase">
              {profile?.name ? profile.name.charAt(0) : "?"}
            </div>
            <div>
              <p className="font-semibold text-lg">{profile?.name || "User"}</p>
              <p className="text-[14px] text-steel">{profile?.email}</p>
            </div>
          </div>

          <form action={profileAction} className="space-y-6 pt-6 border-t border-sand">
            {profileState?.error && (
              <div className="p-4 rounded-[12.8px] bg-ember-orange/10 border border-ember-orange/20 text-ember-orange text-[14px]">
                {profileState.error}
              </div>
            )}
            {profileState?.success && (
              <div className="p-4 rounded-[12.8px] bg-electric-blue/10 border border-electric-blue/20 text-electric-blue text-[14px]">
                Profil berhasil diperbarui.
              </div>
            )}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-ink-black text-[14px]">Nama</Label>
                <Input id="name" name="name" defaultValue={profile?.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-ink-black text-[14px]">Email</Label>
                <Input id="email" type="email" defaultValue={profile?.email} disabled className="bg-parchment" />
              </div>
            </div>
            <SubmitButton text="Simpan Profil" />
          </form>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-electric-blue" />
            Password
          </CardTitle>
          <p className="text-[14px] text-steel">Update password Anda secara berkala</p>
        </CardHeader>
        <CardContent>
          <form action={passwordAction} className="space-y-6">
            {passwordState?.error && (
              <div className="p-4 rounded-[12.8px] bg-ember-orange/10 border border-ember-orange/20 text-ember-orange text-[14px]">
                {passwordState.error}
              </div>
            )}
            {passwordState?.success && (
              <div className="p-4 rounded-[12.8px] bg-electric-blue/10 border border-electric-blue/20 text-electric-blue text-[14px]">
                Password berhasil diperbarui.
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-ink-black text-[14px]">Password Saat Ini</Label>
              <Input id="currentPassword" name="currentPassword" type="password" placeholder="••••••••" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-ink-black text-[14px]">Password Baru</Label>
              <Input id="newPassword" name="newPassword" type="password" placeholder="••••••••" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-ink-black text-[14px]">Konfirmasi Password Baru</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" required />
            </div>
            <SubmitButton text="Update Password" />
          </form>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card className="border-ember-orange bg-ember-orange/5">
        <CardHeader>
          <CardTitle className="text-ember-orange">Keluar Akun</CardTitle>
          <p className="text-[14px] text-ink-black/70">
            Logout dari sesi ini. Anda perlu login kembali untuk mengakses akun.
          </p>
        </CardHeader>
        <CardContent>
          <form action={signOut}>
            <Button type="submit" variant="destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
