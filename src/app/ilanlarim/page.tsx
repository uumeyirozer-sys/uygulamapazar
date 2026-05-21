import type { Metadata } from "next";
import { noIndexRobots } from "@/lib/seo";
import { MyListingsClient } from "./my-listings-client";

export const metadata: Metadata = {
  title: "İlanlarım | UygulamaPazar.com",
  description: "UygulamaPazar.com ilan yönetimi.",
  robots: noIndexRobots
};

export default function MyListingsPage() {
  return <MyListingsClient />;
}
