import { OPersonRole, peopleSource, personHasRole } from "@/lib/content";
import { SITE_NAME } from "@/config";

import { ContributorAvatarSummary } from "@/components/marketing/Contributors/ContributorAvatarSummary";
import { ContributorSection } from "@/components/marketing/Contributors/ContributorSection";
import { Hero } from "@/components/marketing/Hero";
import { metadataGenerator } from "@/lib/util/metadata";

const CONTRIBUTORS_SORTED = peopleSource.getPages().sort((a, b) => {
  const maintainerSort =
    Number(personHasRole(b, OPersonRole.MAINTAINER)) -
    Number(personHasRole(a, OPersonRole.MAINTAINER));
  if (maintainerSort !== 0) return maintainerSort;
  return a.data.title.localeCompare(b.data.title);
});

export default function AboutPage() {
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
          <ContributorAvatarSummary contributors={CONTRIBUTORS_SORTED} />
        </Hero>
      </section>

      <ContributorSection
        contributors={CONTRIBUTORS_SORTED}
        siteName={SITE_NAME}
      />
    </main>
  );
}

export const generateMetadata = metadataGenerator({
  title: { absolute: `About ${SITE_NAME}` },
  description: `${SITE_NAME} is a motion control platform that allows you to control like you never have before.`,
});
