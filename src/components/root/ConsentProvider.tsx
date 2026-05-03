import type { FunctionComponent, ReactNode } from "react";

import {
  ConsentBanner,
  ConsentDialog,
  ConsentManagerProvider,
} from "@c15t/nextjs";
import { useTheme } from "next-themes";

type ConsentProviderProps = {
  children: ReactNode;
};

export const ConsentProvider: FunctionComponent<ConsentProviderProps> = ({
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
