import type { Metadata } from "next";
import { noIndexRobots } from "@/lib/seo";
import { ListingEditClient } from "./listing-edit-client";

type ListingEditPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: "İlanı Düzenle | UygulamaPazar.com",
  description: "UygulamaPazar.com ilan düzenleme ekranı.",
  robots: noIndexRobots
};

export default async function ListingEditPage({ params }: ListingEditPageProps) {
  const { id } = await params;

  return <ListingEditClient listingId={id} />;
}
