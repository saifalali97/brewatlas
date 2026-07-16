import type { ReactNode } from "react";

/** Account area shell — consistent limestone canvas for all account pages. */
export default function AccountLayout({ children }: { children: ReactNode }) {
  return <div className="relative bg-ac-limestone">{children}</div>;
}
