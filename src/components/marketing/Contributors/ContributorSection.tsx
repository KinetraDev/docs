import type { PersonPage } from "@/lib/content";

import { ContributorCard } from "./ContributorCard";

export function ContributorSection({
  contributors,
  siteName,
}: {
  contributors: Array<PersonPage>;
  siteName: string;
}) {
  return (
    <section className="border-t bg-fd-background px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-fd-muted-foreground">
            Contributors
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Meet the people behind {siteName}
          </h2>
          <p className="mt-4 text-fd-muted-foreground">
            {siteName} grows through documentation, testing, design, and deep
            tinkering from people across the community.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {contributors.map((person) => (
            <ContributorCard key={person.url} person={person} />
          ))}
        </div>
      </div>
    </section>
  );
}
