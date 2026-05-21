import type { Metadata } from "next";
import { noIndexRobots } from "@/lib/seo";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Kayıt Ol | UygulamaPazar.com",
  description: "UygulamaPazar.com premium marketplace kayıt ekranı.",
  robots: noIndexRobots
};

export default function RegisterPage() {
  return <AuthShell mode="register" />;
}
