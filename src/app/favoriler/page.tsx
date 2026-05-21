import type { Metadata } from "next";
import { noIndexRobots } from "@/lib/seo";
import { FavoritesClient } from "./favorites-client";

export const metadata: Metadata = {
  title: "Favoriler | UygulamaPazar.com",
  description: "UygulamaPazar.com favori ilanlarınız.",
  robots: noIndexRobots
};

export default function FavoritesPage() {
  return <FavoritesClient />;
}
