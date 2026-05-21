import type { Metadata } from "next";
import { noIndexRobots } from "@/lib/seo";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "Giriş Yap | UygulamaPazar.com",
  description: "UygulamaPazar.com premium marketplace giriş ekranı.",
  robots: noIndexRobots
};

export default function LoginPage() {
  return <AuthShell mode="login" />;
}
