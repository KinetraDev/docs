import type { FunctionComponent } from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { MapPinIcon } from "lucide-react";

import type { PersonPage } from "@/lib/content";

import { PersonRoleBadge } from "./PersonRoleBadge";
import { cn } from "@/lib/util/cn";

const personMetadataVariants = cva("flex flex-wrap items-center gap-2", {
  variants: {
    size: {
      md: "",
      sm: "",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const locationVariants = cva(
  "inline-flex items-center rounded-full border bg-fd-background/60 font-medium text-fd-muted-foreground",
  {
    variants: {
      size: {
        md: "gap-2 px-3 py-1.5 text-xs",
        sm: "gap-1 px-2 py-0.5 text-[0.625rem]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const locationIconVariants = cva("shrink-0", {
  variants: {
    size: {
      md: "size-3.5",
      sm: "size-3",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type PersonMetadataProps = {
  person: PersonPage;
  className?: string;
} & VariantProps<typeof personMetadataVariants>;

export const PersonMetadata: FunctionComponent<PersonMetadataProps> = ({
  person,
  size,
  className,
}) => {
  const { is_maintainer, location, roles } = person.data;

  if (!is_maintainer && !location && (!roles || roles.length === 0)) {
    return null;
  }

  return (
    <div className={cn(personMetadataVariants({ size }), className)}>
      {location && (
        <p className={locationVariants({ size })}>
          <MapPinIcon className={locationIconVariants({ size })} />
          {location}
        </p>
      )}

      {is_maintainer && <PersonRoleBadge label="Maintainer" size={size} />}

      {roles?.map((role) => (
        <PersonRoleBadge key={role} label={role} size={size} />
      ))}
    </div>
  );
};
