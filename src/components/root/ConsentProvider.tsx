import type { FunctionComponent, ReactNode } from "react";

import {
  ConsentBanner,
  ConsentDialog,
  ConsentManagerProvider,
} from "@c15t/nextjs";
import { useTheme } from "next-themes";

export const ConsentProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const { resolvedTheme } = useTheme();

  return children;

  // biome-ignore lint/correctness/noUnreachable: not yet used
  return (
    <ConsentManagerProvider
      options={{
        mode: "offline",
        colorScheme: resolvedTheme === "dark" ? "dark" : "light",
        // add scripts here when needed
      }}
    >
      <ConsentBanner />
      <ConsentDialog />
      {children}
    </ConsentManagerProvider>
  );
};
