import { HomeLayout } from "fumadocs-ui/layouts/home";

import { DOCS_GITHUB_OWNER, SITE_NAME } from "@/config";
import { linkItems } from "@/config.layout";

import { Footer } from "@/components/marketing/Footer";
import { LogoText } from "@/components/shared/Logo";
import { metadataGenerator } from "@/lib/util/metadata";

export default function Layout({ children }: LayoutProps<"/">) {
  return (
    <HomeLayout
      nav={{ title: <LogoText /> }}
      githubUrl={`https://github.com/${DOCS_GITHUB_OWNER}`}
      links={[...linkItems]}
    >
      {children}

      <Footer />
    </HomeLayout>
  );
}

export const generateMetadata = metadataGenerator({
  title: {
    template: `%s | ${SITE_NAME}`,
    default: `${SITE_NAME}`,
  },
  description: `${SITE_NAME} is a motion control ecosystem for the robotics of tomorrow.`,
});
