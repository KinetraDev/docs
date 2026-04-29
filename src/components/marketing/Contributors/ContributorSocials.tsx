import type { Route } from "next";

import { GlobeIcon } from "lucide-react";

import type { PersonPage } from "@/lib/content";

import {
  GitHubIcon,
  InstagramIcon,
  YouTubeIcon,
} from "@/components/shared/icons";
import { SafeLink } from "@/components/shared/SafeLink";

export function ContributorSocials({ person }: { person: PersonPage }) {
  const { socials } = person.data;

  if (!socials || Object.values(socials).filter(Boolean).length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 text-fd-muted-foreground">
      {socials.website && (
        <SafeLink
          href={socials.website as Route}
          forceExternal
          disableIcon
          aria-label={`${person.data.title}'s website`}
          className="transition-colors hover:text-fd-foreground"
        >
          <GlobeIcon className="size-4" />
        </SafeLink>
      )}
      {socials.github && (
        <SafeLink
          href={socials.github as Route}
          forceExternal
          disableIcon
          aria-label={`${person.data.title}'s GitHub profile`}
          className="transition-colors hover:text-fd-foreground"
        >
          <GitHubIcon className="size-4" />
        </SafeLink>
      )}
      {socials.instagram && (
        <SafeLink
          href={socials.instagram as Route}
          forceExternal
          disableIcon
          aria-label={`${person.data.title}'s Instagram profile`}
          className="transition-colors hover:text-fd-foreground"
        >
          <InstagramIcon className="size-4" />
        </SafeLink>
      )}
      {socials.youtube && (
        <SafeLink
          href={socials.youtube as Route}
          forceExternal
          disableIcon
          aria-label={`${person.data.title}'s YouTube channel`}
          className="transition-colors hover:text-fd-foreground"
        >
          <YouTubeIcon className="size-4" />
        </SafeLink>
      )}
    </div>
  );
}
