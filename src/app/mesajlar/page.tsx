import type { Metadata } from "next";
import { noIndexRobots } from "@/lib/seo";
import { Suspense } from "react";
import { MessagesClient } from "./messages-client";

export const metadata: Metadata = {
  title: "Mesajlar | UygulamaPazar.com",
  description: "UygulamaPazar.com marketplace mesajlaşma ekranı.",
  robots: noIndexRobots
};

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesClient />
    </Suspense>
  );
}
