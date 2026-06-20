import { getProfile } from "@/app/actions/settings";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const profile = await getProfile();
  return <SettingsClient profile={profile} />;
}
