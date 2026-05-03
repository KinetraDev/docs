import type { FunctionComponent } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/util/cn";
import { computeStringHue } from "@/lib/util/helpers";

const personRoleBadgeVariants = cva(
  "inline-flex items-center rounded-full border font-medium text-fd-foreground",
  {
    variants: {
      size: {
        md: "gap-2 px-2.5 py-1 text-xs",
        sm: "gap-1.5 px-2 py-0.5 text-[0.625rem]",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const personRoleBadgeDotVariants = cva("rounded-full", {
  variants: {
    size: {
      md: "size-1.5",
      sm: "size-1",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export type PersonRoleBadgeProps = {
  label: string;
  className?: string;
} & VariantProps<typeof personRoleBadgeVariants>;

export const PersonRoleBadge: FunctionComponent<PersonRoleBadgeProps> = ({
  label,
  size,
  className,
}) => {
  const hue = computeStringHue(label);

  return (
    <span
      className={cn(personRoleBadgeVariants({ size }), className)}
      style={{
        backgroundColor: `hsl(${hue} 80% 50% / 0.12)`,
        borderColor: `hsl(${hue} 80% 50% / 0.28)`,
      }}
    >
      <span
        className={personRoleBadgeDotVariants({ size })}
        style={{ backgroundColor: `hsl(${hue} 80% 50%)` }}
      />
      {label}
    </span>
  );
};
