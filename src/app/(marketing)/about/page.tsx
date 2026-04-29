import { peopleSource } from "@/lib/content";
import { SITE_NAME } from "@/config";

import { ContributorAvatarSummary } from "@/components/marketing/Contributors/ContributorAvatarSummary";
import { ContributorSection } from "@/components/marketing/Contributors/ContributorSection";
import { Hero } from "@/components/marketing/Hero";
import { metadataGenerator } from "@/lib/util/metadata";

export default function AboutPage() {
  const contributors = peopleSource
    .getPages()
    .sort((a, b) => a.data.title.localeCompare(b.data.title));

  return (
    <main className="flex flex-col">
      <section className="min-h-section flex">
        <Hero
          titleLine1="About"
          titleLine2={SITE_NAME}
          description={`${SITE_NAME} is a motion control platform shaped by builders who care about approachable, precise motion control.`}
          mainButtonText="Get started"
          mainButtonHref="/docs/lib"
          altButtonText="I came here for 3D printing"
          altButtonHref="/docs/printer"
          background={{ from: "#fc6ff7", to: "#fc6ff7" }}
          className="flex-1"
        >
          <ContributorAvatarSummary contributors={contributors} />
        </Hero>
      </section>

      <ContributorSection contributors={contributors} siteName={SITE_NAME} />
    </main>
  );
}

export const generateMetadata = metadataGenerator({
  title: { absolute: `About ${SITE_NAME}` },
  description: `${SITE_NAME} is a motion control platform that allows you to control like you never have before.`,
});
