import type { Metadata } from "next";
import { GatewaySection } from "@/app/components/sections/gateway-section";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/",
    locale,
    title: dictionary.metadata.homeTitle,
    description: dictionary.metadata.homeDescription,
  });
}

export default async function Home() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  return <GatewaySection copy={dictionary.homeGateway} />;
}
