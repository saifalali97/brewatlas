import { ImageResponse } from "next/og";

/**
 * Generates the 180x180 PNG Apple touch icon (PWA requirement 2) --
 * iOS prefers a real PNG over the SVG `icon.svg` used for the browser
 * tab favicon. Same brand mark as `public/icon.svg` (dark background,
 * amber "B"), rendered full-bleed since iOS applies its own corner
 * rounding/mask on top.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
            fontSize: 96,
            fontWeight: 600,
            color: "#fbbf24",
          }}
        >
          B
        </span>
      </div>
    ),
    { ...size },
  );
}
