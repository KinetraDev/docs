import Image from "next/image";

import type { PersonPage } from "@/lib/content";

import { computeInitials, computeStringHue } from "@/lib/util/helpers";

function contributorMeta(person: PersonPage): {
  initials: string;
  color: string;
} {
  const hue = computeStringHue(person.data.title);
  const color = `hsl(${hue} 80% 50%)`;

  const initials = computeInitials(person.data.title);

  return { initials, color };
}

export function ContributorAvatar({
  person,
  className = "size-24",
}: {
  person: PersonPage;
  className?: string;
}) {
  const { initials, color } = contributorMeta(person);

  if (person.data.picture) {
    return (
      <Image
        className={`${className} rounded-full border-4 border-white/70 object-cover shadow-xl shadow-black/20`}
        src={person.data.picture}
        alt={`${person.data.title} avatar`}
        width={160}
        height={160}
      />
    );
  }

  return (
    <div
      className={`${className} flex items-center justify-center rounded-full border-4 border-white/70 shadow-xl shadow-black/20`}
      style={{ backgroundColor: color }}
    >
      <span className="text-2xl font-bold tracking-wide text-white">
        {initials}
      </span>
    </div>
  );
}
