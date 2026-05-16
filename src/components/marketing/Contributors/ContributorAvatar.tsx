import Image from "next/image";
import type { FunctionComponent } from "react";

import type { PersonPage } from "@/lib/content";

import { computeInitials, computeStringHue } from "@/lib/util/helpers";
import { cn } from "@/lib/util/cn";

function contributorMeta(person: PersonPage): {
  initials: string;
  color: string;
} {
  const hue = computeStringHue(person.data.title);
  const color = `hsl(${hue} 80% 50%)`;

  const initials = computeInitials(person.data.title);

  return { initials, color };
}

type ContributorAvatarProps = {
  person: PersonPage;
  className?: string;
};

export const ContributorAvatar: FunctionComponent<ContributorAvatarProps> = ({
  person,
  className = "size-24",
}) => {
  const { picture, title } = person.data;
  const { initials, color } = contributorMeta(person);

  if (picture) {
    return (
      <Image
        className={cn(
          "rounded-full border-4 border-white/70 object-cover shadow-md shadow-black/15",
          className,
        )}
        src={picture}
        alt={`${title} avatar`}
        width={160}
        height={160}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full border-4 border-white/70 shadow-md shadow-black/15",
        className,
      )}
      style={{ backgroundColor: color }}
    >
      <span className="text-2xl font-bold tracking-wide text-white">
        {initials}
      </span>
    </div>
  );
};
