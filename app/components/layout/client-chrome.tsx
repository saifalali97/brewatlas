"use client";

import dynamic from "next/dynamic";

export const ClientPageLoader = dynamic(
  () => import("@/app/components/layout/page-loader").then((mod) => mod.PageLoader),
  { ssr: false },
);

export const ClientFloatingActions = dynamic(
  () => import("@/app/components/layout/floating-actions").then((mod) => mod.FloatingActions),
  { ssr: false },
);

export { ClientFloatingActions as FloatingActions };

export const MobileBottomNav = dynamic(
  () => import("@/app/components/layout/mobile-bottom-nav").then((mod) => mod.MobileBottomNav),
  { ssr: false },
);
