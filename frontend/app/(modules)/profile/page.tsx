import type { Metadata } from "next";
import { createMetadata } from "@/lib/metadata";
import { ProfileContent } from "@/features/profile/ui/profile-content";

export const metadata: Metadata = createMetadata({
  title: "My Profile",
  description: "View and manage your EstateFlow profile.",
  path: "/profile",
  noIndex: true,
});

export default function ProfilePage() {
  return <ProfileContent />;
}
