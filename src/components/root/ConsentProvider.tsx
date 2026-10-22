import type { FunctionComponent, ReactNode } from "react";

import {
  ConsentBanner,
  ConsentDialog,
  ConsentRoot,
  offline,
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
    <ConsentRoot
      options={{
        mode: offline(),
        colorScheme: resolvedTheme === "dark" ? "dark" : "light",
      }}
    >
      <ConsentBanner />
      <ConsentDialog />
      {children}
    </ConsentRoot>
  );
};
