import type { FunctionComponent } from "react";

import { SparklesIcon, UsersRoundIcon } from "lucide-react";

import type { PersonPage } from "@/lib/content";

import { ContributorAvatar } from "./ContributorAvatar";

type ContributorAvatarSummaryProps = {
  contributors: Array<PersonPage>;
};

export const ContributorAvatarSummary: FunctionComponent<
  ContributorAvatarSummaryProps
> = ({ contributors }) => {
  return (
    <div className="relative w-full max-w-sm">
      <div className="absolute -top-8 right-8 h-24 w-24 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="absolute -bottom-10 left-2 h-28 w-28 rounded-full bg-fuchsia-300/30 blur-3xl" />
      <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-6 text-white shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white/60">
              Project contributors
            </p>
            <p className="mt-1 text-4xl font-bold">{contributors.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-3">
            <UsersRoundIcon className="size-7" />
          </div>
        </div>

        <div className="mt-8 flex -space-x-4">
          {contributors.slice(0, 4).map((person) => (
            <ContributorAvatar
              key={person.url}
              person={person}
              className="size-16"
            />
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/15 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-cyan-100">
            <SparklesIcon className="size-4" />
            Kinetra is powered by our contributors.
          </div>
        </div>
      </div>
    </div>
  );
};
