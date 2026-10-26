import type { Metadata } from "next";

const siteName = "EstateFlow";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

type MetadataOptions = {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
};

export function createMetadata({
  title,
  description,
  path,
  noIndex = false,
}: MetadataOptions): Metadata {
  const canonicalUrl =
    siteUrl && path ? new URL(path, siteUrl).toString() : undefined;

  return {
    title: {
      absolute: `${title} | ${siteName}`,
    },
    description,
    ...(canonicalUrl && {
      alternates: { canonical: canonicalUrl },
    }),
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
    openGraph: {
      title,
      description,
      siteName,
      type: "website",
      ...(canonicalUrl && { url: canonicalUrl }),
    },
  };
}
