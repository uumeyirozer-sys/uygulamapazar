import type { Metadata } from "next";
import { noIndexRobots } from "@/lib/seo";
import { ProfileEditClient } from "./profile-edit-client";

export const metadata: Metadata = {
  title: "Profili Düzenle | UygulamaPazar.com",
  description: "UygulamaPazar.com profil düzenleme ekranı.",
  robots: noIndexRobots
};

export default function ProfileEditPage() {
  return <ProfileEditClient />;
}
