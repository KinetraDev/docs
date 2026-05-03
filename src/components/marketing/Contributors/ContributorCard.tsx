import type { FunctionComponent } from "react";

import type { PersonPage } from "@/lib/content";

import { ContributorAvatar } from "./ContributorAvatar";
import { ContributorSocials } from "./ContributorSocials";
import { PersonMetadata } from "@/components/shared/PersonMetadata";

type ContributorCardProps = {
  person: PersonPage;
};

export const ContributorCard: FunctionComponent<ContributorCardProps> = ({
  person,
}) => {
  return (
    <article className="group overflow-hidden rounded-3xl border bg-fd-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className="bg-linear-to-r from-violet-500/15 via-fuchsia-500/15 to-cyan-500/15 px-6 pt-6 pb-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <ContributorAvatar person={person} className="size-20" />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-2xl font-semibold leading-tight">
                  {person.data.title}
                </h3>
                {person.data.nickname && (
                  <p className="mt-1.5 text-sm font-medium text-fd-muted-foreground">
                    Also known as {person.data.nickname}
                  </p>
                )}
              </div>
              <ContributorSocials person={person} />
            </div>

            <PersonMetadata className="mt-3" person={person} />
          </div>
        </div>
      </div>

      {person.data.description && (
        <div className="px-6 pt-5 pb-6">
          <p className="text-sm leading-6 whitespace-pre-line text-fd-muted-foreground">
            {person.data.description}
          </p>
        </div>
      )}
    </article>
  );
};
