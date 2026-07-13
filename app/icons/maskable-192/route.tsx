import { createAppIconResponse } from "@/lib/pwa/app-icon-image";

export const contentType = "image/png";
export const dynamic = "force-static";

export function GET() {
  return createAppIconResponse(192, "maskable");
}
