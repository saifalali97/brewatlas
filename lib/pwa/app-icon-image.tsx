import { ImageResponse } from "next/og";

/**
 * Shared renderer for the PWA install icons served from the route
 * handlers under `app/icons/` (PWA requirement 2: app icons + maskable
 * icons). Reuses the exact brand mark from `public/icon.svg` --
 * dark (`#0a0705`) background, amber (`#fbbf24`) "B" glyph -- so every
 * icon size/purpose stays pixel-consistent with the existing favicon.
 *
 * Maskable icons render the glyph smaller and centered, leaving room
 * inside the W3C-recommended ~80% "safe zone" so Android/Chrome can
 * crop the icon into a circle or squircle without clipping it.
 */
export function createAppIconResponse(size: number, purpose: "any" | "maskable") {
  const glyphSize = purpose === "maskable" ? size * 0.4 : size * 0.52;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0705",
        }}
      >
        <span
          style={{
            fontFamily: "system-ui, sans-serif",
            fontSize: glyphSize,
            fontWeight: 600,
            color: "#fbbf24",
          }}
        >
          B
        </span>
      </div>
    ),
    { width: size, height: size },
  );
}
