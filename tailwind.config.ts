import type { Config } from "tailwindcss";

/**
 * Agla Kadam design system.
 * Calm, trustworthy civic-tech. One primary accent (indigo/blue),
 * neutral status colours. Status is NEVER communicated by colour alone
 * in the UI — every status also carries an icon + text label.
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1a1c22",
          soft: "#3a3f4b",
          faint: "#6b7280",
        },
        surface: {
          DEFAULT: "#ffffff",
          soft: "#f7f8fa",
          sunken: "#eef1f5",
        },
        accent: {
          DEFAULT: "#2f5fe0",
          hover: "#254bc0",
          soft: "#e7edfd",
        },
        // Neutral, accessible status hues. Paired ALWAYS with icon + label.
        status: {
          ok: "#1f8a4c",
          okSoft: "#e6f4ec",
          partial: "#b26a00",
          partialSoft: "#fdefdc",
          missing: "#c0392b",
          missingSoft: "#fbe9e7",
          unclear: "#5b6472",
          unclearSoft: "#eceef2",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Arial",
          "sans-serif",
        ],
      },
      fontSize: {
        // Body min 16px per accessibility requirement.
        base: ["1rem", { lineHeight: "1.6" }],
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,0.04), 0 4px 16px rgba(16,24,40,0.06)",
      },
      maxWidth: {
        content: "44rem",
      },
    },
  },
  plugins: [],
};

export default config;
