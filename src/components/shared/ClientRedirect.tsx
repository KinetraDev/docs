"use client";

import { type FunctionComponent, useEffect } from "react";

type ClientRedirectProps = {
  href: string;
};

export const ClientRedirect: FunctionComponent<ClientRedirectProps> = ({
  href,
}) => {
  useEffect(() => {
    globalThis.location.href = href;
  }, [href]);
  return null;
};
