import type { Metadata } from "next";
import { noIndexRobots } from "@/lib/seo";
import { NotificationsClient } from "./notifications-client";

export const metadata: Metadata = {
  title: "Bildirimler | UygulamaPazar.com",
  description: "UygulamaPazar.com bildirim merkezi.",
  robots: noIndexRobots
};

export default function NotificationsPage() {
  return <NotificationsClient />;
}
