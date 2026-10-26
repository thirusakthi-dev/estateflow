import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import { FollowUpsContent } from "@/features/follow-ups/ui/follow-ups-content";

export const metadata: Metadata = createMetadata({
  title: "Follow-ups",
  description: "Track and manage real estate lead follow-ups.",
  path: "/follow-ups",
  noIndex: true,
});

export default function FollowUpsPage() {
  return <FollowUpsContent />;
}
